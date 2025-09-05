const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const createEnrollmentsInInstituteModel = require('../../Model/enrollments/enrollmentsMd');
const { handleCRUD } = require('../../Utilities/crudUtils');
const { buildMatchConditions, buildSortObject, validateUniqueField, buildValueBasedMatchStage } = require('../../Utilities/filterSortUtils');
const buildGenericAggregation = require('../../Utilities/genericAggregatorUtils');
const addPaginationAndSort = require('../../Utilities/paginationControllsUtils');
const { instituteLookup } = require('../../Utilities/aggregations/instituteDataLookups');
const { departmentLookup } = require('../../Utilities/aggregations/departmentLookups');
const { gradesLookup } = require('../../Utilities/aggregations/gradesLookups');
const { gradeBatchesLookup } = require('../../Utilities/aggregations/gradesBatchesLookups');
const { gradeSectionLookup } = require('../../Utilities/aggregations/gradesSectionLookups');
const { gradeSectionBatchesLookup } = require('../../Utilities/aggregations/gradesSectionBatchesLookups');
const { enrollmentsSubjectsLookup, enrollmentsMemberLookup, enrollmentsAcademicYearLookup } = require('../../Utilities/aggregations/enrollments/enrollmentsLookups');
const { generalDataLookup } = require('../../Utilities/aggregations/generalDataLookups');

// --- ENROLLMENTS DEPENDENTS CONFIG ---
const enrollmentsDependents = [
  // Add dependents as needed - currently no direct dependencies
  // { model: 'SomeModel', field: 'enrollmentId', name: 'someData' }
];

