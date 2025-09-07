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
 *         - instituteName
 *         - instituteCode
 *         - address
 *         - city
 *         - district
 *         - state
 *         - country
 *         - pinCode
 *         - contactNo1
 *         - emailId
 *       properties:
 *         instituteName:
 *           type: string
 *           description: Institute name

 *         instituteCode:
 *           type: string
 *           description: Unique institute code

 *         address:
 *           type: string
 *           description: Institute address

 *         city:
 *           type: string
 *           description: City name

 *         district:
 *           type: string
 *           description: District name

 *         state:
 *           type: string
 *           description: State name

 *         country:
 *           type: string
 *           description: Country name

 *         pinCode:
 *           type: number
 *           description: PIN code

 *         contactNo1:
 *           type: string
 *           description: Primary contact number

 *         contactNo2:
 *           type: string
 *           description: Secondary contact number

 *         emailId:
 *           type: string
 *           format: email
 *           description: Institute email

 *         archive:
 *           type: boolean
 *           default: false
 *           description: Archive status
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
 *     InstituteDeleteRequest:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           description: Institute ID to delete
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
 *   name: Institutes
 *   description: Institute management endpoints
 */

/**
 * @swagger
 * /instituteDataRt/institutes:
 *   get:
 *     summary: Get institutes with comprehensive filtering, aggregation, and pagination
 *     tags: [Institutes]
 *     description: |
 *       Retrieve institutes with support for:
 *       - **Basic filtering**: Filter by any institute field
 *       - **Aggregation**: Join with related collections
 *       - **Pagination**: Control page size and navigation
 *       - **Sorting**: Sort by any field in ascending or descending order
 *       - **Dropdown mode**: Get simplified data for dropdowns
 *       - **Value-based filtering**: Filter by joined field values
 *       - **ID-based retrieval**: Get specific institutes by IDs
 *       **Parameter Combinations:**
 *       - **Basic**: `?page=1&limit=10`
 *       - **With filtering**: `?instituteName=ABC&city=Mumbai&page=1&limit=10`
 *       - **With aggregation**: `?aggregate=true&instituteName=ABC`
 *       - **With sorting**: `?sortField=instituteName&sort=asc`
 *       - **Dropdown mode**: `?dropdown=true`
 *       - **ID-based**: `?ids=123,456,789`
 *       - **Complex combination**: `?aggregate=true&instituteName=ABC&sortField=createdAt&sort=desc&page=1&limit=20`
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination

 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page

 *       - in: query
 *         name: ids
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: false
 *         description: Array of institute IDs to fetch specific institutes

 *       - in: query
 *         name: aggregate
 *         schema:
 *           type: string
 *           enum: [true, false]
 *           default: true
 *         description: Use aggregation pipeline (true) or simple find (false)
 *       - in: query
 *         name: dropdown
 *         schema:
 *           type: string
 *           enum: [true, false]
 *           default: false
 *         description: Return simplified data for dropdown (only _id and instituteName)
 *       - in: query
 *         name: validate
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Validate if instituteName exists (requires instituteName parameter)
 *       - in: query
 *         name: instituteName
 *         schema:
 *           type: string
 *         description: Filter by institute name

 *       - in: query
 *         name: instituteCode
 *         schema:
 *           type: string
 *         description: Filter by institute code

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
 *         name: country
 *         schema:
 *           type: string
 *         description: Filter by country

 *       - in: query
 *         name: archive
 *         schema:
 *           type: boolean
 *         description: Filter by archive status

 *       - in: query
 *         name: sortField
 *         schema:
 *           type: string
 *         description: Field to sort by

 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
 *       - in: query
 *         name: filterField
 *         schema:
 *           type: string
 *         description: Field to filter by

 *       - in: query
 *         name: operator
 *         schema:
 *           type: string
 *           enum: [eq, contains, startsWith, endsWith, isEmpty, isNotEmpty, isAnyOf, ">", "<", ">=", "<="]
 *         description: Filter operator

 *       - in: query
 *         name: value
 *         schema:
 *           type: string
 *         description: Filter value

 *     responses:
 *       200:
 *         description: Institutes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: Number of items in current page

 *                 filteredDocs:
 *                   type: integer
 *                   description: Total number of filtered documents

 *                 totalDocs:
 *                   type: integer
 *                   description: Total number of documents in collection

 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Institute ID

 *                       instituteName:
 *                         type: string
 *                         description: Institute name

 *                       instituteCode:
 *                         type: string
 *                         description: Institute code

 *                       address:
 *                         type: string
 *                         description: Institute address

 *                       city:
 *                         type: string
 *                         description: City name

 *                       district:
 *                         type: string
 *                         description: District name

 *                       state:
 *                         type: string
 *                         description: State name

 *                       country:
 *                         type: string
 *                         description: Country name

 *                       pinCode:
 *                         type: number
 *                         description: PIN code

 *                       contactNo1:
 *                         type: string
 *                         description: Primary contact number

 *                       contactNo2:
 *                         type: string
 *                         description: Secondary contact number

 *                       emailId:
 *                         type: string
 *                         format: email
 *                         description: Institute email

 *                       archive:
 *                         type: boolean
 *                         description: Archive status

 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Creation timestamp
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         description: Last update timestamp
 *             examples:
 *               basic_response:
 *                 summary: Basic response with pagination
 *                 value:
 *                   count: 10
 *                   filteredDocs: 25
 *                   totalDocs: 100
 *                   data:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       instituteName: "ABC International School"
 *                       instituteCode: "ABC001"
 *                       address: "123 Education Street"
 *                       city: "Mumbai"
 *                       state: "Maharashtra"
 *                       country: "India"
 *                       pinCode: 400001
 *                       contactNo1: "+91-9876543210"
 *                       emailId: "info@abcschool.edu"
 *                       archive: false
 *                       createdAt: "2023-01-01T00:00:00.000Z"
 *                       updatedAt: "2023-01-01T00:00:00.000Z"
 *               dropdown_response:
 *                 summary: Dropdown response
 *                 value:
 *                   data:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       instituteName: "ABC International School"
 *                     - _id: "507f1f77bcf86cd799439012"
 *                       instituteName: "XYZ College"
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string

 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string

 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string

 *                 error:
 *                   type: string

 */

