const express = require('express');

const router = express.Router();
const tenantCt = require('../../Controller/authentication/tenantCt');

/**
 * @swagger
 * components:
 *   schemas:
 *     # ============================================================================
 *     # TENANT MANAGEMENT SCHEMAS
 *     # ============================================================================
 *     Tenant:
 *       type: object
 *       required:
 *         - instituteName
 *         - instituteCode
 *         - contactEmail
 *         - contactPhone
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique tenant identifier
 *         instituteName:
 *           type: string
 *           description: Full name of the institute
 *         instituteCode:
 *           type: string
 *           description: Unique code for the institute (used for multi-tenant routing)
 *         contactEmail:
 *           type: string
 *           format: email
 *           description: Primary contact email for the institute
 *         contactPhone:
 *           type: string
 *           description: Primary contact phone number
 *         address:
 *           type: string
 *           description: Physical address of the institute
 *         city:
 *           type: string
 *           description: City where the institute is located
 *         state:
 *           type: string
 *           description: State or province
 *         country:
 *           type: string
 *           description: Country
 *         postalCode:
 *           type: string
 *           description: Postal or ZIP code
 *         website:
 *           type: string
 *           format: uri
 *           description: Institute website URL
 *         description:
 *           type: string
 *           description: Brief description of the institute
 *         establishedYear:
 *           type: integer
 *           description: Year the institute was established
 *         type:
 *           type: string
 *           enum: [university, college, school, institute, academy]
 *           description: Type of educational institution
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended, pending]
 *           description: Current status of the tenant
 *         maxUsers:
 *           type: integer
 *           description: Maximum number of users allowed
 *         currentUsers:
 *           type: integer
 *           description: Current number of active users
 *         subscriptionPlan:
 *           type: string
 *           enum: [basic, standard, premium, enterprise]
 *           description: Subscription plan type
 *         subscriptionExpiry:
 *           type: string
 *           format: date
 *           description: Subscription expiry date
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           description: Enabled features for this tenant
 *         settings:
 *           type: object
 *           description: Tenant-specific configuration settings
 *           properties:
 *             timezone:
 *               type: string
 *             dateFormat:
 *               type: string
 *             language:
 *               type: string
 *             theme:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     TenantCreateRequest:
 *       type: object
 *       required:
 *         - instituteName
 *         - instituteCode
 *         - contactEmail
 *         - contactPhone
 *       properties:
 *         instituteName:
 *           type: string
 *           description: Full name of the institute
 *         instituteCode:
 *           type: string
 *           description: Unique code for the institute
 *         contactEmail:
 *           type: string
 *           format: email
 *           description: Primary contact email
 *         contactPhone:
 *           type: string
 *           description: Primary contact phone number
 *         address:
 *           type: string
 *           description: Physical address
 *         city:
 *           type: string
 *           description: City
 *         state:
 *           type: string
 *           description: State or province
 *         country:
 *           type: string
 *           description: Country
 *         postalCode:
 *           type: string
 *           description: Postal code
 *         website:
 *           type: string
 *           format: uri
 *           description: Website URL
 *         description:
 *           type: string
 *           description: Institute description
 *         establishedYear:
 *           type: integer
 *           description: Year established
 *         type:
 *           type: string
 *           enum: [university, college, school, institute, academy]
 *           description: Institution type
 *         maxUsers:
 *           type: integer
 *           description: Maximum users allowed
 *         subscriptionPlan:
 *           type: string
 *           enum: [basic, standard, premium, enterprise]
 *           description: Subscription plan
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           description: Enabled features
 *     TenantUpdateRequest:
 *       type: object
 *       properties:
 *         instituteName:
 *           type: string
 *           description: Updated institute name
 *         contactEmail:
 *           type: string
 *           format: email
 *           description: Updated contact email
 *         contactPhone:
 *           type: string
 *           description: Updated contact phone
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
 *         website:
 *           type: string
 *           format: uri
 *           description: Updated website
 *         description:
 *           type: string
 *           description: Updated description
 *         establishedYear:
 *           type: integer
 *           description: Updated established year
 *         type:
 *           type: string
 *           enum: [university, college, school, institute, academy]
 *           description: Updated institution type
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended, pending]
 *           description: Updated status
 *         maxUsers:
 *           type: integer
 *           description: Updated max users
 *         subscriptionPlan:
 *           type: string
 *           enum: [basic, standard, premium, enterprise]
 *           description: Updated subscription plan
 *         subscriptionExpiry:
 *           type: string
 *           format: date
 *           description: Updated subscription expiry
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           description: Updated features
 *         settings:
 *           type: object
 *           description: Updated settings
 *           properties:
 *             timezone:
 *               type: string
 *             dateFormat:
 *               type: string
 *             language:
 *               type: string
 *             theme:
 *               type: string
 *     TenantListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Tenant'
 *         count:
 *           type: integer
 *           description: Number of tenants returned
 *         total:
 *           type: integer
 *           description: Total number of tenants
 *         page:
 *           type: integer
 *           description: Current page number
 *         limit:
 *           type: integer
 *           description: Items per page
 *         timestamp:
 *           type: string
 *           format: date-time
 *     TenantResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/Tenant'
 *         timestamp:
 *           type: string
 *           format: date-time
 *     TenantCreateResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/Tenant'
 *         timestamp:
 *           type: string
 *           format: date-time
 *     TenantUpdateResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/Tenant'
 *         timestamp:
 *           type: string
 *           format: date-time
 *     TenantDeleteResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             deletedTenant:
 *               type: string
 *             deletedAt:
 *               type: string
 *               format: date-time
 *         timestamp:
 *           type: string
 *           format: date-time
 *     TenantErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
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
 *               code:
 *                 type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   name: Tenant Management
 *   description: Multi-tenant institute management endpoints
 */

