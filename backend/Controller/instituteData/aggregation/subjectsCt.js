const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const createSubjectsInInstituteModel = require('../../../Model/instituteData/aggregation/subjectsMd.js');
const { handleCRUD } = require('../../../Utilities/crudUtils.js');
const { buildMatchConditions, buildSortObject } = require('../../../Utilities/filterSortUtils');
const { createMembersDataModel } = require('../../../Model/membersModule/memberDataMd');
const { enhancedStandardizedGet, enhancedStandardizedPost, enhancedStandardizedPut, enhancedStandardizedDelete } = require('../../../Utilities/enhancedStandardizedApiUtils');
const buildGenericAggregation = require('../../../Utilities/genericAggregatorUtils');
const addPaginationAndSort = require('../../../Utilities/paginationControllsUtils');
const { subjectsInInstituteLookup } = require('../../../Utilities/aggregations/subjectsLookups');

// --- Subject DEPENDENTS CONFIG ---
const subjectDependents = [
  { model: 'MembersData', field: 'gradeSubjectId', name: 'MembersData' },
  { model: 'MembersData', field: 'gradeBatchSubjectId', name: 'MembersData' },
  { model: 'MembersData', field: 'gradeSectionSubjectId', name: 'MembersData' },
  { model: 'MembersData', field: 'gradeSectionBatchSubjectId', name: 'MembersData' }
  // Add more as needed
];

exports.subjectsInInstituteAg = async (req, res) => {
  const options = {
    lookups: subjectsInInstituteLookup(),
    joinedFieldMap: {
      institute: 'instituteDetails.instituteName',
      department: 'departmentDetails.departmentName',
      learningType: 'learningTypeDetails.learningTypeValue',
      subjectType: 'subjectTypeDetails.subjectTypeValue',
      grade: 'gradeDetails.gradeDescription'
    },
    dropdownFields: ['_id', 'subject'],
    validationField: 'subject',
    defaultSort: { subject: 1 },
    projectFields: {
      _id: 1,
            subject: 1,
            subjectCode: 1,
            description: 1,
      instituteId: 1,
      departmentId: 1,
      gradeId: 1,
      learningTypeId: 1,
      subjectTypeId: 1,
      archive: 1,
      createdAt: 1,
      updatedAt: 1,
      // Add lookup data with clear naming
            instituteName: '$instituteDetails.instituteName',
            departmentName: '$departmentDetails.departmentName',
            learningType: '$learningTypeDetails.learningTypeValue',
            subjectType: '$subjectTypeDetails.subjectTypeValue',
            gradeDescription: '$gradeDetails.gradeDescription'
          }
  };

  await enhancedStandardizedGet(req, res, createSubjectsInInstituteModel, options);
};

// Create Subject (POST)
exports.createSubjectsInInstitute = async (req, res) => {
  const options = {
    successMessage: 'Subject added successfully!',
    requiredFields: ['subject', 'instituteId', 'departmentId', 'gradeId'],
    uniqueFields: ['subject']
  };

  await enhancedStandardizedPost(req, res, createSubjectsInInstituteModel, options);
};

// Update Subject (PUT)
exports.updateSubjectsInInstitute = async (req, res) => {
  const options = {
    successMessage: 'Subject updated successfully',
    uniqueFields: ['subject']
  };

  await enhancedStandardizedPut(req, res, createSubjectsInInstituteModel, options);
};

// Delete Subject(s) with dependency options
exports.deleteSubjectsInInstitute = async (req, res) => {
  // Register all dependent models for the current connection
  createMembersDataModel(req.collegeDB);

  const options = {
    successMessage: 'Subject(s) deleted successfully',
    dependencies: subjectDependents,
    modelName: 'Subject'
  };

  await enhancedStandardizedDelete(req, res, createSubjectsInInstituteModel, options);
};
