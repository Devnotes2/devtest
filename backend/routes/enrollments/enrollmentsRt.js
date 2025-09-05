const express = require('express');
const router = express.Router();
const {
  getEnrollments,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment
} = require('../../Controller/enrollments/enrollmentsCt');

// ============================================================================
// ENROLLMENTS SWAGGER DOCUMENTATION
// ============================================================================

/**
 * @swagger
 * components:
 *   schemas:
 *     Enrollment:
 *       type: object
 *       required:
 *         - instituteId
 *         - departmentId
 *         - gradeId
 *         - memberId
 *         - academicYearId
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique enrollment ID
 *           example: "507f1f77bcf86cd799439011"
 *         instituteId:
 *           type: string
 *           description: Institute ID reference
 *           example: "507f1f77bcf86cd799439011"
 *         departmentId:
 *           type: string
 *           description: Department ID reference
 *           example: "507f1f77bcf86cd799439012"
 *         gradeId:
 *           type: string
 *           description: Grade ID reference
 *           example: "507f1f77bcf86cd799439013"
 *         gradeSectionId:
 *           type: string
 *           description: Grade Section ID reference (optional)
 *           example: "507f1f77bcf86cd799439014"
 *         gradeSectionBatchId:
 *           type: string
 *           description: Grade Section Batch ID reference (optional)
 *           example: "507f1f77bcf86cd799439015"
 *         gradeBatchId:
 *           type: string
 *           description: Grade Batch ID reference (optional)
 *           example: "507f1f77bcf86cd799439016"
 *         subjectsIds:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of Subject IDs (optional)
 *           example:
 *             - "507f1f77bcf86cd799439017"
 *             - "507f1f77bcf86cd799439018"
 *         memberId:
 *           type: string
 *           description: Member ID reference
 *           example: "507f1f77bcf86cd799439019"
 *         memberTypeId:
 *           type: string
 *           description: Member type ID (auto-populated from memberId)
 *           example: "507f1f77bcf86cd799439020"
 *         enrollmentDate:
 *           type: string
 *           format: date-time
 *           description: Enrollment date
 *           example: "2024-01-15T10:30:00.000Z"
 *         academicYearId:
 *           type: string
 *           description: Academic Year ID reference
 *           example: "507f1f77bcf86cd799439021"
 *         status:
 *           type: string
 *           enum: [active, inactive, completed, dropped]
 *           default: active
 *           description: Enrollment status
 *           example: "active"
 *         description:
 *           type: string
 *           description: Additional enrollment description
 *           example: "Regular enrollment for Spring 2024"
 *         archive:
 *           type: boolean
 *           default: false
 *           description: Archive status
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *           example: "2024-01-15T10:30:00.000Z"
 *         # Aggregated fields (returned when using aggregation)
 *         instituteName:
 *           type: string
 *           description: Institute name (from aggregation)
 *           example: "ABC University"
 *         departmentName:
 *           type: string
 *           description: Department name (from aggregation)
 *           example: "Computer Science"
 *         gradeName:
 *           type: string
 *           description: Grade name (from aggregation)
 *           example: "Grade 10"
 *         gradeCode:
 *           type: string
 *           description: Grade code (from aggregation)
 *           example: "G10"
 *         gradeDuration:
 *           type: number
 *           description: Grade duration in years (from aggregation)
 *           example: 1
 *         batchName:
 *           type: string
 *           description: Batch name (from aggregation)
 *           example: "2024"
 *         sectionName:
 *           type: string
 *           description: Section name (from aggregation)
 *           example: "A"
 *         sectionBatchName:
 *           type: string
 *           description: Section batch name (from aggregation)
 *           example: "A-2024"
 *         academicYear:
 *           type: string
 *           description: Academic year (from aggregation)
 *           example: "2024-2025"
 *         subjects:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               subjectName:
 *                 type: string
 *               subjectCode:
 *                 type: string
 *           description: Subject details (from aggregation)
 *         memberName:
 *           type: string
 *           description: Member full name (from aggregation)
 *           example: "John Doe"
 *         memberType:
 *           type: string
 *           description: Member type value (from aggregation)
 *           example: "Student"
 *     
 *     EnrollmentCreateRequest:
 *       type: object
 *       required:
 *         - instituteId
 *         - departmentId
 *         - gradeId
 *         - memberId
 *         - academicYearId
 *       properties:
 *         instituteId:
 *           type: string
 *           description: Institute ID reference
 *           example: "507f1f77bcf86cd799439011"
 *         departmentId:
 *           type: string
 *           description: Department ID reference
 *           example: "507f1f77bcf86cd799439012"
 *         gradeId:
 *           type: string
 *           description: Grade ID reference
 *           example: "507f1f77bcf86cd799439013"
 *         gradeSectionId:
 *           type: string
 *           description: Grade Section ID reference (optional)
 *           example: "507f1f77bcf86cd799439014"
 *         gradeSectionBatchId:
 *           type: string
 *           description: Grade Section Batch ID reference (optional)
 *           example: "507f1f77bcf86cd799439015"
 *         gradeBatchId:
 *           type: string
 *           description: Grade Batch ID reference (optional)
 *           example: "507f1f77bcf86cd799439016"
 *         subjectsIds:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of Subject IDs (optional)
 *           example:
 *             - "507f1f77bcf86cd799439017"
 *             - "507f1f77bcf86cd799439018"
 *         memberId:
 *           type: string
 *           description: Member ID reference
 *           example: "507f1f77bcf86cd799439019"
 *         academicYearId:
 *           type: string
 *           description: Academic Year ID reference
 *           example: "507f1f77bcf86cd799439021"
 *         status:
 *           type: string
 *           enum: [active, inactive, completed, dropped]
 *           default: active
 *           description: Enrollment status
 *           example: "active"
 *         description:
 *           type: string
 *           description: Additional enrollment description
 *           example: "Regular enrollment for Spring 2024"
 *     
 *     EnrollmentUpdateRequest:
 *       type: object
 *       required:
 *         - _id
 *         - updatedData
 *       properties:
 *         _id:
 *           type: string
 *           description: Enrollment ID to update
 *           example: "507f1f77bcf86cd799439011"
 *         updatedData:
 *           type: object
 *           description: Fields to update
 *           properties:
 *             status:
 *               type: string
 *               enum: [active, inactive, completed, dropped]
 *               description: New enrollment status
 *               example: "completed"
 *             description:
 *               type: string
 *               description: Updated description
 *               example: "Updated enrollment description"
 *             gradeSectionId:
 *               type: string
 *               description: New grade section ID
 *               example: "507f1f77bcf86cd799439014"
 *             subjectsIds:
 *               type: array
 *               items:
 *                 type: string
 *               description: Updated subject IDs
 *               example:
 *                 - "507f1f77bcf86cd799439017"
 *                 - "507f1f77bcf86cd799439018"
 *     
 *     EnrollmentDeleteRequest:
 *       type: object
 *       required:
 *         - ids
 *       properties:
 *         ids:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of enrollment IDs to delete
 *           example:
 *             - "507f1f77bcf86cd799439011"
 *             - "507f1f77bcf86cd799439012"
 *         deleteDependents:
 *           type: boolean
 *           description: Whether to delete dependent records
 *           example: false
 *         transferTo:
 *           type: string
 *           description: Transfer dependents to this enrollment ID
 *           example: "507f1f77bcf86cd799439013"
 *         archive:
 *           type: boolean
 *           description: Archive instead of delete
 *           example: false
 *     
 *     EnrollmentResponse:
 *       type: object
 *       properties:
 *         count:
 *           type: integer
 *           description: Number of records returned
 *           example: 10
 *         filteredDocs:
 *           type: integer
 *           description: Number of documents matching filters
 *           example: 25
 *         totalDocs:
 *           type: integer
 *           description: Total documents in collection
 *           example: 100
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Enrollment'
 *     
 *     EnrollmentDropdownResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               instituteId:
 *                 type: string
 *               departmentId:
 *                 type: string
 *               gradeId:
 *                 type: string
 *               memberId:
 *                 type: string
 *               memberType:
 *                 type: string
 *               enrollmentDate:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *     
 *     EnrollmentCreateResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Enrollment added successfully!"
 *         data:
 *           $ref: '#/components/schemas/Enrollment'
 *     
 *     EnrollmentUpdateResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Enrollment updated successfully"
 *     
 *     EnrollmentDeleteResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Enrollment(s) deleted successfully"
 *         deletedCount:
 *           type: integer
 *           example: 2
 *         deleted:
 *           type: array
 *           items:
 *             type: string
 *           example:
 *             - "507f1f77bcf86cd799439011"
 *             - "507f1f77bcf86cd799439012"
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
 *     DuplicateEnrollmentError:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Duplicate enrollment"
 *         details:
 *           type: string
 *           example: "A member enrollment already exists for this combination"
 *         suggestion:
 *           type: string
 *           example: "Please check if this enrollment already exists or modify the combination"
 */

