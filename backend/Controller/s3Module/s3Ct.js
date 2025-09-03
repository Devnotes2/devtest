const { getPresignedUploadUrl, parseMemberInfoFromFilename } = require('../../Utilities/s3Utils');

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
    
    // Parse member information from filename for profile pictures
    let memberInfo = null;
    if (purpose === 'profile-pic' || purpose === 'dp' || purpose === 'avatar') {
      memberInfo = parseMemberInfoFromFilename(fileName);
      if (memberInfo.isValid) {
        console.log('Member info parsed from filename:', {
          memberId: memberInfo.memberId,
          instituteCode: memberInfo.instituteCode,
          uploadDate: memberInfo.uploadDate
        });
      }
    }
    
    // Determine allowed file types and key prefix based on purpose
    let allowedMimeTypes = [];
    let keyPrefix = '';
    let compressionInfo = '';
    let formatNote = '';
    let targetFileSize = '';
    
    if (purpose === 'profile-pic' || purpose === 'dp' || purpose === 'avatar') {
      allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      keyPrefix = 'profile-pics/';
      compressionInfo = 'Ultra High Compression (20% quality) - Target ~150KB for fast loading';
      formatNote = 'PNG files are automatically converted to JPEG for compression';
      targetFileSize = '~150KB';
    } else if (purpose === 'document' || purpose === 'certificate' || purpose === 'id-card') {
      allowedMimeTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
      keyPrefix = 'documents/';
      compressionInfo = 'High Compression (40% quality) - Target ~200KB for readability';
      formatNote = 'PNG files are converted to JPEG for compression';
      targetFileSize = '~200KB';
    } else if (purpose === 'gallery' || purpose === 'photo') {
      allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      keyPrefix = 'gallery/';
      compressionInfo = 'Medium Compression (50% quality) - Target ~300KB for good quality';
      formatNote = 'PNG files are converted to JPEG for compression';
      targetFileSize = '~300KB';
    } else if (purpose === 'thumbnail' || purpose === 'preview') {
      allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      keyPrefix = 'thumbnails/';
      compressionInfo = 'High Compression (30% quality) - Target ~100KB for fast previews';
      formatNote = 'PNG files are converted to JPEG for compression';
      targetFileSize = '~100KB';
    } else {
      // Default: allow only jpeg/jpg/png
      allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      keyPrefix = 'general/';
      compressionInfo = 'Standard Compression (40% quality) - Target ~250KB for balance';
      formatNote = 'PNG files are converted to JPEG for compression';
      targetFileSize = '~250KB';
    }
    
    console.log(`File purpose: ${purpose}`);
    console.log(`Compression: ${compressionInfo}`);
    console.log(`Target file size: ${targetFileSize}`);
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
      purpose, // Pass purpose for filename strategy
    });
    
    // Success response with user context and compression info
    const response = { 
      url, 
      key, 
      message: 'success',
      purpose,
      compressionInfo,
      targetFileSize,
      formatNote,
      mimeType,
      fileName,
      user: {
        memberId: req.user.memberId,
        instituteId: req.user.instituteId
      }
    };
    
    // Add member info if available for profile pictures
    if (memberInfo && memberInfo.isValid) {
      response.memberInfo = {
        memberId: memberInfo.memberId,
        instituteCode: memberInfo.instituteCode,
        uploadDate: memberInfo.uploadDate,
        traceable: true
      };
    }
    
    res.json(response);
    
  } catch (err) {
    console.error('S3 Presign error:', err);
    res.status(400).json({ 
      error: err.message,
      message: 'Failed to generate upload URL'
    });
  }
};
