// membersDataRt.js (Route file)
const express = require('express');
const router = express.Router();
const memberDataCt = require('../../Controller/membersModule/memberDataCt');  // Controller for handling member data
const upload = require('../../Utilities/multerUtils');  // Import multer configuration

/**
 * @swagger
 * components:
 *   schemas:
 *     # ============================================================================
 *     # MEMBER MANAGEMENT SCHEMAS
 *     # ============================================================================
 *     Member:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - role
 *         - instituteId
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
 *           description: Member's role in the system

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
 *           description: Member's status

 *         profileImage:
 *           type: string
 *           description: Profile image URL

 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp

 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     MemberUpdateRequest:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           required: true
 *           description: Member ID to update
 *         firstName:
 *           type: string
 *           description: Updated first name
 *         lastName:
 *           type: string
 *           description: Updated last name
 *         email:
 *           type: string
 *           format: email
 *           description: Updated email
 *         phone:
 *           type: string
 *           description: Updated phone number
 *         role:
 *           type: string
 *           enum: [admin, teacher, student, parent, staff]
 *           description: Updated role
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended]
 *           description: Updated status
 *     MemberDeleteRequest:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           description: Member ID to delete
 *     FileUpload:
 *       type: object
 *       properties:
 *         profileImage:
 *           type: string
 *           format: binary
 *           description: Profile image file (JPEG, PNG)
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
 *   name: Members
 *   description: Member management endpoints
 */

