const mongoose = require('mongoose');
const { Schema } = mongoose;

const GradeSectionBatchesSchema = new Schema({
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
  sectionId :{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  sectionBatchName: {
    type: String,
    required: true,
    // Remove unique: true - will be compound unique
  },
  description :{
    type: String,
    required: false,
  },
  archive: {
    type: Boolean,
    default: false
  }
});

// Compound unique: section batch name unique per section within institute
GradeSectionBatchesSchema.index(
  { instituteId: 1, sectionId: 1, sectionBatchName: 1 }, 
  { unique: true, name: 'unique_section_batch_per_section' }
);

const createGradeSectionBatchesInInstituteModel = (connection) => {
  return connection.model('GradeSectionBatches', GradeSectionBatchesSchema);
};

module.exports = createGradeSectionBatchesInInstituteModel;