// membersDataRt.js (Route file)
const express = require('express');
const router = express.Router();
const membersDataCt = require('../../Controller/membersModule/membersDataCt');  // Controller for handling member data
const upload = require('../../Utilities/multerUtils');  // Import multer configuration

// POST route for adding member data with image upload
router.post('/member', upload, membersDataCt.createMember);  // Apply upload middleware before the controller
router.get('/member', membersDataCt.getMembersData);
router.put('/member', membersDataCt.updateMember);
router.delete('/member', membersDataCt.deleteMembers);
module.exports = router;
