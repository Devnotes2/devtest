const mongoose = require('mongoose');

// Define the schema for individual academic years
const academicYearDataSchema = new mongoose.Schema({
    startDate: {
        type: String,
        required: true,
    },
    endDate: {
        type: String,
        required: true,
    },
}, { collection: 'academicYear' }); // Use a new collection for academic year data

const createAcademicYearDataModel = (connection) => {
    return connection.model('academicYear', academicYearDataSchema);
};

module.exports = createAcademicYearDataModel;