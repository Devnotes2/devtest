const { connectCollegeDB } = require('./db');
const Tenant = require('../Model/authentication/tenantMd');
const jwt = require('jsonwebtoken');

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
      // --- Check for JWT token first (for authenticated requests) ---
      let tokenInstituteCode = null;
      
      // Try to get token from Authorization header or cookies
      let token = null;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.substring(7);
      } else if (req.cookies && req.cookies.authToken) {
        token = req.cookies.authToken;
      }
      
      // If we have a token, try to extract instituteCode from it
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          tokenInstituteCode = decoded.dbName;
          console.log('Extracted instituteCode from token:', tokenInstituteCode);
        } catch (jwtError) {
          console.log('JWT verification failed, falling back to host-based logic');
        }
      }
      
      // --- Web/Subdomain-based Flow (fallback) ---
      const tenantIdentifier = tokenInstituteCode || (host ? host.split('.')[0] : req.headers['x-college-name']);

      if (!tenantIdentifier) {
        return res.status(400).send('Could not determine tenant. Missing host, x-college-name header, or valid JWT token.');
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
