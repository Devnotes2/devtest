const express = require('express');
const router = express.Router();

const departmentCt = require('../../Controller/instituteData/departmentCt');

/**
 * @swagger
 * components:
 *   schemas:
 *     # ============================================================================
 *     # DEPARTMENT MANAGEMENT SCHEMAS
 *     # ============================================================================
 *     Department:
 *       type: object
 *       required:
 *         - departmentName
 *         - departmentCode
 *         - instituteId
 *       properties:
 *         departmentName:
 *           type: string
 *           description: Department name (REQUIRED)

 *         departmentCode:
 *           type: string
 *           description: Unique department code (REQUIRED)

 *         instituteId:
 *           type: string
 *           description: Associated institute ID (REQUIRED)

 *         description:
 *           type: string
 *           description: Department description (OPTIONAL)

 *         archive:
 *           type: boolean
 *           default: false
 *           description: Archive status (OPTIONAL - defaults to false)

 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp

 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     DepartmentUpdateRequest:
 *       type: object
 *       required:
 *         - _id
 *         - updatedData
 *       properties:
 *         _id:
 *           type: string
 *           required: true
 *           description: Department ID to update

 *         updatedData:
 *           type: object
 *           description: Fields to update (all fields are OPTIONAL for updates)
 *           properties:
 *             departmentName:
 *               type: string
 *               description: Updated department name (OPTIONAL)

 *             departmentCode:
 *               type: string
 *               description: Updated department code (OPTIONAL)

 *             description:
 *               type: string
 *               description: Updated description (OPTIONAL)

 *             archive:
 *               type: boolean
 *               description: Updated archive status (OPTIONAL)
 *     DepartmentDeleteRequest:
 *       type: object
 *       required:
 *         - ids
 *       properties:
 *         ids:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of department IDs to delete (REQUIRED)

 *         deleteDependents:
 *           type: boolean
 *           description: Whether to delete dependent records (grades, subjects, members) (OPTIONAL)

 *         transferTo:
 *           type: string
 *           description: Department ID to transfer dependents to (OPTIONAL - alternative to deleteDependents)

 *         archive:
 *           type: boolean
 *           description: Archive/unarchive departments instead of deleting (OPTIONAL)
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *         data:
 *           type: object
 *           description: Response data
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *         status:
 *           type: string
 *           description: Error status
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *               message:
 *                 type: string
 */

/**
 * @swagger
 * tags:
 *   name: Departments
 *   description: Department management endpoints
 */

/**
 * @swagger
 * /instituteDataRt/department:
 *   get:
 *     summary: Get departments (main endpoint - handles all combinations)
 *     tags: [Departments]
 *     description: |
 *       Main GET endpoint that handles all department retrieval combinations:
 *       - Basic listing with pagination and filtering
 *       - Dropdown mode (dropdown=true) - returns only _id and departmentName
 *       - Validation mode (validate=true) - checks if departmentName exists
 *       - Aggregation mode (aggregate=true/false) - with/without institute lookup
 *       - Specific IDs (ids parameter) - fetch specific departments
 *       **Use Cases:**
 *       - `?dropdown=true` - For UI dropdowns
 *       - `?validate=true&departmentName=CS` - Check name availability
 *       - `?aggregate=false` - Faster simple find (no lookups)
 *       - `?ids=id1,id2` - Get specific departments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: ids
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: false
 *         description: Array of department IDs to fetch specific departments

 *       - in: query
 *         name: aggregate
 *         schema:
 *           type: string
 *           enum: [true, false]
 *           default: true
 *         description: Use aggregation pipeline (true) or simple find (false)
 *       - in: query
 *         name: instituteId
 *         schema:
 *           type: string
 *         description: Filter by institute ID

 *       - in: query
 *         name: departmentName
 *         schema:
 *           type: string
 *         description: Filter by department name

 *       - in: query
 *         name: departmentCode
 *         schema:
 *           type: string
 *         description: Filter by department code

 *       - in: query
 *         name: archive
 *         schema:
 *           type: boolean
 *         description: Filter by archive status

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
 *         description: Return simplified data with only _id and departmentName fields for dropdowns
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
 *         example: "departmentName"
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order (asc or desc)
 *         example: "asc"
 *       - in: query
 *         name: filterField
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: false
 *         description: Field(s) to filter by
 *         example: ["archive", "instituteId"]
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
 *         example: ["equals", "equals"]
 *       - in: query
 *         name: value
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: false
 *         description: Filter value(s) corresponding to filterField(s)
 *         example: ["false", "507f1f77bcf86cd799439012"]
 *       - in: query
 *         name: validate
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Validate filter fields against schema
 *         example: true
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
 *                     $ref: '#/components/schemas/Department'
 *                 count:
 *                   type: integer
 *                   example: 2
 *                 filteredDocs:
 *                   type: integer
 *                   example: 2
 *                 totalDocs:
 *                   type: integer
 *                   example: 25
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
 *             examples:
 *               departments_list:
 *                 summary: Departments List
 *                 value:
 *                   success: true
 *                   message: "Operation completed successfully"
 *                   data:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       instituteId: "507f1f77bcf86cd799439012"
 *                       departmentName: "Computer Science"
 *                       departmentCode: "CS001"
 *                       description: "Computer Science and Engineering Department"
 *                       archive: false
 *                       createdAt: "2023-01-01T00:00:00.000Z"
 *                       updatedAt: "2023-01-01T00:00:00.000Z"
 *                     - _id: "507f1f77bcf86cd799439013"
 *                       instituteId: "507f1f77bcf86cd799439012"
 *                       departmentName: "Mathematics"
 *                       departmentCode: "MATH001"
 *                       description: "Mathematics Department"
 *                       archive: false
 *                       createdAt: "2023-01-01T00:00:00.000Z"
 *                       updatedAt: "2023-01-01T00:00:00.000Z"
 *                   count: 2
 *                   filteredDocs: 2
 *                   totalDocs: 25
 *                   page: 1
 *                   limit: 10
 *                   mode: "aggregated"
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *                   requestId: "req_1705312200000_abc123def"
 *                   version: "1.0"
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
 *                         example: "instituteId"
 *                       message:
 *                         type: string
 *                         example: "Institute ID is required"
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
 */

