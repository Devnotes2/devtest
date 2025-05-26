// membersDataCt.js (Controller for handling member data)
const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const createMembersDataModel = require('../../Model/membersModule/membersDataMd');
const { handleCRUD } = require('../../Utilities/crudUtils');
const buildGenericAggregation = require('../../Utilities/genericAggregatorUtils');
const addPaginationAndSort = require('../../Utilities/paginationControllsUtils');
const { generalDataLookup } = require('../../Utilities/aggregations/generalDataLookups');
const { instituteLookup } = require('../../Utilities/aggregations/instituteDataLookups');

exports.getMembersData = async (req, res) => {
  const MembersData = createMembersDataModel(req.collegeDB);
  const { ids, aggregate, page, limit, ...filters } = req.query;
  try {
    const matchConditions = {};
    if (filters.instituteId) matchConditions.instituteId = new ObjectId(filters.instituteId);
    if (filters.gradeId) matchConditions.gradeId = new ObjectId(filters.gradeId);
    if (filters.memberType) matchConditions.memberType = new ObjectId(filters.memberType);
    if (filters.gender) matchConditions.gender = new ObjectId(filters.gender);
    if (filters.bloodGroup) matchConditions.bloodGroup = new ObjectId(filters.bloodGroup);
    if (filters.department) matchConditions.department = new ObjectId(filters.department);
    if (filters.email) matchConditions.email = filters.email;

    // Total docs in the collection (not just filtered)
    const totalDocs = await MembersData.countDocuments();

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
        ...generalDataLookup('grade', 'gradeId', 'gradeDetails', 'gradeName'),
        {
          $project: {
            firstName: 1,
            middleName: 1,
            lastName: 1,
            memberId: 1,
            memberType: '$memberTypeDetails.memberTypeValue',
            instituteName: '$instituteDetails.instituteName',
            grade: '$gradeDetails.gradeName',
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
        ...generalDataLookup('grade', 'gradeId', 'gradeDetails', 'gradeName')
      ];
      let pipeline = buildGenericAggregation({ filters: matchConditions, lookups });
      pipeline.push({
        $project: {
          firstName: 1,
          middleName: 1,
          lastName: 1,
          memberId: 1,
          memberType: '$memberTypeDetails.memberTypeValue',
          instituteName: '$instituteDetails.instituteName',
          grade: '$gradeDetails.gradeName',
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
        sort: { createdAt: -1 }
      });
      const data = await MembersData.aggregate(pipeline);
      return res.status(200).json({ count: data.length, totalDocs, data });
    }

    // Non-aggregate fetch (simple find)
    const members = await MembersData.find(matchConditions);
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