/**
 * Real API Configuration for E2E Testing
 * Use this when you want to test with real external services
 */

// Real API Keys (use environment variables)
const realApiConfig = {
  // SendGrid Configuration
  sendGrid: {
    apiKey: process.env.SENDGRID_API_KEY || 'your-real-sendgrid-api-key',
    fromEmail: process.env.SENDGRID_FROM_EMAIL || 'test@yourdomain.com'
  },

  // Twilio Configuration
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || 'your-real-twilio-sid',
    authToken: process.env.TWILIO_AUTH_TOKEN || 'your-real-twilio-token',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '+1234567890'
  },

  // AWS S3 Configuration
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'your-real-aws-access-key',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'your-real-aws-secret-key',
    region: process.env.AWS_REGION || 'us-east-1',
    bucketName: process.env.AWS_S3_BUCKET_NAME || 'your-real-bucket-name'
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-real-jwt-secret-key',
    expiresIn: '24h'
  }
};

module.exports = realApiConfig;
