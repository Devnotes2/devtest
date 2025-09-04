const express = require('express');
const router = express.Router();

const subjectsCt = require('../../../Controller/instituteData/aggregation/subjectsCt');

/**
 * @swagger
 * components:
 *   schemas:
 *     Subject:
 *       type: object
 *       required:
 *         - subject
 *         - subjectCode
 *         - instituteId
 *         - departmentId
 *         - gradeId
 *         - subjectTypeId
 *         - learningTypeId
 *         - description
 *       properties:
 *         subject:
 *           type: string
 *           description: Subject name (e.g., Mathematics, English, Science)
 *           example: "Mathematics"
 *         subjectCode:
 *           type: string
 *           description: Unique subject code
 *           example: "MATH101"
 *         instituteId:
 *           type: string
 *           description: Associated institute ID
 *           example: "507f1f77bcf86cd799439011"
 *         departmentId:
 *           type: string
 *           description: Associated department ID
 *           example: "507f1f77bcf86cd799439012"
 *         gradeId:
 *           type: string
 *           description: Associated grade ID
 *           example: "507f1f77bcf86cd799439013"
 *         subjectTypeId:
 *           type: string
 *           description: Subject type ID
 *           example: "507f1f77bcf86cd799439014"
 *         learningTypeId:
 *           type: string
 *           description: Learning type ID
 *           example: "507f1f77bcf86cd799439015"
 *         description:
 *           type: string
 *           description: Subject description
 *           example: "Advanced Mathematics including Algebra and Calculus"
 *     
 *     SubjectResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *         data:
 *           type: object
 *           properties:
 *             subject:
 *               $ref: '#/components/schemas/Subject'
 *             id:
 *               type: string
 *               description: Created subject ID
 *     
 *     SubjectListResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Subject'
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
 *     SubjectUpdateRequest:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           required: true
 *           description: Subject ID to update
 *         name:
 *           type: string
 *           description: Updated subject name
 *         code:
 *           type: string
 *           description: Updated subject code
 *         description:
 *           type: string
 *           description: Updated description
 *         credits:
 *           type: number
 *           description: Updated credits
 *         category:
 *           type: string
 *           enum: [core, elective, optional, practical]
 *           description: Updated category
 *         difficulty:
 *           type: string
 *           enum: [beginner, intermediate, advanced, expert]
 *           description: Updated difficulty level
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
 *     SubjectDeleteRequest:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           description: Subject ID to delete
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
 *   name: Subjects
 *   description: Subject management endpoints within institutes
 */

/**
 * @swagger
 * /instituteAggreRt/subjectsInInstitute:
 *   get:
 *     summary: Get subjects in institute
 *     tags: [Subjects]
 *     description: Get all subjects within an institute with optional filtering and pagination
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
 *         description: Search subjects by name or code
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
 *         name: category
 *         schema:
 *           type: string
 *           enum: [core, elective, optional, practical]
 *         description: Filter by subject category
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced, expert]
 *         description: Filter by difficulty level
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Subjects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubjectListResponse'
 *             example:
 *               message: "Subjects retrieved successfully"
 *               data:
 *                 - id: "507f1f77bcf86cd799439011"
 *                   name: "Mathematics"
 *                   code: "MATH"
 *                   instituteId: "507f1f77bcf86cd799439012"
 *                   gradeId: "507f1f77bcf86cd799439013"
 *                   category: "core"
 *                   difficulty: "intermediate"
 *                   credits: 4
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

router.get('/subjectsInInstitute',subjectsCt.subjectsInInstituteAg);

/**
 * @swagger
 * /instituteAggreRt/subjectsInInstitute:
 *   post:
 *     summary: Create a new subject in institute
 *     tags: [Subjects]
 *     description: Create a new subject within an institute
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Subject'
 *           example:
 *             subject: "Mathematics"
 *             subjectCode: "MATH101"
 *             instituteId: "507f1f77bcf86cd799439011"
 *             departmentId: "507f1f77bcf86cd799439012"
 *             gradeId: "507f1f77bcf86cd799439013"
 *             subjectTypeId: "507f1f77bcf86cd799439014"
 *             learningTypeId: "507f1f77bcf86cd799439015"
 *             description: "Advanced Mathematics including Algebra and Calculus"
 *     responses:
 *       201:
 *         description: Subject created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubjectResponse'
 *             example:
 *               message: "Subject created successfully"
 *               data:
 *                 subject:
 *                   name: "Mathematics"
 *                   code: "MATH"
 *                   instituteId: "507f1f77bcf86cd799439011"
 *                   gradeId: "507f1f77bcf86cd799439012"
 *                   category: "core"
 *                   difficulty: "intermediate"
 *                   credits: 4
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
 *         description: Subject with this code already exists in institute
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

router.post('/subjectsInInstitute',subjectsCt.createSubjectsInInstitute);

/**
 * @swagger
 * /instituteAggreRt/subjectsInInstitute:
 *   put:
 *     summary: Update subject in institute
 *     tags: [Subjects]
 *     description: Update existing subject information within an institute
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubjectUpdateRequest'
 *           example:
 *             id: "507f1f77bcf86cd799439011"
 *             name: "Mathematics Updated"
 *             credits: 5
 *             difficulty: "advanced"
 *             status: "active"
 *     responses:
 *       200:
 *         description: Subject updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               message: "Subject updated successfully"
 *               data:
 *                 updatedSubject:
 *                   id: "507f1f77bcf86cd799439011"
 *                   name: "Mathematics Updated"
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
 *         description: Subject not found
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

router.put('/subjectsInInstitute',subjectsCt.updateSubjectsInInstitute);

/**
 * @swagger
 * /instituteAggreRt/subjectsInInstitute:
 *   delete:
 *     summary: Delete subject in institute
 *     tags: [Subjects]
 *     description: Delete a subject from an institute
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubjectDeleteRequest'
 *           example:
 *             id: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Subject deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               message: "Subject deleted successfully"
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
 *         description: Subject not found
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

router.delete('/subjectsInInstitute',subjectsCt.deleteSubjectsInInstitute);

module.exports = router;