const express = require('express');
const multiTenantMiddleware = require('../config/multiTenantMiddleware');

const router = express.Router();

// ============================================================================
// CORE DATA MANAGEMENT
// ============================================================================

// General metadata (blood groups, genders, member types, etc.)
router.use('/generalDataRt', multiTenantMiddleware, require('./generalData/generalDataRt'));

// Aside/sidebar data
router.use('/asideDataRt', multiTenantMiddleware, require('./asideData/asideDataRt'));

// ============================================================================
// INSTITUTE DATA MANAGEMENT
// ============================================================================

// Institute basic information
router.use('/instituteDataRt', multiTenantMiddleware, require('./instituteData/institutesRt'));

// Academic year management
router.use('/instituteDataRt', multiTenantMiddleware, require('./instituteData/academicYearRt'));

// Department management
router.use('/instituteDataRt', multiTenantMiddleware, require('./instituteData/departmentRt'));

// ============================================================================
// INSTITUTE AGGREGATION & RELATIONSHIPS
// ============================================================================

// Location types within institute
router.use('/instituteAggreRt', multiTenantMiddleware, require('./instituteData/aggregation/locationTypesInInstituteRt'));

// Grade management
router.use('/instituteAggreRt', multiTenantMiddleware, require('./instituteData/aggregation/gradesRt'));

// Grade sections
router.use('/instituteAggreRt', multiTenantMiddleware, require('./instituteData/aggregation/gradeSectionsRt'));

// Grade batches
router.use('/instituteAggreRt', multiTenantMiddleware, require('./instituteData/aggregation/gradeBatchesRt'));

// Grade section batches
router.use('/instituteAggreRt', multiTenantMiddleware, require('./instituteData/aggregation/gradeSectionBatchesRt'));

// Subject management
router.use('/instituteAggreRt', multiTenantMiddleware, require('./instituteData/aggregation/subjectsRt'));

// Enrollment management
router.use('/enrollmentsRt', multiTenantMiddleware, require('./enrollments/enrollmentsRt'));

// ============================================================================
// MEMBER MANAGEMENT
// ============================================================================

// Member data (CRUD operations)
router.use('/membersDataRt', multiTenantMiddleware, require('./membersModule/memberDataRt'));

// ============================================================================

// ============================================================================
// UTILITY SERVICES
// ============================================================================

router.use('/auth', multiTenantMiddleware, require('./authentication/authRt'));

// S3 file upload/download services
router.use('/s3', require('./s3Module/s3Rt'));

// ============================================================================

module.exports = router;
