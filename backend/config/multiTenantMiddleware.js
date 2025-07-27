const { connectCollegeDB, connectGlobalDB } = require('./db');

const multiTenantMiddleware = async (req, res, next) => {
  // Skip collegeDB connection for login requests (authDB is always used)
  if (req.path === '/authRt/login' || (req.originalUrl && req.originalUrl.includes('/authRt/login'))) {
    return next();
  }
  // Extract the college name from the host (e.g., 'college1.svb.local')
  let collegeName;
  const host = req.get('host');
  if (host) {
    collegeName = host.split('.')[0];
    // If host is localhost or not a subdomain, allow override via header or default
    if (collegeName === 'localhost' || collegeName === '127' || !collegeName || collegeName === 'svb') {
      collegeName = req.headers['x-college-name'] || 'devtest2';
    }
  } else {
    collegeName = req.headers['x-college-name'] || 'devtest2';
  }

  try {
    // Establish or reuse a connection to the college's specific database
    req.collegeDB = await connectCollegeDB(collegeName);

    // Establish or reuse a connection to the global database
    // req.globalDB = await connectGlobalDB();

    next(); // Continue to the next middleware or route handler
  } catch (error) {
    console.error(`Failed to connect to the database for college: ${collegeName}`, error);

    if (error.message.includes('does not exist or is empty')) {
      return res.status(404).send(`Database for college '${collegeName}' not found`);
    }
    return res.status(500).send(`Error connecting to database: ${error.message}`);
  }
};

module.exports = multiTenantMiddleware;
