const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const createLocationTypesInInstituteModel = require('../../../Model/instituteData/aggregation/locationTypesInInstituteMd');
const { handleCRUD } = require('../../../Utilities/crudUtils');
const { enhancedStandardizedGet, enhancedStandardizedPost, enhancedStandardizedPut, enhancedStandardizedDelete } = require('../../../Utilities/enhancedStandardizedApiUtils');
const { locationTypesInInstituteLookup } = require('../../../Utilities/aggregations/locationTypesLookups');

// Get all location types or a specific location type by ID
exports.getLocationTypesInInstitute = async (req, res) => {
  const LocationTypesInInstitute = createLocationTypesInInstituteModel(req.collegeDB);
  const { id } = req.params;

  try {
    if (id) {
      const locationType = await handleCRUD(LocationTypesInInstitute, 'findOne', { _id: new ObjectId(id) });
      if (!locationType) {
        return res.status(404).json({ message: 'Location type not found' });
      }
      return res.json(locationType);
    } else {
      const locationTypes = await handleCRUD(LocationTypesInInstitute, 'find', {});
      return res.json(locationTypes);
    }
  } catch (error) {
    console.error('Error fetching location types:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add a new location type
exports.createLocationTypesInInstitute = async (req, res) => {
  const options = {
    successMessage: 'Location type created successfully',
    requiredFields: ['instituteId', 'locationTypes'],
    uniqueFields: [
      {
        fields: ['instituteId', 'locationTypes'],
        message: 'Location type already exists for this institute'
      }
    ]
  };

  await enhancedStandardizedPost(req, res, createLocationTypesInInstituteModel, options);
};

// Update a location type
exports.updateLocationTypesInInstitute = async (req, res) => {
  const options = {
    successMessage: 'Location type updated successfully',
    uniqueFields: [
      {
        fields: ['instituteId', 'locationTypes'],
        message: 'Location type already exists for this institute'
      }
    ]
  };

  await enhancedStandardizedPut(req, res, createLocationTypesInInstituteModel, options);
};

// Delete location types
exports.deleteLocationTypesInInstitute = async (req, res) => {
  const options = {
    successMessage: 'Location type deleted successfully',
    dependencies: [], // No dependencies for location types
    modelName: 'LocationTypes'
  };

  await enhancedStandardizedDelete(req, res, createLocationTypesInInstituteModel, options);
};


// Aggregation for enriched data
exports.getLocationTypesInInstituteAgs = async (req, res) => {
  const options = {
    lookups: locationTypesInInstituteLookup(),
    joinedFieldMap: {
      institute: 'instituteDetails.instituteName'
    },
    dropdownFields: ['_id', 'locationTypes'],
    validationField: 'locationTypes',
    defaultSort: { locationTypes: 1 },
    projectFields: {
      _id: 1,
      instituteId: 1,
      locationTypes: 1,
      capacity: 1,
      description: 1,
      location: 1,
      archive: 1,
      createdAt: 1,
      updatedAt: 1,
      // Add lookup data with clear naming
      instituteName: '$instituteDetails.instituteName'
    }
  };

  await enhancedStandardizedGet(req, res, createLocationTypesInInstituteModel, options);
};