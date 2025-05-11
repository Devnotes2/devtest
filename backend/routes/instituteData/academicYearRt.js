const express = require('express');
const router = express.Router();

const academicYearCt = require('../../Controller/instituteData/academicYearCt');

router.get('/academicYear/:id?', academicYearCt.getAcademicYears);
router.post('/academicYear', academicYearCt.insertAcademicYear);
router.put('/academicYear', academicYearCt.updateAcademicYear);
router.delete('/academicYear', academicYearCt.deleteAcademicYear);


module.exports = router;
