const mongoose = require('mongoose');
const { Schema } = mongoose;

const GradesSchema = new Schema({
  instituteId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  departmentId:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  gradeName: {
    type: String,
    required: true,
    // Remove unique: true - will be compound unique
  },
  gradeCode: {
    type: String,
    required: true,
    // Remove unique: true - will be compound unique
  },
  description: {
    type: String,
    required: false
  },
  gradeDuration: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  archive: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Compound unique: grade name and code unique per institute
GradesSchema.index(
  { instituteId: 1, gradeName: 1 }, 
  { unique: true, name: 'unique_grade_name_per_institute' }
);

GradesSchema.index(
  { instituteId: 1, gradeCode: 1 }, 
  { unique: true, name: 'unique_grade_code_per_institute' }
);

const createGradesInInstituteModel = (connection) => {
  return connection.model('Grades', GradesSchema);
};

module.exports = createGradesInInstituteModel;