const express = require('express');
const router = express.Router();
const gradeBatchEnrollmentCt = require('../../Controller/enrollment/gradeBatchEnrollmentCt');

router.get('/', gradeBatchEnrollmentCt.getGradeBatchEnrollments);
router.post('/', gradeBatchEnrollmentCt.createGradeBatchEnrollment);
router.put('/', gradeBatchEnrollmentCt.updateGradeBatchEnrollment);
router.delete('/', gradeBatchEnrollmentCt.deleteGradeBatchEnrollment);

module.exports = router;