// Get Enrollments Data (DRY: aggregation, lookup, pagination, sorting)
exports.getEnrollments = async (req, res) => {
  const Enrollments = createEnrollmentsInInstituteModel(req.collegeDB);
  const { ids, aggregate, page, limit, validate, dropdown } = req.query;
  
  try {
    // Filtering
    const matchConditions = buildMatchConditions(req.query);
    let valueBasedField = matchConditions.__valueBasedField;
    if (valueBasedField) delete matchConditions.__valueBasedField;
    const sortObj = buildSortObject(req.query);
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    if (dropdown === 'true') {
      let findQuery = Enrollments.find({...matchConditions, archive: { $ne: true } }, { 
        _id: 1, 
        instituteId: 1, 
        departmentId: 1, 
        gradeId: 1,
        memberId: 1,
        memberType: 1,
        enrollmentDate: 1,
        status: 1
      });
      findQuery = findQuery.sort({ enrollmentDate: -1 });
      const data = await findQuery;
      return res.status(200).json({ data });
    }

    // Helper for joined field mapping
    const joinedFieldMap = {
      institute: 'instituteDetails.instituteName',
      department: 'departmentDetails.departmentName',
      grade: 'gradesDetails.gradeName',
      gradeCode: 'gradesDetails.gradeCode',
      batch: 'gradeBatchesDetails.batch',
      section: 'gradeSectionDetails.sectionName',
      sectionBatch: 'gradeSectionBatchDetails.sectionBatchName',
      academicYear: 'academicYearDetails.academicYear',
      member: 'memberDetails.fullName',
      memberType: 'memberTypeDetails.memberTypeValue'
    };

    // Total docs in the collection
    const totalDocs = await Enrollments.countDocuments();
    let filteredDocs;

    // If IDs are provided
    if (ids && Array.isArray(ids)) {
      const objectIds = ids.map(id => new ObjectId(id));
      // Use aggregation by default, only use find if aggregate === 'false'
      if (aggregate === 'false') {
        let query = Enrollments.find({ _id: { $in: objectIds }, ...matchConditions });
        if (sortObj) query = query.sort(sortObj);
        query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
        const matchingData = await query;
        filteredDocs = await Enrollments.countDocuments({ _id: { $in: objectIds }, ...matchConditions });
        return res.status(200).json({ count: matchingData.length, filteredDocs, totalDocs, data: matchingData });
      }
      // Aggregate branch with IDs (default)
      const lookups = [
        ...instituteLookup(),
        ...departmentLookup(),
        ...gradesLookup(),
        ...gradeBatchesLookup(),
        ...gradeSectionLookup(),
        ...gradeSectionBatchesLookup(),
        ...enrollmentsSubjectsLookup(),
        ...enrollmentsAcademicYearLookup(),
        ...enrollmentsMemberLookup(),
        ...generalDataLookup('memberType', 'memberType', 'memberTypeDetails', 'memberTypeValue')
      ];
      let pipeline = buildGenericAggregation({ filters: { _id: { $in: objectIds }, ...matchConditions }, lookups });
      // Value-based filter on joined fields
      const valueMatch = buildValueBasedMatchStage(valueBasedField, joinedFieldMap);
      if (valueMatch) pipeline.push(valueMatch);
      pipeline.push({ $sort: sortObj });
      pipeline.push({
        $project: {
          // Only use fields that exist in the model
          _id: 1,
          instituteId: 1,
          departmentId: 1,
          gradeId: 1,
          gradeSectionId: 1,
          gradeSectionBatchId: 1,
          gradeBatchId: 1,
          subjectsIds: 1,
          memberId: 1,
          memberType: 1,
          enrollmentDate: 1,
          academicYearId: 1,
          status: 1,
          description: 1,
          archive: 1,
          createdAt: 1,
          updatedAt: 1,
          // Add lookup data with clear naming
          instituteName: '$instituteDetails.instituteName',
          departmentName: '$departmentDetails.departmentName',
          gradeName: '$gradesDetails.gradeName',
          gradeCode: '$gradesDetails.gradeCode',
          gradeDuration: '$gradesDetails.gradeDuration',
          batchName: '$gradeBatchesDetails.batch',
          sectionName: '$gradeSectionDetails.sectionName',
          sectionBatchName: '$gradeSectionBatchDetails.sectionBatchName',
          academicYear: '$academicYearDetails.academicYear',
          subjects: '$subjectsDetails',
          memberName: '$memberDetails.fullName',
          memberId: '$memberDetails.memberId',
          memberType: '$memberTypeDetails.memberTypeValue'
        }
      });
      // Count after all matches
      const countPipeline = pipeline.filter(stage => !stage.$skip && !stage.$limit && !stage.$sort && !stage.$project);
      const filteredDocsArr = await Enrollments.aggregate([...countPipeline, { $count: 'count' }]);
      filteredDocs = filteredDocsArr[0]?.count || 0;
      addPaginationAndSort(pipeline, { page: pageNum, limit: limitNum, sort: {} });
      const data = await Enrollments.aggregate(pipeline);
      return res.status(200).json({ count: data.length, filteredDocs, totalDocs, data });
    }

    // Aggregate branch (no IDs)
    if (aggregate !== 'false') {
      const lookups = [
        ...instituteLookup(),
        ...departmentLookup(),
        ...gradesLookup(),
        ...gradeBatchesLookup(),
        ...gradeSectionLookup(),
        ...gradeSectionBatchesLookup(),
        ...enrollmentsSubjectsLookup(),
        ...enrollmentsAcademicYearLookup(),
        ...enrollmentsMemberLookup(),
        ...generalDataLookup('memberType', 'memberType', 'memberTypeDetails', 'memberTypeValue')
      ];
      let pipeline = buildGenericAggregation({ filters: matchConditions, lookups });
      // Value-based filter on joined fields
      const valueMatch = buildValueBasedMatchStage(valueBasedField, joinedFieldMap);
      if (valueMatch) pipeline.push(valueMatch);
      pipeline.push({ $sort: sortObj });
      pipeline.push({
        $project: {
          // Only use fields that exist in the model
          _id: 1,
          instituteId: 1,
          departmentId: 1,
          gradeId: 1,
          gradeSectionId: 1,
          gradeSectionBatchId: 1,
          gradeBatchId: 1,
          subjectsIds: 1,
          memberId: 1,
          memberType: 1,
          enrollmentDate: 1,
          academicYearId: 1,
          status: 1,
          description: 1,
          archive: 1,
          createdAt: 1,
          updatedAt: 1,
          // Add lookup data with clear naming
          instituteName: '$instituteDetails.instituteName',
          departmentName: '$departmentDetails.departmentName',
          gradeName: '$gradesDetails.gradeName',
          gradeCode: '$gradesDetails.gradeCode',
          gradeDuration: '$gradesDetails.gradeDuration',
          batchName: '$gradeBatchesDetails.batch',
          sectionName: '$gradeSectionDetails.sectionName',
          sectionBatchName: '$gradeSectionBatchDetails.sectionBatchName',
          academicYear: '$academicYearDetails.academicYear',
          subjects: '$subjectsDetails',
          memberName: '$memberDetails.fullName',
          memberId: '$memberDetails.memberId',
          memberType: '$memberTypeDetails.memberTypeValue'
        }
      });
      // Count after all matches
      const countPipeline = pipeline.filter(stage => !stage.$skip && !stage.$limit && !stage.$sort && !stage.$project);
      const filteredDocsArr = await Enrollments.aggregate([...countPipeline, { $count: 'count' }]);
      filteredDocs = filteredDocsArr[0]?.count || 0;
      addPaginationAndSort(pipeline, { page: pageNum, limit: limitNum, sort: {} });
      const data = await Enrollments.aggregate(pipeline);
      return res.status(200).json({ count: data.length, filteredDocs, totalDocs, data });
    }

    // Non-aggregate fetch (simple find)
    let query = Enrollments.find(matchConditions);
    if (sortObj) query = query.sort(sortObj);
    query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
    const enrollments = await query;
    filteredDocs = await Enrollments.countDocuments(matchConditions);
    return res.status(200).json({ count: enrollments.length, filteredDocs, totalDocs, data: enrollments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createEnrollment = async (req, res) => {
  const Enrollments = createEnrollmentsInInstituteModel(req.collegeDB);
  const { 
    instituteId, 
    departmentId, 
    gradeId, 
    gradeSectionId, 
    gradeSectionBatchId, 
    gradeBatchId, 
    subjectsIds, 
    memberId,
    // memberType is auto-populated from memberId in the model middleware
    academicYearId,
    status,
    description 
  } = req.body;

  try {
    const newEnrollment = await handleCRUD(Enrollments, 'create', {}, {
      instituteId,
      departmentId,
      gradeId,
      gradeSectionId,
      gradeSectionBatchId,
      gradeBatchId,
      subjectsIds,
      memberId,
      // memberType will be auto-populated by model middleware
      academicYearId,
      status,
      description
    });

    res.status(200).json({
      message: 'Enrollment added successfully!',
      data: newEnrollment
    });
  } catch (error) {
    // Handle compound unique constraint violations
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Duplicate enrollment',
        details: memberId ? 
          'A member enrollment already exists for this combination' :
          'An enrollment already exists for this combination of institute, department, grade, and academic year',
        suggestion: 'Please check if this enrollment already exists or modify the combination'
      });
    }
    
    // Handle custom validation errors from schema middleware
    if (error.code === 'DUPLICATE_ENROLLMENT') {
      return res.status(400).json({
        error: 'Duplicate enrollment',
        details: memberId ? 
          'A member enrollment already exists for this combination' :
          'An enrollment already exists for this combination',
        suggestion: 'Please check if this enrollment already exists or modify the combination'
      });
    }
    
    res.status(500).json({ error: 'Failed to add enrollment', details: error.message });
  }
};

exports.updateEnrollment = async (req, res) => {
  const Enrollments = createEnrollmentsInInstituteModel(req.collegeDB);
  const { _id, updatedData } = req.body;

  try {
    const result = await handleCRUD(Enrollments, 'update', { _id }, { $set: updatedData });

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'Enrollment updated successfully' });
    } else if (result.matchedCount > 0 && result.modifiedCount === 0) {
      res.status(200).json({ message: 'No updates were made' });
    } else {
      res.status(404).json({ message: 'No matching enrollment found or values are unchanged' });
    }
  } catch (error) {
    // Handle custom validation errors from schema middleware
    if (error.code === 'DUPLICATE_ENROLLMENT') {
      return res.status(400).json({
        error: 'Duplicate enrollment',
        details: 'An enrollment already exists for this combination',
        suggestion: 'Please check if this enrollment already exists or modify the combination'
      });
    }
    
    res.status(500).json({ error: 'Failed to update enrollment', details: error.message });
  }
};

