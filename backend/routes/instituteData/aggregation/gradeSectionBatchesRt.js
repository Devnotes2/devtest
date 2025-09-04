const express = require('express');
const router = express.Router();

const gradeSectionBatchesCt = require('../../../Controller/instituteData/aggregation/gradeSectionBatchesCt');

/**
 * @swagger
 * components:
 *   schemas:
 *     GradeSectionBatch:
 *       type: object
 *       required:
 *         - name
 *         - code
 *         - instituteId
 *         - gradeId
 *         - gradeSectionId
 *         - gradeBatchId
 *       properties:
 *         name:
 *           type: string
 *           description: Grade section batch name (e.g., Section A 2023-24, Section B 2024-25)
 *           example: "Section A 2023-24"
 *         code:
 *           type: string
 *           description: Unique grade section batch code
 *           example: "G10A-2023"
 *         instituteId:
 *           type: string
 *           description: Associated institute ID
 *           example: "507f1f77bcf86cd799439011"
 *         gradeId:
 *           type: string
 *           description: Associated grade ID
 *           example: "507f1f77bcf86cd799439012"
 *         gradeSectionId:
 *           type: string
 *           description: Associated grade section ID
 *           example: "507f1f77bcf86cd799439013"
 *         gradeBatchId:
 *           type: string
 *           description: Associated grade batch ID
 *           example: "507f1f77bcf86cd799439014"
 *         description:
 *           type: string
 *           description: Grade section batch description
 *           example: "Grade 10 Section A Batch for Academic Year 2023-24"
 *         startDate:
 *           type: string
 *           format: date
 *           description: Batch start date
 *           example: "2023-06-01"
 *         endDate:
 *           type: string
 *           format: date
 *           description: Batch end date
 *           example: "2024-05-31"
 *         maxStudents:
 *           type: integer
 *           description: Maximum number of students allowed
 *           example: 35
 *         currentStudents:
 *           type: integer
 *           description: Current number of enrolled students
 *           example: 28
 *         classTeacher:
 *           type: string
 *           description: Class teacher ID
 *           example: "507f1f77bcf86cd799439015"
 *         roomNumber:
 *           type: string
 *           description: Classroom number
 *           example: "101"
 *         shift:
 *           type: string
 *           enum: [morning, afternoon, evening]
 *           description: Class shift timing
 *           example: "morning"
 *         status:
 *           type: string
 *           enum: [active, inactive, completed, suspended]
 *           default: active
 *           description: Grade section batch status
 *           example: "active"
 *         order:
 *           type: integer
 *           description: Display order for sorting
 *           example: 1
 *     
 *     GradeSectionBatchResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *         data:
 *           type: object
 *           properties:
 *             gradeSectionBatch:
 *               $ref: '#/components/schemas/GradeSectionBatch'
 *             id:
 *               type: string
 *               description: Created grade section batch ID
 *     
 *     GradeSectionBatchListResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/GradeSectionBatch'
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
 *     GradeSectionBatchUpdateRequest:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           required: true
 *           description: Grade section batch ID to update
 *         name:
 *           type: string
 *           description: Updated grade section batch name
 *         code:
 *           type: string
 *           description: Updated grade section batch code
 *         description:
 *           type: string
 *           description: Updated description
 *         startDate:
 *           type: string
 *           format: date
 *           description: Updated start date
 *         endDate:
 *           type: string
 *           format: date
 *           description: Updated end date
 *         maxStudents:
 *           type: integer
 *           description: Updated maximum students
 *         classTeacher:
 *           type: string
 *           description: Updated class teacher ID
 *         roomNumber:
 *           type: string
 *           description: Updated room number
 *         shift:
 *           type: string
 *           enum: [morning, afternoon, evening]
 *           description: Updated shift
 *         status:
 *           type: string
 *           enum: [active, inactive, completed, suspended]
 *           description: Updated status
 *         order:
 *           type: integer
 *           description: Updated order
 *     
 *     GradeSectionBatchDeleteRequest:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           description: Grade section batch ID to delete
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
 *   name: Grade Section Batches
 *   description: Grade section batch management endpoints within institutes
 */

