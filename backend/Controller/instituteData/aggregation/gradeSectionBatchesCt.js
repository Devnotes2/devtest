const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const createGradeSectionBatchesInInstituteModel = require('../../../Model/instituteData/aggregation/gradeSectionBatchesMd');
const { handleCRUD } = require('../../../Utilities/crudUtils');
const { createMemberDataModel } = require('../../../Model/membersModule/memberDataMd');

// --- Grade Section Batch DEPENDENTS CONFIG ---
const gradeSectionBatchDependents = [
  { model: 'MembersData', field: 'gradeSectionBatchId', name: 'MembersData' },
  // Add more as needed
];

exports.gradeSectionBatchesInInstituteAg = async (req, res) => {
  const GradeSectionBatchesInInstitute = createGradeSectionBatchesInInstituteModel(req.collegeDB);
  const { ids, aggregate, instituteId, gradeId, sectionId ,dropdown, departmentId} = req.query;

  try {
    const matchConditions = {};
    if (instituteId) matchConditions.instituteId = new ObjectId(instituteId);
    if (gradeId) matchConditions.gradeId = new ObjectId(gradeId);
    if (sectionId) matchConditions.sectionId = new ObjectId(sectionId);
    // Add departmentId if needed
    if (departmentId) matchConditions.departmentId = new ObjectId(departmentId);
    if (dropdown === 'true') {
      let findQuery = GradeSectionBatchesInInstitute.find({...matchConditions, archive: { $ne: true } }, { _id: 1, sectionBatchName: 1 }); // Changed from gradeSectionBatch: 1
      findQuery = findQuery.sort({sectionBatchName:1}); // Changed from gradeSectionBatch:1
      const data = await findQuery;
      return res.status(200).json({ data });
    }
if (ids && Array.isArray(ids)) {
  const objectIds = ids.map(id => new ObjectId(id));
  const matchingData = await handleCRUD(GradeSectionBatchesInInstitute, 'find', { _id: { $in: objectIds }, ...matchConditions });

  if (aggregate === 'false') {
    return res.status(200).json(matchingData);
  }

  const aggregatedData = await GradeSectionBatchesInInstitute.aggregate([
    { $match: { _id: { $in: objectIds }, ...matchConditions } },
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
        from: 'gradesections',
        localField: 'sectionId',
        foreignField: '_id',
        as: 'gradeSectionDetails'
      }
    },
    { $unwind: { path: '$gradeSectionDetails', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        sectionBatchName: 1,
        description: 1,
        instituteName: '$instituteDetails.instituteName',
        instituteId: '$instituteDetails._id',
        departmentName: '$departmentDetails.departmentName',  // Added this field
        gradeCode: '$gradeDetails.gradeCode',
        gradeName: '$gradeDetails.gradeName',
        gradeDuration: '$gradeDetails.gradeDuration',
        sectionName: '$gradeSectionDetails.sectionName'
      }
    }
  ]);

  return res.status(200).json(aggregatedData);
}

// If no specific IDs, fetch all data
const allData = await GradeSectionBatchesInInstitute.aggregate([
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
      from: 'grades',
      localField: 'gradeId',
      foreignField: '_id',
      as: 'gradeDetails'
    }
  },
  { $unwind: { path: '$gradeDetails', preserveNullAndEmptyArrays: true } },
  {
    $lookup: {
      from: 'gradesections',
      localField: 'sectionId',
      foreignField: '_id',
      as: 'gradeSectionDetails'
    }
  },
  { $unwind: { path: '$gradeSectionDetails', preserveNullAndEmptyArrays: true } },
  {
    $project: {
      sectionBatchName: 1,
      description: 1,
      instituteName: '$instituteDetails.instituteName',
      instituteId: '$instituteDetails._id',
      departmentName: '$departmentDetails.departmentName',  // Added this field
      gradeCode: '$gradeDetails.gradeCode',
      gradeName: '$gradeDetails.gradeName',
      gradeDuration: '$gradeDetails.gradeDuration',
      sectionName: '$gradeSectionDetails.sectionName'
    }
  }
]);

return res.status(200).json(allData);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createGradeSectionBatchesInInstitute = async (req, res) => {
  const GradeSectionBatchesInInstitute = createGradeSectionBatchesInInstituteModel(req.collegeDB);
  // Add departmentId and description, change gradeSectionBatch to sectionBatchName
    const { instituteId, gradeId, departmentId, sectionBatchName, description, sectionId } = req.body;
    console.log("Request Body:", req.body);
  try {
    const newGradeSection = await handleCRUD(GradeSectionBatchesInInstitute, 'create', {}, {
      instituteId,
      departmentId,        // Added this field
      gradeId,
      sectionId,
      sectionBatchName,    // Changed from gradeSectionBatch
      description,          // Added this field
    });
    console.log("New Grade Section Batch:", newGradeSection);
    res.status(200).json({
      message: 'GradeSection added successfully!',
      data: newGradeSection
    });
  } catch (error) {
    // Handle unique constraint violations
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      console.log("Error Key Pattern:", error.keyPattern);
      console.log("Error Key Value:", error.keyValue);
      let fieldDisplayName = field === 'sectionBatchName' ? 'Section Batch Name' : 'Section Batch Code';
      
      return res.status(400).json({
        error: 'Duplicate value',
        details: `${fieldDisplayName} '${value}' already exists`,
        field: field,
        value: value,
        suggestion: 'Please choose a different section batch name'
      });
    }
    
    res.status(500).json({ error: 'Failed to add grade section batch ', details: error.message });
  }
};