/**
 * @swagger
 * /tenants:
 *   get:
 *     summary: Get all tenants with filtering and pagination
 *     tags: [Tenant Management]
 *     description: |
 *       Retrieve a list of all tenants (institutes) in the system with comprehensive filtering,
 *       pagination, and search capabilities.
 *       **Key Features:**
 *       - Pagination support with customizable page size
 *       - Advanced filtering by multiple criteria
 *       - Search by institute name or code
 *       - Sorting by various fields
 *       - Comprehensive tenant information
 *       **Filter Combinations:**
 *       - Basic list: No parameters - returns all tenants with pagination
 *       - Filtered by status: `?status=active`
 *       - Filtered by type: `?type=university`
 *       - Filtered by subscription: `?subscriptionPlan=premium`
 *       - Search by name: `?search=ABC University`
 *       - Combined filters: `?status=active&type=university&subscriptionPlan=premium`
 *       - Paginated: `?page=2&limit=5`
 *       - Sorted: `?sortBy=instituteName&sortOrder=asc`
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
 *         description: Search by institute name or code
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended, pending]
 *         description: Filter by tenant status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [university, college, school, institute, academy]
 *         description: Filter by institution type
 *       - in: query
 *         name: subscriptionPlan
 *         schema:
 *           type: string
 *           enum: [basic, standard, premium, enterprise]
 *         description: Filter by subscription plan
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filter by country
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [instituteName, instituteCode, createdAt, updatedAt, currentUsers, maxUsers]
 *           default: "createdAt"
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: "desc"
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Tenants retrieved successfully
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
 *                       instituteName:
 *                         type: string
 *                       instituteCode:
 *                         type: string
 *                       contactEmail:
 *                         type: string
 *                       contactPhone:
 *                         type: string
 *                       address:
 *                         type: string
 *                       city:
 *                         type: string
 *                       state:
 *                         type: string
 *                       country:
 *                         type: string
 *                       website:
 *                         type: string
 *                       type:
 *                         type: string
 *                       status:
 *                         type: string
 *                       maxUsers:
 *                         type: integer
 *                       currentUsers:
 *                         type: integer
 *                       subscriptionPlan:
 *                         type: string
 *                       subscriptionExpiry:
 *                         type: string
 *                       features:
 *                         type: array
 *                         items:
 *                           type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 count:
 *                   type: integer
 *                   description: Number of tenants returned
 *                 total:
 *                   type: integer
 *                   description: Total number of tenants
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
 *               all_tenants:
 *                 summary: All tenants with pagination
 *                 value:
 *                   success: true
 *                   message: "Tenants retrieved successfully"
 *                   data:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       instituteName: "ABC University"
 *                       instituteCode: "ABC001"
 *                       contactEmail: "admin@abcuniversity.edu"
 *                       contactPhone: "+1-555-123-4567"
 *                       address: "123 Education Street, Academic City, AC 12345"
 *                       city: "Academic City"
 *                       state: "AC"
 *                       country: "United States"
 *                       website: "https://www.abcuniversity.edu"
 *                       type: "university"
 *                       status: "active"
 *                       maxUsers: 10000
 *                       currentUsers: 2500
 *                       subscriptionPlan: "standard"
 *                       subscriptionExpiry: "2024-12-31"
 *                       features: ["student_management", "grade_tracking", "attendance"]
 *                       createdAt: "2024-01-15T10:30:00.000Z"
 *                       updatedAt: "2024-01-15T10:30:00.000Z"
 *                   count: 10
 *                   total: 25
 *                   page: 1
 *                   limit: 10
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *               filtered_tenants:
 *                 summary: Filtered by status and type
 *                 value:
 *                   success: true
 *                   message: "Tenants retrieved successfully"
 *                   data:
 *                     - _id: "507f1f77bcf86cd799439012"
 *                       instituteName: "XYZ College"
 *                       instituteCode: "XYZ001"
 *                       contactEmail: "admin@xyzcollege.edu"
 *                       type: "college"
 *                       status: "active"
 *                       subscriptionPlan: "premium"
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
 *         description: Unauthorized - insufficient permissions
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

// GET all tenants
router.get('/tenants', tenantCt.getTenants);

/**
 * @swagger
 * /tenants:
 *   post:
 *     summary: Create a new tenant
 *     tags: [Tenant Management]
 *     description: |
 *       Create a new tenant (institute) in the multi-tenant system. This endpoint sets up
 *       a new educational institution with its own database and configuration.
 *       **Key Features:**
 *       - Multi-tenant database setup
 *       - Unique institute code validation
 *       - Subscription plan assignment
 *       - Feature enablement configuration
 *       - Initial admin user creation
 *       - Database schema initialization
 *       **Business Logic:**
 *       - Validates institute code uniqueness
 *       - Creates dedicated database for the tenant
 *       - Sets up initial database schema
 *       - Configures tenant-specific settings
 *       - Creates default admin user account
 *       - Sends welcome email to contact
 *       - Logs tenant creation for audit
 *       **Validation Rules:**
 *       - Institute code must be unique across all tenants
 *       - Contact email must be valid and unique
 *       - All required fields must be provided
 *       - Subscription plan must be valid
 *       - Max users must be a positive integer
 *       **Database Operations:**
 *       - Creates new MongoDB database
 *       - Initializes collections and indexes
 *       - Sets up tenant-specific configurations
 *       - Creates initial admin user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TenantCreateRequest'
 *           examples:
 *             university_tenant:
 *               summary: University tenant creation
 *               description: Create a new university tenant
 *               value:
 *                 instituteName: "ABC University"
 *                 instituteCode: "ABC001"
 *                 contactEmail: "admin@abcuniversity.edu"
 *                 contactPhone: "+1-555-123-4567"
 *                 address: "123 Education Street, Academic City, AC 12345"
 *                 city: "Academic City"
 *                 state: "AC"
 *                 country: "United States"
 *                 postalCode: "12345"
 *                 website: "https://www.abcuniversity.edu"
 *                 description: "A leading educational institution focused on academic excellence"
 *                 establishedYear: 1990
 *                 type: "university"
 *                 maxUsers: 10000
 *                 subscriptionPlan: "standard"
 *                 features: ["student_management", "grade_tracking", "attendance", "reports"]
 *             college_tenant:
 *               summary: College tenant creation
 *               description: Create a new college tenant
 *               value:
 *                 instituteName: "XYZ Community College"
 *                 instituteCode: "XYZ001"
 *                 contactEmail: "admin@xyzcollege.edu"
 *                 contactPhone: "+1-555-987-6543"
 *                 address: "456 Learning Avenue, Education Town, ET 54321"
 *                 city: "Education Town"
 *                 state: "ET"
 *                 country: "United States"
 *                 postalCode: "54321"
 *                 website: "https://www.xyzcollege.edu"
 *                 description: "Community college serving local students"
 *                 establishedYear: 1985
 *                 type: "college"
 *                 maxUsers: 5000
 *                 subscriptionPlan: "basic"
 *                 features: ["student_management", "grade_tracking"]
 *             school_tenant:
 *               summary: School tenant creation
 *               description: Create a new school tenant
 *               value:
 *                 instituteName: "Sunshine Elementary School"
 *                 instituteCode: "SES001"
 *                 contactEmail: "principal@sunshineschool.edu"
 *                 contactPhone: "+1-555-456-7890"
 *                 address: "789 School Street, Learning City, LC 67890"
 *                 city: "Learning City"
 *                 state: "LC"
 *                 country: "United States"
 *                 postalCode: "67890"
 *                 website: "https://www.sunshineschool.edu"
 *                 description: "Elementary school providing quality education"
 *                 establishedYear: 2000
 *                 type: "school"
 *                 maxUsers: 2000
 *                 subscriptionPlan: "basic"
 *                 features: ["student_management", "attendance"]
 *     responses:
 *       201:
 *         description: Tenant created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TenantCreateResponse'
 *             examples:
 *               successful_creation:
 *                 summary: Successful tenant creation
 *                 description: New tenant created with all configurations
 *                 value:
 *                   success: true
 *                   message: "Tenant created successfully"
 *                   data:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     instituteName: "ABC University"
 *                     instituteCode: "ABC001"
 *                     contactEmail: "admin@abcuniversity.edu"
 *                     contactPhone: "+1-555-123-4567"
 *                     address: "123 Education Street, Academic City, AC 12345"
 *                     city: "Academic City"
 *                     state: "AC"
 *                     country: "United States"
 *                     postalCode: "12345"
 *                     website: "https://www.abcuniversity.edu"
 *                     description: "A leading educational institution focused on academic excellence"
 *                     establishedYear: 1990
 *                     type: "university"
 *                     status: "active"
 *                     maxUsers: 10000
 *                     currentUsers: 0
 *                     subscriptionPlan: "standard"
 *                     subscriptionExpiry: "2024-12-31"
 *                     features: ["student_management", "grade_tracking", "attendance", "reports"]
 *                     createdAt: "2024-01-15T10:30:00.000Z"
 *                     updatedAt: "2024-01-15T10:30:00.000Z"
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TenantErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: Validation error
 *                 description: Missing required fields or invalid data
 *                 value:
 *                   success: false
 *                   message: "Validation failed"
 *                   errors:
 *                     - field: "instituteName"
 *                       message: "Institute name is required"
 *                       code: "REQUIRED_FIELD"
 *                     - field: "instituteCode"
 *                       message: "Institute code is required"
 *                       code: "REQUIRED_FIELD"
 *                     - field: "contactEmail"
 *                       message: "Valid contact email is required"
 *                       code: "INVALID_EMAIL"
 *               duplicate_code:
 *                 summary: Duplicate institute code
 *                 description: Institute code already exists
 *                 value:
 *                   success: false
 *                   message: "Institute code already exists"
 *                   errors:
 *                     - field: "instituteCode"
 *                       message: "Institute code 'ABC001' is already in use"
 *                       code: "DUPLICATE_CODE"
 *               invalid_subscription:
 *                 summary: Invalid subscription plan
 *                 description: Subscription plan is not valid
 *                 value:
 *                   success: false
 *                   message: "Invalid subscription plan"
 *                   errors:
 *                     - field: "subscriptionPlan"
 *                       message: "Subscription plan 'invalid' is not supported"
 *                       code: "INVALID_SUBSCRIPTION"
 *       401:
 *         description: Unauthorized - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TenantErrorResponse'
 *               message: "Unauthorized access"
 *               errors:
 *                 - field: "authorization"
 *                   message: "Super admin access required"
 *                   code: "INSUFFICIENT_PERMISSIONS"
 *       409:
 *         description: Conflict - tenant already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TenantErrorResponse'
 *               message: "Tenant already exists"
 *               errors:
 *                 - field: "instituteCode"
 *                   message: "Institute code 'ABC001' is already registered"
 *                   code: "DUPLICATE_TENANT"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TenantErrorResponse'
 *               message: "Internal server error"
 *               errors:
 *                 - field: "server"
 *                   message: "Failed to create tenant database"
 *                   code: "DATABASE_ERROR"
 */

