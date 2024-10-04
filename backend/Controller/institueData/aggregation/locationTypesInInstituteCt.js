const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const createLocationTypesInInstituteModel = require('../../../Model/instituteData/aggregation/locationTypesInInstituteMd');

// GET /api/location-types-institute
exports.getLocationTypesInInstituteAg = async (req, res) => {
  try {
    const LocationTypesInInstitute = createLocationTypesInInstituteModel(req.collegeDB);
    const data = await LocationTypesInInstitute.aggregate([
      {
        "$unwind": "$data"
      },
      {
        "$lookup": {
          "from": "instituteData",
          "let": { "instituteId": { "$toString": "$data.instituteId" } },
          "pipeline": [
            {
              "$match": { "_id": "institutes" }
            },
            {
              "$unwind": "$data"
            },
            {
              "$match": {
                "$expr": {
                  "$eq": [{ "$toString": "$data._id" }, "$$instituteId"]
                }
              }
            }
          ],
          "as": "matchedInstitute"
        }
      },
      {
        "$unwind": {
          "path": "$matchedInstitute",
          "preserveNullAndEmptyArrays": true
        }
      },
      {
        "$lookup": {
          "from": "generalData",
          "let": { "locationType": "$data.locationType" },
          "pipeline": [
            {
              "$match": { "_id": "locationTypes" }
            },
            {
              "$unwind": "$data"
            },
            {
              "$match": {
                "$expr": {
                  "$eq": ["$data._id", "$$locationType"]
                }
              }
            }
          ],
          "as": "locationInfo"
        }
      },
      {
        "$unwind": {
          "path": "$locationInfo",
          "preserveNullAndEmptyArrays": true
        }
      },
      {
        "$set": {
          "data.instituteId": "$matchedInstitute.data.instituteName",
          "data.locationType": "$locationInfo.data.value"
        }
      },
      {
        "$unset": ["matchedInstitute", "locationInfo"]
      },
      {
        "$group": {
          "_id": "$_id",  // Group by the _id of the main document
          "data": { "$push": "$data" },  // Combine all data entries into an array
          "__v": { "$first": "$__v" }  // Keep the version field
        }
      }
    ]);

    console.log(data);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error during aggregation:', error);
    res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
};


exports.createLocationTypesInInstitute = async (req, res) => {
  try {
    const LocationTypesInInstitute = createLocationTypesInInstituteModel(req.collegeDB);

    const { instituteId, locationType, capacity, description ,location} = req.body;

    // Find the document with _id 'locationTypesInInstitute'
    let locationTypesInInstitute = await LocationTypesInInstitute.findOne({ _id: 'locationTypesInInstitute' });

    // If the document does not exist, create a new one
    if (!locationTypesInInstitute) {
      locationTypesInInstitute = new LocationTypesInInstitute({
        _id: 'locationTypesInInstitute',
        data: []
      });
    }

    // Add the new location data to the 'data' array
    locationTypesInInstitute.data.push({
      instituteId,
      locationType,
      capacity,
      description,
      location
    });

    // Save the updated document back to the database
    await locationTypesInInstitute.save();

    res.status(201).json({
      message: 'Location Type added successfully!',
      data: locationTypesInInstitute
    });
  } catch (error) {
    console.error('Error adding location types:', error);
    res.status(500).json({ error: 'Failed to add location type', details: error.message });
  }
};

// PUT /api/location-types-institute
exports.updateLocationTypesInInstitute = async (req, res) => {
  const { _id, updatedData } = req.body;

  try {
    const LocationTypesInInstitute = createLocationTypesInInstituteModel(req.collegeDB);

    // Retrieve the current state before the update
    const currentDoc = await LocationTypesInInstitute.findOne(
      { _id: "locationTypesInInstitute", "data._id": _id },
      { "data.$": 1 }
    );
    console.log('Current Document:', currentDoc);

    const updateObject = {};
    if (updatedData.instituteId) updateObject["data.$.instituteId"] = updatedData.instituteId;
    if (updatedData.locationType) updateObject["data.$.locationType"] = updatedData.locationType;
    if (updatedData.capacity) updateObject["data.$.capacity"] = updatedData.capacity;
    if (updatedData.description) updateObject["data.$.description"] = updatedData.description;
    if (updatedData.location) updateObject["data.$.location"] = updatedData.location;
    console.log('Update Object:', updateObject);

    const result = await LocationTypesInInstitute.updateOne(
      { _id: "locationTypesInInstitute", "data._id": _id },
      { $set: updateObject }
    );

    console.log('Update Result:', result);

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'Location type updated successfully' });
    }
    else if(result.matchedCount > 0 && result.modifiedCount == 0)
    {
      res.status(200).json({ message: 'No updates found' });
    } 
    else {
      res.status(404).json({ message: 'No matching location type found or values are unchanged' });
    }
  } catch (error) {
    console.error('Error during update:', error);
    res.status(500).json({ error: 'Failed to update location type', details: error.message });
  }
};



exports.deleteLocationTypesInInstitute = async (req, res) => {
  const { ids } = req.body;

  try {
    const LocationTypesInInstitute = createLocationTypesInInstituteModel(req.collegeDB);

    // Find the document
    const document = await LocationTypesInInstitute.findOne({ _id: "locationTypesInInstitute" });
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Filter out the data items that are in the ids array
    const filteredData = document.data.filter(item => !ids.includes(item._id.toString()));

    // Update the document with the filtered data
    document.data = filteredData;
    await document.save();

    res.status(200).json({ message: 'Location types deleted successfully' });
  } catch (error) {
    console.error('Error during delete:', error);
    res.status(500).json({ error: 'Failed to delete location types', details: error.message });
  }
};




exports.getLocationTypesInInstitute = async (req, res) => {
  const LocationTypesInInstitute = createLocationTypesInInstituteModel(req.collegeDB);
  const { _id } = req.params;
  try {
    const document = await LocationTypesInInstitute.findById('locationTypesInInstitute');
    
    if (!document) {
      return res.status(404).json({ message: 'Academic year data not found' });
    }
    
    // console.log(document);
      if (_id) {
          // Convert id to an integer for comparison
          const year = document.data.find(yr => yr._id === parseInt(_id));
          if (!year) {
              return res.status(404).json({ message: 'Academic year not found' });
          }
          return res.json(year);
      } else {
          // Sort by startDate, which are strings in the format 'YYYYMMDD'
          document.data.sort((a, b) => a.locationType-b.locationType);
          return res.json(document.data);
      }

  } catch (error) {
      console.error("Error in getAcademicYears:", error.message);
      res.status(500).json({ message: 'Server error', error: error.message });
  }
};
