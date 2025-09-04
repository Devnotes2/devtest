const express = require('express');
const router = express.Router();

const departmentCt = require('../../Controller/instituteData/departmentCt');

/**
 * @swagger
 * components:
 *   schemas:
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
 *           example: "Computer Science"
 *         departmentCode:
 *           type: string
 *           description: Unique department code (REQUIRED)
 *           example: "CS001"
 *         instituteId:
 *           type: string
 *           description: Associated institute ID (REQUIRED)
 *           example: "507f1f77bcf86cd799439011"
 *         description:
 *           type: string
 *           description: Department description (OPTIONAL)
 *           example: "Computer Science and Engineering Department"
 *         archive:
 *           type: boolean
 *           default: false
 *           description: Archive status (OPTIONAL - defaults to false)
 *           example: false
 *     
 *     DepartmentResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *           example: "Department added successfully!"
 *         data:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: Created department ID
 *               example: "507f1f77bcf86cd799439011"
 *             instituteId:
 *               type: string
 *               description: Associated institute ID
 *               example: "507f1f77bcf86cd799439012"
 *             departmentName:
 *               type: string
 *               description: Department name
 *               example: "Computer Science"
 *             departmentCode:
 *               type: string
 *               description: Department code
 *               example: "CS001"
 *             description:
 *               type: string
 *               description: Department description
 *               example: "Computer Science and Engineering Department"
 *             archive:
 *               type: boolean
 *               description: Archive status
 *               example: false
 *             createdAt:
 *               type: string
 *               format: date-time
 *               description: Creation timestamp
 *             updatedAt:
 *               type: string
 *               format: date-time
 *               description: Last update timestamp
 *     
 *     DepartmentListResponse:
 *       type: object
 *       properties:
 *         count:
 *           type: integer
 *           description: Number of items in current page
 *           example: 10
 *         filteredDocs:
 *           type: integer
 *           description: Total number of filtered documents
 *           example: 25
 *         totalDocs:
 *           type: integer
 *           description: Total number of documents in collection
 *           example: 100
 *         data:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 description: Department ID
 *                 example: "507f1f77bcf86cd799439011"
 *               instituteId:
 *                 type: string
 *                 description: Associated institute ID
 *                 example: "507f1f77bcf86cd799439012"
 *               departmentName:
 *                 type: string
 *                 description: Department name
 *                 example: "Computer Science"
 *               departmentCode:
 *                 type: string
 *                 description: Department code
 *                 example: "CS001"
 *               description:
 *                 type: string
 *                 description: Department description
 *                 example: "Computer Science and Engineering Department"
 *               archive:
 *                 type: boolean
 *                 description: Archive status
 *                 example: false
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *                 description: Creation timestamp
 *               updatedAt:
 *                 type: string
 *                 format: date-time
 *                 description: Last update timestamp
 *               instituteName:
 *                 type: string
 *                 description: Institute name (from lookup)
 *                 example: "ABC International School"
 *     
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
 *           example: "507f1f77bcf86cd799439011"
 *         updatedData:
 *           type: object
 *           description: Fields to update (all fields are OPTIONAL for updates)
 *           properties:
 *             departmentName:
 *               type: string
 *               description: Updated department name (OPTIONAL)
 *               example: "Computer Science Updated"
 *             departmentCode:
 *               type: string
 *               description: Updated department code (OPTIONAL)
 *               example: "CS001-UPDATED"
 *             description:
 *               type: string
 *               description: Updated description (OPTIONAL)
 *               example: "Updated Computer Science Department"
 *             archive:
 *               type: boolean
 *               description: Updated archive status (OPTIONAL)
 *               example: false
 *     
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
 *           example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *         deleteDependents:
 *           type: boolean
 *           description: Whether to delete dependent records (grades, subjects, members) (OPTIONAL)
 *           example: false
 *         transferTo:
 *           type: string
 *           description: Department ID to transfer dependents to (OPTIONAL - alternative to deleteDependents)
 *           example: "507f1f77bcf86cd799439013"
 *         archive:
 *           type: boolean
 *           description: Archive/unarchive departments instead of deleting (OPTIONAL)
 *           example: true
 *     
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *         data:
 *           type: object
 *           description: Response data
 *     
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
 *       
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
 *         example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
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
 *         example: "507f1f77bcf86cd799439011"
 *       - in: query
 *         name: departmentName
 *         schema:
 *           type: string
 *         description: Filter by department name
 *         example: "Computer Science"
 *       - in: query
 *         name: departmentCode
 *         schema:
 *           type: string
 *         description: Filter by department code
 *         example: "CS001"
 *       - in: query
 *         name: archive
 *         schema:
 *           type: boolean
 *         description: Filter by archive status
 *         example: false
 *       - in: query
 *         name: validate
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Validate if departmentName exists (requires departmentName parameter)
 *       - in: query
 *         name: dropdown
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Return simplified data for dropdown (only _id and departmentName)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by
 *         example: "departmentName"
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Departments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DepartmentListResponse'
 *             example:
 *               count: 2
 *               filteredDocs: 25
 *               totalDocs: 100
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   instituteId: "507f1f77bcf86cd799439012"
 *                   departmentName: "Computer Science"
 *                   departmentCode: "CS001"
 *                   description: "Computer Science and Engineering Department"
 *                   archive: false
 *                   createdAt: "2023-01-01T00:00:00.000Z"
 *                   updatedAt: "2023-01-01T00:00:00.000Z"
 *                   instituteName: "ABC International School"
 *                 - _id: "507f1f77bcf86cd799439013"
 *                   instituteId: "507f1f77bcf86cd799439012"
 *                   departmentName: "Mathematics"
 *                   departmentCode: "MATH001"
 *                   description: "Mathematics Department"
 *                   archive: false
 *                   createdAt: "2023-01-01T00:00:00.000Z"
 *                   updatedAt: "2023-01-01T00:00:00.000Z"
 *                   instituteName: "ABC International School"
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.get('/department', departmentCt.getDepartment);

/**
 * @swagger
 * /instituteDataRt/department/dropdown:
 *   get:
 *     summary: Get departments for dropdown (simplified data)
 *     tags: [Departments]
 *     description: Get departments with only _id and departmentName for dropdown usage
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: instituteId
 *         schema:
 *           type: string
 *         description: Filter by institute ID
 *         example: "507f1f77bcf86cd799439011"
 *       - in: query
 *         name: archive
 *         schema:
 *           type: boolean
 *         description: Filter by archive status
 *         example: false
 *     responses:
 *       200:
 *         description: Departments retrieved successfully for dropdown
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "507f1f77bcf86cd799439011"
 *                       departmentName:
 *                         type: string
 *                         example: "Computer Science"
 *             example:
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   departmentName: "Computer Science"
 *                 - _id: "507f1f77bcf86cd799439012"
 *                   departmentName: "Mathematics"
 */

