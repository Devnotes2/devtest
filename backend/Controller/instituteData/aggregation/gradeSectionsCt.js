const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const createGradeSectionsInInstituteModel = require('../../../Model/instituteData/aggregation/gradesectionsMd');
const { handleCRUD } = require('../../../Utilities/crudUtils');
const createGradeSectionBatchesInInstituteModel = require('../../../Model/instituteData/aggregation/gradeSectionBatchesMd');
const { createMemberDataModel } = require('../../../Model/membersModule/memberDataMd');

// --- Grade Section DEPENDENTS CONFIG ---
const gradeSectionDependents = [
  { model: 'MembersData', field: 'gradeSectionId', name: 'MembersData' },
  { model: 'GradeSectionBatches', field: 'gradeSectionId', name: 'gradesectionbatches' }
  // Add more as needed
];

exports.gradeSectionsInInstituteAg = async (req, res) => {
  const GradeSectionsInInstitute = createGradeSectionsInInstituteModel(req.collegeDB);
  const { ids, instituteId, gradeId, sectionName, aggregate, dropdown, departmentId, page, limit } = req.query;

  try {
    // Add pagination parameters - exactly match department pattern
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    const matchConditions = {};
    if (instituteId) matchConditions.instituteId = new ObjectId(instituteId);
    if (gradeId) matchConditions.gradeId = new ObjectId(gradeId);
    if (departmentId) matchConditions.departmentId = new ObjectId(departmentId);
    
    if (dropdown === 'true') {
      let findQuery = GradeSectionsInInstitute.find({...matchConditions, archive: { $ne: true } }, { _id: 1, sectionName: 1 });
      findQuery = findQuery.sort({sectionName:1});
      const data = await findQuery;
      return res.status(200).json({ data });
    }
    
    const query = { ...matchConditions };
    
    if (ids && Array.isArray(ids)) {
      const objectIds = ids.map(id => new ObjectId(id));
      query._id = { $in: objectIds };
      
      if (aggregate === 'false') {
        // Add pagination to simple find - exactly match department pattern
        let findQuery = GradeSectionsInInstitute.find(query);
        findQuery = findQuery.skip((pageNum - 1) * limitNum).limit(limitNum);
        const matchingData = await findQuery;
        const filteredDocs = await GradeSectionsInInstitute.countDocuments(query);
        return res.status(200).json({ count: matchingData.length, filteredDocs, data: matchingData });
      }

      const aggregatedData = await GradeSectionsInInstitute.aggregate([
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
            from: 'grades',
            localField: 'gradeId',
            foreignField: '_id',
            as: 'gradeDetails'
          }
        },
        { $unwind: { path: '$gradeDetails', preserveNullAndEmptyArrays: true } },
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
          $project: {
            // Only use fields that exist in the model
            _id: 1,
            instituteId: 1,
            departmentId: 1,
            gradeId: 1,
            sectionName: 1,
            description: 1,
            archive: 1,
            // Add lookup data with clear naming
            instituteName: '$instituteDetails.instituteName',
            gradeCode: '$gradeDetails.gradeCode',
            gradeName: '$gradeDetails.gradeName',
            gradeDuration: '$gradeDetails.gradeDuration',
            departmentName: '$departmentDetails.departmentName'
          }
        },
        // Add pagination to aggregation
        { $skip: (pageNum - 1) * limitNum },
        { $limit: limitNum }
      ]);

      // Count after all matches - exactly match department pattern
      const countPipeline = [
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
            from: 'grades',
            localField: 'gradeId',
            foreignField: '_id',
            as: 'gradeDetails'
          }
        },
        { $unwind: { path: '$gradeDetails', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'departmentdatas',
            localField: 'departmentId',
            foreignField: '_id',
            as: 'departmentDetails'
          }
        },
        { $unwind: { path: '$departmentDetails', preserveNullAndEmptyArrays: true } }
      ];
      const filteredDocsArr = await GradeSectionsInInstitute.aggregate([...countPipeline, { $count: 'count' }]);
      const filteredDocs = filteredDocsArr[0]?.count || 0;
      
      return res.status(200).json({ count: aggregatedData.length, filteredDocs, data: aggregatedData });
    }

    // Get total count for pagination
    const totalDocs = await GradeSectionsInInstitute.countDocuments(query);

    // Aggregate all data without ID filtering
    const allData = await GradeSectionsInInstitute.aggregate([
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
            from: 'grades',
            localField: 'gradeId',
            foreignField: '_id',
            as: 'gradeDetails'
          }
        },
        { $unwind: { path: '$gradeDetails', preserveNullAndEmptyArrays: true } },
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
          $project: {
            // Only use fields that exist in the model
            _id: 1,
            instituteId: 1,
            departmentId: 1,
            gradeId: 1,
            sectionName: 1,
            description: 1,
            archive: 1,
            // Add lookup data with clear naming
            instituteName: '$instituteDetails.instituteName',
            gradeCode: '$gradeDetails.gradeCode',
            gradeName: '$gradeDetails.gradeName',
            gradeDuration: '$gradeDetails.gradeDuration',
            departmentName: '$departmentDetails.departmentName'
          }
        },
        // Add pagination to main aggregation
        { $skip: (pageNum - 1) * limitNum },
        { $limit: limitNum }
      ]);

      // Count after all matches - exactly match department pattern
      const countPipeline = [
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
            from: 'grades',
            localField: 'gradeId',
            foreignField: '_id',
            as: 'gradeDetails'
          }
        },
        { $unwind: { path: '$gradeDetails', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'departmentdatas',
            localField: 'departmentId',
            foreignField: '_id',
            as: 'departmentDetails'
          }
        },
        { $unwind: { path: '$departmentDetails', preserveNullAndEmptyArrays: true } }
      ];
      const filteredDocsArr = await GradeSectionsInInstitute.aggregate([...countPipeline, { $count: 'count' }]);
      const filteredDocs = filteredDocsArr[0]?.count || 0;

      return res.status(200).json({ count: allData.length, filteredDocs, totalDocs, data: allData });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createGradeSectionsInInstitute = async (req, res) => {
  const GradeSectionsInInstitute = createGradeSectionsInInstituteModel(req.collegeDB);
  const { instituteId, gradeId, departmentId, sectionName, description } = req.body;

  try {
    const newGradeSection = await handleCRUD(GradeSectionsInInstitute, 'create', {}, {
      instituteId,
      gradeId,
      departmentId,
      sectionName,
      description
    });

    res.status(200).json({
      message: 'Grade Section added successfully!',
      data: newGradeSection
    });
  } catch (error) {
    // Handle compound unique constraint violations
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      
      return res.status(400).json({
        error: 'Duplicate value',
        details: `Section name '${value}' already exists in this grade within the institute`,
        field: field,
        value: value,
        suggestion: 'Section names must be unique per grade within an institute'
      });
    }
    
    res.status(500).json({ error: 'Failed to add grade section', details: error.message });
  }
};