router.get('/department', departmentCt.getDepartment);


/**
 * @swagger
 * /instituteDataRt/department:
 *   post:
 *     summary: Create a new department
 *     tags: [Departments]
 *     description: Create a new department with basic information
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Department'

 *             departmentCode: "CS001"
 *             instituteId: "507f1f77bcf86cd799439011"
 *             description: "Computer Science and Engineering Department"
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
 *             examples:
 *               department_created:
 *                 summary: Department Created Successfully
 *                 value:
 *                   success: true
 *                   message: "Resource created successfully"
 *                   data:
 *                     department:
 *                       _id: "507f1f77bcf86cd799439011"
 *                       instituteId: "507f1f77bcf86cd799439012"
 *                       departmentName: "Computer Science"
 *                       departmentCode: "CS001"
 *                       description: "Computer Science and Engineering Department"
 *                       archive: false
 *                       createdAt: "2023-01-01T00:00:00.000Z"
 *                       updatedAt: "2023-01-01T00:00:00.000Z"
 *                   created: true
 *                   id: "507f1f77bcf86cd799439011"
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *                   requestId: "req_1705312200000_abc123def"
 *                   version: "1.0"
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
 *                         example: "departmentName"
 *                       message:
 *                         type: string
 *                         example: "Department name is required"
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
 */

router.post('/department', departmentCt.createDepartment);

/**
 * @swagger
 * /instituteDataRt/department:
 *   put:
 *     summary: Update department
 *     tags: [Departments]
 *     description: Update existing department information
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DepartmentUpdateRequest'

 *             updatedData:
 *               departmentName: "Computer Science Updated"
 *               departmentCode: "CS001-UPDATED"
 *               description: "Updated Computer Science Department"
 *               archive: false
 *     responses:
 *       200:
 *         description: Department updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'

 *       400:
 *         description: Bad request - validation error or duplicate value
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string

 *                 details:
 *                   type: string

 *                 field:
 *                   type: string

 *                 value:
 *                   type: string

 *                 suggestion:
 *                   type: string

 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Department not found or no changes made
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string

 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string

 *                 details:
 *                   type: string

 */

router.put('/department', departmentCt.updateDepartment);

/**
 * @swagger
 * /instituteDataRt/department:
 *   delete:
 *     summary: Delete department
 *     tags: [Departments]
 *     description: Delete a department from the system
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DepartmentDeleteRequest'

 *             deleteDependents: false
 *             transferTo: "507f1f77bcf86cd799439013"
 *             archive: false
 *     responses:
 *       200:
 *         description: Department deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string

 *                 deletedCount:
 *                   type: integer

 *       201:
 *         description: Dependencies found - requires action
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string

 *                 deleted:
 *                   type: array
 *                   items:
 *                     type: string

 *                 dependencies:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string

 *                       value:
 *                         type: string

 *                       dependsOn:
 *                         type: object
 *                         properties:
 *                           grades:
 *                             type: integer

 *                           subjects:
 *                             type: integer

 *                           MembersData:
 *                             type: integer

 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string

 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Department not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string

 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string

 *                 error:
 *                   type: string

 */

router.delete('/department', departmentCt.deleteDepartment);

module.exports = router;