// Delete Enrollment(s) with dependency options
exports.deleteEnrollment = async (req, res) => {
  // Register all dependent models for the current connection
  // Add any dependent models here if needed

  const Enrollments = createEnrollmentsInInstituteModel(req.collegeDB);
  const { ids, deleteDependents, transferTo, archive } = req.body;

  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ message: 'Enrollment ID(s) required' });
  }
  // Only one of archive or transferTo can be requested at a time
  if (archive !== undefined && transferTo) {
    return res.status(400).json({ message: 'Only one of archive or transfer can be requested at a time.' });
  }
  // Archive must be a boolean if present
  if (archive !== undefined && typeof archive !== 'boolean') {
    return res.status(400).json({ message: 'The archive parameter must be a boolean (true or false).' });
  }

  // Import generic cascade utils
  const { countDependents, deleteWithDependents, transferDependents, archiveParents } = require('../../../Utilities/dependencyCascadeUtils');

  try {
    // Archive/unarchive logic
    if (archive !== undefined) {
      const archiveResult = await archiveParents(req.collegeDB, ids, 'Enrollments', Boolean(archive));
      // Check if any documents were actually updated
      if (!archiveResult || !archiveResult.archivedCount) {
        return res.status(404).json({ message: 'No matching Enrollment found to archive/unarchive' });
      }
      return res.status(200).json({ message: `Enrollment(s) ${archive ? 'archived' : 'unarchived'} successfully`, archiveResult });
    }

    // 1. Count dependents for each Enrollment
    const depCounts = await countDependents(req.collegeDB, ids, enrollmentsDependents);
    // Fetch original Enrollment docs to get the value field
    const originalDocs = await Enrollments.find(
      { _id: { $in: ids.map(id => new ObjectId(id)) } },
      { enrollmentDate: 1, status: 1 }
    );
    const docMap = {};
    originalDocs.forEach(doc => {
      docMap[doc._id.toString()] = `${doc.status} - ${doc.enrollmentDate}`;
    });

    // Partition IDs into zero and non-zero dependents
    const zeroDepIds = Object.keys(depCounts).filter(id => Object.values(depCounts[id]).every(count => count === 0));
    const nonZeroDepIds = Object.keys(depCounts).filter(id => !zeroDepIds.includes(id));
    let deletedCount = 0;
    if (zeroDepIds.length > 0) {
      const result = await handleCRUD(Enrollments, 'delete', { _id: { $in: zeroDepIds.map(id => new ObjectId(id)) } });
      deletedCount = result.deletedCount || 0;
    }
    if (nonZeroDepIds.length === 0) {
      return res.status(200).json({ message: 'Enrollment(s) deleted successfully', deleted: zeroDepIds, dependencies: [] });
    }
    if (!deleteDependents && !transferTo) {
      const dependencies = nonZeroDepIds.map(id => ({
        _id: id,
        value: docMap[id] || null,
        dependsOn: depCounts[id]
      }));
      return res.status(201).json({ message: 'Dependency summary', deleted: zeroDepIds, dependencies: dependencies });
    }
    if (deleteDependents && transferTo) {
      return res.status(400).json({ message: 'Either transfer or delete dependencies'});
    }
    // 2. Transfer dependents if requested
    if (transferTo) {
      if (ids.length !== 1) {
        return res.status(400).json({ message: 'Please select one Enrollment to transfer dependents from.' });
      }
      const transferRes = await transferDependents(req.collegeDB, ids[0], transferTo, enrollmentsDependents);
      // After transfer, delete the original Enrollment(s)
      const result = await handleCRUD(Enrollments, 'delete', { _id: { $in: ids.map(id => new ObjectId(id)) } });
      return res.status(200).json({ message: 'Dependents transferred and Enrollment(s) deleted', transfer: transferRes, deletedCount: result.deletedCount });
    }
    // 3. Delete dependents and Enrollment(s) in a transaction
    if (deleteDependents) {
      const results = [];
      for (const id of ids) {
        const delRes = await deleteWithDependents(req.collegeDB, id, enrollmentsDependents, 'Enrollments');
        results.push({ enrollmentId: id, ...delRes });
      }
      return res.status(200).json({ message: 'Deleted with dependents', results });
    }
    // Default: just delete the Enrollment(s) if no dependents
    const result = await handleCRUD(Enrollments, 'delete', { _id: { $in: ids.map(id => new ObjectId(id)) } });
    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Enrollment(s) deleted successfully', deletedCount: result.deletedCount });
    } else {
      res.status(404).json({ message: 'No matching Enrollment found for deletion' });
    }
  } catch (error) {
    console.error('Error deleting Enrollment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
