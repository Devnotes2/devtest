const express = require('express');
const router = express.Router();

const gradeSectionBatchesCt = require('../../../Controller/instituteData/aggregation/gradeSectionBatchesCt');

/**
 * @swagger
 * components:
 *   schemas:
 *     GradeSectionBatch:
 *       type: object
 *       required:
 *         - sectionBatchName
 *         - instituteId
 *         - departmentId
 *         - gradeId
 *         - sectionId
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the grade section batch
 *         sectionBatchName:
 *           type: string
 *           description: Grade section batch name (must be unique within the section)
 *         instituteId:
 *           type: string
 *           description: Associated institute ID
 *         departmentId:
 *           type: string
 *           description: Associated department ID
 *         gradeId:
 *           type: string
 *           description: Associated grade ID
 *         sectionId:
 *           type: string
 *           description: Associated grade section ID
 *         description:
 *           type: string
 *           description: Grade section batch description
 *         archive:
 *           type: boolean
 *           default: false
 *           description: Archive status
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     GradeSectionBatchWithLookups:
 *       type: object
 *       allOf:
 *         - $ref: '#/components/schemas/GradeSectionBatch'
 *         - type: object
 *           properties:
 *             instituteName:
 *               type: string
 *               description: Name of the associated institute
 *             departmentName:
 *               type: string
 *               description: Name of the associated department
 *             gradeName:
 *               type: string
 *               description: Name of the associated grade
 *             gradeCode:
 *               type: string
 *               description: Code of the associated grade
 *             sectionName:
 *               type: string
 *               description: Name of the associated section
 *     GradeSectionBatchCreateRequest:
 *       type: object
 *       required:
 *         - sectionBatchName
 *         - instituteId
 *         - departmentId
 *         - gradeId
 *         - sectionId
 *       properties:
 *         sectionBatchName:
 *           type: string
 *           description: Grade section batch name (must be unique within the section)
 *         instituteId:
 *           type: string
 *           description: Associated institute ID
 *         departmentId:
 *           type: string
 *           description: Associated department ID
 *         gradeId:
 *           type: string
 *           description: Associated grade ID
 *         sectionId:
 *           type: string
 *           description: Associated grade section ID
 *         description:
 *           type: string
 *           description: Grade section batch description
 *     GradeSectionBatchUpdateRequest:
 *       type: object
 *       required:
 *         - _id
 *         - updatedData
 *       properties:
 *         _id:
 *           type: string
 *           description: Grade section batch ID to update
 *         updatedData:
 *           type: object
 *           properties:
 *             sectionBatchName:
 *               type: string
 *               description: Updated section batch name
 *             description:
 *               type: string
 *               description: Updated description
 *             archive:
 *               type: boolean
 *               description: Archive status
 *     GradeSectionBatchDeleteRequest:
 *       type: object
 *       required:
 *         - ids
 *       properties:
 *         ids:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of grade section batch IDs to delete
 *         deleteDependents:
 *           type: boolean
 *           description: Whether to delete dependent records
 *         transferTo:
 *           type: string
 *           description: ID to transfer dependents to (only when deleting single record)
 *         archive:
 *           type: boolean
 *           description: Whether to archive instead of delete
 *     GradeSectionBatchListResponse:
 *       type: object
 *       properties:
 *         count:
 *           type: integer
 *           description: Number of items in current page
 *         filteredDocs:
 *           type: integer
 *           description: Total number of documents matching filters
 *         totalDocs:
 *           type: integer
 *           description: Total number of documents in collection
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/GradeSectionBatchWithLookups'
 *     GradeSectionBatchDropdownResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               sectionBatchName:
 *                 type: string
 *     GradeSectionBatchCreateResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/GradeSectionBatch'
 *     GradeSectionBatchUpdateResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *     GradeSectionBatchDeleteResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         deletedCount:
 *           type: integer
 *     GradeSectionBatchArchiveResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         archiveResult:
 *           type: object
 *           properties:
 *             archivedCount:
 *               type: integer
 *     GradeSectionBatchDependencyResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         deleted:
 *           type: array
 *           items:
 *             type: string
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
 *                 properties:
 *                   MembersData:
 *                     type: integer
 *     GradeSectionBatchTransferResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         transfer:
 *           type: object
 *           description: Transfer operation details
 *         deletedCount:
 *           type: integer
 *     GradeSectionBatchDeleteWithDependentsResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         results:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               gradeSectionBatchId:
 *                 type: string
 *               deletedCount:
 *                 type: integer
 *               dependentsDeleted:
 *                 type: object
 *                 properties:
 *                   MembersData:
 *                     type: integer
 *     DuplicateErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *         details:
 *           type: string
 *         field:
 *           type: string
 *         value:
 *           type: string
 *         suggestion:
 *           type: string
 *     ValidationErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *     ServerErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         error:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: Grade Section Batches
 *   description: Grade section batch management endpoints within institutes
 */

