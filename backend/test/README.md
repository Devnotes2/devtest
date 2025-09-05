# E2E Testing Documentation

This directory contains comprehensive end-to-end tests for the backend API using Jest and Supertest, focusing on complete user workflows and system integration.

## Test Structure

```
test/
├── e2e/                   # End-to-end tests for complete workflows
│   ├── instituteData/     # Institute data E2E tests
│   │   ├── institutes.e2e.test.js
│   │   ├── departments.e2e.test.js
│   │   ├── academicYear.e2e.test.js
│   │   └── aggregation/   # Aggregation module E2E tests
│   │       ├── grades.e2e.test.js
│   │       ├── subjects.e2e.test.js
│   │       ├── gradeSections.e2e.test.js
│   │       ├── gradeBatches.e2e.test.js
│   │       ├── gradeSectionBatches.e2e.test.js
│   │       └── locationTypesInInstitute.e2e.test.js
├── fixtures/              # Test data fixtures
├── helpers/               # Test helper utilities
├── mocks/                 # Mock implementations
├── config/                # Test configuration
├── app.js                 # Test-specific app (no server start)
├── setup.js              # Test setup configuration
└── README.md             # This file
```

## Test Types

### End-to-End Tests
- Test complete user workflows from start to finish
- Test system behavior under realistic conditions
- Test performance and scalability
- Test full application scenarios with real database
- Test business logic and data relationships
- Located in `test/e2e/`

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Types
```bash
# All E2E tests
npm run test:e2e

# Institute data tests only
npm run test:institute

# Aggregation module tests only
npm run test:aggregation
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Specific Test File
```bash
npm test -- institutes.e2e.test.js
npm test -- departments.e2e.test.js
npm test -- grades.e2e.test.js
```

### Run Tests Matching Pattern
```bash
npm test -- --testNamePattern="Institutes"
npm test -- --testNamePattern="Departments"
npm test -- --testNamePattern="Grades"
```

## Test Configuration

### Jest Configuration
- Configuration file: `jest.config.js`
- Test environment: Node.js
- Coverage thresholds: 40% for branches, functions, lines, and statements (relaxed for E2E focus)
- Test timeout: 30 seconds
- Setup file: `test/setup.js`
- Focus: E2E tests only

### Environment Variables
Create a `.env.test` file for test-specific environment variables:
```env
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/test_db
JWT_SECRET=test-secret
AWS_ACCESS_KEY_ID=test-key
AWS_SECRET_ACCESS_KEY=test-secret
SENDGRID_API_KEY=test-key
TWILIO_ACCOUNT_SID=test-sid
TWILIO_AUTH_TOKEN=test-token
```

## Test Helpers

### TestHelpers
- `createTestApp(app)` - Create Supertest agent
- `generateAuthToken(user)` - Generate JWT token
- `createAuthHeaders(token)` - Create authenticated headers
- `assertResponse(response, status, fields)` - Assert response structure
- `assertErrorResponse(response, status, message)` - Assert error response
- `assertSuccessResponse(response, status, data)` - Assert success response

### DatabaseHelpers
- `connectToTestDatabase(uri)` - Connect to test database
- `disconnectFromTestDatabase()` - Disconnect from database
- `clearTestDatabase()` - Clear all collections
- `clearCollections(names)` - Clear specific collections
- `createBulkTestData(model, data)` - Create multiple test records

### MockHelpers
- `createMockRequest(options)` - Create mock request object
- `createMockResponse(options)` - Create mock response object
- `createMockUser(overrides)` - Create mock user object
- `createMockInstitute(overrides)` - Create mock institute object
- `createMockError(message, statusCode)` - Create mock error object

## Test Data Fixtures

Test data is organized in `test/fixtures/testData.js` with the following structure:
- `users` - User test data (valid, admin, invalid)
- `institutes` - Institute test data
- `departments` - Department test data
- `grades` - Grade test data
- `subjects` - Subject test data
- `enrollments` - Enrollment test data
- `auth` - Authentication test data
- `pagination` - Pagination test data
- `filters` - Filter test data

## Mock Services

External services are mocked in `test/mocks/externalServices.js`:
- AWS S3
- SendGrid
- Twilio
- JWT
- bcryptjs
- multer
- uuid
- axios

## Writing Tests

### Test Structure
```javascript
describe('Feature Name', () => {
  beforeEach(async () => {
    // Setup test data
  });

  afterEach(async () => {
    // Cleanup
  });

  describe('Specific Functionality', () => {
    it('should do something when condition is met', async () => {
      // Arrange
      const testData = { /* test data */ };
      
      // Act
      const response = await request(app)
        .post('/endpoint')
        .send(testData)
        .expect(200);
      
      // Assert
      expect(response.body.success).toBe(true);
    });
  });
});
```

### Best Practices
1. **Arrange-Act-Assert**: Structure tests with clear sections
2. **Descriptive Names**: Use clear, descriptive test names
3. **Single Responsibility**: Each test should test one thing
4. **Independent Tests**: Tests should not depend on each other
5. **Clean Setup/Teardown**: Always clean up after tests
6. **Mock External Dependencies**: Don't make real API calls in tests
7. **Use Test Helpers**: Leverage helper functions for common operations
8. **Test Edge Cases**: Include tests for error conditions and edge cases

### Common Patterns

#### Testing API Endpoints
```javascript
it('should create resource with valid data', async () => {
  const response = await request(app)
    .post('/resources')
    .set('Authorization', `Bearer ${authToken}`)
    .send(validData)
    .expect(201);

  TestHelpers.assertSuccessResponse(response, 201, {
    data: expect.objectContaining({
      resource: expect.objectContaining({
        name: validData.name
      })
    })
  });
});
```

#### Testing Authentication
```javascript
it('should require authentication', async () => {
  const response = await request(app)
    .get('/protected-endpoint')
    .expect(401);

  TestHelpers.assertErrorResponse(response, 401, 'No token provided');
});
```

#### Testing Error Handling
```javascript
it('should handle validation errors', async () => {
  const response = await request(app)
    .post('/resources')
    .send(invalidData)
    .expect(400);

  TestHelpers.assertErrorResponse(response, 400);
  expect(response.body.error).toContain('validation');
});
```

## Debugging Tests

### Enable Verbose Output
```bash
npm test -- --verbose
```

### Run Single Test with Debug
```bash
npm test -- --testNamePattern="specific test" --verbose
```

### Debug Database Issues
- Check test database connection
- Verify test data setup
- Check for data cleanup issues

### Debug Authentication Issues
- Verify JWT token generation
- Check token expiration
- Verify middleware setup

## Continuous Integration

Tests are configured to run in CI/CD pipelines with:
- Database setup and teardown
- Environment variable configuration
- Coverage reporting
- Test result reporting

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Ensure test database is running
   - Check connection string in `.env.test`
   - Verify database permissions

2. **Authentication Failures**
   - Check JWT secret configuration
   - Verify token generation
   - Check middleware setup

3. **Test Timeouts**
   - Increase timeout in `jest.config.js`
   - Check for hanging promises
   - Verify cleanup in `afterEach`

4. **Mock Issues**
   - Ensure mocks are properly configured
   - Check mock reset in `afterEach`
   - Verify mock implementations

### Getting Help
- Check test logs for detailed error messages
- Use `--verbose` flag for more output
- Review test setup and configuration
- Check helper function implementations
