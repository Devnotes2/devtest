const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Multi-Tenant Institute Management API",
      version: "1.0.0",
      description: "A comprehensive API for managing multi-tenant institute data, authentication, and member management",
      contact: {
        name: "API Support",
        email: "support@example.com"
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT"
      }
    },
    servers: [
      {
        url: "https://devtest2.onrender.com",
        description: "Development server"
      },
      {
        url: "http://localhost:8000",
        description: "Production server"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        // Common schemas
        Error: {
          type: "object",
          description: "Standard error response",
          properties: {
            message: {
              type: "string",
              description: "Error message"
            },
            status: {
              type: "string",
              description: "Error status"
            }
          }
        },
        Success: {
          type: "object",
          description: "Standard success response",
          properties: {
            message: {
              type: "string",
              description: "Success message"
            },
            data: {
              type: "object",
              description: "Response data"
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
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
    "./routes/s3Module/*.js",
    "./routes/enrollments/*.js"
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = (app) => {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Institute Management API Documentation",
    customfavIcon: "/favicon.ico",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      docExpansion: "list",
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
      displayOperationId: false,
      tryItOutEnabled: true,
      requestSnippetsEnabled: false,
      requestSnippets: {
        generators: {
          'curl_bash': {
            title: 'cURL (bash)',
            syntax: 'bash'
          }
        }
      }
    }
  }));
};
