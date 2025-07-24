const mongoose = require('mongoose');
const { Schema } = mongoose;

const gradeSubjectEnrollmentSchema = new Schema({
  instituteId: { type: Schema.Types.ObjectId, ref: 'Institute', required: true },
  academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  gradeId: { type: Schema.Types.ObjectId, ref: 'Grade', required: true },
  gradeSubjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  enrolledStudents: [{ type: Schema.Types.ObjectId, ref: 'Member' }],
  enrolledStaff: [{ type: Schema.Types.ObjectId, ref: 'Member' }],
}, { timestamps: true });

module.exports = connection => connection.model('GradeSubjectEnrollment', gradeSubjectEnrollmentSchema);
