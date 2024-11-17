const mongoose = require('mongoose');

// Define the schema for academic years
const academicYearSchema = new mongoose.Schema({
    _id: String,
    data: [
        {
            // _id: Number,
            startDate: String,
            endDate: String,
        }
    ]
},
{ collection: 'instituteData' }
);

const createAcademicYearModel = (connection) => {
    return connection.model('academicYear', academicYearSchema);
  };

  module.exports = createAcademicYearModel;