/**
 * @swagger
 * /instituteAggreRt/gradeSectionBatchesInInstitute:
 *   get:
 *     summary: Get grade section batches in institute
 *     tags: [Grade Section Batches]
 *     description: |
 *       Get all grade section batches within an institute with comprehensive filtering, pagination, and aggregation options.
 *       **Key Features:**
 *       - Pagination support with page and limit parameters
 *       - Multiple filtering options (institute, department, grade, section)
 *       - Dropdown mode for simple ID/name pairs
 *       - Aggregation with lookup data (institute, department, grade, section names)
 *       - Support for specific ID filtering with aggregation control
 *       **Parameter Combinations:**
 *       - **Basic List**: No parameters - returns all records with pagination
 *       - **Filtered List**: Use instituteId, departmentId, gradeId, sectionId for filtering
 *       - **Dropdown Mode**: Set dropdown=true for simple ID/name pairs
 *       - **Specific Records**: Use ids array to get specific records
 *       - **Aggregation Control**: Use aggregate=false to disable lookups for specific IDs
 *       **Response Types:**
 *       - Standard list with full aggregation data
 *       - Dropdown format with minimal data
 *       - Paginated results with count information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number for pagination (starts from 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page (max 100)
 *       - in: query
 *         name: instituteId
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Filter by specific institute ID (MongoDB ObjectId)
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Filter by specific department ID (MongoDB ObjectId)
 *       - in: query
 *         name: gradeId
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Filter by specific grade ID (MongoDB ObjectId)
 *       - in: query
 *         name: sectionId
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Filter by specific grade section ID (MongoDB ObjectId)
 *       - in: query
 *         name: ids
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             pattern: '^[0-9a-fA-F]{24}$'
 *         style: form
 *         explode: false
 *         description: Array of specific grade section batch IDs to retrieve
 *       - in: query
 *         name: aggregate
 *         schema:
 *           type: string
 *           enum: [true, false]
 *           default: true
 *         description: |
 *           Whether to include aggregation with lookup data (institute, department, grade, section names).
 *           Set to 'false' for faster response when only basic data is needed.
 *       - in: query
 *         name: dropdown
 *         schema:
 *           type: string
 *           enum: [true, false]
 *           default: false
 *         description: |
 *           Return simplified dropdown format with only _id and sectionBatchName.
 *           Ignores pagination and aggregation when true.
 *       - in: query
 *         name: sortField
 *         schema:
 *           type: string
 *         description: Field to sort by (e.g., sectionBatchName, createdAt, updatedAt)
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
 *         description: Field(s) to filter by (e.g., sectionBatchName, description)
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
 *         description: Grade section batches retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/GradeSectionBatchListResponse'
 *                 - $ref: '#/components/schemas/GradeSectionBatchDropdownResponse'
 *             examples:
 *               full_list_with_aggregation:
 *                 summary: Full list with aggregation data
 *                 description: Complete list with all lookup information
 *                 value:
 *                   count: 10
 *                   filteredDocs: 25
 *                   totalDocs: 100
 *                   data:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       sectionBatchName: "Section A 2023-24"
 *                       instituteId: "507f1f77bcf86cd799439011"
 *                       departmentId: "507f1f77bcf86cd799439012"
 *                       gradeId: "507f1f77bcf86cd799439013"
 *                       sectionId: "507f1f77bcf86cd799439014"
 *                       description: "Grade 10 Section A Batch for Academic Year 2023-24"
 *                       archive: false
 *                       createdAt: "2023-06-01T10:30:00.000Z"
 *                       updatedAt: "2023-06-01T10:30:00.000Z"
 *                       instituteName: "ABC School"
 *                       departmentName: "Science Department"
 *                       gradeName: "Grade 10"
 *                       gradeCode: "G10"
 *                       sectionName: "Section A"
 *               dropdown_format:
 *                 summary: Dropdown format
 *                 description: Simplified format for dropdowns
 *                 value:
 *                   data:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       sectionBatchName: "Section A 2023-24"
 *                     - _id: "507f1f77bcf86cd799439012"
 *                       sectionBatchName: "Section B 2023-24"
 *               filtered_by_grade:
 *                 summary: Filtered by grade
 *                 description: Results filtered by specific grade ID
 *                 value:
 *                   count: 5
 *                   filteredDocs: 5
 *                   totalDocs: 100
 *                   data:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       sectionBatchName: "Section A 2023-24"
 *                       gradeId: "507f1f77bcf86cd799439013"
 *                       gradeName: "Grade 10"
 *                       sectionName: "Section A"
 *               specific_ids:
 *                 summary: Specific IDs
 *                 description: Results for specific grade section batch IDs
 *                 value:
 *                   count: 2
 *                   filteredDocs: 2
 *                   totalDocs: 100
 *                   data:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       sectionBatchName: "Section A 2023-24"
 *                       instituteName: "ABC School"
 *                       gradeName: "Grade 10"
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 *               error: "Database connection failed"
 */

