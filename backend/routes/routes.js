const express = require('express');
const authMiddleware = require('../Utilities/auth');

const router = express.Router();

// const SampleRt = require('./SampleRt');
// const regLoginRt = require('./regLoginRt');
// const asideDataRt = require('./asideDataRt');


router.use('/regLoginRt', require('./authentication/regLoginRt'));
router.use('/asideDataRt', require('./asideData/asideDataRt'));

// instituteData
router.use('/instituteDataRt', require('./instituteData/instituteDataRt'));
router.use('/instituteAggreRt', require('./aggregation/locationTypesInInstituteRt'));
router.use('/instituteAggreRt', require('./aggregation/gradesRt'));
router.use('/instituteAggreRt', require('./aggregation/gradeSectionsRt'));
router.use('/instituteAggreRt', require('./aggregation/gradeBatchesRt'));
router.use('/instituteAggreRt', require('./aggregation/gradeSectionBatchesRt'));
router.use('/instituteAggreRt', require('./aggregation/subjectsRt'));

//  metaData
router.use('/generalDataRt', require('./generalData/generalDataRt'));

// members Module
router.use('/membersDataRt', require('./membersModule/membersDataRt'));

module.exports = router;
