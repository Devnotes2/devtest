const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const createGradeSectionsInInstituteModel = require('../../../Model/instituteData/aggregation/gradesectionsMd');
const { handleCRUD } = require('../../../Utilities/crudUtils');
const createGradeSectionBatchesInInstituteModel = require('../../../Model/instituteData/aggregation/gradeSectionBatchesMd');
const { createMembersDataModel } = require('../../../Model/membersModule/memberDataMd');
const { enhancedStandardizedGet, enhancedStandardizedPost, enhancedStandardizedPut, enhancedStandardizedDelete } = require('../../../Utilities/enhancedStandardizedApiUtils');
const { gradeSectionsInInstituteLookup } = require('../../../Utilities/aggregations/gradesSectionLookups');

// --- Grade Section DEPENDENTS CONFIG ---
const gradeSectionDependents = [
  { model: 'MembersData', field: 'gradeSectionId', name: 'MembersData' },
  { model: 'GradeSectionBatches', field: 'sectionId', name: 'gradeSectionBatches' }
  // Add more as needed
];

exports.gradeSectionsInInstituteAg = async (req, res) => {
  const options = {
    lookups: gradeSectionsInInstituteLookup(),
    joinedFieldMap: {
      institute: 'instituteDetails.instituteName',
      department: 'departmentDetails.departmentName',
      grade: 'gradeDetails.gradeName'
    },
    dropdownFields: ['_id', 'sectionName'],
    validationField: 'sectionName',
    defaultSort: { sectionName: 1 },
    projectFields: {
            _id: 1,
            instituteId: 1,
            departmentId: 1,
            gradeId: 1,
            sectionName: 1,
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

  await enhancedStandardizedGet(req, res, createGradeSectionsInInstituteModel, options);
};

exports.createGradeSectionsInInstitute = async (req, res) => {
  const options = {
    successMessage: 'Grade Section added successfully!',
    requiredFields: ['instituteId', 'departmentId', 'gradeId', 'sectionName'],
    uniqueFields: ['sectionName']
  };

  await enhancedStandardizedPost(req, res, createGradeSectionsInInstituteModel, options);
};

exports.updateGradeSectionsInInstitute = async (req, res) => {
  const options = {
    successMessage: 'Grade Section updated successfully',
    uniqueFields: ['sectionName']
  };

  await enhancedStandardizedPut(req, res, createGradeSectionsInInstituteModel, options);
};

// Delete Grade Section(s) with dependency options
exports.deleteGradeSectionsInInstitute = async (req, res) => {
  // Register all dependent models for the current connection
  createGradeSectionBatchesInInstituteModel(req.collegeDB);
  createMembersDataModel(req.collegeDB);

  const options = {
    successMessage: 'Grade Section(s) deleted successfully',
    dependencies: gradeSectionDependents,
    modelName: 'GradeSection'
  };

  await enhancedStandardizedDelete(req, res, createGradeSectionsInInstituteModel, options);
};