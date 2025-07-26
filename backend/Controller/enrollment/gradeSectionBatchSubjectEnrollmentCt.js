const createGradeSectionBatchSubjectEnrollmentModel = require('../../Model/enrollment/gradeSectionBatchSubjectEnrollmentMd');
const { handleCRUD } = require('../../Utilities/crudUtils');
const { ObjectId } = require('mongoose').Types;

exports.getGradeSectionBatchSubjectEnrollments = async (req, res) => {
  const GradeSectionBatchSubjectEnrollment = createGradeSectionBatchSubjectEnrollmentModel(req.collegeDB);
  const MembersData = require('../../Model/membersModule/memberDataMd')(req.collegeDB);
  // Reuse lookups from memberDataCt.js
  const { instituteLookup } = require('../../Utilities/aggregations/instituteDataLookups');
  const { gradesLookup } = require('../../Utilities/aggregations/gradesLookups');
  const { academicYearLookup } = require('../../Utilities/aggregations/academicYearLookups');
  const { ObjectId } = require('mongoose').Types;
  const { instituteId, academicYearId, gradeId, gradeSectionId, gradeSectionBatchId, gradeSubjectId } = req.query;
  try {
    // Build filter from query params
    const match = {};
    if (instituteId) match.instituteId = new ObjectId(instituteId);
    if (academicYearId) match.academicYearId = new ObjectId(academicYearId);
    if (gradeId) match.gradeId = new ObjectId(gradeId);
    if (gradeSectionId) match.gradeSectionId = new ObjectId(gradeSectionId);
    if (gradeSectionBatchId) match.gradeSectionBatchId = new ObjectId(gradeSectionBatchId);
    if (gradeSubjectId) match.gradeSubjectId = new ObjectId(gradeSubjectId);

    // If memberInfo=true, return only member data for enrolled students or staff
    if (req.query.memberInfo === 'true' && req.query.memberType) {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const memberType = req.query.memberType;
      // Find enrollments matching filter
      const enrollments = await GradeSectionBatchSubjectEnrollment.find(match);
      let memberIds = [];
      enrollments.forEach(enr => {
        if (memberType === 'student' && Array.isArray(enr.enrolledStudents))
          memberIds.push(...enr.enrolledStudents);
        if (memberType === 'staff' && Array.isArray(enr.enrolledStaff))
          memberIds.push(...enr.enrolledStaff);
      });
      memberIds = [...new Set(memberIds.map(id => id.toString()))];
      // Pagination
      const pagedIds = memberIds.slice((page - 1) * limit, page * limit);
      const members = await MembersData.find({ _id: { $in: pagedIds } }, { _id: 1, memberId: 1, fullName: 1 });
      res.status(200).json({
        count: members.length,
        total: memberIds.length,
        page,
        limit,
        data: members
      });
      return;
    }

    // Always return enriched aggregation response
    const { subjectsLookup } = require('../../Utilities/aggregations/subjectsLookups');
    let lookups = [
      ...instituteLookup(),
      ...academicYearLookup(),
      ...gradesLookup(),
      ...subjectsLookup('gradeSubjectId')
    ];
    let pipeline = [
      { $match: match },
      ...lookups,
      {
        $project: {
          _id: 1,
          instituteId: 1,
          academicYearId: 1,
          gradeId: 1,
          gradeSectionId: 1,
          gradeSectionBatchId: 1,
          gradeSubjectId: 1,
          'instituteDetails.instituteName': 1,
          academicYear: 1,
          'gradesDetails.gradeDescription': 1,
          'subjectDetails.subject': 1,
          'subjectDetails.subjectCode': 1,
          studentCount: { $size: { $ifNull: ['$enrolledStudents', []] } },
          staffCount: { $size: { $ifNull: ['$enrolledStaff', []] } }
        }
      }
    ];
    const enrollments = await GradeSectionBatchSubjectEnrollment.aggregate(pipeline);
    res.status(200).json({ enrollments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createGradeSectionBatchSubjectEnrollment = async (req, res) => {
  const GradeSectionBatchSubjectEnrollment = createGradeSectionBatchSubjectEnrollmentModel(req.collegeDB);
  try {
    const newDoc = await handleCRUD(GradeSectionBatchSubjectEnrollment, 'create', {}, req.body);
    res.status(200).json({ message: 'Enrollment added successfully', newDoc });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateGradeSectionBatchSubjectEnrollment = async (req, res) => {
  const GradeSectionBatchSubjectEnrollment = createGradeSectionBatchSubjectEnrollmentModel(req.collegeDB);
  const { instituteId, academicYearId, gradeId, gradeSectionId, gradeSectionBatchId, gradeSubjectId, memberType } = req.query;
  const { updatedData } = req.body;

  if (!instituteId || !academicYearId || !gradeId || !gradeSectionId || !gradeSectionBatchId || !gradeSubjectId || !memberType || !Array.isArray(updatedData)) {
    return res.status(400).json({ message: 'Missing required query or body parameters.' });
  }



  // Build query for unique document
  const filter = { instituteId, academicYearId, gradeId, gradeSectionId, gradeSectionBatchId, gradeSubjectId };
  let arrayField;
  if (memberType === 'student') {
    arrayField = 'enrolledStudents';
  } else if (memberType === 'staff') {
    arrayField = 'enrolledStaff';
  }
  try {
    // Check for duplicate documents with same filter
    const duplicates = await GradeSectionBatchSubjectEnrollment.find(filter);
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
    // Upsert and get the upserted document's _id
    const result = await GradeSectionBatchSubjectEnrollment.updateOne(filter, update, { upsert: true });
    // Find the upserted document (either existing or newly created)
    const upsertedDoc = await GradeSectionBatchSubjectEnrollment.findOne(filter);
    const gradeSectionBatchSubjectId = upsertedDoc ? upsertedDoc._id : null;

    // Update gradeSectionBatchSubjectId array for each member
    const MembersData = require('../../Model/membersModule/memberDataMd')(req.collegeDB);
    let updateResults = [];
    for (const memberId of idsToAdd) {
      try {
        await MembersData.updateOne(
          { _id: memberId },
          { $addToSet: { gradeSectionBatchSubjectId: gradeSectionBatchSubjectId } }
        );
        updateResults.push({ memberId, updated: true });
      } catch (err) {
        updateResults.push({ memberId, updated: false, error: err.message });
      }
    }
    res.status(200).json({ message: 'Enrollment updated successfully', added: idsToAdd, memberUpdates: updateResults, gradeSectionBatchSubjectId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteGradeSectionBatchSubjectEnrollment = async (req, res) => {
  const GradeSectionBatchSubjectEnrollment = createGradeSectionBatchSubjectEnrollmentModel(req.collegeDB);
  const { ids } = req.body;
  const {instituteId,academicYearId ,gradeId ,gradeSectionId,gradeSectionBatchId,gradeSubjectId,memberType} = req.query;
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ message: 'Enrollment ID(s) required' });
  }
  try {
    const result = await handleCRUD(GradeSectionBatchSubjectEnrollment, 'delete', { _id: { $in: ids } });
    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Enrollment(s) deleted successfully', deletedCount: result.deletedCount });
    } else {
      res.status(404).json({ message: 'No matching enrollments found for deletion' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
