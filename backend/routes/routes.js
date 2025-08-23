const express = require('express');
const authMiddleware = require('../Utilities/authUtils');

const router = express.Router();

// ============================================================================
// AUTHENTICATION & TENANT MANAGEMENT
// ============================================================================

// User authentication (login, logout, etc.)
router.use('/authRt', require('./authentication/authRt'));

// Tenant/Institute mapping and configuration
router.use('/tenantRt', require('./authentication/tenantRt'));

// ============================================================================
// CORE DATA MANAGEMENT
// ============================================================================

// General metadata (blood groups, genders, member types, etc.)
router.use('/generalDataRt', require('./generalData/generalDataRt'));

// Aside/sidebar data
router.use('/asideDataRt', require('./asideData/asideDataRt'));

// ============================================================================
// INSTITUTE DATA MANAGEMENT
// ============================================================================

// Institute basic information
router.use('/instituteDataRt', require('./instituteData/institutesRt'));

// Academic year management
router.use('/instituteDataRt', require('./instituteData/academicYearRt'));

// Department management
router.use('/instituteDataRt', require('./instituteData/departmentRt'));

// ============================================================================
// INSTITUTE AGGREGATION & RELATIONSHIPS
// ============================================================================

// Location types within institute
router.use('/instituteAggreRt', require('./instituteData/aggregation/locationTypesInInstituteRt'));

// Grade management
router.use('/instituteAggreRt', require('./instituteData/aggregation/gradesRt'));

// Grade sections
router.use('/instituteAggreRt', require('./instituteData/aggregation/gradeSectionsRt'));

// Grade batches
router.use('/instituteAggreRt', require('./instituteData/aggregation/gradeBatchesRt'));

// Grade section batches
router.use('/instituteAggreRt', require('./instituteData/aggregation/gradeSectionBatchesRt'));

// Subject management
router.use('/instituteAggreRt', require('./instituteData/aggregation/subjectsRt'));

// ============================================================================
// MEMBER MANAGEMENT
// ============================================================================

// Member data (CRUD operations)
router.use('/membersDataRt', require('./membersModule/memberDataRt'));

// ============================================================================
// ENROLLMENT MANAGEMENT
// ============================================================================

// Grade enrollment
router.use('/memberEnrollmentRt/gradeEnrollment', require('./enrollment/gradeEnrollmentRt'));

// Grade section enrollment
router.use('/memberEnrollmentRt/gradeSectionEnrollment', require('./enrollment/gradeSectionEnrollmentRt'));

// Grade batch enrollment
router.use('/memberEnrollmentRt/gradeBatchEnrollment', require('./enrollment/gradeBatchEnrollmentRt'));

// Grade section batch enrollment
router.use('/memberEnrollmentRt/gradeSectionBatchEnrollment', require('./enrollment/gradeSectionBatchEnrollmentRt'));

// Grade subject enrollment
router.use('/memberEnrollmentRt/gradeSubjectEnrollment', require('./enrollment/gradeSubjectEnrollmentRt'));

// Grade section subject enrollment
router.use('/memberEnrollmentRt/gradeSectionSubjectEnrollment', require('./enrollment/gradeSectionSubjectEnrollmentRt'));

// Grade batch subject enrollment
router.use('/memberEnrollmentRt/gradeBatchSubjectEnrollment', require('./enrollment/gradeBatchSubjectEnrollmentRt'));

// Grade section batch subject enrollment
router.use('/memberEnrollmentRt/gradeSectionBatchSubjectEnrollment', require('./enrollment/gradeSectionBatchSubjectEnrollmentRt'));

// ============================================================================
// UTILITY SERVICES
// ============================================================================

// S3 file upload/download services
router.use('/s3', require('./s3Module/s3Rt'));

module.exports = router;
