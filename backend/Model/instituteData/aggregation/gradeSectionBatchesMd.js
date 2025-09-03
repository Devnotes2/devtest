const mongoose = require('mongoose');
const { Schema } = mongoose;

const GradeSectionBatchesSchema = new Schema({
  instituteId: {
    type: mongoose.Schema.Types.ObjectId,  // Reference to the institute (ObjectId)
    required: true,
  },
  departmentId:{
    type: mongoose.Schema.Types.ObjectId,  // Reference to the institute (ObjectId)
    required: true,
  },
  gradeId : {
    type: mongoose.Schema.Types.ObjectId,  // Reference to the institute (ObjectId)
    required: true,
  },
  sectionId :{
    type: mongoose.Schema.Types.ObjectId,  // Reference to the institute (ObjectId)
    required: true,
  },
  sectionBatchName: {
    type: String,  // Description of the grade
    required: true,
    unique: true
  },
  description :{
    type: String,  // Reference to the institute (ObjectId)
    required: false,
  },
  archive: {
    type: Boolean,
    default: false
    }
});  // Optionally, you can use timestamps to track creation and update times



const createGradeSectionBatchesInInstituteModel = (connection) => {
  return connection.model('GradeSectionBatches', GradeSectionBatchesSchema);
};

module.exports = createGradeSectionBatchesInInstituteModel;