// POST a new tenant
router.post('/tenants', tenantCt.createTenant);

/**
 * @swagger
 * /tenants/{instituteCode}:
 *   put:
 *     summary: Update a tenant
 *     tags: [Tenant Management]
 *     description: |
 *       Update an existing tenant's information and configuration. This endpoint allows
 *       modification of tenant settings, subscription plans, and features.
 *       **Key Features:**
 *       - Partial updates (only provided fields are updated)
 *       - Subscription plan changes
 *       - Feature enablement/disablement
 *       - Contact information updates
 *       - Settings configuration
 *       - Status management
 *       **Business Logic:**
 *       - Validates institute code exists
 *       - Updates only provided fields
 *       - Handles subscription plan changes
 *       - Manages feature toggles
 *       - Updates tenant settings
 *       - Logs all changes for audit
 *       - Sends notification emails for important changes
 *       **Update Scenarios:**
 *       - Contact information updates
 *       - Subscription plan upgrades/downgrades
 *       - Feature enablement changes
 *       - Settings modifications
 *       - Status changes (active/inactive/suspended)
 *       - User limit adjustments
 *       **Validation Rules:**
 *       - Institute code must exist
 *       - Email format validation (if provided)
 *       - Subscription plan must be valid
 *       - Max users must be positive integer
 *       - Status must be valid enum value
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: instituteCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique institute code of the tenant to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TenantUpdateRequest'
 *           examples:
 *             contact_update:
 *               summary: Update contact information
 *               description: Update tenant contact details
 *               value:
 *                 contactEmail: "newadmin@abcuniversity.edu"
 *                 contactPhone: "+1-555-987-6543"
 *                 address: "456 New Education Street, Academic City, AC 12345"
 *             subscription_upgrade:
 *               summary: Upgrade subscription plan
 *               description: Upgrade tenant to premium plan
 *               value:
 *                 subscriptionPlan: "premium"
 *                 subscriptionExpiry: "2025-12-31"
 *                 maxUsers: 15000
 *                 features: ["student_management", "grade_tracking", "attendance", "reports", "analytics", "custom_reports"]
 *             settings_update:
 *               summary: Update tenant settings
 *               description: Update tenant-specific settings
 *               value:
 *                 settings:
 *                   timezone: "America/Los_Angeles"
 *                   dateFormat: "DD/MM/YYYY"
 *                   language: "es"
 *                   theme: "dark"
 *             status_change:
 *               summary: Change tenant status
 *               description: Suspend or activate tenant
 *               value:
 *                 status: "suspended"
 *             complete_update:
 *               summary: Complete tenant update
 *               description: Update multiple tenant fields
 *               value:
 *                 instituteName: "ABC University - Updated"
 *                 contactEmail: "admin@newabcuniversity.edu"
 *                 website: "https://www.newabcuniversity.edu"
 *                 description: "An updated leading educational institution"
 *                 subscriptionPlan: "enterprise"
 *                 maxUsers: 25000
 *                 features: ["student_management", "grade_tracking", "attendance", "reports", "analytics", "custom_reports", "api_access"]
 *                 settings:
 *                   timezone: "America/New_York"
 *                   dateFormat: "MM/DD/YYYY"
 *                   language: "en"
 *                   theme: "light"
 *     responses:
 *       200:
 *         description: Tenant updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TenantUpdateResponse'
 *             examples:
 *               successful_update:
 *                 summary: Successful tenant update
 *                 description: Tenant information updated successfully
 *                 value:
 *                   success: true
 *                   message: "Tenant updated successfully"
 *                   data:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     instituteName: "ABC University - Updated"
 *                     instituteCode: "ABC001"
 *                     contactEmail: "newadmin@abcuniversity.edu"
 *                     contactPhone: "+1-555-987-6543"
 *                     address: "456 New Education Street, Academic City, AC 12345"
 *                     website: "https://www.newabcuniversity.edu"
 *                     description: "An updated leading educational institution"
 *                     subscriptionPlan: "premium"
 *                     maxUsers: 15000
 *                     features: ["student_management", "grade_tracking", "attendance", "reports", "analytics"]
 *                     settings:
 *                       timezone: "America/Los_Angeles"
 *                       dateFormat: "DD/MM/YYYY"
 *                       language: "es"
 *                       theme: "dark"
 *                     updatedAt: "2024-01-15T11:30:00.000Z"
 *                   timestamp: "2024-01-15T11:30:00.000Z"
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TenantErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: Validation error
 *                 description: Invalid data provided
 *                 value:
 *                   success: false
 *                   message: "Validation failed"
 *                   errors:
 *                     - field: "contactEmail"
 *                       message: "Invalid email format"
 *                       code: "INVALID_EMAIL"
 *                     - field: "maxUsers"
 *                       message: "Max users must be a positive integer"
 *                       code: "INVALID_NUMBER"
 *               invalid_subscription:
 *                 summary: Invalid subscription plan
 *                 description: Subscription plan is not valid
 *                 value:
 *                   success: false
 *                   message: "Invalid subscription plan"
 *                   errors:
 *                     - field: "subscriptionPlan"
 *                       message: "Subscription plan 'invalid' is not supported"
 *                       code: "INVALID_SUBSCRIPTION"
 *       401:
 *         description: Unauthorized - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TenantErrorResponse'
 *               message: "Unauthorized access"
 *               errors:
 *                 - field: "authorization"
 *                   message: "Super admin access required"
 *                   code: "INSUFFICIENT_PERMISSIONS"
 *       404:
 *         description: Tenant not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TenantErrorResponse'
 *               message: "Tenant not found"
 *               errors:
 *                 - field: "instituteCode"
 *                   message: "No tenant found with institute code 'INVALID001'"
 *                   code: "TENANT_NOT_FOUND"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TenantErrorResponse'
 *               message: "Internal server error"
 *               errors:
 *                 - field: "server"
 *                   message: "Failed to update tenant"
 *                   code: "DATABASE_ERROR"
 */

