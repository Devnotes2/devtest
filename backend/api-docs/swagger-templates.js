/**
 * SWAGGER DOCUMENTATION TEMPLATES
 * 
 * This file contains comprehensive Swagger/OpenAPI documentation templates
 * for all the main route categories in your Institute Management API.
 * 
 * Copy and paste these templates into your respective route files
 * and customize them according to your actual implementation.
 */

// ============================================================================
// AUTHENTICATION ROUTES TEMPLATES
// ============================================================================

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password:
 *           type: string
 *           minLength: 6
 *           description: User's password
 *         firstName:
 *           type: string
 *           description: User's first name
 *         lastName:
 *           type: string
 *           description: User's last name
 *         phone:
 *           type: string
 *           description: User's phone number
 *         role:
 *           type: string
 *           enum: [admin, teacher, student, parent]
 *           description: User's role in the system
 *     
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *     
 *     LoginResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         token:
 *           type: string
 *         refreshToken:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 *     
 *     ForgotPasswordRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *     
 *     ResetPasswordRequest:
 *       type: object
 *       required:
 *         - token
 *         - newPassword
 *       properties:
 *         token:
 *           type: string
 *         newPassword:
 *           type: string
 *           minLength: 6
 *     
 *     OTPVerificationRequest:
 *       type: object
 *       required:
 *         - email
 *         - otp
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         otp:
 *           type: string
 *           minLength: 4
 *           maxLength: 6
 */

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset email sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// ============================================================================
// INSTITUTE DATA ROUTES TEMPLATES
// ============================================================================

/**
 * @swagger
 * components:
 *   schemas:
 *     Institute:
 *       type: object
 *       required:
 *         - name
 *         - code
 *       properties:
 *         name:
 *           type: string
 *           description: Institute name
 *         code:
 *           type: string
 *           description: Unique institute code
 *         address:
 *           type: string
 *           description: Institute address
 *         phone:
 *           type: string
 *           description: Institute phone number
 *         email:
 *           type: string
 *           format: email
 *           description: Institute email
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           default: active
 *     
 *     AcademicYear:
 *       type: object
 *       required:
 *         - name
 *         - startDate
 *         - endDate
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
 *         status:
 *           type: string
 *           enum: [active, inactive, upcoming]
 *           default: active
 *     
 *     Department:
 *       type: object
 *       required:
 *         - name
 *         - code
 *       properties:
 *         name:
 *           type: string
 *           description: Department name
 *         code:
 *           type: string
 *           description: Department code
 *         description:
 *           type: string
 *           description: Department description
 *         headOfDepartment:
 *           type: string
 *           description: Head of department ID
 *     
 *     Grade:
 *       type: object
 *       required:
 *         - name
 *         - code
 *       properties:
 *         name:
 *           type: string
 *           description: Grade name (e.g., Grade 1, Grade 2)
 *         code:
 *           type: string
 *           description: Grade code
 *         description:
 *           type: string
 *           description: Grade description
 *         academicYearId:
 *           type: string
 *           description: Associated academic year ID
 *     
 *     Subject:
 *       type: object
 *       required:
 *         - name
 *         - code
 *       properties:
 *         name:
 *           type: string
 *           description: Subject name
 *         code:
 *           type: string
 *           description: Subject code
 *         description:
 *           type: string
 *           description: Subject description
 *         credits:
 *           type: number
 *           description: Subject credits
 *         gradeId:
 *           type: string
 *           description: Associated grade ID
 */

/**
 * @swagger
 * tags:
 *   name: Institutes
 *   description: Institute management endpoints
 *   name: Academic Years
 *   description: Academic year management endpoints
 *   name: Departments
 *   description: Department management endpoints
 *   name: Grades
 *   description: Grade management endpoints
 *   name: Subjects
 *   description: Subject management endpoints
 */

/**
 * @swagger
 * /institutes:
 *   get:
 *     summary: Get all institutes
 *     tags: [Institutes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
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
 *         description: Search institutes by name or code
 *     responses:
 *       200:
 *         description: List of institutes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Institute'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPrevPage:
 *                       type: boolean
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /institutes:
 *   post:
 *     summary: Create a new institute
 *     tags: [Institutes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Institute'
 *     responses:
 *       201:
 *         description: Institute created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Institute code already exists
 */

// ============================================================================
// MEMBERS MODULE ROUTES TEMPLATES
// ============================================================================

/**
 * @swagger
 * components:
 *   schemas:
 *     Member:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - role
 *       properties:
 *         firstName:
 *           type: string
 *           description: Member's first name
 *         lastName:
 *           type: string
 *           description: Member's last name
 *         email:
 *           type: string
 *           format: email
 *           description: Member's email address
 *         phone:
 *           type: string
 *           description: Member's phone number
 *         role:
 *           type: string
 *           enum: [admin, teacher, student, parent, staff]
 *           description: Member's role
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: Member's date of birth
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *           description: Member's gender
 *         address:
 *           type: string
 *           description: Member's address
 *         instituteId:
 *           type: string
 *           description: Associated institute ID
 *         departmentId:
 *           type: string
 *           description: Associated department ID
 *         gradeId:
 *           type: string
 *           description: Associated grade ID (for students)
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended]
 *           default: active
 */

