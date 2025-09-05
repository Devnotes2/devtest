const express = require('express');
const router = express.Router();

const gradeSectionsCt = require('../../../Controller/instituteData/aggregation/gradeSectionsCt');

/**
 * @swagger
 * components:
 *   schemas:
 *     GradeSection:
 *       type: object
 *       required:
 *         - sectionName
 *         - instituteId
 *         - departmentId
 *         - gradeId
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the grade section
 *           example: "507f1f77bcf86cd799439011"
 *         sectionName:
 *           type: string
 *           description: Grade section name (e.g., Section A, Section B)
 *           example: "Section A"
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
 *           description: Grade section description
 *           example: "Grade 10 Section A - Morning Shift"
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
 *     GradeSectionWithDetails:
 *       type: object
 *       allOf:
 *         - $ref: '#/components/schemas/GradeSection'
 *         - type: object
 *           properties:
 *             instituteName:
 *               type: string
 *               description: Name of the associated institute
 *               example: "ABC School"
 *             departmentName:
 *               type: string
 *               description: Name of the associated department
 *               example: "Science Department"
 *             gradeName:
 *               type: string
 *               description: Name of the associated grade
 *               example: "Grade 10"
 *             gradeCode:
 *               type: string
 *               description: Code of the associated grade
 *               example: "G10"
 *     
 *     GradeSectionCreateRequest:
 *       type: object
 *       required:
 *         - sectionName
 *         - instituteId
 *         - departmentId
 *         - gradeId
 *       properties:
 *         sectionName:
 *           type: string
 *           description: Grade section name (must be unique within the grade)
 *           example: "Section A"
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
 *           description: Grade section description
 *           example: "Grade 10 Section A - Morning Shift"
 *     
 *     GradeSectionUpdateRequest:
 *       type: object
 *       required:
 *         - _id
 *         - updatedData
 *       properties:
 *         _id:
 *           type: string
 *           description: Grade section ID to update
 *           example: "507f1f77bcf86cd799439011"
 *         updatedData:
 *           type: object
 *           properties:
 *             sectionName:
 *               type: string
 *               description: Updated section name
 *               example: "Section A Updated"
 *             description:
 *               type: string
 *               description: Updated description
 *               example: "Updated description"
 *             archive:
 *               type: boolean
 *               description: Archive status
 *               example: false
 *     
 *     GradeSectionDeleteRequest:
 *       type: object
 *       required:
 *         - ids
 *       properties:
 *         ids:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of grade section IDs to delete
 *           example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *         deleteDependents:
 *           type: boolean
 *           description: Whether to delete dependent records
 *           example: false
 *         transferTo:
 *           type: string
 *           description: ID to transfer dependents to (only when deleting single section)
 *           example: "507f1f77bcf86cd799439013"
 *         archive:
 *           type: boolean
 *           description: Archive instead of delete
 *           example: false
 *     
 *     GradeSectionListResponse:
 *       type: object
 *       properties:
 *         count:
 *           type: integer
 *           description: Number of items in current page
 *           example: 10
 *         filteredDocs:
 *           type: integer
 *           description: Total number of documents matching filters
 *           example: 25
 *         totalDocs:
 *           type: integer
 *           description: Total number of documents in collection
 *           example: 100
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/GradeSectionWithDetails'
 *     
 *     GradeSectionDropdownResponse:
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
 *               sectionName:
 *                 type: string
 *                 example: "Section A"
 *     
 *     GradeSectionCreateResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Grade Section added successfully!"
 *         data:
 *           $ref: '#/components/schemas/GradeSection'
 *     
 *     GradeSectionUpdateResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Grade Section updated successfully"
 *     
 *     GradeSectionDeleteResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Grade Section(s) deleted successfully"
 *         deleted:
 *           type: array
 *           items:
 *             type: string
 *           description: IDs of successfully deleted sections
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
 *           description: Sections with dependencies that couldn't be deleted
 *         deletedCount:
 *           type: integer
 *           description: Number of sections deleted
 *     
 *     GradeSectionArchiveResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Grade Section(s) archived successfully"
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
 *           example: "Section name 'Section A' already exists in this grade"
 *         field:
 *           type: string
 *           example: "sectionName"
 *         value:
 *           type: string
 *           example: "Section A"
 *         suggestion:
 *           type: string
 *           example: "Section names must be unique within each grade"
 */

