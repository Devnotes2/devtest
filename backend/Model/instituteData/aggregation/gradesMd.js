const mongoose = require('mongoose');
const { Schema } = mongoose;

const GradesSchema = new Schema({
  instituteId: {
    type: String,  // Reference to the institute
    required: true
  },
  gradeCode: {
    type: Number,  // Numeric code for the grade
    required: true
  },
  gradeDescription: {
    type: String,  // Description of the grade
    required: true
  },
  gradeDuration: {
    type: Number,  // Duration of the grade (e.g., "1 year")
    required: true
  },
  isElective: {
    type: Number,  // Whether the grade is elective or not
    required: true
  }
});  // Optionally, you can use timestamps to track creation and update times



const createGradesInInstituteModel = (connection) => {
  return connection.model('Grades', GradesSchema);
};

module.exports = createGradesInInstituteModel;
