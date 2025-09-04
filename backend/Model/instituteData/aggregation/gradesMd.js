const mongoose = require('mongoose');
const { Schema } = mongoose;

const GradesSchema = new Schema({
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
  gradeName: {
    type: String,
    required: true,
    trim: true
  },
  gradeCode: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  gradeDuration: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  archive: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Compound unique indexes for proper constraint enforcement
GradesSchema.index(
  { instituteId: 1, gradeName: 1 }, 
  { 
    unique: true, 
    name: 'unique_grade_name_per_institute',
    partialFilterExpression: { archive: { $ne: true } }
  }
);

GradesSchema.index(
  { instituteId: 1, gradeCode: 1 },
  { 
    unique: true, 
    name: 'unique_grade_code_per_institute',
    partialFilterExpression: { archive: { $ne: true } }
  }
);

// Pre-save middleware to validate uniqueness before saving
GradesSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('instituteId') || this.isModified('gradeName') || this.isModified('gradeCode')) {
    const Grades = this.constructor;
    
    // Check for duplicate grade name within the same institute
    const existingName = await Grades.findOne({
      instituteId: this.instituteId,
      gradeName: this.gradeName,
      _id: { $ne: this._id },
      archive: { $ne: true }
    });
    
    if (existingName) {
      const error = new Error('Grade name already exists in this institute');
      error.code = 'DUPLICATE_GRADE_NAME';
      return next(error);
    }
    
    // Check for duplicate grade code within the same institute
    const existingCode = await Grades.findOne({
      instituteId: this.instituteId,
      gradeCode: this.gradeCode,
      _id: { $ne: this._id },
      archive: { $ne: true }
    });
    
    if (existingCode) {
      const error = new Error('Grade code already exists in this institute');
      error.code = 'DUPLICATE_GRADE_CODE';
      return next(error);
    }
  }
  next();
});

// Pre-update middleware to validate uniqueness before updating
GradesSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate();
  const filter = this.getFilter();
  
  if (update.instituteId || update.gradeName || update.gradeCode) {
    const Grades = this.model;
    const doc = await Grades.findOne(filter);
    
    if (!doc) return next();
    
    const instituteId = update.instituteId || doc.instituteId;
    const gradeName = update.gradeName || doc.gradeName;
    const gradeCode = update.gradeCode || doc.gradeCode;
    
    // Check for duplicate grade name
    if (update.gradeName) {
      const existingName = await Grades.findOne({
        instituteId,
        gradeName,
        _id: { $ne: doc._id },
        archive: { $ne: true }
      });
      
      if (existingName) {
        const error = new Error('Grade name already exists in this institute');
        error.code = 'DUPLICATE_GRADE_NAME';
        return next(error);
      }
    }
    
    // Check for duplicate grade code
    if (update.gradeCode) {
      const existingCode = await Grades.findOne({
        instituteId,
        gradeCode,
        _id: { $ne: doc._id },
        archive: { $ne: true }
      });
      
      if (existingCode) {
        const error = new Error('Grade code already exists in this institute');
        error.code = 'DUPLICATE_GRADE_CODE';
        return next(error);
      }
    }
  }
  next();
});

const createGradesInInstituteModel = (connection) => {
  return connection.model('Grades', GradesSchema);
};

module.exports = createGradesInInstituteModel;