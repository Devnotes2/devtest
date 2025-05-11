// membersDataRt.js (Route file)
const express = require('express');
const router = express.Router();
const membersDataCt = require('../../Controller/membersModule/membersDataCt');  // Controller for handling member data
const upload = require('../../Utilities/multerUtils');  // Import multer configuration

// POST route for adding member data with image upload
router.post('/member', upload, membersDataCt.createMembersData);  // Apply upload middleware before the controller

module.exports = router;
