const express = require('express');
const router = express.Router();

const gradeSectionBatchesCt = require('../../Controller/institueData/aggregation/gradeSectionBatchesCt');

router.get('/gradeSectionBatchesInInstitute',gradeSectionBatchesCt.gradeSectionBatchesInInstituteAg);
router.post('/gradeSectionBatchesInInstitute',gradeSectionBatchesCt.createGradeSectionBatchesInInstitute);
router.put('/gradeSectionBatchesInInstitute',gradeSectionBatchesCt.updateGradeSectionBatchesInInstitute);
router.delete('/gradeSectionBatchesInInstitute',gradeSectionBatchesCt.deleteGradeSectionBatchesInInstitute);

module.exports = router;