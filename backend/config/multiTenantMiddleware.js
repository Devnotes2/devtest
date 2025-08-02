const { connectCollegeDB } = require('./db');
const Tenant = require('../Model/authentication/tenantMd');

// Simple in-memory cache for tenant data to reduce DB lookups.
const tenantCache = new Map();

const multiTenantMiddleware = async (req, res, next) => {
  let collegeName;
  let clusterURI;
  const host = req.get('host');
  const { instituteCode } = req.body || {};
  const isLoginRequest = req.path === '/authRt/login' || (req.originalUrl && req.originalUrl.includes('/authRt/login'));
  try {
    let tenant;
    let cacheKey;

    // For login requests, if an instituteCode is provided, use it to find the tenant.
    // This handles mobile-style logins.
    if (isLoginRequest && instituteCode) {

      cacheKey = `code:${instituteCode.toUpperCase()}`;

      if (tenantCache.has(cacheKey)) {
        tenant = tenantCache.get(cacheKey);
      } else {
        tenant = await Tenant.findOne({ instituteCode: instituteCode.toUpperCase() }).lean();
        if (tenant) {
          tenantCache.set(cacheKey, tenant);
        }
      }

      if (!tenant || tenant===null) {
        return res.status(404).send(`No Results found for institute code '${instituteCode}'.`);
      }
      collegeName = tenant.dbName;
      clusterURI = tenant.clusterURI;
      req.instituteCode = tenant.instituteCode; // Attach instituteCode to the request

    } else {
      // --- Web/Subdomain-based Flow ---
      const tenantIdentifier = host ? host.split('.')[0] : req.headers['x-college-name'];

      if (!tenantIdentifier) {
        return res.status(400).send('Could not determine tenant. Missing host or x-college-name header.');
      }

      cacheKey = `db:${tenantIdentifier}`;
      if (tenantCache.has(cacheKey)) {
        tenant = tenantCache.get(cacheKey);
      } else {
        // Find tenant by dbName (which is what the subdomain or header represents)
        tenant = await Tenant.findOne({ dbName: tenantIdentifier }).lean();
        if (tenant) {
          tenantCache.set(cacheKey, tenant);
        }
      }

      if (!tenant) {
        return res.status(404).send(`No tenant configuration found for '${tenantIdentifier}'.`);
      }
      collegeName = tenant.dbName;
      clusterURI = tenant.clusterURI;
      req.instituteCode = tenant.instituteCode; // Attach instituteCode to the request
    }
    // Establish or reuse a connection to the college's specific database
    req.collegeDB = await connectCollegeDB(collegeName, clusterURI);
    next(); // Continue to the next middleware or route handler
  } catch (error) {
    console.error(`Middleware error for college: ${collegeName || 'unknown'}.`, error);
    if (error.message.includes('does not exist or is empty') || error.message.includes('not found')) {
      return res.status(404).send(error.message);
    }
    return res.status(500).send(`Error connecting to database: ${error.message}`);
  }
};

module.exports = multiTenantMiddleware;
