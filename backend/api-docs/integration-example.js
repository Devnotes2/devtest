/**
 * SWAGGER INTEGRATION EXAMPLE
 * 
 * This file shows how to integrate Swagger documentation into your existing app.js
 * WITHOUT disturbing your current code structure.
 * 
 * Simply add the highlighted lines to your app.js file.
 */

// ============================================================================
// ADD THESE LINES TO YOUR app.js (AFTER THE EXISTING IMPORTS)
// ============================================================================

// Add this line after your existing require statements
const swaggerSetup = require('./api-docs/swagger');

// ============================================================================
// ADD THIS LINE AFTER YOUR MIDDLEWARE SETUP (BEFORE app.listen)
// ============================================================================

// Add this line after app.use('/', route); and before app.listen
swaggerSetup(app);

// ============================================================================
// COMPLETE INTEGRATION EXAMPLE
// ============================================================================

/*
Here's how your app.js should look after integration:

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectTenantDBMiddleware = require('./config/connectTenantDBMiddleware');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const route = require('./routes/routes');
const memberDataCt = require('./Controller/membersModule/memberDataCt');
const authCt = require('./Controller/authentication/authCt');

// 🆕 ADD THIS LINE
const swaggerSetup = require('./api-docs/swagger');

const app = express();
// ... your existing middleware setup ...

// Public routes for authentication
app.post('/auth/register', connectTenantDBMiddleware, memberDataCt.createMember);
app.post('/auth/login', connectTenantDBMiddleware, authCt.login);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

// S3 routes with JWT authentication
app.use('/s3', require('./routes/s3Module/s3Rt'));

// All other API routes
app.use('/', route);

// 🆕 ADD THIS LINE
swaggerSetup(app);

const port = process.env.PORT || 8000;
app.listen(port,'0.0.0.0', () => {
  console.log(`App running on port ${port}...`);
  console.log(`📚 Swagger documentation available at: http://localhost:${port}/docs`);
});
*/

// ============================================================================
// ALTERNATIVE: MINIMAL INTEGRATION (IF YOU PREFER)
// ============================================================================

/*
If you prefer minimal changes, you can also add this directly in your app.js:

// Add after your existing imports
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Add after your middleware setup
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Institute Management API",
      version: "1.0.0",
      description: "Multi-tenant institute management system API"
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 8000}`,
        description: "Development server"
      }
    ]
  },
  apis: [
    "./routes/*.js",
    "./routes/authentication/*.js",
    "./routes/instituteData/*.js",
    "./routes/instituteData/aggregation/*.js",
    "./routes/membersModule/*.js",
    "./routes/generalData/*.js",
    "./routes/asideData/*.js",
    "./routes/s3Module/*.js"
  ]
};

const swaggerSpec = swaggerJsdoc(options);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
*/

// ============================================================================
// VERIFICATION STEPS
// ============================================================================

/*
After integration, verify the setup:

1. Start your server: npm start
2. Check console for: "📚 Swagger documentation available at: http://localhost:8000/docs"
3. Open browser: http://localhost:8000/docs
4. You should see the Swagger UI with your API documentation

If you see an empty documentation page, it means:
- Your route files don't have JSDoc comments yet
- Use the templates in swagger-templates.js to add documentation
- The documentation will populate automatically once you add JSDoc comments
*/
