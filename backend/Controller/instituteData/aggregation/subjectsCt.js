const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const createSubjectsInInstituteModel = require('../../../Model/instituteData/aggregation/subjectsMd.js');
const { handleCRUD } = require('../../../Utilities/crudUtils.js');
const { buildMatchConditions, buildSortObject } = require('../../../Utilities/filterSortUtils');
const { createMembersDataModel } = require('../../../Model/membersModule/memberDataMd');

// --- Subject DEPENDENTS CONFIG ---
const subjectDependents = [
  { model: 'MembersData', field: 'gradeSubjectId', name: 'MembersData' },
  { model: 'MembersData', field: 'gradeBatchSubjectId', name: 'MembersData' },
  { model: 'MembersData', field: 'gradeSectionSubjectId', name: 'MembersData' },
  { model: 'MembersData', field: 'gradeSectionBatchSubjectId', name: 'MembersData' }
  // Add more as needed
];

exports.subjectsInInstituteAg = async (req, res) => {
  const SubjectsInInstitute = createSubjectsInInstituteModel(req.collegeDB);
  const { ids, aggregate, page, limit, sortField, sort, dropdown } = req.query;
  try {
    // Filtering
    const matchConditions = buildMatchConditions(req.query);
    const sortObj = buildSortObject(req.query);
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    // Dropdown mode: return only _id and subject, with sorting and filtering
    if (dropdown === 'true') {
      let findQuery = SubjectsInInstitute.find(matchConditions, { _id: 1, subject: 1 });
      findQuery = findQuery.sort({ subject: 1 });
      const data = await findQuery;
      return res.status(200).json( data );
    }

    // Helper: get ids as array
    let idsArr = Array.isArray(ids) ? ids : (typeof ids === 'string' ? ids.split(',') : undefined);
    if (idsArr && idsArr.length > 0) {
      const objectIds = idsArr.map(id => new ObjectId(id));
      const query = { _id: { $in: objectIds }, ...matchConditions };
      // Use aggregation by default, only use find if aggregate === 'false'
      if (aggregate === 'false') {
        let findQuery = SubjectsInInstitute.find(query);
        if (sortObj) findQuery = findQuery.sort(sortObj);
        findQuery = findQuery.skip((pageNum - 1) * limitNum).limit(limitNum);
        const matchingData = await findQuery;
        const filteredDocs = await SubjectsInInstitute.countDocuments(query);
        const totalDocs = await SubjectsInInstitute.countDocuments();
        return res.status(200).json({ count: matchingData.length, filteredDocs, totalDocs, data: matchingData });
      }
      // Aggregate branch with IDs (default)
      const aggregationPipeline = [
        { $match: query },
        {
          $lookup: {
            from: 'instituteData',
            localField: 'instituteId',
            foreignField: '_id',
            as: 'instituteDetails'
          }
        },
        { $unwind: { path: '$instituteDetails', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'departmentdatas',
            localField: 'departmentId',
            foreignField: '_id',
            as: 'departmentDetails'
          }
        },
        { $unwind: { path: '$departmentDetails', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'generalData',
            let: { learningTypeId: '$learningTypeId' },
            pipeline: [
              { $match: { _id: 'learningTypes' } },
              { $unwind: '$data' },
              { $match: { $expr: { $eq: ['$data._id', '$$learningTypeId'] } } },
              { $project: { learningTypeValue: '$data.value' } }
            ],
            as: 'learningTypeDetails'
          }
        },
        { $unwind: { path: '$learningTypeDetails', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'generalData',
            let: { subjectTypeId: '$subjectTypeId' },
            pipeline: [
              { $match: { _id: 'subjectTypes' } },
              { $unwind: '$data' },
              { $match: { $expr: { $eq: ['$data._id', '$$subjectTypeId'] } } },
              { $project: { subjectTypeValue: '$data.value' } }
            ],
            as: 'subjectTypeDetails'
          }
        },
        { $unwind: { path: '$subjectTypeDetails', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'grades',
          localField: 'gradeId',
          foreignField: '_id',
          as: 'gradeDetails'
        }
      },
      { $unwind: { path: '$gradeDetails', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            subject: 1,
            subjectCode: 1,
            description: 1,
            instituteName: '$instituteDetails.instituteName',
            instituteId: '$instituteDetails._id',
            departmentName: '$departmentDetails.departmentName',
            departmentId: '$departmentDetails._id',
            learningType: '$learningTypeDetails.learningTypeValue',
            subjectType: '$subjectTypeDetails.subjectTypeValue',
            gradeDescription: '$gradeDetails.gradeDescription'
          }
        }
      ];
      // Count after all matches
      const countPipeline = aggregationPipeline.filter(stage => !stage.$skip && !stage.$limit && !stage.$sort && !stage.$project);
      const filteredDocsArr = await SubjectsInInstitute.aggregate([...countPipeline, { $count: 'count' }]);
      const filteredDocs = filteredDocsArr[0]?.count || 0;
      if (sortObj) aggregationPipeline.push({ $sort: sortObj });
      aggregationPipeline.push({ $skip: (pageNum - 1) * limitNum });
      aggregationPipeline.push({ $limit: limitNum });
      const data = await SubjectsInInstitute.aggregate(aggregationPipeline);
      const totalDocs = await SubjectsInInstitute.countDocuments();
      return res.status(200).json({ count: data.length, filteredDocs, totalDocs, data });
    }

    // Aggregate branch (no IDs)
    if (aggregate !== 'false') {
      const aggregationPipeline = [
        { $match: { ...matchConditions } },
        {
          $lookup: {
            from: 'instituteData',
            localField: 'instituteId',
            foreignField: '_id',
            as: 'instituteDetails'
          }
        },
        { $unwind: { path: '$instituteDetails', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'departmentdatas',
            localField: 'departmentId',
            foreignField: '_id',
            as: 'departmentDetails'
          }
        },
        { $unwind: { path: '$departmentDetails', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'generalData',
            let: { learningTypeId: '$learningTypeId' },
            pipeline: [
              { $match: { _id: 'learningTypes' } },
              { $unwind: '$data' },
              { $match: { $expr: { $eq: ['$data._id', '$$learningTypeId'] } } },
              { $project: { learningTypeValue: '$data.value' } }
            ],
            as: 'learningTypeDetails'
          }
        },
        { $unwind: { path: '$learningTypeDetails', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'generalData',
            let: { subjectTypeId: '$subjectTypeId' },
            pipeline: [
              { $match: { _id: 'subjectTypes' } },
              { $unwind: '$data' },
              { $match: { $expr: { $eq: ['$data._id', '$$subjectTypeId'] } } },
              { $project: { subjectTypeValue: '$data.value' } }
            ],
            as: 'subjectTypeDetails'
          }
        },
        { $unwind: { path: '$subjectTypeDetails', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'grades',
          localField: 'gradeId',
          foreignField: '_id',
          as: 'gradeDetails'
        }
      },
      { $unwind: { path: '$gradeDetails', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            subject: 1,
            subjectCode: 1,
            description: 1,
            instituteName: '$instituteDetails.instituteName',
            instituteId: '$instituteDetails._id',
            departmentName: '$departmentDetails.departmentName',
            departmentId: '$departmentDetails._id',
            learningType: '$learningTypeDetails.learningTypeValue',
            subjectType: '$subjectTypeDetails.subjectTypeValue',
            gradeDescription: '$gradeDetails.gradeDescription'
          }
        }
      ];
      // Count after all matches
      const countPipeline = aggregationPipeline.filter(stage => !stage.$skip && !stage.$limit && !stage.$sort && !stage.$project);
      const filteredDocsArr = await SubjectsInInstitute.aggregate([...countPipeline, { $count: 'count' }]);
      const filteredDocs = filteredDocsArr[0]?.count || 0;
      if (sortObj) aggregationPipeline.push({ $sort: sortObj });
      aggregationPipeline.push({ $skip: (pageNum - 1) * limitNum });
      aggregationPipeline.push({ $limit: limitNum });
      const data = await SubjectsInInstitute.aggregate(aggregationPipeline);
      const totalDocs = await SubjectsInInstitute.countDocuments();
      return res.status(200).json({ count: data.length, filteredDocs, totalDocs, data });
    }

    // Non-aggregate fetch (simple find)
    let findQuery = SubjectsInInstitute.find(matchConditions);
    if (sortObj) findQuery = findQuery.sort(sortObj);
    findQuery = findQuery.skip((pageNum - 1) * limitNum).limit(limitNum);
    const data = await findQuery;
    const filteredDocs = await SubjectsInInstitute.countDocuments(matchConditions);
    const totalDocs = await SubjectsInInstitute.countDocuments();
    return res.status(200).json({ count: data.length, filteredDocs, totalDocs, data });
  } catch (error) {
    console.error('Error in subjectsInInstituteAg:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

// Create Subject (POST)
exports.createSubjectsInInstitute = async (req, res) => {
  const SubjectsInInstitute = createSubjectsInInstituteModel(req.collegeDB);
  try {
    const newSubject = await SubjectsInInstitute.create(req.body);
    res.status(200).json({
      message: 'Subject added successfully!',
      data: newSubject
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add subject', details: error.message });
  }
};

// Update Subject (PUT)
exports.updateSubjectsInInstitute = async (req, res) => {
  const SubjectsInInstitute = createSubjectsInInstituteModel(req.collegeDB);
  const { _id, updatedData } = req.body;
  try {
    const result = await SubjectsInInstitute.updateOne({ _id }, { $set: updatedData });
    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'Subject updated successfully' });
    } else if (result.matchedCount > 0 && result.modifiedCount === 0) {
      res.status(200).json({ message: 'No updates were made' });
    } else {
      res.status(404).json({ message: 'No matching subject found or values are unchanged' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subject', details: error.message });
  }
};

// Delete Subject(s) with dependency options
exports.deleteSubjectsInInstitute = async (req, res) => {
  // Register all dependent models for the current connection
  createMembersDataModel(req.collegeDB);

  const SubjectsInInstitute = createSubjectsInInstituteModel(req.collegeDB);
  const { ids, deleteDependents, transferTo, archive } = req.body;

  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ message: 'Subject ID(s) required' });
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
      const archiveResult = await archiveParents(req.collegeDB, ids, 'Subjects', Boolean(archive));
      // Check if any documents were actually updated
      if (!archiveResult || !archiveResult.archivedCount) {
        return res.status(404).json({ message: 'No matching Subject found to archive/unarchive' });
      }
      return res.status(200).json({ message: `Subject(s) ${archive ? 'archived' : 'unarchived'} successfully`, archiveResult });
    }

    // 1. Count dependents for each Subject
    const depCounts = await countDependents(req.collegeDB, ids, subjectDependents);
    // Fetch original Subject docs to get the value field (e.g., subject)
    const originalDocs = await SubjectsInInstitute.find(
      { _id: { $in: ids.map(id => new ObjectId(id)) } },
      { subject: 1 }
    );
    const docMap = {};
    originalDocs.forEach(doc => {
      docMap[doc._id.toString()] = doc.subject;
    });

    // Partition IDs into zero and non-zero dependents
    const zeroDepIds = Object.keys(depCounts).filter(id => Object.values(depCounts[id]).every(count => count === 0));
    const nonZeroDepIds = Object.keys(depCounts).filter(id => !zeroDepIds.includes(id));
    let deletedCount = 0;
    if (zeroDepIds.length > 0) {
      const result = await handleCRUD(SubjectsInInstitute, 'delete', { _id: { $in: zeroDepIds.map(id => new ObjectId(id)) } });
      deletedCount = result.deletedCount || 0;
    }
    if (nonZeroDepIds.length === 0) {
      return res.status(200).json({ message: 'Subject(s) deleted successfully', deleted: zeroDepIds, dependencies: [] });
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
        return res.status(400).json({ message: 'Please select one Subject to transfer dependents from.' });
      }
      const transferRes = await transferDependents(req.collegeDB, ids[0], transferTo, subjectDependents);
      // After transfer, delete the original Subject(s)
      const result = await handleCRUD(SubjectsInInstitute, 'delete', { _id: { $in: ids.map(id => new ObjectId(id)) } });
      return res.status(200).json({ message: 'Dependents transferred and Subject(s) deleted', transfer: transferRes, deletedCount: result.deletedCount });
    }
    // 3. Delete dependents and Subject(s) in a transaction
    if (deleteDependents) {
      const results = [];
      for (const id of ids) {
        const delRes = await deleteWithDependents(req.collegeDB, id, subjectDependents, 'Subjects');
        results.push({ subjectId: id, ...delRes });
      }
      return res.status(200).json({ message: 'Deleted with dependents', results });
    }
    // Default: just delete the Subject(s) if no dependents
    const result = await handleCRUD(SubjectsInInstitute, 'delete', { _id: { $in: ids.map(id => new ObjectId(id)) } });
    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Subject(s) deleted successfully', deletedCount: result.deletedCount });
    } else {
      res.status(404).json({ message: 'No matching Subject found for deletion' });
    }
  } catch (error) {
    console.error('Error deleting Subject:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
