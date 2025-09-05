const express = require('express');
const router = express.Router();

const gradesCt = require('../../../Controller/instituteData/aggregation/gradesCt');

/**
 * @swagger
 * components:
 *   schemas:
 *     Grade:
 *       type: object
 *       required:
 *         - gradeName
 *         - gradeCode
 *         - instituteId
 *         - departmentId
 *         - gradeDuration
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique grade identifier
 *           example: "507f1f77bcf86cd799439011"
 *         gradeName:
 *           type: string
 *           description: Grade name (e.g., Grade 1, Grade 2, Class 10)
 *           example: "Grade 10"
 *         gradeCode:
 *           type: string
 *           description: Unique grade code within institute
 *           example: "G10"
 *         instituteId:
 *           type: string
 *           description: Associated institute ID
 *           example: "507f1f77bcf86cd799439011"
 *         departmentId:
 *           type: string
 *           description: Associated department ID
 *           example: "507f1f77bcf86cd799439012"
 *         description:
 *           type: string
 *           description: Grade description
 *           example: "Tenth grade - Senior Secondary"
 *         gradeDuration:
 *           type: string
 *           description: Grade duration ID
 *           example: "507f1f77bcf86cd799439013"
 *         archive:
 *           type: boolean
 *           default: false
 *           description: Archive status
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     
 *     GradeWithLookups:
 *       allOf:
 *         - $ref: '#/components/schemas/Grade'
 *         - type: object
 *           properties:
 *             instituteName:
 *               type: string
 *               description: Institute name from lookup
 *               example: "ABC School"
 *             departmentName:
 *               type: string
 *               description: Department name from lookup
 *               example: "Science Department"
 *     
 *     GradeDropdown:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Grade ID
 *           example: "507f1f77bcf86cd799439011"
 *         gradeName:
 *           type: string
 *           description: Grade name
 *           example: "Grade 10"
 *         gradeCode:
 *           type: string
 *           description: Grade code
 *           example: "G10"
 *     
 *     GradeCreateRequest:
 *       type: object
 *       required:
 *         - gradeName
 *         - gradeCode
 *         - instituteId
 *         - departmentId
 *         - gradeDuration
 *       properties:
 *         gradeName:
 *           type: string
 *           description: Grade name
 *           example: "Grade 10"
 *         gradeCode:
 *           type: string
 *           description: Unique grade code
 *           example: "G10"
 *         instituteId:
 *           type: string
 *           description: Institute ID
 *           example: "507f1f77bcf86cd799439011"
 *         departmentId:
 *           type: string
 *           description: Department ID
 *           example: "507f1f77bcf86cd799439012"
 *         description:
 *           type: string
 *           description: Grade description
 *           example: "Tenth grade - Senior Secondary"
 *         gradeDuration:
 *           type: string
 *           description: Grade duration ID
 *           example: "507f1f77bcf86cd799439013"
 *     
 *     GradeUpdateRequest:
 *       type: object
 *       required:
 *         - _id
 *         - updatedData
 *       properties:
 *         _id:
 *           type: string
 *           description: Grade ID to update
 *           example: "507f1f77bcf86cd799439011"
 *         updatedData:
 *           type: object
 *           properties:
 *             gradeName:
 *               type: string
 *               description: Updated grade name
 *               example: "Grade 10 Updated"
 *             gradeCode:
 *               type: string
 *               description: Updated grade code
 *               example: "G10U"
 *             description:
 *               type: string
 *               description: Updated description
 *               example: "Updated tenth grade description"
 *             gradeDuration:
 *               type: string
 *               description: Updated grade duration ID
 *               example: "507f1f77bcf86cd799439014"
 *     
 *     GradeDeleteRequest:
 *       type: object
 *       required:
 *         - ids
 *       properties:
 *         ids:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of grade IDs to delete
 *           example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *         deleteDependents:
 *           type: boolean
 *           description: Whether to delete dependent records
 *           example: false
 *         transferTo:
 *           type: string
 *           description: Grade ID to transfer dependents to (only when deleting single grade)
 *           example: "507f1f77bcf86cd799439013"
 *         archive:
 *           type: boolean
 *           description: Archive/unarchive grades instead of deleting
 *           example: false
 *     
 *     GradeListResponse:
 *       type: object
 *       properties:
 *         count:
 *           type: integer
 *           description: Number of items in current page
 *           example: 10
 *         filteredDocs:
 *           type: integer
 *           description: Total filtered documents
 *           example: 25
 *         totalDocs:
 *           type: integer
 *           description: Total documents in collection
 *           example: 100
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/GradeWithLookups'
 *     
 *     GradeDropdownResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/GradeDropdown'
 *     
 *     GradeCreateResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *           example: "Grade added successfully!"
 *         data:
 *           $ref: '#/components/schemas/Grade'
 *     
 *     GradeUpdateResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *           example: "Grade updated successfully"
 *     
 *     GradeDeleteResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *           example: "Grade(s) deleted successfully"
 *         deleted:
 *           type: array
 *           items:
 *             type: string
 *           description: IDs of successfully deleted grades
 *         deletedCount:
 *           type: integer
 *           description: Number of deleted grades
 *         dependencies:
 *           type: array
 *           description: Grades with dependencies that couldn't be deleted
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               value:
 *                 type: string
 *               dependsOn:
 *                 type: object
 *     
 *     GradeArchiveResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *           example: "Grade(s) archived successfully"
 *         archiveResult:
 *           type: object
 *           properties:
 *             archivedCount:
 *               type: integer
 *     
 *     DuplicateErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Duplicate value"
 *         details:
 *           type: string
 *           example: "Grade name 'Grade 10' already exists in this institute"
 *         field:
 *           type: string
 *           example: "gradeName"
 *         value:
 *           type: string
 *           example: "Grade 10"
 *         suggestion:
 *           type: string
 *           example: "Grade name must be unique within this institute"
 */

