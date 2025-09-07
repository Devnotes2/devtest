const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const createGradeSectionBatchesInInstituteModel = require('../../../Model/instituteData/aggregation/gradeSectionBatchesMd');
const { handleCRUD } = require('../../../Utilities/crudUtils');
const { createMembersDataModel } = require('../../../Model/membersModule/memberDataMd');
const { enhancedStandardizedGet, enhancedStandardizedPost, enhancedStandardizedPut, enhancedStandardizedDelete } = require('../../../Utilities/enhancedStandardizedApiUtils');
const { gradeSectionBatchesInInstituteLookup } = require('../../../Utilities/aggregations/gradeSectionBatchesLookups');

// --- Grade Section Batch DEPENDENTS CONFIG ---
const gradeSectionBatchDependents = [
  { model: 'MembersData', field: 'gradeSectionBatchId', name: 'MembersData' },
  // Add more as needed
];

exports.gradeSectionBatchesInInstituteAg = async (req, res) => {
  const options = {
    lookups: gradeSectionBatchesInInstituteLookup(),
    joinedFieldMap: {
      institute: 'instituteDetails.instituteName',
      department: 'departmentDetails.departmentName',
      grade: 'gradeDetails.gradeName',
      section: 'sectionDetails.sectionName'
    },
    dropdownFields: ['_id', 'sectionBatchName'],
    validationField: 'sectionBatchName',
    defaultSort: { sectionBatchName: 1 },
    projectFields: {
            _id: 1,
            instituteId: 1,
            departmentId: 1,
            gradeId: 1,
            sectionId: 1,
            sectionBatchName: 1,
            description: 1,
            archive: 1,
            createdAt: 1,
            updatedAt: 1,
            // Add lookup data with clear naming
            instituteName: '$instituteDetails.instituteName',
            departmentName: '$departmentDetails.departmentName',
            gradeName: '$gradeDetails.gradeName',
            gradeCode: '$gradeDetails.gradeCode',
            sectionName: '$sectionDetails.sectionName'
          }
  };

  await enhancedStandardizedGet(req, res, createGradeSectionBatchesInInstituteModel, options);
};

exports.createGradeSectionBatchesInInstitute = async (req, res) => {
  const options = {
    successMessage: 'Grade section batch created successfully',
    requiredFields: ['instituteId', 'departmentId', 'gradeId', 'sectionId', 'sectionBatchName'],
    uniqueFields: [
      {
        fields: ['gradeId', 'sectionId', 'sectionBatchName'],
        message: 'Section batch already exists for this grade and section'
      }
    ]
  };

  await enhancedStandardizedPost(req, res, createGradeSectionBatchesInInstituteModel, options);
};

exports.updateGradeSectionBatchesInInstitute = async (req, res) => {
  const options = {
    successMessage: 'Grade section batch updated successfully',
    uniqueFields: [
      {
        fields: ['gradeId', 'sectionId', 'sectionBatchName'],
        message: 'Section batch already exists for this grade and section'
      }
    ]
  };

  await enhancedStandardizedPut(req, res, createGradeSectionBatchesInInstituteModel, options);
};

exports.deleteGradeSectionBatchesInInstitute = async (req, res) => {
  const options = {
    successMessage: 'Grade section batch deleted successfully',
    dependencies: gradeSectionBatchDependents,
    modelName: 'GradeSectionBatches'
  };

  await enhancedStandardizedDelete(req, res, createGradeSectionBatchesInInstituteModel, options);
};