const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const createGradeSectionsInInstituteModel = require('../../../Model/instituteData/aggregation/gradesectionsMd');
const { handleCRUD } = require('../../../Utilities/crudUtils');
const createGradeSectionBatchesInInstituteModel = require('../../../Model/instituteData/aggregation/gradeSectionBatchesMd');
const createMemberDataModel = require('../../../Model/membersModule/memberDataMd');

// --- Grade Section DEPENDENTS CONFIG ---
const gradeSectionDependents = [
  { model: 'MembersData', field: 'gradeSectionId', name: 'MembersData' },
  { model: 'GradeSectionBatches', field: 'gradeSectionId', name: 'gradesectionbatches' }
  // Add more as needed
];

exports.gradeSectionsInInstituteAg = async (req, res) => {
  const GradeSectionsInInstitute = createGradeSectionsInInstituteModel(req.collegeDB);
  const { ids, instituteId, gradeId, section, aggregate ,dropdown} = req.query;

  try {
    const matchConditions = {};
    if (instituteId) matchConditions.instituteId = new ObjectId(instituteId);
    if (gradeId) matchConditions.gradeId = new ObjectId(gradeId);
    if (section) matchConditions.section = String(section);
    if (dropdown === 'true') {
      let findQuery = GradeSectionsInInstitute.find(matchConditions, { _id: 1, section: 1 });
      findQuery = findQuery.sort({section:1});
      const data = await findQuery;
      return res.status(200).json({ data });
    }
    const query = { ...matchConditions };
    console.log('');
    if (ids && Array.isArray(ids)) {
      const objectIds = ids.map(id => new ObjectId(id));
      query._id = { $in: objectIds };
      if (aggregate === 'false') {
        console.log('without aggre');
        const matchingData = await handleCRUD(GradeSectionsInInstitute, 'find', query);
        return res.status(200).json(matchingData);
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
            section: 1,
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
          section: 1,
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
    console.error('Error in gradeSectionsInInstituteAg:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createGradeSectionsInInstitute = async (req, res) => {
  const GradeSectionsInInstitute = createGradeSectionsInInstituteModel(req.collegeDB);
  const { instituteId, gradeId, section } = req.body;

  try {
    const newSection = await handleCRUD(GradeSectionsInInstitute, 'create', {}, {
      instituteId,
      gradeId,
      section
    });

    res.status(200).json({
      message: 'Grade section added successfully!',
      data: newSection
    });
  } catch (error) {
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
  const { ids, deleteDependents, transferTo } = req.body;

  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ message: 'Grade Section ID(s) required' });
  }

  // Import generic cascade utils
  const { countDependents, deleteWithDependents, transferDependents } = require('../../../Utilities/dependencyCascadeUtils');

  try {
    // 1. Count dependents for each Grade Section
    const depCounts = await countDependents(req.collegeDB, ids, gradeSectionDependents);
    // Fetch original GradeSection docs to get the value field (e.g., section)
    const originalDocs = await GradeSectionsInInstitute.find(
      { _id: { $in: ids.map(id => new ObjectId(id)) } },
      { section: 1 }
    );
    const docMap = {};
    originalDocs.forEach(doc => {
      docMap[doc._id.toString()] = doc.section;
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