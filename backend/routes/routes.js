const express = require('express');
const authMiddleware = require('../Utilities/authUtils');

const router = express.Router();

// authentication 
router.use('/regLoginRt', require('./authentication/regLoginRt'));
router.use('/asideDataRt', require('./asideData/asideDataRt'));

// instituteData
router.use('/instituteDataRt', require('./instituteData/institutesRt'));
router.use('/instituteDataRt', require('./instituteData/academicYearRt'));

// institution aggregation
router.use('/instituteAggreRt', require('./instituteData/aggregation/locationTypesInInstituteRt'));
router.use('/instituteAggreRt', require('./instituteData/aggregation/gradesRt'));
router.use('/instituteAggreRt', require('./instituteData/aggregation/gradeSectionsRt'));
router.use('/instituteAggreRt', require('./instituteData/aggregation/gradeBatchesRt'));
router.use('/instituteAggreRt', require('./instituteData/aggregation/gradeSectionBatchesRt'));
router.use('/instituteAggreRt', require('./instituteData/aggregation/subjectsRt'));

//  metaData
router.use('/generalDataRt', require('./generalData/generalDataRt'));

// members Module
router.use('/membersDataRt', require('./membersModule/membersDataRt'));

module.exports = router;
