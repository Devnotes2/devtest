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
 *         _id:
 *           type: string
 *           description: Unique grade batch identifier
 *           example: "507f1f77bcf86cd799439011"
 *         batch:
 *           type: string
 *           description: Grade batch name (e.g., 2023-24, 2024-25, A, B, Morning, Evening)
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
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     
 *     GradeBatchWithDetails:
 *       allOf:
 *         - $ref: '#/components/schemas/GradeBatch'
 *         - type: object
 *           properties:
 *             instituteName:
 *               type: string
 *               description: Institute name
 *               example: "ABC School"
 *             departmentName:
 *               type: string
 *               description: Department name
 *               example: "Science Department"
 *             gradeName:
 *               type: string
 *               description: Grade name
 *               example: "Grade 10"
 *             gradeCode:
 *               type: string
 *               description: Grade code
 *               example: "G10"
 *     
 *     GradeBatchCreateRequest:
 *       type: object
 *       required:
 *         - batch
 *         - instituteId
 *         - departmentId
 *         - gradeId
 *       properties:
 *         batch:
 *           type: string
 *           description: Grade batch name
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
 *     
 *     GradeBatchUpdateRequest:
 *       type: object
 *       required:
 *         - _id
 *         - updatedData
 *       properties:
 *         _id:
 *           type: string
 *           description: Grade batch ID to update
 *           example: "507f1f77bcf86cd799439011"
 *         updatedData:
 *           type: object
 *           properties:
 *             batch:
 *               type: string
 *               description: Updated batch name
 *               example: "2024-25"
 *             description:
 *               type: string
 *               description: Updated description
 *               example: "Updated Grade 10 Batch for Academic Year 2024-25"
 *     
 *     GradeBatchDeleteRequest:
 *       type: object
 *       required:
 *         - ids
 *       properties:
 *         ids:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of grade batch IDs to delete
 *           example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *         deleteDependents:
 *           type: boolean
 *           description: Whether to delete dependent records
 *           example: false
 *         transferTo:
 *           type: string
 *           description: Transfer dependents to this grade batch ID
 *           example: "507f1f77bcf86cd799439013"
 *         archive:
 *           type: boolean
 *           description: Archive/unarchive the grade batch
 *           example: true
 *     
 *     GradeBatchListResponse:
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
 *             $ref: '#/components/schemas/GradeBatchWithDetails'
 *     
 *     GradeBatchDropdownResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               batch:
 *                 type: string
 *                 example: "2023-24"
 *     
 *     GradeBatchCreateResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Grade Batch added successfully!"
 *         data:
 *           $ref: '#/components/schemas/GradeBatch'
 *     
 *     GradeBatchUpdateResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Grade Batch updated successfully"
 *     
 *     GradeBatchDeleteResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Grade Batch(s) deleted successfully"
 *         deleted:
 *           type: array
 *           items:
 *             type: string
 *           description: IDs of successfully deleted grade batches
 *         dependencies:
 *           type: array
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
 *     GradeBatchArchiveResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Grade Batch(s) archived successfully"
 *         archiveResult:
 *           type: object
 *           properties:
 *             archivedCount:
 *               type: integer
 *     
 *     ValidationError:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Duplicate value"
 *         details:
 *           type: string
 *           example: "Batch '2023-24' already exists in this grade"
 *         field:
 *           type: string
 *           example: "batch"
 *         value:
 *           type: string
 *           example: "2023-24"
 *         suggestion:
 *           type: string
 *           example: "Batch names must be unique within each grade"
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
 *     summary: Get grade batches in institute with comprehensive filtering
 *     tags: [Grade Batches]
 *     description: |
 *       Retrieve grade batches with advanced filtering, pagination, and aggregation options.
 *       
 *       **Key Features:**
 *       - Pagination support with customizable page size
 *       - Multiple filter combinations (institute, department, grade)
 *       - Dropdown mode for simple ID/name pairs
 *       - Aggregation with related data (institute, department, grade details)
 *       - ID-based filtering for specific records
 *       
 *       **Parameter Combinations:**
 *       - **Basic List**: No parameters (returns all with pagination)
 *       - **Filtered List**: Use instituteId, departmentId, gradeId individually or combined
 *       - **Dropdown Mode**: Set dropdown=true for simple _id/batch pairs
 *       - **Specific Records**: Use ids array to get specific grade batches
 *       - **Aggregated Data**: Use aggregate=true (default) for related data
 *       - **Simple Data**: Use aggregate=false for basic grade batch data only
 *       
 *       **Examples:**
 *       - Get all: `/gradeBatchesInInstitute`
 *       - By institute: `/gradeBatchesInInstitute?instituteId=507f1f77bcf86cd799439011`
 *       - By grade: `/gradeBatchesInInstitute?gradeId=507f1f77bcf86cd799439013`
 *       - By department: `/gradeBatchesInInstitute?departmentId=507f1f77bcf86cd799439012`
 *       - Combined filters: `/gradeBatchesInInstitute?instituteId=507f1f77bcf86cd799439011&gradeId=507f1f77bcf86cd799439013`
 *       - Dropdown: `/gradeBatchesInInstitute?dropdown=true&gradeId=507f1f77bcf86cd799439013`
 *       - Specific IDs: `/gradeBatchesInInstitute?ids=507f1f77bcf86cd799439011,507f1f77bcf86cd799439012`
 *       - Paginated: `/gradeBatchesInInstitute?page=2&limit=5`
 *       - Simple data: `/gradeBatchesInInstitute?aggregate=false&page=1&limit=10`
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination (starts from 1)
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page (max 100)
 *         example: 10
 *       - in: query
 *         name: instituteId
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Filter by specific institute ID (MongoDB ObjectId)
 *         example: "507f1f77bcf86cd799439011"
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Filter by specific department ID (MongoDB ObjectId)
 *         example: "507f1f77bcf86cd799439012"
 *       - in: query
 *         name: gradeId
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Filter by specific grade ID (MongoDB ObjectId)
 *         example: "507f1f77bcf86cd799439013"
 *       - in: query
 *         name: ids
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             pattern: '^[0-9a-fA-F]{24}$'
 *         style: form
 *         explode: false
 *         description: Array of specific grade batch IDs to retrieve (comma-separated)
 *         example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *       - in: query
 *         name: dropdown
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Return simplified data with only _id and batch fields for dropdowns
 *         example: true
 *       - in: query
 *         name: aggregate
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Include related data (institute, department, grade details) in response
 *         example: true
 *     responses:
 *       200:
 *         description: Grade batches retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/GradeBatchListResponse'
 *                 - $ref: '#/components/schemas/GradeBatchDropdownResponse'
 *             examples:
 *               full_list:
 *                 summary: Full list with aggregated data
 *                 value:
 *                   count: 10
 *                   filteredDocs: 25
 *                   totalDocs: 100
 *                   data:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       batch: "2023-24"
 *                       instituteId: "507f1f77bcf86cd799439012"
 *                       departmentId: "507f1f77bcf86cd799439013"
 *                       gradeId: "507f1f77bcf86cd799439014"
 *                       description: "Grade 10 Batch for Academic Year 2023-24"
 *                       archive: false
 *                       createdAt: "2023-01-15T10:30:00.000Z"
 *                       updatedAt: "2023-01-15T10:30:00.000Z"
 *                       instituteName: "ABC School"
 *                       departmentName: "Science Department"
 *                       gradeName: "Grade 10"
 *                       gradeCode: "G10"
 *               dropdown_list:
 *                 summary: Dropdown format
 *                 value:
 *                   data:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       batch: "2023-24"
 *                     - _id: "507f1f77bcf86cd799439012"
 *                       batch: "2024-25"
 *               filtered_list:
 *                 summary: Filtered by grade
 *                 value:
 *                   count: 5
 *                   filteredDocs: 5
 *                   totalDocs: 100
 *                   data:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       batch: "2023-24"
 *                       instituteId: "507f1f77bcf86cd799439012"
 *                       departmentId: "507f1f77bcf86cd799439013"
 *                       gradeId: "507f1f77bcf86cd799439014"
 *                       description: "Grade 10 Batch for Academic Year 2023-24"
 *                       archive: false
 *                       instituteName: "ABC School"
 *                       departmentName: "Science Department"
 *                       gradeName: "Grade 10"
 *                       gradeCode: "G10"
 *       400:
 *         description: Bad request - invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             example:
 *               error: "Invalid parameter"
 *               details: "Invalid ObjectId format for instituteId"
 *               field: "instituteId"
 *               value: "invalid-id"
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             example:
 *               error: "Unauthorized"
 *               details: "Invalid or missing authentication token"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             example:
 *               error: "Server error"
 *               details: "Database connection failed"
 */