/**
 * @swagger
 * /instituteDataRt/department/validate:
 *   get:
 *     summary: Validate department name existence
 *     tags: [Departments]
 *     description: Check if a department name already exists in the system
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: departmentName
 *         required: true
 *         schema:
 *           type: string
 *         description: Department name to validate
 *         example: "Computer Science"
 *       - in: query
 *         name: instituteId
 *         schema:
 *           type: string
 *         description: Institute ID to check within (optional)
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Validation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "already present"
 *                 exists:
 *                   type: boolean
 *                   example: true
 *             examples:
 *               exists:
 *                 summary: Department name exists
 *                 value:
 *                   message: "already present"
 *                   exists: true
 *               not_exists:
 *                 summary: Department name available
 *                 value:
 *                   message: "not present"
 *                   exists: false
 */

/**
 * @swagger
 * /instituteDataRt/department/aggregate:
 *   get:
 *     summary: Get departments with aggregation (with institute lookup)
 *     tags: [Departments]
 *     description: Get departments using aggregation pipeline with institute name lookup
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
 *         name: instituteId
 *         schema:
 *           type: string
 *         description: Filter by institute ID
 *         example: "507f1f77bcf86cd799439011"
 *       - in: query
 *         name: departmentName
 *         schema:
 *           type: string
 *         description: Filter by department name
 *         example: "Computer Science"
 *     responses:
 *       200:
 *         description: Departments retrieved with aggregation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DepartmentListResponse'
 *             example:
 *               count: 2
 *               filteredDocs: 25
 *               totalDocs: 100
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   instituteId: "507f1f77bcf86cd799439012"
 *                   departmentName: "Computer Science"
 *                   departmentCode: "CS001"
 *                   description: "Computer Science Department"
 *                   archive: false
 *                   createdAt: "2023-01-01T00:00:00.000Z"
 *                   updatedAt: "2023-01-01T00:00:00.000Z"
 *                   instituteName: "ABC International School"
 */

/**
 * @swagger
 * /instituteDataRt/department/simple:
 *   get:
 *     summary: Get departments with simple find (no aggregation)
 *     tags: [Departments]
 *     description: Get departments using simple MongoDB find operation (faster, no lookups)
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
 *         name: instituteId
 *         schema:
 *           type: string
 *         description: Filter by institute ID
 *         example: "507f1f77bcf86cd799439011"
 *       - in: query
 *         name: archive
 *         schema:
 *           type: boolean
 *         description: Filter by archive status
 *         example: false
 *     responses:
 *       200:
 *         description: Departments retrieved with simple find
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 2
 *                 filteredDocs:
 *                   type: integer
 *                   example: 25
 *                 totalDocs:
 *                   type: integer
 *                   example: 100
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "507f1f77bcf86cd799439011"
 *                       instituteId:
 *                         type: string
 *                         example: "507f1f77bcf86cd799439012"
 *                       departmentName:
 *                         type: string
 *                         example: "Computer Science"
 *                       departmentCode:
 *                         type: string
 *                         example: "CS001"
 *                       description:
 *                         type: string
 *                         example: "Computer Science Department"
 *                       archive:
 *                         type: boolean
 *                         example: false
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-01-01T00:00:00.000Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-01-01T00:00:00.000Z"
 *             example:
 *               count: 2
 *               filteredDocs: 25
 *               totalDocs: 100
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   instituteId: "507f1f77bcf86cd799439012"
 *                   departmentName: "Computer Science"
 *                   departmentCode: "CS001"
 *                   description: "Computer Science Department"
 *                   archive: false
 *                   createdAt: "2023-01-01T00:00:00.000Z"
 *                   updatedAt: "2023-01-01T00:00:00.000Z"
 */

