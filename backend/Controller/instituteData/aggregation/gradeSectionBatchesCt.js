const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const createGradeSectionBatchesInInstituteModel = require('../../../Model/instituteData/aggregation/gradeSectionBatchesMd');
const { handleCRUD } = require('../../../Utilities/crudUtils');
const createMemberDataModel = require('../../../Model/membersModule/memberDataMd');

// --- Grade Section Batch DEPENDENTS CONFIG ---
const gradeSectionBatchDependents = [
  { model: 'MembersData', field: 'instituteId', name: 'MembersData' },
  // Add more as needed
];

exports.gradeSectionBatchesInInstituteAg = async (req, res) => {
  const GradeSectionBatchesInInstitute = createGradeSectionBatchesInInstituteModel(req.collegeDB);
  const { ids, aggregate, instituteId, gradeId, gradeSectionId ,dropdown} = req.query;

  try {
    const matchConditions = {};
    if (instituteId) matchConditions.instituteId = new ObjectId(instituteId);
    if (gradeId) matchConditions.gradeId = new ObjectId(gradeId);
    if (gradeSectionId) matchConditions.gradeSectionId = new ObjectId(gradeSectionId);
    if (dropdown === 'true') {
      let findQuery = GradeSectionBatchesInInstitute.find(matchConditions, { _id: 1, gradeSectionBatch: 1 });
      findQuery = findQuery.sort({gradeSectionBatch:1});
      const data = await findQuery;
      return res.status(200).json({ data });
    }
// ...existing code...
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
        localField: 'gradeSectionId',
        foreignField: '_id',
        as: 'gradeSectionDetails'
      }
    },
    { $unwind: { path: '$gradeSectionDetails', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        gradeSectionBatch: 1,
        instituteName: '$instituteDetails.instituteName',
        instituteId: '$instituteDetails._id',
        gradeCode: '$gradeDetails.gradeCode',
        gradeDescription: '$gradeDetails.gradeDescription',
        gradeDuration: '$gradeDetails.gradeDuration',
        isElective: '$gradeDetails.isElective',
        section: '$gradeSectionDetails.section'
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
      localField: 'gradeSectionId',
      foreignField: '_id',
      as: 'gradeSectionDetails'
    }
  },
  { $unwind: { path: '$gradeSectionDetails', preserveNullAndEmptyArrays: true } },
  {
    $project: {
      gradeSectionBatch: 1,
      instituteName: '$instituteDetails.instituteName',
      instituteId: '$instituteDetails._id',
      gradeCode: '$gradeDetails.gradeCode',
      gradeDescription: '$gradeDetails.gradeDescription',
      gradeDuration: '$gradeDetails.gradeDuration',
      isElective: '$gradeDetails.isElective',
      section: '$gradeSectionDetails.section'
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
  const { instituteId, gradeId, gradeSectionBatch, gradeSectionId } = req.body;

  try {
    const newGradeSection = await handleCRUD(GradeSectionBatchesInInstitute, 'create', {}, {
      instituteId,
      gradeSectionBatch,
      gradeId,
      gradeSectionId
    });

    res.status(200).json({
      message: 'GradeSection added successfully!',
      data: newGradeSection
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add grade', details: error.message });
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
  const { ids, deleteDependents, transferTo } = req.body;

  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ message: 'Grade Section Batch ID(s) required' });
  }

  // Import generic cascade utils
  const { countDependents, deleteWithDependents, transferDependents } = require('../../../Utilities/dependencyCascadeUtils');

  try {
    // 1. Count dependents for each Grade Section Batch
    const depCounts = await countDependents(req.collegeDB, ids, gradeSectionBatchDependents);
    // If all dependent counts are zero, delete directly
    const allZero = depCounts.every(dep => Object.values(dep).every(count => count === 0));
    if (allZero) {
      const result = await handleCRUD(GradeSectionBatchesInInstitute, 'delete', { _id: { $in: ids.map(id => new ObjectId(id)) } });
      if (result.deletedCount > 0) {
        return res.status(200).json({ message: 'Grade Section Batch(s) deleted successfully', deletedCount: result.deletedCount });
      } else {
        return res.status(404).json({ message: 'No matching Grade Section Batch found for deletion' });
      }
    }
    // If not all zero, keep existing logic
    if (!deleteDependents && !transferTo) {
      return res.status(200).json({ message: 'Dependency summary', dependencies: depCounts });
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