exports.updateGradeSectionBatchesInInstitute = async (req, res) => {
  const GradeSectionBatchesInInstitute = createGradeSectionBatchesInInstituteModel(req.collegeDB);
  const { _id, updatedData } = req.body;

  try {
    const result = await handleCRUD(GradeSectionBatchesInInstitute, 'update', { _id }, { $set: updatedData });

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'GradeSection updated successfully' });
    } else if (result.matchedCount > 0 && result.modifiedCount === 0) {
      res.status(200).json({ message: 'No updates were made' });
    } else {
      res.status(404).json({ message: 'No matching gradeSection found or values are unchanged' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update gradeSection', details: error.message });
  }
};

// exports.deleteGradeSectionBatchesInInstitute = async (req, res) => {
//   const GradeSectionBatchesInInstitute = createGradeSectionBatchesInInstituteModel(req.collegeDB);
//   const { ids } = req.body;

//   try {
//     const result = await handleCRUD(GradeSectionBatchesInInstitute, 'delete', { _id: { $in: ids.map(id => id) } });

//     if (result.deletedCount > 0) {
//       res.status(200).json({ message: 'GradeSectionBatches deleted successfully' });
//     } else {
//       res.status(404).json({ message: 'No matching gradeSectionBatches found' });
//     }
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to delete gradeSectionBatches', details: error.message });
//   }
// };

// Delete Grade Section Batch(s) with dependency options
exports.deleteGradeSectionBatchesInInstitute = async (req, res) => {
  // Register all dependent models for the current connection
  createMemberDataModel(req.collegeDB);

  const GradeSectionBatchesInInstitute = createGradeSectionBatchesInInstituteModel(req.collegeDB);
  const { ids, deleteDependents, transferTo, archive } = req.body;

  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ message: 'Grade Section Batch ID(s) required' });
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
      const archiveResult = await archiveParents(req.collegeDB, ids, 'GradeSectionBatches', Boolean(archive));
                        // Check if any documents were actually updated
      if (!archiveResult || !archiveResult.archivedCount) {
        return res.status(404).json({ message: 'No matching Grade Section Batch found to archive/unarchive' });
      }
      return res.status(200).json({ message: `Grade Section Batch(s) ${archive ? 'archived' : 'unarchived'} successfully`, archiveResult });
    }

    // 1. Count dependents for each Grade Section Batch
    const depCounts = await countDependents(req.collegeDB, ids, gradeSectionBatchDependents);
    // Fetch original GradeSectionBatch docs to get the value field (e.g., gradeSectionBatch)
    const originalDocs = await GradeSectionBatchesInInstitute.find(
      { _id: { $in: ids.map(id => new ObjectId(id)) } },
      { sectionBatchName: 1 }  // Changed from gradeSectionBatch: 1
    );
    const docMap = {};
    originalDocs.forEach(doc => {
      docMap[doc._id.toString()] = doc.sectionBatchName;  // Changed from gradeSectionBatch
    });

    // Partition IDs into zero and non-zero dependents
    const zeroDepIds = Object.keys(depCounts).filter(id => Object.values(depCounts[id]).every(count => count === 0));
    const nonZeroDepIds = Object.keys(depCounts).filter(id => !zeroDepIds.includes(id));
    let deletedCount = 0;
    if (zeroDepIds.length > 0) {
      const result = await handleCRUD(GradeSectionBatchesInInstitute, 'delete', { _id: { $in: zeroDepIds.map(id => new ObjectId(id)) } });
      deletedCount = result.deletedCount || 0;
    }
    if (nonZeroDepIds.length === 0) {
      return res.status(200).json({ message: 'Grade Section Batch(s) deleted successfully', deleted: zeroDepIds, dependencies: [] });
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
        return res.status(400).json({ message: 'Please select one Grade Section Batch to transfer dependents from.' });
      }
      const transferRes = await transferDependents(req.collegeDB, ids[0], transferTo, gradeSectionBatchDependents);
      // After transfer, delete the original Grade Section Batch(s)
      const result = await handleCRUD(GradeSectionBatchesInInstitute, 'delete', { _id: { $in: ids.map(id => new ObjectId(id)) } });
      return res.status(200).json({ message: 'Dependents transferred and Grade Section Batch(s) deleted', transfer: transferRes, deletedCount: result.deletedCount });
    }
    // 3. Delete dependents and Grade Section Batch(s) in a transaction
    if (deleteDependents) {
      const results = [];
      for (const id of ids) {
        const delRes = await deleteWithDependents(req.collegeDB, id, gradeSectionBatchDependents, 'GradeSectionBatches');
        results.push({ gradeSectionBatchId: id, ...delRes });
      }
      return res.status(200).json({ message: 'Deleted with dependents', results });
    }
    // Default: just delete the Grade Section Batch(s) if no dependents
    const result = await handleCRUD(GradeSectionBatchesInInstitute, 'delete', { _id: { $in: ids.map(id => new ObjectId(id)) } });
    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Grade Section Batch(s) deleted successfully', deletedCount: result.deletedCount });
    } else {
      res.status(404).json({ message: 'No matching Grade Section Batch found for deletion' });
    }
  } catch (error) {
    console.error('Error deleting Grade Section Batch:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};