const createGradeBatchSubjectEnrollmentModel = require('../../Model/enrollment/gradeBatchSubjectEnrollmentMd');
const { handleCRUD } = require('../../Utilities/crudUtils');
const { ObjectId } = require('mongoose').Types;

exports.getGradeBatchSubjectEnrollments = async (req, res) => {
  const GradeBatchSubjectEnrollment = createGradeBatchSubjectEnrollmentModel(req.collegeDB);
  const MembersData = require('../../Model/membersModule/memberDataMd')(req.collegeDB);
  // Reuse lookups from memberDataCt.js
  const { instituteLookup } = require('../../Utilities/aggregations/instituteDataLookups');
  const { gradesLookup } = require('../../Utilities/aggregations/gradesLookups');
  const { gradeBatchesLookup } = require('../../Utilities/aggregations/gradesBatchesLookups');
  const { academicYearLookup } = require('../../Utilities/aggregations/academicYearLookups');
  const { ObjectId } = require('mongoose').Types;
  const { instituteId, academicYearId, gradeId, gradeBatchId, gradeSubjectId } = req.query;
  try {
    // Build filter from query params
    const match = {};
    if (instituteId) match.instituteId = new ObjectId(instituteId);
    if (academicYearId) match.academicYearId = new ObjectId(academicYearId);
    if (gradeId) match.gradeId = new ObjectId(gradeId);
    if (gradeBatchId) match.gradeBatchId = new ObjectId(gradeBatchId);
    if (gradeSubjectId) match.gradeSubjectId = new ObjectId(gradeSubjectId);

    // If memberInfo=true, return only member data for enrolled students or staff
    if (req.query.memberInfo === 'true' && req.query.memberType) {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const memberType = req.query.memberType;
      // Find enrollments matching filter
      const enrollments = await GradeBatchSubjectEnrollment.find(match);
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
      ...gradeBatchesLookup(),
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
          gradeBatchId: 1,
          gradeSubjectId: 1,
          'instituteDetails.instituteName': 1,
          academicYear: 1,
          'gradesDetails.gradeDescription': 1,
          'gradeBatchesDetails.batch': 1,
          'subjectDetails.subject': 1,
          'subjectDetails.subjectCode': 1,
          studentCount: { $size: { $ifNull: ['$enrolledStudents', []] } },
          staffCount: { $size: { $ifNull: ['$enrolledStaff', []] } }
        }
      }
    ];
    const enrollments = await GradeBatchSubjectEnrollment.aggregate(pipeline);
    res.status(200).json({ enrollments });
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
  const { instituteId, academicYearId, gradeId, gradeBatchId, gradeSubjectId, memberType } = req.query;
  const { updatedData } = req.body;

  if (!instituteId || !academicYearId || !gradeId || !gradeBatchId || !gradeSubjectId || !memberType || !Array.isArray(updatedData)) {
    return res.status(400).json({ message: 'Missing required query or body parameters.' });
  }
  if (updatedData.length > 100) {
    return res.status(400).json({ message: 'Maximum 100 memberIds allowed per request.' });
  }

  // Build query for unique document
  const filter = { instituteId, academicYearId, gradeId, gradeBatchId, gradeSubjectId };
  let arrayField;
  if (memberType === 'student') {
    arrayField = 'enrolledStudents';
  } else if (memberType === 'staff') {
    arrayField = 'enrolledStaff';
  }
  const session = await GradeBatchSubjectEnrollment.db.startSession();
  session.startTransaction();
  try {
    // Check for duplicate documents with same filter
    const duplicates = await GradeBatchSubjectEnrollment.find(filter).session(session);
    if (duplicates.length > 1) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Duplicate enrollment documents found for this combination. Please resolve duplicates.' });
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
      await session.commitTransaction();
      session.endSession();
      return res.status(200).json({ message: 'No updates were made (all memberIds already present)' });
    }
    const update = { $addToSet: { [arrayField]: { $each: idsToAdd } } };
    await GradeBatchSubjectEnrollment.updateOne(filter, update, { upsert: true, session });

    // Find the upserted document (either existing or newly created)
    const upsertedDoc = await GradeBatchSubjectEnrollment.findOne(filter).session(session);
    const gradeBatchSubjectId = upsertedDoc ? upsertedDoc._id : null;

    // Update gradeBatchSubjectId array for each member
    const MembersData = require('../../Model/membersModule/memberDataMd')(req.collegeDB);
    let updateResults = [];
    let memberUpdateError = false;
    for (const memberId of idsToAdd) {
      try {
        await MembersData.updateOne(
          { _id: memberId },
          { $addToSet: { gradeBatchSubjectId: gradeBatchSubjectId } },
          { session }
        );
        updateResults.push({ memberId, updated: true });
      } catch (err) {
        updateResults.push({ memberId, updated: false, error: err.message });
        memberUpdateError = true;
      }
    }
    if (memberUpdateError) {
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({ message: 'Rollback: Error updating member data', memberUpdates: updateResults });
    }
    await session.commitTransaction();
    session.endSession();
    res.status(200).json({ message: 'Enrollment updated successfully', added: idsToAdd, memberUpdates: updateResults, gradeBatchSubjectId });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: 'Rollback: Server error', error: error.message });
  }
};