/**
 * @swagger
 * tags:
 *   name: Enrollments
 *   description: Enrollment management endpoints with comprehensive filtering, aggregation, and CRUD operations
 */

/**
 * @swagger
 * /enrollments:
 *   get:
 *     summary: Get enrollments with comprehensive filtering, aggregation, and pagination
 *     description: |
 *       Retrieve enrollments with support for:
 *       - **Basic filtering**: Filter by any enrollment field
 *       - **Aggregation**: Join with related collections (institutes, departments, grades, etc.)
 *       - **Pagination**: Control page size and navigation
 *       - **Sorting**: Sort by any field in ascending or descending order
 *       - **Dropdown mode**: Get simplified data for dropdowns
 *       - **Value-based filtering**: Filter by joined field values
 *       - **ID-based retrieval**: Get specific enrollments by IDs
 *       
 *       **Parameter Combinations:**
 *       - **Basic**: `?page=1&limit=10`
 *       - **With filtering**: `?instituteId=123&status=active&page=1&limit=10`
 *       - **With aggregation**: `?aggregate=true&instituteId=123`
 *       - **With sorting**: `?sortBy=enrollmentDate&sortOrder=desc`
 *       - **Dropdown mode**: `?dropdown=true&instituteId=123`
 *       - **ID-based**: `?ids=123,456,789`
 *       - **Value-based filtering**: `?institute=ABC University&department=Computer Science`
 *       - **Complex combination**: `?aggregate=true&instituteId=123&status=active&sortBy=enrollmentDate&sortOrder=desc&page=1&limit=20`
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       # Pagination Parameters
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *         example: 10
 *       
 *       # Aggregation Parameters
 *       - in: query
 *         name: aggregate
 *         schema:
 *           type: string
 *           enum: [true, false]
 *           default: true
 *         description: |
 *           Enable aggregation to join with related collections.
 *           - `true` (default): Returns enriched data with joined fields
 *           - `false`: Returns only enrollment fields without joins
 *         example: true
 *       
 *       # Dropdown Mode
 *       - in: query
 *         name: dropdown
 *         schema:
 *           type: string
 *           enum: [true, false]
 *           default: false
 *         description: |
 *           Simplified response for dropdown components.
 *           Returns only essential fields: _id, instituteId, departmentId, gradeId, memberId, memberType, enrollmentDate, status
 *         example: false
 *       
 *       # ID-based Retrieval
 *       - in: query
 *         name: ids
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: false
 *         description: |
 *           Array of enrollment IDs to retrieve specific records.
 *           When provided, only these enrollments will be returned.
 *         example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *       
 *       # Basic Filtering Parameters
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
 *         name: gradeId
 *         schema:
 *           type: string
 *         description: Filter by grade ID
 *         example: "507f1f77bcf86cd799439013"
 *       - in: query
 *         name: gradeSectionId
 *         schema:
 *           type: string
 *         description: Filter by grade section ID
 *         example: "507f1f77bcf86cd799439014"
 *       - in: query
 *         name: gradeSectionBatchId
 *         schema:
 *           type: string
 *         description: Filter by grade section batch ID
 *         example: "507f1f77bcf86cd799439015"
 *       - in: query
 *         name: gradeBatchId
 *         schema:
 *           type: string
 *         description: Filter by grade batch ID
 *         example: "507f1f77bcf86cd799439016"
 *       - in: query
 *         name: memberId
 *         schema:
 *           type: string
 *         description: Filter by member ID
 *         example: "507f1f77bcf86cd799439019"
 *       - in: query
 *         name: memberType
 *         schema:
 *           type: string
 *         description: Filter by member type ID
 *         example: "507f1f77bcf86cd799439020"
 *       - in: query
 *         name: academicYearId
 *         schema:
 *           type: string
 *         description: Filter by academic year ID
 *         example: "507f1f77bcf86cd799439021"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, completed, dropped]
 *         description: Filter by enrollment status
 *         example: "active"
 *       - in: query
 *         name: archive
 *         schema:
 *           type: boolean
 *         description: Filter by archive status
 *         example: false
 *       
 *       # Date Range Filtering
 *       - in: query
 *         name: enrollmentDateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter enrollments from this date (inclusive)
 *         example: "2024-01-01"
 *       - in: query
 *         name: enrollmentDateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter enrollments to this date (inclusive)
 *         example: "2024-12-31"
 *       - in: query
 *         name: createdAtFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by creation date from (inclusive)
 *         example: "2024-01-01"
 *       - in: query
 *         name: createdAtTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by creation date to (inclusive)
 *         example: "2024-12-31"
 *       
 *       # Value-based Filtering (works with aggregation)
 *       - in: query
 *         name: institute
 *         schema:
 *           type: string
 *         description: Filter by institute name (requires aggregate=true)
 *         example: "ABC University"
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department name (requires aggregate=true)
 *         example: "Computer Science"
 *       - in: query
 *         name: grade
 *         schema:
 *           type: string
 *         description: Filter by grade name (requires aggregate=true)
 *         example: "Grade 10"
 *       - in: query
 *         name: gradeCode
 *         schema:
 *           type: string
 *         description: Filter by grade code (requires aggregate=true)
 *         example: "G10"
 *       - in: query
 *         name: batch
 *         schema:
 *           type: string
 *         description: Filter by batch name (requires aggregate=true)
 *         example: "2024"
 *       - in: query
 *         name: section
 *         schema:
 *           type: string
 *         description: Filter by section name (requires aggregate=true)
 *         example: "A"
 *       - in: query
 *         name: sectionBatch
 *         schema:
 *           type: string
 *         description: Filter by section batch name (requires aggregate=true)
 *         example: "A-2024"
 *       - in: query
 *         name: academicYear
 *         schema:
 *           type: string
 *         description: Filter by academic year (requires aggregate=true)
 *         example: "2024-2025"
 *       - in: query
 *         name: member
 *         schema:
 *           type: string
 *         description: Filter by member name (requires aggregate=true)
 *         example: "John Doe"
 *       - in: query
 *         name: memberType
 *         schema:
 *           type: string
 *         description: Filter by member type value (requires aggregate=true)
 *         example: "Student"
 *       
 *       # Sorting Parameters
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [_id, instituteId, departmentId, gradeId, gradeSectionId, gradeSectionBatchId, gradeBatchId, memberId, memberType, enrollmentDate, academicYearId, status, description, archive, createdAt, updatedAt]
 *           default: enrollmentDate
 *         description: Field to sort by
 *         example: "enrollmentDate"
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *         example: "desc"
 *       
 *       # Additional Parameters
 *       - in: query
 *         name: validate
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Validate query parameters
 *         example: true
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search across multiple fields (implementation dependent)
 *         example: "John Doe"
 *     
 *     responses:
 *       200:
 *         description: Enrollments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/EnrollmentResponse'
 *                 - $ref: '#/components/schemas/EnrollmentDropdownResponse'
 *             examples:
 *               # Basic response with aggregation
 *               basic_aggregated:
 *                 summary: Basic response with aggregation
 *                 value:
 *                   count: 10
 *                   filteredDocs: 25
 *                   totalDocs: 100
 *                   data:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       instituteId: "507f1f77bcf86cd799439011"
 *                       departmentId: "507f1f77bcf86cd799439012"
 *                       gradeId: "507f1f77bcf86cd799439013"
 *                       memberId: "507f1f77bcf86cd799439019"
 *                       status: "active"
 *                       enrollmentDate: "2024-01-15T10:30:00.000Z"
 *                       instituteName: "ABC University"
 *                       departmentName: "Computer Science"
 *                       gradeName: "Grade 10"
 *                       memberName: "John Doe"
 *                       academicYear: "2024-2025"
 *               
 *               # Dropdown response
 *               dropdown:
 *                 summary: Dropdown response
 *                 value:
 *                   data:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       instituteId: "507f1f77bcf86cd799439011"
 *                       departmentId: "507f1f77bcf86cd799439012"
 *                       gradeId: "507f1f77bcf86cd799439013"
 *                       memberId: "507f1f77bcf86cd799439019"
 *                       memberType: "507f1f77bcf86cd799439020"
 *                       enrollmentDate: "2024-01-15T10:30:00.000Z"
 *                       status: "active"
 *               
 *               # Non-aggregated response
 *               non_aggregated:
 *                 summary: Non-aggregated response
 *                 value:
 *                   count: 5
 *                   filteredDocs: 5
 *                   totalDocs: 100
 *                   data:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       instituteId: "507f1f77bcf86cd799439011"
 *                       departmentId: "507f1f77bcf86cd799439012"
 *                       gradeId: "507f1f77bcf86cd799439013"
 *                       memberId: "507f1f77bcf86cd799439019"
 *                       status: "active"
 *                       enrollmentDate: "2024-01-15T10:30:00.000Z"
 *                       createdAt: "2024-01-15T10:30:00.000Z"
 *                       updatedAt: "2024-01-15T10:30:00.000Z"
 *       
 *       400:
 *         description: Bad request - invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Invalid parameter combination"
 *               status: "error"
 *       
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Unauthorized access"
 *               status: "error"
 *       
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Server error"
 *               status: "error"
 */

