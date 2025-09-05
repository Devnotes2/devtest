/**
 * Mock helper utilities for testing
 */
class MockHelpers {
  /**
   * Create mock request object
   * @param {Object} options - Request options
   * @returns {Object} - Mock request object
   */
  static createMockRequest(options = {}) {
    return {
      body: options.body || {},
      params: options.params || {},
      query: options.query || {},
      headers: options.headers || {},
      user: options.user || null,
      tenantId: options.tenantId || null,
      ...options
    };
  }

  /**
   * Create mock response object
   * @param {Object} options - Response options
   * @returns {Object} - Mock response object
   */
  static createMockResponse(options = {}) {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
      redirect: jest.fn().mockReturnThis(),
      ...options
    };
    return res;
  }

  /**
   * Create mock next function
   * @returns {Function} - Mock next function
   */
  static createMockNext() {
    return jest.fn();
  }

  /**
   * Create mock user object
   * @param {Object} overrides - User property overrides
   * @returns {Object} - Mock user object
   */
  static createMockUser(overrides = {}) {
    return {
      _id: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      phone: '+1234567890',
      role: 'user',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  }

  /**
   * Create mock institute object
   * @param {Object} overrides - Institute property overrides
   * @returns {Object} - Mock institute object
   */
  static createMockInstitute(overrides = {}) {
    return {
      _id: '507f1f77bcf86cd799439012',
      name: 'Test Institute',
      address: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      country: 'Test Country',
      pincode: '12345',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  }

  /**
   * Create mock department object
   * @param {Object} overrides - Department property overrides
   * @returns {Object} - Mock department object
   */
  static createMockDepartment(overrides = {}) {
    return {
      _id: '507f1f77bcf86cd799439013',
      name: 'Test Department',
      description: 'Test Department Description',
      instituteId: '507f1f77bcf86cd799439012',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  }

  /**
   * Create mock grade object
   * @param {Object} overrides - Grade property overrides
   * @returns {Object} - Mock grade object
   */
  static createMockGrade(overrides = {}) {
    return {
      _id: '507f1f77bcf86cd799439014',
      name: 'Grade 10',
      description: 'Test Grade Description',
      instituteId: '507f1f77bcf86cd799439012',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  }

  /**
   * Create mock subject object
   * @param {Object} overrides - Subject property overrides
   * @returns {Object} - Mock subject object
   */
  static createMockSubject(overrides = {}) {
    return {
      _id: '507f1f77bcf86cd799439015',
      name: 'Test Subject',
      code: 'SUB001',
      description: 'Test Subject Description',
      instituteId: '507f1f77bcf86cd799439012',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  }

  /**
   * Create mock enrollment object
   * @param {Object} overrides - Enrollment property overrides
   * @returns {Object} - Mock enrollment object
   */
  static createMockEnrollment(overrides = {}) {
    return {
      _id: '507f1f77bcf86cd799439016',
      studentId: 'STU001',
      academicYear: new Date().getFullYear(),
      grade: 'Grade 10',
      section: 'A',
      instituteId: '507f1f77bcf86cd799439012',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  }

  /**
   * Create mock JWT payload
   * @param {Object} overrides - JWT payload overrides
   * @returns {Object} - Mock JWT payload
   */
  static createMockJWTPayload(overrides = {}) {
    return {
      userId: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      role: 'user',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      ...overrides
    };
  }

  /**
   * Create mock error object
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @returns {Object} - Mock error object
   */
  static createMockError(message = 'Test error', statusCode = 500) {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.status = statusCode;
    return error;
  }

  /**
   * Create mock file upload object
   * @param {Object} overrides - File property overrides
   * @returns {Object} - Mock file object
   */
  static createMockFile(overrides = {}) {
    return {
      fieldname: 'file',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024,
      buffer: Buffer.from('test file content'),
      ...overrides
    };
  }

  /**
   * Create mock AWS S3 response
   * @param {Object} overrides - S3 response overrides
   * @returns {Object} - Mock S3 response
   */
  static createMockS3Response(overrides = {}) {
    return {
      ETag: '"test-etag"',
      Location: 'https://test-bucket.s3.amazonaws.com/test-key',
      key: 'test-key',
      Bucket: 'test-bucket',
      ...overrides
    };
  }

  /**
   * Create mock email service response
   * @param {Object} overrides - Email response overrides
   * @returns {Object} - Mock email response
   */
  static createMockEmailResponse(overrides = {}) {
    return {
      statusCode: 202,
      body: '',
      headers: {},
      ...overrides
    };
  }

  /**
   * Create mock SMS service response
   * @param {Object} overrides - SMS response overrides
   * @returns {Object} - Mock SMS response
   */
  static createMockSMSResponse(overrides = {}) {
    return {
      sid: 'test-sid',
      status: 'sent',
      ...overrides
    };
  }

  /**
   * Reset all mocks
   */
  static resetAllMocks() {
    jest.clearAllMocks();
    jest.resetAllMocks();
  }

  /**
   * Mock console methods
   */
  static mockConsole() {
    global.console = {
      ...console,
      log: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
  }

  /**
   * Restore console methods
   */
  static restoreConsole() {
    global.console = console;
  }
}

module.exports = MockHelpers;
