const mongoose = require('mongoose');
const { Schema } = mongoose;

const GradeBatchesSchema = new Schema({
  instituteId: {
    type: mongoose.Schema.Types.ObjectId,  // Reference to the institute (ObjectId)
    required: true,
  },
  gradeId : {
    type: mongoose.Schema.Types.ObjectId,  // Reference to the institute (ObjectId)
    required: true,
  },
  batch: {
    type: String,  // Description of the grade
    required: true
  },
  archive: {
    type: Boolean,
    default: false
  }
});  // Optionally, you can use timestamps to track creation and update times



const createGradeBatchesInInstituteModel = (connection) => {
  return connection.model('GradeBatches', GradeBatchesSchema);
};

module.exports = createGradeBatchesInInstituteModel;
