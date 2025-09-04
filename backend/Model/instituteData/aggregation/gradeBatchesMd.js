const mongoose = require('mongoose');
const { Schema } = mongoose;

const GradeBatchesSchema = new Schema({
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
  batch: {
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

// Compound unique: batch name unique per grade within institute
GradeBatchesSchema.index(
  { instituteId: 1, gradeId: 1, batch: 1 }, 
  { unique: true, name: 'unique_batch_per_grade' }
);

const createGradeBatchesInInstituteModel = (connection) => {
  return connection.model('GradeBatches', GradeBatchesSchema);
};

module.exports = createGradeBatchesInInstituteModel;