// PUT (update) a tenant
router.put('/tenants/:instituteCode', tenantCt.updateTenant);

/**
 * @swagger
 * /tenants/{instituteCode}:
 *   delete:
 *     summary: Delete a tenant
 *     tags: [Tenant Management]
 *     description: |
 *       Delete a tenant and all associated data from the system. This is a destructive
 *       operation that permanently removes the tenant and all its data.
 *       **⚠️ WARNING: This operation is irreversible!**
 *       **Key Features:**
 *       - Complete tenant data removal
 *       - Database cleanup
 *       - User account deactivation
 *       - Data backup before deletion (optional)
 *       - Audit logging
 *       - Confirmation requirements
 *       **Business Logic:**
 *       - Validates tenant exists and is deletable
 *       - Creates data backup (if configured)
 *       - Deactivates all user accounts
 *       - Removes tenant database
 *       - Cleans up file storage
 *       - Logs deletion for audit
 *       - Sends notification emails
 *       **Deletion Process:**
 *       1. Validate tenant exists and can be deleted
 *       2. Create backup of critical data (optional)
 *       3. Deactivate all user accounts
 *       4. Remove tenant database
 *       5. Clean up associated files
 *       6. Remove tenant record
 *       7. Log deletion event
 *       8. Send notifications
 *       **Safety Measures:**
 *       - Requires super admin authentication
 *       - Confirmation token required
 *       - Data backup before deletion
 *       - Graceful user account handling
 *       - Comprehensive audit trail
 *       **Use Cases:**
 *       - Tenant account closure
 *       - System cleanup
 *       - Compliance requirements
 *       - Data privacy requests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: instituteCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique institute code of the tenant to delete
 *       - in: query
 *         name: confirm
 *         required: true
 *         schema:
 *           type: boolean
 *         description: Confirmation flag - must be true to proceed with deletion
 *       - in: query
 *         name: backup
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Whether to create a backup before deletion
 *     responses:
 *       200:
 *         description: Tenant deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TenantDeleteResponse'
 *             examples:
 *               successful_deletion:
 *                 summary: Successful tenant deletion
 *                 description: Tenant and all associated data deleted
 *                 value:
 *                   success: true
 *                   message: "Tenant deleted successfully"
 *                   data:
 *                     deletedTenant: "ABC001"
 *                     deletedAt: "2024-01-15T12:30:00.000Z"
 *                     backupCreated: true
 *                     usersDeactivated: 2500
 *                     databaseRemoved: true
 *                   timestamp: "2024-01-15T12:30:00.000Z"
 *       400:
 *         description: Bad request - validation error or missing confirmation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TenantErrorResponse'
 *             examples:
 *               missing_confirmation:
 *                 summary: Missing confirmation
 *                 description: Confirmation flag is required
 *                 value:
 *                   success: false
 *                   message: "Confirmation required"
 *                   errors:
 *                     - field: "confirm"
 *                       message: "Deletion confirmation is required"
 *                       code: "CONFIRMATION_REQUIRED"
 *               invalid_confirmation:
 *                 summary: Invalid confirmation
 *                 description: Confirmation must be true
 *                 value:
 *                   success: false
 *                   message: "Invalid confirmation"
 *                   errors:
 *                     - field: "confirm"
 *                       message: "Confirmation must be set to true"
 *                       code: "INVALID_CONFIRMATION"
 *       401:
 *         description: Unauthorized - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TenantErrorResponse'
 *               message: "Unauthorized access"
 *               errors:
 *                 - field: "authorization"
 *                   message: "Super admin access required"
 *                   code: "INSUFFICIENT_PERMISSIONS"
 *       404:
 *         description: Tenant not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TenantErrorResponse'
 *               message: "Tenant not found"
 *               errors:
 *                 - field: "instituteCode"
 *                   message: "No tenant found with institute code 'INVALID001'"
 *                   code: "TENANT_NOT_FOUND"
 *       409:
 *         description: Conflict - tenant cannot be deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TenantErrorResponse'
 *               message: "Tenant cannot be deleted"
 *               errors:
 *                 - field: "tenant"
 *                   message: "Tenant has active subscriptions and cannot be deleted"
 *                   code: "DELETION_NOT_ALLOWED"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TenantErrorResponse'
 *               message: "Internal server error"
 *               errors:
 *                 - field: "server"
 *                   message: "Failed to delete tenant"
 *                   code: "DATABASE_ERROR"
 */

// DELETE a tenant
router.delete('/tenants/:instituteCode', tenantCt.deleteTenant);

module.exports = router;