const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const createGradeBatchesInInstituteModel = require('../../../Model/instituteData/aggregation/gradeBatchesMd');
const { handleCRUD } = require('../../../Utilities/crudUtils');
const { createMemberDataModel } = require('../../../Model/membersModule/memberDataMd');

// --- Grade DEPENDENTS CONFIG ---
const gradeBatchDependents = [
  { model: 'MembersData', field: 'gradeBatchId', name: 'MembersData' },
  // Add more as needed
];

exports.gradeBatchesInInstituteAg = async (req, res) => {
  const GradeBatchesInInstitute = createGradeBatchesInInstituteModel(req.collegeDB);
  const { ids, aggregate, instituteId, gradeId, dropdown, departmentId, page, limit } = req.query;

  try {
    // Add pagination parameters - exactly match department pattern
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    const matchConditions = {};
    if (instituteId) matchConditions.instituteId = new ObjectId(instituteId);
    if (gradeId) matchConditions.gradeId = new ObjectId(gradeId);
    if (departmentId) matchConditions.departmentId = new ObjectId(departmentId);
    
    if (dropdown === 'true') {
      // Fix: Change gradeBatch to batch to match model
      let findQuery = GradeBatchesInInstitute.find({...matchConditions, archive: { $ne: true } }, { _id: 1, batch: 1 });
      findQuery = findQuery.sort({batch:1});
      const data = await findQuery;
      return res.status(200).json({ data });
    }
    
    const query = { ...matchConditions };
    
    if (ids && Array.isArray(ids)) {
      const objectIds = ids.map(id => new ObjectId(id));
      query._id = { $in: objectIds };
      
      if (aggregate === 'false') {
        // Add pagination to simple find - exactly match department pattern
        let findQuery = GradeBatchesInInstitute.find(query);
        findQuery = findQuery.skip((pageNum - 1) * limitNum).limit(limitNum);
        const matchingData = await findQuery;
        const filteredDocs = await GradeBatchesInInstitute.countDocuments(query);
        return res.status(200).json({ count: matchingData.length, filteredDocs, data: matchingData });
      }

      const aggregatedData = await GradeBatchesInInstitute.aggregate([
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
            batch: 1,
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
      const filteredDocsArr = await GradeBatchesInInstitute.aggregate([...countPipeline, { $count: 'count' }]);
      const filteredDocs = filteredDocsArr[0]?.count || 0;
      
      return res.status(200).json({ count: aggregatedData.length, filteredDocs, data: aggregatedData });
    }

    // Get total count for pagination
    const totalDocs = await GradeBatchesInInstitute.countDocuments(query);

    // Aggregate all data without ID filtering
    const allData = await GradeBatchesInInstitute.aggregate([
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
          batch: 1,
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
    const filteredDocsArr = await GradeBatchesInInstitute.aggregate([...countPipeline, { $count: 'count' }]);
    const filteredDocs = filteredDocsArr[0]?.count || 0;

    return res.status(200).json({ count: allData.length, filteredDocs, totalDocs, data: allData });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createGradeBatchesInInstitute = async (req, res) => {
  const GradeBatchesInInstitute = createGradeBatchesInInstituteModel(req.collegeDB);
  const { instituteId, gradeId, departmentId, batch, description } = req.body;

  try {
    const newGradeBatch = await handleCRUD(GradeBatchesInInstitute, 'create', {}, {
      instituteId,
      gradeId,
      departmentId,
      batch,
      description
    });

    res.status(200).json({
      message: 'GradeBatch added successfully!',
      data: newGradeBatch
    });
  } catch (error) {
    // Handle compound unique constraint violations
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      
      return res.status(400).json({
        error: 'Duplicate value',
        details: `Batch name '${value}' already exists in this grade within the institute`,
        field: field,
        value: value,
        suggestion: 'Batch names must be unique per grade within an institute'
      });
    }
    
    res.status(500).json({ error: 'Failed to add gradeBatch', details: error.message });
  }
};



exports.updateGradeBatchesInInstitute = async (req, res) => {
  const GradeBatchesInInstitute = createGradeBatchesInInstituteModel(req.collegeDB);
  const { _id, updatedData } = req.body;

  try {
    const result = await handleCRUD(GradeBatchesInInstitute, 'update', { _id }, { $set: updatedData });

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'GradeBatch updated successfully' });
    } else if (result.matchedCount > 0 && result.modifiedCount === 0) {
      res.status(200).json({ message: 'No updates were made' });
    } else {
      res.status(404).json({ message: 'No matching grade found or values are unchanged' });
    }
  } catch (error) {
    // Handle custom validation errors from schema middleware
    if (error.code === 'DUPLICATE_BATCH_NAME') {
      return res.status(400).json({
        error: 'Duplicate value',
        details: `Batch name '${updatedData.batch}' already exists in this grade within the institute`,
        field: 'batch',
        value: updatedData.batch,
        suggestion: 'Batch names must be unique per grade within each institute'
      });
    }
    
    res.status(500).json({ error: 'Failed to update gradeBatch', details: error.message });
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
  const { ids, deleteDependents, transferTo, archive } = req.body;

  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ message: 'Grade Batch ID(s) required' });
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
      const archiveResult = await archiveParents(req.collegeDB, ids, 'GradeBatches', Boolean(archive));
                  // Check if any documents were actually updated
      if (!archiveResult || !archiveResult.archivedCount) {
        return res.status(404).json({ message: 'No matching Grade Batch found to archive/unarchive' });
      }
      return res.status(200).json({ message: `Grade Batch(s) ${archive ? 'archived' : 'unarchived'} successfully`, archiveResult });
    }

    // 1. Count dependents for each Grade Batch
    const depCounts = await countDependents(req.collegeDB, ids, gradeBatchDependents);
    // Fetch original GradeBatch docs to get the value field (e.g., batch)
    const originalDocs = await GradeBatchesInInstitute.find(
      { _id: { $in: ids.map(id => new ObjectId(id)) } },
      { batch: 1 }
    );
    const docMap = {};
    originalDocs.forEach(doc => {
      docMap[doc._id.toString()] = doc.batch;
    });

    // Partition IDs into zero and non-zero dependents
    const zeroDepIds = Object.keys(depCounts).filter(id => Object.values(depCounts[id]).every(count => count === 0));
    const nonZeroDepIds = Object.keys(depCounts).filter(id => !zeroDepIds.includes(id));
    let deletedCount = 0;
    if (zeroDepIds.length > 0) {
      const result = await handleCRUD(GradeBatchesInInstitute, 'delete', { _id: { $in: zeroDepIds.map(id => new ObjectId(id)) } });
      deletedCount = result.deletedCount || 0;
    }
    if (nonZeroDepIds.length === 0) {
      return res.status(200).json({ message: 'Grade Batch(s) deleted successfully', deleted: zeroDepIds, dependencies: [] });
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