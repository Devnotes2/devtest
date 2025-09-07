const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const createGradeBatchesInInstituteModel = require('../../../Model/instituteData/aggregation/gradeBatchesMd');
const { handleCRUD } = require('../../../Utilities/crudUtils');
const { createMembersDataModel } = require('../../../Model/membersModule/memberDataMd');
const { enhancedStandardizedGet, enhancedStandardizedPost, enhancedStandardizedPut, enhancedStandardizedDelete } = require('../../../Utilities/enhancedStandardizedApiUtils');
const { gradeBatchesInInstituteLookup } = require('../../../Utilities/aggregations/gradesBatchesLookups');

// --- Grade Batch DEPENDENTS CONFIG ---
const gradeBatchDependents = [
  { model: 'MembersData', field: 'gradeBatchId', name: 'MembersData' },
  // Add more as needed
];

exports.gradeBatchesInInstituteAg = async (req, res) => {
  const options = {
    lookups: gradeBatchesInInstituteLookup(),
    joinedFieldMap: {
      institute: 'instituteDetails.instituteName',
      department: 'departmentDetails.departmentName',
      grade: 'gradeDetails.gradeName'
    },
    dropdownFields: ['_id', 'batchName'],
    validationField: 'batchName',
    defaultSort: { batchName: 1 },
    projectFields: {
            _id: 1,
            instituteId: 1,
            departmentId: 1,
            gradeId: 1,
            batchName: 1,
            description: 1,
            archive: 1,
            createdAt: 1,
            updatedAt: 1,
            // Add lookup data with clear naming
            instituteName: '$instituteDetails.instituteName',
            departmentName: '$departmentDetails.departmentName',
            gradeName: '$gradeDetails.gradeName',
            gradeCode: '$gradeDetails.gradeCode'
          }
  };

  await enhancedStandardizedGet(req, res, createGradeBatchesInInstituteModel, options);
};

exports.createGradeBatchesInInstitute = async (req, res) => {
  const options = {
    successMessage: 'Grade batch created successfully',
    requiredFields: ['instituteId', 'departmentId', 'gradeId', 'batchName'],
    uniqueFields: [
      {
        fields: ['gradeId', 'departmentId', 'batchName'],
        message: 'Batch already exists for this grade and department'
      }
    ]
  };

  await enhancedStandardizedPost(req, res, createGradeBatchesInInstituteModel, options);
};

exports.updateGradeBatchesInInstitute = async (req, res) => {
  const options = {
    successMessage: 'Grade batch updated successfully',
    uniqueFields: [
      {
        fields: ['gradeId', 'departmentId', 'batchName'],
        message: 'Batch already exists for this grade and department'
      }
    ]
  };

  await enhancedStandardizedPut(req, res, createGradeBatchesInInstituteModel, options);
};

exports.deleteGradeBatchesInInstitute = async (req, res) => {
  const options = {
    successMessage: 'Grade batch deleted successfully',
    dependencies: gradeBatchDependents,
    modelName: 'GradeBatches'
  };

  await enhancedStandardizedDelete(req, res, createGradeBatchesInInstituteModel, options);
};