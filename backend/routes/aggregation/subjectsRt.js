const express = require('express');
const router = express.Router();

const subjectsCt = require('../../Controller/institueData/aggregation/subjectsCt');

router.get('/subjectsInInstitute',subjectsCt.subjectsInInstituteAg);
router.post('/subjectsInInstitute',subjectsCt.createSubjectsInInstitute);
router.put('/subjectsInInstitute',subjectsCt.updateSubjectsInInstitute);
router.delete('/subjectsInInstitute',subjectsCt.deleteSubjectsInInstitute);

module.exports = router;