router.get('/institutes', institutesCt.getInstitutes);

/**
 * @swagger
 * /instituteDataRt/institutes:
 *   post:
 *     summary: Create a new institute
 *     tags: [Institutes]
 *     description: |
 *       Create a new institute with comprehensive validation and error handling.
 *       **Validation Rules:**
 *       - All required fields must be provided
 *       - `instituteName` must be unique
 *       - `instituteCode` must be unique
 *       - Email format validation
 *       - PIN code must be numeric
 *       **Required Fields:**
 *       - instituteName, instituteCode, address, city, district, state, country, pinCode, contactNo1, emailId
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - instituteName
 *               - instituteCode
 *               - address
 *               - city
 *               - district
 *               - state
 *               - country
 *               - pinCode
 *               - contactNo1
 *               - emailId
 *             properties:
 *               instituteName:
 *                 type: string
 *                 description: Institute name

 *               instituteCode:
 *                 type: string
 *                 description: Unique institute code

 *               address:
 *                 type: string
 *                 description: Institute address

 *               city:
 *                 type: string
 *                 description: City name

 *               district:
 *                 type: string
 *                 description: District name

 *               state:
 *                 type: string
 *                 description: State name

 *               country:
 *                 type: string
 *                 description: Country name

 *               pinCode:
 *                 type: number
 *                 description: PIN code

 *               contactNo1:
 *                 type: string
 *                 description: Primary contact number

 *               contactNo2:
 *                 type: string
 *                 description: Secondary contact number

 *               emailId:
 *                 type: string
 *                 format: email
 *                 description: Institute email


 *             instituteCode: "ABC001"
 *             address: "123 Education Street"
 *             city: "Mumbai"
 *             district: "Mumbai"
 *             state: "Maharashtra"
 *             country: "India"
 *             pinCode: 400001
 *             contactNo1: "+91-9876543210"
 *             contactNo2: "+91-9876543211"
 *             emailId: "info@abcschool.edu"
 *     responses:
 *       200:
 *         description: Institute created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string

 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string

 *                     instituteName:
 *                       type: string

 *                     instituteCode:
 *                       type: string

 *                     address:
 *                       type: string

 *                     city:
 *                       type: string

 *                     state:
 *                       type: string

 *                     country:
 *                       type: string

 *                     pinCode:
 *                       type: number

 *                     contactNo1:
 *                       type: string

 *                     emailId:
 *                       type: string

 *                     archive:
 *                       type: boolean

 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - validation error or duplicate value
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string

 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           field:
 *                             type: string
 *                           message:
 *                             type: string
 *                 - type: object
 *                   properties:
 *                     error:
 *                       type: string

 *                     details:
 *                       type: string

 *                     field:
 *                       type: string

 *                     value:
 *                       type: string

 *                     suggestion:
 *                       type: string

 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string

 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string

 *                 details:
 *                   type: string

 */

