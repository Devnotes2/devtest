const createAcademicYearModel = require('../../Model/instituteData/academicYearMd');
const { handleCRUD } = require('../../Utilities/crudUtils');
const { ObjectId } = require('mongoose').Types;
const { enhancedStandardizedGet, enhancedStandardizedPost, enhancedStandardizedPut, enhancedStandardizedDelete } = require('../../Utilities/enhancedStandardizedApiUtils');

// Function to format academic year for display
function formatAcademicYear(startDate, endDate) {
  function extractDate(val) {
    if (val && typeof val === 'object' && val.$date) return new Date(val.$date);
    return new Date(val);
  }
  const sd = extractDate(startDate);
  const ed = extractDate(endDate);
  if (isNaN(sd.getTime()) || isNaN(ed.getTime())) return '';
  const pad = n => n < 10 ? '0' + n : n;
  return `${pad(sd.getDate())}/${pad(sd.getMonth()+1)}/${sd.getFullYear()}-${pad(ed.getDate())}/${pad(ed.getMonth()+1)}/${ed.getFullYear()}`;
}

// Function to get all academic years or a specific academic year by ID
exports.getAcademicYears = async (req, res) => {
  const options = {
    lookups: [],
    joinedFieldMap: {},
    dropdownFields: ['_id', 'academicYear'],
    validationField: 'academicYear',
    defaultSort: { startDate: -1 },
    projectFields: {
      _id: 1,
      startDate: 1,
      endDate: 1,
      academicYear: 1,
      archive: 1,
      createdAt: 1,
      updatedAt: 1
    },
    transformData: (data) => {
      if (Array.isArray(data)) {
        return data.map(ay => ({
          ...ay,
          academicYear: formatAcademicYear(ay.startDate, ay.endDate)
        }));
      }
      return {
        ...data,
        academicYear: formatAcademicYear(data.startDate, data.endDate)
      };
    }
  };

  await enhancedStandardizedGet(req, res, createAcademicYearModel, options);
};

// Function to add a new academic year
exports.insertAcademicYear = async (req, res) => {
  const options = {
    successMessage: 'Academic year added successfully',
    requiredFields: ['startDate', 'endDate'],
    uniqueFields: [],
    transformData: (data) => {
      // Handle both direct data and nested newYear structure
      const academicYearData = data.newYear || data;
      return {
        ...academicYearData,
        academicYear: formatAcademicYear(academicYearData.startDate, academicYearData.endDate)
      };
    }
  };

  await enhancedStandardizedPost(req, res, createAcademicYearModel, options);
};

// Function to update an academic year
exports.updateAcademicYear = async (req, res) => {
  const options = {
    successMessage: 'Academic year updated successfully',
    uniqueFields: [],
    transformData: (data) => {
      // Update the academicYear field if dates are being updated
      if (data.startDate || data.endDate) {
        return {
          ...data,
          academicYear: formatAcademicYear(data.startDate, data.endDate)
        };
      }
      return data;
    }
  };

  await enhancedStandardizedPut(req, res, createAcademicYearModel, options);
};

// Function to delete academic years
exports.deleteAcademicYear = async (req, res) => {
  const options = {
    successMessage: 'Academic year(s) deleted successfully',
    dependencies: [], // Academic years typically don't have dependencies
    modelName: 'AcademicYear'
  };

  await enhancedStandardizedDelete(req, res, createAcademicYearModel, options);
};