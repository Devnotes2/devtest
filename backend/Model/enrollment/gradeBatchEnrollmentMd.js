const mongoose = require('mongoose');
const { Schema } = mongoose;

const gradeBatchEnrollmentSchema = new Schema({
  instituteId: { type: Schema.Types.ObjectId, ref: 'Institute', required: true },
  academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  gradeId: { type: Schema.Types.ObjectId, ref: 'Grade', required: true },
  gradeBatchId: { type: Schema.Types.ObjectId, ref: 'GradeBatch', required: true },
  enrolledStudents: [{ type: Schema.Types.ObjectId, ref: 'Member' }],
  enrolledStaff: [{ type: Schema.Types.ObjectId, ref: 'Member' }],
}, { timestamps: true });

module.exports = connection => connection.model('GradeBatchEnrollment', gradeBatchEnrollmentSchema);