router.get('/gradeBatchesInInstitute',gradeBatchesCt.gradeBatchesInInstituteAg);

/**
 * @swagger
 * /instituteAggreRt/gradeBatchesInInstitute:
 *   post:
 *     summary: Create a new grade batch in institute
 *     tags: [Grade Batches]
 *     description: |
 *       Create a new grade batch within an institute. The batch name must be unique within each grade.
 *       
 *       **Validation Rules:**
 *       - All required fields must be provided
 *       - Batch name must be unique within the same grade and institute
 *       - All referenced IDs (instituteId, departmentId, gradeId) must exist
 *       - Batch name cannot be empty or contain only whitespace
 *       
 *       **Business Logic:**
 *       - Creates a compound unique index on (instituteId, gradeId, batch)
 *       - Automatically sets archive to false
 *       - Adds timestamps (createdAt, updatedAt)
 *       - Validates referential integrity with related collections
 *       
 *       **Example Use Cases:**
 *       - Creating academic year batches (2023-24, 2024-25)
 *       - Creating section batches (A, B, C)
 *       - Creating time-based batches (Morning, Evening)
 *       - Creating program-specific batches (Regular, Advanced)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GradeBatchCreateRequest'
 *           examples:
 *             academic_year_batch:
 *               summary: Academic Year Batch
 *               value:
 *                 batch: "2023-24"
 *                 instituteId: "507f1f77bcf86cd799439011"
 *                 departmentId: "507f1f77bcf86cd799439012"
 *                 gradeId: "507f1f77bcf86cd799439013"
 *                 description: "Grade 10 Batch for Academic Year 2023-24"
 *             section_batch:
 *               summary: Section Batch
 *               value:
 *                 batch: "A"
 *                 instituteId: "507f1f77bcf86cd799439011"
 *                 departmentId: "507f1f77bcf86cd799439012"
 *                 gradeId: "507f1f77bcf86cd799439013"
 *                 description: "Grade 10 Section A"
 *             time_based_batch:
 *               summary: Time-based Batch
 *               value:
 *                 batch: "Morning"
 *                 instituteId: "507f1f77bcf86cd799439011"
 *                 departmentId: "507f1f77bcf86cd799439012"
 *                 gradeId: "507f1f77bcf86cd799439013"
 *                 description: "Grade 10 Morning Shift"
 *             program_batch:
 *               summary: Program-specific Batch
 *               value:
 *                 batch: "Advanced"
 *                 instituteId: "507f1f77bcf86cd799439011"
 *                 departmentId: "507f1f77bcf86cd799439012"
 *                 gradeId: "507f1f77bcf86cd799439013"
 *                 description: "Grade 10 Advanced Program"
 *             minimal_batch:
 *               summary: Minimal Required Fields
 *               value:
 *                 batch: "2024-25"
 *                 instituteId: "507f1f77bcf86cd799439011"
 *                 departmentId: "507f1f77bcf86cd799439012"
 *                 gradeId: "507f1f77bcf86cd799439013"
 *     responses:
 *       200:
 *         description: Grade batch created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GradeBatchCreateResponse'
 *             examples:
 *               success_response:
 *                 summary: Successful creation
 *                 value:
 *                   message: "Grade Batch added successfully!"
 *                   data:
 *                     _id: "507f1f77bcf86cd799439015"
 *                     batch: "2023-24"
 *                     instituteId: "507f1f77bcf86cd799439011"
 *                     departmentId: "507f1f77bcf86cd799439012"
 *                     gradeId: "507f1f77bcf86cd799439013"
 *                     description: "Grade 10 Batch for Academic Year 2023-24"
 *                     archive: false
 *                     createdAt: "2023-01-15T10:30:00.000Z"
 *                     updatedAt: "2023-01-15T10:30:00.000Z"
 *       400:
 *         description: Bad request - validation error or duplicate batch
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             examples:
 *               duplicate_batch:
 *                 summary: Duplicate batch name
 *                 value:
 *                   error: "Duplicate value"
 *                   details: "Batch '2023-24' already exists in this grade"
 *                   field: "batch"
 *                   value: "2023-24"
 *                   suggestion: "Batch name must be unique within this grade"
 *               missing_required:
 *                 summary: Missing required field
 *                 value:
 *                   error: "Validation error"
 *                   details: "Batch name is required"
 *                   field: "batch"
 *                   value: ""
 *                   suggestion: "Please provide a valid batch name"
 *               invalid_objectid:
 *                 summary: Invalid ObjectId format
 *                 value:
 *                   error: "Validation error"
 *                   details: "Invalid ObjectId format for instituteId"
 *                   field: "instituteId"
 *                   value: "invalid-id"
 *                   suggestion: "Please provide a valid 24-character ObjectId"
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             example:
 *               error: "Unauthorized"
 *               details: "Invalid or missing authentication token"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             example:
 *               error: "Failed to add grade batch"
 *               details: "Database connection failed"
 */

