const express = require('express');
const router = express.Router();

const locationTypesInInstituteCt = require('../../../Controller/instituteData/aggregation/locationTypesInInstituteCt');

/**
 * @swagger
 * components:
 *   schemas:
 *     LocationTypeInInstitute:
 *       type: object
 *       required:
 *         - name
 *         - code
 *         - instituteId
 *         - locationTypeId
 *       properties:
 *         name:
 *           type: string
 *           description: Location type name within institute (e.g., Main Campus, Branch Office, Training Center)
 *           example: "Main Campus"
 *         code:
 *           type: string
 *           description: Unique location type code within institute
 *           example: "MC-001"
 *         instituteId:
 *           type: string
 *           description: Associated institute ID
 *           example: "507f1f77bcf86cd799439011"
 *         locationTypeId:
 *           type: string
 *           description: Associated location type ID from master data
 *           example: "507f1f77bcf86cd799439012"
 *         description:
 *           type: string
 *           description: Location type description
 *           example: "Primary campus location with all facilities"
 *         address:
 *           type: string
 *           description: Physical address of the location
 *           example: "123 Main Street, City, State 12345"
 *         city:
 *           type: string
 *           description: City name
 *           example: "New York"
 *         state:
 *           type: string
 *           description: State or province name
 *           example: "NY"
 *         country:
 *           type: string
 *           description: Country name
 *           example: "USA"
 *         postalCode:
 *           type: string
 *           description: Postal/ZIP code
 *           example: "12345"
 *         phone:
 *           type: string
 *           description: Contact phone number
 *           example: "+1-555-123-4567"
 *         email:
 *           type: string
 *           format: email
 *           description: Contact email address
 *           example: "maincampus@institute.edu"
 *         website:
 *           type: string
 *           format: uri
 *           description: Website URL
 *           example: "https://maincampus.institute.edu"
 *         coordinates:
 *           type: object
 *           properties:
 *             latitude:
 *               type: number
 *               description: Latitude coordinate
 *               example: 40.7128
 *             longitude:
 *               type: number
 *               description: Longitude coordinate
 *               example: -74.0060
 *         capacity:
 *           type: integer
 *           description: Maximum capacity of the location
 *           example: 1000
 *         currentOccupancy:
 *           type: integer
 *           description: Current number of people at location
 *           example: 750
 *         facilities:
 *           type: array
 *           items:
 *             type: string
 *           description: Available facilities at this location
 *           example: ["Library", "Computer Lab", "Auditorium", "Sports Complex"]
 *         status:
 *           type: string
 *           enum: [active, inactive, under_construction, closed]
 *           default: active
 *           description: Location status
 *           example: "active"
 *         order:
 *           type: integer
 *           description: Display order for sorting
 *           example: 1
 *     
 *     LocationTypeInInstituteResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *         data:
 *           type: object
 *           properties:
 *             locationTypeInInstitute:
 *               $ref: '#/components/schemas/LocationTypeInInstitute'
 *             id:
 *               type: string
 *               description: Created location type in institute ID
 *     
 *     LocationTypeInInstituteListResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/LocationTypeInInstitute'
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
 *     LocationTypeInInstituteUpdateRequest:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           required: true
 *           description: Location type in institute ID to update
 *         name:
 *           type: string
 *           description: Updated location type name
 *         code:
 *           type: string
 *           description: Updated location type code
 *         description:
 *           type: string
 *           description: Updated description
 *         address:
 *           type: string
 *           description: Updated address
 *         city:
 *           type: string
 *           description: Updated city
 *         state:
 *           type: string
 *           description: Updated state
 *         country:
 *           type: string
 *           description: Updated country
 *         postalCode:
 *           type: string
 *           description: Updated postal code
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
 *           description: Updated website
 *         coordinates:
 *           type: object
 *           properties:
 *             latitude:
 *               type: number
 *             longitude:
 *               type: number
 *         capacity:
 *           type: integer
 *           description: Updated capacity
 *         facilities:
 *           type: array
 *           items:
 *             type: string
 *           description: Updated facilities list
 *         status:
 *           type: string
 *           enum: [active, inactive, under_construction, closed]
 *           description: Updated status
 *         order:
 *           type: integer
 *           description: Updated order
 *     
 *     LocationTypeInInstituteDeleteRequest:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           description: Location type in institute ID to delete
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
 *   name: Location Types in Institute
 *   description: Location type management endpoints within institutes
 */

