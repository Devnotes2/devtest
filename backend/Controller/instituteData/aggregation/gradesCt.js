const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const createGradesInInstituteModel = require('../../../Model/instituteData/aggregation/gradesMd');
const { handleCRUD } = require('../../../Utilities/crudUtils');
const { buildMatchConditions, buildSortObject } = require('../../../Utilities/filterSortUtils');
const createSubjectsInInstituteModel = require('../../../Model/instituteData/aggregation/subjectsMd');
const createGradeBatchesInInstituteModel = require('../../../Model/instituteData/aggregation/gradeBatchesMd');
const createGradeSectionsInInstituteModel = require('../../../Model/instituteData/aggregation/gradesectionsMd');
const createGradeSectionBatchesInInstituteModel = require('../../../Model/instituteData/aggregation/gradeSectionBatchesMd');
const { createMembersDataModel } = require('../../../Model/membersModule/memberDataMd');
const { generalDataLookup } = require('../../../Utilities/aggregations/generalDataLookups');
const { enhancedStandardizedGet, enhancedStandardizedPost, enhancedStandardizedPut, enhancedStandardizedDelete } = require('../../../Utilities/enhancedStandardizedApiUtils');
const { gradesInInstituteLookup } = require('../../../Utilities/aggregations/gradesLookups');

// --- Grade DEPENDENTS CONFIG ---
const gradesDependents = [
  { model: 'Subjects', field: 'gradeId', name: 'subjects' },
  { model: 'MembersData', field: 'gradeId', name: 'MembersData' },
  { model: 'GradeBatches', field: 'gradeId', name: 'gradeBatches' },
  { model: 'GradeSections', field: 'gradeId', name: 'gradeSections' },
  { model: 'GradeSectionBatches', field: 'gradeId', name: 'gradeSectionBatches' }
  // Add more as needed
];


exports.gradesInInstituteAg = async (req, res) => {
  const options = {
    lookups: [
      ...gradesInInstituteLookup(),
        ...generalDataLookup('gradeDuration', 'gradeDurationId', 'gradeDurationDetails', 'gradeDurationValue')
    ],
    joinedFieldMap: {
      institute: 'instituteDetails.instituteName',
      department: 'departmentDetails.departmentName',
      gradeDuration: 'gradeDurationDetails.gradeDurationValue'
    },
    dropdownFields: ['_id', 'gradeName', 'gradeCode'],
    validationField: 'gradeName',
    defaultSort: { gradeName: 1 },
    projectFields: {
          _id: 1,
          instituteId: 1,
          departmentId: 1,
          gradeName: 1,
          gradeCode: 1,
          description: 1,
          gradeDurationId: 1,
          archive: 1,
          createdAt: 1,
          updatedAt: 1,
          // Add lookup data with clear naming
          instituteName: '$instituteDetails.instituteName',
          departmentName: '$departmentDetails.departmentName',
          gradeDurationValue: '$gradeDurationDetails.gradeDurationValue'
        }
  };

  await enhancedStandardizedGet(req, res, createGradesInInstituteModel, options);
};

exports.createGradesInInstitute = async (req, res) => {
  const options = {
    successMessage: 'Grade created successfully',
    requiredFields: ['instituteId', 'departmentId', 'gradeName', 'gradeCode'],
    uniqueFields: [
      {
        fields: ['instituteId', 'gradeName'],
        message: 'Grade name already exists for this institute'
      },
      {
        fields: ['instituteId', 'gradeCode'],
        message: 'Grade code already exists for this institute'
      }
    ]
  };

  await enhancedStandardizedPost(req, res, createGradesInInstituteModel, options);
};

exports.updateGradesInInstitute = async (req, res) => {
  const options = {
    successMessage: 'Grade updated successfully',
    uniqueFields: [
      {
        fields: ['instituteId', 'gradeName'],
        message: 'Grade name already exists for this institute'
      },
      {
        fields: ['instituteId', 'gradeCode'],
        message: 'Grade code already exists for this institute'
      }
    ]
  };

  await enhancedStandardizedPut(req, res, createGradesInInstituteModel, options);
};




// exports.deleteGradesInInstitute = async (req, res) => {
//   const GradesInInstitute = createGradesInInstituteModel(req.collegeDB);
//   const { ids } = req.body;

//   try {
//     const result = await handleCRUD(GradesInInstitute, 'delete', { _id: { $in: ids.map(id => id) } });

//     if (result.deletedCount > 0) {
//       res.status(200).json({ message: 'Grades deleted successfully' });
//     } else {
//       res.status(404).json({ message: 'No matching grades found' });
//     }
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to delete grades', details: error.message });
//   }
// };


exports.deleteGradesInInstitute = async (req, res) => {
  const options = {
    successMessage: 'Grade deleted successfully',
    dependencies: gradesDependents,
    modelName: 'Grades'
  };

  await enhancedStandardizedDelete(req, res, createGradesInInstituteModel, options);
};