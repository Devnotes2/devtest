const mongoose = require('mongoose');
const { Schema } = mongoose;

const GradeSectionsSchema = new Schema({
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
  sectionName: {
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
GradeSectionsSchema.index(
  { instituteId: 1, gradeId: 1, sectionName: 1 }, 
  { 
    unique: true, 
    name: 'unique_section_per_grade',
    partialFilterExpression: { archive: { $ne: true } }
  }
);

// Pre-save middleware to validate uniqueness before saving
GradeSectionsSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('instituteId') || this.isModified('gradeId') || this.isModified('sectionName')) {
    const GradeSections = this.constructor;
    
    // Check for duplicate section name within the same grade within the same institute
    const existingSection = await GradeSections.findOne({
      instituteId: this.instituteId,
      gradeId: this.gradeId,
      sectionName: this.sectionName,
      _id: { $ne: this._id },
      archive: { $ne: true }
    });
    
    if (existingSection) {
      const error = new Error('Section name already exists in this grade within the institute');
      error.code = 'DUPLICATE_SECTION_NAME';
      return next(error);
    }
  }
  next();
});

// Pre-update middleware to validate uniqueness before updating
GradeSectionsSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate();
  const filter = this.getFilter();
  
  if (update.instituteId || update.gradeId || update.sectionName) {
    const GradeSections = this.model;
    const doc = await GradeSections.findOne(filter);
    
    if (!doc) return next();
    
    const instituteId = update.instituteId || doc.instituteId;
    const gradeId = update.gradeId || doc.gradeId;
    const sectionName = update.sectionName || doc.sectionName;
    
    // Check for duplicate section name
    if (update.sectionName) {
      const existingSection = await GradeSections.findOne({
        instituteId,
        gradeId,
        sectionName,
        _id: { $ne: doc._id },
        archive: { $ne: true }
      });
      
      if (existingSection) {
        const error = new Error('Section name already exists in this grade within the institute');
        error.code = 'DUPLICATE_SECTION_NAME';
        return next(error);
      }
    }
  }
  next();
});

const createGradeSectionsInInstituteModel = (connection) => {
  return connection.model('GradeSections', GradeSectionsSchema);
};

module.exports = createGradeSectionsInInstituteModel;