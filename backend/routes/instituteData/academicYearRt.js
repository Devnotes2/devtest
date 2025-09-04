const express = require('express');
const router = express.Router();

const academicYearCt = require('../../Controller/instituteData/academicYearCt');

/**
 * @swagger
 * components:
 *   schemas:
 *     AcademicYear:
 *       type: object
 *       required:
 *         - name
 *         - startDate
 *         - endDate
 *         - instituteId
 *       properties:
 *         name:
 *           type: string
 *           description: Academic year name (e.g., 2024-2025)
 *           example: "2024-2025"
 *         startDate:
 *           type: string
 *           format: date
 *           description: Academic year start date
 *           example: "2024-06-01"
 *         endDate:
 *           type: string
 *           format: date
 *           description: Academic year end date
 *           example: "2025-05-31"
 *         instituteId:
 *           type: string
 *           description: Associated institute ID
 *           example: "507f1f77bcf86cd799439011"
 *         status:
 *           type: string
 *           enum: [active, inactive, upcoming]
 *           default: active
 *           description: Academic year status
 *           example: "active"
 *         description:
 *           type: string
 *           description: Academic year description
 *           example: "Academic year 2024-2025"
 *         isCurrent:
 *           type: boolean
 *           default: false
 *           description: Whether this is the current academic year
 *           example: true
 *     
 *     AcademicYearResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *         data:
 *           type: object
 *           properties:
 *             academicYear:
 *               $ref: '#/components/schemas/AcademicYear'
 *             id:
 *               type: string
 *               description: Created academic year ID
 *     
 *     AcademicYearListResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AcademicYear'
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
 *     AcademicYearUpdateRequest:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           required: true
 *           description: Academic year ID to update
 *         name:
 *           type: string
 *           description: Updated academic year name
 *         startDate:
 *           type: string
 *           format: date
 *           description: Updated start date
 *         endDate:
 *           type: string
 *           format: date
 *           description: Updated end date
 *         status:
 *           type: string
 *           enum: [active, inactive, upcoming]
 *           description: Updated status
 *         description:
 *           type: string
 *           description: Updated description
 *         isCurrent:
 *           type: boolean
 *           description: Updated current status
 *     
 *     AcademicYearDeleteRequest:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           description: Academic year ID to delete
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
 *   name: Academic Years
 *   description: Academic year management endpoints
 */

/**
 * @swagger
 * /instituteDataRt/academicYear/{id}:
 *   get:
 *     summary: Get academic years
 *     tags: [Academic Years]
 *     description: Get all academic years or a specific academic year by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: false
 *         schema:
 *           type: string
 *         description: Academic year ID (optional - if not provided, returns all academic years)
 *         example: "507f1f77bcf86cd799439011"
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
 *         description: Search academic years by name
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, upcoming]
 *         description: Filter by status
 *       - in: query
 *         name: isCurrent
 *         schema:
 *           type: boolean
 *         description: Filter by current academic year
 *       - in: query
 *         name: instituteId
 *         schema:
 *           type: string
 *         description: Filter by institute
 *     responses:
 *       200:
 *         description: Academic years retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/AcademicYear'
 *                 - $ref: '#/components/schemas/AcademicYearListResponse'
 *             examples:
 *               singleYear:
 *                 summary: Single academic year response
 *                 value:
 *                   id: "507f1f77bcf86cd799439011"
 *                   name: "2024-2025"
 *                   startDate: "2024-06-01"
 *                   endDate: "2025-05-31"
 *                   status: "active"
 *                   isCurrent: true
 *               multipleYears:
 *                 summary: Multiple academic years response
 *                 value:
 *                   message: "Academic years retrieved successfully"
 *                   data:
 *                     - id: "507f1f77bcf86cd799439011"
 *                       name: "2024-2025"
 *                       startDate: "2024-06-01"
 *                       endDate: "2025-05-31"
 *                       status: "active"
 *                       isCurrent: true
 *                   pagination:
 *                     currentPage: 1
 *                     totalPages: 2
 *                     totalItems: 15
 *                     hasNextPage: true
 *                     hasPrevPage: false
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
 *         description: Academic year not found (when ID is provided)
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

router.get('/academicYear/:id?', academicYearCt.getAcademicYears);

/**
 * @swagger
 * /instituteDataRt/academicYear:
 *   post:
 *     summary: Create a new academic year
 *     tags: [Academic Years]
 *     description: Create a new academic year with start and end dates
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AcademicYear'
 *           example:
 *             name: "2024-2025"
 *             startDate: "2024-06-01"
 *             endDate: "2025-05-31"
 *             instituteId: "507f1f77bcf86cd799439011"
 *             status: "active"
 *             description: "Academic year 2024-2025"
 *             isCurrent: true
 *     responses:
 *       201:
 *         description: Academic year created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcademicYearResponse'
 *             example:
 *               message: "Academic year created successfully"
 *               data:
 *                 academicYear:
 *                   name: "2024-2025"
 *                   startDate: "2024-06-01"
 *                   endDate: "2025-05-31"
 *                   status: "active"
 *                   isCurrent: true
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
 *         description: Academic year with this name already exists
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

router.post('/academicYear', academicYearCt.insertAcademicYear);

/**
 * @swagger
 * /instituteDataRt/academicYear:
 *   put:
 *     summary: Update academic year
 *     tags: [Academic Years]
 *     description: Update existing academic year information
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AcademicYearUpdateRequest'
 *           example:
 *             id: "507f1f77bcf86cd799439011"
 *             name: "2024-2025 Updated"
 *             status: "inactive"
 *             isCurrent: false
 *     responses:
 *       200:
 *         description: Academic year updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               message: "Academic year updated successfully"
 *               data:
 *                 updatedAcademicYear:
 *                   id: "507f1f77bcf86cd799439011"
 *                   name: "2024-2025 Updated"
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
 *         description: Academic year not found
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

router.put('/academicYear', academicYearCt.updateAcademicYear);

/**
 * @swagger
 * /instituteDataRt/academicYear:
 *   delete:
 *     summary: Delete academic year
 *     tags: [Academic Years]
 *     description: Delete an academic year from the system
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AcademicYearDeleteRequest'
 *           example:
 *             id: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Academic year deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               message: "Academic year deleted successfully"
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
 *         description: Academic year not found
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

router.delete('/academicYear', academicYearCt.deleteAcademicYear);

module.exports = router;