exports.updateGradeSectionsInInstitute = async (req, res) => {
  const GradeSectionsInInstitute = createGradeSectionsInInstituteModel(req.collegeDB);
  const { _id, updatedData } = req.body;

  try {
    const result = await handleCRUD(GradeSectionsInInstitute, 'update', { _id: new ObjectId(_id) }, { $set: updatedData });

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'Grade section updated successfully' });
    } else if (result.matchedCount > 0) {
      res.status(200).json({ message: 'No updates were made' });
    } else {
      res.status(404).json({ message: 'No matching grade section found or values are unchanged' });
    }
  } catch (error) {
    // Handle custom validation errors from schema middleware
    if (error.code === 'DUPLICATE_SECTION_NAME') {
      return res.status(400).json({
        error: 'Duplicate value',
        details: `Section name '${updatedData.sectionName}' already exists in this grade within the institute`,
        field: 'sectionName',
        value: updatedData.sectionName,
        suggestion: 'Section names must be unique per grade within each institute'
      });
    }
    
    // Handle unique constraint violations (fallback)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      
      let fieldDisplayName = field === 'sectionName' ? 'Section Name' : 'Section Code';
      
      return res.status(400).json({
        error: 'Duplicate value',
        details: `${fieldDisplayName} '${value}' already exists`,
        field: field,
        value: value,
        suggestion: 'Please choose a different section name'
      });
    }
    
    res.status(500).json({ error: 'Failed to update grade section', details: error.message });
  }
};

// exports.deleteGradeSectionsInInstitute = async (req, res) => {
//   const GradeSectionsInInstitute = createGradeSectionsInInstituteModel(req.collegeDB);
//   const { ids } = req.body;