/**
 * @swagger
 * /membersDataRt/member:
 *   post:
 *     summary: Create a new member
 *     tags: [Members]
 *     description: Create a new member with profile image upload
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - role
 *               - instituteId
 *             properties:
 *               firstName:
 *                 type: string

 *               lastName:
 *                 type: string

 *               email:
 *                 type: string
 *                 format: email

 *               phone:
 *                 type: string

 *               role:
 *                 type: string
 *                 enum: [admin, teacher, student, parent, staff]

 *               dateOfBirth:
 *                 type: string
 *                 format: date

 *               gender:
 *                 type: string
 *                 enum: [male, female, other]

 *               address:
 *                 type: string

 *               instituteId:
 *                 type: string

 *               departmentId:
 *                 type: string

 *               gradeId:
 *                 type: string

 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended]
 *                 default: active

 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: Profile image file (JPEG, PNG)
 *     responses:
 *       201:
 *         description: Resource created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Resource created successfully"
 *                 data:
 *                   type: object
 *                 created:
 *                   type: boolean
 *                   example: true
 *                 id:
 *                   type: string
 *                   example: "507f1f77bcf86cd799439011"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00.000Z"
 *                 requestId:
 *                   type: string
 *                   example: "req_1705312200000_abc123def"
 *                 version:
 *                   type: string
 *                   example: "1.0"
 *             examples:
 *               member_created:
 *                 summary: Member Created Successfully
 *                 value:
 *                   success: true
 *                   message: "Resource created successfully"
 *                   data:
 *                     member:
 *                       _id: "507f1f77bcf86cd799439011"
 *                       firstName: "John"
 *                       lastName: "Doe"
 *                       email: "john.doe@example.com"
 *                       role: "teacher"
 *                       instituteId: "507f1f77bcf86cd799439011"
 *                       createdAt: "2024-01-15T10:30:00.000Z"
 *                   created: true
 *                   id: "507f1f77bcf86cd799439011"
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *                   requestId: "req_1705312200000_abc123def"
 *                   version: "1.0"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation failed"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: "email"
 *                       message:
 *                         type: string
 *                         example: "Email is required"
 *                       code:
 *                         type: string
 *                         example: "REQUIRED_FIELD"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       409:
 *         description: Conflict
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Resource already exists"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

// POST route for adding member data with image upload
router.post('/member', upload, memberDataCt.createMember);  // Apply upload middleware before the controller

/**
 * @swagger
 * /membersDataRt/member:
 *   get:
 *     summary: Get all members
 *     tags: [Members]
 *     description: Retrieve a list of all members with optional filtering and pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
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
 *         name: departmentId
 *         schema:
 *           type: string
 *         description: Filter by department
 *       - in: query
 *         name: gradeId
 *         schema:
 *           type: string
 *         description: Filter by grade
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended]
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search members by name or email
 *       - in: query
 *         name: ids
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             pattern: '^[0-9a-fA-F]{24}$'
 *         style: form
 *         explode: false
 *         description: Array of specific member IDs to retrieve (comma-separated)

 *       - in: query
 *         name: dropdown
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Return simplified data with only _id and fullName fields for dropdowns

 *       - in: query
 *         name: aggregate
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Include related data (institute, department, grade details) in response

 *       - in: query
 *         name: sortField
 *         schema:
 *           type: string
 *         description: Field to sort by (e.g., fullName, createdAt, updatedAt, email)

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
 *         description: Field(s) to filter by (e.g., fullName, email, memberId, firstName, lastName)

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

 *       - in: query
 *         name: memberId
 *         schema:
 *           type: string
 *         description: Validate if memberId already exists (use with validate=true)

 *     responses:
 *       200:
 *         description: Operation completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Operation completed successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Member'
 *                 count:
 *                   type: integer
 *                   example: 10
 *                 filteredDocs:
 *                   type: integer
 *                   example: 8
 *                 totalDocs:
 *                   type: integer
 *                   example: 100
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 mode:
 *                   type: string
 *                   example: "aggregated"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00.000Z"
 *                 requestId:
 *                   type: string
 *                   example: "req_1705312200000_abc123def"
 *                 version:
 *                   type: string
 *                   example: "1.0"
 *             examples:
 *               members_list:
 *                 summary: Members List
 *                 value:
 *                   success: true
 *                   message: "Operation completed successfully"
 *                   data:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       firstName: "John"
 *                       lastName: "Doe"
 *                       email: "john.doe@example.com"
 *                       role: "teacher"
 *                       status: "active"
 *                       instituteId: "507f1f77bcf86cd799439012"
 *                       createdAt: "2024-01-15T10:30:00.000Z"
 *                       updatedAt: "2024-01-15T10:30:00.000Z"
 *                   count: 1
 *                   filteredDocs: 1
 *                   totalDocs: 50
 *                   page: 1
 *                   limit: 10
 *                   mode: "aggregated"
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *                   requestId: "req_1705312200000_abc123def"
 *                   version: "1.0"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation failed"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: "role"
 *                       message:
 *                         type: string
 *                         example: "Invalid role value"
 *                       code:
 *                         type: string
 *                         example: "INVALID_ENUM"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
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
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

router.get('/member', memberDataCt.getMembersData);

/**
 * @swagger
 * /membersDataRt/member:
 *   put:
 *     summary: Update member
 *     tags: [Members]
 *     description: Update existing member information
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MemberUpdateRequest'

 *             firstName: "John Updated"
 *             phone: "+1987654321"
 *             status: "active"
 *     responses:
 *       200:
 *         description: Resource updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Resource updated successfully"
 *                 data:
 *                   type: object
 *                 updated:
 *                   type: boolean
 *                   example: true
 *                 id:
 *                   type: string
 *                   example: "507f1f77bcf86cd799439011"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00.000Z"
 *                 requestId:
 *                   type: string
 *                   example: "req_1705312200000_abc123def"
 *                 version:
 *                   type: string
 *                   example: "1.0"
 *             examples:
 *               member_updated:
 *                 summary: Member Updated Successfully
 *                 value:
 *                   success: true
 *                   message: "Resource updated successfully"
 *                   data:
 *                     updatedMember:
 *                       _id: "507f1f77bcf86cd799439011"
 *                       firstName: "John Updated"
 *                       lastName: "Doe"
 *                       email: "john.doe@example.com"
 *                       updatedAt: "2024-01-15T10:30:00.000Z"
 *                   updated: true
 *                   id: "507f1f77bcf86cd799439011"
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *                   requestId: "req_1705312200000_abc123def"
 *                   version: "1.0"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation failed"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: "email"
 *                       message:
 *                         type: string
 *                         example: "Invalid email format"
 *                       code:
 *                         type: string
 *                         example: "INVALID_FORMAT"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       404:
 *         description: Resource not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Resource not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

router.put('/member', memberDataCt.updateMember);

/**
 * @swagger
 * /membersDataRt/member:
 *   delete:
 *     summary: Delete member
 *     tags: [Members]
 *     description: Delete a member from the system
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MemberDeleteRequest'

 *     responses:
 *       200:
 *         description: Resource deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Resource deleted successfully"
 *                 data:
 *                   type: object
 *                 deleted:
 *                   type: boolean
 *                   example: true
 *                 id:
 *                   type: string
 *                   example: "507f1f77bcf86cd799439011"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00.000Z"
 *                 requestId:
 *                   type: string
 *                   example: "req_1705312200000_abc123def"
 *                 version:
 *                   type: string
 *                   example: "1.0"
 *             examples:
 *               member_deleted:
 *                 summary: Member Deleted Successfully
 *                 value:
 *                   success: true
 *                   message: "Resource deleted successfully"
 *                   data: {}
 *                   deleted: true
 *                   id: "507f1f77bcf86cd799439011"
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *                   requestId: "req_1705312200000_abc123def"
 *                   version: "1.0"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation failed"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: "id"
 *                       message:
 *                         type: string
 *                         example: "Member ID is required"
 *                       code:
 *                         type: string
 *                         example: "REQUIRED_FIELD"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       404:
 *         description: Resource not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Resource not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

router.delete('/member', memberDataCt.deleteMembers);

module.exports = router;