// Get enrollments (GET) - supports aggregation, pagination, filtering, sorting
router.get('/enrollments', getEnrollments);

/**
 * @swagger
 * /enrollments:
 *   post:
 *     summary: Create a new enrollment
 *     description: |
 *       Create a new enrollment with comprehensive validation and auto-population features.
 *       
 *       **Key Features:**
 *       - **Auto-population**: `memberType` is automatically populated from `memberId`
 *       - **Unique constraints**: Prevents duplicate enrollments based on combination of fields
 *       - **Validation**: Validates all required fields and references
 *       - **Flexible structure**: Supports optional fields like sections, batches, and subjects
 *       
 *       **Unique Constraints:**
 *       - For member enrollments: `memberId + instituteId + departmentId + gradeId + gradeSectionId + gradeSectionBatchId + gradeBatchId + academicYearId`
 *       - For general enrollments: `instituteId + departmentId + gradeId + gradeSectionId + gradeSectionBatchId + gradeBatchId + academicYearId`
 *       
 *       **Example Use Cases:**
 *       - **Student enrollment**: Full enrollment with member, grade, section, and subjects
 *       - **General enrollment**: Enrollment without specific member (for capacity planning)
 *       - **Batch enrollment**: Enrollment with grade batch information
 *       - **Section enrollment**: Enrollment with specific grade section
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EnrollmentCreateRequest'
 *           examples:
 *             # Complete student enrollment
 *             complete_student_enrollment:
 *               summary: Complete student enrollment with all fields
 *               value:
 *                 instituteId: "507f1f77bcf86cd799439011"
 *                 departmentId: "507f1f77bcf86cd799439012"
 *                 gradeId: "507f1f77bcf86cd799439013"
 *                 gradeSectionId: "507f1f77bcf86cd799439014"
 *                 gradeSectionBatchId: "507f1f77bcf86cd799439015"
 *                 gradeBatchId: "507f1f77bcf86cd799439016"
 *                 subjectsIds:
 *                   - "507f1f77bcf86cd799439017"
 *                   - "507f1f77bcf86cd799439018"
 *                 memberId: "507f1f77bcf86cd799439019"
 *                 academicYearId: "507f1f77bcf86cd799439021"
 *                 status: "active"
 *                 description: "Regular enrollment for Spring 2024 semester"
 *             
 *             # Basic enrollment (minimal required fields)
 *             basic_enrollment:
 *               summary: Basic enrollment with only required fields
 *               value:
 *                 instituteId: "507f1f77bcf86cd799439011"
 *                 departmentId: "507f1f77bcf86cd799439012"
 *                 gradeId: "507f1f77bcf86cd799439013"
 *                 memberId: "507f1f77bcf86cd799439019"
 *                 academicYearId: "507f1f77bcf86cd799439021"
 *             
 *             # Enrollment with grade section only
 *             section_enrollment:
 *               summary: Enrollment with grade section
 *               value:
 *                 instituteId: "507f1f77bcf86cd799439011"
 *                 departmentId: "507f1f77bcf86cd799439012"
 *                 gradeId: "507f1f77bcf86cd799439013"
 *                 gradeSectionId: "507f1f77bcf86cd799439014"
 *                 memberId: "507f1f77bcf86cd799439019"
 *                 academicYearId: "507f1f77bcf86cd799439021"
 *                 status: "active"
 *                 description: "Enrollment in Grade 10 Section A"
 *             
 *             # Enrollment with batch information
 *             batch_enrollment:
 *               summary: Enrollment with batch information
 *               value:
 *                 instituteId: "507f1f77bcf86cd799439011"
 *                 departmentId: "507f1f77bcf86cd799439012"
 *                 gradeId: "507f1f77bcf86cd799439013"
 *                 gradeBatchId: "507f1f77bcf86cd799439016"
 *                 memberId: "507f1f77bcf86cd799439019"
 *                 academicYearId: "507f1f77bcf86cd799439021"
 *                 status: "active"
 *                 description: "Enrollment in 2024 batch"
 *             
 *             # Enrollment with multiple subjects
 *             subjects_enrollment:
 *               summary: Enrollment with multiple subjects
 *               value:
 *                 instituteId: "507f1f77bcf86cd799439011"
 *                 departmentId: "507f1f77bcf86cd799439012"
 *                 gradeId: "507f1f77bcf86cd799439013"
 *                 subjectsIds:
 *                   - "507f1f77bcf86cd799439017"
 *                   - "507f1f77bcf86cd799439018"
 *                   - "507f1f77bcf86cd799439019"
 *                 memberId: "507f1f77bcf86cd799439019"
 *                 academicYearId: "507f1f77bcf86cd799439021"
 *                 status: "active"
 *                 description: "Enrollment with Mathematics, Physics, and Chemistry"
 *             
 *             # Inactive enrollment
 *             inactive_enrollment:
 *               summary: Inactive enrollment
 *               value:
 *                 instituteId: "507f1f77bcf86cd799439011"
 *                 departmentId: "507f1f77bcf86cd799439012"
 *                 gradeId: "507f1f77bcf86cd799439013"
 *                 memberId: "507f1f77bcf86cd799439019"
 *                 academicYearId: "507f1f77bcf86cd799439021"
 *                 status: "inactive"
 *                 description: "Temporary inactive enrollment"
 *     
 *     responses:
 *       200:
 *         description: Enrollment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EnrollmentCreateResponse'
 *             examples:
 *               success_response:
 *                 summary: Successful enrollment creation
 *                 value:
 *                   message: "Enrollment added successfully!"
 *                   data:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     instituteId: "507f1f77bcf86cd799439011"
 *                     departmentId: "507f1f77bcf86cd799439012"
 *                     gradeId: "507f1f77bcf86cd799439013"
 *                     gradeSectionId: "507f1f77bcf86cd799439014"
 *                     memberId: "507f1f77bcf86cd799439019"
 *                     memberType: "507f1f77bcf86cd799439020"
 *                     academicYearId: "507f1f77bcf86cd799439021"
 *                     status: "active"
 *                     enrollmentDate: "2024-01-15T10:30:00.000Z"
 *                     description: "Regular enrollment for Spring 2024 semester"
 *                     archive: false
 *                     createdAt: "2024-01-15T10:30:00.000Z"
 *                     updatedAt: "2024-01-15T10:30:00.000Z"
 *       
 *       400:
 *         description: Bad request - validation error or duplicate enrollment
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/DuplicateEnrollmentError'
 *                 - $ref: '#/components/schemas/Error'
 *             examples:
 *               duplicate_enrollment:
 *                 summary: Duplicate enrollment error
 *                 value:
 *                   error: "Duplicate enrollment"
 *                   details: "A member enrollment already exists for this combination"
 *                   suggestion: "Please check if this enrollment already exists or modify the combination"
 *               
 *               validation_error:
 *                 summary: Validation error
 *                 value:
 *                   message: "Validation failed"
 *                   errors:
 *                     - field: "instituteId"
 *                       message: "Institute ID is required"
 *                     - field: "memberId"
 *                       message: "Member ID is required"
 *       
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Unauthorized access"
 *               status: "error"
 *       
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Failed to add enrollment"
 *               details: "Database connection error"
 */

