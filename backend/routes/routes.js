const express = require('express');
const authMiddleware = require('../Utilities/authUtils');

const router = express.Router();

// authentication 
router.use('/regLoginRt', require('./authentication/regLoginRt'));
router.use('/asideDataRt', require('./asideData/asideDataRt'));

// instituteData
router.use('/instituteDataRt', require('./instituteData/institutesRt'));
router.use('/instituteDataRt', require('./instituteData/academicYearRt'));
router.use('/instituteDataRt', require('./instituteData/departmentRt'));

// institution aggregation
router.use('/instituteAggreRt', require('./instituteData/aggregation/locationTypesInInstituteRt'));
router.use('/instituteAggreRt', require('./instituteData/aggregation/gradesRt'));
router.use('/instituteAggreRt', require('./instituteData/aggregation/gradeSectionsRt'));
router.use('/instituteAggreRt', require('./instituteData/aggregation/gradeBatchesRt'));
router.use('/instituteAggreRt', require('./instituteData/aggregation/gradeSectionBatchesRt'));
router.use('/instituteAggreRt', require('./instituteData/aggregation/subjectsRt'));

//  metaData
router.use('/generalDataRt', require('./generalData/generalDataRt'));

// member Module
router.use('/membersDataRt', require('./membersModule/memberDataRt'));

// member enrollment
router.use('/memberEnrollmentRt/gradeEnrollment', require('./enrollment/gradeEnrollmentRt'));
router.use('/memberEnrollmentRt/gradeSectionEnrollment', require('./enrollment/gradeSectionEnrollmentRt'));
router.use('/memberEnrollmentRt/gradeBatchEnrollment', require('./enrollment/gradeBatchEnrollmentRt'));
router.use('/memberEnrollmentRt/gradeSectionBatchEnrollment', require('./enrollment/gradeSectionBatchEnrollmentRt'));
router.use('/memberEnrollmentRt/gradeSubjectEnrollment', require('./enrollment/gradeSubjectEnrollmentRt'));
router.use('/memberEnrollmentRt/gradeSectionSubjectEnrollment', require('./enrollment/gradeSectionSubjectEnrollmentRt'));
router.use('/memberEnrollmentRt/gradeBatchSubjectEnrollment', require('./enrollment/gradeBatchSubjectEnrollmentRt'));
router.use('/memberEnrollmentRt/gradeSectionBatchSubjectEnrollment', require('./enrollment/gradeSectionBatchSubjectEnrollmentRt'));

module.exports = router;
