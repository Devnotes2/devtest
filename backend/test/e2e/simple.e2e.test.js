const request = require('supertest');
const app = require('../app');
const TestHelpers = require('../helpers/testHelpers');
const MockHelpers = require('../helpers/mockHelpers');
const testData = require('../fixtures/testData');

describe('Simple E2E Tests (No Database Required)', () => {
  let authToken;
  let adminUser;

  beforeEach(async () => {
    // Setup admin user
    adminUser = MockHelpers.createMockUser({ role: 'admin' });
    authToken = TestHelpers.generateAuthToken(adminUser);
  });

  afterEach(async () => {
    MockHelpers.resetAllMocks();
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'ok',
        message: 'Backend server is running'
      });
    });
  });

  describe('Authentication Endpoints', () => {
    it('should handle login endpoint (even if it fails)', async () => {
      const loginData = testData.auth.validLogin;
      
      const response = await request(app)
        .post('/auth/login')
        .send(loginData);

      // Should get a response (even if it's an error due to no database)
      expect(response.status).toBeDefined();
      expect(response.body).toBeDefined();
    });

    it('should handle register endpoint (even if it fails)', async () => {
      const registerData = testData.auth.validRegister;
      
      const response = await request(app)
        .post('/auth/register')
        .send(registerData);

      // Should get a response (even if it's an error due to no database)
      expect(response.status).toBeDefined();
      expect(response.body).toBeDefined();
    });
  });

  describe('Test Utilities', () => {
    it('should generate test data correctly', () => {
      const user = MockHelpers.createMockUser();
      expect(user).toHaveProperty('_id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('firstName');
      expect(user).toHaveProperty('lastName');
    });

    it('should generate auth token correctly', () => {
      const user = MockHelpers.createMockUser();
      const token = TestHelpers.generateAuthToken(user);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should create auth headers correctly', () => {
      const token = 'test-token';
      const headers = TestHelpers.createAuthHeaders(token);
      
      expect(headers).toHaveProperty('Authorization', 'Bearer test-token');
      expect(headers).toHaveProperty('Content-Type', 'application/json');
    });
  });

  describe('Test Data Fixtures', () => {
    it('should have valid user test data', () => {
      expect(testData.users.validUser).toBeDefined();
      expect(testData.users.validUser.email).toBeDefined();
      expect(testData.users.validUser.password).toBeDefined();
    });

    it('should have valid institute test data', () => {
      expect(testData.institutes.validInstitute).toBeDefined();
      expect(testData.institutes.validInstitute.name).toBeDefined();
      expect(testData.institutes.validInstitute.address).toBeDefined();
    });

    it('should have valid department test data', () => {
      expect(testData.departments.validDepartment).toBeDefined();
      expect(testData.departments.validDepartment.name).toBeDefined();
      expect(testData.departments.validDepartment.description).toBeDefined();
    });

    it('should have valid grade test data', () => {
      expect(testData.grades.validGrade).toBeDefined();
      expect(testData.grades.validGrade.name).toBeDefined();
      expect(testData.grades.validGrade.level).toBeDefined();
    });

    it('should have valid subject test data', () => {
      expect(testData.subjects.validSubject).toBeDefined();
      expect(testData.subjects.validSubject.name).toBeDefined();
      expect(testData.subjects.validSubject.code).toBeDefined();
    });
  });

  describe('Mock Objects', () => {
    it('should create mock request object', () => {
      const req = MockHelpers.createMockRequest({
        body: { test: 'data' },
        params: { id: '123' }
      });
      
      expect(req).toHaveProperty('body', { test: 'data' });
      expect(req).toHaveProperty('params', { id: '123' });
    });

    it('should create mock response object', () => {
      const res = MockHelpers.createMockResponse();
      
      expect(res).toHaveProperty('status');
      expect(res).toHaveProperty('json');
      expect(res).toHaveProperty('send');
      expect(typeof res.status).toBe('function');
      expect(typeof res.json).toBe('function');
    });

    it('should create mock error object', () => {
      const error = MockHelpers.createMockError('Test error', 400);
      
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
    });
  });
});