// Create enrollment (POST)
router.post('/enrollments', createEnrollment);

/**
 * @swagger
 * /enrollments:
 *   put:
 *     summary: Update an existing enrollment
 *     description: |
 *       Update an existing enrollment with comprehensive validation and auto-population features.
 *       
 *       **Key Features:**
 *       - **Selective updates**: Only update the fields you specify in `updatedData`
 *       - **Auto-population**: `memberType` is automatically populated if `memberId` is updated
 *       - **Unique constraint validation**: Prevents duplicate enrollments after updates
 *       - **Flexible updates**: Update any combination of fields
 *       - **Change tracking**: Returns appropriate messages based on what was actually changed
 *       
 *       **Update Scenarios:**
 *       - **Status changes**: Change enrollment status (active, inactive, completed, dropped)
 *       - **Field updates**: Update description, subjects, sections, etc.
 *       - **Member changes**: Change member or member type
 *       - **Academic changes**: Update grade, section, batch information
 *       - **Bulk updates**: Update multiple fields at once
 *       
 *       **Response Scenarios:**
 *       - **Success with changes**: Returns success message when changes are made
 *       - **No changes**: Returns message when no actual changes were made
 *       - **Not found**: Returns 404 when enrollment doesn't exist
 *       - **Duplicate error**: Returns 400 when update would create duplicate
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EnrollmentUpdateRequest'
 *           examples:
 *             # Update enrollment status
 *             update_status:
 *               summary: Update enrollment status
 *               value:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 updatedData:
 *                   status: "completed"
 *                   description: "Enrollment completed successfully"
 *             
 *             # Update multiple fields
 *             update_multiple_fields:
 *               summary: Update multiple enrollment fields
 *               value:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 updatedData:
 *                   status: "active"
 *                   description: "Updated enrollment details"
 *                   gradeSectionId: "507f1f77bcf86cd799439014"
 *                   subjectsIds:
 *                     - "507f1f77bcf86cd799439017"
 *                     - "507f1f77bcf86cd799439018"
 *             
 *             # Update member information
 *             update_member:
 *               summary: Update member information
 *               value:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 updatedData:
 *                   memberId: "507f1f77bcf86cd799439020"
 *                   description: "Member changed due to transfer"
 *             
 *             # Update academic information
 *             update_academic:
 *               summary: Update academic information
 *               value:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 updatedData:
 *                   gradeId: "507f1f77bcf86cd799439025"
 *                   gradeSectionId: "507f1f77bcf86cd799439026"
 *                   academicYearId: "507f1f77bcf86cd799439027"
 *                   description: "Grade promotion and section change"
 *             
 *             # Update subjects only
 *             update_subjects:
 *               summary: Update subjects for enrollment
 *               value:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 updatedData:
 *                   subjectsIds:
 *                     - "507f1f77bcf86cd799439017"
 *                     - "507f1f77bcf86cd799439018"
 *                     - "507f1f77bcf86cd799439019"
 *                     - "507f1f77bcf86cd799439020"
 *                   description: "Added additional subjects to enrollment"
 *             
 *             # Update batch information
 *             update_batch:
 *               summary: Update batch information
 *               value:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 updatedData:
 *                   gradeBatchId: "507f1f77bcf86cd799439030"
 *                   gradeSectionBatchId: "507f1f77bcf86cd799439031"
 *                   description: "Batch transfer completed"
 *             
 *             # Update description only
 *             update_description:
 *               summary: Update enrollment description
 *               value:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 updatedData:
 *                   description: "Updated enrollment notes and additional information"
 *     
 *     responses:
 *       200:
 *         description: Enrollment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EnrollmentUpdateResponse'
 *             examples:
 *               success_with_changes:
 *                 summary: Success with actual changes made
 *                 value:
 *                   message: "Enrollment updated successfully"
 *               
 *               success_no_changes:
 *                 summary: Success but no changes were made
 *                 value:
 *                   message: "No updates were made"
 *       
 *       400:
 *         description: Bad request - validation error or duplicate enrollment
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/DuplicateEnrollmentError'
 *                 - $ref: '#/components/schemas/Error'
 *             examples:
 *               duplicate_enrollment:
 *                 summary: Duplicate enrollment error
 *                 value:
 *                   error: "Duplicate enrollment"
 *                   details: "An enrollment already exists for this combination"
 *                   suggestion: "Please check if this enrollment already exists or modify the combination"
 *               
 *               validation_error:
 *                 summary: Validation error
 *                 value:
 *                   message: "Validation failed"
 *                   errors:
 *                     - field: "_id"
 *                       message: "Enrollment ID is required"
 *                     - field: "updatedData"
 *                       message: "Updated data is required"
 *       
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Unauthorized access"
 *               status: "error"
 *       
 *       404:
 *         description: Enrollment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "No matching enrollment found or values are unchanged"
 *               status: "error"
 *       
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Failed to update enrollment"
 *               details: "Database connection error"
 */

