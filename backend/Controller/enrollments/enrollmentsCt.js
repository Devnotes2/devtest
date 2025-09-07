const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const createEnrollmentsInInstituteModel = require('../../Model/enrollments/enrollmentsMd');
const { enhancedStandardizedGet, enhancedStandardizedPost, enhancedStandardizedPut, enhancedStandardizedDelete } = require('../../Utilities/enhancedStandardizedApiUtils');
const { getApiConfig } = require('../../Utilities/apiConfig');
const { instituteLookup } = require('../../Utilities/aggregations/instituteDataLookups');
const { departmentLookup } = require('../../Utilities/aggregations/departmentLookups');
const { gradesLookup } = require('../../Utilities/aggregations/gradesLookups');
const { gradeBatchesLookup } = require('../../Utilities/aggregations/gradesBatchesLookups');
const { gradeSectionLookup } = require('../../Utilities/aggregations/gradesSectionLookups');
const { gradeSectionBatchesLookup } = require('../../Utilities/aggregations/gradesSectionBatchesLookups');
const { enrollmentsSubjectsLookup, enrollmentsMemberLookup, enrollmentsAcademicYearLookup } = require('../../Utilities/aggregations/enrollments/enrollmentsLookups');
const { generalDataLookup } = require('../../Utilities/aggregations/generalDataLookups');

// --- ENROLLMENTS DEPENDENTS CONFIG ---
const enrollmentsDependents = [
  // Add dependents as needed - currently no direct dependencies
];

// GET Enrollments
exports.getEnrollments = async (req, res) => {
  const apiConfig = getApiConfig('enrollments');
  
  const options = {
    ...apiConfig,
    lookups: [
        ...instituteLookup(),
        ...departmentLookup(),
        ...gradesLookup(),
        ...gradeBatchesLookup(),
        ...gradeSectionLookup(),
        ...gradeSectionBatchesLookup(),
        ...enrollmentsSubjectsLookup(),
      ...enrollmentsMemberLookup(),
        ...enrollmentsAcademicYearLookup(),
        ...generalDataLookup('memberType', 'memberType', 'memberTypeDetails', 'memberTypeValue')
    ],
    joinedFieldMap: {
      institute: 'instituteDetails.instituteName',
      department: 'departmentDetails.departmentName',
      grade: 'gradeDetails.gradeCode',
      batch: 'gradeBatchDetails.batchName',
      section: 'gradeSectionDetails.sectionName',
      gradeSectionBatch: 'gradeSectionBatchDetails.sectionBatchName',
      memberType: 'memberTypeDetails.memberTypeValue'
    },
    dropdownFields: ['_id', 'memberId', 'enrollmentDate', 'status'],
    validationField: 'memberId',
    defaultSort: { enrollmentDate: -1 },
    projectFields: {
          memberId: 1,
      memberType: '$memberTypeDetails.memberTypeValue',
          instituteName: '$instituteDetails.instituteName',
          departmentName: '$departmentDetails.departmentName',
      gradeCode: '$gradeDetails.gradeCode',
      batchName: '$gradeBatchDetails.batchName',
          sectionName: '$gradeSectionDetails.sectionName',
          sectionBatchName: '$gradeSectionBatchDetails.sectionBatchName',
          enrollmentDate: 1,
          status: 1,
          createdAt: 1,
      updatedAt: 1
    }
  };

  await enhancedStandardizedGet(req, res, createEnrollmentsInInstituteModel, options);
};

// POST Enrollments
exports.createEnrollment = async (req, res) => {
  const apiConfig = getApiConfig('enrollments');
  
  const options = {
    ...apiConfig,
    successMessage: 'Enrollment created successfully',
    requiredFields: ['memberId', 'instituteId', 'departmentId', 'gradeId', 'enrollmentDate'],
    uniqueFields: [
      {
        fields: ['memberId', 'instituteId', 'academicYearId'],
        message: 'Member already enrolled in this institute for this academic year'
      }
    ]
  };

  await enhancedStandardizedPost(req, res, createEnrollmentsInInstituteModel, options);
};

// PUT Enrollments
exports.updateEnrollment = async (req, res) => {
  const apiConfig = getApiConfig('enrollments');
  
  const options = {
    ...apiConfig,
    successMessage: 'Enrollment updated successfully',
    uniqueFields: [
      {
        fields: ['memberId', 'instituteId', 'academicYearId'],
        message: 'Member already enrolled in this institute for this academic year'
      }
    ]
  };

  await enhancedStandardizedPut(req, res, createEnrollmentsInInstituteModel, options);
};

// DELETE Enrollments
exports.deleteEnrollment = async (req, res) => {
  const apiConfig = getApiConfig('enrollments');
  
  const options = {
    ...apiConfig,
    successMessage: 'Enrollment deleted successfully',
    dependencies: enrollmentsDependents,
    modelName: 'Enrollment'
  };

  await enhancedStandardizedDelete(req, res, createEnrollmentsInInstituteModel, options);
};

module.exports = {
  getEnrollments: exports.getEnrollments,
  createEnrollment: exports.createEnrollment,
  updateEnrollment: exports.updateEnrollment,
  deleteEnrollment: exports.deleteEnrollment
};