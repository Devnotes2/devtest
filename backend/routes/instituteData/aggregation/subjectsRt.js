const express = require('express');
const router = express.Router();

const subjectsCt = require('../../../Controller/instituteData/aggregation/subjectsCt');

/**
 * @swagger
 * components:
 *   schemas:
 *     # ============================================================================
 *     # SUBJECT MANAGEMENT SCHEMAS
 *     # ============================================================================
 *     Subject:
 *       type: object
 *       required:
 *         - subject
 *         - subjectCode
 *         - instituteId
 *         - departmentId
 *         - gradeId
 *         - subjectTypeId
 *         - learningTypeId
 *         - description
 *       properties:
 *         subject:
 *           type: string
 *           description: Subject name (e.g., Mathematics, English, Science)
 *         subjectCode:
 *           type: string
 *           description: Unique subject code
 *         instituteId:
 *           type: string
 *           description: Associated institute ID
 *         departmentId:
 *           type: string
 *           description: Associated department ID
 *         gradeId:
 *           type: string
 *           description: Associated grade ID
 *         subjectTypeId:
 *           type: string
 *           description: Subject type ID
 *         learningTypeId:
 *           type: string
 *           description: Learning type ID
 *         description:
 *           type: string
 *           description: Subject description
 *     SubjectResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *         data:
 *           type: object
 *           properties:
 *             subject:
 *               $ref: '#/components/schemas/Subject'
 *             id:
 *               type: string
 *               description: Created subject ID
 *     SubjectListResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Subject'
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
 *     SubjectUpdateRequest:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           required: true
 *           description: Subject ID to update
 *         name:
 *           type: string
 *           description: Updated subject name
 *         code:
 *           type: string
 *           description: Updated subject code
 *         description:
 *           type: string
 *           description: Updated description
 *         credits:
 *           type: number
 *           description: Updated credits
 *         category:
 *           type: string
 *           enum: [core, elective, optional, practical]
 *           description: Updated category
 *         difficulty:
 *           type: string
 *           enum: [beginner, intermediate, advanced, expert]
 *           description: Updated difficulty level
 *         maxStudents:
 *           type: integer
 *           description: Updated maximum students
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended]
 *           description: Updated status
 *         order:
 *           type: integer
 *           description: Updated order
 *     SubjectDeleteRequest:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           description: Subject ID to delete
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
 *   name: Subjects
 *   description: Subject management endpoints within institutes
 */

