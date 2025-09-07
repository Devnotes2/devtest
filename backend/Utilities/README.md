# Enhanced Standardized API Utilities

A comprehensive, modular, and highly configurable API standardization system that provides consistent behavior across all endpoints with advanced features like caching, audit logging, rate limiting, and more.

## 🚀 Features

- **Configurable Response Codes**: Custom HTTP status codes for different scenarios
- **Flat Response Structure**: No nested objects in responses for better frontend integration
- **Enhanced Error Handling**: Three levels (standard, detailed, minimal)
- **Request ID Tracking**: Unique request identification for debugging
- **Audit Logging**: Comprehensive operation tracking
- **Rate Limiting**: Built-in request rate limiting
- **Caching**: Simple in-memory caching with TTL
- **Performance Monitoring**: Slow query detection and metrics
- **Security Headers**: Enhanced security headers
- **API Versioning**: Version-aware responses
- **Custom Validation**: Flexible validation hooks
- **Pre/Post Processing**: Hooks for custom logic
- **Batch Operations**: Support for bulk operations
- **Soft Delete/Archive**: Flexible deletion modes

## 📁 File Structure

```
backend/Utilities/
├── enhancedStandardizedApiUtils.js  # Main API utilities with all features
├── apiConfig.js                     # Configuration management
├── swaggerTemplates.js              # Swagger documentation templates
├── filterSortUtils.js               # Filtering and sorting utilities
├── genericAggregatorUtils.js        # MongoDB aggregation utilities
├── paginationControllsUtils.js      # Pagination utilities
├── crudUtils.js                     # Basic CRUD operations
└── aggregations/                    # Lookup utilities for different entities
    ├── instituteDataLookups.js
    ├── membersDataLookups.js
    ├── subjectsLookups.js
    └── ...
```

## 🔧 Quick Start

### 1. Basic Controller Setup

```javascript
const { 
  enhancedStandardizedGet, 
  enhancedStandardizedPost, 
  enhancedStandardizedPut, 
  enhancedStandardizedDelete 
} = require('../../Utilities/enhancedStandardizedApiUtils');
const { getApiConfig } = require('../../Utilities/apiConfig');

// GET Controller
const getResources = async (req, res) => {
  const options = {
    ...getApiConfig('yourApiName'), // Get environment-specific config
    lookups: [...], // MongoDB aggregation lookups
    joinedFieldMap: {...}, // Field mappings for filtering
    dropdownFields: ['_id', 'name'], // Fields for dropdown mode
    validationField: 'fieldName', // Field to validate uniqueness
    defaultSort: { createdAt: -1 }, // Default sorting
    projectFields: {...}, // Fields to project in aggregation
    transformData: (data) => { /* transform data */ }, // Custom data transformation
    enableCaching: true, // Enable response caching
    enableAuditLog: true, // Enable audit logging
    errorHandling: 'standard' // 'standard', 'detailed', 'minimal'
  };
  
  await enhancedStandardizedGet(req, res, createModel, options);
};

// POST Controller
const createResource = async (req, res) => {
  const options = {
    ...getApiConfig('yourApiName'),
    successMessage: 'Resource created successfully',
    requiredFields: ['field1', 'field2'], // Required fields validation
    uniqueFields: [{ fields: ['email'], message: 'Email already exists' }], // Unique field validation
    transformData: (data) => { /* transform data */ }, // Custom data transformation
    enableAuditLog: true,
    auditAction: 'CREATE'
  };
  
  await enhancedStandardizedPost(req, res, createModel, options);
};
```

### 2. Route Setup with Middleware

```javascript
const express = require('express');
const router = express.Router();
const { createEnhancedMiddleware } = require('../../Utilities/enhancedStandardizedApiUtils');

// Apply enhanced middleware
router.use(createEnhancedMiddleware({
  requestId: { enabled: true },
  audit: { enabled: true },
  rateLimit: { windowMs: 15 * 60 * 1000, max: 100 },
  performance: { enabled: true },
  security: { enabled: true }
}));

router.get('/resources', controller.getResources);
router.post('/resources', controller.createResource);
router.put('/resources', controller.updateResource);
router.delete('/resources', controller.deleteResources);
```

### 3. Swagger Documentation

```javascript
const { generateGetDocumentation, generatePostDocumentation } = require('../../Utilities/swaggerTemplates');

// Generate GET documentation
const getDoc = generateGetDocumentation(
  '/api/resources',
  'Get all resources',
  'Retrieve a list of all resources with optional filtering and pagination',
  'Resources'
);

// Generate POST documentation
const postDoc = generatePostDocumentation(
  '/api/resources',
  'Create a new resource',
  'Create a new resource with the provided data',
  'Resources',
  'ResourceCreateRequest'
);
```

## ⚙️ Configuration

### Environment-Specific Configs

```javascript
// Development
const config = getApiConfig('members', 'development');
// Includes: detailed error handling, audit logging, no caching

// Staging
const config = getApiConfig('members', 'staging');
// Includes: standard error handling, audit logging, caching enabled

// Production
const config = getApiConfig('members', 'production');
// Includes: minimal error handling, audit logging, caching enabled
```

### Custom Response Codes

```javascript
const customResponseCodes = {
  memberSuspended: 423,
  quotaExceeded: 429,
  instituteInactive: 424
};

const options = {
  responseCodes: customResponseCodes,
  // ... other options
};
```

### Custom Validation