/**
 * @swagger
 * tags:
 *   name: Members
 *   description: Member management endpoints
 */

/**
 * @swagger
 * /members:
 *   get:
 *     summary: Get all members
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, teacher, student, parent, staff]
 *         description: Filter by role
 *       - in: query
 *         name: instituteId
 *         schema:
 *           type: string
 *         description: Filter by institute
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search members by name or email
 *     responses:
 *       200:
 *         description: List of members retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Member'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPrevPage:
 *                       type: boolean
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

// ============================================================================
// GENERAL DATA ROUTES TEMPLATES
// ============================================================================

/**
 * @swagger
 * components:
 *   schemas:
 *     GeneralData:
 *       type: object
 *       required:
 *         - key
 *         - value
 *       properties:
 *         key:
 *           type: string
 *           description: Data key
 *         value:
 *           type: string
 *           description: Data value
 *         description:
 *           type: string
 *           description: Data description
 *         category:
 *           type: string
 *           description: Data category
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether the data is active
 */

/**
 * @swagger
 * tags:
 *   name: General Data
 *   description: General data management endpoints
 */

// ============================================================================
// S3 MODULE ROUTES TEMPLATES
// ============================================================================

/**
 * @swagger
 * components:
 *   schemas:
 *     FileUpload:
 *       type: object
 *       required:
 *         - file
 *       properties:
 *         file:
 *           type: string
 *           format: binary
 *           description: File to upload
 *         folder:
 *           type: string
 *           description: S3 folder path
 *         fileName:
 *           type: string
 *           description: Custom file name
 *     
 *     FileResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             fileUrl:
 *               type: string
 *               description: Public URL of uploaded file
 *             fileName:
 *               type: string
 *               description: Name of uploaded file
 *             fileSize:
 *               type: number
 *               description: Size of file in bytes
 *             mimeType:
 *               type: string
 *               description: MIME type of file
 */

/**
 * @swagger
 * tags:
 *   name: File Upload
 *   description: File upload and management endpoints
 */

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload a file to S3
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/FileUpload'
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileResponse'
 *       400:
 *         description: Bad request - invalid file
 *       401:
 *         description: Unauthorized
 *       413:
 *         description: File too large
 *       500:
 *         description: Internal server error
 */

// ============================================================================
// ASIDE DATA ROUTES TEMPLATES
// ============================================================================

/**
 * @swagger
 * components:
 *   schemas:
 *     AsideData:
 *       type: object
 *       required:
 *         - title
 *         - type
 *       properties:
 *         title:
 *           type: string
 *           description: Aside data title
 *         type:
 *           type: string
 *           description: Aside data type
 *         content:
 *           type: object
 *           description: Aside data content
 *         order:
 *           type: integer
 *           description: Display order
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether the aside data is active
 */

/**
 * @swagger
 * tags:
 *   name: Aside Data
 *   description: Aside data management endpoints
 */

// ============================================================================
// COMMON RESPONSE SCHEMAS
// ============================================================================

/**
 * @swagger
 * components:
 *   schemas:
 *     PaginatedResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         data:
 *           type: array
 *           items:
 *             type: object
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
 *             limit:
 *               type: integer
 *     
 *     ValidationError:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *               message:
 *                 type: string
 *     
 *     ConflictError:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         field:
 *           type: string
 *         value:
 *           type: string
 */

// ============================================================================
// USAGE INSTRUCTIONS
// ============================================================================

/*
 * HOW TO USE THESE TEMPLATES:
 * 
 * 1. Copy the relevant schema definitions to your route files
 * 2. Add the @swagger JSDoc comments above your route handlers
 * 3. Customize the schemas and responses according to your actual implementation
 * 4. Make sure to include proper error handling and validation
 * 
 * EXAMPLE USAGE IN A ROUTE FILE:
 * 
 * // routes/institutes.js
 * 
 * /**
 *  * @swagger
 *  * /institutes/{id}:
 *  *   get:
 *  *     summary: Get institute by ID
 *  *     tags: [Institutes]
 *  *     parameters:
 *  *       - in: path
 *  *         name: id
 *  *         required: true
 *  *         schema:
 *  *           type: string
 *  *         description: Institute ID
 *  *     responses:
 *  *       200:
 *  *         description: Institute retrieved successfully
 *  *         content:
 *  *           application/json:
 *  *             schema:
 *  *               $ref: '#/components/schemas/Institute'
 *  *       404:
 *  *         description: Institute not found
 *  *       500:
 *  *         description: Internal server error
 *  *\/
 * router.get('/:id', instituteController.getInstituteById);
 * 
 * After adding these comments, your API documentation will automatically
 * appear in the Swagger UI at /docs endpoint.
 */
