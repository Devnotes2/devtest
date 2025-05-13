const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const createLocationTypesInInstituteModel = require('../../../Model/instituteData/aggregation/locationTypesInInstituteMd');
const { handleCRUD } = require('../../../Utilities/crudUtils');

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
  const LocationTypesInInstitute = createLocationTypesInInstituteModel(req.collegeDB);
  const { newLocationType } = req.body;

  try {
    const newDoc = await handleCRUD(LocationTypesInInstitute, 'create', {}, newLocationType);
    res.status(200).json({ message: 'Location type added successfully', newDoc });
  } catch (error) {
    console.error('Error creating location type:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a location type
exports.updateLocationTypesInInstitute = async (req, res) => {
  const LocationTypesInInstitute = createLocationTypesInInstituteModel(req.collegeDB);
  const { id, updatedData } = req.body;

  try {
    const result = await handleCRUD(LocationTypesInInstitute, 'update', { _id: new ObjectId(id) }, { $set: updatedData });

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'Location type updated successfully' });
    } else if (result.matchedCount > 0 && result.modifiedCount === 0) {
      res.status(200).json({ message: 'No updates were made' });
    } else {
      res.status(404).json({ message: 'Location type not found' });
    }
  } catch (error) {
    console.error('Error updating location type:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete location types
exports.deleteLocationTypesInInstitute = async (req, res) => {
  const LocationTypesInInstitute = createLocationTypesInInstituteModel(req.collegeDB);
  const { ids } = req.body;

  try {
    const result = await handleCRUD(LocationTypesInInstitute, 'delete', { _id: { $in: ids.map(id => new ObjectId(id)) } });

    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Location type(s) deleted successfully', deletedCount: result.deletedCount });
    } else {
      res.status(404).json({ message: 'No matching location types found for deletion' });
    }
  } catch (error) {
    console.error('Error deleting location types:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Aggregation for enriched data
exports.getLocationTypesInInstituteAgs = async (req, res) => {
  const LocationTypesInInstitute = createLocationTypesInInstituteModel(req.collegeDB);

  try {
    const aggregationPipeline = [
      {
        $lookup: {
          from: 'instituteData', // Reference the new structure
          localField: 'instituteId',
          foreignField: '_id',
          as: 'instituteDetails',
        },
      },
      { $unwind: { path: '$instituteDetails', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'generalData',
            let: { locationTypes: '$locationTypes' },
            pipeline: [
              { $match: { _id: 'locationTypes' } },
              { $unwind: '$data' },
              { $match: { $expr: { $eq: ['$data._id', '$$locationTypes'] } } },
              { $project: { locationTypeValue: '$data.value' } }
            ],
            as: 'locationTypesDetails'
          }
        },
        { $unwind: '$locationTypesDetails' },
      {
        $project: {
          instituteName: '$instituteDetails.instituteName', // Adjusted to match the new structure
          locationTypes: '$locationTypesDetails.locationTypeValue', // Adjusted to match the new structure
          capacity: 1,
          description: 1,
          location: 1,
        },
      },
    ];

    const result = await LocationTypesInInstitute.aggregate(aggregationPipeline);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error during aggregation:', error);
    res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
};