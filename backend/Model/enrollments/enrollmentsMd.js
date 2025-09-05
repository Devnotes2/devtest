const mongoose = require('mongoose');
const { Schema } = mongoose;

const EnrollmentsSchema = new Schema({
  instituteId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'instituteData'
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'DepartmentData'
  },
  gradeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Grades'
  },
  gradeSectionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'GradeSections'
  },
  gradeSectionBatchId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'GradeSectionBatches'
  },
  gradeBatchId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'GradeBatches'
  },
  subjectsIds: [{
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'Subjects'
  }],
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'MembersData'
  },
  memberType: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'generalData'
  },
  enrollmentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  academicYearId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'academicYear'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed', 'dropped'],
    default: 'active'
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
// Index for general enrollments (without member)
EnrollmentsSchema.index(
  { 
    instituteId: 1, 
    departmentId: 1, 
    gradeId: 1, 
    gradeSectionId: 1, 
    gradeSectionBatchId: 1, 
    gradeBatchId: 1,
    academicYearId: 1
  }, 
  { 
    unique: true, 
    name: 'unique_enrollment_per_combination',
    partialFilterExpression: { archive: { $ne: true }, memberId: { $exists: false } }
  }
);

// Index for member-specific enrollments
EnrollmentsSchema.index(
  { 
    memberId: 1,
    instituteId: 1, 
    departmentId: 1, 
    gradeId: 1, 
    gradeSectionId: 1, 
    gradeSectionBatchId: 1, 
    gradeBatchId: 1,
    academicYearId: 1
  }, 
  { 
    unique: true, 
    name: 'unique_member_enrollment_per_combination',
    partialFilterExpression: { archive: { $ne: true }, memberId: { $exists: true } }
  }
);

// Pre-save middleware to auto-populate memberType and validate uniqueness
EnrollmentsSchema.pre('save', async function(next) {
  // Auto-populate memberType from memberId if memberId is provided but memberType is not
  if (this.memberId && !this.memberType) {
    try {
      const MembersData = this.constructor.db.model('MembersData');
      const member = await MembersData.findOne({ _id: this.memberId }, { memberType: 1 });
      if (member && member.memberType) {
        this.memberType = member.memberType;
      }
    } catch (error) {
      console.error('Error auto-populating memberType:', error);
      // Continue without memberType if lookup fails
    }
  }

  if (this.isNew || this.isModified('instituteId') || this.isModified('departmentId') || 
      this.isModified('gradeId') || this.isModified('gradeSectionId') || 
      this.isModified('gradeSectionBatchId') || this.isModified('gradeBatchId') ||
      this.isModified('academicYearId') || this.isModified('memberId')) {
    
    const Enrollments = this.constructor;
    
    // Build the query for uniqueness check
    const query = {
      instituteId: this.instituteId,
      departmentId: this.departmentId,
      gradeId: this.gradeId,
      academicYearId: this.academicYearId,
      _id: { $ne: this._id },
      archive: { $ne: true }
    };

    // Add optional fields to the query
    if (this.gradeSectionId) query.gradeSectionId = this.gradeSectionId;
    if (this.gradeSectionBatchId) query.gradeSectionBatchId = this.gradeSectionBatchId;
    if (this.gradeBatchId) query.gradeBatchId = this.gradeBatchId;

    // If memberId is provided, include it in the uniqueness check
    if (this.memberId) {
      query.memberId = this.memberId;
    } else {
      // For general enrollments, ensure no memberId exists
      query.memberId = { $exists: false };
    }

    // Check for duplicate enrollment
    const existingEnrollment = await Enrollments.findOne(query);
    
    if (existingEnrollment) {
      const error = new Error(this.memberId ? 
        'Member enrollment already exists for this combination' : 
        'Enrollment already exists for this combination');
      error.code = 'DUPLICATE_ENROLLMENT';
      return next(error);
    }
  }
  next();
});

// Pre-update middleware to auto-populate memberType and validate uniqueness
EnrollmentsSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate();
  const filter = this.getFilter();
  
  // Auto-populate memberType from memberId if memberId is being updated but memberType is not
  if (update.memberId && !update.memberType) {
    try {
      const MembersData = this.model.db.model('MembersData');
      const member = await MembersData.findOne({ _id: update.memberId }, { memberType: 1 });
      if (member && member.memberType) {
        update.memberType = member.memberType;
      }
    } catch (error) {
      console.error('Error auto-populating memberType in update:', error);
      // Continue without memberType if lookup fails
    }
  }
  
  if (update.instituteId || update.departmentId || update.gradeId || 
      update.gradeSectionId || update.gradeSectionBatchId || 
      update.gradeBatchId || update.academicYearId || update.memberId) {
    
    const Enrollments = this.model;
    const doc = await Enrollments.findOne(filter);
    
    if (!doc) return next();
    
    // Build the query for uniqueness check
    const query = {
      instituteId: update.instituteId || doc.instituteId,
      departmentId: update.departmentId || doc.departmentId,
      gradeId: update.gradeId || doc.gradeId,
      academicYearId: update.academicYearId || doc.academicYearId,
      _id: { $ne: doc._id },
      archive: { $ne: true }
    };

    // Add optional fields to the query
    const gradeSectionId = update.gradeSectionId || doc.gradeSectionId;
    const gradeSectionBatchId = update.gradeSectionBatchId || doc.gradeSectionBatchId;
    const gradeBatchId = update.gradeBatchId || doc.gradeBatchId;
    const memberId = update.memberId || doc.memberId;

    if (gradeSectionId) query.gradeSectionId = gradeSectionId;
    if (gradeSectionBatchId) query.gradeSectionBatchId = gradeSectionBatchId;
    if (gradeBatchId) query.gradeBatchId = gradeBatchId;

    // If memberId is provided, include it in the uniqueness check
    if (memberId) {
      query.memberId = memberId;
    } else {
      // For general enrollments, ensure no memberId exists
      query.memberId = { $exists: false };
    }

    // Check for duplicate enrollment
    const existingEnrollment = await Enrollments.findOne(query);
    
    if (existingEnrollment) {
      const error = new Error(memberId ? 
        'Member enrollment already exists for this combination' : 
        'Enrollment already exists for this combination');
      error.code = 'DUPLICATE_ENROLLMENT';
      return next(error);
    }
  }
  next();
});

const createEnrollmentsInInstituteModel = (connection) => {
  return connection.model('Enrollments', EnrollmentsSchema);
};

module.exports = createEnrollmentsInInstituteModel;
