const express = require('express');

const router = express.Router();
const regLoginCt = require('../../Controller/authentication/regLoginCt')

/**
 * @swagger
 * components:
 *   schemas:
 *     # ============================================================================
 *     # AUTHENTICATION SCHEMAS
 *     # ============================================================================
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *         - phoneNumber
 *         - instituteCode
 *       properties:
 *         firstName:
 *           type: string
 *           description: User's first name

 *         lastName:
 *           type: string
 *           description: User's last name

 *         email:
 *           type: string
 *           format: email
 *           description: User's email address

 *         password:
 *           type: string
 *           minLength: 8
 *           description: User's password (minimum 8 characters)

 *         phoneNumber:
 *           type: string
 *           description: User's phone number

 *         instituteCode:
 *           type: string
 *           description: Institute code for multi-tenant registration

 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: User's date of birth

 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *           description: User's gender

 *         address:
 *           type: string
 *           description: User's address

 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - instituteCode
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address

 *         password:
 *           type: string
 *           description: User's password

 *         instituteCode:
 *           type: string
 *           description: Institute code for multi-tenant login

 *         rememberMe:
 *           type: boolean
 *           description: Whether to remember the user for extended session

 *     RegisterResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean

 *         message:
 *           type: string

 *         data:
 *           type: object
 *           properties:
 *             user:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string

 *                 firstName:
 *                   type: string

 *                 lastName:
 *                   type: string

 *                 email:
 *                   type: string

 *                 phoneNumber:
 *                   type: string

 *                 instituteCode:
 *                   type: string

 *                 isActive:
 *                   type: boolean

 *                 createdAt:
 *                   type: string
 *                   format: date-time

 *             token:
 *               type: string
 *               description: JWT authentication token

 *             refreshToken:
 *               type: string
 *               description: JWT refresh token

 *         timestamp:
 *           type: string
 *           format: date-time

 *     LoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean

 *         message:
 *           type: string

 *         data:
 *           type: object
 *           properties:
 *             user:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string

 *                 firstName:
 *                   type: string

 *                 lastName:
 *                   type: string

 *                 email:
 *                   type: string

 *                 phoneNumber:
 *                   type: string

 *                 instituteCode:
 *                   type: string

 *                 role:
 *                   type: string

 *                 isActive:
 *                   type: boolean

 *                 lastLogin:
 *                   type: string
 *                   format: date-time

 *             token:
 *               type: string
 *               description: JWT authentication token

 *             refreshToken:
 *               type: string
 *               description: JWT refresh token

 *             expiresIn:
 *               type: string
 *               description: Token expiration time

 *         timestamp:
 *           type: string
 *           format: date-time

 *     ErrorResponse:
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
 *   name: Registration & Login
 *   description: User registration and authentication endpoints
 */

