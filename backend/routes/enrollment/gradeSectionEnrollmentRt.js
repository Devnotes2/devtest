const express = require('express');
const router = express.Router();
const gradeSectionEnrollmentCt = require('../../Controller/enrollment/gradeSectionEnrollmentCt');

router.get('/', gradeSectionEnrollmentCt.getGradeSectionEnrollments);
router.post('/', gradeSectionEnrollmentCt.validateGradeSectionEnrollment);
router.put('/', gradeSectionEnrollmentCt.updateGradeSectionEnrollment);
router.delete('/', gradeSectionEnrollmentCt.deleteGradeSectionEnrollment);

module.exports = router;