/**
 * @swagger
 * tags:
 *   name: Grade Sections
 *   description: Grade section management endpoints within institutes
 */

/**
 * @swagger
 * /instituteAggreRt/gradeSectionsInInstitute:
 *   get:
 *     summary: Get grade sections in institute with comprehensive filtering and pagination
 *     tags: [Grade Sections]
 *     description: |
 *       Retrieve grade sections with advanced filtering, pagination, and aggregation options.
 *       
 *       **Key Features:**
 *       - Filter by institute, department, or grade
 *       - Get specific sections by IDs
 *       - Dropdown mode for simple ID/name pairs
 *       - Aggregated data with related entity details
 *       - Pagination support
 *       
 *       **Parameter Combinations:**
 *       - **Basic List**: No parameters - returns all sections with pagination
 *       - **Filtered List**: Use instituteId, departmentId, gradeId for filtering
 *       - **Specific Sections**: Use ids array to get specific sections
 *       - **Dropdown Mode**: Set dropdown=true for simple ID/name pairs
 *       - **Aggregated Data**: Set aggregate=true (default) for detailed information
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
 *         name: ids
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: false
 *         description: Array of specific grade section IDs to retrieve
 *         example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *       - in: query
 *         name: instituteId
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Filter by specific institute ID
 *         example: "507f1f77bcf86cd799439011"
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Filter by specific department ID
 *         example: "507f1f77bcf86cd799439012"
 *       - in: query
 *         name: gradeId
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Filter by specific grade ID
 *         example: "507f1f77bcf86cd799439013"
 *       - in: query
 *         name: sectionName
 *         schema:
 *           type: string
 *         description: Filter by section name (partial match)
 *         example: "Section A"
 *       - in: query
 *         name: aggregate
 *         schema:
 *           type: string
 *           enum: [true, false, "true", "false"]
 *           default: "true"
 *         description: |
 *           Whether to return aggregated data with related entity details.
 *           - true: Returns detailed data with institute, department, and grade information
 *           - false: Returns only basic grade section data
 *         example: "true"
 *       - in: query
 *         name: dropdown
 *         schema:
 *           type: string
 *           enum: [true, false, "true", "false"]
 *           default: "false"
 *         description: |
 *           Dropdown mode - returns only ID and sectionName for dropdown lists.
 *           When true, other parameters are ignored except for filtering.
 *         example: "false"
 *     responses:
 *       200:
 *         description: Grade sections retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/GradeSectionListResponse'
 *                 - $ref: '#/components/schemas/GradeSectionDropdownResponse'
 *             examples:
 *               full_data:
 *                 summary: Full aggregated data response
 *                 value:
 *                   count: 2
 *                   filteredDocs: 2
 *                   totalDocs: 15
 *                   data:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       sectionName: "Section A"
 *                       instituteId: "507f1f77bcf86cd799439012"
 *                       departmentId: "507f1f77bcf86cd799439013"
 *                       gradeId: "507f1f77bcf86cd799439014"
 *                       description: "Grade 10 Section A - Morning Shift"
 *                       archive: false
 *                       createdAt: "2024-01-15T10:30:00.000Z"
 *                       updatedAt: "2024-01-15T10:30:00.000Z"
 *                       instituteName: "ABC School"
 *                       departmentName: "Science Department"
 *                       gradeName: "Grade 10"
 *                       gradeCode: "G10"
 *                     - _id: "507f1f77bcf86cd799439015"
 *                       sectionName: "Section B"
 *                       instituteId: "507f1f77bcf86cd799439012"
 *                       departmentId: "507f1f77bcf86cd799439013"
 *                       gradeId: "507f1f77bcf86cd799439014"
 *                       description: "Grade 10 Section B - Afternoon Shift"
 *                       archive: false
 *                       createdAt: "2024-01-15T11:00:00.000Z"
 *                       updatedAt: "2024-01-15T11:00:00.000Z"
 *                       instituteName: "ABC School"
 *                       departmentName: "Science Department"
 *                       gradeName: "Grade 10"
 *                       gradeCode: "G10"
 *               dropdown_data:
 *                 summary: Dropdown mode response
 *                 value:
 *                   data:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       sectionName: "Section A"
 *                     - _id: "507f1f77bcf86cd799439015"
 *                       sectionName: "Section B"
 *               filtered_data:
 *                 summary: Filtered by grade response
 *                 value:
 *                   count: 1
 *                   filteredDocs: 1
 *                   totalDocs: 15
 *                   data:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       sectionName: "Section A"
 *                       instituteId: "507f1f77bcf86cd799439012"
 *                       departmentId: "507f1f77bcf86cd799439013"
 *                       gradeId: "507f1f77bcf86cd799439014"
 *                       description: "Grade 10 Section A - Morning Shift"
 *                       archive: false
 *                       createdAt: "2024-01-15T10:30:00.000Z"
 *                       updatedAt: "2024-01-15T10:30:00.000Z"
 *                       instituteName: "ABC School"
 *                       departmentName: "Science Department"
 *                       gradeName: "Grade 10"
 *                       gradeCode: "G10"
 *               specific_ids:
 *                 summary: Specific IDs response
 *                 value:
 *                   count: 2
 *                   filteredDocs: 2
 *                   totalDocs: 15
 *                   data:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       sectionName: "Section A"
 *                       instituteId: "507f1f77bcf86cd799439012"
 *                       departmentId: "507f1f77bcf86cd799439013"
 *                       gradeId: "507f1f77bcf86cd799439014"
 *                       description: "Grade 10 Section A - Morning Shift"
 *                       archive: false
 *                       createdAt: "2024-01-15T10:30:00.000Z"
 *                       updatedAt: "2024-01-15T10:30:00.000Z"
 *                       instituteName: "ABC School"
 *                       departmentName: "Science Department"
 *                       gradeName: "Grade 10"
 *                       gradeCode: "G10"
 *                     - _id: "507f1f77bcf86cd799439015"
 *                       sectionName: "Section B"
 *                       instituteId: "507f1f77bcf86cd799439012"
 *                       departmentId: "507f1f77bcf86cd799439013"
 *                       gradeId: "507f1f77bcf86cd799439014"
 *                       description: "Grade 10 Section B - Afternoon Shift"
 *                       archive: false
 *                       createdAt: "2024-01-15T11:00:00.000Z"
 *                       updatedAt: "2024-01-15T11:00:00.000Z"
 *                       instituteName: "ABC School"
 *                       departmentName: "Science Department"
 *                       gradeName: "Grade 10"
 *                       gradeCode: "G10"
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid ObjectId format"
 *       401:
 *         description: Unauthorized - invalid or missing token
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

router.get('/gradeSectionsInInstitute',gradeSectionsCt.gradeSectionsInInstituteAg);
// router.get('/gradeSectionsInInstitute/:_id?',gradeSectionsCt.gradeSectionsInInstitute);

/**
 * @swagger
 * /instituteAggreRt/gradeSectionsInInstitute:
 *   post:
 *     summary: Create a new grade section in institute
 *     tags: [Grade Sections]
 *     description: |
 *       Create a new grade section within an institute. The section name must be unique within the same grade.
 *       
 *       **Validation Rules:**
 *       - sectionName: Required, must be unique within the same grade
 *       - instituteId: Required, must be a valid ObjectId
 *       - departmentId: Required, must be a valid ObjectId
 *       - gradeId: Required, must be a valid ObjectId
 *       - description: Optional
 *       
 *       **Unique Constraint:**
 *       The combination of instituteId + gradeId + sectionName must be unique.
 *       Archived sections (archive: true) are excluded from uniqueness checks.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GradeSectionCreateRequest'
 *           examples:
 *             basic_section:
 *               summary: Basic grade section creation
 *               value:
 *                 sectionName: "Section A"
 *                 instituteId: "507f1f77bcf86cd799439011"
 *                 departmentId: "507f1f77bcf86cd799439012"
 *                 gradeId: "507f1f77bcf86cd799439013"
 *                 description: "Grade 10 Section A - Morning Shift"
 *             section_with_description:
 *               summary: Section with detailed description
 *               value:
 *                 sectionName: "Section B"
 *                 instituteId: "507f1f77bcf86cd799439011"
 *                 departmentId: "507f1f77bcf86cd799439012"
 *                 gradeId: "507f1f77bcf86cd799439013"
 *                 description: "Grade 10 Section B - Afternoon Shift for Science Stream Students"
 *             minimal_section:
 *               summary: Minimal required fields only
 *               value:
 *                 sectionName: "Section C"
 *                 instituteId: "507f1f77bcf86cd799439011"
 *                 departmentId: "507f1f77bcf86cd799439012"
 *                 gradeId: "507f1f77bcf86cd799439013"
 *     responses:
 *       200:
 *         description: Grade section created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GradeSectionCreateResponse'
 *             examples:
 *               success_response:
 *                 summary: Successful creation
 *                 value:
 *                   message: "Grade Section added successfully!"
 *                   data:
 *                     _id: "507f1f77bcf86cd799439014"
 *                     sectionName: "Section A"
 *                     instituteId: "507f1f77bcf86cd799439011"
 *                     departmentId: "507f1f77bcf86cd799439012"
 *                     gradeId: "507f1f77bcf86cd799439013"
 *                     description: "Grade 10 Section A - Morning Shift"
 *                     archive: false
 *                     createdAt: "2024-01-15T10:30:00.000Z"
 *                     updatedAt: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Bad request - validation error or duplicate section name
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/DuplicateErrorResponse'
 *                 - type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                       example: "Failed to add grade section"
 *                     details:
 *                       type: string
 *                       example: "Validation failed"
 *             examples:
 *               duplicate_section:
 *                 summary: Duplicate section name error
 *                 value:
 *                   error: "Duplicate value"
 *                   details: "Section name 'Section A' already exists in this grade"
 *                   field: "sectionName"
 *                   value: "Section A"
 *                   suggestion: "Section name must be unique within this grade"
 *               validation_error:
 *                 summary: Validation error
 *                 value:
 *                   error: "Failed to add grade section"
 *                   details: "instituteId is required"
 *       401:
 *         description: Unauthorized - invalid or missing token
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
 *                   example: "Failed to add grade section"
 *                 details:
 *                   type: string
 *                   example: "Database connection failed"
 */

