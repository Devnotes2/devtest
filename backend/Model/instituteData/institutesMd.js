const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the schema for the instituteData collection
const instituteSchema = new Schema({
  instituteName: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String,required:true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  pinCode: { type: Number, required: true },
  contactNo1: { type: String, required: true },
  contactNo2: { type: String },
  emailId: { type: String, required: true },
  archive: {
    type: Boolean,
    default: false,
    index: true
  }
}, { collection: 'instituteData', timestamps: true }); // Specify the collection name

// Create the model
const createInstitutesModel = (connection) => {
  return connection.model('instituteData', instituteSchema);
};

module.exports = createInstitutesModel;