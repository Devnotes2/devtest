// membersDataRt.js (Route file)
const express = require('express');
const router = express.Router();
const memberDataCt = require('../../Controller/membersModule/memberDataCt');  // Controller for handling member data
const upload = require('../../Utilities/multerUtils');  // Import multer configuration

// POST route for adding member data with image upload
router.post('/member', upload, memberDataCt.createMember);  // Apply upload middleware before the controller
router.get('/member', memberDataCt.getMembersData);
router.put('/member', memberDataCt.updateMember);
router.delete('/member', memberDataCt.deleteMembers);
module.exports = router;