router.post('/gradeSectionsInInstitute',gradeSectionsCt.createGradeSectionsInInstitute);

/**
 * @swagger
 * /instituteAggreRt/gradeSectionsInInstitute:
 *   put:
 *     summary: Update grade section in institute
 *     tags: [Grade Sections]
 *     description: |
 *       Update existing grade section information within an institute.
 *       
 *       **Update Rules:**
 *       - Only the fields provided in updatedData will be updated
 *       - sectionName must remain unique within the same grade if changed
 *       - Archive status can be toggled
 *       - Description can be updated
 *       
 *       **Request Structure:**
 *       The request body must contain _id and updatedData object with the fields to update.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GradeSectionUpdateRequest'
 *           examples:
 *             update_section_name:
 *               summary: Update section name
 *               value:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 updatedData:
 *                   sectionName: "Section A Updated"
 *             update_description:
 *               summary: Update description only
 *               value:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 updatedData:
 *                   description: "Updated description for Grade 10 Section A"
 *             archive_section:
 *               summary: Archive a section
 *               value:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 updatedData:
 *                   archive: true
 *             multiple_updates:
 *               summary: Update multiple fields
 *               value:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 updatedData:
 *                   sectionName: "Section A Renamed"
 *                   description: "Updated description"
 *                   archive: false
 *     responses:
 *       200:
 *         description: Grade section updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GradeSectionUpdateResponse'
 *             examples:
 *               success_update:
 *                 summary: Successful update
 *                 value:
 *                   message: "Grade Section updated successfully"
 *               no_changes:
 *                 summary: No changes made
 *                 value:
 *                   message: "No updates were made"
 *       400:
 *         description: Bad request - validation error or duplicate section name
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/DuplicateErrorResponse'
 *                 - type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                       example: "Failed to update grade section"
 *                     details:
 *                       type: string
 *                       example: "Validation failed"
 *             examples:
 *               duplicate_name:
 *                 summary: Duplicate section name error
 *                 value:
 *                   error: "Duplicate value"
 *                   details: "Section name 'Section A Updated' already exists in this grade"
 *                   field: "sectionName"
 *                   value: "Section A Updated"
 *                   suggestion: "Section names must be unique within each grade"
 *               validation_error:
 *                 summary: Validation error
 *                 value:
 *                   error: "Failed to update grade section"
 *                   details: "Invalid ObjectId format"
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       404:
 *         description: Grade section not found or no changes made
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No matching grade section found or values are unchanged"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to update grade section"
 *                 details:
 *                   type: string
 *                   example: "Database connection failed"
 */

