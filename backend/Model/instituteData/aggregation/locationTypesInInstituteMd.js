const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the schema for individual location types in institutes
const locationTypesInInstituteSchema = new Schema({
  instituteId: { type: Schema.Types.ObjectId, ref: 'Institute',  }, // Reference to Institute collection
  locationTypes: { type: Schema.Types.ObjectId,  }, // Reference to location type
  capacity: { type: Number, },
  description: { type: String, },
  location: { type: String, },
}, { collection: 'locationTypesInInstitute' }); // Use a new collection

const createLocationTypesInInstituteModel = (connection) => {
  return connection.model('LocationTypesInInstitute', locationTypesInInstituteSchema);
};

module.exports = createLocationTypesInInstituteModel;