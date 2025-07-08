const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const createGradeBatchesInInstituteModel = require('../../../Model/instituteData/aggregation/gradeBatchesMd');
const { handleCRUD } = require('../../../Utilities/crudUtils');
const createMemberDataModel = require('../../../Model/membersModule/memberDataMd');

// --- Grade DEPENDENTS CONFIG ---
const gradeBatchDependents = [
  { model: 'MembersData', field: 'instituteId', name: 'MembersData' },
  // Add more as needed
];

exports.gradeBatchesInInstituteAg = async (req, res) => {
  const GradeBatchesInInstitute = createGradeBatchesInInstituteModel(req.collegeDB);
  const { ids, aggregate, instituteId, gradeId, batch ,dropdown} = req.query;

  try {
    const matchConditions = {};
    if (instituteId) matchConditions.instituteId = new ObjectId(instituteId);
    if (gradeId) matchConditions.gradeId = new ObjectId(gradeId);
    if (batch) matchConditions.batch = batch;
    console.log('Match conditions:', ids);
    
        // Dropdown mode: return only _id and subject, with sorting and filtering
    if (dropdown === 'true') {
      let findQuery = GradeBatchesInInstitute.find(matchConditions, { _id: 1, batch: 1 });
      findQuery = findQuery.sort({batch:1});
      const data = await findQuery;
      return res.status(200).json({ data });
    }
    // If specific IDs are requested
    if (ids && Array.isArray(ids)) {
      const objectIds = ids.map(id => new ObjectId(id));
      const matchingData = await handleCRUD(
        GradeBatchesInInstitute,
        'find',
        { _id: { $in: objectIds }, ...matchConditions }
      );

      if (aggregate === 'false') {
        return res.status(200).json(matchingData);
      }
      console.log('Matching data:', matchingData);
      const aggregatedData = await GradeBatchesInInstitute.aggregate([
        { $match: { _id: { $in: objectIds }, ...matchConditions } },
        {
          $lookup: {
            from: 'instituteData',
            localField: 'instituteId',
            foreignField: '_id',
            as: 'instituteDetails'
          }
        },
        { $unwind: '$instituteDetails' },
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
            batch: 1,
            instituteName: '$instituteDetails.instituteName',
            instituteId: '$instituteDetails._id',
            gradeCode: '$gradeDetails.gradeCode',
            gradeDescription: '$gradeDetails.gradeDescription',
            gradeDuration: '$gradeDetails.gradeDuration',
            isElective: '$gradeDetails.isElective'
          }
        }
      ]);

      return res.status(200).json(aggregatedData);
    }

    // If no specific IDs, fetch all data
    const allData = await GradeBatchesInInstitute.aggregate([
      { $match: { ...matchConditions } },
      {
        $lookup: {
          from: 'instituteData',
          localField: 'instituteId',
          foreignField: '_id',
          as: 'instituteDetails'
        }
      },
      { $unwind: '$instituteDetails' },
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
          batch: 1,
          instituteName: '$instituteDetails.instituteName',
          instituteId: '$instituteDetails._id',
          gradeCode: '$gradeDetails.gradeCode',
          gradeDescription: '$gradeDetails.gradeDescription',
          gradeDuration: '$gradeDetails.gradeDuration',
          isElective: '$gradeDetails.isElective'
        }
      }
    ]);

    return res.status(200).json(allData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createGradeBatchesInInstitute = async (req, res) => {
  const GradeBatchesInInstitute = createGradeBatchesInInstituteModel(req.collegeDB);
  const { instituteId, gradeId, batch } = req.body;

  try {
    const newGradeSection = await handleCRUD(GradeBatchesInInstitute, 'create', {}, {
      instituteId,
      gradeId,
      batch
    });

    res.status(200).json({
      message: 'GradeBatch added successfully!',
      data: newGradeSection
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add gradeBatch', details: error.message });
  }
};



exports.updateGradeBatchesInInstitute = async (req, res) => {
  const GradeBatchesInInstitute = createGradeBatchesInInstituteModel(req.collegeDB);
  const { _id, updatedData } = req.body;

  try {
    const result = await handleCRUD(GradeBatchesInInstitute, 'update', { _id }, { $set: updatedData });

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'GradeSection updated successfully' });
    } else if (result.matchedCount > 0 && result.modifiedCount === 0) {
      res.status(200).json({ message: 'No updates were made' });
    } else {
      res.status(404).json({ message: 'No matching grade found or values are unchanged' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update grade', details: error.message });
  }
};


// exports.deleteGradeBatchesInInstitute = async (req, res) => {
//   const GradeBatchesInInstitute = createGradeBatchesInInstituteModel(req.collegeDB);
//   const { ids } = req.body;

//   try {
//     const result = await handleCRUD(GradeBatchesInInstitute, 'delete', { _id: { $in: ids.map(id => id) } });

//     if (result.deletedCount > 0) {
//       res.status(200).json({ message: 'GradeBatches deleted successfully' });
//     } else {
//       res.status(404).json({ message: 'No matching gradeBatches found' });
//     }
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to delete gradeBatches', details: error.message });
//   }
// };

// Delete Grade Batch(s) with dependency options
exports.deleteGradeBatchesInInstitute = async (req, res) => {
  // Register all dependent models for the current connection
  createMemberDataModel(req.collegeDB);

  const GradeBatchesInInstitute = createGradeBatchesInInstituteModel(req.collegeDB);
  const { ids, deleteDependents, transferTo } = req.body;

  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ message: 'Grade Batch ID(s) required' });
  }

  // Import generic cascade utils
  const { countDependents, deleteWithDependents, transferDependents } = require('../../../Utilities/dependencyCascadeUtils');

  try {
    // 1. Count dependents for each Grade Batch
    const depCounts = await countDependents(req.collegeDB, ids, gradeBatchDependents);
    // If all dependent counts are zero, delete directly
    const allZero = depCounts.every(dep => Object.values(dep).every(count => count === 0));
    if (allZero) {
      const result = await handleCRUD(GradeBatchesInInstitute, 'delete', { _id: { $in: ids.map(id => new ObjectId(id)) } });
      if (result.deletedCount > 0) {
        return res.status(200).json({ message: 'Grade Batch(s) deleted successfully', deletedCount: result.deletedCount });
      } else {
        return res.status(404).json({ message: 'No matching Grade Batch found for deletion' });
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
        return res.status(400).json({ message: 'Please select one Grade Batch to transfer dependents from.' });
      }
      const transferRes = await transferDependents(req.collegeDB, ids[0], transferTo, gradeBatchDependents);
      // After transfer, delete the original Grade Batch(s)
      const result = await handleCRUD(GradeBatchesInInstitute, 'delete', { _id: { $in: ids.map(id => new ObjectId(id)) } });
      return res.status(200).json({ message: 'Dependents transferred and Grade Batch(s) deleted', transfer: transferRes, deletedCount: result.deletedCount });
    }
    // 3. Delete dependents and Grade(s) in a transaction
    if (deleteDependents) {
      const results = [];
      for (const id of ids) {
        const delRes = await deleteWithDependents(req.collegeDB, id, gradeBatchDependents, 'GradeBatches');
        results.push({ gradeBatchId: id, ...delRes });
      }
      return res.status(200).json({ message: 'Deleted with dependents', results });
    }
    // Default: just delete the Grade Batch(s) if no dependents
    const result = await handleCRUD(GradeBatchesInInstitute, 'delete', { _id: { $in: ids.map(id => new ObjectId(id)) } });
    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Grade Batch(s) deleted successfully', deletedCount: result.deletedCount });
    } else {
      res.status(404).json({ message: 'No matching Grade Batch found for deletion' });
    }
  } catch (error) {
    console.error('Error deleting Grade Batch:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};