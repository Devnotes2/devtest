const express = require('express');
const authMiddleware = require('../Utilities/auth');

const router = express.Router();

// const SampleRt = require('./SampleRt');
// const regLoginRt = require('./regLoginRt');
// const asideDataRt = require('./asideDataRt');


router.use('/regLoginRt', require('./regLoginRt'));
router.use('/asideDataRt', require('./asideDataRt'));

// instituteData
router.use('/instituteDataRt', require('./instituteDataRt'));
router.use('/instituteAggreRt', require('./aggregation/locationTypesInInstituteRt'));
router.use('/instituteAggreRt', require('./aggregation/gradesRt'));
router.use('/instituteAggreRt', require('./aggregation/gradeSectionsRt'));

//  metaData
router.use('/generalDataRt', require('./generalDataRt'));


module.exports = router;
