const express = require('express');
const router = express.Router();

const gradeSectionsCt = require('../../../Controller/instituteData/aggregation/gradeSectionsCt');

/**
 * @swagger
 * components:
 *   schemas:
 *     GradeSection:
 *       type: object
 *       required:
 *         - name
 *         - code
 *         - instituteId
 *         - gradeId
 *       properties:
 *         name:
 *           type: string
 *           description: Grade section name (e.g., Section A, Section B)
 *           example: "Section A"
 *         code:
 *           type: string
 *           description: Unique grade section code
 *           example: "G10A"
 *         instituteId:
 *           type: string
 *           description: Associated institute ID
 *           example: "507f1f77bcf86cd799439011"
 *         gradeId:
 *           type: string
 *           description: Associated grade ID
 *           example: "507f1f77bcf86cd799439012"
 *         description:
 *           type: string
 *           description: Grade section description
 *           example: "Grade 10 Section A - Morning Shift"
 *         shift:
 *           type: string
 *           enum: [morning, afternoon, evening]
 *           description: Class shift timing
 *           example: "morning"
 *         maxStudents:
 *           type: integer
 *           description: Maximum number of students allowed
 *           example: 35
 *         classTeacher:
 *           type: string
 *           description: Class teacher ID
 *           example: "507f1f77bcf86cd799439013"
 *         roomNumber:
 *           type: string
 *           description: Classroom number
 *           example: "101"
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended]
 *           default: active
 *           description: Grade section status
 *           example: "active"
 *         order:
 *           type: integer
 *           description: Display order for sorting
 *           example: 1
 *     
 *     GradeSectionResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *         data:
 *           type: object
 *           properties:
 *             gradeSection:
 *               $ref: '#/components/schemas/GradeSection'
 *             id:
 *               type: string
 *               description: Created grade section ID
 *     
 *     GradeSectionListResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/GradeSection'
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
 *     GradeSectionUpdateRequest:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           required: true
 *           description: Grade section ID to update
 *         name:
 *           type: string
 *           description: Updated grade section name
 *         code:
 *           type: string
 *           description: Updated grade section code
 *         description:
 *           type: string
 *           description: Updated description
 *         shift:
 *           type: string
 *           enum: [morning, afternoon, evening]
 *           description: Updated shift
 *         maxStudents:
 *           type: integer
 *           description: Updated maximum students
 *         classTeacher:
 *           type: string
 *           description: Updated class teacher ID
 *         roomNumber:
 *           type: string
 *           description: Updated room number
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended]
 *           description: Updated status
 *         order:
 *           type: integer
 *           description: Updated order
 *     
 *     GradeSectionDeleteRequest:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           description: Grade section ID to delete
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
 *   name: Grade Sections
 *   description: Grade section management endpoints within institutes
 */

/**
 * @swagger
 * /instituteAggreRt/gradeSectionsInInstitute:
 *   get:
 *     summary: Get grade sections in institute
 *     tags: [Grade Sections]
 *     description: Get all grade sections within an institute with optional filtering and pagination
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
 *         description: Search grade sections by name or code
 *       - in: query
 *         name: instituteId
 *         schema:
 *           type: string
 *         description: Filter by institute
 *       - in: query
 *         name: gradeId
 *         schema:
 *           type: string
 *         description: Filter by grade
 *       - in: query
 *         name: shift
 *         schema:
 *           type: string
 *           enum: [morning, afternoon, evening]
 *         description: Filter by shift
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended]
 *         description: Filter by status
 *       - in: query
 *         name: classTeacher
 *         schema:
 *           type: string
 *         description: Filter by class teacher
 *     responses:
 *       200:
 *         description: Grade sections retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GradeSectionListResponse'
 *             example:
 *               message: "Grade sections retrieved successfully"
 *               data:
 *                 - id: "507f1f77bcf86cd799439011"
 *                   name: "Section A"
 *                   code: "G10A"
 *                   instituteId: "507f1f77bcf86cd799439012"
 *                   gradeId: "507f1f77bcf86cd799439013"
 *                   shift: "morning"
 *                   maxStudents: 35
 *                   status: "active"
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

router.get('/gradeSectionsInInstitute',gradeSectionsCt.gradeSectionsInInstituteAg);
// router.get('/gradeSectionsInInstitute/:_id?',gradeSectionsCt.gradeSectionsInInstitute);

/**
 * @swagger
 * /instituteAggreRt/gradeSectionsInInstitute:
 *   post:
 *     summary: Create a new grade section in institute
 *     tags: [Grade Sections]
 *     description: Create a new grade section within an institute
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GradeSection'
 *           example:
 *             name: "Section A"
 *             code: "G10A"
 *             instituteId: "507f1f77bcf86cd799439011"
 *             gradeId: "507f1f77bcf86cd799439012"
 *             description: "Grade 10 Section A - Morning Shift"
 *             shift: "morning"
 *             maxStudents: 35
 *             classTeacher: "507f1f77bcf86cd799439013"
 *             roomNumber: "101"
 *             status: "active"
 *             order: 1
 *     responses:
 *       201:
 *         description: Grade section created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GradeSectionResponse'
 *             example:
 *               message: "Grade section created successfully"
 *               data:
 *                 gradeSection:
 *                   name: "Section A"
 *                   code: "G10A"
 *                   instituteId: "507f1f77bcf86cd799439011"
 *                   gradeId: "507f1f77bcf86cd799439012"
 *                   shift: "morning"
 *                   maxStudents: 35
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
 *         description: Grade section with this code already exists in institute
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

router.post('/gradeSectionsInInstitute',gradeSectionsCt.createGradeSectionsInInstitute);

/**
 * @swagger
 * /instituteAggreRt/gradeSectionsInInstitute:
 *   put:
 *     summary: Update grade section in institute
 *     tags: [Grade Sections]
 *     description: Update existing grade section information within an institute
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GradeSectionUpdateRequest'
 *           example:
 *             id: "507f1f77bcf86cd799439011"
 *             name: "Section A Updated"
 *             maxStudents: 40
 *             status: "active"
 *     responses:
 *       200:
 *         description: Grade section updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               message: "Grade section updated successfully"
 *               data:
 *                 updatedGradeSection:
 *                   id: "507f1f77bcf86cd799439011"
 *                   name: "Section A Updated"
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
 *         description: Grade section not found
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

router.put('/gradeSectionsInInstitute',gradeSectionsCt.updateGradeSectionsInInstitute);

/**
 * @swagger
 * /instituteAggreRt/gradeSectionsInInstitute:
 *   delete:
 *     summary: Delete grade section in institute
 *     tags: [Grade Sections]
 *     description: Delete a grade section from an institute
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GradeSectionDeleteRequest'
 *           example:
 *             id: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Grade section deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               message: "Grade section deleted successfully"
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
 *         description: Grade section not found
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

router.delete('/gradeSectionsInInstitute',gradeSectionsCt.deleteGradeSectionsInInstitute);

module.exports = router;