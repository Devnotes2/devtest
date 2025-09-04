const express = require('express');
const router = express.Router();

const gradesCt = require('../../../Controller/instituteData/aggregation/gradesCt');

/**
 * @swagger
 * components:
 *   schemas:
 *     Grade:
 *       type: object
 *       required:
 *         - gradeName
 *         - gradeCode
 *         - instituteId
 *         - departmentId
 *         - gradeDuration
 *       properties:
 *         gradeName:
 *           type: string
 *           description: Grade name (e.g., Grade 1, Grade 2, Class 10)
 *           example: "Grade 10"
 *         gradeCode:
 *           type: string
 *           description: Unique grade code
 *           example: "G10"
 *         instituteId:
 *           type: string
 *           description: Associated institute ID
 *           example: "507f1f77bcf86cd799439011"
 *         departmentId:
 *           type: string
 *           description: Associated department ID
 *           example: "507f1f77bcf86cd799439012"
 *         description:
 *           type: string
 *           description: Grade description
 *           example: "Tenth grade - Senior Secondary"
 *         gradeDuration:
 *           type: string
 *           description: Grade duration ID
 *           example: "507f1f77bcf86cd799439013"
 *         archive:
 *           type: boolean
 *           default: false
 *           description: Archive status
 *           example: false
 *     
 *     GradeResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *         data:
 *           type: object
 *           properties:
 *             grade:
 *               $ref: '#/components/schemas/Grade'
 *             id:
 *               type: string
 *               description: Created grade ID
 *     
 *     GradeListResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Grade'
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
 *     GradeUpdateRequest:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           required: true
 *           description: Grade ID to update
 *         name:
 *           type: string
 *           description: Updated grade name
 *         code:
 *           type: string
 *           description: Updated grade code
 *         description:
 *           type: string
 *           description: Updated description
 *         level:
 *           type: string
 *           enum: [primary, middle, secondary, senior_secondary]
 *           description: Updated educational level
 *         ageGroup:
 *           type: string
 *           description: Updated age group
 *         maxStudents:
 *           type: integer
 *           description: Updated maximum students
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended]
 *           description: Updated status
 *         order:
 *           type: integer
 *           description: Updated order
 *     
 *     GradeDeleteRequest:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           description: Grade ID to delete
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
 *   name: Grades
 *   description: Grade management endpoints within institutes
 */

/**
 * @swagger
 * /instituteAggreRt/gradesInInstitute:
 *   get:
 *     summary: Get grades in institute
 *     tags: [Grades]
 *     description: Get all grades within an institute with optional filtering and pagination
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
 *         description: Search grades by name or code
 *       - in: query
 *         name: instituteId
 *         schema:
 *           type: string
 *         description: Filter by institute
 *       - in: query
 *         name: academicYearId
 *         schema:
 *           type: string
 *         description: Filter by academic year
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [primary, middle, secondary, senior_secondary]
 *         description: Filter by educational level
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Grades retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GradeListResponse'
 *             example:
 *               message: "Grades retrieved successfully"
 *               data:
 *                 - id: "507f1f77bcf86cd799439011"
 *                   gradeName: "Grade 10"
 *                   gradeCode: "G10"
 *                   instituteId: "507f1f77bcf86cd799439012"
 *                   departmentId: "507f1f77bcf86cd799439013"
 *                   gradeDuration: "507f1f77bcf86cd799439014"
 *                   archive: false
 *               pagination:
 *                 currentPage: 1
 *                 totalPages: 2
 *                 totalItems: 15
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

router.get('/gradesInInstitute',gradesCt.gradesInInstituteAg);
// router.get('/gradesInInstitute/:_id?',gradesCt.gradesInInstitute);

/**
 * @swagger
 * /instituteAggreRt/gradesInInstitute:
 *   post:
 *     summary: Create a new grade in institute
 *     tags: [Grades]
 *     description: Create a new grade within an institute
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Grade'
 *           example:
 *             gradeName: "Grade 10"
 *             gradeCode: "G10"
 *             instituteId: "507f1f77bcf86cd799439011"
 *             departmentId: "507f1f77bcf86cd799439012"
 *             description: "Tenth grade - Senior Secondary"
 *             gradeDuration: "507f1f77bcf86cd799439013"
 *             order: 10
 *     responses:
 *       201:
 *         description: Grade created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GradeResponse'
 *             example:
 *               message: "Grade created successfully"
 *               data:
 *                 grade:
 *                   name: "Grade 10"
 *                   code: "G10"
 *                   instituteId: "507f1f77bcf86cd799439011"
 *                   academicYearId: "507f1f77bcf86cd799439012"
 *                   level: "senior_secondary"
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
 *         description: Grade with this code already exists in institute
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

router.post('/gradesInInstitute',gradesCt.createGradesInInstitute);

/**
 * @swagger
 * /instituteAggreRt/gradesInInstitute:
 *   put:
 *     summary: Update grade in institute
 *     tags: [Grades]
 *     description: Update existing grade information within an institute
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GradeUpdateRequest'
 *           example:
 *             id: "507f1f77bcf86cd799439011"
 *             name: "Grade 10 Updated"
 *             maxStudents: 45
 *             status: "active"
 *     responses:
 *       200:
 *         description: Grade updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               message: "Grade updated successfully"
 *               data:
 *                 updatedGrade:
 *                   id: "507f1f77bcf86cd799439011"
 *                   name: "Grade 10 Updated"
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
 *         description: Grade not found
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

router.put('/gradesInInstitute',gradesCt.updateGradesInInstitute);

/**
 * @swagger
 * /instituteAggreRt/gradesInInstitute:
 *   delete:
 *     summary: Delete grade in institute
 *     tags: [Grades]
 *     description: Delete a grade from an institute
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GradeDeleteRequest'
 *           example:
 *             id: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Grade deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               message: "Grade deleted successfully"
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
 *         description: Grade not found
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

router.delete('/gradesInInstitute',gradesCt.deleteGradesInInstitute);

module.exports = router;