/**
 * @swagger
 * /auth:
 *   post:
 *     summary: Authentication Operations (Register/Login)
 *     tags: [Authentication]
 *     description: |
 *       Unified authentication endpoint that handles both user registration and login operations.
 *       Use the 'action' parameter to specify the operation type.
 *       **Supported Actions:**
 *       - `register`: Create a new user account
 *       - `login`: Authenticate existing user
 *       **Key Features:**
 *       - Multi-tenant support with institute code
 *       - JWT token generation
 *       - Email validation and uniqueness check
 *       - Password strength validation
 *       - Account status validation
 *       - Session management
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [register, login]
 *                 description: Operation type

 *               # Registration fields (when action=register)
 *               firstName:
 *                 type: string
 *                 description: User's first name (required for register)

 *               lastName:
 *                 type: string
 *                 description: User's last name (required for register)

 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address (required for both)

 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: User's password (required for both)

 *               phoneNumber:
 *                 type: string
 *                 description: User's phone number (required for register)

 *               instituteCode:
 *                 type: string
 *                 description: Institute code for multi-tenant (required for both)

 *               # Optional fields for registration
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 description: User's date of birth (optional for register)

 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 description: User's gender (optional for register)

 *               address:
 *                 type: string
 *                 description: User's address (optional for register)

 *               # Login specific fields
 *               rememberMe:
 *                 type: boolean
 *                 description: Whether to remember the user for extended session (optional for login)

 *           examples:
 *             register_basic:
 *               summary: Basic Registration
 *               value:
 *                 action: "register"
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 email: "john.doe@example.com"
 *                 password: "SecurePass123!"
 *                 phoneNumber: "+1234567890"
 *                 instituteCode: "INST001"
 *             register_complete:
 *               summary: Complete Registration
 *               value:
 *                 action: "register"
 *                 firstName: "Jane"
 *                 lastName: "Smith"
 *                 email: "jane.smith@example.com"
 *                 password: "SecurePass123!"
 *                 phoneNumber: "+1987654321"
 *                 instituteCode: "INST001"
 *                 dateOfBirth: "1995-05-20"
 *                 gender: "female"
 *                 address: "456 Oak Ave, Springfield, IL 62701"
 *             login_basic:
 *               summary: Basic Login
 *               value:
 *                 action: "login"
 *                 email: "john.doe@example.com"
 *                 password: "SecurePass123!"
 *                 instituteCode: "INST001"
 *             login_remember:
 *               summary: Login with Remember Me
 *               value:
 *                 action: "login"
 *                 email: "jane.smith@example.com"
 *                 password: "SecurePass123!"
 *                 instituteCode: "INST001"
 *                 rememberMe: true
 *     responses:
 *       200:
 *         description: Operation successful
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
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string

 *                         firstName:
 *                           type: string

 *                         lastName:
 *                           type: string

 *                         email:
 *                           type: string

 *                         phoneNumber:
 *                           type: string

 *                         instituteCode:
 *                           type: string

 *                         role:
 *                           type: string

 *                         isActive:
 *                           type: boolean

 *                         createdAt:
 *                           type: string
 *                           format: date-time

 *                         lastLogin:
 *                           type: string
 *                           format: date-time

 *                     token:
 *                       type: string
 *                       description: JWT authentication token

 *                     refreshToken:
 *                       type: string
 *                       description: JWT refresh token

 *                     expiresIn:
 *                       type: string
 *                       description: Token expiration time

 *                 timestamp:
 *                   type: string
 *                   format: date-time

 *             examples:
 *               register_success:
 *                 summary: Registration Success
 *                 value:
 *                   success: true
 *                   message: "User registered successfully"
 *                   data:
 *                     user:
 *                       _id: "507f1f77bcf86cd799439011"
 *                       firstName: "John"
 *                       lastName: "Doe"
 *                       email: "john.doe@example.com"
 *                       phoneNumber: "+1234567890"
 *                       instituteCode: "INST001"
 *                       isActive: true
 *                       createdAt: "2024-01-15T10:30:00.000Z"
 *                     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *               login_success:
 *                 summary: Login Success
 *                 value:
 *                   success: true
 *                   message: "Login successful"
 *                   data:
 *                     user:
 *                       _id: "507f1f77bcf86cd799439011"
 *                       firstName: "John"
 *                       lastName: "Doe"
 *                       email: "john.doe@example.com"
 *                       phoneNumber: "+1234567890"
 *                       instituteCode: "INST001"
 *                       role: "student"
 *                       isActive: true
 *                       lastLogin: "2024-01-15T10:30:00.000Z"
 *                     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     expiresIn: "24h"
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
 *                 summary: Validation Error
 *                 value:
 *                   success: false
 *                   message: "Validation failed"
 *                   errors:
 *                     - field: "email"
 *                       message: "Email is required"
 *                       code: "REQUIRED_FIELD"
 *                     - field: "password"
 *                       message: "Password must be at least 8 characters long"
 *                       code: "MIN_LENGTH"
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *               duplicate_email:
 *                 summary: Duplicate Email
 *                 value:
 *                   success: false
 *                   message: "Email already exists"
 *                   errors:
 *                     - field: "email"
 *                       message: "This email is already registered"
 *                       code: "DUPLICATE_EMAIL"
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *       401:
 *         description: Unauthorized - invalid credentials
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
 *               invalid_credentials:
 *                 summary: Invalid Credentials
 *                 value:
 *                   success: false
 *                   message: "Invalid credentials"
 *                   errors:
 *                     - field: "credentials"
 *                       message: "Email or password is incorrect"
 *                       code: "INVALID_CREDENTIALS"
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *               account_inactive:
 *                 summary: Account Inactive
 *                 value:
 *                   success: false
 *                   message: "Account is inactive"
 *                   errors:
 *                     - field: "account"
 *                       message: "Your account has been deactivated. Please contact support."
 *                       code: "ACCOUNT_INACTIVE"
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *       409:
 *         description: Conflict - user already exists
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

router.post('/register', regLoginCt.register);
router.post('/login', regLoginCt.login);

module.exports = router;
