const express = require('express');
const router = express.Router();
const gradeSectionSubjectEnrollmentCt = require('../../Controller/enrollment/gradeSectionSubjectEnrollmentCt');

router.get('/', gradeSectionSubjectEnrollmentCt.getGradeSectionSubjectEnrollments);
router.post('/', gradeSectionSubjectEnrollmentCt.validateGradeSectionSubjectEnrollment);
router.put('/', gradeSectionSubjectEnrollmentCt.updateGradeSectionSubjectEnrollment);
router.delete('/', gradeSectionSubjectEnrollmentCt.deleteGradeSectionSubjectEnrollment);

module.exports = router;