router.post('/institutes', institutesCt.insertInstitute);

/**
 * @swagger
 * /instituteDataRt/institutes:
 *   put:
 *     summary: Update institute
 *     tags: [Institutes]
 *     description: |
 *       Update existing institute information with comprehensive validation.
 *       **Update Rules:**
 *       - `_id` is required to identify the institute to update
 *       - `updatedData` object contains the fields to update
 *       - Updated `instituteName` must be unique
 *       - Updated `instituteCode` must be unique
 *       - Partial updates are supported (only update provided fields)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - _id
 *               - updatedData
 *             properties:
 *               _id:
 *                 type: string
 *                 description: Institute ID to update

 *               updatedData:
 *                 type: object
 *                 description: Fields to update (all fields are optional for updates)
 *                 properties:
 *                   instituteName:
 *                     type: string
 *                     description: Updated institute name

 *                   instituteCode:
 *                     type: string
 *                     description: Updated institute code

 *                   address:
 *                     type: string
 *                     description: Updated address

 *                   city:
 *                     type: string
 *                     description: Updated city

 *                   state:
 *                     type: string
 *                     description: Updated state

 *                   country:
 *                     type: string
 *                     description: Updated country

 *                   pinCode:
 *                     type: number
 *                     description: Updated PIN code

 *                   contactNo1:
 *                     type: string
 *                     description: Updated primary contact

 *                   contactNo2:
 *                     type: string
 *                     description: Updated secondary contact

 *                   emailId:
 *                     type: string
 *                     format: email
 *                     description: Updated email


 *             updatedData:
 *               instituteName: "ABC International School Updated"
 *               contactNo1: "+91-9876543210"
 *               emailId: "updated@abcschool.edu"
 *     responses:
 *       200:
 *         description: Institute updated successfully or no changes made
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string

 *             examples:
 *               success_update:
 *                 summary: Successful update
 *                 value:
 *                   message: "Institute updated successfully"
 *               no_changes:
 *                 summary: No changes made
 *                 value:
 *                   message: "No updates were made"
 *       400:
 *         description: Bad request - validation error or duplicate value
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string

 *                 - type: object
 *                   properties:
 *                     error:
 *                       type: string

 *                     details:
 *                       type: string

 *                     field:
 *                       type: string

 *                     value:
 *                       type: string

 *                     suggestion:
 *                       type: string

 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string

 *       404:
 *         description: Institute not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string

 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string

 *                 details:
 *                   type: string

 */

router.put('/institutes', institutesCt.updateInstitute);

