module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test file patterns - E2E tests only
  testMatch: [
    '**/test/e2e/**/*.e2e.test.js',
    '**/test/e2e/**/*.test.js'
  ],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/jest.config.js',
    '!**/test/**',
    '!**/__tests__/**',
    '!**/api-docs/**'
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  
  // Test timeout
  testTimeout: 30000,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Verbose output
  verbose: true,
  
  // Module paths
  moduleDirectories: ['node_modules', '<rootDir>'],
  
  // Transform files
  transform: {},
  
  // Global variables
  globals: {
    'process.env.NODE_ENV': 'test'
  },
  
  // Coverage thresholds - relaxed for E2E focus
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 40,
      lines: 40,
      statements: 40
    }
  }
};
