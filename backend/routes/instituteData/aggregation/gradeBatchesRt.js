const express = require('express');
const router = express.Router();

const gradeBatchesCt = require('../../../Controller/instituteData/aggregation/gradeBatchesCt');

/**
 * @swagger
 * components:
 *   schemas:
 *     GradeBatch:
 *       type: object
 *       required:
 *         - batch
 *         - instituteId
 *         - departmentId
 *         - gradeId
 *       properties:
 *         batch:
 *           type: string
 *           description: Grade batch name (e.g., 2023-24, 2024-25)
 *           example: "2023-24"
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
 *         description:
 *           type: string
 *           description: Grade batch description
 *           example: "Grade 10 Batch for Academic Year 2023-24"
 *         archive:
 *           type: boolean
 *           default: false
 *           description: Archive status
 *           example: false
 *     
 *     GradeBatchResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *         data:
 *           type: object
 *           properties:
 *             gradeBatch:
 *               $ref: '#/components/schemas/GradeBatch'
 *             id:
 *               type: string
 *               description: Created grade batch ID
 *     
 *     GradeBatchListResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/GradeBatch'
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
 *     GradeBatchUpdateRequest:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           required: true
 *           description: Grade batch ID to update
 *         name:
 *           type: string
 *           description: Updated grade batch name
 *         code:
 *           type: string
 *           description: Updated grade batch code
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
 *         status:
 *           type: string
 *           enum: [active, inactive, completed, suspended]
 *           description: Updated status
 *         order:
 *           type: integer
 *           description: Updated order
 *     
 *     GradeBatchDeleteRequest:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           description: Grade batch ID to delete
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
 *   name: Grade Batches
 *   description: Grade batch management endpoints within institutes
 */

/**
 * @swagger
 * /instituteAggreRt/gradeBatchesInInstitute:
 *   get:
 *     summary: Get grade batches in institute
 *     tags: [Grade Batches]
 *     description: Get all grade batches within an institute with optional filtering and pagination
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
 *         description: Search grade batches by name or code
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
 *         name: academicYearId
 *         schema:
 *           type: string
 *         description: Filter by academic year
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, completed, suspended]
 *         description: Filter by status
 *       - in: query
 *         name: year
 *         schema:
 *           type: string
 *         description: Filter by year (e.g., "2023-24")
 *     responses:
 *       200:
 *         description: Grade batches retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GradeBatchListResponse'
 *             example:
 *               message: "Grade batches retrieved successfully"
 *               data:
 *                 - id: "507f1f77bcf86cd799439011"
 *                   batch: "2023-24"
 *                   instituteId: "507f1f77bcf86cd799439012"
 *                   departmentId: "507f1f77bcf86cd799439013"
 *                   gradeId: "507f1f77bcf86cd799439014"
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

router.get('/gradeBatchesInInstitute',gradeBatchesCt.gradeBatchesInInstituteAg);

/**
 * @swagger
 * /instituteAggreRt/gradeBatchesInInstitute:
 *   post:
 *     summary: Create a new grade batch in institute
 *     tags: [Grade Batches]
 *     description: Create a new grade batch within an institute
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GradeBatch'
 *           example:
 *             batch: "2023-24"
 *             instituteId: "507f1f77bcf86cd799439011"
 *             departmentId: "507f1f77bcf86cd799439012"
 *             gradeId: "507f1f77bcf86cd799439013"
 *             description: "Grade 10 Batch for Academic Year 2023-24"
 *     responses:
 *       201:
 *         description: Grade batch created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GradeBatchResponse'
 *             example:
 *               message: "Grade batch created successfully"
 *               data:
 *                 gradeBatch:
 *                   name: "2023-24"
 *                   code: "G10-2023"
 *                   instituteId: "507f1f77bcf86cd799439011"
 *                   gradeId: "507f1f77bcf86cd799439012"
 *                   academicYearId: "507f1f77bcf86cd799439013"
 *                   status: "active"
 *                   maxStudents: 120
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
 *         description: Grade batch with this code already exists in institute
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

router.post('/gradeBatchesInInstitute',gradeBatchesCt.createGradeBatchesInInstitute);

/**
 * @swagger
 * /instituteAggreRt/gradeBatchesInInstitute:
 *   put:
 *     summary: Update grade batch in institute
 *     tags: [Grade Batches]
 *     description: Update existing grade batch information within an institute
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GradeBatchUpdateRequest'
 *           example:
 *             id: "507f1f77bcf86cd799439011"
 *             name: "2023-24 Updated"
 *             maxStudents: 150
 *             status: "active"
 *     responses:
 *       200:
 *         description: Grade batch updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               message: "Grade batch updated successfully"
 *               data:
 *                 updatedGradeBatch:
 *                   id: "507f1f77bcf86cd799439011"
 *                   name: "2023-24 Updated"
 *                   maxStudents: 150
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
 *         description: Grade batch not found
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

router.put('/gradeBatchesInInstitute',gradeBatchesCt.updateGradeBatchesInInstitute);

/**
 * @swagger
 * /instituteAggreRt/gradeBatchesInInstitute:
 *   delete:
 *     summary: Delete grade batch in institute
 *     tags: [Grade Batches]
 *     description: Delete a grade batch from an institute
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GradeBatchDeleteRequest'
 *           example:
 *             id: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Grade batch deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               message: "Grade batch deleted successfully"
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
 *         description: Grade batch not found
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

router.delete('/gradeBatchesInInstitute',gradeBatchesCt.deleteGradeBatchesInInstitute);

module.exports = router;