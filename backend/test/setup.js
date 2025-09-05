// Test setup file - runs before each test file
require('dotenv').config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '8001'; // Use different port for tests

// Increase timeout for database operations
jest.setTimeout(30000);

// Global test utilities
global.testUtils = {
  // Generate test data
  generateTestUser: () => ({
    email: `test${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    phone: '+1234567890'
  }),

  // Generate test institute
  generateTestInstitute: () => ({
    name: `Test Institute ${Date.now()}`,
    address: '123 Test Street',
    city: 'Test City',
    state: 'Test State',
    country: 'Test Country',
    pincode: '12345'
  }),

  // Generate test department
  generateTestDepartment: () => ({
    name: `Test Department ${Date.now()}`,
    description: 'Test Department Description'
  }),

  // Generate test grade
  generateTestGrade: () => ({
    name: `Grade ${Math.floor(Math.random() * 12) + 1}`,
    description: 'Test Grade Description'
  }),

  // Generate test subject
  generateTestSubject: () => ({
    name: `Test Subject ${Date.now()}`,
    code: `SUB${Date.now()}`,
    description: 'Test Subject Description'
  }),

  // Generate test enrollment
  generateTestEnrollment: () => ({
    studentId: `STU${Date.now()}`,
    academicYear: new Date().getFullYear(),
    grade: 'Grade 10',
    section: 'A'
  })
};

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