/**
 * @swagger
 * tags:
 *   name: Grades
 *   description: Grade management endpoints within institutes
 */

/**
 * @swagger
 * /instituteAggreRt/gradesInInstitute:
 *   get:
 *     summary: Get grades in institute with advanced filtering and pagination
 *     tags: [Grades]
 *     description: |
 *       Retrieve grades within an institute with comprehensive filtering, sorting, and pagination options.
 *       
 *       **Key Features:**
 *       - **Dropdown Mode**: Set `dropdown=true` for simplified dropdown data
 *       - **Aggregation Mode**: Set `aggregate=false` for simple find queries
 *       - **ID Filtering**: Use `ids` parameter to fetch specific grades
 *       - **Advanced Filtering**: Support for all grade fields with various operators
 *       - **Pagination**: Built-in pagination with count information
 *       - **Lookup Data**: Includes institute and department names when aggregated
 *       
 *       **Filtering Examples:**
 *       - `gradeName=Grade 10` - Exact match
 *       - `gradeName__regex=Grade.*` - Regex pattern
 *       - `gradeCode__in=G10,G11,G12` - Multiple values
 *       - `archive__ne=true` - Not equal
 *       - `createdAt__gte=2024-01-01` - Date range
 *       
 *       **Sorting Examples:**
 *       - `sortBy=gradeName` - Sort by grade name ascending
 *       - `sortBy=-gradeName` - Sort by grade name descending
 *       - `sortBy=gradeName,gradeCode` - Multiple sort fields
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *         example: 10
 *       - in: query
 *         name: dropdown
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: Return simplified dropdown data (only _id, gradeName, gradeCode)
 *         example: "false"
 *       - in: query
 *         name: aggregate
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: Use aggregation pipeline for lookups (default true)
 *         example: "true"
 *       - in: query
 *         name: ids
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: false
 *         description: Array of grade IDs to fetch specific grades
 *         example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *       - in: query
 *         name: gradeName
 *         schema:
 *           type: string
 *         description: Filter by grade name (exact match)
 *         example: "Grade 10"
 *       - in: query
 *         name: gradeName__regex
 *         schema:
 *           type: string
 *         description: Filter by grade name using regex pattern
 *         example: "Grade.*"
 *       - in: query
 *         name: gradeName__in
 *         schema:
 *           type: string
 *         description: Filter by multiple grade names (comma-separated)
 *         example: "Grade 10,Grade 11,Grade 12"
 *       - in: query
 *         name: gradeCode
 *         schema:
 *           type: string
 *         description: Filter by grade code (exact match)
 *         example: "G10"
 *       - in: query
 *         name: gradeCode__regex
 *         schema:
 *           type: string
 *         description: Filter by grade code using regex pattern
 *         example: "G[0-9]+"
 *       - in: query
 *         name: gradeCode__in
 *         schema:
 *           type: string
 *         description: Filter by multiple grade codes (comma-separated)
 *         example: "G10,G11,G12"
 *       - in: query
 *         name: instituteId
 *         schema:
 *           type: string
 *         description: Filter by institute ID
 *         example: "507f1f77bcf86cd799439011"
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *         description: Filter by department ID
 *         example: "507f1f77bcf86cd799439012"
 *       - in: query
 *         name: gradeDuration
 *         schema:
 *           type: string
 *         description: Filter by grade duration ID
 *         example: "507f1f77bcf86cd799439013"
 *       - in: query
 *         name: description
 *         schema:
 *           type: string
 *         description: Filter by description (exact match)
 *         example: "Senior Secondary"
 *       - in: query
 *         name: description__regex
 *         schema:
 *           type: string
 *         description: Filter by description using regex pattern
 *         example: ".*Secondary.*"
 *       - in: query
 *         name: archive
 *         schema:
 *           type: boolean
 *         description: Filter by archive status
 *         example: false
 *       - in: query
 *         name: archive__ne
 *         schema:
 *           type: boolean
 *         description: Filter by archive status (not equal)
 *         example: true
 *       - in: query
 *         name: createdAt__gte
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by creation date (greater than or equal)
 *         example: "2024-01-01T00:00:00.000Z"
 *       - in: query
 *         name: createdAt__lte
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by creation date (less than or equal)
 *         example: "2024-12-31T23:59:59.999Z"
 *       - in: query
 *         name: updatedAt__gte
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by update date (greater than or equal)
 *         example: "2024-01-01T00:00:00.000Z"
 *       - in: query
 *         name: updatedAt__lte
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by update date (less than or equal)
 *         example: "2024-12-31T23:59:59.999Z"
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort by field(s). Use - prefix for descending order. Multiple fields comma-separated.
 *         example: "gradeName"
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: ["asc", "desc"]
 *           default: "asc"
 *         description: Sort order (when sortBy is used without - prefix)
 *         example: "asc"
 *     responses:
 *       200:
 *         description: Grades retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/GradeListResponse'
 *                 - $ref: '#/components/schemas/GradeDropdownResponse'
 *             examples:
 *               full_list:
 *                 summary: Full grade list with lookups
 *                 value:
 *                   count: 10
 *                   filteredDocs: 25
 *                   totalDocs: 100
 *                   data:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       gradeName: "Grade 10"
 *                       gradeCode: "G10"
 *                       instituteId: "507f1f77bcf86cd799439012"
 *                       departmentId: "507f1f77bcf86cd799439013"
 *                       description: "Tenth grade - Senior Secondary"
 *                       gradeDuration: "507f1f77bcf86cd799439014"
 *                       archive: false
 *                       createdAt: "2024-01-15T10:30:00.000Z"
 *                       updatedAt: "2024-01-15T10:30:00.000Z"
 *                       instituteName: "ABC School"
 *                       departmentName: "Science Department"
 *               dropdown_list:
 *                 summary: Dropdown grade list
 *                 value:
 *                   data:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       gradeName: "Grade 10"
 *                       gradeCode: "G10"
 *                     - _id: "507f1f77bcf86cd799439012"
 *                       gradeName: "Grade 11"
 *                       gradeCode: "G11"
 *               filtered_list:
 *                 summary: Filtered grade list
 *                 value:
 *                   count: 5
 *                   filteredDocs: 5
 *                   totalDocs: 100
 *                   data:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       gradeName: "Grade 10"
 *                       gradeCode: "G10"
 *                       instituteId: "507f1f77bcf86cd799439012"
 *                       departmentId: "507f1f77bcf86cd799439013"
 *                       description: "Tenth grade - Senior Secondary"
 *                       gradeDuration: "507f1f77bcf86cd799439014"
 *                       archive: false
 *                       createdAt: "2024-01-15T10:30:00.000Z"
 *                       updatedAt: "2024-01-15T10:30:00.000Z"
 *                       instituteName: "ABC School"
 *                       departmentName: "Science Department"
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid query parameters"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 *                 error:
 *                   type: string
 *                   example: "Database connection failed"
 */

