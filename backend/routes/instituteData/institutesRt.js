const express = require('express');
const router = express.Router();

const institutesCt = require('../../Controller/instituteData/institutesCt');

/**
 * @swagger
 * components:
 *   schemas:
 *     Institute:
 *       type: object
 *       required:
 *         - name
 *         - code
 *         - instituteType
 *       properties:
 *         name:
 *           type: string
 *           description: Institute name
 *           example: "ABC International School"
 *         code:
 *           type: string
 *           description: Unique institute code
 *           example: "ABC001"
 *         instituteType:
 *           type: string
 *           enum: [school, college, university, training_center]
 *           description: Type of institute
 *           example: "school"
 *         address:
 *           type: string
 *           description: Institute address
 *           example: "123 Education Street, City, State 12345"
 *         phone:
 *           type: string
 *           description: Institute phone number
 *           example: "+1-555-123-4567"
 *         email:
 *           type: string
 *           format: email
 *           description: Institute email
 *           example: "info@abcschool.edu"
 *         website:
 *           type: string
 *           format: uri
 *           description: Institute website URL
 *           example: "https://www.abcschool.edu"
 *         principal:
 *           type: string
 *           description: Principal/Head of institute
 *           example: "Dr. Jane Smith"
 *         establishedYear:
 *           type: integer
 *           minimum: 1900
 *           maximum: 2030
 *           description: Year institute was established
 *           example: 1995
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended]
 *           default: active
 *           description: Institute status
 *           example: "active"
 *         description:
 *           type: string
 *           description: Institute description
 *           example: "A leading educational institution focused on excellence"
 *     
 *     InstituteResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *         data:
 *           type: object
 *           properties:
 *             institute:
 *               $ref: '#/components/schemas/Institute'
 *             id:
 *               type: string
 *               description: Created institute ID
 *     
 *     InstituteListResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Institute'
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
 *     InstituteUpdateRequest:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           required: true
 *           description: Institute ID to update
 *         name:
 *           type: string
 *           description: Updated institute name
 *         code:
 *           type: string
 *           description: Updated institute code
 *         instituteType:
 *           type: string
 *           enum: [school, college, university, training_center]
 *           description: Updated institute type
 *         address:
 *           type: string
 *           description: Updated address
 *         phone:
 *           type: string
 *           description: Updated phone number
 *         email:
 *           type: string
 *           format: email
 *           description: Updated email
 *         website:
 *           type: string
 *           format: uri
 *           description: Updated website URL
 *         principal:
 *           type: string
 *           description: Updated principal name
 *         establishedYear:
 *           type: integer
 *           minimum: 1900
 *           maximum: 2030
 *           description: Updated established year
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended]
 *           description: Updated status
 *         description:
 *           type: string
 *           description: Updated description
 *     
 *     InstituteDeleteRequest:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           description: Institute ID to delete
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
 *   name: Institutes
 *   description: Institute management endpoints
 */

/**
 * @swagger
 * /instituteDataRt/institutes/{id}:
 *   get:
 *     summary: Get institutes
 *     tags: [Institutes]
 *     description: Get all institutes or a specific institute by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: false
 *         schema:
 *           type: string
 *         description: Institute ID (optional - if not provided, returns all institutes)
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
 *         description: Search institutes by name or code
 *       - in: query
 *         name: instituteType
 *         schema:
 *           type: string
 *           enum: [school, college, university, training_center]
 *         description: Filter by institute type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Institutes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Institute'
 *                 - $ref: '#/components/schemas/InstituteListResponse'
 *             examples:
 *               singleInstitute:
 *                 summary: Single institute response
 *                 value:
 *                   id: "507f1f77bcf86cd799439011"
 *                   name: "ABC International School"
 *                   code: "ABC001"
 *                   instituteType: "school"
 *                   status: "active"
 *               multipleInstitutes:
 *                 summary: Multiple institutes response
 *                 value:
 *                   message: "Institutes retrieved successfully"
 *                   data:
 *                     - id: "507f1f77bcf86cd799439011"
 *                       name: "ABC International School"
 *                       code: "ABC001"
 *                       instituteType: "school"
 *                       status: "active"
 *                   pagination:
 *                     currentPage: 1
 *                     totalPages: 5
 *                     totalItems: 50
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
 *         description: Institute not found (when ID is provided)
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

router.get('/institutes/:id?', institutesCt.getInstitutes);

/**
 * @swagger
 * /instituteDataRt/institutes:
 *   post:
 *     summary: Create a new institute
 *     tags: [Institutes]
 *     description: Create a new institute with basic information
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Institute'
 *           example:
 *             name: "ABC International School"
 *             code: "ABC001"
 *             instituteType: "school"
 *             address: "123 Education Street, City, State 12345"
 *             phone: "+1-555-123-4567"
 *             email: "info@abcschool.edu"
 *             website: "https://www.abcschool.edu"
 *             principal: "Dr. Jane Smith"
 *             establishedYear: 1995
 *             status: "active"
 *             description: "A leading educational institution focused on excellence"
 *     responses:
 *       201:
 *         description: Institute created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InstituteResponse'
 *             example:
 *               message: "Institute created successfully"
 *               data:
 *                 institute:
 *                   name: "ABC International School"
 *                   code: "ABC001"
 *                   instituteType: "school"
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
 *         description: Institute with this code already exists
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

router.post('/institutes', institutesCt.insertInstitute);

/**
 * @swagger
 * /instituteDataRt/institutes:
 *   put:
 *     summary: Update institute
 *     tags: [Institutes]
 *     description: Update existing institute information
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InstituteUpdateRequest'
 *           example:
 *             id: "507f1f77bcf86cd799439011"
 *             name: "ABC International School Updated"
 *             phone: "+1-555-987-6543"
 *             status: "active"
 *     responses:
 *       200:
 *         description: Institute updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               message: "Institute updated successfully"
 *               data:
 *                 updatedInstitute:
 *                   id: "507f1f77bcf86cd799439011"
 *                   name: "ABC International School Updated"
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
 *         description: Institute not found
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

router.put('/institutes', institutesCt.updateInstitute);

/**
 * @swagger
 * /instituteDataRt/institutes:
 *   delete:
 *     summary: Delete institute
 *     tags: [Institutes]
 *     description: Delete an institute from the system
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InstituteDeleteRequest'
 *           example:
 *             id: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Institute deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               message: "Institute deleted successfully"
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
 *         description: Institute not found
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

router.delete('/institutes', institutesCt.deleteInstitutes);

module.exports = router;
