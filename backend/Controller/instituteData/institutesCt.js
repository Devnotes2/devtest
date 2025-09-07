const createInstitutesModel = require('../../Model/instituteData/institutesMd');
const { ObjectId } = require('mongoose').Types;
const createDepartmentDataModel = require('../../Model/instituteData/departmentMd');
const createGradesInInstituteModel = require('../../Model/instituteData/aggregation/gradesMd');
const createSubjectsInInstituteModel = require('../../Model/instituteData/aggregation/subjectsMd');
const createLocationTypesInInstituteModel = require('../../Model/instituteData/aggregation/locationTypesInInstituteMd');
const createGradeBatchesInInstituteModel = require('../../Model/instituteData/aggregation/gradeBatchesMd');
const createGradeSectionsInInstituteModel = require('../../Model/instituteData/aggregation/gradesectionsMd');
const createGradeSectionBatchesInInstituteModel = require('../../Model/instituteData/aggregation/gradeSectionBatchesMd');
const { createMembersDataModel } = require('../../Model/membersModule/memberDataMd');
const { handleCRUD } = require('../../Utilities/crudUtils');
const { enhancedStandardizedGet, enhancedStandardizedPost, enhancedStandardizedPut, enhancedStandardizedDelete } = require('../../Utilities/enhancedStandardizedApiUtils');


// --- INSTITUTE DEPENDENTS CONFIG ---
const instituteDependents = [
  { model: 'DepartmentData', field: 'instituteId', name: 'departments' },
  { model: 'Grades', field: 'instituteId', name: 'grades' },
  { model: 'Subjects', field: 'instituteId', name: 'subjects' },
  { model: 'LocationTypesInInstitute', field: 'instituteId', name: 'LocationTypesInInstitute' },
  { model: 'MembersData', field: 'instituteId', name: 'MembersData' },
  { model: 'GradeBatches', field: 'instituteId', name: 'gradeBatches' },
  { model: 'GradeSections', field: 'instituteId', name: 'gradeSections' },
  { model: 'GradeSectionBatches', field: 'instituteId', name: 'gradeSectionBatches' }
  // Add more as needed
];

// Get all institutes or a specific institute by ID
exports.getInstitutes = async (req, res) => {
  const options = {
    lookups: [],
    joinedFieldMap: {},
    dropdownFields: ['_id', 'instituteName'],
    validationField: 'instituteName',
    defaultSort: { instituteName: 1 },
    projectFields: {
      _id: 1,
      instituteName: 1,
      instituteCode: 1,
      address: 1,
      city: 1,
      district: 1,
      state: 1,
      country: 1,
      pinCode: 1,
      contactNo1: 1,
      contactNo2: 1,
      emailId: 1,
      archive: 1,
      createdAt: 1,
      updatedAt: 1
    }
  };

  await enhancedStandardizedGet(req, res, createInstitutesModel, options);
};

// Add a new institute
exports.insertInstitute = async (req, res) => {
  const options = {
    successMessage: 'Institute created successfully!',
    requiredFields: ['instituteName', 'instituteCode', 'address', 'city', 'district', 'state', 'country', 'pinCode', 'contactNo1', 'emailId'],
    uniqueFields: ['instituteName', 'instituteCode']
  };

  await enhancedStandardizedPost(req, res, createInstitutesModel, options);
};

exports.updateInstitute = async (req, res) => {
  const options = {
    successMessage: 'Institute updated successfully',
    uniqueFields: ['instituteName', 'instituteCode']
  };

  await enhancedStandardizedPut(req, res, createInstitutesModel, options);
};

// Delete institute(s) with dependency options
exports.deleteInstitutes = async (req, res) => {
  // Register all dependent models for the current connection
  createDepartmentDataModel(req.collegeDB);
  createGradesInInstituteModel(req.collegeDB);
  createSubjectsInInstituteModel(req.collegeDB);
  createLocationTypesInInstituteModel(req.collegeDB);
  createGradeBatchesInInstituteModel(req.collegeDB);
  createGradeSectionsInInstituteModel(req.collegeDB);
  createGradeSectionBatchesInInstituteModel(req.collegeDB);
  createMembersDataModel(req.collegeDB);

  const options = {
    successMessage: 'Institute(s) deleted successfully',
    dependencies: instituteDependents,
    modelName: 'Institute'
  };

  await enhancedStandardizedDelete(req, res, createInstitutesModel, options);
};