/**
 * @swagger
 * /instituteDataRt/department/by-ids:
 *   get:
 *     summary: Get specific departments by IDs
 *     tags: [Departments]
 *     description: Get specific departments by providing an array of department IDs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ids
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: false
 *         description: Array of department IDs to fetch
 *         example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *       - in: query
 *         name: aggregate
 *         schema:
 *           type: string
 *           enum: [true, false]
 *           default: true
 *         description: Use aggregation pipeline (true) or simple find (false)
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
 *     responses:
 *       200:
 *         description: Specific departments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DepartmentListResponse'
 *             example:
 *               count: 2
 *               filteredDocs: 2
 *               totalDocs: 100
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   instituteId: "507f1f77bcf86cd799439012"
 *                   departmentName: "Computer Science"
 *                   departmentCode: "CS001"
 *                   description: "Computer Science Department"
 *                   archive: false
 *                   createdAt: "2023-01-01T00:00:00.000Z"
 *                   updatedAt: "2023-01-01T00:00:00.000Z"
 *                   instituteName: "ABC International School"
 *                 - _id: "507f1f77bcf86cd799439012"
 *                   instituteId: "507f1f77bcf86cd799439012"
 *                   departmentName: "Mathematics"
 *                   departmentCode: "MATH001"
 *                   description: "Mathematics Department"
 *                   archive: false
 *                   createdAt: "2023-01-01T00:00:00.000Z"
 *                   updatedAt: "2023-01-01T00:00:00.000Z"
 *                   instituteName: "ABC International School"
 */

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
 *           example:
 *             departmentName: "Computer Science"
 *             departmentCode: "CS001"
 *             instituteId: "507f1f77bcf86cd799439011"
 *             description: "Computer Science and Engineering Department"
 *     responses:
 *       201:
 *         description: Department created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DepartmentResponse'
 *             example:
 *               message: "Department added successfully!"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 instituteId: "507f1f77bcf86cd799439012"
 *                 departmentName: "Computer Science"
 *                 departmentCode: "CS001"
 *                 description: "Computer Science and Engineering Department"
 *                 archive: false
 *                 createdAt: "2023-01-01T00:00:00.000Z"
 *                 updatedAt: "2023-01-01T00:00:00.000Z"
 *       400:
 *         description: Bad request - validation error or duplicate value
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Duplicate value"
 *                 details:
 *                   type: string
 *                   example: "Department Name 'Computer Science' already exists in this institute"
 *                 field:
 *                   type: string
 *                   example: "departmentName"
 *                 value:
 *                   type: string
 *                   example: "Computer Science"
 *                 suggestion:
 *                   type: string
 *                   example: "Department name must be unique within this institute"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to add department"
 *                 details:
 *                   type: string
 *                   example: "Database connection error"
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
 *           example:
 *             _id: "507f1f77bcf86cd799439011"
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
 *             example:
 *               message: "Department updated successfully"
 *       400:
 *         description: Bad request - validation error or duplicate value
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Duplicate value"
 *                 details:
 *                   type: string
 *                   example: "Department name 'Computer Science Updated' already exists in this institute"
 *                 field:
 *                   type: string
 *                   example: "departmentName"
 *                 value:
 *                   type: string
 *                   example: "Computer Science Updated"
 *                 suggestion:
 *                   type: string
 *                   example: "Department names must be unique within each institute"
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
 *                   example: "No matching department found or values are unchanged"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to update department"
 *                 details:
 *                   type: string
 *                   example: "Database connection error"
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
 *           example:
 *             ids: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
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
 *                   example: "Department(s) deleted successfully"
 *                 deletedCount:
 *                   type: integer
 *                   example: 2
 *       201:
 *         description: Dependencies found - requires action
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Dependency summary"
 *                 deleted:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["507f1f77bcf86cd799439011"]
 *                 dependencies:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "507f1f77bcf86cd799439012"
 *                       value:
 *                         type: string
 *                         example: "Computer Science"
 *                       dependsOn:
 *                         type: object
 *                         properties:
 *                           grades:
 *                             type: integer
 *                             example: 5
 *                           subjects:
 *                             type: integer
 *                             example: 10
 *                           MembersData:
 *                             type: integer
 *                             example: 25
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Department ID(s) required"
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
 *                   example: "No matching departments found for deletion"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */

router.delete('/department', departmentCt.deleteDepartment);

module.exports = router;