/**
 * @swagger
 * /instituteAggreRt/subjectsInInstitute:
 *   get:
 *     summary: Get subjects in institute with comprehensive filtering
 *     tags: [Subjects]
 *     description: |
 *       Retrieve subjects within an institute with comprehensive filtering, pagination, and search capabilities.
 *       **Key Features:**
 *       - Pagination support with customizable page size
 *       - Advanced filtering by multiple criteria
 *       - Search by subject name or code
 *       - Sorting by various fields
 *       - Comprehensive subject information
 *       **Filter Combinations:**
 *       - Basic list: No parameters - returns all subjects with pagination
 *       - Filtered by category: `?category=core`
 *       - Filtered by difficulty: `?difficulty=intermediate`
 *       - Filtered by status: `?status=active`
 *       - Filtered by grade: `?gradeId=507f1f77bcf86cd799439013`
 *       - Search by name: `?search=Mathematics`
 *       - Combined filters: `?category=core&difficulty=intermediate&status=active`
 *       - Paginated: `?page=2&limit=5`
 *       - Sorted: `?sortBy=name&sortOrder=asc`
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
 *         description: Number of items per page (max 100)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search subjects by name or code
 *       - in: query
 *         name: instituteId
 *         schema:
 *           type: string
 *         description: Filter by institute ID
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *         description: Filter by department ID
 *       - in: query
 *         name: gradeId
 *         schema:
 *           type: string
 *         description: Filter by grade ID
 *       - in: query
 *         name: subjectTypeId
 *         schema:
 *           type: string
 *         description: Filter by subject type ID
 *       - in: query
 *         name: learningTypeId
 *         schema:
 *           type: string
 *         description: Filter by learning type ID
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [core, elective, optional, practical]
 *         description: Filter by subject category
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced, expert]
 *         description: Filter by difficulty level
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended]
 *         description: Filter by status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [subject, subjectCode, createdAt, updatedAt, credits]
 *           default: "subject"
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: "asc"
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Subjects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       subject:
 *                         type: string
 *                       subjectCode:
 *                         type: string
 *                       instituteId:
 *                         type: string
 *                       departmentId:
 *                         type: string
 *                       gradeId:
 *                         type: string
 *                       subjectTypeId:
 *                         type: string
 *                       learningTypeId:
 *                         type: string
 *                       description:
 *                         type: string
 *                       category:
 *                         type: string
 *                       difficulty:
 *                         type: string
 *                       credits:
 *                         type: number
 *                       maxStudents:
 *                         type: integer
 *                       status:
 *                         type: string
 *                       order:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 count:
 *                   type: integer
 *                   description: Number of subjects returned
 *                 total:
 *                   type: integer
 *                   description: Total number of subjects
 *                 page:
 *                   type: integer
 *                   description: Current page number
 *                 limit:
 *                   type: integer
 *                   description: Items per page
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *             examples:
 *               all_subjects:
 *                 summary: All subjects with pagination
 *                 value:
 *                   success: true
 *                   message: "Subjects retrieved successfully"
 *                   data:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       subject: "Mathematics"
 *                       subjectCode: "MATH101"
 *                       instituteId: "507f1f77bcf86cd799439011"
 *                       departmentId: "507f1f77bcf86cd799439012"
 *                       gradeId: "507f1f77bcf86cd799439013"
 *                       subjectTypeId: "507f1f77bcf86cd799439014"
 *                       learningTypeId: "507f1f77bcf86cd799439015"
 *                       description: "Advanced Mathematics including Algebra and Calculus"
 *                       category: "core"
 *                       difficulty: "intermediate"
 *                       credits: 4
 *                       maxStudents: 30
 *                       status: "active"
 *                       order: 1
 *                       createdAt: "2024-01-15T10:30:00.000Z"
 *                       updatedAt: "2024-01-15T10:30:00.000Z"
 *                   count: 10
 *                   total: 25
 *                   page: 1
 *                   limit: 10
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *               filtered_subjects:
 *                 summary: Filtered by category and difficulty
 *                 value:
 *                   success: true
 *                   message: "Subjects retrieved successfully"
 *                   data:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       subject: "Mathematics"
 *                       subjectCode: "MATH101"
 *                       category: "core"
 *                       difficulty: "intermediate"
 *                       status: "active"
 *                   count: 5
 *                   total: 5
 *                   page: 1
 *                   limit: 10
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
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
 *                       code:
 *                         type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
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
 *                       code:
 *                         type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
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
 *                       code:
 *                         type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */

router.get('/subjectsInInstitute',subjectsCt.subjectsInInstituteAg);

