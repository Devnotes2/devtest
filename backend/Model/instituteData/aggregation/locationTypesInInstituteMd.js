const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the schema for individual location types in institutes
const locationTypesInInstituteSchema = new Schema({
  instituteId: { type: Schema.Types.ObjectId, ref: 'Institute', required: true }, // Reference to Institute collection
  locationTypes: { type: Schema.Types.ObjectId, required: true }, // Reference to location type
  capacity: { type: Number, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
}, { collection: 'locationTypesInInstitute' }); // Use a new collection

const createLocationTypesInInstituteModel = (connection) => {
  return connection.model('LocationTypesInInstitute', locationTypesInInstituteSchema);
};

module.exports = createLocationTypesInInstituteModel;