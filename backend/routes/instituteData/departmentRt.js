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
 *         - name
 *         - code
 *         - instituteId
 *       properties:
 *         name:
 *           type: string
 *           description: Department name
 *           example: "Computer Science"
 *         code:
 *           type: string
 *           description: Unique department code
 *           example: "CS"
 *         instituteId:
 *           type: string
 *           description: Associated institute ID
 *           example: "507f1f77bcf86cd799439011"
 *         description:
 *           type: string
 *           description: Department description
 *           example: "Computer Science and Engineering Department"
 *         headOfDepartment:
 *           type: string
 *           description: Head of department ID
 *           example: "507f1f77bcf86cd799439012"
 *         contactEmail:
 *           type: string
 *           format: email
 *           description: Department contact email
 *           example: "cs@institute.edu"
 *         contactPhone:
 *           type: string
 *           description: Department contact phone
 *           example: "+1-555-123-4567"
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended]
 *           default: active
 *           description: Department status
 *           example: "active"
 *         establishedDate:
 *           type: string
 *           format: date
 *           description: When department was established
 *           example: "2020-01-01"
 *     
 *     DepartmentResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *         data:
 *           type: object
 *           properties:
 *             department:
 *               $ref: '#/components/schemas/Department'
 *             id:
 *               type: string
 *               description: Created department ID
 *     
 *     DepartmentListResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Department'
 *         pagination:
 *           type: object
 *           properties:
 *             currentPage:
 *               type: integer
 *             totalPages:
 *               type: integer
 *             totalItems:
 *               type: integer
 *             hasNextPage:
 *               type: boolean
 *             hasPrevPage:
 *               type: boolean
 *     
 *     DepartmentUpdateRequest:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           required: true
 *           description: Department ID to update
 *         name:
 *           type: string
 *           description: Updated department name
 *         code:
 *           type: string
 *           description: Updated department code
 *         description:
 *           type: string
 *           description: Updated description
 *         headOfDepartment:
 *           type: string
 *           description: Updated head of department ID
 *         contactEmail:
 *           type: string
 *           format: email
 *           description: Updated contact email
 *         contactPhone:
 *           type: string
 *           description: Updated contact phone
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended]
 *           description: Updated status
 *         establishedDate:
 *           type: string
 *           format: date
 *           description: Updated established date
 *     
 *     DepartmentDeleteRequest:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           description: Department ID to delete
 *           example: "507f1f77bcf86cd799439011"
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
 *     summary: Get departments
 *     tags: [Departments]
 *     description: Get all departments with optional filtering and pagination
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search departments by name or code
 *       - in: query
 *         name: instituteId
 *         schema:
 *           type: string
 *         description: Filter by institute
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended]
 *         description: Filter by status
 *       - in: query
 *         name: headOfDepartment
 *         schema:
 *           type: string
 *         description: Filter by head of department
 *     responses:
 *       200:
 *         description: Departments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DepartmentListResponse'
 *             example:
 *               message: "Departments retrieved successfully"
 *               data:
 *                 - id: "507f1f77bcf86cd799439011"
 *                   name: "Computer Science"
 *                   code: "CS"
 *                   instituteId: "507f1f77bcf86cd799439012"
 *                   status: "active"
 *               pagination:
 *                 currentPage: 1
 *                 totalPages: 3
 *                 totalItems: 25
 *                 hasNextPage: true
 *                 hasPrevPage: false
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
 *           example:
 *             name: "Computer Science"
 *             code: "CS"
 *             instituteId: "507f1f77bcf86cd799439011"
 *             description: "Computer Science and Engineering Department"
 *             headOfDepartment: "507f1f77bcf86cd799439012"
 *             contactEmail: "cs@institute.edu"
 *             contactPhone: "+1-555-123-4567"
 *             status: "active"
 *             establishedDate: "2020-01-01"
 *     responses:
 *       201:
 *         description: Department created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DepartmentResponse'
 *             example:
 *               message: "Department created successfully"
 *               data:
 *                 department:
 *                   name: "Computer Science"
 *                   code: "CS"
 *                   instituteId: "507f1f77bcf86cd799439011"
 *                   status: "active"
 *                 id: "507f1f77bcf86cd799439011"
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
 *       409:
 *         description: Department with this code already exists
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
 *             id: "507f1f77bcf86cd799439011"
 *             name: "Computer Science Updated"
 *             contactEmail: "cs.updated@institute.edu"
 *             status: "active"
 *     responses:
 *       200:
 *         description: Department updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               message: "Department updated successfully"
 *               data:
 *                 updatedDepartment:
 *                   id: "507f1f77bcf86cd799439011"
 *                   name: "Computer Science Updated"
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
 *       404:
 *         description: Department not found
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
 *             id: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Department deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               message: "Department deleted successfully"
 *               data: {}
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
 *       404:
 *         description: Department not found
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

router.delete('/department', departmentCt.deleteDepartment);

module.exports = router;
