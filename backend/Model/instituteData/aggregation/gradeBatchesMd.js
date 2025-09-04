const mongoose = require('mongoose');
const { Schema } = mongoose;

const GradeBatchesSchema = new Schema({
  instituteId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'instituteData'
  },
  departmentId:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'DepartmentData'
  },
  gradeId : {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Grades'
  },
  batch: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  archive: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Compound unique indexes for proper constraint enforcement
GradeBatchesSchema.index(
  { instituteId: 1, gradeId: 1, batch: 1 }, 
  { 
    unique: true, 
    name: 'unique_batch_per_grade',
    partialFilterExpression: { archive: { $ne: true } }
  }
);

// Pre-save middleware to validate uniqueness before saving
GradeBatchesSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('instituteId') || this.isModified('gradeId') || this.isModified('batch')) {
    const GradeBatches = this.constructor;
    
    // Check for duplicate batch name within the same grade within the same institute
    const existingBatch = await GradeBatches.findOne({
      instituteId: this.instituteId,
      gradeId: this.gradeId,
      batch: this.batch,
      _id: { $ne: this._id },
      archive: { $ne: true }
    });
    
    if (existingBatch) {
      const error = new Error('Batch name already exists in this grade within the institute');
      error.code = 'DUPLICATE_BATCH_NAME';
      return next(error);
    }
  }
  next();
});

// Pre-update middleware to validate uniqueness before updating
GradeBatchesSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate();
  const filter = this.getFilter();
  
  if (update.instituteId || update.gradeId || update.batch) {
    const GradeBatches = this.model;
    const doc = await GradeBatches.findOne(filter);
    
    if (!doc) return next();
    
    const instituteId = update.instituteId || doc.instituteId;
    const gradeId = update.gradeId || doc.gradeId;
    const batch = update.batch || doc.batch;
    
    // Check for duplicate batch name
    if (update.batch) {
      const existingBatch = await GradeBatches.findOne({
        instituteId,
        gradeId,
        batch,
        _id: { $ne: doc._id },
        archive: { $ne: true }
      });
      
      if (existingBatch) {
        const error = new Error('Batch name already exists in this grade within the institute');
        error.code = 'DUPLICATE_BATCH_NAME';
        return next(error);
      }
    }
  }
  next();
});

const createGradeBatchesInInstituteModel = (connection) => {
  return connection.model('GradeBatches', GradeBatchesSchema);
};

module.exports = createGradeBatchesInInstituteModel;