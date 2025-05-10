const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const createLocationTypesInInstituteModel = require('../../../Model/instituteData/aggregation/locationTypesInInstituteMd');
const { handleCRUD } = require('../../../Utilities/crudUtils');

exports.getLocationTypesInInstituteAgs = async (req, res) => {
  try {
    const aggregationPipeline = [
      { "$unwind": "$data" },
      {
        "$lookup": {
          "from": "instituteData",
          "let": { "instituteId": { "$toString": "$data.instituteId" } },
          "pipeline": [
            { "$match": { "_id": "institutes" } },
            { "$unwind": "$data" },
            { "$match": { "$expr": { "$eq": [{ "$toString": "$data._id" }, "$$instituteId"] } } }
          ],
          "as": "matchedInstitute"
        }
      },
      { "$unwind": { "path": "$matchedInstitute", "preserveNullAndEmptyArrays": true } },
      {
        "$lookup": {
          "from": "generalData",
          "let": { "locationType": "$data.locationType" },
          "pipeline": [
            { "$match": { "_id": "locationTypes" } },
            { "$unwind": "$data" },
            { "$match": { "$expr": { "$eq": ["$data._id", "$$locationType"] } } }
          ],
          "as": "locationInfo"
        }
      },
      { "$unwind": { "path": "$locationInfo", "preserveNullAndEmptyArrays": true } },
      {
        "$set": {
          "data.instituteId": "$matchedInstitute.data.instituteName",
          "data.locationType": "$locationInfo.data.value"
        }
      },
      { "$unset": ["matchedInstitute", "locationInfo"] },
      {
        "$group": {
          "_id": "$_id",
          "data": { "$push": "$data" },
          "__v": { "$first": "$__v" }
        }
      }
    ];

    return handleCRUD.aggregate(req, res, 'LocationTypesInInstitute', aggregationPipeline);
  } catch (error) {
    console.error('Error during aggregation:', error);
    res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
};

exports.createLocationTypesInInstitute = (req, res) => {
  handleCRUD.create(req, res, 'LocationTypesInInstitute');
};

exports.updateLocationTypesInInstitute = (req, res) => {
  handleCRUD.updateOne(req, res, 'LocationTypesInInstitute', {
    arrayFilters: [{ "elem._id": req.body._id }],
    updateFields: req.body.updatedData
  });
};

exports.deleteLocationTypesInInstitute = (req, res) => {
  handleCRUD.deleteMany(req, res, 'LocationTypesInInstitute', {
    arrayFilters: [{ "elem._id": { $in: req.body.ids } }]
  });
};

exports.getLocationTypesInInstitute = (req, res) => {
  handleCRUD.findById(req, res, 'LocationTypesInInstitute', req.params._id);
};

exports.getLocationTypesInInstituteAg = (req, res) => {
  const { ids } = req.query;

  if (ids && Array.isArray(ids)) {
    handleCRUD.find(req, res, 'LocationTypesInInstitute', {
      _id: { $in: ids.map(id => new ObjectId(id)) }
    });
  } else {
    exports.getLocationTypesInInstituteAgs(req, res);
  }
};
