const mongoose = require('mongoose');

// Define the schema for individual academic years
const academicYearSchema = new mongoose.Schema({
    startDate: {
        type: Date, // Use Date type for better date handling
        required: true,
    },
    endDate: {
        type: Date, // Use Date type for better date handling
        required: true,
    },

}, { 
    collection: 'academicYear', // Use the 'academicYear' collection
    timestamps: true, // Automatically manage createdAt and updatedAt fields
});

// Create the model for the academic year
const createAcademicYearModel = (connection) => {
    return connection.model('academicYear', academicYearSchema);
};

module.exports = createAcademicYearModel;