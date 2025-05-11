const express = require('express');
const router = express.Router();

const gradeBatchesCt = require('../../../Controller/instituteData/aggregation/gradeBatchesCt');

router.get('/gradeBatchesInInstitute',gradeBatchesCt.gradeBatchesInInstituteAg);
router.post('/gradeBatchesInInstitute',gradeBatchesCt.createGradeBatchesInInstitute);
router.put('/gradeBatchesInInstitute',gradeBatchesCt.updateGradeBatchesInInstitute);
router.delete('/gradeBatchesInInstitute',gradeBatchesCt.deleteGradeBatchesInInstitute);

module.exports = router;