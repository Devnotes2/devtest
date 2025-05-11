const mongoose = require('mongoose');

// Define the schema for individual institutes
const institutesDataSchema = new mongoose.Schema({
  instituteName: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  district: {
    type: String,
  },
  state: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  pinCode: {
    type: Number,
    required: true,
  },
  contactNo1: {
    type: String,
    required: true,
  },
  contactNo2: {
    type: String,
  },
  emailId: {
    type: String,
    required: true,
  },
}, { collection: 'instituteData' }); // Use a new collection for institutes data

const createInstitutesDataModel = (connection) => {
  return connection.model('instituteData', institutesDataSchema);
};

module.exports = createInstitutesDataModel;