//   try {
//     const objectIds = ids.map(id => new ObjectId(id));
//     const result = await handleCRUD(GradeSectionsInInstitute, 'delete', { _id: { $in: objectIds } });

//     if (result.deletedCount > 0) {
//       res.status(200).json({ message: 'Grade sections deleted successfully' });
//     } else {
//       res.status(404).json({ message: 'No matching grade sections found' });
//     }
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to delete grade sections', details: error.message });
//   }
// };


// Delete Grade Section(s) with dependency options
exports.deleteGradeSectionsInInstitute = async (req, res) => {
  // Register all dependent models for the current connection
  createGradeSectionBatchesInInstituteModel(req.collegeDB);
  createMemberDataModel(req.collegeDB);

  const GradeSectionsInInstitute = createGradeSectionsInInstituteModel(req.collegeDB);
  const { ids, deleteDependents, transferTo, archive } = req.body;

  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ message: 'Grade Section ID(s) required' });
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
    // Archive/unarchive logic (match gradeBatchesCt.js)
    if (archive !== undefined) {
      const archiveResult = await archiveParents(req.collegeDB, ids, 'GradeSections', Boolean(archive));
                              // Check if any documents were actually updated
      if (!archiveResult || !archiveResult.archivedCount) {
        return res.status(404).json({ message: 'No matching Grade Section found to archive/unarchive' });
      }
      return res.status(200).json({ message: `Grade Section(s) ${archive ? 'archived' : 'unarchived'} successfully`, archiveResult });
    }

    // 1. Count dependents for each Grade Section
    const depCounts = await countDependents(req.collegeDB, ids, gradeSectionDependents);
    // Fetch original GradeSection docs to get the value field (e.g., section)
    const originalDocs = await GradeSectionsInInstitute.find(
      { _id: { $in: ids.map(id => new ObjectId(id)) } },
      { sectionName: 1 }
    );
    const docMap = {};
    originalDocs.forEach(doc => {
      docMap[doc._id.toString()] = doc.sectionName ;
    });

    // Partition IDs into zero and non-zero dependents
    const zeroDepIds = Object.keys(depCounts).filter(id => Object.values(depCounts[id]).every(count => count === 0));
    const nonZeroDepIds = Object.keys(depCounts).filter(id => !zeroDepIds.includes(id));
    let deletedCount = 0;
    if (zeroDepIds.length > 0) {
      const result = await handleCRUD(GradeSectionsInInstitute, 'delete', { _id: { $in: zeroDepIds.map(id => new ObjectId(id)) } });
      deletedCount = result.deletedCount || 0;
    }
    if (nonZeroDepIds.length === 0) {
      return res.status(200).json({ message: 'Grade Section(s) deleted successfully', deleted: zeroDepIds, dependencies: [] });
    }
    if (!deleteDependents && !transferTo) {
      const dependencies = nonZeroDepIds.map(id => ({
        _id: id,
        value: docMap[id] ,
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
        return res.status(400).json({ message: 'Please select one Grade Section to transfer dependents from.' });
      }
      const transferRes = await transferDependents(req.collegeDB, ids[0], transferTo, gradeSectionDependents);
      // After transfer, delete the original Grade Section(s)
      const result = await handleCRUD(GradeSectionsInInstitute, 'delete', { _id: { $in: ids.map(id => new ObjectId(id)) } });
      return res.status(200).json({ message: 'Dependents transferred and Grade Section(s) deleted', transfer: transferRes, deletedCount: result.deletedCount });
    }
    // 3. Delete dependents and Grade Section(s) in a transaction
    if (deleteDependents) {
      const results = [];
      for (const id of ids) {
        const delRes = await deleteWithDependents(req.collegeDB, id, gradeSectionDependents, 'GradeSections');
        results.push({ gradeSectionId: id, ...delRes });
      }
      return res.status(200).json({ message: 'Deleted with dependents', results });
    }
    // Default: just delete the Grade Section(s) if no dependents
    const result = await handleCRUD(GradeSectionsInInstitute, 'delete', { _id: { $in: ids.map(id => new ObjectId(id)) } });
    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Grade Section(s) deleted successfully', deletedCount: result.deletedCount });
    } else {
      res.status(404).json({ message: 'No matching Grade Section found for deletion' });
    }
  } catch (error) {
    console.error('Error deleting Grade Section:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};