/**
 * @swagger
 * /instituteAggreRt/subjectsInInstitute:
 *   post:
 *     summary: Create a new subject in institute with comprehensive setup
 *     tags: [Subjects]
 *     description: |
 *       Create a new subject within an institute with comprehensive validation and setup.
 *       **Key Features:**
 *       - Complete subject profile creation
 *       - Automatic subject code validation
 *       - Category and difficulty assignment
 *       - Credit and capacity configuration
 *       - Multi-tenant isolation
 *       - Comprehensive validation
 *       **Creation Options:**
 *       - Basic subject: Minimal required information only
 *       - Complete subject: All available information and features
 *       - Custom categories: Specify subject category and difficulty
 *       - Custom settings: Set credits, max students, and order
 *       - Advanced configuration: Set learning types and subject types
 *       **Validation:**
 *       - Subject code uniqueness within institute
 *       - Required field validation
 *       - Data format validation
 *       - Business rule validation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - subjectCode
 *               - instituteId
 *               - departmentId
 *               - gradeId
 *               - subjectTypeId
 *               - learningTypeId
 *               - description
 *             properties:
 *               subject:
 *                 type: string
 *                 description: Subject name
 *               subjectCode:
 *                 type: string
 *                 description: Unique subject code within institute
 *               instituteId:
 *                 type: string
 *                 description: Associated institute ID
 *               departmentId:
 *                 type: string
 *                 description: Associated department ID
 *               gradeId:
 *                 type: string
 *                 description: Associated grade ID
 *               subjectTypeId:
 *                 type: string
 *                 description: Subject type ID
 *               learningTypeId:
 *                 type: string
 *                 description: Learning type ID
 *               description:
 *                 type: string
 *                 description: Subject description
 *               category:
 *                 type: string
 *                 enum: [core, elective, optional, practical]
 *                 description: Subject category (optional)
 *               difficulty:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced, expert]
 *                 description: Difficulty level (optional)
 *               credits:
 *                 type: number
 *                 minimum: 0
 *                 description: Number of credits (optional)
 *               maxStudents:
 *                 type: integer
 *                 minimum: 1
 *                 description: Maximum number of students (optional)
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended]
 *                 description: Subject status (optional, defaults to active)
 *               order:
 *                 type: integer
 *                 minimum: 1
 *                 description: Display order (optional)
 *           examples:
 *             basic_subject:
 *               summary: Basic subject creation
 *               description: Create a subject with minimal required information
 *               value:
 *                 subject: "Mathematics"
 *                 subjectCode: "MATH101"
 *                 instituteId: "507f1f77bcf86cd799439011"
 *                 departmentId: "507f1f77bcf86cd799439012"
 *                 gradeId: "507f1f77bcf86cd799439013"
 *                 subjectTypeId: "507f1f77bcf86cd799439014"
 *                 learningTypeId: "507f1f77bcf86cd799439015"
 *                 description: "Advanced Mathematics including Algebra and Calculus"
 *             complete_subject:
 *               summary: Complete subject creation
 *               description: Create a subject with all available information
 *               value:
 *                 subject: "Advanced Physics"
 *                 subjectCode: "PHYS201"
 *                 instituteId: "507f1f77bcf86cd799439011"
 *                 departmentId: "507f1f77bcf86cd799439012"
 *                 gradeId: "507f1f77bcf86cd799439013"
 *                 subjectTypeId: "507f1f77bcf86cd799439014"
 *                 learningTypeId: "507f1f77bcf86cd799439015"
 *                 description: "Advanced Physics covering Mechanics, Thermodynamics, and Quantum Physics"
 *                 category: "core"
 *                 difficulty: "advanced"
 *                 credits: 5
 *                 maxStudents: 25
 *                 status: "active"
 *                 order: 2
 *             elective_subject:
 *               summary: Elective subject creation
 *               description: Create an elective subject
 *               value:
 *                 subject: "Creative Writing"
 *                 subjectCode: "ENG301"
 *                 instituteId: "507f1f77bcf86cd799439011"
 *                 departmentId: "507f1f77bcf86cd799439012"
 *                 gradeId: "507f1f77bcf86cd799439013"
 *                 subjectTypeId: "507f1f77bcf86cd799439014"
 *                 learningTypeId: "507f1f77bcf86cd799439015"
 *                 description: "Creative writing workshop for advanced students"
 *                 category: "elective"
 *                 difficulty: "intermediate"
 *                 credits: 3
 *                 maxStudents: 20
 *                 status: "active"
 *                 order: 5
 *     responses:
 *       201:
 *         description: Subject created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     subject:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         subject:
 *                           type: string
 *                         subjectCode:
 *                           type: string
 *                         instituteId:
 *                           type: string
 *                         departmentId:
 *                           type: string
 *                         gradeId:
 *                           type: string
 *                         subjectTypeId:
 *                           type: string
 *                         learningTypeId:
 *                           type: string
 *                         description:
 *                           type: string
 *                         category:
 *                           type: string
 *                         difficulty:
 *                           type: string
 *                         credits:
 *                           type: number
 *                         maxStudents:
 *                           type: integer
 *                         status:
 *                           type: string
 *                         order:
 *                           type: integer
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *             examples:
 *               basic_creation:
 *                 summary: Basic subject creation
 *                 value:
 *                   success: true
 *                   message: "Subject created successfully"
 *                   data:
 *                     subject:
 *                       _id: "507f1f77bcf86cd799439011"
 *                       subject: "Mathematics"
 *                       subjectCode: "MATH101"
 *                       instituteId: "507f1f77bcf86cd799439011"
 *                       departmentId: "507f1f77bcf86cd799439012"
 *                       gradeId: "507f1f77bcf86cd799439013"
 *                       subjectTypeId: "507f1f77bcf86cd799439014"
 *                       learningTypeId: "507f1f77bcf86cd799439015"
 *                       description: "Advanced Mathematics including Algebra and Calculus"
 *                       category: "core"
 *                       difficulty: "intermediate"
 *                       credits: 4
 *                       maxStudents: 30
 *                       status: "active"
 *                       order: 1
 *                       createdAt: "2024-01-15T10:30:00.000Z"
 *                       updatedAt: "2024-01-15T10:30:00.000Z"
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *               complete_creation:
 *                 summary: Complete subject creation
 *                 value:
 *                   success: true
 *                   message: "Subject created successfully"
 *                   data:
 *                     subject:
 *                       _id: "507f1f77bcf86cd799439011"
 *                       subject: "Advanced Physics"
 *                       subjectCode: "PHYS201"
 *                       instituteId: "507f1f77bcf86cd799439011"
 *                       departmentId: "507f1f77bcf86cd799439012"
 *                       gradeId: "507f1f77bcf86cd799439013"
 *                       subjectTypeId: "507f1f77bcf86cd799439014"
 *                       learningTypeId: "507f1f77bcf86cd799439015"
 *                       description: "Advanced Physics covering Mechanics, Thermodynamics, and Quantum Physics"
 *                       category: "core"
 *                       difficulty: "advanced"
 *                       credits: 5
 *                       maxStudents: 25
 *                       status: "active"
 *                       order: 2
 *                       createdAt: "2024-01-15T10:30:00.000Z"
 *                       updatedAt: "2024-01-15T10:30:00.000Z"
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
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
 *                       code:
 *                         type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *             examples:
 *               validation_error:
 *                 summary: Validation error
 *                 value:
 *                   success: false
 *                   message: "Validation failed"
 *                   errors:
 *                     - field: "subject"
 *                       message: "Subject name is required"
 *                       code: "REQUIRED_FIELD"
 *                     - field: "subjectCode"
 *                       message: "Subject code is required"
 *                       code: "REQUIRED_FIELD"
 *                     - field: "credits"
 *                       message: "Credits must be a positive number"
 *                       code: "INVALID_NUMBER"
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *               duplicate_code:
 *                 summary: Duplicate subject code
 *                 value:
 *                   success: false
 *                   message: "Subject code already exists"
 *                   errors:
 *                     - field: "subjectCode"
 *                       message: "Subject code 'MATH101' already exists in this institute"
 *                       code: "DUPLICATE_CODE"
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
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
 *                       code:
 *                         type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       409:
 *         description: Conflict - subject code already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
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
 *                       code:
 *                         type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
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
 *                       code:
 *                         type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */

