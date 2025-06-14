// studentsDataCt.js (Controller for handling student data)
const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const createStudentsDataModel = require('../../Model/membersModule/studentDataMd');
const { handleCRUD } = require('../../Utilities/crudUtils');
const buildGenericAggregation = require('../../Utilities/genericAggregatorUtils');
const addPaginationAndSort = require('../../Utilities/paginationControllsUtils');
const { generalDataLookup } = require('../../Utilities/aggregations/generalDataLookups');
const { instituteLookup } = require('../../Utilities/aggregations/instituteDataLookups');
const { gradesLookup } = require('../../Utilities/aggregations/gradesLookups');
const { departmentLookup } = require('../../Utilities/aggregations/departmentLookups');
const { gradeBatchesLookup } = require('../../Utilities/aggregations/gradesBatchesLookups');
const { gradeSectionLookup } = require('../../Utilities/aggregations/gradesSectionLookups');
const { gradeSectionBatchesLookup } = require('../../Utilities/aggregations/gradesSectionBatchesLookups');
const { buildMatchConditions, buildSortObject, validateUniqueField, buildValueBasedMatchStage } = require('../../Utilities/filterSortUtils');



exports.getStudentsData = async (req, res) => {
  const StudentsData = createStudentsDataModel(req.collegeDB);
  const { ids, aggregate, page, limit, validate, studentId } = req.query;
  try {
    // Use utility for filtering
    const matchConditions = buildMatchConditions(req.query);
    // console.log(matchConditions);
    // Remove __valueBasedField from matchConditions for aggregation
    let valueBasedField = matchConditions.__valueBasedField;
    if (valueBasedField) delete matchConditions.__valueBasedField;

    // Validation: Check if studentId already exists (reusable utility)
    if (validate === 'true' && studentId) {
      const exists = await validateUniqueField(StudentsData, 'studentId', studentId);
      return res.status(200).json({ message: exists ? 'already present' : 'not present', exists });
    }

    // Use utility for sorting
    const sortObj = buildSortObject(req.query);
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    // Helper for joined field mapping
    const joinedFieldMap = {
      gender: 'genderDetails.genderValue',
      bloodGroup: 'bloodGroupDetails.bloodGroupValue',
      studentType: 'studentTypeDetails.studentTypeValue',
      department: 'departmentDetails.departmentName',
    };

    // Total docs in the collection (filtered count)
    // For value-based filter, filteredDocs must be counted after aggregation match
    let filteredDocs, totalDocs;
    totalDocs = await StudentsData.countDocuments();

    // If IDs are provided
    if (ids && Array.isArray(ids)) {
      const objectIds = ids.map(id => new ObjectId(id));
      if (aggregate === 'false') {
        let query = StudentsData.find({ _id: { $in: objectIds }, ...matchConditions });
        if (sortObj) query = query.sort(sortObj);
        query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
        const matchingData = await query;
        filteredDocs = await StudentsData.countDocuments({ _id: { $in: objectIds }, ...matchConditions });
        return res.status(200).json({ count: matchingData.length, filteredDocs, totalDocs, data: matchingData });
      }
      // Aggregate branch with IDs
      let lookups = [
        ...instituteLookup(),
        ...generalDataLookup('bloodGroup', 'bloodGroup', 'bloodGroupDetails', 'bloodGroupValue'),
        ...generalDataLookup('gender', 'gender', 'genderDetails', 'genderValue'),
        ...generalDataLookup('studentType', 'studentType', 'studentTypeDetails', 'studentTypeValue'),
        ...departmentLookup(),
        ...gradesLookup(),
        ...gradeBatchesLookup(),
        ...gradeSectionLookup(),
        ...gradeSectionBatchesLookup(),
      ];
      let pipeline = buildGenericAggregation({ filters: { _id: { $in: objectIds }, ...matchConditions }, lookups });
      // DRY: Use helper for value-based filter
      const valueMatch = buildValueBasedMatchStage(valueBasedField, joinedFieldMap);
      if (valueMatch) pipeline.push(valueMatch);
      pipeline.push({ $sort: sortObj });
      pipeline.push({
        $project: {
          firstName: 1,
          middleName: 1,
          lastName: 1,
          studentId: 1,
          studentType: '$studentTypeDetails.studentTypeValue',
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
          contactNo1: 1,
          contactNo2: 1,
          image: 1,
          fatherName: 1,
          motherName: 1,
          guardian: 1,
          parentOrGuardianNo: 1,
          parentOrGuardianEmail: 1,
          parentOrGuardianOccupation: 1,
          tempAddress: 1,
          permAddress: 1,
          createdAt: 1,
          updatedAt: 1
        }
      });
      // Count after all matches
      const countPipeline = pipeline.filter(stage => !stage.$skip && !stage.$limit && !stage.$sort && !stage.$project);
      const filteredDocsArr = await StudentsData.aggregate([...countPipeline, { $count: 'count' }]);
      filteredDocs = filteredDocsArr[0]?.count || 0;
      addPaginationAndSort(pipeline, { page: pageNum, limit: limitNum, sort: {} });
      const data = await StudentsData.aggregate(pipeline);
      return res.status(200).json({ count: data.length, filteredDocs, totalDocs, data });
    }
    // Aggregate branch (no IDs)
    if (aggregate === 'true') {
      let lookups = [
        ...instituteLookup(),
        ...generalDataLookup('bloodGroup', 'bloodGroup', 'bloodGroupDetails', 'bloodGroupValue'),
        ...generalDataLookup('gender', 'gender', 'genderDetails', 'genderValue'),
        ...generalDataLookup('studentType', 'studentType', 'studentTypeDetails', 'studentTypeValue'),
        ...departmentLookup(),
        ...gradesLookup(),
        ...gradeBatchesLookup(),
        ...gradeSectionLookup(),
        ...gradeSectionBatchesLookup(),
      ];
      let pipeline = buildGenericAggregation({ filters: matchConditions, lookups });
      // DRY: Use helper for value-based filter
      const valueMatch = buildValueBasedMatchStage(valueBasedField, joinedFieldMap);
      if (valueMatch) pipeline.push(valueMatch);
      pipeline.push({ $sort: sortObj });
      pipeline.push({
        $project: {
          firstName: 1,
          middleName: 1,
          lastName: 1,
          studentId: 1,
          studentType: '$studentTypeDetails.studentTypeValue',
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
          contactNo1: 1,
          contactNo2: 1,
          image: 1,
          fatherName: 1,
          motherName: 1,
          guardian: 1,
          parentOrGuardianNo: 1,
          parentOrGuardianEmail: 1,
          parentOrGuardianOccupation: 1,
          tempAddress: 1,
          permAddress: 1,
          createdAt: 1,
          updatedAt: 1
        }
      });
      // Count after all matches
      const countPipeline = pipeline.filter(stage => !stage.$skip && !stage.$limit && !stage.$sort && !stage.$project);
      const filteredDocsArr = await StudentsData.aggregate([...countPipeline, { $count: 'count' }]);
      filteredDocs = filteredDocsArr[0]?.count || 0;
      addPaginationAndSort(pipeline, { page: pageNum, limit: limitNum, sort: {} });
      const data = await StudentsData.aggregate(pipeline);
      return res.status(200).json({ count: data.length, filteredDocs, totalDocs, data });
    }

    // Non-aggregate fetch (simple find)
    let query = StudentsData.find(matchConditions);
    if (sortObj) query = query.sort(sortObj);
    query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
    const students = await query;
    filteredDocs = await StudentsData.countDocuments(matchConditions);
    return res.status(200).json({ count: students.length, filteredDocs, totalDocs, data: students });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createStudent = async (req, res) => {
  const StudentsData = createStudentsDataModel(req.collegeDB);
  try {
    const newStudent = await handleCRUD(StudentsData, 'create', {}, req.body);
    res.status(200).json({
      message: 'Student created successfully!',
      data: newStudent
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create student', details: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  const StudentsData = createStudentsDataModel(req.collegeDB);
  const { _id, updatedData } = req.body;
  try {
    const result = await handleCRUD(StudentsData, 'update', { _id }, { $set: updatedData });
    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'Student updated successfully' });
    } else if (result.matchedCount > 0 && result.modifiedCount === 0) {
      res.status(200).json({ message: 'No updates were made' });
    } else {
      res.status(404).json({ message: 'No matching student found or values are unchanged' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update student', details: error.message });
  }
};

exports.deleteStudents = async (req, res) => {
  const StudentsData = createStudentsDataModel(req.collegeDB);
  const { ids } = req.body;
  try {
    const result = await handleCRUD(StudentsData, 'delete', { _id: { $in: ids.map(id => id) } });
    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Students deleted successfully' });
    } else {
      res.status(404).json({ message: 'No matching students found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete students', details: error.message });
  }
};