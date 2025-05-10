const mongoose = require('mongoose');

// Define the schema for academic years
const departmentSchema = new mongoose.Schema({
            departmentName:String,
            instituteId:{type: mongoose.Schema.Types.ObjectId},
            description:{type:String},
            locationInInstitute: {type: mongoose.Schema.Types.ObjectId}},
            { collection: 'instituteData' }
);
const createDepartmentModel = (connection) => {
    return connection.model('department', departmentSchema);
  };

  module.exports = createDepartmentModel;
