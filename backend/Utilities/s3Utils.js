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
 * Generate a pre-signed S3 upload URL
 * @param {Object} options
 * @param {string} options.bucket - S3 bucket name
 * @param {string} options.keyPrefix - Prefix for the S3 object key (e.g., 'profile-pics/')
 * @param {string[]} options.allowedMimeTypes - Array of allowed MIME types
 * @param {string} options.fileName - Original file name (for extension)
 * @param {string} options.mimeType - MIME type of the file
 * @param {number} [options.expires=60] - URL expiry in seconds
 * @param {string} [options.dbName] - Database name to include in the path
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
}) {
  if (!allowedMimeTypes.includes(mimeType)) {
    throw new Error('File type not allowed');
  }
  
  console.log("Generating presigned URL for:", fileName, "with type:", mimeType, "for DB:", dbName);
  
  const ext = fileName.split('.').pop();
  
  // Include database name in the path if provided
  const dbPrefix = dbName ? `${dbName}/` : '';
  const key = `${dbPrefix}${keyPrefix}${uuidv4()}.${ext}`;
  
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

async function deleteS3Object(bucket, key) {
  const params = {
    Bucket: bucket,
    Key: key,
  };

  try {
    await s3.send(new DeleteObjectCommand(params));
    console.log(`Successfully deleted object with key: ${key}`);
  } catch (error) {
    console.error(`Error deleting object with key: ${key}`, error);
    throw new Error(`Failed to delete S3 object: ${error.message}`);
  }
}

module.exports = { getPresignedUploadUrl, deleteS3Object };