router.get('/gradesInInstitute',gradesCt.gradesInInstituteAg);
// router.get('/gradesInInstitute/:_id?',gradesCt.gradesInInstitute);

/**
 * @swagger
 * /instituteAggreRt/gradesInInstitute:
 *   post:
 *     summary: Create a new grade in institute
 *     tags: [Grades]
 *     description: |
 *       Create a new grade within an institute. The grade name and code must be unique within the institute.
 *       
 *       **Validation Rules:**
 *       - `gradeName` must be unique within the institute
 *       - `gradeCode` must be unique within the institute
 *       - All required fields must be provided
 *       - `instituteId` and `departmentId` must be valid ObjectIds
 *       - `gradeDuration` must be a valid ObjectId
 *       
 *       **Unique Constraints:**
 *       - Grade names are unique per institute (case-sensitive)
 *       - Grade codes are unique per institute (case-sensitive)
 *       - Archived grades don't count for uniqueness validation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GradeCreateRequest'
 *           examples:
 *             basic_grade:
 *               summary: Basic grade creation
 *               value:
 *                 gradeName: "Grade 10"
 *                 gradeCode: "G10"
 *                 instituteId: "507f1f77bcf86cd799439011"
 *                 departmentId: "507f1f77bcf86cd799439012"
 *                 description: "Tenth grade - Senior Secondary"
 *                 gradeDuration: "507f1f77bcf86cd799439013"
 *             minimal_grade:
 *               summary: Minimal required fields
 *               value:
 *                 gradeName: "Grade 1"
 *                 gradeCode: "G1"
 *                 instituteId: "507f1f77bcf86cd799439011"
 *                 departmentId: "507f1f77bcf86cd799439012"
 *                 gradeDuration: "507f1f77bcf86cd799439013"
 *             detailed_grade:
 *               summary: Grade with detailed description
 *               value:
 *                 gradeName: "Advanced Placement Grade 12"
 *                 gradeCode: "AP12"
 *                 instituteId: "507f1f77bcf86cd799439011"
 *                 departmentId: "507f1f77bcf86cd799439012"
 *                 description: "Advanced Placement Grade 12 - College level preparation with rigorous curriculum"
 *                 gradeDuration: "507f1f77bcf86cd799439013"
 *     responses:
 *       200:
 *         description: Grade created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GradeCreateResponse'
 *             examples:
 *               success_response:
 *                 summary: Successful grade creation
 *                 value:
 *                   message: "Grade added successfully!"
 *                   data:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     gradeName: "Grade 10"
 *                     gradeCode: "G10"
 *                     instituteId: "507f1f77bcf86cd799439012"
 *                     departmentId: "507f1f77bcf86cd799439013"
 *                     description: "Tenth grade - Senior Secondary"
 *                     gradeDuration: "507f1f77bcf86cd799439014"
 *                     archive: false
 *                     createdAt: "2024-01-15T10:30:00.000Z"
 *                     updatedAt: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Bad request - validation error or duplicate value
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/DuplicateErrorResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Validation failed"
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           field:
 *                             type: string
 *                           message:
 *                             type: string
 *             examples:
 *               duplicate_name:
 *                 summary: Duplicate grade name error
 *                 value:
 *                   error: "Duplicate value"
 *                   details: "Grade name 'Grade 10' already exists in this institute"
 *                   field: "gradeName"
 *                   value: "Grade 10"
 *                   suggestion: "Grade name must be unique within this institute"
 *               duplicate_code:
 *                 summary: Duplicate grade code error
 *                 value:
 *                   error: "Duplicate value"
 *                   details: "Grade code 'G10' already exists in this institute"
 *                   field: "gradeCode"
 *                   value: "G10"
 *                   suggestion: "Grade code must be unique within this institute"
 *               validation_error:
 *                 summary: Validation error
 *                 value:
 *                   message: "Validation failed"
 *                   errors:
 *                     - field: "gradeName"
 *                       message: "Grade name is required"
 *                     - field: "instituteId"
 *                       message: "Invalid institute ID format"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to add grade"
 *                 details:
 *                   type: string
 *                   example: "Database connection error"
 */

