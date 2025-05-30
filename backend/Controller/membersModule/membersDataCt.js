// membersDataCt.js (Controller for handling member data)
const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const createMembersDataModel = require('../../Model/membersModule/membersDataMd');
const { handleCRUD } = require('../../Utilities/crudUtils');
const buildGenericAggregation = require('../../Utilities/genericAggregatorUtils');
const addPaginationAndSort = require('../../Utilities/paginationControllsUtils');
const { generalDataLookup } = require('../../Utilities/aggregations/generalDataLookups');
const { instituteLookup } = require('../../Utilities/aggregations/instituteDataLookups');
const { gradesLookup } = require('../../Utilities/aggregations/gradesLookups');
const { gradeBatchesLookup } = require('../../Utilities/aggregations/gradesBatchesLookups');
const { gradeSectionLookup } = require('../../Utilities/aggregations/gradesSectionLookups');
const { gradeSectionBatchesLookup } = require('../../Utilities/aggregations/gradesSectionBatchesLookups');
const { buildMatchConditions, buildSortObject, validateUniqueField } = require('../../Utilities/filterSortUtils');

exports.getMembersData = async (req, res) => {
  const MembersData = createMembersDataModel(req.collegeDB);
  const { ids, aggregate, page, limit, validate, memberId } = req.query;
  try {
    // Use utility for filtering
    const matchConditions = buildMatchConditions(req.query);

    // Validation: Check if memberId already exists (reusable utility)
    if (validate === 'true' && memberId) {
      const exists = await validateUniqueField(MembersData, 'memberId', memberId);
      return res.status(200).json({ message: exists ? 'already present' : 'not present', exists });
    }

    // Total docs in the collection (not just filtered)
    const totalDocs = await MembersData.countDocuments();

    // Use utility for sorting
    const sortObj = buildSortObject(req.query);

    if (ids && Array.isArray(ids)) {
      const objectIds = ids.map(id => new ObjectId(id));
      if (aggregate === 'false') {
        const matchingData = await handleCRUD(MembersData, 'find', { _id: { $in: objectIds }, ...matchConditions });
        return res.status(200).json({ count: matchingData.length, totalDocs, data: matchingData });
      }
      const pipeline = [
        { $match: { _id: { $in: objectIds }, ...matchConditions } },
        ...instituteLookup(),
        ...generalDataLookup('bloodGroup', 'bloodGroup', 'bloodGroupDetails', 'bloodGroupValue'),
        ...generalDataLookup('gender', 'gender', 'genderDetails', 'genderValue'),
        ...generalDataLookup('memberType', 'memberType', 'memberTypeDetails', 'memberTypeValue'),
        ...generalDataLookup('department', 'department', 'departmentDetails', 'departmentName'),
        ...gradesLookup(),
        ...gradeBatchesLookup(),
        ...gradeSectionLookup(),
        ...gradeSectionBatchesLookup(),
        { $sort: sortObj },
        {
          $project: {
            firstName: 1,
            middleName: 1,
            lastName: 1,
            memberId: 1,
            memberType: '$memberTypeDetails.memberTypeValue',
            instituteName: '$instituteDetails.instituteName',
            grade: '$gradesDetails.gradeCode',
            batch: '$gradeBatchesDetails.batch',
            section: '$gradeSectionDetails.section',
            gradeSectionBatch: '$gradeSectionBatchDetails.gradeSectionBatch',
            department: '$departmentDetails.departmentName',
            gender: '$genderDetails.genderValue',
            bloodGroup: '$bloodGroupDetails.bloodGroupValue',
            DOB: 1,
            createdDate: 1,
            expiryDate: 1,
            email: 1,
            mobileNo1: 1,
            mobileNo2: 1,
            image: 1,
            fatherName: 1,
            motherName: 1,
            guardian: 1,
            parentGuardianNo: 1,
            parentGuardianEmail: 1,
            parentGuardianOccupation: 1,
            tempAddress: 1,
            permAddress: 1,
            createdAt: 1,
            updatedAt: 1
          }
        }
      ];
      const data = await MembersData.aggregate(pipeline);
      return res.status(200).json({ count: data.length, totalDocs, data });
    }

    if (aggregate === 'true') {
      const lookups = [
        ...instituteLookup(),
        ...generalDataLookup('bloodGroup', 'bloodGroup', 'bloodGroupDetails', 'bloodGroupValue'),
        ...generalDataLookup('gender', 'gender', 'genderDetails', 'genderValue'),
        ...generalDataLookup('memberType', 'memberType', 'memberTypeDetails', 'memberTypeValue'),
        ...generalDataLookup('department', 'department', 'departmentDetails', 'departmentName'),
        ...gradesLookup(),
        ...gradeBatchesLookup(),
        ...gradeSectionLookup(),
        ...gradeSectionBatchesLookup(),
      ];
      let pipeline = buildGenericAggregation({ filters: matchConditions, lookups });
      pipeline.push({ $sort: sortObj });
      pipeline.push({
        $project: {
          firstName: 1,
          middleName: 1,
          lastName: 1,
          memberId: 1,
          memberType: '$memberTypeDetails.memberTypeValue',
          instituteName: '$instituteDetails.instituteName',
          grade: '$gradesDetails.gradeCode',
          batch: '$gradeBatchesDetails.batch',
          section: '$gradeSectionDetails.section',
          gradeSectionBatch: '$gradeSectionBatchDetails.gradeSectionBatch',
          department: '$departmentDetails.departmentName',
          gender: '$genderDetails.genderValue',
          bloodGroup: '$bloodGroupDetails.bloodGroupValue',
          DOB: 1,
          createdDate: 1,
          expiryDate: 1,
          email: 1,
          mobileNo1: 1,
          mobileNo2: 1,
          image: 1,
          fatherName: 1,
          motherName: 1,
          guardian: 1,
          parentGuardianNo: 1,
          parentGuardianEmail: 1,
          parentGuardianOccupation: 1,
          tempAddress: 1,
          permAddress: 1,
          createdAt: 1,
          updatedAt: 1
        }
      });
      addPaginationAndSort(pipeline, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        sort: sortObj
      });
      const data = await MembersData.aggregate(pipeline);
      return res.status(200).json({ count: data.length, totalDocs, data });
    }

    // Non-aggregate fetch (simple find)
    let query = MembersData.find(matchConditions);
    if (sortObj) {
      query = query.sort(sortObj);
    }
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
    const members = await query;
    return res.status(200).json({ count: members.length, totalDocs, data: members });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createMember = async (req, res) => {
  const MembersData = createMembersDataModel(req.collegeDB);
  try {
    const newMember = await handleCRUD(MembersData, 'create', {}, req.body);
    res.status(200).json({
      message: 'Member created successfully!',
      data: newMember
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create member', details: error.message });
  }
};

exports.updateMember = async (req, res) => {
  const MembersData = createMembersDataModel(req.collegeDB);
  const { _id, updatedData } = req.body;
  try {
    const result = await handleCRUD(MembersData, 'update', { _id }, { $set: updatedData });
    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'Member updated successfully' });
    } else if (result.matchedCount > 0 && result.modifiedCount === 0) {
      res.status(200).json({ message: 'No updates were made' });
    } else {
      res.status(404).json({ message: 'No matching member found or values are unchanged' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update member', details: error.message });
  }
};

exports.deleteMembers = async (req, res) => {
  const MembersData = createMembersDataModel(req.collegeDB);
  const { ids } = req.body;
  try {
    const result = await handleCRUD(MembersData, 'delete', { _id: { $in: ids.map(id => id) } });
    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Members deleted successfully' });
    } else {
      res.status(404).json({ message: 'No matching members found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete members', details: error.message });
  }
};