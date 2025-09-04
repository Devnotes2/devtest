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
 *           description: Department name
 *           example: "Computer Science"
 *         departmentCode:
 *           type: string
 *           description: Unique department code
 *           example: "CS001"
 *         instituteId:
 *           type: string
 *           description: Associated institute ID
 *           example: "507f1f77bcf86cd799439011"
 *         description:
 *           type: string
 *           description: Department description
 *           example: "Computer Science and Engineering Department"
 *         archive:
 *           type: boolean
 *           default: false
 *           description: Archive status
 *           example: false
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
 *         departmentName:
 *           type: string
 *           description: Updated department name
 *         departmentCode:
 *           type: string
 *           description: Updated department code
 *         description:
 *           type: string
 *           description: Updated description
 *         archive:
 *           type: boolean
 *           description: Updated archive status
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
 *                   departmentName: "Computer Science"
 *                   departmentCode: "CS001"
 *                   instituteId: "507f1f77bcf86cd799439012"
 *                   archive: false
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
