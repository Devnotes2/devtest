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
 *     MemberResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *         data:
 *           type: object
 *           properties:
 *             member:
 *               $ref: '#/components/schemas/Member'
 *             id:
 *               type: string
 *               description: Created member ID
 *     MemberListResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Member'
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
 *         description: Member created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MemberResponse'

 *               data:
 *                 member:
 *                   firstName: "John"
 *                   lastName: "Doe"
 *                   email: "john.doe@example.com"
 *                   role: "teacher"
 *                   instituteId: "507f1f77bcf86cd799439011"
 *                 id: "507f1f77bcf86cd799439014"
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Member with this email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *         description: Members retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MemberListResponse'

 *               data:
 *                 - id: "507f1f77bcf86cd799439011"
 *                   firstName: "John"
 *                   lastName: "Doe"
 *                   email: "john.doe@example.com"
 *                   role: "teacher"
 *                   status: "active"
 *               pagination:
 *                 currentPage: 1
 *                 totalPages: 5
 *                 totalItems: 50
 *                 hasNextPage: true
 *                 hasPrevPage: false
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *         description: Member updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'

 *               data:
 *                 updatedMember:
 *                   id: "507f1f77bcf86cd799439011"
 *                   firstName: "John Updated"
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Member not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *         description: Member deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'

 *               data: {}
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Member not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.delete('/member', memberDataCt.deleteMembers);

module.exports = router;
