const { getPresignedUploadUrl } = require('../../Utilities/s3Utils');

/**
 * Generate S3 pre-signed upload URL
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.generatePresignedUrl = async (req, res) => {
  try {
    console.log('S3 Presign request from user:', req.user.memberId);
    console.log('Environment variables:');
    console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'NOT SET');
    console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET');
    console.log('AWS_REGION:', process.env.AWS_REGION);
    console.log('AWS_S3_BUCKET:', process.env.AWS_S3_BUCKET);
    
    const { fileName, mimeType, purpose = 'profile-pic' } = req.body;
    
    // Validate required fields
    if (!fileName || !mimeType) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'fileName and mimeType are required'
      });
    }
    
    // Determine allowed file types and key prefix based on purpose
    let allowedMimeTypes = [];
    let keyPrefix = '';
    let compressionInfo = '';
    let formatNote = '';
    
    if (purpose === 'profile-pic' || purpose === 'dp' || purpose === 'avatar') {
      allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      keyPrefix = 'profile-pics/';
      compressionInfo = 'Very High Compression (30% quality) - Converted to JPEG for optimal compression';
      formatNote = 'PNG files are automatically converted to JPEG for compression';
    } else if (purpose === 'document' || purpose === 'certificate' || purpose === 'id-card') {
      allowedMimeTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
      keyPrefix = 'documents/';
      compressionInfo = 'High Compression (50% quality) - Converted to JPEG for good readability';
      formatNote = 'PNG files are converted to JPEG for compression';
    } else if (purpose === 'gallery' || purpose === 'photo') {
      allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      keyPrefix = 'gallery/';
      compressionInfo = 'Medium Compression (60% quality) - Converted to JPEG for balanced quality';
      formatNote = 'PNG files are converted to JPEG for compression';
    } else if (purpose === 'thumbnail' || purpose === 'preview') {
      allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      keyPrefix = 'thumbnails/';
      compressionInfo = 'High Compression (40% quality) - Converted to JPEG for fast previews';
      formatNote = 'PNG files are converted to JPEG for compression';
    } else {
      // Default: allow only jpeg/jpg/png
      allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      keyPrefix = 'general/';
      compressionInfo = 'Standard Compression (50% quality) - Converted to JPEG for universal compatibility';
      formatNote = 'PNG files are converted to JPEG for compression';
    }
    
    console.log(`File purpose: ${purpose}`);
    console.log(`Compression: ${compressionInfo}`);
    console.log(`Format note: ${formatNote}`);
    console.log(`S3 key prefix: ${keyPrefix}`);
    console.log(`File: ${fileName} (${mimeType})`);
    
    const bucket = process.env.AWS_S3_BUCKET;
    if (!bucket) {
      return res.status(500).json({ 
        error: 'S3 bucket not configured',
        message: 'Please contact administrator'
      });
    }
    
    const { url, key } = await getPresignedUploadUrl({
      bucket,
      keyPrefix,
      allowedMimeTypes,
      fileName,
      mimeType,
      expires: 120, // 2 minutes
      dbName: req.collegeDB.name, // Include database name in S3 path
    });
    
    // Success response with user context and compression info
    res.json({ 
      url, 
      key, 
      message: 'success',
      purpose,
      compressionInfo,
      formatNote,
      mimeType,
      fileName,
      user: {
        memberId: req.user.memberId,
        instituteId: req.user.instituteId
      }
    });
    
  } catch (err) {
    console.error('S3 Presign error:', err);
    res.status(400).json({ 
      error: err.message,
      message: 'Failed to generate upload URL'
    });
  }
};
