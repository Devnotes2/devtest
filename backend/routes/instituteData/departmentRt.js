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
 *     DepartmentResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message

 *         data:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: Created department ID

 *             instituteId:
 *               type: string
 *               description: Associated institute ID

 *             departmentName:
 *               type: string
 *               description: Department name

 *             departmentCode:
 *               type: string
 *               description: Department code

 *             description:
 *               type: string
 *               description: Department description

 *             archive:
 *               type: boolean
 *               description: Archive status

 *             createdAt:
 *               type: string
 *               format: date-time
 *               description: Creation timestamp
 *             updatedAt:
 *               type: string
 *               format: date-time
 *               description: Last update timestamp
 *     DepartmentListResponse:
 *       type: object
 *       properties:
 *         count:
 *           type: integer
 *           description: Number of items in current page

 *         filteredDocs:
 *           type: integer
 *           description: Total number of filtered documents

 *         totalDocs:
 *           type: integer
 *           description: Total number of documents in collection

 *         data:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 description: Department ID

 *               instituteId:
 *                 type: string
 *                 description: Associated institute ID

 *               departmentName:
 *                 type: string
 *                 description: Department name

 *               departmentCode:
 *                 type: string
 *                 description: Department code

 *               description:
 *                 type: string
 *                 description: Department description

 *               archive:
 *                 type: boolean
 *                 description: Archive status

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
 *         description: Department created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DepartmentResponse'

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
