const createGradeSectionEnrollmentModel = require('../../Model/enrollment/gradeSectionEnrollmentMd');
const { handleCRUD } = require('../../Utilities/crudUtils');
const { ObjectId } = require('mongoose').Types;

exports.getGradeSectionEnrollments = async (req, res) => {
  const GradeSectionEnrollment = createGradeSectionEnrollmentModel(req.collegeDB);
  const MembersData = require('../../Model/membersModule/memberDataMd')(req.collegeDB);
  // Reuse lookups from memberDataCt.js
  const { instituteLookup } = require('../../Utilities/aggregations/instituteDataLookups');
  const { gradesLookup } = require('../../Utilities/aggregations/gradesLookups');
  const { academicYearLookup } = require('../../Utilities/aggregations/academicYearLookups');
  const { ObjectId } = require('mongoose').Types;
  const { instituteId, academicYearId, gradeId, gradeSectionId } = req.query;
  try {
    // Build filter from query params
    const match = {};
    if (instituteId) match.instituteId = new ObjectId(instituteId);
    if (academicYearId) match.academicYearId = new ObjectId(academicYearId);
    if (gradeId) match.gradeId = new ObjectId(gradeId);
    if (gradeSectionId) match.gradeSectionId = new ObjectId(gradeSectionId);

    // If memberInfo=true, return only member data for enrolled students or staff
    if (req.query.memberInfo === 'true' && req.query.memberType) {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const memberType = req.query.memberType;
      // Find enrollments matching filter
      const enrollments = await GradeSectionEnrollment.find(match);
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
    let lookups = [
      ...instituteLookup(),
      ...academicYearLookup(),
      ...gradesLookup()
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
          'instituteDetails.instituteName': 1,
          academicYear: 1,
          'gradesDetails.gradeDescription': 1,
          studentCount: { $size: { $ifNull: ['$enrolledStudents', []] } },
          staffCount: { $size: { $ifNull: ['$enrolledStaff', []] } }
        }
      }
    ];
    const enrollments = await GradeSectionEnrollment.aggregate(pipeline);
    res.status(200).json({ enrollments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createGradeSectionEnrollment = async (req, res) => {
  const GradeSectionEnrollment = createGradeSectionEnrollmentModel(req.collegeDB);
  try {
    const newDoc = await handleCRUD(GradeSectionEnrollment, 'create', {}, req.body);
    res.status(200).json({ message: 'Enrollment added successfully', newDoc });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateGradeSectionEnrollment = async (req, res) => {
  const GradeSectionEnrollment = createGradeSectionEnrollmentModel(req.collegeDB);
  const { instituteId, academicYearId, gradeId, gradeSectionId, memberType } = req.query;
  const { updatedData } = req.body;

  if (!instituteId || !academicYearId || !gradeId || !gradeSectionId || !memberType || !Array.isArray(updatedData)) {
    return res.status(400).json({ message: 'Missing required query or body parameters.' });
  }

  // Build query for unique document
  const filter = { instituteId, academicYearId, gradeId, gradeSectionId };
  let arrayField;
  if (memberType === 'student') {
    arrayField = 'enrolledStudents';
  } else if (memberType === 'staff') {
    arrayField = 'enrolledStaff';
  }
  try {
    // Check for duplicate documents with same filter
    const duplicates = await GradeSectionEnrollment.find(filter);
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
    const result = await GradeSectionEnrollment.updateOne(filter, update, { upsert: true });

    // Update gradeSection field for each member
    const MembersData = require('../../Model/membersModule/memberDataMd')(req.collegeDB);
    let updateResults = [];
    for (const memberId of idsToAdd) {
      try {
        await MembersData.updateOne(
          { _id: memberId },
          { $set: { gradeSectionId: gradeSectionId } }
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
exports.validateGradeSectionEnrollment = async (req, res) => {
  const GradeSectionEnrollment = createGradeSectionEnrollmentModel(req.collegeDB);
  const MembersData = require('../../Model/membersModule/memberDataMd')(req.collegeDB);
  const { instituteId, academicYearId, gradeId, gradeSectionId, memberType } = req.query;
  const { ids } = req.body; // ids = array of memberId (not _id)
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ error: 'Array of memberIds required in body as "ids"' });
  }
  if (!memberType || (memberType !== 'student' && memberType !== 'staff')) {
    return res.status(400).json({ error: 'memberType must be "student" or "staff"' });
  }
  try {
    const filter = { instituteId, academicYearId, gradeId, gradeSectionId };
    let arrayField = memberType === 'student' ? 'enrolledStudents' : 'enrolledStaff';
    const enrollmentDoc = await GradeSectionEnrollment.findOne(filter);
    // Find members by memberId
    const members = await MembersData.find({ memberId: { $in: ids } }, { _id: 1, memberId: 1, fullName: 1, gradeSectionId: 1 });
    const memberMap = new Map();
    members.forEach(m => memberMap.set(m.memberId, m));
    let response = ids.map(memberId => {
      const member = memberMap.get(memberId);
      if (!member) {
        return { memberId, Description: 'Member Not Found' };
      }
      // Check if enrolled under current gradeSection
      let enrolled = enrollmentDoc && Array.isArray(enrollmentDoc[arrayField]) && enrollmentDoc[arrayField].map(x => x.toString()).includes(member._id.toString());
      if (enrolled) {
        return { _id: member._id, memberId: member.memberId, fullName: member.fullName, Description: 'Already enrolled' };
      }
      // Check if member is enrolled under any gradeSection
      if (Array.isArray(member.gradeSectionId)) {
        if (member.gradeSectionId.map(x => x.toString()).includes(gradeSectionId)) {
          return { _id: member._id, memberId: member.memberId, fullName: member.fullName, Description: 'Already enrolled' };
        } else if (member.gradeSectionId.length > 0) {
          return { _id: member._id, memberId: member.memberId, fullName: member.fullName, Description: `Not Enrolled Under Current GradeSection` };
        }
      } else if (member.gradeSectionId && member.gradeSectionId.toString() === gradeSectionId) {
        return { _id: member._id, memberId: member.memberId, fullName: member.fullName, Description: 'Already enrolled' };
      } else if (member.gradeSectionId) {
        return { _id: member._id, memberId: member.memberId, fullName: member.fullName, Description: `Not Enrolled Under Current GradeSection` };
      }
      // Valid for enrollment
      return { _id: member._id, memberId: member.memberId, fullName: member.fullName, Description: 'valid' };
    });
    res.status(200).json({ results: response });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
exports.deleteGradeSectionEnrollment = async (req, res) => {
  const GradeSectionEnrollment = createGradeSectionEnrollmentModel(req.collegeDB);
  const { ids } = req.body;
  const { instituteId, academicYearId, gradeId, gradeSectionId, memberType } = req.query;

  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ message: 'Array of member IDs required in body as "ids"' });
  }
  if (!memberType || (memberType !== 'student' && memberType !== 'staff')) {
    return res.status(400).json({ message: 'memberType must be "student" or "staff"' });
  }
  try {
    // Find the enrollment document
    const filter = { instituteId, academicYearId, gradeId, gradeSectionId };
    let arrayField = memberType === 'student' ? 'enrolledStudents' : 'enrolledStaff';
    // Remove member IDs from the array
    const update = { $pull: { [arrayField]: { $in: ids } } };
    const result = await GradeSectionEnrollment.updateOne(filter, update);
    if (result.modifiedCount > 0) {
      res.status(200).json({ message: `Member(s) removed from ${arrayField} array`, removed: ids });
    } else {
      res.status(404).json({ message: 'No matching enrollment found or no members removed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
