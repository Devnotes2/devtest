const express = require('express');
const router = express.Router();
const asideDataCt = require('../../Controller/asideData/asideDataCt'); // Assuming your model is in models/AsideData.js

/**
 * @swagger
 * components:
 *   schemas:
 *     # ============================================================================
 *     # ASIDE DATA MANAGEMENT SCHEMAS
 *     # ============================================================================
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

 *         type:
 *           type: string
 *           enum: [menu, member, notification, announcement, quick_links, sidebar]
 *           description: Type of aside data

 *         instituteId:
 *           type: string
 *           description: Associated institute ID

 *         content:
 *           type: object
 *           description: Aside data content (can be any structure)

 *         order:
 *           type: integer
 *           description: Display order for sorting

 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether the aside data is active

 *         metadata:
 *           type: object
 *           description: Additional metadata for the aside data

 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp

 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
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
 *     description: Retrieve aside data (menus, notifications, announcements, etc.) by type for an institute with enhanced filtering and pagination
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
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *         example: 10
 *       - in: query
 *         name: ids
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             pattern: '^[0-9a-fA-F]{24}$'
 *         style: form
 *         explode: false
 *         description: Array of specific IDs to retrieve (comma-separated)
 *         example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *       - in: query
 *         name: dropdown
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Return simplified data with only _id and title fields for dropdowns
 *         example: true
 *       - in: query
 *         name: aggregate
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Include related data in response
 *         example: true
 *       - in: query
 *         name: sortField
 *         schema:
 *           type: string
 *         description: Field to sort by
 *         example: "order"
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order (asc or desc)
 *         example: "asc"
 *       - in: query
 *         name: filterField
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: false
 *         description: Field(s) to filter by
 *         example: ["isActive", "instituteId"]
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
 *         example: ["equals", "equals"]
 *       - in: query
 *         name: value
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: false
 *         description: Filter value(s) corresponding to filterField(s)
 *         example: ["true", "507f1f77bcf86cd799439012"]
 *       - in: query
 *         name: validate
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Validate filter fields against schema
 *         example: true
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
 *                     $ref: '#/components/schemas/AsideData'
 *                 count:
 *                   type: integer
 *                   example: 2
 *                 filteredDocs:
 *                   type: integer
 *                   example: 2
 *                 totalDocs:
 *                   type: integer
 *                   example: 5
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
 *               menuData:
 *                 summary: Menu aside data
 *                 value:
 *                   success: true
 *                   message: "Operation completed successfully"
 *                   data:
 *                     - _id: "507f1f77bcf86cd799439011"
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
 *                       order: 1
 *                       isActive: true
 *                       createdAt: "2024-01-15T10:30:00.000Z"
 *                       updatedAt: "2024-01-15T10:30:00.000Z"
 *                   count: 1
 *                   filteredDocs: 1
 *                   totalDocs: 3
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
 *                         example: "type"
 *                       message:
 *                         type: string
 *                         example: "Invalid type value"
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

// GET aside data by type (menu, member, etc.)
router.get('/:type', asideDataCt.asideData);

module.exports = router;