router.post('/gradeBatchesInInstitute',gradeBatchesCt.createGradeBatchesInInstitute);

/**
 * @swagger
 * /instituteAggreRt/gradeBatchesInInstitute:
 *   put:
 *     summary: Update grade batch in institute
 *     tags: [Grade Batches]
 *     description: |
 *       Update existing grade batch information within an institute. Only provided fields will be updated.
 *       
 *       **Update Rules:**
 *       - Batch name must remain unique within the same grade and institute
 *       - Only non-archived grade batches can be updated
 *       - All referenced IDs must exist if being updated
 *       - Empty or whitespace-only batch names are not allowed
 *       
 *       **Business Logic:**
 *       - Validates uniqueness before updating
 *       - Updates only the provided fields (partial updates supported)
 *       - Automatically updates the updatedAt timestamp
 *       - Maintains referential integrity with related collections
 *       
 *       **Update Scenarios:**
 *       - Update batch name only
 *       - Update description only
 *       - Update both batch name and description
 *       - Update any combination of allowed fields
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GradeBatchUpdateRequest'
 *           examples:
 *             update_batch_name:
 *               summary: Update batch name only
 *               value:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 updatedData:
 *                   batch: "2024-25"
 *             update_description:
 *               summary: Update description only
 *               value:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 updatedData:
 *                   description: "Updated Grade 10 Batch for Academic Year 2024-25"
 *             update_both:
 *               summary: Update batch name and description
 *               value:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 updatedData:
 *                   batch: "2024-25"
 *                   description: "Updated Grade 10 Batch for Academic Year 2024-25"
 *             rename_section:
 *               summary: Rename section batch
 *               value:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 updatedData:
 *                   batch: "B"
 *                   description: "Grade 10 Section B"
 *             update_time_batch:
 *               summary: Update time-based batch
 *               value:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 updatedData:
 *                   batch: "Evening"
 *                   description: "Grade 10 Evening Shift"
 *     responses:
 *       200:
 *         description: Grade batch updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GradeBatchUpdateResponse'
 *             examples:
 *               success_update:
 *                 summary: Successful update
 *                 value:
 *                   message: "Grade Batch updated successfully"
 *               no_changes:
 *                 summary: No changes made
 *                 value:
 *                   message: "No updates were made"
 *       400:
 *         description: Bad request - validation error or duplicate batch name
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             examples:
 *               duplicate_batch:
 *                 summary: Duplicate batch name
 *                 value:
 *                   error: "Duplicate value"
 *                   details: "Batch '2024-25' already exists in this grade"
 *                   field: "batch"
 *                   value: "2024-25"
 *                   suggestion: "Batch names must be unique within each grade"
 *               invalid_objectid:
 *                 summary: Invalid ObjectId format
 *                 value:
 *                   error: "Validation error"
 *                   details: "Invalid ObjectId format for _id"
 *                   field: "_id"
 *                   value: "invalid-id"
 *                   suggestion: "Please provide a valid 24-character ObjectId"
 *               empty_batch_name:
 *                 summary: Empty batch name
 *                 value:
 *                   error: "Validation error"
 *                   details: "Batch name cannot be empty"
 *                   field: "batch"
 *                   value: ""
 *                   suggestion: "Please provide a valid batch name"
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             example:
 *               error: "Unauthorized"
 *               details: "Invalid or missing authentication token"
 *       404:
 *         description: Grade batch not found or no changes made
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             example:
 *               error: "Not found"
 *               details: "No matching grade batch found or values are unchanged"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             example:
 *               error: "Failed to update grade batch"
 *               details: "Database connection failed"
 */

