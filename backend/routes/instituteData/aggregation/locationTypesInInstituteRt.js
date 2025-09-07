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
 *         - instituteId
 *         - locationTypes
 *       properties:
 *         instituteId:
 *           type: string
 *           description: Associated institute ID
 *         locationTypes:
 *           type: string
 *           description: Associated location type ID
 *         capacity:
 *           type: number
 *           description: Maximum capacity of the location
 *         description:
 *           type: string
 *           description: Location description
 *         location:
 *           type: string
 *           description: Physical location/address
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
 *     LocationTypeInInstituteDeleteRequest:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           description: Location type in institute ID to delete
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
 *   name: Location Types in Institute
 *   description: Location type management endpoints within institutes
 */

/**
 * @swagger
 * /instituteAggreRt/locationTypesInInstitute:
 *   get:
 *     summary: Get location types in institute (main endpoint - handles all combinations)
 *     tags: [Location Types in Institute]
 *     description: |
 *       Main GET endpoint that handles all location type retrieval combinations:
 *       - Basic listing with pagination and filtering
 *       - Get specific location type by ID (id parameter)
 *       - Get multiple location types by IDs (ids parameter)
 *       - Dropdown mode (dropdown=true) - returns simplified data
 *       - Advanced filtering with custom operators
 *       - Aggregation mode (aggregate=true/false) - with/without related data
 *       **Use Cases:**
 *       - `?id=507f1f77bcf86cd799439011` - Get specific location type
 *       - `?ids=id1,id2` - Get multiple location types
 *       - `?dropdown=true` - For UI dropdowns
 *       - `?aggregate=false` - Faster simple find (no lookups)
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
 *       - in: query
 *         name: ids
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             pattern: '^[0-9a-fA-F]{24}$'
 *         style: form
 *         explode: false
 *         description: Array of specific location type IDs to retrieve (comma-separated)
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Get a specific location type by its ID (alternative to ids array)
 *       - in: query
 *         name: dropdown
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Return simplified data with only _id and locationTypes fields for dropdowns
 *       - in: query
 *         name: aggregate
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Include related data (institute details) in response
 *       - in: query
 *         name: sortField
 *         schema:
 *           type: string
 *         description: Field to sort by (e.g., locationTypes, createdAt, updatedAt)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order (asc or desc)
 *       - in: query
 *         name: filterField
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: false
 *         description: Field(s) to filter by (e.g., locationTypes, description, location)
 *       - in: query
 *         name: operator
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [equals, contains, startsWith, endsWith, gt, gte, lt, lte, in, nin, exists, regex]
 *         style: form
 *         explode: false
 *         description: Filter operator(s) corresponding to filterField(s)
 *       - in: query
 *         name: value
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: false
 *         description: Filter value(s) corresponding to filterField(s)
 *       - in: query
 *         name: validate
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Validate filter fields against schema
 *     responses:
 *       200:
 *         description: Location types in institute retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LocationTypeInInstituteListResponse'
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
 *     responses:
 *       200:
 *         description: Location type in institute deleted successfully
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