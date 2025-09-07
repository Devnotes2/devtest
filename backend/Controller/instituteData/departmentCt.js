// departmentDataCt.js (Controller for handling Department data)
const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const createDepartmentDataModel = require('../../Model/instituteData/departmentMd');
const { enhancedStandardizedGet, enhancedStandardizedPost, enhancedStandardizedPut, enhancedStandardizedDelete } = require('../../Utilities/enhancedStandardizedApiUtils');
const { getApiConfig } = require('../../Utilities/apiConfig');
const { instituteLookup } = require('../../Utilities/aggregations/instituteDataLookups');
const createGradesInInstituteModel = require('../../Model/instituteData/aggregation/gradesMd');
const createSubjectsInInstituteModel = require('../../Model/instituteData/aggregation/subjectsMd');
const createGradeBatchesInInstituteModel = require('../../Model/instituteData/aggregation/gradeBatchesMd');
const createGradeSectionsInInstituteModel = require('../../Model/instituteData/aggregation/gradesectionsMd');
const createGradeSectionBatchesInInstituteModel = require('../../Model/instituteData/aggregation/gradeSectionBatchesMd');
const { createMembersDataModel } = require('../../Model/membersModule/memberDataMd');

// --- DEPARTMENT DEPENDENTS CONFIG ---
const departmentDependents = [
  { model: createGradesInInstituteModel, field: 'departmentId', name: 'grades' },
  { model: createSubjectsInInstituteModel, field: 'departmentId', name: 'subjects' },
  { model: createGradeBatchesInInstituteModel, field: 'departmentId', name: 'gradeBatches' },
  { model: createGradeSectionsInInstituteModel, field: 'departmentId', name: 'gradeSections' },
  { model: createGradeSectionBatchesInInstituteModel, field: 'departmentId', name: 'gradeSectionBatches' },
  { model: createMembersDataModel, field: 'department', name: 'membersData' }
];

// GET Department
exports.getDepartment = async (req, res) => {
  const apiConfig = getApiConfig('departments');
  
  const options = {
    ...apiConfig,
    lookups: [
      ...instituteLookup()
    ],
    joinedFieldMap: {
      institute: 'instituteDetails.instituteName'
    },
    dropdownFields: ['_id', 'departmentName'],
    validationField: 'departmentName',
    defaultSort: { departmentName: 1 },
    projectFields: {
      departmentName: 1,
      departmentCode: 1,
      description: 1,
      instituteName: '$instituteDetails.instituteName',
      createdAt: 1,
      updatedAt: 1
    }
  };

  await enhancedStandardizedGet(req, res, createDepartmentDataModel, options);
};

// POST Department
exports.createDepartment = async (req, res) => {
  const apiConfig = getApiConfig('departments');
  
  const options = {
    ...apiConfig,
    successMessage: 'Department created successfully',
    requiredFields: ['departmentName', 'departmentCode', 'instituteId'],
    uniqueFields: [
      {
        fields: ['departmentName', 'instituteId'],
        message: 'Department name already exists in this institute'
      },
      {
        fields: ['departmentCode', 'instituteId'],
        message: 'Department code already exists in this institute'
      }
    ]
  };

  await enhancedStandardizedPost(req, res, createDepartmentDataModel, options);
};

// PUT Department
exports.updateDepartment = async (req, res) => {
  const apiConfig = getApiConfig('departments');
  
  const options = {
    ...apiConfig,
    successMessage: 'Department updated successfully',
    uniqueFields: [
      {
        fields: ['departmentName', 'instituteId'],
        message: 'Department name already exists in this institute'
      },
      {
        fields: ['departmentCode', 'instituteId'],
        message: 'Department code already exists in this institute'
      }
    ]
  };

  await enhancedStandardizedPut(req, res, createDepartmentDataModel, options);
};

// DELETE Department
exports.deleteDepartment = async (req, res) => {
  const apiConfig = getApiConfig('departments');
  
  const options = {
    ...apiConfig,
    successMessage: 'Department deleted successfully',
    dependencies: departmentDependents,
    modelName: 'Department'
  };

  await enhancedStandardizedDelete(req, res, createDepartmentDataModel, options);
};

module.exports = {
  getDepartment: exports.getDepartment,
  createDepartment: exports.createDepartment,
  updateDepartment: exports.updateDepartment,
  deleteDepartment: exports.deleteDepartment
};