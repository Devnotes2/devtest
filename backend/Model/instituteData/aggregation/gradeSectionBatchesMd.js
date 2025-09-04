const mongoose = require('mongoose');
const { Schema } = mongoose;

const GradeSectionBatchesSchema = new Schema({
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
  sectionId :{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'GradeSections'
  },
  sectionBatchName: {
    type: String,
    required: true,
    trim: true
  },
  description :{
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
GradeSectionBatchesSchema.index(
  { instituteId: 1, sectionId: 1, sectionBatchName: 1 }, 
  { 
    unique: true, 
    name: 'unique_section_batch_per_section',
    partialFilterExpression: { archive: { $ne: true } }
  }
);

// Pre-save middleware to validate uniqueness before saving
GradeSectionBatchesSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('instituteId') || this.isModified('sectionId') || this.isModified('sectionBatchName')) {
    const GradeSectionBatches = this.constructor;
    
    // Check for duplicate section batch name within the same section within the same institute
    const existingBatch = await GradeSectionBatches.findOne({
      instituteId: this.instituteId,
      sectionId: this.sectionId,
      sectionBatchName: this.sectionBatchName,
      _id: { $ne: this._id },
      archive: { $ne: true }
    });
    
    if (existingBatch) {
      const error = new Error('Section batch name already exists in this section within the institute');
      error.code = 'DUPLICATE_SECTION_BATCH_NAME';
      return next(error);
    }
  }
  next();
});

// Pre-update middleware to validate uniqueness before updating
GradeSectionBatchesSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate();
  const filter = this.getFilter();
  
  if (update.instituteId || update.sectionId || update.sectionBatchName) {
    const GradeSectionBatches = this.model;
    const doc = await GradeSectionBatches.findOne(filter);
    
    if (!doc) return next();
    
    const instituteId = update.instituteId || doc.instituteId;
    const sectionId = update.sectionId || doc.sectionId;
    const sectionBatchName = update.sectionBatchName || doc.sectionBatchName;
    
    // Check for duplicate section batch name
    if (update.sectionBatchName) {
      const existingBatch = await GradeSectionBatches.findOne({
        instituteId,
        sectionId,
        sectionBatchName,
        _id: { $ne: doc._id },
        archive: { $ne: true }
      });
      
      if (existingBatch) {
        const error = new Error('Section batch name already exists in this section within the institute');
        error.code = 'DUPLICATE_SECTION_BATCH_NAME';
        return next(error);
      }
    }
  }
  next();
});

const createGradeSectionBatchesInInstituteModel = (connection) => {
  return connection.model('GradeSectionBatches', GradeSectionBatchesSchema);
};

module.exports = createGradeSectionBatchesInInstituteModel;