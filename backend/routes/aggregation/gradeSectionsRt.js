const express = require('express');
const router = express.Router();

const gradeSectionsCt = require('../../Controller/institueData/aggregation/gradeSectionsCt');
router.get('/gradeSectionsInInstitute',gradeSectionsCt.gradeSectionsInInstituteAg);
// router.get('/gradeSectionsInInstitute/:_id?',gradeSectionsCt.gradeSectionsInInstitute);

router.post('/gradeSectionsInInstitute',gradeSectionsCt.createGradeSectionsInInstitute);
router.put('/gradeSectionsInInstitute',gradeSectionsCt.updateGradeSectionsInInstitute);
router.delete('/gradeSectionsInInstitute',gradeSectionsCt.deleteGradeSectionsInInstitute);

module.exports = router;