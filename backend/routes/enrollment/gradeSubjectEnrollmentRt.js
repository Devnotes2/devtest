const express = require('express');
const router = express.Router();
const gradeSubjectEnrollmentCt = require('../../Controller/enrollment/gradeSubjectEnrollmentCt');

router.get('/', gradeSubjectEnrollmentCt.getGradeSubjectEnrollments);
router.post('/', gradeSubjectEnrollmentCt.validateGradeSubjectEnrollment);
router.put('/', gradeSubjectEnrollmentCt.updateGradeSubjectEnrollment);
router.delete('/', gradeSubjectEnrollmentCt.deleteGradeSubjectEnrollment);

module.exports = router;
