const express = require('express');
const router = express.Router();
const gradeSectionBatchEnrollmentCt = require('../../Controller/enrollment/gradeSectionBatchEnrollmentCt');

router.get('/', gradeSectionBatchEnrollmentCt.getGradeSectionBatchEnrollments);
router.post('/', gradeSectionBatchEnrollmentCt.validateGradeSectionBatchEnrollment);
router.put('/', gradeSectionBatchEnrollmentCt.updateGradeSectionBatchEnrollment);
router.delete('/', gradeSectionBatchEnrollmentCt.deleteGradeSectionBatchEnrollment);

module.exports = router;
