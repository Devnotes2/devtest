const express = require('express');
const router = express.Router();

const academicYearCt = require('../../Controller/instituteData/academicYearCt');

/**
 * @swagger
 * components:
 *   schemas:
 *     # ============================================================================
 *     # ACADEMIC YEAR MANAGEMENT SCHEMAS
 *     # ============================================================================
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

 *         startDate:
 *           type: string
 *           format: date
 *           description: Academic year start date

 *         endDate:
 *           type: string
 *           format: date
 *           description: Academic year end date

 *         instituteId:
 *           type: string
 *           description: Associated institute ID

 *         status:
 *           type: string
 *           enum: [active, inactive, upcoming]
 *           default: active
 *           description: Academic year status

 *         description:
 *           type: string
 *           description: Academic year description

 *         isCurrent:
 *           type: boolean
 *           default: false
 *           description: Whether this is the current academic year

 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp

 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
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
 *     AcademicYearDeleteRequest:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           description: Academic year ID to delete
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
 *   name: Academic Years
 *   description: Academic year management endpoints
 */

/**
 * @swagger
 * /instituteDataRt/academicYear:
 *   get:
 *     summary: Get academic years with comprehensive filtering, aggregation, and pagination
 *     tags: [Academic Years]
 *     description: |
 *       Retrieve academic years with support for:
 *       - **Basic filtering**: Filter by any academic year field
 *       - **Aggregation**: Join with related collections
 *       - **Pagination**: Control page size and navigation
 *       - **Sorting**: Sort by any field in ascending or descending order
 *       - **Dropdown mode**: Get simplified data for dropdowns
 *       - **Value-based filtering**: Filter by joined field values
 *       - **ID-based retrieval**: Get specific academic years by IDs
 *       **Parameter Combinations:**
 *       - **Basic**: `?page=1&limit=10`
 *       - **With filtering**: `?startDate=2024-06-01&endDate=2025-05-31&page=1&limit=10`
 *       - **With aggregation**: `?aggregate=true&startDate=2024-06-01`
 *       - **With sorting**: `?sortField=startDate&sort=desc`
 *       - **Dropdown mode**: `?dropdown=true`
 *       - **ID-based**: `?ids=123,456,789`
 *       - **Complex combination**: `?aggregate=true&startDate=2024-06-01&sortField=startDate&sort=desc&page=1&limit=20`
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
 *         description: Array of academic year IDs to fetch specific academic years

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
 *         description: Return simplified data for dropdown (only _id and academicYear)
 *       - in: query
 *         name: validate
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Validate if academicYear exists (requires academicYear parameter)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date

 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date

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
 *           default: desc
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
 *         description: Academic years retrieved successfully
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
 *                         description: Academic year ID

 *                       startDate:
 *                         type: string
 *                         format: date
 *                         description: Academic year start date

 *                       endDate:
 *                         type: string
 *                         format: date
 *                         description: Academic year end date

 *                       academicYear:
 *                         type: string
 *                         description: Formatted academic year string

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
 *                       startDate: "2024-06-01"
 *                       endDate: "2025-05-31"
 *                       academicYear: "01/06/2024-31/05/2025"
 *                       archive: false
 *                       createdAt: "2023-01-01T00:00:00.000Z"
 *                       updatedAt: "2023-01-01T00:00:00.000Z"
 *               dropdown_response:
 *                 summary: Dropdown response
 *                 value:
 *                   data:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       academicYear: "01/06/2024-31/05/2025"
 *                     - _id: "507f1f77bcf86cd799439012"
 *                       academicYear: "01/06/2023-31/05/2024"
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

router.get('/academicYear', academicYearCt.getAcademicYears);

/**
 * @swagger
 * /instituteDataRt/academicYear:
 *   post:
 *     summary: Create a new academic year
 *     tags: [Academic Years]
 *     description: |
 *       Create a new academic year with comprehensive validation and error handling.
 *       **Validation Rules:**
 *       - All required fields must be provided
 *       - `startDate` and `endDate` are required
 *       - Date format validation
 *       - End date must be after start date
 *       **Required Fields:**
 *       - startDate, endDate
 *       **Supported Data Formats:**
 *       - Direct data: `{ "startDate": "2024-06-01", "endDate": "2025-05-31" }`
 *       - Nested data: `{ "newYear": { "startDate": "2024-06-01", "endDate": "2025-05-31" } }`
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 required:
 *                   - startDate
 *                   - endDate
 *                 properties:
 *                   startDate:
 *                     type: string
 *                     format: date
 *                     description: Academic year start date

 *                   endDate:
 *                     type: string
 *                     format: date
 *                     description: Academic year end date

 *               - type: object
 *                 required:
 *                   - newYear
 *                 properties:
 *                   newYear:
 *                     type: object
 *                     required:
 *                       - startDate
 *                       - endDate
 *                     properties:
 *                       startDate:
 *                         type: string
 *                         format: date
 *                         description: Academic year start date

 *                       endDate:
 *                         type: string
 *                         format: date
 *                         description: Academic year end date

 *           examples:
 *             direct_format:
 *               summary: Direct data format
 *               value:
 *                 startDate: "2024-06-01"
 *                 endDate: "2025-05-31"
 *             nested_format:
 *               summary: Nested data format (legacy support)
 *               value:
 *                 newYear:
 *                   startDate: "2024-06-01"
 *                   endDate: "2025-05-31"
 *     responses:
 *       200:
 *         description: Academic year created successfully
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

 *                     startDate:
 *                       type: string
 *                       format: date

 *                     endDate:
 *                       type: string
 *                       format: date

 *                     academicYear:
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
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string

 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
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

router.post('/academicYear', academicYearCt.insertAcademicYear);

/**
 * @swagger
 * /instituteDataRt/academicYear:
 *   put:
 *     summary: Update academic year
 *     tags: [Academic Years]
 *     description: |
 *       Update existing academic year information with comprehensive validation.
 *       **Update Rules:**
 *       - `_id` is required to identify the academic year to update
 *       - `updatedData` object contains the fields to update
 *       - Partial updates are supported (only update provided fields)
 *       - If dates are updated, the `academicYear` field is automatically recalculated
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
 *                 description: Academic year ID to update

 *               updatedData:
 *                 type: object
 *                 description: Fields to update (all fields are optional for updates)
 *                 properties:
 *                   startDate:
 *                     type: string
 *                     format: date
 *                     description: Updated start date

 *                   endDate:
 *                     type: string
 *                     format: date
 *                     description: Updated end date


 *             updatedData:
 *               startDate: "2024-06-01"
 *               endDate: "2025-05-31"
 *     responses:
 *       200:
 *         description: Academic year updated successfully or no changes made
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
 *                   message: "Academic year updated successfully"
 *               no_changes:
 *                 summary: No changes made
 *                 value:
 *                   message: "No updates were made"
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

 *       404:
 *         description: Academic year not found
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

router.put('/academicYear', academicYearCt.updateAcademicYear);

/**
 * @swagger
 * /instituteDataRt/academicYear:
 *   delete:
 *     summary: Delete academic year(s)
 *     tags: [Academic Years]
 *     description: |
 *       Delete academic year(s) with comprehensive dependency management options.
 *       **Dependency Management:**
 *       Academic years typically don't have dependencies, so deletion is straightforward.
 *       **Deletion Options:**
 *       1. **Simple Delete**: Delete academic years without dependencies
 *       2. **Archive/Unarchive**: Archive academic years instead of deleting (recommended)
 *       3. **Multiple Delete**: Delete multiple academic years at once
 *       **Response Scenarios:**
 *       - **200**: Successful deletion/archival
 *       - **400**: Invalid request parameters
 *       - **404**: Academic year not found
 *       **Important Notes:**
 *       - Only one of `archive` or `transferTo` can be used at a time
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
 *                 description: Array of academic year IDs to delete

 *               deleteDependents:
 *                 type: boolean
 *                 description: Whether to delete dependent records

 *               transferTo:
 *                 type: string
 *                 description: Academic year ID to transfer dependents to

 *               archive:
 *                 type: boolean
 *                 description: Archive/unarchive academic years instead of deleting

 *           examples:
 *             simple_delete:
 *               summary: Simple delete
 *               value:
 *                 ids: ["507f1f77bcf86cd799439011"]
 *             archive_academic_year:
 *               summary: Archive academic year instead of deleting
 *               value:
 *                 ids: ["507f1f77bcf86cd799439011"]
 *                 archive: true
 *             unarchive_academic_year:
 *               summary: Unarchive academic year
 *               value:
 *                 ids: ["507f1f77bcf86cd799439011"]
 *                 archive: false
 *             multiple_delete:
 *               summary: Delete multiple academic years
 *               value:
 *                 ids: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *     responses:
 *       200:
 *         description: Academic year(s) deleted/archived successfully
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
 *                   message: "Academic year(s) deleted successfully"
 *                   deletedCount: 1
 *               archive_success:
 *                 summary: Archive success
 *                 value:
 *                   message: "Academic year(s) archived successfully"
 *                   archiveResult:
 *                     archivedCount: 1
 *               unarchive_success:
 *                 summary: Unarchive success
 *                 value:
 *                   message: "Academic year(s) unarchived successfully"
 *                   archiveResult:
 *                     archivedCount: 1
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
 *                 summary: Missing academic year IDs
 *                 value:
 *                   message: "Academic year ID(s) required"
 *               conflicting_options:
 *                 summary: Conflicting options
 *                 value:
 *                   message: "Only one of archive or transfer can be requested at a time."
 *               invalid_archive:
 *                 summary: Invalid archive parameter
 *                 value:
 *                   message: "The archive parameter must be a boolean (true or false)."
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
 *         description: Academic year not found
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

router.delete('/academicYear', academicYearCt.deleteAcademicYear);

module.exports = router;
