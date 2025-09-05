/**
 * Mock external services for testing
 */

// Mock AWS S3
const mockS3Client = {
  send: jest.fn()
};

const mockS3Commands = {
  PutObjectCommand: jest.fn(),
  GetObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
  ListObjectsV2Command: jest.fn()
};

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(() => mockS3Client),
  ...mockS3Commands
}));

// Mock AWS S3 Request Presigner
jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://mock-signed-url.com')
}));

// Mock SendGrid
const mockSendGrid = {
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue([{ statusCode: 202 }])
};

jest.mock('@sendgrid/mail', () => mockSendGrid);

// Mock Twilio
const mockTwilio = {
  messages: {
    create: jest.fn().mockResolvedValue({ sid: 'mock-sid' })
  }
};

jest.mock('twilio', () => {
  return jest.fn(() => mockTwilio);
});

// Mock JWT
const mockJWT = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn().mockReturnValue({ userId: 'mock-user-id' }),
  decode: jest.fn().mockReturnValue({ userId: 'mock-user-id' })
};

jest.mock('jsonwebtoken', () => mockJWT);

// Mock bcryptjs
const mockBcrypt = {
  hash: jest.fn().mockResolvedValue('mock-hashed-password'),
  compare: jest.fn().mockResolvedValue(true)
};

jest.mock('bcryptjs', () => mockBcrypt);

// Mock multer
const mockMulter = {
  single: jest.fn().mockReturnValue((req, res, next) => {
    req.file = {
      fieldname: 'file',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024,
      buffer: Buffer.from('test file content')
    };
    next();
  }),
  array: jest.fn().mockReturnValue((req, res, next) => {
    req.files = [{
      fieldname: 'files',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024,
      buffer: Buffer.from('test file content')
    }];
    next();
  })
};

jest.mock('multer', () => mockMulter);

// Mock uuid
const mockUuid = {
  v4: jest.fn().mockReturnValue('mock-uuid-v4')
};

jest.mock('uuid', () => mockUuid);

// Mock axios
const mockAxios = {
  get: jest.fn().mockResolvedValue({ data: {} }),
  post: jest.fn().mockResolvedValue({ data: {} }),
  put: jest.fn().mockResolvedValue({ data: {} }),
  delete: jest.fn().mockResolvedValue({ data: {} })
};

jest.mock('axios', () => mockAxios);

// Export mock objects for use in tests
module.exports = {
  mockS3Client,
  mockS3Commands,
  mockSendGrid,
  mockTwilio,
  mockJWT,
  mockBcrypt,
  mockMulter,
  mockUuid,
  mockAxios
};