/**
 * @swagger
 * /instituteAggreRt/gradeSectionBatchesInInstitute:
 *   get:
 *     summary: Get grade section batches in institute
 *     tags: [Grade Section Batches]
 *     description: Get all grade section batches within an institute with optional filtering and pagination
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
 *         description: Search grade section batches by name or code
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
 *         name: gradeSectionId
 *         schema:
 *           type: string
 *         description: Filter by grade section
 *       - in: query
 *         name: gradeBatchId
 *         schema:
 *           type: string
 *         description: Filter by grade batch
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
 *           enum: [active, inactive, completed, suspended]
 *         description: Filter by status
 *       - in: query
 *         name: classTeacher
 *         schema:
 *           type: string
 *         description: Filter by class teacher
 *     responses:
 *       200:
 *         description: Grade section batches retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GradeSectionBatchListResponse'
 *             example:
 *               message: "Grade section batches retrieved successfully"
 *               data:
 *                 - id: "507f1f77bcf86cd799439011"
 *                   name: "Section A 2023-24"
 *                   code: "G10A-2023"
 *                   instituteId: "507f1f77bcf86cd799439012"
 *                   gradeId: "507f1f77bcf86cd799439013"
 *                   gradeSectionId: "507f1f77bcf86cd799439014"
 *                   gradeBatchId: "507f1f77bcf86cd799439015"
 *                   shift: "morning"
 *                   status: "active"
 *                   maxStudents: 35
 *                   currentStudents: 28
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

router.get('/gradeSectionBatchesInInstitute',gradeSectionBatchesCt.gradeSectionBatchesInInstituteAg);

/**
 * @swagger
 * /instituteAggreRt/gradeSectionBatchesInInstitute:
 *   post:
 *     summary: Create a new grade section batch in institute
 *     tags: [Grade Section Batches]
 *     description: Create a new grade section batch within an institute
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GradeSectionBatch'
 *           example:
 *             name: "Section A 2023-24"
 *             code: "G10A-2023"
 *             instituteId: "507f1f77bcf86cd799439011"
 *             gradeId: "507f1f77bcf86cd799439012"
 *             gradeSectionId: "507f1f77bcf86cd799439013"
 *             gradeBatchId: "507f1f77bcf86cd799439014"
 *             description: "Grade 10 Section A Batch for Academic Year 2023-24"
 *             startDate: "2023-06-01"
 *             endDate: "2024-05-31"
 *             maxStudents: 35
 *             classTeacher: "507f1f77bcf86cd799439015"
 *             roomNumber: "101"
 *             shift: "morning"
 *             status: "active"
 *             order: 1
 *     responses:
 *       201:
 *         description: Grade section batch created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GradeSectionBatchResponse'
 *             example:
 *               message: "Grade section batch created successfully"
 *               data:
 *                 gradeSectionBatch:
 *                   name: "Section A 2023-24"
 *                   code: "G10A-2023"
 *                   instituteId: "507f1f77bcf86cd799439011"
 *                   gradeId: "507f1f77bcf86cd799439012"
 *                   gradeSectionId: "507f1f77bcf86cd799439013"
 *                   gradeBatchId: "507f1f77bcf86cd799439014"
 *                   shift: "morning"
 *                   status: "active"
 *                   maxStudents: 35
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
 *         description: Grade section batch with this code already exists in institute
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

router.post('/gradeSectionBatchesInInstitute',gradeSectionBatchesCt.createGradeSectionBatchesInInstitute);

/**
 * @swagger
 * /instituteAggreRt/gradeSectionBatchesInInstitute:
 *   put:
 *     summary: Update grade section batch in institute
 *     tags: [Grade Section Batches]
 *     description: Update existing grade section batch information within an institute
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GradeSectionBatchUpdateRequest'
 *           example:
 *             id: "507f1f77bcf86cd799439011"
 *             name: "Section A 2023-24 Updated"
 *             maxStudents: 40
 *             status: "active"
 *     responses:
 *       200:
 *         description: Grade section batch updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               message: "Grade section batch updated successfully"
 *               data:
 *                 updatedGradeSectionBatch:
 *                   id: "507f1f77bcf86cd799439011"
 *                   name: "Section A 2023-24 Updated"
 *                   maxStudents: 40
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
 *         description: Grade section batch not found
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

router.put('/gradeSectionBatchesInInstitute',gradeSectionBatchesCt.updateGradeSectionBatchesInInstitute);

/**
 * @swagger
 * /instituteAggreRt/gradeSectionBatchesInInstitute:
 *   delete:
 *     summary: Delete grade section batch in institute
 *     tags: [Grade Section Batches]
 *     description: Delete a grade section batch from an institute
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GradeSectionBatchDeleteRequest'
 *           example:
 *             id: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Grade section batch deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               message: "Grade section batch deleted successfully"
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
 *         description: Grade section batch not found
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

router.delete('/gradeSectionBatchesInInstitute',gradeSectionBatchesCt.deleteGradeSectionBatchesInInstitute);

module.exports = router;