router.put('/gradeBatchesInInstitute',gradeBatchesCt.updateGradeBatchesInInstitute);

/**
 * @swagger
 * /instituteAggreRt/gradeBatchesInInstitute:
 *   delete:
 *     summary: Delete grade batch(s) in institute with dependency management
 *     tags: [Grade Batches]
 *     description: |
 *       Delete one or more grade batches from an institute with comprehensive dependency management options.
 *       
 *       **Deletion Modes:**
 *       - **Simple Delete**: Delete grade batches with no dependencies
 *       - **Archive/Unarchive**: Soft delete by archiving grade batches
 *       - **Transfer Dependencies**: Move dependent records to another grade batch
 *       - **Cascade Delete**: Delete grade batches and all dependent records
 *       - **Dependency Check**: Get dependency information before deletion
 *       
 *       **Dependency Management:**
 *       - Grade batches may have dependent records (e.g., MembersData)
 *       - System checks for dependencies before deletion
 *       - Provides options to handle dependencies safely
 *       - Supports bulk operations on multiple grade batches
 *       
 *       **Business Rules:**
 *       - Only one operation type can be performed at a time
 *       - Archive and transfer operations are mutually exclusive
 *       - Transfer requires exactly one source grade batch
 *       - Cascade delete removes all dependent records permanently
 *       
 *       **Response Codes:**
 *       - **200**: Successful deletion/archive/transfer
 *       - **201**: Dependencies found, requires action (deleteDependents or transferTo)
 *       - **400**: Invalid parameters or conflicting operations
 *       - **404**: No matching grade batches found
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GradeBatchDeleteRequest'
 *           examples:
 *             simple_delete:
 *               summary: Simple deletion (no dependencies)
 *               value:
 *                 ids: ["507f1f77bcf86cd799439011"]
 *             bulk_delete:
 *               summary: Bulk deletion
 *               value:
 *                 ids: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"]
 *             archive_batch:
 *               summary: Archive grade batch
 *               value:
 *                 ids: ["507f1f77bcf86cd799439011"]
 *                 archive: true
 *             unarchive_batch:
 *               summary: Unarchive grade batch
 *               value:
 *                 ids: ["507f1f77bcf86cd799439011"]
 *                 archive: false
 *             transfer_dependencies:
 *               summary: Transfer dependencies to another batch
 *               value:
 *                 ids: ["507f1f77bcf86cd799439011"]
 *                 transferTo: "507f1f77bcf86cd799439012"
 *             cascade_delete:
 *               summary: Delete with all dependencies
 *               value:
 *                 ids: ["507f1f77bcf86cd799439011"]
 *                 deleteDependents: true
 *             check_dependencies:
 *               summary: Check dependencies only
 *               value:
 *                 ids: ["507f1f77bcf86cd799439011"]
 *     responses:
 *       200:
 *         description: Grade batch(s) deleted/archived/transferred successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/GradeBatchDeleteResponse'
 *                 - $ref: '#/components/schemas/GradeBatchArchiveResponse'
 *             examples:
 *               simple_delete_success:
 *                 summary: Simple deletion success
 *                 value:
 *                   message: "Grade Batch(s) deleted successfully"
 *                   deletedCount: 1
 *               bulk_delete_success:
 *                 summary: Bulk deletion success
 *                 value:
 *                   message: "Grade Batch(s) deleted successfully"
 *                   deletedCount: 3
 *               archive_success:
 *                 summary: Archive success
 *                 value:
 *                   message: "Grade Batch(s) archived successfully"
 *                   archiveResult:
 *                     archivedCount: 1
 *               unarchive_success:
 *                 summary: Unarchive success
 *                 value:
 *                   message: "Grade Batch(s) unarchived successfully"
 *                   archiveResult:
 *                     archivedCount: 1
 *               transfer_success:
 *                 summary: Transfer success
 *                 value:
 *                   message: "Dependents transferred and Grade Batch(s) deleted"
 *                   transfer:
 *                     transferredCount: 5
 *                   deletedCount: 1
 *               cascade_delete_success:
 *                 summary: Cascade deletion success
 *                 value:
 *                   message: "Deleted with dependents"
 *                   results:
 *                     - gradeBatchId: "507f1f77bcf86cd799439011"
 *                       deletedCount: 1
 *                       dependentsDeleted: 5
 *       201:
 *         description: Dependencies found - action required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GradeBatchDeleteResponse'
 *             example:
 *               message: "Dependency summary"
 *               deleted: []
 *               dependencies:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   value: "2023-24"
 *                   dependsOn:
 *                     MembersData: 5
 *       400:
 *         description: Bad request - validation error or conflicting operations
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             examples:
 *               missing_ids:
 *                 summary: Missing grade batch IDs
 *                 value:
 *                   error: "Validation error"
 *                   details: "Grade Batch ID(s) required"
 *                   field: "ids"
 *                   value: null
 *                   suggestion: "Please provide an array of grade batch IDs"
 *               conflicting_operations:
 *                 summary: Conflicting operations
 *                 value:
 *                   error: "Validation error"
 *                   details: "Only one of archive or transfer can be requested at a time"
 *                   field: "archive"
 *                   value: true
 *                   suggestion: "Choose either archive or transfer, not both"
 *               invalid_archive_type:
 *                 summary: Invalid archive parameter
 *                 value:
 *                   error: "Validation error"
 *                   details: "The archive parameter must be a boolean (true or false)"
 *                   field: "archive"
 *                   value: "yes"
 *                   suggestion: "Use true or false for archive parameter"
 *               transfer_multiple_sources:
 *                 summary: Transfer from multiple sources
 *                 value:
 *                   error: "Validation error"
 *                   details: "Please select one Grade Batch to transfer dependents from"
 *                   field: "ids"
 *                   value: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *                   suggestion: "Transfer operation supports only one source grade batch"
 *               both_transfer_and_delete:
 *                 summary: Both transfer and delete specified
 *                 value:
 *                   error: "Validation error"
 *                   details: "Either transfer or delete dependencies"
 *                   field: "deleteDependents"
 *                   value: true
 *                   suggestion: "Choose either transferTo or deleteDependents, not both"
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             example:
 *               error: "Unauthorized"
 *               details: "Invalid or missing authentication token"
 *       404:
 *         description: No matching grade batches found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             example:
 *               error: "Not found"
 *               details: "No matching Grade Batch found to archive/unarchive"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             example:
 *               error: "Server error"
 *               details: "Database connection failed"
 */

router.delete('/gradeBatchesInInstitute',gradeBatchesCt.deleteGradeBatchesInInstitute);

module.exports = router;