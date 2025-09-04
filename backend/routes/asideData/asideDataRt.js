const express = require('express');
const router = express.Router();
const asideDataCt = require('../../Controller/asideData/asideDataCt'); // Assuming your model is in models/AsideData.js

/**
 * @swagger
 * components:
 *   schemas:
 *     AsideData:
 *       type: object
 *       required:
 *         - title
 *         - type
 *         - instituteId
 *       properties:
 *         title:
 *           type: string
 *           description: Aside data title
 *           example: "Main Menu"
 *         type:
 *           type: string
 *           enum: [menu, member, notification, announcement, quick_links, sidebar]
 *           description: Type of aside data
 *           example: "menu"
 *         instituteId:
 *           type: string
 *           description: Associated institute ID
 *           example: "507f1f77bcf86cd799439011"
 *         content:
 *           type: object
 *           description: Aside data content (can be any structure)
 *           example:
 *             items:
 *               - label: "Dashboard"
 *                 icon: "home"
 *                 url: "/dashboard"
 *               - label: "Members"
 *                 icon: "users"
 *                 url: "/members"
 *         order:
 *           type: integer
 *           description: Display order for sorting
 *           example: 1
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether the aside data is active
 *           example: true
 *         metadata:
 *           type: object
 *           description: Additional metadata for the aside data
 *           example:
 *             lastUpdated: "2024-01-15T10:30:00Z"
 *             version: "1.0"
 *             permissions: ["admin", "teacher"]
 *     
 *     AsideDataResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AsideData'
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
 *   name: Aside Data
 *   description: Aside data management endpoints for menus, notifications, and sidebar content
 */

/**
 * @swagger
 * /asideDataRt/{type}:
 *   get:
 *     summary: Get aside data by type
 *     tags: [Aside Data]
 *     description: Retrieve aside data (menus, notifications, announcements, etc.) by type for an institute
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [menu, member, notification, announcement, quick_links, sidebar]
 *         description: Type of aside data to retrieve
 *         example: "menu"
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
 *         name: instituteId
 *         schema:
 *           type: string
 *         description: Filter by institute ID
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search aside data by title
 *     responses:
 *       200:
 *         description: Aside data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AsideDataResponse'
 *             examples:
 *               menuData:
 *                 summary: Menu aside data
 *                 value:
 *                   message: "Aside data retrieved successfully"
 *                   data:
 *                     - id: "507f1f77bcf86cd799439011"
 *                       title: "Main Menu"
 *                       type: "menu"
 *                       instituteId: "507f1f77bcf86cd799439012"
 *                       content:
 *                         items:
 *                           - label: "Dashboard"
 *                             icon: "home"
 *                             url: "/dashboard"
 *                           - label: "Members"
 *                             icon: "users"
 *                             url: "/members"
 *                           - label: "Institutes"
 *                             icon: "building"
 *                             url: "/institutes"
 *                       order: 1
 *                       isActive: true
 *               notificationData:
 *                 summary: Notification aside data
 *                 value:
 *                   message: "Aside data retrieved successfully"
 *                   data:
 *                     - id: "507f1f77bcf86cd799439013"
 *                       title: "System Notifications"
 *                       type: "notification"
 *                       instituteId: "507f1f77bcf86cd799439012"
 *                       content:
 *                         notifications:
 *                           - id: "1"
 *                             message: "New member registration"
 *                             type: "info"
 *                             timestamp: "2024-01-15T10:30:00Z"
 *                       order: 2
 *                       isActive: true
 *                   pagination:
 *                     currentPage: 1
 *                     totalPages: 1
 *                     totalItems: 2
 *                     hasNextPage: false
 *                     hasPrevPage: false
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Invalid aside data type"
 *               status: "error"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Aside data not found for the specified type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "No aside data found for type 'menu'"
 *               status: "error"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// GET aside data by type (menu, member, etc.)
router.get('/:type', asideDataCt.asideData);

module.exports = router;
