# Swagger API Documentation Setup

This directory contains the Swagger/OpenAPI documentation setup for your Institute Management API.

## 🚀 Quick Start

1. **Installation** (Already done):
   ```bash
   npm install swagger-jsdoc swagger-ui-express
   ```

2. **Integration** (Already done):
   - `swagger.js` - Main Swagger configuration
   - `swagger-templates.js` - Comprehensive documentation templates

3. **Access Documentation**:
   - Start your server
   - Navigate to: `http://localhost:3000/docs`

## 📁 Files Overview

### `swagger.js`
- Main Swagger configuration file
- Defines OpenAPI 3.0.0 specification
- Configures API paths and server information
- Sets up Swagger UI with custom options

### `swagger-templates.js`
- Comprehensive documentation templates for all route categories
- Ready-to-use JSDoc comments for Swagger
- Covers authentication, institutes, members, and more

## 🔧 How to Use

### 1. Basic Route Documentation
Add JSDoc comments above your route handlers:

```javascript
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/api/users', userController.getAllUsers);
```

### 2. Request Body Documentation
```javascript
/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 */
```

### 3. Schema Definitions
Define reusable schemas in your route files:

```javascript
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - name
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         name:
 *           type: string
 */
```

## 📚 Available Templates

The `swagger-templates.js` file contains ready-to-use templates for:

- **Authentication Routes**: Login, register, password reset, OTP verification
- **Institute Data**: Institutes, academic years, departments, grades, subjects
- **Members Module**: User management, role-based access
- **General Data**: Configuration and settings
- **S3 Module**: File upload and management
- **Aside Data**: Sidebar and navigation data

## 🎯 Best Practices

### 1. Consistent Tagging
Use consistent tags to group related endpoints:
```javascript
tags: [Authentication]  // For auth-related endpoints
tags: [Institutes]      // For institute-related endpoints
tags: [Members]         // For member-related endpoints
```

### 2. Proper Response Schemas
Always define response schemas for better documentation:
```javascript
responses:
  200:
    description: Success
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/User'
  400:
    description: Bad Request
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/Error'
```

### 3. Parameter Documentation
Document all parameters clearly:
```javascript
parameters:
  - in: query
    name: page
    schema:
      type: integer
      default: 1
    description: Page number for pagination
  - in: path
    name: id
    required: true
    schema:
      type: string
    description: User ID
```

## 🔐 Security Documentation

The setup includes JWT Bearer token authentication:

```javascript
security:
  - bearerAuth: []
```

This will show an "Authorize" button in Swagger UI for testing protected endpoints.

## 🎨 Customization

### Custom CSS
Modify the `customCss` option in `swagger.js` to customize the appearance.

### Custom Options
Adjust Swagger UI options in the setup:
- `persistAuthorization`: Keeps auth token between requests
- `displayRequestDuration`: Shows request timing
- `filter`: Enables endpoint filtering
- `showExtensions`: Shows OpenAPI extensions

## 🚨 Troubleshooting

### Common Issues

1. **Routes not showing up**:
   - Check that your route files are included in the `apis` array
   - Ensure JSDoc comments are properly formatted

2. **Schemas not resolving**:
   - Make sure schema references use correct paths
   - Check for typos in schema names

3. **Authentication not working**:
   - Verify JWT token format
   - Check middleware configuration

### Debug Mode
Enable debug logging by adding to your route files:
```javascript
/**
 * @swagger
 * /debug:
 *   get:
 *     summary: Debug endpoint
 *     tags: [Debug]
 *     responses:
 *       200:
 *         description: Debug information
 */
```

## 📖 Additional Resources

- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [Swagger JSDoc](https://github.com/Surnet/swagger-jsdoc)
- [Swagger UI Express](https://github.com/scottie1984/swagger-ui-express)
- [JSDoc Documentation](https://jsdoc.app/)

## 🤝 Contributing

When adding new routes:
1. Use the provided templates as a starting point
2. Maintain consistent formatting and structure
3. Include proper error responses
4. Add appropriate tags and descriptions
5. Test the documentation in Swagger UI

## 📝 Example Implementation

Here's a complete example of how to document a route:

```javascript
// routes/institutes.js

/**
 * @swagger
 * components:
 *   schemas:
 *     Institute:
 *       type: object
 *       required:
 *         - name
 *         - code
 *       properties:
 *         name:
 *           type: string
 *           description: Institute name
 *         code:
 *           type: string
 *           description: Unique institute code
 */

/**
 * @swagger
 * /institutes:
 *   get:
 *     summary: Get all institutes
 *     tags: [Institutes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: List of institutes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Institute'
 *       401:
 *         description: Unauthorized
 */
router.get('/', instituteController.getAllInstitutes);
```

After implementing this, your endpoint will appear in the Swagger UI with full documentation, request/response schemas, and the ability to test it directly from the browser!
