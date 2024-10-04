const mongoose = require('mongoose');
const { Schema } = mongoose;

const dataSchema = new Schema({
  instituteId: { type: Schema.Types.ObjectId, ref: 'Institute' },  // Reference to Institute collection
  locationType: { type: Number },  // Assuming locationType is now a number, based on the given structure
  capacity: { type: Number},
  description: { type: String},
  location: { type: String }
});

const locationTypesInInstituteSchema = new Schema({
  _id: { type: String, required: true, default: 'locationTypesInInstitute' },  // Static _id
  data: [dataSchema]  // Array of location data as per your structure
}, { collection: 'instituteAggre' });

const createLocationTypesInInstituteModel = (connection) => {
  return connection.model('LocationTypesInInstitute', locationTypesInInstituteSchema);
};

module.exports = createLocationTypesInInstituteModel;
