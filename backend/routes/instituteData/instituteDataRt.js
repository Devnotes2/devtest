const express = require('express');
const router = express.Router();

const academicYearCt = require('../Controller/institueData/academicYearCt');

router.get('/academicYear/:id?', academicYearCt.getAcademicYears);
router.post('/academicYear', academicYearCt.insertAcademicYear);
router.put('/academicYear', academicYearCt.updateAcademicYear);
router.delete('/academicYear', academicYearCt.deleteAcademicYear);

const institutesCt = require('../Controller/institueData/institutesCt');

router.get('/institutes/:instituteID?', institutesCt.getInstitutes);
router.post('/institutes', institutesCt.insertInstitute);
router.put('/institutes', institutesCt.updateInstitute);
router.delete('/institutes', institutesCt.deleteInstitutes);

const departmentCt = require('../Controller/institueData/departmentCt');

// router.get('/institutes/:instituteID?', departmentCt.getDepartments);
// router.post('/institutes', departmentCt.insertDepartment);
// router.put('/institutes', departmentCt.updateDepartment);
// router.delete('/institutes', departmentCt.deleteDepartment);

module.exports = router;
