// membersDataRt.js (Route file)
const express = require('express');
const router = express.Router();
const memberDataCt = require('../../Controller/membersModule/memberDataCt');  // Controller for handling member data
const upload = require('../../Utilities/multerUtils');  // Import multer configuration

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
 *         - instituteId
 *       properties:
 *         firstName:
 *           type: string
 *           description: Member's first name
 *           example: "John"
 *         lastName:
 *           type: string
 *           description: Member's last name
 *           example: "Doe"
 *         email:
 *           type: string
 *           format: email
 *           description: Member's email address
 *           example: "john.doe@example.com"
 *         phone:
 *           type: string
 *           description: Member's phone number
 *           example: "+1234567890"
 *         role:
 *           type: string
 *           enum: [admin, teacher, student, parent, staff]
 *           description: Member's role in the system
 *           example: "teacher"
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: Member's date of birth
 *           example: "1990-01-01"
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *           description: Member's gender
 *           example: "male"
 *         address:
 *           type: string
 *           description: Member's address
 *           example: "123 Main St, City, State"
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
 *           description: Associated grade ID (for students)
 *           example: "507f1f77bcf86cd799439013"
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended]
 *           default: active
 *           description: Member's status
 *           example: "active"
 *         profileImage:
 *           type: string
 *           description: Profile image URL
 *           example: "https://example.com/images/profile.jpg"
 *     
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
 *     
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
 *     
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
 *     
 *     MemberDeleteRequest:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           description: Member ID to delete
 *           example: "507f1f77bcf86cd799439011"
 *     
 *     FileUpload:
 *       type: object
 *       properties:
 *         profileImage:
 *           type: string
 *           format: binary
 *           description: Profile image file (JPEG, PNG)
 *     
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *         data:
 *           type: object
 *           description: Response data
 *     
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
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               role:
 *                 type: string
 *                 enum: [admin, teacher, student, parent, staff]
 *                 example: "teacher"
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 example: "male"
 *               address:
 *                 type: string
 *                 example: "123 Main St, City, State"
 *               instituteId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               departmentId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439012"
 *               gradeId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439013"
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended]
 *                 default: active
 *                 example: "active"
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
 *             example:
 *               message: "Member created successfully"
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
 *     responses:
 *       200:
 *         description: Members retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MemberListResponse'
 *             example:
 *               message: "Members retrieved successfully"
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
 *           example:
 *             id: "507f1f77bcf86cd799439011"
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
 *             example:
 *               message: "Member updated successfully"
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
 *           example:
 *             id: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Member deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               message: "Member deleted successfully"
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