router.get('/gradeSectionBatchesInInstitute',gradeSectionBatchesCt.gradeSectionBatchesInInstituteAg);

/**
 * @swagger
 * /instituteAggreRt/gradeSectionBatchesInInstitute:
 *   post:
 *     summary: Create a new grade section batch in institute
 *     tags: [Grade Section Batches]
 *     description: |
 *       Create a new grade section batch within an institute. The section batch name must be unique within the same section.
 *       **Validation Rules:**
 *       - All required fields must be provided
 *       - sectionBatchName must be unique within the same section and institute
 *       - All ID fields must be valid MongoDB ObjectIds
 *       - The referenced institute, department, grade, and section must exist
 *       **Business Logic:**
 *       - Creates a new grade section batch with the provided information
 *       - Automatically sets archive to false and timestamps
 *       - Validates uniqueness constraints before saving
 *       - Returns the created record with generated _id
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GradeSectionBatchCreateRequest'
 *           examples:
 *             basic_creation:
 *               summary: Basic grade section batch creation
 *               description: Create a new grade section batch with minimal required fields
 *               value:
 *                 sectionBatchName: "Section A 2023-24"
 *                 instituteId: "507f1f77bcf86cd799439011"
 *                 departmentId: "507f1f77bcf86cd799439012"
 *                 gradeId: "507f1f77bcf86cd799439013"
 *                 sectionId: "507f1f77bcf86cd799439014"
 *             with_description:
 *               summary: With description
 *               description: Create a grade section batch with additional description
 *               value:
 *                 sectionBatchName: "Section B 2023-24"
 *                 instituteId: "507f1f77bcf86cd799439011"
 *                 departmentId: "507f1f77bcf86cd799439012"
 *                 gradeId: "507f1f77bcf86cd799439013"
 *                 sectionId: "507f1f77bcf86cd799439015"
 *                 description: "Grade 10 Section B Batch for Academic Year 2023-24"
 *             multiple_batches:
 *               summary: Multiple batches for same section
 *               description: Example of creating multiple batches for the same section
 *               value:
 *                 sectionBatchName: "Section A 2024-25"
 *                 instituteId: "507f1f77bcf86cd799439011"
 *                 departmentId: "507f1f77bcf86cd799439012"
 *                 gradeId: "507f1f77bcf86cd799439013"
 *                 sectionId: "507f1f77bcf86cd799439014"
 *                 description: "Grade 10 Section A Batch for Academic Year 2024-25"
 *     responses:
 *       200:
 *         description: Grade section batch created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GradeSectionBatchCreateResponse'
 *             examples:
 *               successful_creation:
 *                 summary: Successful creation
 *                 description: Grade section batch created successfully
 *                 value:
 *                   message: "Grade Section Batch added successfully!"
 *                   data:
 *                     _id: "507f1f77bcf86cd799439016"
 *                     sectionBatchName: "Section A 2023-24"
 *                     instituteId: "507f1f77bcf86cd799439011"
 *                     departmentId: "507f1f77bcf86cd799439012"
 *                     gradeId: "507f1f77bcf86cd799439013"
 *                     sectionId: "507f1f77bcf86cd799439014"
 *                     description: "Grade 10 Section A Batch for Academic Year 2023-24"
 *                     archive: false
 *                     createdAt: "2023-06-01T10:30:00.000Z"
 *                     updatedAt: "2023-06-01T10:30:00.000Z"
 *       400:
 *         description: Bad request - validation error or duplicate value
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ValidationErrorResponse'
 *                 - $ref: '#/components/schemas/DuplicateErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: Validation error
 *                 description: Missing required fields
 *                 value:
 *                   message: "Validation failed"
 *                   errors:
 *                     - field: "sectionBatchName"
 *                       message: "Section batch name is required"
 *               duplicate_error:
 *                 summary: Duplicate section batch name
 *                 description: Section batch name already exists in the same section
 *                 value:
 *                   error: "Duplicate value"
 *                   details: "Section batch name 'Section A 2023-24' already exists in this section"
 *                   field: "sectionBatchName"
 *                   value: "Section A 2023-24"
 *                   suggestion: "Section batch names must be unique within each section"
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 *               error: "Database connection failed"
 */

