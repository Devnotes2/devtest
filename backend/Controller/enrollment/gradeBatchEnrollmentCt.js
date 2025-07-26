const createGradeBatchEnrollmentModel = require('../../Model/enrollment/gradeBatchEnrollmentMd');
const { handleCRUD } = require('../../Utilities/crudUtils');
const { ObjectId } = require('mongoose').Types;

exports.getGradeBatchEnrollments = async (req, res) => {
  const GradeBatchEnrollment = createGradeBatchEnrollmentModel(req.collegeDB);
  const {instituteId,academicYearId,gradeId,gradeBatchId,memberType} = req.query;
  try {
    if (id) {
      const enrollment = await handleCRUD(GradeBatchEnrollment, 'findOne', { _id: new ObjectId(id) });
      if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
      return res.json(enrollment);
    } else {
      const enrollments = await handleCRUD(GradeBatchEnrollment, 'find', {});
      return res.json(enrollments);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createGradeBatchEnrollment = async (req, res) => {
  const GradeBatchEnrollment = createGradeBatchEnrollmentModel(req.collegeDB);
  try {
    const newDoc = await handleCRUD(GradeBatchEnrollment, 'create', {}, req.body);
    res.status(200).json({ message: 'Enrollment added successfully', newDoc });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateGradeBatchEnrollment = async (req, res) => {
  const GradeBatchEnrollment = createGradeBatchEnrollmentModel(req.collegeDB);
  const { instituteId, academicYearId, gradeId, gradeBatchId, memberType } = req.query;
  const { updatedData } = req.body;

  if (!instituteId || !academicYearId || !gradeId || !gradeBatchId || !memberType || !Array.isArray(updatedData)) {
    return res.status(400).json({ message: 'Missing required query or body parameters.' });
  }

  // Build query for unique document
  const filter = { instituteId, academicYearId, gradeId, gradeBatchId };
  let arrayField;
  if (memberType === 'student') {
    arrayField = 'enrolledStudents';
  } else if (memberType === 'staff') {
    arrayField = 'enrolledStaff';}
  try {
    // Check for duplicate documents with same filter
    const duplicates = await GradeBatchEnrollment.find(filter);
    if (duplicates.length > 1) {
      return res.status(409).json({ message: 'Duplicate enrollment documents found for this combination. Please resolve duplicates.' });
    }
    let doc = duplicates[0];
    let newIds = updatedData.map(id => id.toString());
    let idsToAdd = newIds;
    if (doc) {
      // Only add memberIds not already present
      const existingIds = (doc[arrayField] || []).map(id => id.toString());
      idsToAdd = newIds.filter(id => !existingIds.includes(id));
    }
    if (idsToAdd.length === 0) {
      return res.status(200).json({ message: 'No updates were made (all memberIds already present)' });
    }
    const update = { $addToSet: { [arrayField]: { $each: idsToAdd } } };
    const result = await GradeBatchEnrollment.updateOne(filter, update, { upsert: true });

    // Update gradeBatch field for each member
    const MembersData = require('../../Model/membersModule/memberDataMd')(req.collegeDB);
    let updateResults = [];
    for (const memberId of idsToAdd) {
      try {
        await MembersData.updateOne(
          { _id: memberId },
          { $set: { gradeBatchId: gradeBatchId } }
        );
        updateResults.push({ memberId, updated: true });
      } catch (err) {
        updateResults.push({ memberId, updated: false, error: err.message });
      }
    }
    res.status(200).json({ message: 'Enrollment updated successfully', added: idsToAdd, memberUpdates: updateResults });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteGradeBatchEnrollment = async (req, res) => {
  const GradeBatchEnrollment = createGradeBatchEnrollmentModel(req.collegeDB);
  const { instituteId,academicYearId,gradeId,gradeBatchId,memberType} = req.query;
  const {ids} =req.body;
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ message: 'Enrollment ID(s) required' });
  }
  try {

    const result = await handleCRUD(GradeBatchEnrollment, 'delete', { _id: { $in: ids } });
    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Enrollment(s) deleted successfully', deletedCount: result.deletedCount });
    } else {
      res.status(404).json({ message: 'No matching enrollments found for deletion' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
