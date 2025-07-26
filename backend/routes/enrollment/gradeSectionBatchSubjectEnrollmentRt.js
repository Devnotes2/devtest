const express = require('express');
const router = express.Router();
const gradeSectionBatchSubjectEnrollmentCt = require('../../Controller/enrollment/gradeSectionBatchSubjectEnrollmentCt');

router.get('/', gradeSectionBatchSubjectEnrollmentCt.getGradeSectionBatchSubjectEnrollments);
router.post('/', gradeSectionBatchSubjectEnrollmentCt.exports.validateGradeSectionBatchSubjectEnrollment);
router.put('/', gradeSectionBatchSubjectEnrollmentCt.updateGradeSectionBatchSubjectEnrollment);
router.delete('/', gradeSectionBatchSubjectEnrollmentCt.deleteGradeSectionBatchSubjectEnrollment);

module.exports = router;