router.post('/subjectsInInstitute',subjectsCt.createSubjectsInInstitute);

/**
 * @swagger
 * /instituteAggreRt/subjectsInInstitute:
 *   put:
 *     summary: Update subject in institute with comprehensive options
 *     tags: [Subjects]
 *     description: |
 *       Update existing subject information within an institute with comprehensive validation and options.
 *       **Key Features:**
 *       - Partial updates (only provided fields are updated)
 *       - Category and difficulty changes
 *       - Credit and capacity adjustments
 *       - Status management
 *       - Order and display settings
 *       - Comprehensive validation
 *       **Update Options:**
 *       - Basic updates: Update name, description, or credits
 *       - Category changes: Change subject category or difficulty
 *       - Capacity adjustments: Update max students or order
 *       - Status changes: Activate, deactivate, or suspend subjects
 *       - Complete updates: Update multiple fields at once
 *       **Validation:**
 *       - Subject ID must exist
 *       - Subject code uniqueness (if changed)
 *       - Data format validation
 *       - Business rule validation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 description: Subject ID to update
 *               subject:
 *                 type: string
 *                 description: Updated subject name
 *               subjectCode:
 *                 type: string
 *                 description: Updated subject code
 *               description:
 *                 type: string
 *                 description: Updated description
 *               category:
 *                 type: string
 *                 enum: [core, elective, optional, practical]
 *                 description: Updated category
 *               difficulty:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced, expert]
 *                 description: Updated difficulty level
 *               credits:
 *                 type: number
 *                 minimum: 0
 *                 description: Updated credits
 *               maxStudents:
 *                 type: integer
 *                 minimum: 1
 *                 description: Updated maximum students
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended]
 *                 description: Updated status
 *               order:
 *                 type: integer
 *                 minimum: 1
 *                 description: Updated display order
 *           examples:
 *             basic_update:
 *               summary: Basic subject update
 *               description: Update subject name and description
 *               value:
 *                 id: "507f1f77bcf86cd799439011"
 *                 subject: "Advanced Mathematics"
 *                 description: "Advanced Mathematics including Calculus and Statistics"
 *             category_update:
 *               summary: Category and difficulty update
 *               description: Update subject category and difficulty
 *               value:
 *                 id: "507f1f77bcf86cd799439011"
 *                 category: "core"
 *                 difficulty: "advanced"
 *                 credits: 5
 *             capacity_update:
 *               summary: Capacity and order update
 *               description: Update max students and display order
 *               value:
 *                 id: "507f1f77bcf86cd799439011"
 *                 maxStudents: 25
 *                 order: 2
 *             status_update:
 *               summary: Status update
 *               description: Change subject status
 *               value:
 *                 id: "507f1f77bcf86cd799439011"
 *                 status: "inactive"
 *             complete_update:
 *               summary: Complete subject update
 *               description: Update multiple subject fields
 *               value:
 *                 id: "507f1f77bcf86cd799439011"
 *                 subject: "Advanced Mathematics"
 *                 subjectCode: "MATH201"
 *                 description: "Advanced Mathematics including Calculus and Statistics"
 *                 category: "core"
 *                 difficulty: "advanced"
 *                 credits: 5
 *                 maxStudents: 25
 *                 status: "active"
 *                 order: 2
 *     responses:
 *       200:
 *         description: Subject updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     subject:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         subject:
 *                           type: string
 *                         subjectCode:
 *                           type: string
 *                         instituteId:
 *                           type: string
 *                         departmentId:
 *                           type: string
 *                         gradeId:
 *                           type: string
 *                         subjectTypeId:
 *                           type: string
 *                         learningTypeId:
 *                           type: string
 *                         description:
 *                           type: string
 *                         category:
 *                           type: string
 *                         difficulty:
 *                           type: string
 *                         credits:
 *                           type: number
 *                         maxStudents:
 *                           type: integer
 *                         status:
 *                           type: string
 *                         order:
 *                           type: integer
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *             examples:
 *               basic_update_success:
 *                 summary: Basic update success
 *                 value:
 *                   success: true
 *                   message: "Subject updated successfully"
 *                   data:
 *                     subject:
 *                       _id: "507f1f77bcf86cd799439011"
 *                       subject: "Advanced Mathematics"
 *                       subjectCode: "MATH101"
 *                       description: "Advanced Mathematics including Calculus and Statistics"
 *                       category: "core"
 *                       difficulty: "intermediate"
 *                       credits: 4
 *                       maxStudents: 30
 *                       status: "active"
 *                       order: 1
 *                       updatedAt: "2024-01-15T11:30:00.000Z"
 *                   timestamp: "2024-01-15T11:30:00.000Z"
 *               complete_update_success:
 *                 summary: Complete update success
 *                 value:
 *                   success: true
 *                   message: "Subject updated successfully"
 *                   data:
 *                     subject:
 *                       _id: "507f1f77bcf86cd799439011"
 *                       subject: "Advanced Mathematics"
 *                       subjectCode: "MATH201"
 *                       description: "Advanced Mathematics including Calculus and Statistics"
 *                       category: "core"
 *                       difficulty: "advanced"
 *                       credits: 5
 *                       maxStudents: 25
 *                       status: "active"
 *                       order: 2
 *                       updatedAt: "2024-01-15T11:30:00.000Z"
 *                   timestamp: "2024-01-15T11:30:00.000Z"
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
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
 *                       code:
 *                         type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *             examples:
 *               validation_error:
 *                 summary: Validation error
 *                 value:
 *                   success: false
 *                   message: "Validation failed"
 *                   errors:
 *                     - field: "id"
 *                       message: "Subject ID is required"
 *                       code: "REQUIRED_FIELD"
 *                     - field: "credits"
 *                       message: "Credits must be a positive number"
 *                       code: "INVALID_NUMBER"
 *                   timestamp: "2024-01-15T11:30:00.000Z"
 *               duplicate_code:
 *                 summary: Duplicate subject code
 *                 value:
 *                   success: false
 *                   message: "Subject code already exists"
 *                   errors:
 *                     - field: "subjectCode"
 *                       message: "Subject code 'MATH201' already exists in this institute"
 *                       code: "DUPLICATE_CODE"
 *                   timestamp: "2024-01-15T11:30:00.000Z"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
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
 *                       code:
 *                         type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Subject not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
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
 *                       code:
 *                         type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
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
 *                       code:
 *                         type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */

router.put('/subjectsInInstitute',subjectsCt.updateSubjectsInInstitute);

/**
 * @swagger
 * /instituteAggreRt/subjectsInInstitute:
 *   delete:
 *     summary: Delete subject in institute with comprehensive options
 *     tags: [Subjects]
 *     description: |
 *       Delete a subject from an institute with comprehensive validation and safety measures.
 *       **Key Features:**
 *       - Safe deletion with dependency checks
 *       - Soft delete option (mark as inactive)
 *       - Hard delete option (permanent removal)
 *       - Cascade deletion options
 *       - Comprehensive validation
 *       - Audit logging
 *       **Deletion Options:**
 *       - Soft delete: Mark subject as inactive (recommended)
 *       - Hard delete: Permanently remove subject
 *       - Cascade delete: Remove related records (enrollments, grades)
 *       - Safe delete: Check for dependencies before deletion
 *       **Safety Measures:**
 *       - Dependency validation
 *       - Confirmation requirements
 *       - Audit trail maintenance
 *       - Rollback capabilities
 *       **⚠️ WARNING: Hard deletion is irreversible!**
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 description: Subject ID to delete
 *               deleteType:
 *                 type: string
 *                 enum: [soft, hard, cascade]
 *                 default: "soft"
 *                 description: Type of deletion to perform
 *               confirm:
 *                 type: boolean
 *                 description: Confirmation flag for hard/cascade deletion
 *               reason:
 *                 type: string
 *                 description: Reason for deletion (optional)
 *           examples:
 *             soft_delete:
 *               summary: Soft delete (recommended)
 *               description: Mark subject as inactive without permanent removal
 *               value:
 *                 id: "507f1f77bcf86cd799439011"
 *                 deleteType: "soft"
 *                 reason: "Subject temporarily discontinued"
 *             hard_delete:
 *               summary: Hard delete (permanent)
 *               description: Permanently remove subject (requires confirmation)
 *               value:
 *                 id: "507f1f77bcf86cd799439011"
 *                 deleteType: "hard"
 *                 confirm: true
 *                 reason: "Subject permanently removed from curriculum"
 *             cascade_delete:
 *               summary: Cascade delete
 *               description: Remove subject and all related records
 *               value:
 *                 id: "507f1f77bcf86cd799439011"
 *                 deleteType: "cascade"
 *                 confirm: true
 *                 reason: "Complete removal of subject and all associated data"
 *     responses:
 *       200:
 *         description: Subject deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedSubject:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         subject:
 *                           type: string
 *                         subjectCode:
 *                           type: string
 *                         deleteType:
 *                           type: string
 *                         deletedAt:
 *                           type: string
 *                           format: date-time
 *                         reason:
 *                           type: string
 *                     relatedRecords:
 *                       type: object
 *                       description: Information about related records affected
 *                       properties:
 *                         enrollments:
 *                           type: integer
 *                         grades:
 *                           type: integer
 *                         schedules:
 *                           type: integer
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *             examples:
 *               soft_delete_success:
 *                 summary: Soft delete success
 *                 value:
 *                   success: true
 *                   message: "Subject deleted successfully"
 *                   data:
 *                     deletedSubject:
 *                       _id: "507f1f77bcf86cd799439011"
 *                       subject: "Mathematics"
 *                       subjectCode: "MATH101"
 *                       deleteType: "soft"
 *                       deletedAt: "2024-01-15T12:30:00.000Z"
 *                       reason: "Subject temporarily discontinued"
 *                     relatedRecords:
 *                       enrollments: 0
 *                       grades: 0
 *                       schedules: 0
 *                   timestamp: "2024-01-15T12:30:00.000Z"
 *               hard_delete_success:
 *                 summary: Hard delete success
 *                 value:
 *                   success: true
 *                   message: "Subject deleted successfully"
 *                   data:
 *                     deletedSubject:
 *                       _id: "507f1f77bcf86cd799439011"
 *                       subject: "Mathematics"
 *                       subjectCode: "MATH101"
 *                       deleteType: "hard"
 *                       deletedAt: "2024-01-15T12:30:00.000Z"
 *                       reason: "Subject permanently removed from curriculum"
 *                     relatedRecords:
 *                       enrollments: 0
 *                       grades: 0
 *                       schedules: 0
 *                   timestamp: "2024-01-15T12:30:00.000Z"
 *               cascade_delete_success:
 *                 summary: Cascade delete success
 *                 value:
 *                   success: true
 *                   message: "Subject and related records deleted successfully"
 *                   data:
 *                     deletedSubject:
 *                       _id: "507f1f77bcf86cd799439011"
 *                       subject: "Mathematics"
 *                       subjectCode: "MATH101"
 *                       deleteType: "cascade"
 *                       deletedAt: "2024-01-15T12:30:00.000Z"
 *                       reason: "Complete removal of subject and all associated data"
 *                     relatedRecords:
 *                       enrollments: 15
 *                       grades: 45
 *                       schedules: 3
 *                   timestamp: "2024-01-15T12:30:00.000Z"
 *       400:
 *         description: Bad request - validation error or missing confirmation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
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
 *                       code:
 *                         type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *             examples:
 *               validation_error:
 *                 summary: Validation error
 *                 value:
 *                   success: false
 *                   message: "Validation failed"
 *                   errors:
 *                     - field: "id"
 *                       message: "Subject ID is required"
 *                       code: "REQUIRED_FIELD"
 *                   timestamp: "2024-01-15T12:30:00.000Z"
 *               missing_confirmation:
 *                 summary: Missing confirmation
 *                 value:
 *                   success: false
 *                   message: "Confirmation required for hard/cascade deletion"
 *                   errors:
 *                     - field: "confirm"
 *                       message: "Confirmation is required for hard or cascade deletion"
 *                       code: "CONFIRMATION_REQUIRED"
 *                   timestamp: "2024-01-15T12:30:00.000Z"
 *               has_dependencies:
 *                 summary: Subject has dependencies
 *                 value:
 *                   success: false
 *                   message: "Subject cannot be deleted due to existing dependencies"
 *                   errors:
 *                     - field: "dependencies"
 *                       message: "Subject has 15 active enrollments and 45 grades. Use cascade delete or soft delete."
 *                       code: "HAS_DEPENDENCIES"
 *                   timestamp: "2024-01-15T12:30:00.000Z"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
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
 *                       code:
 *                         type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Subject not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
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
 *                       code:
 *                         type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       409:
 *         description: Conflict - subject cannot be deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
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
 *                       code:
 *                         type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
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
 *                       code:
 *                         type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */

router.delete('/subjectsInInstitute',subjectsCt.deleteSubjectsInInstitute);

module.exports = router;