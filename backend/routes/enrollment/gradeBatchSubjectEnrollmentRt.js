const express = require('express');
const router = express.Router();
const gradeBatchSubjectEnrollmentCt = require('../../Controller/enrollment/gradeBatchSubjectEnrollmentCt');

router.get('/', gradeBatchSubjectEnrollmentCt.getGradeBatchSubjectEnrollments);
router.post('/', gradeBatchSubjectEnrollmentCt.validateGradeBatchSubjectEnrollment);
router.put('/', gradeBatchSubjectEnrollmentCt.updateGradeBatchSubjectEnrollment);
router.delete('/', gradeBatchSubjectEnrollmentCt.deleteGradeBatchSubjectEnrollment);

module.exports = router;