// Update enrollment (PUT)
router.put('/enrollments', updateEnrollment);

/**
 * @swagger
 * /enrollments:
 *   delete:
 *     summary: Delete enrollment(s) with comprehensive dependency handling
 *     description: |
 *       Delete one or more enrollments with advanced dependency management and archiving options.
 *       
 *       **Key Features:**
 *       - **Bulk deletion**: Delete multiple enrollments in a single request
 *       - **Dependency handling**: Manage dependent records with multiple strategies
 *       - **Archive option**: Archive instead of delete for data preservation
 *       - **Transfer option**: Transfer dependents to another enrollment
 *       - **Cascade deletion**: Delete dependents along with enrollments
 *       - **Conflict resolution**: Handle conflicts between archive and transfer options
 *       
 *       **Deletion Strategies:**
 *       1. **Simple deletion**: Delete enrollments with no dependents
 *       2. **Archive**: Archive enrollments instead of deleting (preserves data)
 *       3. **Transfer dependents**: Move dependents to another enrollment before deletion
 *       4. **Cascade deletion**: Delete enrollments and all their dependents
 *       5. **Dependency summary**: Get information about dependents before deciding
 *       
 *       **Response Scenarios:**
 *       - **Direct deletion**: When no dependents exist
 *       - **Dependency summary**: When dependents exist and no action specified
 *       - **Archive success**: When archiving is successful
 *       - **Transfer success**: When dependents are transferred successfully
 *       - **Cascade success**: When deletion with dependents is successful
 *       - **Conflict error**: When conflicting options are provided
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EnrollmentDeleteRequest'
 *           examples:
 *             # Simple deletion (no dependents)
 *             simple_deletion:
 *               summary: Simple deletion of enrollments
 *               value:
 *                 ids:
 *                   - "507f1f77bcf86cd799439011"
 *                   - "507f1f77bcf86cd799439012"
 *             
 *             # Archive enrollments
 *             archive_enrollments:
 *               summary: Archive enrollments instead of deleting
 *               value:
 *                 ids:
 *                   - "507f1f77bcf86cd799439011"
 *                   - "507f1f77bcf86cd799439012"
 *                 archive: true
 *             
 *             # Unarchive enrollments
 *             unarchive_enrollments:
 *               summary: Unarchive enrollments
 *               value:
 *                 ids:
 *                   - "507f1f77bcf86cd799439011"
 *                   - "507f1f77bcf86cd799439012"
 *                 archive: false
 *             
 *             # Transfer dependents to another enrollment
 *             transfer_dependents:
 *               summary: Transfer dependents to another enrollment
 *               value:
 *                 ids:
 *                   - "507f1f77bcf86cd799439011"
 *                 transferTo: "507f1f77bcf86cd799439013"
 *             
 *             # Delete with dependents
 *             cascade_deletion:
 *               summary: Delete enrollments and their dependents
 *               value:
 *                 ids:
 *                   - "507f1f77bcf86cd799439011"
 *                   - "507f1f77bcf86cd799439012"
 *                 deleteDependents: true
 *             
 *             # Get dependency information
 *             dependency_check:
 *               summary: Check dependencies without deleting
 *               value:
 *                 ids:
 *                   - "507f1f77bcf86cd799439011"
 *                   - "507f1f77bcf86cd799439012"
 *             
 *             # Single enrollment deletion
 *             single_deletion:
 *               summary: Delete a single enrollment
 *               value:
 *                 ids:
 *                   - "507f1f77bcf86cd799439011"
 *             
 *             # Bulk deletion with mixed scenarios
 *             bulk_deletion:
 *               summary: Bulk deletion of multiple enrollments
 *               value:
 *                 ids:
 *                   - "507f1f77bcf86cd799439011"
 *                   - "507f1f77bcf86cd799439012"
 *                   - "507f1f77bcf86cd799439013"
 *                   - "507f1f77bcf86cd799439014"
 *                 deleteDependents: true
 *     
 *     responses:
 *       200:
 *         description: Deletion operation completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EnrollmentDeleteResponse'
 *             examples:
 *               # Simple deletion success
 *               simple_deletion_success:
 *                 summary: Simple deletion successful
 *                 value:
 *                   message: "Enrollment(s) deleted successfully"
 *                   deletedCount: 2
 *                   deleted:
 *                     - "507f1f77bcf86cd799439011"
 *                     - "507f1f77bcf86cd799439012"
 *                   dependencies: []
 *               
 *               # Archive success
 *               archive_success:
 *                 summary: Archive operation successful
 *                 value:
 *                   message: "Enrollment(s) archived successfully"
 *                   archiveResult:
 *                     archivedCount: 2
 *                     archivedIds:
 *                       - "507f1f77bcf86cd799439011"
 *                       - "507f1f77bcf86cd799439012"
 *               
 *               # Transfer success
 *               transfer_success:
 *                 summary: Transfer operation successful
 *                 value:
 *                   message: "Dependents transferred and Enrollment(s) deleted"
 *                   transfer:
 *                     transferredCount: 5
 *                     transferredTo: "507f1f77bcf86cd799439013"
 *                   deletedCount: 1
 *               
 *               # Cascade deletion success
 *               cascade_success:
 *                 summary: Cascade deletion successful
 *                 value:
 *                   message: "Deleted with dependents"
 *                   results:
 *                     - enrollmentId: "507f1f77bcf86cd799439011"
 *                       deletedCount: 1
 *                       dependentsDeleted: 3
 *                     - enrollmentId: "507f1f77bcf86cd799439012"
 *                       deletedCount: 1
 *                       dependentsDeleted: 2
 *       
 *       201:
 *         description: Dependencies found - action required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EnrollmentDeleteResponse'
 *             example:
 *               message: "Dependency summary"
 *               deleted: []
 *               dependencies:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   value: "active - 2024-01-15T10:30:00.000Z"
 *                   dependsOn:
 *                     "SomeModel": 3
 *                     "AnotherModel": 2
 *       
 *       400:
 *         description: Bad request - validation error or conflicting options
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               missing_ids:
 *                 summary: Missing enrollment IDs
 *                 value:
 *                   message: "Enrollment ID(s) required"
 *               
 *               conflicting_options:
 *                 summary: Conflicting options provided
 *                 value:
 *                   message: "Only one of archive or transfer can be requested at a time."
 *               
 *               invalid_archive:
 *                 summary: Invalid archive parameter
 *                 value:
 *                   message: "The archive parameter must be a boolean (true or false)."
 *               
 *               transfer_delete_conflict:
 *                 summary: Cannot transfer and delete dependents
 *                 value:
 *                   message: "Either transfer or delete dependencies"
 *               
 *               single_transfer_required:
 *                 summary: Single enrollment required for transfer
 *                 value:
 *                   message: "Please select one Enrollment to transfer dependents from."
 *       
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Unauthorized access"
 *               status: "error"
 *       
 *       404:
 *         description: No matching enrollments found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               not_found:
 *                 summary: No enrollments found to delete
 *                 value:
 *                   message: "No matching Enrollment found for deletion"
 *               
 *               not_found_archive:
 *                 summary: No enrollments found to archive
 *                 value:
 *                   message: "No matching Enrollment found to archive/unarchive"
 *       
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Server error"
 *               error: "Database connection failed"
 */

// Delete enrollment(s) (DELETE) - supports dependency handling
router.delete('/enrollments', deleteEnrollment);

module.exports = router;
