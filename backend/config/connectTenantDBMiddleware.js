const { connectCollegeDB } = require('./db');
const Tenant = require('../Model/authentication/tenantMd');

// Simple in-memory cache for tenant data to reduce DB lookups.
const tenantCache = new Map();

const connectTenantDBMiddleware = async (req, res, next) => {
  const { instituteCode } = req.body;

  if (!instituteCode) {
    return res.status(400).send('Institute code is required.');
  }

  try {
    let tenant;
    const cacheKey = `code:${instituteCode.toUpperCase()}`;

    if (tenantCache.has(cacheKey)) {
      tenant = tenantCache.get(cacheKey);
    } else {
      tenant = await Tenant.findOne({ instituteCode: instituteCode.toUpperCase() }).lean();
      if (tenant) {
        tenantCache.set(cacheKey, tenant);
      }
    }

    if (!tenant) {
      return res.status(404).send(`No configuration found for institute code '${instituteCode}'.`);
    }

    req.collegeDB = await connectCollegeDB(tenant.dbName, tenant.clusterURI);
    req.instituteCode = tenant.instituteCode;

    next();
  } catch (error) {
    console.error('Error connecting to tenant database:', error);
    return res.status(500).send('Error connecting to database.');
  }
};

module.exports = connectTenantDBMiddleware;
