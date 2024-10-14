const mongoose = require('mongoose');
const { Schema } = mongoose;

const GradeBatchesSchema = new Schema({
  instituteId: {
    type: String,  // Reference to the institute
    required: true
  },
  gradeId : {
    type: String,  // Numeric code for the grade
    required: true
  },
  batch: {
    type: String,  // Description of the grade
    required: true
  }
});  // Optionally, you can use timestamps to track creation and update times



const createGradeBatchesInInstituteModel = (connection) => {
  return connection.model('GradeBatches', GradeBatchesSchema);
};

module.exports = createGradeBatchesInInstituteModel;
