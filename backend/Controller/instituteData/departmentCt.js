// departmentDataCt.js (Controller for handling Department data)
const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const createDepartmentDataModel = require('../../Model/instituteData/departmentMd');
const { handleCRUD } = require('../../Utilities/crudUtils');
const { buildMatchConditions, buildSortObject, validateUniqueField, buildValueBasedMatchStage } = require('../../Utilities/filterSortUtils');
const buildGenericAggregation = require('../../Utilities/genericAggregatorUtils');
const addPaginationAndSort = require('../../Utilities/paginationControllsUtils');
const { instituteLookup } = require('../../Utilities/aggregations/instituteDataLookups');

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


exports.deleteDepartment = async (req, res) => {
  const DepartmentData = createDepartmentDataModel(req.collegeDB);
  const { ids } = req.body;
  try {
    const result = await handleCRUD(DepartmentData, 'delete', { _id: { $in: ids.map(id => id) } });
    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Departments deleted successfully' });
    } else {
      res.status(404).json({ message: 'No matching departments found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete departments', details: error.message });
  }
};


// Get Departments Data (DRY: aggregation, lookup, pagination, sorting)
exports.getDepartment = async (req, res) => {
  const DepartmentData = createDepartmentDataModel(req.collegeDB);
  const { ids, aggregate, page, limit, validate, departmentName } = req.query;
  try {
    // Filtering
    const matchConditions = buildMatchConditions(req.query);
    let valueBasedField = matchConditions.__valueBasedField;
    if (valueBasedField) delete matchConditions.__valueBasedField;
    const sortObj = buildSortObject(req.query);
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

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
      if (aggregate === 'false') {
        let query = DepartmentData.find({ _id: { $in: objectIds }, ...matchConditions });
        if (sortObj) query = query.sort(sortObj);
        query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
        const matchingData = await query;
        filteredDocs = await DepartmentData.countDocuments({ _id: { $in: objectIds }, ...matchConditions });
        return res.status(200).json({ count: matchingData.length, filteredDocs, totalDocs, data: matchingData });
      }
      // Aggregate branch with IDs
      const lookups = [ ...instituteLookup() ];
      let pipeline = buildGenericAggregation({ filters: { _id: { $in: objectIds }, ...matchConditions }, lookups });
      // Value-based filter on joined fields
      const valueMatch = buildValueBasedMatchStage(valueBasedField, joinedFieldMap);
      if (valueMatch) pipeline.push(valueMatch);
      pipeline.push({ $sort: sortObj });
      pipeline.push({
        $project: {
          departmentName: 1,
          description: 1,
          instituteId: 1,
          createdAt: 1,
          updatedAt: 1,
          'instituteDetails._id': 1,
          'instituteDetails.instituteName': 1
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
    if (aggregate === 'true') {
      const lookups = [ ...instituteLookup() ];
      let pipeline = buildGenericAggregation({ filters: matchConditions, lookups });
      // Value-based filter on joined fields
      const valueMatch = buildValueBasedMatchStage(valueBasedField, joinedFieldMap);
      if (valueMatch) pipeline.push(valueMatch);
      pipeline.push({ $sort: sortObj });
      pipeline.push({
        $project: {
          departmentName: 1,
          description: 1,
          instituteId: 1,
          createdAt: 1,
          updatedAt: 1,
          'instituteDetails._id': 1,
          'instituteDetails.instituteName': 1
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