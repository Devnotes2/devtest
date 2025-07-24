const express = require('express');
const router = express.Router();
const gradeEnrollmentCt = require('../../Controller/enrollment/gradeEnrollmentCt');

router.get('/', gradeEnrollmentCt.getGradeEnrollments);
router.post('/', gradeEnrollmentCt.createGradeEnrollment);
router.put('/', gradeEnrollmentCt.updateGradeEnrollment);
router.delete('/', gradeEnrollmentCt.deleteGradeEnrollment);

module.exports = router;