exports.deleteGradeBatchSubjectEnrollment = async (req, res) => {
  const GradeBatchSubjectEnrollment = createGradeBatchSubjectEnrollmentModel(req.collegeDB);
  const { instituteId, academicYearId, gradeId, gradeBatchId, gradeSubjectId, memberType } = req.query;
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ message: 'Array of member IDs required in body as "ids"' });
  }
  if (!memberType || (memberType !== 'student' && memberType !== 'staff')) {
    return res.status(400).json({ message: 'memberType must be "student" or "staff"' });
  }
  try {
    // Find the enrollment document
    const filter = { instituteId, academicYearId, gradeId, gradeBatchId, gradeSubjectId };
    let arrayField = memberType === 'student' ? 'enrolledStudents' : 'enrolledStaff';
    // Remove member IDs from the array
    const update = { $pull: { [arrayField]: { $in: ids } } };
    const result = await GradeBatchSubjectEnrollment.updateOne(filter, update);
    if (result.modifiedCount > 0) {
      res.status(200).json({ message: `Member(s) removed from ${arrayField} array`, removed: ids });
    } else {
      res.status(404).json({ message: 'No matching enrollment found or no members removed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
exports.validateGradeBatchSubjectEnrollment = async (req, res) => {
  const GradeBatchSubjectEnrollment = createGradeBatchSubjectEnrollmentModel(req.collegeDB);
  const MembersData = require('../../Model/membersModule/memberDataMd')(req.collegeDB);
  const { instituteId, academicYearId, gradeId, gradeBatchId, gradeSubjectId, memberType } = req.query;
  const { ids } = req.body; // ids = array of memberId (not _id)
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ error: 'Array of memberIds required in body as "ids"' });
  }
  if (ids.length > 100) {
    return res.status(400).json({ error: 'Maximum 100 memberIds allowed per request.' });
  }
  if (!memberType || (memberType !== 'student' && memberType !== 'staff')) {
    return res.status(400).json({ error: 'memberType must be "student" or "staff"' });
  }
  try {
    const filter = { instituteId, academicYearId, gradeId, gradeBatchId, gradeSubjectId };
    let arrayField = memberType === 'student' ? 'enrolledStudents' : 'enrolledStaff';
    const enrollmentDoc = await GradeBatchSubjectEnrollment.findOne(filter);
    // Find members by memberId
    const members = await MembersData.find({ memberId: { $in: ids } }, { _id: 1, memberId: 1, fullName: 1, gradeBatchSubjectId: 1 });
    const memberMap = new Map();
    members.forEach(m => memberMap.set(m.memberId, m));
        let invalidCounter = 1;

    let response = ids.map(memberId => {
      const member = memberMap.get(memberId);
      if (!member) {
        return { _id: `invalid${invalidCounter++}`, memberId, description: 'Member Not Found' };
      }
      // Check if enrolled under current gradeBatchSubject
      let enrolled = enrollmentDoc && Array.isArray(enrollmentDoc[arrayField]) && enrollmentDoc[arrayField].map(x => x.toString()).includes(member._id.toString());
      if (enrolled) {
        return { _id: member._id, memberId: member.memberId, fullName: member.fullName, description: 'Already enrolled' };
      }
      // Check if member is enrolled under any gradeBatchSubject
      if (Array.isArray(member.gradeBatchSubjectId)) {
        if (member.gradeBatchSubjectId.map(x => x.toString()).includes(gradeBatchSubjectId)) {
          return { _id: member._id, memberId: member.memberId, fullName: member.fullName, description: 'Already enrolled' };
        } else if (member.gradeBatchSubjectId.length > 0) {
          return { _id: member._id, memberId: member.memberId, fullName: member.fullName, description: `Not Enrolled Under Current GradeBatchSubject` };
        }
      } else if (member.gradeBatchSubjectId && member.gradeBatchSubjectId.toString() === gradeBatchSubjectId) {
        return { _id: member._id, memberId: member.memberId, fullName: member.fullName, description: 'Already enrolled' };
      } else if (member.gradeBatchSubjectId) {
        return { _id: member._id, memberId: member.memberId, fullName: member.fullName, description: `Not Enrolled Under Current GradeBatchSubject` };
      }
      // Valid for enrollment
      return { _id: member._id, memberId: member.memberId, fullName: member.fullName, description: 'valid' };
    });
    res.status(200).json({ results: response });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};