const express = require('express');
const router = express.Router();

const generalDataCt = require('../../Controller/generalData/generalDataCt');

/**
 * @swagger
 * components:
 *   schemas:
 *     GeneralData:
 *       type: object
 *       required:
 *         - key
 *         - value
 *         - type
 *       properties:
 *         key:
 *           type: string
 *           description: Data key identifier
 *         value:
 *           type: string
 *           description: Data value
 *         type:
 *           type: string
 *           enum: [blood_group, gender, member_type, status, other]
 *           description: Category of general data
 *         description:
 *           type: string
 *           description: Optional description of the data
 *         order:
 *           type: integer
 *           description: Display order for sorting
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether the data item is active
 *         instituteId:
 *           type: string
 *           description: Associated institute ID
 *     GeneralDataResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *         data:
 *           type: object
 *           properties:
 *             generalData:
 *               $ref: '#/components/schemas/GeneralData'
 *             id:
 *               type: string
 *               description: Created general data ID
 *     GeneralDataListResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/GeneralData'
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
 *     GeneralDataUpdateRequest:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           required: true
 *           description: General data ID to update
 *         key:
 *           type: string
 *           description: Updated key
 *         value:
 *           type: string
 *           description: Updated value
 *         type:
 *           type: string
 *           enum: [blood_group, gender, member_type, status, other]
 *           description: Updated type
 *         description:
 *           type: string
 *           description: Updated description
 *         order:
 *           type: integer
 *           description: Updated order
 *         isActive:
 *           type: boolean
 *           description: Updated active status
 *     GeneralDataDeleteRequest:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           description: General data ID to delete
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
 *   name: General Data
 *   description: General data management endpoints for blood groups, genders, member types, etc.
 */

/**
 * @swagger
 * /generalDataRt/{type}/{itemId}:
 *   get:
 *     summary: Get general data
 *     tags: [General Data]
 *     description: Get general data by type and optional item ID. If no itemId is provided, returns all items of that type.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: false
 *         schema:
 *           type: string
 *           enum: [blood_group, gender, member_type, status, other]
 *         description: Type of general data to retrieve
 *       - in: path
 *         name: itemId
 *         required: false
 *         schema:
 *           type: string
 *         description: Specific item ID to retrieve (optional)
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
 *         description: Search data by key or value
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: General data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/GeneralData'
 *                 - $ref: '#/components/schemas/GeneralDataListResponse'
 *             examples:
 *               singleItem:
 *                 summary: Single item response
 *                 value:
 *                   id: "507f1f77bcf86cd799439011"
 *                   key: "blood_group"
 *                   value: "O+"
 *                   type: "blood_group"
 *                   isActive: true
 *               multipleItems:
 *                 summary: Multiple items response
 *                 value:
 *                   message: "General data retrieved successfully"
 *                   data:
 *                     - id: "507f1f77bcf86cd799439011"
 *                       key: "blood_group"
 *                       value: "O+"
 *                       type: "blood_group"
 *                       isActive: true
 *                     - id: "507f1f77bcf86cd799439012"
 *                       key: "blood_group"
 *                       value: "A+"
 *                       type: "blood_group"
 *                       isActive: true
 *                   pagination:
 *                     currentPage: 1
 *                     totalPages: 3
 *                     totalItems: 25
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
 *         description: Data not found (when itemId is provided)
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

router.get('/:type?/:itemId?', generalDataCt.getGeneraldata);

/**
 * @swagger
 * /generalDataRt/{type}:
 *   post:
 *     summary: Add general data
 *     tags: [General Data]
 *     description: Add new general data item of specified type
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [blood_group, gender, member_type, status, other]
 *         description: Type of general data to add
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - value
 *             properties:
 *               key:
 *                 type: string
 *               value:
 *                 type: string
 *               description:
 *                 type: string
 *               order:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: General data added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GeneralDataResponse'
 *               data:
 *                 generalData:
 *                   key: "blood_group"
 *                   value: "AB+"
 *                   type: "blood_group"
 *                   isActive: true
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
 *         description: Data with this key already exists
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

router.post('/:type?', generalDataCt.addGeneraldata);

/**
 * @swagger
 * /generalDataRt/{type}:
 *   put:
 *     summary: Update general data
 *     tags: [General Data]
 *     description: Update existing general data item
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [blood_group, gender, member_type, status, other]
 *         description: Type of general data to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GeneralDataUpdateRequest'
 *             value: "AB+ Updated"
 *             description: "Updated AB positive blood group"
 *             isActive: true
 *     responses:
 *       200:
 *         description: General data updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *               data:
 *                 updatedData:
 *                   id: "507f1f77bcf86cd799439011"
 *                   value: "AB+ Updated"
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
 *         description: Data not found
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

router.put('/:type?', generalDataCt.updateGeneraldata);

/**
 * @swagger
 * /generalDataRt/{type}:
 *   delete:
 *     summary: Delete general data
 *     tags: [General Data]
 *     description: Delete general data item
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [blood_group, gender, member_type, status, other]
 *         description: Type of general data to delete
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GeneralDataDeleteRequest'
 *     responses:
 *       200:
 *         description: General data deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
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
 *         description: Data not found
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

router.delete('/:type?', generalDataCt.deleteGeneraldata);

module.exports = router;