```javascript
const customValidation = async (req, res, Model) => {
  const errors = [];
  
  // Check if member is suspended
  if (req.body.status === 'suspended') {
    errors.push({
      field: 'status',
      message: 'Cannot create suspended member',
      code: 'INVALID_STATUS'
    });
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

const options = {
  customValidation,
  // ... other options
};
```

## 📊 Response Format

All responses use a flat structure (no nested objects):

```javascript
{
  "success": true,
  "message": "Operation completed successfully",
  "data": [...],
  "count": 10,
  "filteredDocs": 8,
  "totalDocs": 100,
  "page": 1,
  "limit": 10,
  "mode": "aggregated",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "req_1705312200000_abc123def",
  "version": "1.0",
  "apiType": "member-management",
  "errors": [],
  "warnings": []
}
```

## 🔍 Query Parameters

All GET endpoints support these standardized query parameters:

- `page`: Page number for pagination
- `limit`: Number of items per page
- `ids`: Array of specific IDs to retrieve
- `dropdown`: Return simplified data for dropdowns
- `aggregate`: Include related data in response
- `sortField`: Field to sort by
- `sort`: Sort order (asc/desc)
- `filterField`: Field(s) to filter by
- `operator`: Filter operator(s)
- `value`: Filter value(s)
- `validate`: Validate filter fields

## 🛡️ Security Features

- **Rate Limiting**: Prevents abuse and DoS attacks
- **Request ID Tracking**: Enhanced debugging and correlation
- **Audit Logging**: Complete operation tracking for security
- **Security Headers**: Protection against common attacks
- **Input Validation**: Prevents injection attacks

## 📈 Performance Features

- **Caching**: Reduces database load and improves performance
- **Performance Monitoring**: Automatic slow query detection
- **Memory Usage Tracking**: Monitor memory consumption
- **Response Time Metrics**: Track API performance

## 🔧 Advanced Features

### Pre/Post Processing Hooks

```javascript
const preProcess = async (req, res, Model) => {
  console.log(`Processing request: ${req.requestId}`);
  // Add any pre-processing logic
};

const postProcess = async (req, res, data) => {
  console.log(`Completed processing: ${req.requestId}`);
  // Add any post-processing logic
};

const options = {
  preProcess,
  postProcess,
  // ... other options
};
```

### Data Transformation

```javascript
const transformData = (data) => {
  if (Array.isArray(data)) {
    return data.map(item => ({
      ...item,
      // Add computed fields
      fullName: `${item.firstName} ${item.lastName}`,
      // Transform sensitive data
      email: item.email ? item.email.toLowerCase() : item.email
    }));
  }
  return {
    ...data,
    fullName: `${data.firstName} ${data.lastName}`,
    email: data.email ? data.email.toLowerCase() : data.email
  };
};

const options = {
  transformData,
  // ... other options
};
```

### Soft Delete/Archive Modes

```javascript
const options = {
  softDelete: true,    // Set deletedAt timestamp
  archiveMode: false,  // Set archive flag
  cascadeDelete: true  // Delete related records
};
```

## 🧪 Testing

### Test Response Structure

```javascript
const response = await request(app)
  .get('/api/resources')
  .expect(200);

expect(response.body).toHaveProperty('success');
expect(response.body).toHaveProperty('count');
expect(response.body).toHaveProperty('timestamp');
expect(response.body).toHaveProperty('requestId');
expect(response.body).not.toHaveProperty('meta'); // No nested objects
```

### Test Error Handling

```javascript
const response = await request(app)
  .post('/api/resources')
  .send({}) // Invalid data
  .expect(400);

expect(response.body).toHaveProperty('errors');
expect(response.body.errors).toBeInstanceOf(Array);
```

## 📝 Migration Guide

### From Basic to Enhanced

1. **Update imports**:
   ```javascript
   // Before
   const { standardizedGet } = require('../../Utilities/standardizedApiUtils');
   
   // After
   const { enhancedStandardizedGet } = require('../../Utilities/enhancedStandardizedApiUtils');
   ```

2. **Add configuration**:
   ```javascript
   const options = {
     ...getApiConfig('yourApiName'),
     // ... your existing options
   };
   ```

3. **Update middleware**:
   ```javascript
   router.use(createEnhancedMiddleware());
   ```

## 🚨 Error Handling

The system provides three levels of error handling:

- **Standard**: Basic error messages
- **Detailed**: Full error details with stack traces (development)
- **Minimal**: Minimal info for production

## 📊 Monitoring

- **Audit Logs**: Complete operation tracking
- **Performance Metrics**: Response times and memory usage
- **Slow Query Detection**: Automatic detection of slow queries
- **Rate Limit Monitoring**: Track rate limit violations

## 🔄 Caching

- **In-Memory Caching**: Simple caching with TTL
- **Cache Invalidation**: Automatic cache management
- **Cache Statistics**: Monitor cache hit rates

## 📚 API Documentation

Use the Swagger templates to generate comprehensive API documentation:

```javascript
const { generateGetDocumentation } = require('../../Utilities/swaggerTemplates');

const documentation = generateGetDocumentation(
  '/api/endpoint',
  'Endpoint Summary',
  'Endpoint Description',
  'Tag Name'
);
```

## 🤝 Contributing

1. Follow the existing code structure
2. Add comprehensive documentation
3. Include tests for new features
4. Update this README for new features

## 📄 License

This project is part of the enhanced API standardization system.