router.post('/gradesInInstitute',gradesCt.createGradesInInstitute);

/**
 * @swagger
 * /instituteAggreRt/gradesInInstitute:
 *   put:
 *     summary: Update grade in institute
 *     tags: [Grades]
 *     description: |
 *       Update existing grade information within an institute. Only provided fields will be updated.
 *       
 *       **Update Rules:**
 *       - `_id` is required to identify the grade to update
 *       - `updatedData` object contains the fields to update
 *       - Updated `gradeName` must be unique within the institute
 *       - Updated `gradeCode` must be unique within the institute
 *       - Archived grades don't count for uniqueness validation
 *       - Partial updates are supported (only update provided fields)
 *       
 *       **Response Scenarios:**
 *       - `modifiedCount > 0`: Grade was successfully updated
 *       - `matchedCount > 0 && modifiedCount = 0`: Grade found but no changes made
 *       - `matchedCount = 0`: Grade not found
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GradeUpdateRequest'
 *           examples:
 *             update_name:
 *               summary: Update grade name
 *               value:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 updatedData:
 *                   gradeName: "Grade 10 Updated"
 *             update_code:
 *               summary: Update grade code
 *               value:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 updatedData:
 *                   gradeCode: "G10U"
 *             update_description:
 *               summary: Update description
 *               value:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 updatedData:
 *                   description: "Updated tenth grade description with new curriculum"
 *             update_multiple:
 *               summary: Update multiple fields
 *               value:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 updatedData:
 *                   gradeName: "Grade 10 Advanced"
 *                   gradeCode: "G10A"
 *                   description: "Advanced Grade 10 with enhanced curriculum"
 *                   gradeDuration: "507f1f77bcf86cd799439014"
 *             update_duration:
 *               summary: Update grade duration
 *               value:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 updatedData:
 *                   gradeDuration: "507f1f77bcf86cd799439014"
 *     responses:
 *       200:
 *         description: Grade updated successfully or no changes made
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GradeUpdateResponse'
 *             examples:
 *               success_update:
 *                 summary: Successful update
 *                 value:
 *                   message: "Grade updated successfully"
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
 *                 - $ref: '#/components/schemas/DuplicateErrorResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Validation failed"
 *             examples:
 *               duplicate_name:
 *                 summary: Duplicate grade name error
 *                 value:
 *                   error: "Duplicate value"
 *                   details: "Grade name 'Grade 10 Updated' already exists in this institute"
 *                   field: "gradeName"
 *                   value: "Grade 10 Updated"
 *                   suggestion: "Grade names must be unique within each institute"
 *               duplicate_code:
 *                 summary: Duplicate grade code error
 *                 value:
 *                   error: "Duplicate value"
 *                   details: "Grade code 'G10U' already exists in this institute"
 *                   field: "gradeCode"
 *                   value: "G10U"
 *                   suggestion: "Grade codes must be unique within each institute"
 *               validation_error:
 *                 summary: Validation error
 *                 value:
 *                   message: "Validation failed"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       404:
 *         description: Grade not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No matching grade found or values are unchanged"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to update grade"
 *                 details:
 *                   type: string
 *                   example: "Database connection error"
 */

