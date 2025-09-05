const request = require('supertest');
const mongoose = require('mongoose');

/**
 * Test helper utilities for common testing operations
 */
class TestHelpers {
  /**
   * Create a test app instance
   * @param {Object} app - Express app instance
   * @returns {Object} - Supertest agent
   */
  static createTestApp(app) {
    return request(app);
  }

  /**
   * Generate authentication token for testing
   * @param {Object} user - User object
   * @returns {string} - JWT token
   */
  static generateAuthToken(user) {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { 
        userId: user._id || user.id,
        email: user.email,
        role: user.role || 'user'
      },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  }

  /**
   * Create authenticated request headers
   * @param {string} token - JWT token
   * @returns {Object} - Headers object
   */
  static createAuthHeaders(token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Wait for database connection
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise} - Promise that resolves when connected
   */
  static async waitForDatabase(timeout = 10000) {
    const start = Date.now();
    while (mongoose.connection.readyState !== 1) {
      if (Date.now() - start > timeout) {
        throw new Error('Database connection timeout');
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * Clean up database collections
   * @param {Array} collections - Array of collection names to clean
   */
  static async cleanupDatabase(collections = []) {
    if (mongoose.connection.readyState === 1) {
      for (const collection of collections) {
        await mongoose.connection.db.collection(collection).deleteMany({});
      }
    }
  }

  /**
   * Create test data in database
   * @param {Object} model - Mongoose model
   * @param {Object} data - Data to create
   * @returns {Object} - Created document
   */
  static async createTestData(model, data) {
    return await model.create(data);
  }

  /**
   * Generate random string
   * @param {number} length - Length of string
   * @returns {string} - Random string
   */
  static generateRandomString(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate random email
   * @returns {string} - Random email
   */
  static generateRandomEmail() {
    return `test${Date.now()}@example.com`;
  }

  /**
   * Generate random phone number
   * @returns {string} - Random phone number
   */
  static generateRandomPhone() {
    return `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`;
  }

  /**
   * Assert response structure
   * @param {Object} response - Supertest response
   * @param {number} expectedStatus - Expected status code
   * @param {Object} expectedFields - Expected fields in response
   */
  static assertResponse(response, expectedStatus, expectedFields = {}) {
    expect(response.status).toBe(expectedStatus);
    
    if (expectedFields.body) {
      expect(response.body).toMatchObject(expectedFields.body);
    }
    
    if (expectedFields.headers) {
      Object.keys(expectedFields.headers).forEach(header => {
        expect(response.headers[header]).toBe(expectedFields.headers[header]);
      });
    }
  }

  /**
   * Assert error response
   * @param {Object} response - Supertest response
   * @param {number} expectedStatus - Expected status code
   * @param {string} expectedMessage - Expected error message
   */
  static assertErrorResponse(response, expectedStatus, expectedMessage = null) {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('error');
    
    if (expectedMessage) {
      expect(response.body.error).toContain(expectedMessage);
    }
  }

  /**
   * Assert success response
   * @param {Object} response - Supertest response
   * @param {number} expectedStatus - Expected status code
   * @param {Object} expectedData - Expected data structure
   */
  static assertSuccessResponse(response, expectedStatus = 200, expectedData = {}) {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('success', true);
    
    if (Object.keys(expectedData).length > 0) {
      expect(response.body).toMatchObject(expectedData);
    }
  }

  /**
   * Mock external services
   */
  static mockExternalServices() {
    // Mock AWS S3
    jest.mock('@aws-sdk/client-s3', () => ({
      S3Client: jest.fn(() => ({
        send: jest.fn()
      })),
      PutObjectCommand: jest.fn(),
      GetObjectCommand: jest.fn(),
      DeleteObjectCommand: jest.fn()
    }));

    // Mock SendGrid
    jest.mock('@sendgrid/mail', () => ({
      setApiKey: jest.fn(),
      send: jest.fn().mockResolvedValue([{ statusCode: 202 }])
    }));

    // Mock Twilio
    jest.mock('twilio', () => {
      return jest.fn(() => ({
        messages: {
          create: jest.fn().mockResolvedValue({ sid: 'test-sid' })
        }
      }));
    });
  }
}

module.exports = TestHelpers;
