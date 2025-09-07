const express = require('express');
const router = express.Router();
const s3Ct = require('../../Controller/s3Module/s3Ct');
const authMiddleware = require('../../Utilities/authUtils');
const { connectCollegeDB } = require('../../config/db');
const Tenant = require('../../Model/authentication/tenantMd');

/**
 * @swagger
 * components:
 *   schemas:
 *     # ============================================================================
 *     # FILE UPLOAD SCHEMAS
 *     # ============================================================================
 *     PresignRequest:
 *       type: object
 *       required:
 *         - fileName
 *         - mimeType
 *         - purpose
 *       properties:
 *         fileName:
 *           type: string
 *           description: Name of the file to upload

 *         mimeType:
 *           type: string
 *           description: MIME type of the file

 *         purpose:
 *           type: string
 *           enum: [profile, document, assignment, syllabus, other]
 *           description: Purpose of the file upload

 *         folder:
 *           type: string
 *           description: Optional folder path in S3
 *     PresignResponse:
 *       type: object
 *       properties:
 *         url:
 *           type: string
 *           format: uri
 *           description: Presigned URL for file upload

 *         key:
 *           type: string
 *           description: S3 object key

 *         message:
 *           type: string
 *           description: Success message

 *         expiresIn:
 *           type: integer
 *           description: URL expiration time in seconds
 *     FileUploadInfo:
 *       type: object
 *       properties:
 *         fileName:
 *           type: string
 *           description: Original file name
 *         fileSize:
 *           type: number
 *           description: File size in bytes
 *         mimeType:
 *           type: string
 *           description: File MIME type
 *         purpose:
 *           type: string
 *           description: Upload purpose
 *         folder:
 *           type: string
 *           description: S3 folder path
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *         data:
 *           type: object
 *           description: Response data
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error type
 *         message:
 *           type: string
 *           description: Error message
 *         status:
 *           type: string
 *           description: Error status
 */

/**
 * @swagger
 * tags:
 *   name: File Upload
 *   description: S3 file upload and management endpoints
 */

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
 * @swagger
 * /s3/presign:
 *   post:
 *     summary: Generate presigned URL for file upload
 *     tags: [File Upload]
 *     description: Generate a presigned S3 URL for secure file uploads. Supports both web (cookies) and mobile (Bearer token) authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PresignRequest'

 *             mimeType: "image/jpeg"
 *             purpose: "profile"
 *             folder: "users/profiles"
 *     responses:
 *       200:
 *         description: Presigned URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PresignResponse'

 *               key: "users/profiles/profile_image.jpg"
 *               message: "success"
 *               expiresIn: 3600
 *         headers:
 *           X-Auth-Token:
 *             description: New authentication token for mobile requests
 *             schema:
 *               type: string
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'

 *               message: "fileName, mimeType, and purpose are required"
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               noToken:
 *                 summary: No token provided
 *                 value:
 *                   error: "Access denied. No token provided."
 *                   message: "Please provide authentication token in cookies or Authorization header"
 *               expiredToken:
 *                 summary: Token expired
 *                 value:
 *                   error: "Access denied. Token has expired."
 *                   message: "Please login again"
 *               invalidToken:
 *                 summary: Invalid token
 *                 value:
 *                   error: "Invalid token."
 *                   message: "Authentication failed"
 *       404:
 *         description: Tenant not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'

 *               message: "No configuration found for institute code 'ABC001'"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               databaseError:
 *                 summary: Database connection failed
 *                 value:
 *                   error: "Database connection failed"
 *                   message: "Failed to connect to college database"
 *               generalError:
 *                 summary: General server error
 *                 value:
 *                   error: "Internal Server Error"
 *                   message: "Something went wrong on the server"
 */

/**
 * POST /s3/presign
 * Body: { fileName, mimeType, purpose }
 * Headers: Authorization: Bearer <token> (mobile) or Cookie: authToken (web)
 * Returns: { url, key, message: 'success' }
 */
router.post('/presign', s3Ct.generatePresignedUrl);

module.exports = router;
