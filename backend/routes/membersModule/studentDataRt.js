// membersDataRt.js (Route file)
const express = require('express');
const router = express.Router();
const studentDataCt = require('../../Controller/membersModule/studentDataCt');  // Controller for handling member data
const upload = require('../../Utilities/multerUtils');  // Import multer configuration

// POST route for adding member data with image upload
router.post('/member', upload, studentDataCt.createStudent);  // Apply upload middleware before the controller
router.get('/member', studentDataCt.getStudentsData);
router.put('/member', studentDataCt.updateStudent);
router.delete('/member', studentDataCt.deleteStudents);
module.exports = router;
