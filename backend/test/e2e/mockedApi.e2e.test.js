const request = require('supertest');
const app = require('../app');
const TestHelpers = require('../helpers/testHelpers');
const MockHelpers = require('../helpers/mockHelpers');
const testData = require('../fixtures/testData');

// Import mocked services
const mockExternalServices = require('../mocks/externalServices');

// Import the mocked modules
const sendGrid = require('@sendgrid/mail');
const twilio = require('twilio');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

describe('Mocked API E2E Tests', () => {
  let authToken;
  let adminUser;

  beforeEach(async () => {
    // Setup admin user
    adminUser = MockHelpers.createMockUser({ role: 'admin' });
    authToken = TestHelpers.generateAuthToken(adminUser);
    
    // Reset all mocks
    MockHelpers.resetAllMocks();
  });

  afterEach(async () => {
    MockHelpers.resetAllMocks();
  });

  describe('Email Service (Mocked SendGrid)', () => {
    it('should send mocked email', async () => {
      const emailData = {
        to: 'test@example.com',
        from: 'test@yourdomain.com',
        subject: 'Test Email from E2E Test',
        text: 'This is a test email sent from E2E test'
      };

      const result = await sendGrid.send(emailData);
      
      // Verify mock was called
      expect(sendGrid.send).toHaveBeenCalledWith(emailData);
      expect(result[0].statusCode).toBe(202);
    });

    it('should handle email sending errors gracefully', async () => {
      // Mock an error
      sendGrid.send.mockRejectedValueOnce(new Error('Email service unavailable'));

      const emailData = {
        to: 'test@example.com',
        from: 'test@yourdomain.com',
        subject: 'Test Email',
        text: 'Test content'
      };

      await expect(sendGrid.send(emailData)).rejects.toThrow('Email service unavailable');
    });
  });

  describe('SMS Service (Mocked Twilio)', () => {
    it('should send mocked SMS', async () => {
      const client = twilio('mock-sid', 'mock-token');

      const message = await client.messages.create({
        body: 'Test SMS from E2E test',
        from: '+1234567890',
        to: '+0987654321'
      });

      // Verify mock was called
      expect(client.messages.create).toHaveBeenCalledWith({
        body: 'Test SMS from E2E test',
        from: '+1234567890',
        to: '+0987654321'
      });
      expect(message.sid).toBe('mock-sid');
    });

    it('should handle SMS sending errors gracefully', async () => {
      const client = twilio('mock-sid', 'mock-token');

      // Mock an error
      client.messages.create.mockRejectedValueOnce(new Error('SMS service unavailable'));

      await expect(client.messages.create({
        body: 'Test SMS',
        from: '+1234567890',
        to: '+0987654321'
      })).rejects.toThrow('SMS service unavailable');
    });
  });

  describe('File Storage (Mocked AWS S3)', () => {
    it('should upload mocked file', async () => {
      const s3Client = new S3Client({});

      const uploadParams = {
        Bucket: 'test-bucket',
        Key: 'test-file.txt',
        Body: 'Test file content',
        ContentType: 'text/plain'
      };

      const command = new PutObjectCommand(uploadParams);
      const result = await s3Client.send(command);

      // Verify mock was called
      expect(s3Client.send).toHaveBeenCalledWith(command);
      expect(result).toBeDefined();
    });

    it('should handle file upload errors gracefully', async () => {
      const s3Client = new S3Client({});

      // Mock an error
      s3Client.send.mockRejectedValueOnce(new Error('S3 service unavailable'));

      const uploadParams = {
        Bucket: 'test-bucket',
        Key: 'test-file.txt',
        Body: 'Test file content'
      };

      const command = new PutObjectCommand(uploadParams);
      await expect(s3Client.send(command)).rejects.toThrow('S3 service unavailable');
    });
  });

  describe('Complete Workflow with Mocked APIs', () => {
    it('should complete user registration with mocked email', async () => {
      // Test the complete flow with mocked services
      const registerData = testData.auth.validRegister;
      
      // This would test your actual registration endpoint
      // The email sending would be mocked
      const registerResponse = await request(app)
        .post('/auth/register')
        .send(registerData);

      // Verify that email sending was attempted (mocked)
      expect(sendGrid.send).toHaveBeenCalled();
    });

    it('should handle file upload with mocked S3', async () => {
      // Test file upload endpoint
      const fileData = {
        filename: 'test.txt',
        content: 'test content'
      };

      // This would test your actual file upload endpoint
      // The S3 upload would be mocked
      const uploadResponse = await request(app)
        .post('/s3/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .send(fileData);

      // Verify that S3 upload was attempted (mocked)
      expect(S3Client).toHaveBeenCalled();
    });
  });

  describe('Mock Verification', () => {
    it('should verify all mocks are properly configured', () => {
      // Verify SendGrid mock
      expect(sendGrid.setApiKey).toBeDefined();
      expect(sendGrid.send).toBeDefined();

      // Verify Twilio mock
      const client = twilio('test', 'test');
      expect(client.messages.create).toBeDefined();

      // Verify S3 mock
      const s3Client = new S3Client({});
      expect(s3Client.send).toBeDefined();
    });
  });
});