router.put('/gradesInInstitute',gradesCt.updateGradesInInstitute);

/**
 * @swagger
 * /instituteAggreRt/gradesInInstitute:
 *   delete:
 *     summary: Delete grade(s) in institute with dependency management
 *     tags: [Grades]
 *     description: |
 *       Delete grade(s) from an institute with comprehensive dependency management options.
 *       
 *       **Dependency Management:**
 *       Grades can have dependencies in the following modules:
 *       - **Subjects**: Subjects linked to this grade
 *       - **MembersData**: Members assigned to this grade
 *       - **GradeBatches**: Batches created for this grade
 *       - **GradeSections**: Sections created for this grade
 *       - **GradeSectionBatches**: Section batches created for this grade
 *       
 *       **Deletion Options:**
 *       1. **Simple Delete**: Delete grades without dependencies
 *       2. **Archive/Unarchive**: Archive grades instead of deleting (recommended)
 *       3. **Transfer Dependencies**: Transfer all dependencies to another grade
 *       4. **Cascade Delete**: Delete grades along with all dependencies
 *       5. **Dependency Check**: Get dependency information without deleting
 *       
 *       **Response Scenarios:**
 *       - **200**: Successful deletion/archival
 *       - **201**: Dependencies found, requires action
 *       - **400**: Invalid request parameters
 *       - **404**: Grade not found
 *       
 *       **Important Notes:**
 *       - Only one of `archive` or `transferTo` can be used at a time
 *       - `transferTo` requires exactly one grade ID
 *       - `deleteDependents` will permanently delete all related data
 *       - Archiving is recommended over deletion for data integrity
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GradeDeleteRequest'
 *           examples:
 *             simple_delete:
 *               summary: Simple delete (no dependencies)
 *               value:
 *                 ids: ["507f1f77bcf86cd799439011"]
 *             archive_grade:
 *               summary: Archive grade instead of deleting
 *               value:
 *                 ids: ["507f1f77bcf86cd799439011"]
 *                 archive: true
 *             unarchive_grade:
 *               summary: Unarchive grade
 *               value:
 *                 ids: ["507f1f77bcf86cd799439011"]
 *                 archive: false
 *             transfer_dependencies:
 *               summary: Transfer dependencies to another grade
 *               value:
 *                 ids: ["507f1f77bcf86cd799439011"]
 *                 transferTo: "507f1f77bcf86cd799439012"
 *             cascade_delete:
 *               summary: Delete with all dependencies
 *               value:
 *                 ids: ["507f1f77bcf86cd799439011"]
 *                 deleteDependents: true
 *             multiple_delete:
 *               summary: Delete multiple grades
 *               value:
 *                 ids: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *             dependency_check:
 *               summary: Check dependencies without deleting
 *               value:
 *                 ids: ["507f1f77bcf86cd799439011"]
 *     responses:
 *       200:
 *         description: Grade(s) deleted/archived successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/GradeDeleteResponse'
 *                 - $ref: '#/components/schemas/GradeArchiveResponse'
 *             examples:
 *               simple_delete_success:
 *                 summary: Simple deletion success
 *                 value:
 *                   message: "Grade(s) deleted successfully"
 *                   deletedCount: 1
 *               archive_success:
 *                 summary: Archive success
 *                 value:
 *                   message: "Grade(s) archived successfully"
 *                   archiveResult:
 *                     archivedCount: 1
 *               unarchive_success:
 *                 summary: Unarchive success
 *                 value:
 *                   message: "Grade(s) unarchived successfully"
 *                   archiveResult:
 *                     archivedCount: 1
 *               transfer_success:
 *                 summary: Transfer dependencies success
 *                 value:
 *                   message: "Dependents transferred and Grade(s) deleted"
 *                   transfer:
 *                     subjectsTransferred: 5
 *                     membersTransferred: 25
 *                     batchesTransferred: 3
 *                   deletedCount: 1
 *               cascade_delete_success:
 *                 summary: Cascade deletion success
 *                 value:
 *                   message: "Deleted with dependents"
 *                   results:
 *                     - gradeId: "507f1f77bcf86cd799439011"
 *                       deletedSubjects: 5
 *                       deletedMembers: 25
 *                       deletedBatches: 3
 *                       deletedSections: 2
 *                       deletedSectionBatches: 6
 *       201:
 *         description: Dependencies found, requires action
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Dependency summary"
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
 *             example:
 *               message: "Dependency summary"
 *               deleted: ["507f1f77bcf86cd799439012"]
 *               dependencies:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   value: "Grade 10"
 *                   dependsOn:
 *                     subjects: 5
 *                     MembersData: 25
 *                     gradeBatches: 3
 *                     gradeSections: 2
 *                     gradeSectionBatches: 6
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
 *                 summary: Missing grade IDs
 *                 value:
 *                   message: "Grade ID(s) required"
 *               conflicting_options:
 *                 summary: Conflicting options
 *                 value:
 *                   message: "Only one of archive or transfer can be requested at a time."
 *               invalid_archive:
 *                 summary: Invalid archive parameter
 *                 value:
 *                   message: "The archive parameter must be a boolean (true or false)."
 *               multiple_transfer:
 *                 summary: Multiple grades for transfer
 *                 value:
 *                   message: "Please select one grade to transfer dependents from."
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
 *                   example: "Unauthorized access"
 *       404:
 *         description: Grade not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No matching Grade found to archive/unarchive"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 *                 error:
 *                   type: string
 *                   example: "Database connection failed"
 */

router.delete('/gradesInInstitute',gradesCt.deleteGradesInInstitute);

module.exports = router;