const mongoose = require('mongoose');
const { Schema } = mongoose;

const gradeSectionSubjectEnrollmentSchema = new Schema({
  instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
  academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  gradeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Grade', required: true },
  gradeSectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'GradeSection', required: true },
  gradeSubjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
  enrolledStaff: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
}, { timestamps: true });

module.exports = connection => connection.model('GradeSectionSubjectEnrollment', gradeSectionSubjectEnrollmentSchema);
