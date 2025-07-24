const createGradeBatchSubjectEnrollmentModel = require('../../Model/enrollment/gradeBatchSubjectEnrollmentMd');
const { handleCRUD } = require('../../Utilities/crudUtils');
const { ObjectId } = require('mongoose').Types;

exports.getGradeBatchSubjectEnrollments = async (req, res) => {
  const GradeBatchSubjectEnrollment = createGradeBatchSubjectEnrollmentModel(req.collegeDB);
  const { instituteId,academicYearId ,gradeId ,gradeBatchId,gradeSubjectId ,memberType} = req.query;
  try {
    if (id) {
      const enrollment = await handleCRUD(GradeBatchSubjectEnrollment, 'findOne', { _id: new ObjectId(id) });
      if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
      return res.json(enrollment);
    } else {
      const enrollments = await handleCRUD(GradeBatchSubjectEnrollment, 'find', {});
      return res.json(enrollments);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createGradeBatchSubjectEnrollment = async (req, res) => {
  const GradeBatchSubjectEnrollment = createGradeBatchSubjectEnrollmentModel(req.collegeDB);
  try {
    const newDoc = await handleCRUD(GradeBatchSubjectEnrollment, 'create', {}, req.body);
    res.status(200).json({ message: 'Enrollment added successfully', newDoc });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateGradeBatchSubjectEnrollment = async (req, res) => {
  const GradeBatchSubjectEnrollment = createGradeBatchSubjectEnrollmentModel(req.collegeDB);
  const {instituteId,academicYearId ,gradeId ,gradeBatchId,gradeSubjectId,memberType } = req.query;
  const { id, updatedData } = req.body;
  try {
    const result = await handleCRUD(GradeBatchSubjectEnrollment, 'update', { _id: id }, { $set: updatedData });
    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'Enrollment updated successfully' });
    } else if (result.matchedCount > 0 && result.modifiedCount === 0) {
      res.status(200).json({ message: 'No updates were made' });
    } else {
      res.status(404).json({ message: 'Enrollment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteGradeBatchSubjectEnrollment = async (req, res) => {
  const GradeBatchSubjectEnrollment = createGradeBatchSubjectEnrollmentModel(req.collegeDB);
  const {instituteId,academicYearId ,gradeId ,gradeBatchId,gradeSubjectId,memberType} = req.query;
  const {ids}=req.body;
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ message: 'Enrollment ID(s) required' });
  }
  try {
    const result = await handleCRUD(GradeBatchSubjectEnrollment, 'delete', { _id: { $in: ids } });
    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Enrollment(s) deleted successfully', deletedCount: result.deletedCount });
    } else {
      res.status(404).json({ message: 'No matching enrollments found for deletion' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
