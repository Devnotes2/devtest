const { connectCollegeDB, connectGlobalDB } = require('./db');

const multiTenantMiddleware = async (req, res, next) => {
  // Extract the college name from the host (e.g., 'college1.svb.local')
  collegeName = req.get('host').split('.')[0];
  if(collegeName=="svb"){
    collegeName = "svb";
  }
  else{
    collegeName = "devtest2";
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
