/**
 * Swagger Documentation Templates
 * Provides standardized Swagger documentation for all APIs
 */

/**
 * Standard query parameters for all GET endpoints
 */
const STANDARD_QUERY_PARAMETERS = `
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *         example: 10
 *       - in: query
 *         name: ids
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             pattern: '^[0-9a-fA-F]{24}$'
 *         style: form
 *         explode: false
 *         description: Array of specific IDs to retrieve (comma-separated)
 *         example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *       - in: query
 *         name: dropdown
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Return simplified data with only _id and name fields for dropdowns
 *         example: true
 *       - in: query
 *         name: aggregate
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Include related data in response
 *         example: true
 *       - in: query
 *         name: sortField
 *         schema:
 *           type: string
 *         description: Field to sort by
 *         example: "createdAt"
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order (asc or desc)
 *         example: "desc"
 *       - in: query
 *         name: filterField
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: false
 *         description: Field(s) to filter by
 *         example: ["name"]
 *       - in: query
 *         name: operator
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [equals, contains, startsWith, endsWith, gt, gte, lt, lte, in, nin, exists, regex]
 *         style: form
 *         explode: false
 *         description: Filter operator(s) corresponding to filterField(s)
 *         example: ["contains"]
 *       - in: query
 *         name: value
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: false
 *         description: Filter value(s) corresponding to filterField(s)
 *         example: ["test"]
 *       - in: query
 *         name: validate
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Validate filter fields against schema
 *         example: true`;

/**
 * Standard response schemas
 */
const STANDARD_RESPONSES = `
 *     responses:
 *       200:
 *         description: Operation completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Operation completed successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 count:
 *                   type: integer
 *                   example: 10
 *                 filteredDocs:
 *                   type: integer
 *                   example: 8
 *                 totalDocs:
 *                   type: integer
 *                   example: 100
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 mode:
 *                   type: string
 *                   example: "aggregated"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00.000Z"
 *                 requestId:
 *                   type: string
 *                   example: "req_1705312200000_abc123def"
 *                 version:
 *                   type: string
 *                   example: "1.0"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation failed"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: "name"
 *                       message:
 *                         type: string
 *                         example: "Name is required"
 *                       code:
 *                         type: string
 *                         example: "REQUIRED_FIELD"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       404:
 *         description: Resource not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Resource not found"
 *       409:
 *         description: Conflict
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Resource already exists"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"`;

/**
 * Generate GET endpoint documentation
 */
const generateGetDocumentation = (endpoint, summary, description, tag, additionalParams = '') => {
  return `
/**
 * @swagger
 * ${endpoint}:
 *   get:
 *     summary: ${summary}
 *     tags: [${tag}]
 *     description: ${description}
 *     security:
 *       - bearerAuth: []
 *     parameters:${STANDARD_QUERY_PARAMETERS}${additionalParams}${STANDARD_RESPONSES}
 */`;
};

/**
 * Generate POST endpoint documentation
 */
const generatePostDocumentation = (endpoint, summary, description, tag, requestSchema, additionalParams = '') => {
  return `
/**
 * @swagger
 * ${endpoint}:
 *   post:
 *     summary: ${summary}
 *     tags: [${tag}]
 *     description: ${description}
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/${requestSchema}'
 *           example:
 *             name: "Example Name"
 *             description: "Example description"
 *     responses:
 *       201:
 *         description: Resource created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Resource created successfully"
 *                 data:
 *                   type: object
 *                 created:
 *                   type: boolean
 *                   example: true
 *                 id:
 *                   type: string
 *                   example: "507f1f77bcf86cd799439011"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00.000Z"
 *                 requestId:
 *                   type: string
 *                   example: "req_1705312200000_abc123def"
 *                 version:
 *                   type: string
 *                   example: "1.0"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation failed"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: "name"
 *                       message:
 *                         type: string
 *                         example: "Name is required"
 *                       code:
 *                         type: string
 *                         example: "REQUIRED_FIELD"
 *       409:
 *         description: Conflict
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Resource already exists"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */`;
};

/**
 * Generate PUT endpoint documentation
 */
const generatePutDocumentation = (endpoint, summary, description, tag, requestSchema) => {
  return `
/**
 * @swagger
 * ${endpoint}:
 *   put:
 *     summary: ${summary}
 *     tags: [${tag}]
 *     description: ${description}
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - _id
 *               - updatedData
 *             properties:
 *               _id:
 *                 type: string
 *                 description: ID of the resource to update
 *                 example: "507f1f77bcf86cd799439011"
 *               updatedData:
 *                 $ref: '#/components/schemas/${requestSchema}'
 *           example:
 *             _id: "507f1f77bcf86cd799439011"
 *             updatedData:
 *               name: "Updated Name"
 *               description: "Updated description"
 *     responses:
 *       200:
 *         description: Resource updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Resource updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     modified:
 *                       type: boolean
 *                       example: true
 *                 modified:
 *                   type: boolean
 *                   example: true
 *                 modifiedCount:
 *                   type: integer
 *                   example: 1
 *                 matchedCount:
 *                   type: integer
 *                   example: 1
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00.000Z"
 *                 requestId:
 *                   type: string
 *                   example: "req_1705312200000_abc123def"
 *                 version:
 *                   type: string
 *                   example: "1.0"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation failed"
 *       404:
 *         description: Resource not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Resource not found"
 *       409:
 *         description: Conflict
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Resource already exists"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */`;
};

/**
 * Generate DELETE endpoint documentation
 */
const generateDeleteDocumentation = (endpoint, summary, description, tag) => {
  return `
/**
 * @swagger
 * ${endpoint}:
 *   delete:
 *     summary: ${summary}
 *     tags: [${tag}]
 *     description: ${description}
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of IDs to delete
 *                 example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *           example:
 *             ids: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *     responses:
 *       200:
 *         description: Resource deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Resource deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedIds:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *                     deleted:
 *                       type: boolean
 *                       example: true
 *                 deleted:
 *                   type: boolean
 *                   example: true
 *                 deletedIds:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *                 deletedCount:
 *                   type: integer
 *                   example: 2
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00.000Z"
 *                 requestId:
 *                   type: string
 *                   example: "req_1705312200000_abc123def"
 *                 version:
 *                   type: string
 *                   example: "1.0"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation failed"
 *       404:
 *         description: Resource not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Resource not found"
 *       409:
 *         description: Conflict
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Cannot delete - has dependencies"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */`;
};

/**
 * Generate schema documentation
 */
const generateSchemaDocumentation = (schemaName, properties, required = [], description = '') => {
  const requiredSection = required.length > 0 ? `
 *       required:
${required.map(field => ` *         - ${field}`).join('\n')}` : '';

  const propertiesSection = Object.entries(properties).map(([key, value]) => {
    const type = value.type || 'string';
    const desc = value.description || '';
    const example = value.example ? `\n *           example: "${value.example}"` : '';
    const enumValues = value.enum ? `\n *           enum: [${value.enum.map(v => `"${v}"`).join(', ')}]` : '';
    
    return ` *         ${key}:
 *           type: ${type}${desc ? `\n *           description: ${desc}` : ''}${example}${enumValues}`;
  }).join('\n');

  return `
/**
 * @swagger
 * components:
 *   schemas:
 *     ${schemaName}:
 *       type: object
 *       description: ${description}${requiredSection}
 *       properties:
${propertiesSection}
 */`;
};

module.exports = {
  STANDARD_QUERY_PARAMETERS,
  STANDARD_RESPONSES,
  generateGetDocumentation,
  generatePostDocumentation,
  generatePutDocumentation,
  generateDeleteDocumentation,
  generateSchemaDocumentation
};
