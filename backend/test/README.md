# API Test Suite

This directory contains comprehensive API test suites for the backend application using Newman (Postman CLI) and custom test runners.

## Test Structure

```
test/
├── collections/           # Newman/Postman test collections
│   ├── health-check/     # Health check endpoint tests
│   └── general-data/     # General data API tests
├── environments/         # Environment configurations
├── reports/             # Generated test reports
├── run-all-tests.js     # Comprehensive test runner
├── standalone-test-runner.js  # Individual test runner
└── README.md           # This file
```

## Available Test Suites

### 1. Health Check Tests
- **Collection**: `collections/health-check/health-check-collection.json`
- **Purpose**: Tests basic API health and connectivity
- **Endpoints**: `/health`
- **Tests**: Status codes, response time, JSON validation

### 2. General Data API Tests
- **Collection**: `collections/general-data/general-data-collection.json`
- **Purpose**: Comprehensive CRUD operations testing for general data
- **Endpoints**: `/generalDataRt/{type}`
- **Tests**: 
  - GET operations (all types, specific items, error cases)
  - POST operations (create new items, validation)
  - PUT operations (update existing items, error handling)
  - DELETE operations (single/multiple items, error cases)
  - Authentication tests (unauthorized access, invalid tokens)
  - Performance tests (response time, concurrent requests)

## NPM Scripts

### Run All Tests
```bash
# Run all test suites (development)
npm run test
npm run test:all
npm run test:all:dev

# Run all test suites (production)
npm run test:all:prod
```

### Run Individual Test Suites
```bash
# Health check tests
npm run test:health
npm run test:health:dev
npm run test:health:prod

# General data tests
npm run test:general-data
npm run test:general-data:dev
npm run test:general-data:prod
```

### Iterative Testing
```bash
# Run iterative health checks
npm run test:iterative
npm run test:iterative:dev
npm run test:iterative:prod
```

## Test Execution

### Using NPM Scripts (Recommended)
```bash
# Quick test (all suites, dev environment)
npm test

# Specific environment
npm run test:all:prod

# Individual module
npm run test:general-data:dev
```

### Direct Script Execution
```bash
# Run all tests
node test/run-all-tests.js dev
node test/run-all-tests.js prod

# Run individual modules
node test/standalone-test-runner.js health-check dev
node test/standalone-test-runner.js general-data prod
```

## Environment Configuration

### Development Environment
- **Base URL**: `http://svb.local:8000`
- **Timeout**: 5 minutes per module
- **Iterations**: 1-2 per test

### Production Environment
- **Base URL**: `https://devtest2.onrender.com`
- **Timeout**: 10 minutes per module
- **Iterations**: 1-2 per test

## Test Reports

All test reports are generated in HTML format and saved to `test/reports/` directory with timestamps:

```
test/reports/
├── health-check-dev-standalone-1-2025-01-06-10-30-45.html
├── general-data-dev-standalone-1-2025-01-06-10-35-12.html
└── ...
```

## General Data API Test Coverage

### Data Types Tested
- `blood_group` - Blood group categories
- `gender` - Gender options
- `member_type` - Member type classifications
- `status` - Status types
- `other` - Miscellaneous categories

### Test Scenarios

#### GET Operations
- ✅ Get all items of each type
- ✅ Get specific item by ID
- ✅ Handle non-existent types (404)
- ✅ Handle non-existent item IDs (404)

#### POST Operations
- ✅ Create new items for each type
- ✅ Validate required fields
- ✅ Handle missing data (400/500)

#### PUT Operations
- ✅ Update existing items
- ✅ Handle non-existent items (404)
- ✅ Handle missing itemId (400/500)

#### DELETE Operations
- ✅ Delete single items
- ✅ Delete multiple items
- ✅ Handle non-existent items (404)
- ✅ Handle missing IDs (400/500)

#### Authentication Tests
- ✅ Unauthorized access (401)
- ✅ Invalid token (401)

#### Performance Tests
- ✅ Response time validation
- ✅ Concurrent request handling

## Dependencies

The test suite requires:
- `newman` - Postman CLI for running collections
- `newman-reporter-htmlextra` - HTML report generation

Install with:
```bash
npm install
```

## Continuous Integration

These tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run API Tests
  run: |
    npm run test:all:prod
```

## Troubleshooting

### Common Issues

1. **Authentication Failures**
   - Ensure valid auth tokens in environment files
   - Check if login endpoint is accessible

2. **Connection Timeouts**
   - Verify base URLs are correct
   - Check network connectivity
   - Increase timeout values if needed

3. **Test Failures**
   - Check individual HTML reports for details
   - Verify API endpoints are running
   - Review environment configurations

### Debug Mode

For detailed debugging, run individual tests:
```bash
# Verbose output
node test/standalone-test-runner.js general-data dev
```

## Adding New Test Suites

1. Create new collection in `collections/` directory
2. Add module configuration to `standalone-test-runner.js`
3. Update `run-all-tests.js` to include new module
4. Add npm scripts to `package.json`
5. Update this README

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Cleanup**: Tests should clean up created data
3. **Error Handling**: Test both success and failure scenarios
4. **Performance**: Include response time validations
5. **Documentation**: Keep test descriptions clear and detailed