/**
 * @swagger
 * /instituteAggreRt/locationTypesInInstitute:
 *   get:
 *     summary: Get location types in institute
 *     tags: [Location Types in Institute]
 *     description: Get all location types within an institute with optional filtering and pagination
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
 *         description: Search location types by name or code
 *       - in: query
 *         name: instituteId
 *         schema:
 *           type: string
 *         description: Filter by institute
 *       - in: query
 *         name: locationTypeId
 *         schema:
 *           type: string
 *         description: Filter by location type
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filter by state
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, under_construction, closed]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Location types in institute retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LocationTypeInInstituteListResponse'
 *             example:
 *               message: "Location types in institute retrieved successfully"
 *               data:
 *                 - id: "507f1f77bcf86cd799439011"
 *                   name: "Main Campus"
 *                   code: "MC-001"
 *                   instituteId: "507f1f77bcf86cd799439012"
 *                   locationTypeId: "507f1f77bcf86cd799439013"
 *                   city: "New York"
 *                   state: "NY"
 *                   status: "active"
 *                   capacity: 1000
 *                   currentOccupancy: 750
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

router.get('/locationTypesInInstitute',locationTypesInInstituteCt.getLocationTypesInInstituteAgs);
// router.get('/locationTypesInInstitute',locationTypesInInstituteCt.getLocationTypesInInstitute);

/**
 * @swagger
 * /instituteAggreRt/locationTypesInInstitute/{id}:
 *   get:
 *     summary: Get location type in institute by ID
 *     tags: [Location Types in Institute]
 *     description: Get a specific location type within an institute by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Location type in institute ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Location type in institute retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LocationTypeInInstituteResponse'
 *             example:
 *               message: "Location type in institute retrieved successfully"
 *               data:
 *                 locationTypeInInstitute:
 *                   id: "507f1f77bcf86cd799439011"
 *                   name: "Main Campus"
 *                   code: "MC-001"
 *                   instituteId: "507f1f77bcf86cd799439012"
 *                   locationTypeId: "507f1f77bcf86cd799439013"
 *                   city: "New York"
 *                   state: "NY"
 *                   status: "active"
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
 *         description: Location type in institute not found
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

router.get('/locationTypesInInstitute/:_id?',locationTypesInInstituteCt.getLocationTypesInInstitute);

/**
 * @swagger
 * /instituteAggreRt/locationTypesInInstitute:
 *   post:
 *     summary: Create a new location type in institute
 *     tags: [Location Types in Institute]
 *     description: Create a new location type within an institute
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LocationTypeInInstitute'
 *           example:
 *             name: "Main Campus"
 *             code: "MC-001"
 *             instituteId: "507f1f77bcf86cd799439011"
 *             locationTypeId: "507f1f77bcf86cd799439012"
 *             description: "Primary campus location with all facilities"
 *             address: "123 Main Street, City, State 12345"
 *             city: "New York"
 *             state: "NY"
 *             country: "USA"
 *             postalCode: "12345"
 *             phone: "+1-555-123-4567"
 *             email: "maincampus@institute.edu"
 *             website: "https://maincampus.institute.edu"
 *             capacity: 1000
 *             facilities: ["Library", "Computer Lab", "Auditorium"]
 *             status: "active"
 *             order: 1
 *     responses:
 *       201:
 *         description: Location type in institute created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LocationTypeInInstituteResponse'
 *             example:
 *               message: "Location type in institute created successfully"
 *               data:
 *                 locationTypeInInstitute:
 *                   name: "Main Campus"
 *                   code: "MC-001"
 *                   instituteId: "507f1f77bcf86cd799439011"
 *                   locationTypeId: "507f1f77bcf86cd799439012"
 *                   city: "New York"
 *                   state: "NY"
 *                   status: "active"
 *                   capacity: 1000
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
 *         description: Location type with this code already exists in institute
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

router.post('/locationTypesInInstitute',locationTypesInInstituteCt.createLocationTypesInInstitute);

/**
 * @swagger
 * /instituteAggreRt/locationTypesInInstitute:
 *   put:
 *     summary: Update location type in institute
 *     tags: [Location Types in Institute]
 *     description: Update existing location type information within an institute
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LocationTypeInInstituteUpdateRequest'
 *           example:
 *             id: "507f1f77bcf86cd799439011"
 *             name: "Main Campus Updated"
 *             capacity: 1200
 *             status: "active"
 *     responses:
 *       200:
 *         description: Location type in institute updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               message: "Location type in institute updated successfully"
 *               data:
 *                 updatedLocationTypeInInstitute:
 *                   id: "507f1f77bcf86cd799439011"
 *                   name: "Main Campus Updated"
 *                   capacity: 1200
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
 *         description: Location type in institute not found
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

router.put('/locationTypesInInstitute',locationTypesInInstituteCt.updateLocationTypesInInstitute);

/**
 * @swagger
 * /instituteAggreRt/locationTypesInInstitute:
 *   delete:
 *     summary: Delete location type in institute
 *     tags: [Location Types in Institute]
 *     description: Delete a location type from an institute
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LocationTypeInInstituteDeleteRequest'
 *           example:
 *             id: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Location type in institute deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               message: "Location type in institute deleted successfully"
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
 *         description: Location type in institute not found
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

router.delete('/locationTypesInInstitute',locationTypesInInstituteCt.deleteLocationTypesInInstitute);

module.exports = router;