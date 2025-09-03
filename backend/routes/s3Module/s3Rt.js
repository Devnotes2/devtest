const express = require('express');
const router = express.Router();
const s3Ct = require('../../Controller/s3Module/s3Ct');
const authMiddleware = require('../../Utilities/authUtils');
const { connectCollegeDB } = require('../../config/db');
const Tenant = require('../../Model/authentication/tenantMd');

// Custom authentication middleware that supports both cookies and headers
const flexibleAuthMiddleware = async (req, res, next) => {
  try {
    let token = null;
    
    // Check for token in cookies (web requests)
    if (req.cookies && req.cookies.authToken) {
      token = req.cookies.authToken;
    }
    // Check for token in Authorization header (mobile requests)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
    }
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.',
        message: 'Please provide authentication token in cookies or Authorization header'
      });
    }
    
    // Verify JWT token
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // Connect to the college database using institute code from JWT
    try {
      const tenant = await Tenant.findOne({ instituteCode: decoded.instituteCode }).lean();
      if (!tenant) {
        return res.status(404).json({ 
          error: 'Tenant not found',
          message: `No configuration found for institute code '${decoded.instituteCode}'`
        });
      }
      
      req.collegeDB = await connectCollegeDB(tenant.dbName, tenant.clusterURI);
      req.instituteCode = tenant.instituteCode;
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return res.status(500).json({ 
        error: 'Database connection failed',
        message: 'Failed to connect to college database'
      });
    }
    
    // For mobile requests, always send a fresh token back
    if (req.headers.authorization) {
      // Generate new token with same payload but extended expiry
      const newPayload = {
        id: decoded.id,
        memberId: decoded.memberId,
        instituteId: decoded.instituteId,
        dbName: decoded.dbName,
        instituteCode: decoded.instituteCode,
      };
      const newToken = jwt.sign(newPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
      
      // Set response header for mobile to extract
      res.set('X-Auth-Token', newToken);
    }
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Access denied. Token has expired.',
        message: 'Please login again'
      });
    }
    return res.status(400).json({ 
      error: 'Invalid token.',
      message: 'Authentication failed'
    });
  }
};

// Apply authentication to all S3 routes
router.use(flexibleAuthMiddleware);

/**
 * POST /s3/presign
 * Body: { fileName, mimeType, purpose }
 * Headers: Authorization: Bearer <token> (mobile) or Cookie: authToken (web)
 * Returns: { url, key, message: 'success' }
 */
router.post('/presign', s3Ct.generatePresignedUrl);

module.exports = router;
