const mongoose = require('mongoose');
const { Schema } = mongoose;

const GradeSectionsSchema = new Schema({
  instituteId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  departmentId:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  gradeId : {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  sectionName: {
    type: String,
    required: true,
    // Remove unique: true - will be compound unique
  },
  description: {
    type: String,
    required: false
  },
  archive: {
    type: Boolean,
    default: false
  }
});

// Compound unique: section name unique per grade within institute
GradeSectionsSchema.index(
  { instituteId: 1, gradeId: 1, sectionName: 1 }, 
  { unique: true, name: 'unique_section_per_grade' }
);

const createGradeSectionsInInstituteModel = (connection) => {
  return connection.model('GradeSections', GradeSectionsSchema);
};

module.exports = createGradeSectionsInInstituteModel;