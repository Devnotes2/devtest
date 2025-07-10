// departmentDataCt.js (Controller for handling Department data)
const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const createDepartmentDataModel = require('../../Model/instituteData/departmentMd');
const { handleCRUD } = require('../../Utilities/crudUtils');
const { buildMatchConditions, buildSortObject, validateUniqueField, buildValueBasedMatchStage } = require('../../Utilities/filterSortUtils');
const buildGenericAggregation = require('../../Utilities/genericAggregatorUtils');
const addPaginationAndSort = require('../../Utilities/paginationControllsUtils');
const { instituteLookup } = require('../../Utilities/aggregations/instituteDataLookups');
const createGradesInInstituteModel = require('../../Model/instituteData/aggregation/gradesMd');
const createSubjectsInInstituteModel = require('../../Model/instituteData/aggregation/subjectsMd');
const createMemberDataModel = require('../../Model/membersModule/memberDataMd');

// --- INSTITUTE DEPENDENTS CONFIG ---
const departmentDependents = [
  { model: 'Grades', field: 'departmentId', name: 'grades' },
  { model: 'Subjects', field: 'departmentId', name: 'subjects' },
  { model: 'MembersData', field: 'departmentId', name: 'MembersData' },
  // Add more as needed
];

exports.createDepartment = async (req, res) => {
  const DepartmentData = createDepartmentDataModel(req.collegeDB);
  try {
    const newDepartment = await handleCRUD(DepartmentData, 'create', {}, req.body);
    res.status(200).json({
      message: 'Department created successfully!',
      data: newDepartment
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create Department', details: error.message });
  }
};


exports.updateDepartment = async (req, res) => {
  const DepartmentsData = createDepartmentDataModel(req.collegeDB);
  const { _id, updatedData } = req.body;
  try {
    const result = await handleCRUD(DepartmentsData, 'update', { _id }, { $set: updatedData });
    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'Department updated successfully' });
    } else if (result.matchedCount > 0 && result.modifiedCount === 0) {
      res.status(200).json({ message: 'No updates were made' });
    } else {
      res.status(404).json({ message: 'No matching department found or values are unchanged' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update department', details: error.message });
  }
};



// Get Departments Data (DRY: aggregation, lookup, pagination, sorting)
exports.getDepartment = async (req, res) => {
  const DepartmentData = createDepartmentDataModel(req.collegeDB);
  const { ids, aggregate, page, limit, validate, departmentName ,dropdown} = req.query;
  try {
    // Filtering
    const matchConditions = buildMatchConditions(req.query);
    let valueBasedField = matchConditions.__valueBasedField;
    if (valueBasedField) delete matchConditions.__valueBasedField;
    const sortObj = buildSortObject(req.query);
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    if (dropdown === 'true') {
      let findQuery = DepartmentData.find(matchConditions, { _id: 1, departmentName: 1 });
      findQuery = findQuery.sort({ departmentName: 1 });
      const data = await findQuery;
      return res.status(200).json({ data });
    }
    // Validation: Check if departmentName already exists
    if (validate === 'true' && departmentName) {
      const exists = await validateUniqueField(DepartmentData, 'departmentName', departmentName);
      return res.status(200).json({ message: exists ? 'already present' : 'not present', exists });
    }

    // Helper for joined field mapping
    const joinedFieldMap = {
      institute: 'instituteDetails.instituteName',
    };

    // Total docs in the collection
    const totalDocs = await DepartmentData.countDocuments();
    let filteredDocs;

    // If IDs are provided
    if (ids && Array.isArray(ids)) {
      const objectIds = ids.map(id => new ObjectId(id));
      // Use aggregation by default, only use find if aggregate === 'false'
      if (aggregate === 'false') {
        let query = DepartmentData.find({ _id: { $in: objectIds }, ...matchConditions });
        if (sortObj) query = query.sort(sortObj);
        query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
        const matchingData = await query;
        filteredDocs = await DepartmentData.countDocuments({ _id: { $in: objectIds }, ...matchConditions });
        return res.status(200).json({ count: matchingData.length, filteredDocs, totalDocs, data: matchingData });
      }
      // Aggregate branch with IDs (default)
      const lookups = [ ...instituteLookup() ];
      let pipeline = buildGenericAggregation({ filters: { _id: { $in: objectIds }, ...matchConditions }, lookups });
      // Value-based filter on joined fields
      const valueMatch = buildValueBasedMatchStage(valueBasedField, joinedFieldMap);
      if (valueMatch) pipeline.push(valueMatch);
      pipeline.push({ $sort: sortObj });
      pipeline.push({
        $project: {
          department: '$departmentName',
          description: 1,
          instituteId: 1,
          departmentCode:1,
          createdAt: 1,
          updatedAt: 1,
          institute:'$instituteDetails.instituteName'
        }
      });
      // Count after all matches
      const countPipeline = pipeline.filter(stage => !stage.$skip && !stage.$limit && !stage.$sort && !stage.$project);
      const filteredDocsArr = await DepartmentData.aggregate([...countPipeline, { $count: 'count' }]);
      filteredDocs = filteredDocsArr[0]?.count || 0;
      addPaginationAndSort(pipeline, { page: pageNum, limit: limitNum, sort: {} });
      const data = await DepartmentData.aggregate(pipeline);
      return res.status(200).json({ count: data.length, filteredDocs, totalDocs, data });
    }

    // Aggregate branch (no IDs)
    if (aggregate !== 'false') {
      const lookups = [ ...instituteLookup() ];
      let pipeline = buildGenericAggregation({ filters: matchConditions, lookups });
      // Value-based filter on joined fields
      const valueMatch = buildValueBasedMatchStage(valueBasedField, joinedFieldMap);
      if (valueMatch) pipeline.push(valueMatch);
      pipeline.push({ $sort: sortObj });
      pipeline.push({
        $project: {
          department: '$departmentName',
          description: 1,
          instituteId: 1,
          departmentCode:1,
          createdAt: 1,
          updatedAt: 1,
          institute:'$instituteDetails.instituteName'
        }
      });
      // Count after all matches
      const countPipeline = pipeline.filter(stage => !stage.$skip && !stage.$limit && !stage.$sort && !stage.$project);
      const filteredDocsArr = await DepartmentData.aggregate([...countPipeline, { $count: 'count' }]);
      filteredDocs = filteredDocsArr[0]?.count || 0;
      addPaginationAndSort(pipeline, { page: pageNum, limit: limitNum, sort: {} });
      const data = await DepartmentData.aggregate(pipeline);
      return res.status(200).json({ count: data.length, filteredDocs, totalDocs, data });
    }

    // Non-aggregate fetch (simple find)
    let query = DepartmentData.find(matchConditions);
    if (sortObj) query = query.sort(sortObj);
    query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
    const departments = await query;
    filteredDocs = await DepartmentData.countDocuments(matchConditions);
    return res.status(200).json({ count: departments.length, filteredDocs, totalDocs, data: departments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



// exports.deleteDepartment = async (req, res) => {
//   const DepartmentData = createDepartmentDataModel(req.collegeDB);
//   const { ids } = req.body;
//   try {
//     const result = await handleCRUD(DepartmentData, 'delete', { _id: { $in: ids.map(id => id) } });
//     if (result.deletedCount > 0) {
//       res.status(200).json({ message: 'Departments deleted successfully' });
//     } else {
//       res.status(404).json({ message: 'No matching departments found' });
//     }
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to delete departments', details: error.message });
//   }
// };

// Delete institute(s) with dependency options
exports.deleteDepartment = async (req, res) => {
  // Register all dependent models for the current connection
  createGradesInInstituteModel(req.collegeDB);
  createSubjectsInInstituteModel(req.collegeDB);
  createMemberDataModel(req.collegeDB);

  const Department = createDepartmentDataModel(req.collegeDB);
  const { ids, deleteDependents, transferTo } = req.body;

  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ message: 'Department ID(s) required' });
  }

  // Import generic cascade utils
  const { countDependents, deleteWithDependents, transferDependents } = require('../../Utilities/dependencyCascadeUtils');

  try {
    // 1. Count dependents for each department
    const depCounts = await countDependents(req.collegeDB, ids, departmentDependents);
    // Fetch original Department docs to get the value field (e.g., departmentName)
    const originalDocs = await Department.find(
      { _id: { $in: ids.map(id => new ObjectId(id)) } },
      { departmentName: 1 }
    );
    const docMap = {};
    originalDocs.forEach(doc => {
      docMap[doc._id.toString()] = doc.departmentName;
    });

    // Partition IDs into zero and non-zero dependents
    const zeroDepIds = Object.keys(depCounts).filter(id => Object.values(depCounts[id]).every(count => count === 0));
    const nonZeroDepIds = Object.keys(depCounts).filter(id => !zeroDepIds.includes(id));
    let deletedCount = 0;
    if (zeroDepIds.length > 0) {
      const result = await handleCRUD(Department, 'delete', { _id: { $in: zeroDepIds.map(id => new ObjectId(id)) } });
      deletedCount = result.deletedCount || 0;
    }
    if (nonZeroDepIds.length === 0) {
      return res.status(200).json({ message: 'Department(s) deleted successfully', deleted: zeroDepIds, dependencySummary: [] });
    }
    if (!deleteDependents && !transferTo) {
      const dependencies = nonZeroDepIds.map(id => ({
        _id: id,
        value: docMap[id] || null,
        dependsOn: depCounts[id]
      }));
      return res.status(201).json({ message: 'Dependency summary', deleted: zeroDepIds, dependencySummary: dependencies });
    }
    // 2. Transfer dependents if requested
    if (transferTo) {
      if (ids.length !== 1) {
        return res.status(400).json({ message: 'Please select one department to transfer dependents from.' });
      }
      const transferRes = await transferDependents(req.collegeDB, ids[0], transferTo, departmentDependents);
      // After transfer, delete the original institute(s)
      const result = await handleCRUD(Department, 'delete', { _id: { $in: ids.map(id => new ObjectId(id)) } });
      return res.status(200).json({ message: 'Dependents transferred and department(s) deleted', transfer: transferRes, deletedCount: result.deletedCount });
    }
    // 3. Delete dependents and institute(s) in a transaction
    if (deleteDependents) {
      const results = [];
      for (const id of ids) {
        const delRes = await deleteWithDependents(req.collegeDB, id, departmentDependents, 'DepartmentData');
        results.push({ departmentId: id, ...delRes });
      }
      return res.status(200).json({ message: 'Deleted with dependents', results });
    }
    // Default: just delete the institute(s) if no dependents
    const result = await handleCRUD(Department, 'delete', { _id: { $in: ids.map(id => new ObjectId(id)) } });
    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Department(s) deleted successfully', deletedCount: result.deletedCount });
    } else {
      res.status(404).json({ message: 'No matching departments found for deletion' });
    }
  } catch (error) {
    console.error('Error deleting departments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};