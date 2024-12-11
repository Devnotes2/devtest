const express = require('express');
const router = express.Router();

const gradeBatchesCt = require('../../Controller/membersModule/membersDataCt');

router.get('/gradeBatchesInInstitute',membersDataCt.gradeBatchesInInstituteAg);
router.post('/gradeBatchesInInstitute',membersDataCt.createGradeBatchesInInstitute);
router.put('/gradeBatchesInInstitute',membersDataCt.updateGradeBatchesInInstitute);
router.delete('/gradeBatchesInInstitute',membersDataCt.deleteGradeBatchesInInstitute);

module.exports = router;