router.post('/gradeSectionBatchesInInstitute',gradeSectionBatchesCt.createGradeSectionBatchesInInstitute);

/**
 * @swagger
 * /instituteAggreRt/gradeSectionBatchesInInstitute:
 *   put:
 *     summary: Update grade section batch in institute
 *     tags: [Grade Section Batches]
 *     description: |
 *       Update existing grade section batch information within an institute. Only the fields provided in updatedData will be updated.
 *       **Update Rules:**
 *       - The _id field is required to identify the record to update
 *       - Only fields provided in updatedData will be modified
 *       - sectionBatchName must remain unique within the same section if updated
 *       - Archive status can be toggled
 *       - Timestamps are automatically updated
 *       **Business Logic:**
 *       - Validates the existence of the grade section batch
 *       - Checks uniqueness constraints for updated fields
 *       - Updates only the specified fields
 *       - Returns success message with update confirmation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GradeSectionBatchUpdateRequest'
 *           examples:
 *             update_name:
 *               summary: Update section batch name
 *               description: Update the name of a grade section batch
 *               value:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 updatedData:
 *                   sectionBatchName: "Section A 2023-24 Updated"
 *             update_description:
 *               summary: Update description
 *               description: Update the description of a grade section batch
 *               value:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 updatedData:
 *                   description: "Updated description for the batch"
 *             update_multiple_fields:
 *               summary: Update multiple fields
 *               description: Update multiple fields at once
 *               value:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 updatedData:
 *                   sectionBatchName: "Section A 2023-24 Revised"
 *                   description: "Revised description for the batch"
 *             archive_batch:
 *               summary: Archive batch
 *               description: Archive a grade section batch
 *               value:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 updatedData:
 *                   archive: true
 *             unarchive_batch:
 *               summary: Unarchive batch
 *               description: Unarchive a grade section batch
 *               value:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 updatedData:
 *                   archive: false
 *     responses:
 *       200:
 *         description: Grade section batch updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GradeSectionBatchUpdateResponse'
 *             examples:
 *               successful_update:
 *                 summary: Successful update
 *                 description: Grade section batch updated successfully
 *                 value:
 *                   message: "Grade Section Batch updated successfully"
 *               no_changes:
 *                 summary: No changes made
 *                 description: Update request made but no changes were applied
 *                 value:
 *                   message: "No updates were made"
 *       400:
 *         description: Bad request - validation error or duplicate value
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ValidationErrorResponse'
 *                 - $ref: '#/components/schemas/DuplicateErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: Validation error
 *                 description: Invalid request format
 *                 value:
 *                   message: "Invalid request format"
 *               duplicate_error:
 *                 summary: Duplicate section batch name
 *                 description: Updated section batch name already exists
 *                 value:
 *                   error: "Duplicate value"
 *                   details: "Section batch name 'Section A 2023-24 Updated' already exists in this section"
 *                   field: "sectionBatchName"
 *                   value: "Section A 2023-24 Updated"
 *                   suggestion: "Section batch names must be unique within each section"
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       404:
 *         description: Grade section batch not found or no changes made
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 *               error: "Database connection failed"
 */

router.put('/gradeSectionBatchesInInstitute',gradeSectionBatchesCt.updateGradeSectionBatchesInInstitute);