router.put('/gradeSectionsInInstitute',gradeSectionsCt.updateGradeSectionsInInstitute);

/**
 * @swagger
 * /instituteAggreRt/gradeSectionsInInstitute:
 *   delete:
 *     summary: Delete grade sections with dependency management
 *     tags: [Grade Sections]
 *     description: |
 *       Delete grade sections with comprehensive dependency management options.
 *       
 *       **Deletion Modes:**
 *       1. **Simple Delete**: Delete sections without dependents
 *       2. **Archive**: Archive sections instead of deleting (archive: true)
 *       3. **Transfer Dependents**: Transfer dependents to another section before deletion
 *       4. **Delete with Dependents**: Delete sections and all their dependents
 *       
 *       **Dependency Handling:**
 *       - Grade sections may have dependents: MembersData, GradeSectionBatches
 *       - If dependents exist, you must choose how to handle them
 *       - Only one section can be selected when using transferTo option
 *       
 *       **Response Codes:**
 *       - 200: Successful deletion/archive
 *       - 201: Dependencies found - requires action (deleteDependents or transferTo)
 *       - 400: Validation error or conflicting options
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GradeSectionDeleteRequest'
 *           examples:
 *             simple_delete:
 *               summary: Delete sections without dependents
 *               value:
 *                 ids: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *             archive_sections:
 *               summary: Archive sections instead of deleting
 *               value:
 *                 ids: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *                 archive: true
 *             unarchive_sections:
 *               summary: Unarchive sections
 *               value:
 *                 ids: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *                 archive: false
 *             transfer_dependents:
 *               summary: Transfer dependents to another section
 *               value:
 *                 ids: ["507f1f77bcf86cd799439011"]
 *                 transferTo: "507f1f77bcf86cd799439013"
 *             delete_with_dependents:
 *               summary: Delete sections and all dependents
 *               value:
 *                 ids: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *                 deleteDependents: true
 *             check_dependencies:
 *               summary: Check dependencies without deleting
 *               value:
 *                 ids: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *     responses:
 *       200:
 *         description: Grade sections deleted/archived successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/GradeSectionDeleteResponse'
 *                 - $ref: '#/components/schemas/GradeSectionArchiveResponse'
 *             examples:
 *               successful_delete:
 *                 summary: Successful deletion
 *                 value:
 *                   message: "Grade Section(s) deleted successfully"
 *                   deletedCount: 2
 *               successful_archive:
 *                 summary: Successful archive
 *                 value:
 *                   message: "Grade Section(s) archived successfully"
 *                   archiveResult:
 *                     archivedCount: 2
 *               transfer_success:
 *                 summary: Successful transfer and deletion
 *                 value:
 *                   message: "Dependents transferred and Grade Section(s) deleted"
 *                   transfer:
 *                     transferredCount: 5
 *                   deletedCount: 1
 *               delete_with_dependents:
 *                 summary: Delete with dependents
 *                 value:
 *                   message: "Deleted with dependents"
 *                   results:
 *                     - gradeSectionId: "507f1f77bcf86cd799439011"
 *                       deletedCount: 1
 *                       dependentsDeleted: 3
 *       201:
 *         description: Dependencies found - action required
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
 *                   value: "Section A"
 *                   dependsOn:
 *                     MembersData: 5
 *                     gradeSectionBatches: 2
 *       400:
 *         description: Bad request - validation error or conflicting options
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               missing_ids:
 *                 summary: Missing IDs
 *                 value:
 *                   message: "Grade Section ID(s) required"
 *               conflicting_options:
 *                 summary: Conflicting options
 *                 value:
 *                   message: "Only one of archive or transfer can be requested at a time."
 *               invalid_archive:
 *                 summary: Invalid archive parameter
 *                 value:
 *                   message: "The archive parameter must be a boolean (true or false)."
 *               multiple_transfer:
 *                 summary: Multiple sections for transfer
 *                 value:
 *                   message: "Please select one Grade Section to transfer dependents from."
 *               both_options:
 *                 summary: Both delete and transfer options
 *                 value:
 *                   message: "Either transfer or delete dependencies"
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       404:
 *         description: Grade sections not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No matching Grade Section found to archive/unarchive"
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

router.delete('/gradeSectionsInInstitute',gradeSectionsCt.deleteGradeSectionsInInstitute);

module.exports = router;