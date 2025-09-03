const {
  getSignedUrl,
} = require('@aws-sdk/s3-request-presigner');

const {
  PutObjectCommand,
  DeleteObjectCommand,
  S3,
} = require('@aws-sdk/client-s3');

const { v4: uuidv4 } = require('uuid');

// Configure AWS SDK (credentials/region should be set in environment variables)
const s3 = new S3({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION,
});

/**
 * Parse member information from filename
 * @param {string} fileName - Filename to parse
 * @returns {Object} Parsed member information
 */
function parseMemberInfoFromFilename(fileName) {
  try {
    // Expected format: profile_12345_INST001_1703123456789.jpg
    const parts = fileName.replace(/\.[^/.]+$/, '').split('_');
    
    if (parts.length >= 4 && parts[0] === 'profile') {
      return {
        type: parts[0],
        memberId: parts[1],
        instituteCode: parts[2],
        timestamp: parseInt(parts[3]),
        uploadDate: new Date(parseInt(parts[3])).toISOString(),
        isValid: true
      };
    }
    
    return { isValid: false, error: 'Invalid filename format' };
  } catch (error) {
    return { isValid: false, error: error.message };
  }
}

/**
 * Generate a descriptive filename for profile pictures
 * @param {string} memberId - Member ID
 * @param {string} instituteCode - Institute code
 * @param {string} extension - File extension
 * @returns {string} Descriptive filename
 */
function generateProfileFilename(memberId, instituteCode, extension) {
  const timestamp = Date.now();
  return `profile_${memberId}_${instituteCode}_${timestamp}.${extension}`;
}

/**
 * Delete an object from S3
 * @param {string} bucket - S3 bucket name
 * @param {string} key - S3 object key
 * @returns {Promise<boolean>}
 */
async function deleteS3Object(bucket, key) {
  try {
    const params = {
      Bucket: bucket,
      Key: key,
    };
    
    await s3.send(new DeleteObjectCommand(params));
    console.log("Successfully deleted S3 object:", key);
    return true;
  } catch (error) {
    console.error("Error deleting S3 object:", error);
    return false;
  }
}

/**
 * Generate a pre-signed S3 upload URL
 * @param {Object} options
 * @param {string} options.bucket - S3 bucket name
 * @param {string} options.keyPrefix - Prefix for the S3 object key (e.g., 'profile-pics/')
 * @param {string[]} options.allowedMimeTypes - Array of allowed MIME types
 * @param {string} options.fileName - Original file name (for extension)
 * @param {string} options.mimeType - MIME type of the file
 * @param {number} [options.expires=60] - URL expiry in seconds
 * @param {string} [options.dbName] - Database name to include in the path
 * @param {string} [options.purpose] - Purpose of the upload (e.g., 'profile-pic')
 * @returns {Promise<{url: string, key: string}>}
 */
async function getPresignedUploadUrl({
  bucket,
  keyPrefix = '',
  allowedMimeTypes = [],
  fileName,
  mimeType,
  expires = 60,
  dbName = '',
  purpose = 'general',
}) {
  if (!allowedMimeTypes.includes(mimeType)) {
    throw new Error('File type not allowed');
  }
  
  console.log("Generating presigned URL for:", fileName, "with type:", mimeType, "for DB:", dbName, "purpose:", purpose);
  
  const ext = fileName.split('.').pop();
  
  // Include database name in the path if provided
  const dbPrefix = dbName ? `${dbName}/` : '';
  
  // For profile pictures, use the provided filename to enable file replacement
  // For other purposes, use UUID to avoid conflicts
  let key;
  if (purpose === 'profile-pic' || purpose === 'dp' || purpose === 'avatar') {
    // Use the filename directly for profile pictures to enable replacement
    key = `${dbPrefix}${keyPrefix}${fileName}`;
    console.log("Using provided filename for profile picture replacement:", key);
    
    // Parse and log member information from filename
    const memberInfo = parseMemberInfoFromFilename(fileName);
    if (memberInfo.isValid) {
      console.log("Member info from filename:", {
        memberId: memberInfo.memberId,
        instituteCode: memberInfo.instituteCode,
        uploadDate: memberInfo.uploadDate
      });
    } else {
      console.log("Could not parse member info from filename:", memberInfo.error);
    }
  } else {
    // Use UUID for other file types to avoid conflicts
    key = `${dbPrefix}${keyPrefix}${uuidv4()}.${ext}`;
    console.log("Using UUID for unique filename:", key);
  }
  
  const params = {
    Bucket: bucket,
    Key: key,
    ContentType: mimeType,
    ACL: 'public-read', // or 'private' if you want
  };
  
  try {
    const url = await getSignedUrl(s3, new PutObjectCommand(params), {
      expiresIn: expires, // Use the expires parameter passed in
    });
    
    console.log("Successfully generated presigned URL for key:", key);
    return { url, key };
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw new Error(`Failed to generate presigned URL: ${error.message}`);
  }
}

/**
 * Generate a public S3 URL for an object
 * @param {string} bucket - S3 bucket name
 * @param {string} key - S3 object key
 * @param {string} region - AWS region
 * @returns {string} Public S3 URL
 */
function getPublicS3Url(bucket, key, region) {
  if (!bucket || !key || !region) {
    console.warn("Missing bucket, key, or region for getPublicS3Url. Cannot construct URL.");
    return null;
  }
  // S3 public URL format: https://<bucket-name>.s3.<region>.amazonaws.com/<key>
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

module.exports = { 
  getPresignedUploadUrl, 
  deleteS3Object, 
  parseMemberInfoFromFilename,
  generateProfileFilename,
  getPublicS3Url
};
