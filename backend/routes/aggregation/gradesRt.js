const express = require('express');
const router = express.Router();

const gradesCt = require('../../Controller/institueData/aggregation/gradesCt');
router.get('/gradesInInstitute',gradesCt.gradesInInstituteAg);
// router.get('/gradesInInstitute/:_id?',gradesCt.gradesInInstitute);

router.post('/gradesInInstitute',gradesCt.createGradesInInstitute);
router.put('/gradesInInstitute',gradesCt.updateGradesInInstitute);
router.delete('/gradesInInstitute',gradesCt.deleteGradesInInstitute);

module.exports = router;