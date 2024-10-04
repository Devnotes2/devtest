const mongoose = require('mongoose');

// Define the schema for each institute
const instituteSchema = new mongoose.Schema({
    instituteName: String,
    address: String,
    city: String,
    district: String,
    state: String,
    country: String,
    pinCode: Number,
    contactNo1: String,
    contactNo2: String,
    emailId: String,
}, { _id: true }); // Auto-generates _id for each institute

// Define the schema for institutes collection
const institutesSchema = new mongoose.Schema({
    _id: String, // This will be 'institutes'
    data: [instituteSchema] // Array of institutes, each with an auto-generated _id
}, { collection: 'instituteData' });

const createInstitutesModel = (connection) => {
    return connection.model('institutes', institutesSchema);
};

module.exports = createInstitutesModel;
