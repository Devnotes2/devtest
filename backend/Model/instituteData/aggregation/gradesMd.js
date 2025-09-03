const mongoose = require('mongoose');
const { Schema } = mongoose;

const GradesSchema = new Schema({
  instituteId: {
    type: mongoose.Schema.Types.ObjectId,  // Reference to the institute (ObjectId)
    required: true,
  },
  departmentId:{
    type: mongoose.Schema.Types.ObjectId,  // Reference to the institute (ObjectId)
    required: true,
  },
  gradeName: {
    type: String,  // Numeric code for the grade
    required: true
  },
  gradeCode: {
    type: String,  // Numeric code for the grade
    required: true
  },
  description: {
    type: String,  // Description of the grade
    required: true
  },
  gradeDuration: {
    type: mongoose.Schema.Types.ObjectId,  // Duration of the grade (e.g., "1 year")
    required: true
  },
  isElective: {
    type: mongoose.Schema.Types.ObjectId,  // Whether the grade is elective or not
    required: true
  },
  archive: {
    type: Boolean,
    default: false
    }
}, { timestamps: true });  // Optionally, you can use timestamps to track creation and update times



const createGradesInInstituteModel = (connection) => {
  return connection.model('Grades', GradesSchema);
};

module.exports = createGradesInInstituteModel;
