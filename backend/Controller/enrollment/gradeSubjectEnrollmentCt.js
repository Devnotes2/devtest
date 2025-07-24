const createGradeSubjectEnrollmentModel = require('../../Model/enrollment/gradeSubjectEnrollmentMd');
const { handleCRUD } = require('../../Utilities/crudUtils');
const { ObjectId } = require('mongoose').Types;

exports.getGradeSubjectEnrollments = async (req, res) => {
  const GradeSubjectEnrollment = createGradeSubjectEnrollmentModel(req.collegeDB);
  const { instituteId,academicYearId ,gradeId ,gradeSubjectId ,memberType} = req.query;
  try {
    if (id) {
      const enrollment = await handleCRUD(GradeSubjectEnrollment, 'findOne', { _id: new ObjectId(id) });
      if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
      return res.json(enrollment);
    } else {
      const enrollments = await handleCRUD(GradeSubjectEnrollment, 'find', {});
      return res.json(enrollments);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createGradeSubjectEnrollment = async (req, res) => {
  const GradeSubjectEnrollment = createGradeSubjectEnrollmentModel(req.collegeDB);
  try {
    const newDoc = await handleCRUD(GradeSubjectEnrollment, 'create', {}, req.body);
    res.status(200).json({ message: 'Enrollment added successfully', newDoc });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateGradeSubjectEnrollment = async (req, res) => {
  const GradeSubjectEnrollment = createGradeSubjectEnrollmentModel(req.collegeDB);
  const { id, updatedData } = req.body;
    const { instituteId,academicYearId ,gradeId ,gradeSubjectId ,memberType} = req.query;

  try {
    const result = await handleCRUD(GradeSubjectEnrollment, 'update', { _id: id }, { $set: updatedData });
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

exports.deleteGradeSubjectEnrollment = async (req, res) => {
  const GradeSubjectEnrollment = createGradeSubjectEnrollmentModel(req.collegeDB);
  const { ids } = req.body;
    const { instituteId,academicYearId ,gradeId ,gradeSubjectId,memberType } = req.query;

  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ message: 'Enrollment ID(s) required' });
  }
  try {
    const result = await handleCRUD(GradeSubjectEnrollment, 'delete', { _id: { $in: ids } });
    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Enrollment(s) deleted successfully', deletedCount: result.deletedCount });
    } else {
      res.status(404).json({ message: 'No matching enrollments found for deletion' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