/**
 * @swagger
 * /instituteDataRt/institutes:
 *   delete:
 *     summary: Delete institute(s) with dependency management
 *     tags: [Institutes]
 *     description: |
 *       Delete institute(s) with comprehensive dependency management options.
 *       **Dependency Management:**
 *       Institutes can have dependencies in the following modules:
 *       - **Departments**: Departments linked to this institute
 *       - **Grades**: Grades created for this institute
 *       - **Subjects**: Subjects linked to this institute
 *       - **MembersData**: Members assigned to this institute
 *       - **GradeBatches**: Batches created for this institute
 *       - **GradeSections**: Sections created for this institute
 *       - **GradeSectionBatches**: Section batches created for this institute
 *       - **LocationTypesInInstitute**: Location types for this institute
 *       **Deletion Options:**
 *       1. **Simple Delete**: Delete institutes without dependencies
 *       2. **Archive/Unarchive**: Archive institutes instead of deleting (recommended)
 *       3. **Transfer Dependencies**: Transfer all dependencies to another institute
 *       4. **Cascade Delete**: Delete institutes along with all dependencies
 *       5. **Dependency Check**: Get dependency information without deleting
 *       **Response Scenarios:**
 *       - **200**: Successful deletion/archival
 *       - **201**: Dependencies found, requires action
 *       - **400**: Invalid request parameters
 *       - **404**: Institute not found
 *       **Important Notes:**
 *       - Only one of `archive` or `transferTo` can be used at a time
 *       - `transferTo` requires exactly one institute ID
 *       - `deleteDependents` will permanently delete all related data
 *       - Archiving is recommended over deletion for data integrity
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of institute IDs to delete

 *               deleteDependents:
 *                 type: boolean
 *                 description: Whether to delete dependent records

 *               transferTo:
 *                 type: string
 *                 description: Institute ID to transfer dependents to

 *               archive:
 *                 type: boolean
 *                 description: Archive/unarchive institutes instead of deleting

 *           examples:
 *             simple_delete:
 *               summary: Simple delete (no dependencies)
 *               value:
 *                 ids: ["507f1f77bcf86cd799439011"]
 *             archive_institute:
 *               summary: Archive institute instead of deleting
 *               value:
 *                 ids: ["507f1f77bcf86cd799439011"]
 *                 archive: true
 *             unarchive_institute:
 *               summary: Unarchive institute
 *               value:
 *                 ids: ["507f1f77bcf86cd799439011"]
 *                 archive: false
 *             transfer_dependencies:
 *               summary: Transfer dependencies to another institute
 *               value:
 *                 ids: ["507f1f77bcf86cd799439011"]
 *                 transferTo: "507f1f77bcf86cd799439012"
 *             cascade_delete:
 *               summary: Delete with all dependencies
 *               value:
 *                 ids: ["507f1f77bcf86cd799439011"]
 *                 deleteDependents: true
 *             multiple_delete:
 *               summary: Delete multiple institutes
 *               value:
 *                 ids: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *             dependency_check:
 *               summary: Check dependencies without deleting
 *               value:
 *                 ids: ["507f1f77bcf86cd799439011"]
 *     responses:
 *       200:
 *         description: Institute(s) deleted/archived successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string

 *                     deletedCount:
 *                       type: integer

 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string

 *                     archiveResult:
 *                       type: object
 *                       properties:
 *                         archivedCount:
 *                           type: integer

 *             examples:
 *               simple_delete_success:
 *                 summary: Simple deletion success
 *                 value:
 *                   message: "Institute(s) deleted successfully"
 *                   deletedCount: 1
 *               archive_success:
 *                 summary: Archive success
 *                 value:
 *                   message: "Institute(s) archived successfully"
 *                   archiveResult:
 *                     archivedCount: 1
 *               unarchive_success:
 *                 summary: Unarchive success
 *                 value:
 *                   message: "Institute(s) unarchived successfully"
 *                   archiveResult:
 *                     archivedCount: 1
 *               transfer_success:
 *                 summary: Transfer dependencies success
 *                 value:
 *                   message: "Dependents transferred and Institute(s) deleted"
 *                   transfer:
 *                     departmentsTransferred: 5
 *                     gradesTransferred: 25
 *                     subjectsTransferred: 50
 *                     membersTransferred: 100
 *                   deletedCount: 1
 *               cascade_delete_success:
 *                 summary: Cascade deletion success
 *                 value:
 *                   message: "Deleted with dependents"
 *                   results:
 *                     - instituteId: "507f1f77bcf86cd799439011"
 *                       deletedDepartments: 5
 *                       deletedGrades: 25
 *                       deletedSubjects: 50
 *                       deletedMembers: 100
 *                       deletedBatches: 10
 *                       deletedSections: 15
 *                       deletedSectionBatches: 30
 *       201:
 *         description: Dependencies found, requires action
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string

 *                 deleted:
 *                   type: array
 *                   items:
 *                     type: string
 *                 dependencies:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       value:
 *                         type: string
 *                       dependsOn:
 *                         type: object

 *               deleted: ["507f1f77bcf86cd799439012"]
 *               dependencies:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   value: "ABC International School"
 *                   dependsOn:
 *                     departments: 5
 *                     grades: 25
 *                     subjects: 50
 *                     MembersData: 100
 *                     gradeBatches: 10
 *                     gradeSections: 15
 *                     gradeSectionBatches: 30
 *                     LocationTypesInInstitute: 3
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               missing_ids:
 *                 summary: Missing institute IDs
 *                 value:
 *                   message: "Institute ID(s) required"
 *               conflicting_options:
 *                 summary: Conflicting options
 *                 value:
 *                   message: "Only one of archive or transfer can be requested at a time."
 *               invalid_archive:
 *                 summary: Invalid archive parameter
 *                 value:
 *                   message: "The archive parameter must be a boolean (true or false)."
 *               multiple_transfer:
 *                 summary: Multiple institutes for transfer
 *                 value:
 *                   message: "Please select one institute to transfer dependents from."
 *               both_transfer_delete:
 *                 summary: Both transfer and delete specified
 *                 value:
 *                   message: "Either transfer or delete dependencies"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string

 *       404:
 *         description: Institute not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string

 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string

 *                 error:
 *                   type: string

 */

router.delete('/institutes', institutesCt.deleteInstitutes);

module.exports = router;
