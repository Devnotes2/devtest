const mongoose = require('mongoose');
const { Schema } = mongoose;

const GradeSectionBatchesSchema = new Schema({
  instituteId: {
    type: String,  // Reference to the institute
    required: true
  },
  gradeId : {
    type: String,  // Numeric code for the grade
    required: true
  },
  gradeSectionBatch: {
    type: String,  // Description of the grade
    required: true
  }
});  // Optionally, you can use timestamps to track creation and update times



const createGradeSectionBatchesInInstituteModel = (connection) => {
  return connection.model('GradeSectionBatches', GradeSectionBatchesSchema);
};

module.exports = createGradeSectionBatchesInInstituteModel;