/**
 * @swagger
 * /instituteAggreRt/gradeSectionBatchesInInstitute:
 *   delete:
 *     summary: Delete grade section batch in institute
 *     tags: [Grade Section Batches]
 *     description: |
 *       Delete grade section batch(es) from an institute with comprehensive dependency handling options.
 *       **Deletion Options:**
 *       - **Simple Delete**: Delete records with no dependencies
 *       - **Archive**: Archive records instead of deleting (set archive=true)
 *       - **Transfer Dependencies**: Transfer dependent records to another grade section batch
 *       - **Delete with Dependencies**: Delete records and all their dependent records
 *       - **Dependency Check**: Get dependency summary without deleting
 *       **Dependency Handling:**
 *       - Grade section batches may have dependent records (e.g., MembersData)
 *       - The system checks for dependencies before deletion
 *       - You can choose how to handle dependent records
 *       - Transfer is only available for single record deletion
 *       **Business Rules:**
 *       - Only one of archive, transferTo, or deleteDependents can be specified
 *       - Archive and transferTo are mutually exclusive
 *       - Transfer requires exactly one ID in the ids array
 *       - Archive must be a boolean value
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GradeSectionBatchDeleteRequest'
 *           examples:
 *             simple_delete:
 *               summary: Simple delete
 *               description: Delete grade section batches with no dependencies
 *               value:
 *                 ids: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *             archive_batches:
 *               summary: Archive batches
 *               description: Archive grade section batches instead of deleting
 *               value:
 *                 ids: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *                 archive: true
 *             unarchive_batches:
 *               summary: Unarchive batches
 *               description: Unarchive grade section batches
 *               value:
 *                 ids: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *                 archive: false
 *             transfer_dependencies:
 *               summary: Transfer dependencies
 *               description: Transfer dependent records to another grade section batch
 *               value:
 *                 ids: ["507f1f77bcf86cd799439011"]
 *                 transferTo: "507f1f77bcf86cd799439013"
 *             delete_with_dependencies:
 *               summary: Delete with dependencies
 *               description: Delete grade section batches and all their dependent records
 *               value:
 *                 ids: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *                 deleteDependents: true
 *             check_dependencies:
 *               summary: Check dependencies
 *               description: Check for dependencies without deleting (default behavior)
 *               value:
 *                 ids: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *     responses:
 *       200:
 *         description: Grade section batch operation completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/GradeSectionBatchDeleteResponse'
 *                 - $ref: '#/components/schemas/GradeSectionBatchArchiveResponse'
 *                 - $ref: '#/components/schemas/GradeSectionBatchTransferResponse'
 *                 - $ref: '#/components/schemas/GradeSectionBatchDeleteWithDependentsResponse'
 *             examples:
 *               simple_delete_success:
 *                 summary: Simple delete success
 *                 description: Grade section batches deleted successfully
 *                 value:
 *                   message: "Grade Section Batch(s) deleted successfully"
 *                   deletedCount: 2
 *               archive_success:
 *                 summary: Archive success
 *                 description: Grade section batches archived successfully
 *                 value:
 *                   message: "Grade Section Batch(s) archived successfully"
 *                   archiveResult:
 *                     archivedCount: 2
 *               transfer_success:
 *                 summary: Transfer success
 *                 description: Dependencies transferred and grade section batch deleted
 *                 value:
 *                   message: "Dependents transferred and Grade Section Batch(s) deleted"
 *                   transfer:
 *                     transferredCount: 5
 *                   deletedCount: 1
 *               delete_with_dependencies_success:
 *                 summary: Delete with dependencies success
 *                 description: Grade section batches and dependencies deleted
 *                 value:
 *                   message: "Deleted with dependents"
 *                   results:
 *                     - gradeSectionBatchId: "507f1f77bcf86cd799439011"
 *                       deletedCount: 1
 *                       dependentsDeleted:
 *                         MembersData: 5
 *       201:
 *         description: Dependency summary - records have dependencies
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GradeSectionBatchDependencyResponse'
 *               deleted: ["507f1f77bcf86cd799439011"]
 *               dependencies:
 *                 - _id: "507f1f77bcf86cd799439012"
 *                   value: "Section B 2023-24"
 *                   dependsOn:
 *                     MembersData: 5
 *       400:
 *         description: Bad request - validation error or invalid operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *             examples:
 *               missing_ids:
 *                 summary: Missing IDs
 *                 description: Grade section batch IDs are required
 *                 value:
 *                   message: "Grade Section Batch ID(s) required"
 *               invalid_archive:
 *                 summary: Invalid archive parameter
 *                 description: Archive parameter must be boolean
 *                 value:
 *                   message: "The archive parameter must be a boolean (true or false)."
 *               conflicting_operations:
 *                 summary: Conflicting operations
 *                 description: Archive and transfer cannot be used together
 *                 value:
 *                   message: "Only one of archive or transfer can be requested at a time."
 *               multiple_transfer:
 *                 summary: Multiple IDs for transfer
 *                 description: Transfer requires exactly one ID
 *                 value:
 *                   message: "Please select one Grade Section Batch to transfer dependents from."
 *               conflicting_dependencies:
 *                 summary: Conflicting dependency options
 *                 description: Cannot both transfer and delete dependencies
 *                 value:
 *                   message: "Either transfer or delete dependencies"
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       404:
 *         description: Grade section batch not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 *               error: "Database connection failed"
 */

router.delete('/gradeSectionBatchesInInstitute',gradeSectionBatchesCt.deleteGradeSectionBatchesInInstitute);

module.exports = router;