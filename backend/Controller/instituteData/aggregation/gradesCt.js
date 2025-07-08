const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const createGradesInInstituteModel = require('../../../Model/instituteData/aggregation/gradesMd');
const { handleCRUD } = require('../../../Utilities/crudUtils');
const { buildMatchConditions, buildSortObject } = require('../../../Utilities/filterSortUtils');
const createSubjectsInInstituteModel = require('../../../Model/instituteData/aggregation/subjectsMd');
const createGradeBatchesInInstituteModel = require('../../../Model/instituteData/aggregation/gradeBatchesMd');
const createGradeSectionsInInstituteModel = require('../../../Model/instituteData/aggregation/gradesectionsMd');
const createGradeSectionBatchesInInstituteModel = require('../../../Model/instituteData/aggregation/gradeSectionBatchesMd');
const createMemberDataModel = require('../../../Model/membersModule/memberDataMd');

// --- Grade DEPENDENTS CONFIG ---
const gradesDependents = [
  { model: 'Subjects', field: 'instituteId', name: 'subjects' },
  { model: 'MembersData', field: 'instituteId', name: 'MembersData' },
  { model: 'GradeBatches', field: 'instituteId', name: 'gradebatches' },
  { model: 'GradeSections', field: 'instituteId', name: 'gradesections' },
  { model: 'GradeSectionBatches', field: 'instituteId', name: 'gradesectionbatches' }
  // Add more as needed
];


exports.gradesInInstituteAg = async (req, res) => {
  const GradesInInstitute = createGradesInInstituteModel(req.collegeDB);
  try {
    // Use utility for filtering
    const matchConditions = buildMatchConditions(req.query);
    // Use utility for sorting
    const sortObj = buildSortObject(req.query);
    const { ids, aggregate ,dropdown} = req.query;
    // Dropdown mode: return only _id and subject, with sorting and filtering
    if (dropdown === 'true') {
      let findQuery = GradesInInstitute.find(matchConditions, { _id: 1, gradeDescription: 1 });
      findQuery = findQuery.sort({gradeDescription:1});
      const data = await findQuery;
      return res.status(200).json({ data });
    }
    if (ids && Array.isArray(ids)) {
      const objectIds = ids.map(id => new ObjectId(id));
      const matchingData = await handleCRUD(GradesInInstitute, 'find', { _id: { $in: objectIds }, ...matchConditions });
      if (aggregate === 'false') {
        return res.status(200).json(matchingData);
      }
      const aggregatedData = await GradesInInstitute.aggregate([
        { $match: { _id: { $in: objectIds }, ...matchConditions } },
        {
          $lookup: {
            from: 'instituteData', // Reference the new structure
            localField: 'instituteId',
            foreignField: '_id',
            as: 'instituteDetails'
          }
        },
{ $unwind: { path: '$instituteDetails', preserveNullAndEmptyArrays: true } },
                {
          $lookup: {
            from: 'departmentdatas', // Reference the new structure
            localField: 'departmentId',
            foreignField: '_id',
            as: 'departmentDetails'
          }
        },
{ $unwind: { path: '$departmentDetails', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'generalData',
            let: { gradeDurationId: '$gradeDuration' },
            pipeline: [
              { $match: { _id: 'gradeDuration' } },
              { $unwind: '$data' },
              { $match: { $expr: { $eq: ['$data._id', '$$gradeDurationId'] } } },
              { $project: { gradeDurationValue: '$data.value' } }
            ],
            as: 'gradeDurationDetails'
          }
        },
{ $unwind: { path: '$gradeDurationDetails', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'generalData',
            let: { electiveFlag: '$isElective' },
            pipeline: [
              { $match: { _id: 'booleanChoices' } },
              { $unwind: '$data' },
              { $match: { $expr: { $eq: ['$data._id', '$$electiveFlag'] } } },
              { $project: { isElectiveValue: '$data.value' } }
            ],
            as: 'isElectiveDetails'
          }
        },
{ $unwind: { path: '$isElectiveDetails', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            gradeCode: 1,
            gradeDescription: 1,
            instituteName: '$instituteDetails.instituteName',
            departmentName:'$departmentDetails.departmentName',
            instituteId: '$instituteDetails._id',
            gradeDuration: '$gradeDurationDetails.gradeDurationValue',
            isElective: '$isElectiveDetails.isElectiveValue'
          }
        },
        { $sort: sortObj }
      ]);
      return res.status(200).json(aggregatedData);
    }

    const allData = await GradesInInstitute.aggregate([
      { $match: { ...matchConditions } },
      {
        $lookup: {
          from: 'instituteData', // Reference the new structure
          localField: 'instituteId',
          foreignField: '_id',
          as: 'instituteDetails'
        }
      },
{ $unwind: { path: '$instituteDetails', preserveNullAndEmptyArrays: true } },
      {
          $lookup: {
            from: 'departmentdatas', // Reference the new structure
            localField: 'departmentId',
            foreignField: '_id',
            as: 'departmentDetails'
          }
        },
{ $unwind: { path: '$departmentDetails', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'generalData',
          let: { gradeDurationId: '$gradeDuration' },
          pipeline: [
            { $match: { _id: 'gradeDuration' } },
            { $unwind: '$data' },
            { $match: { $expr: { $eq: ['$data._id', '$$gradeDurationId'] } } },
            { $project: { gradeDurationValue: '$data.value' } }
          ],
          as: 'gradeDurationDetails'
        }
      },
{ $unwind: { path: '$gradeDurationDetails', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'generalData',
          let: { electiveFlag: '$isElective' },
          pipeline: [
            { $match: { _id: 'booleanChoices' } },
            { $unwind: '$data' },
            { $match: { $expr: { $eq: ['$data._id', '$$electiveFlag'] } } },
            { $project: { isElectiveValue: '$data.value' } }
          ],
          as: 'isElectiveDetails'
        }
      },
{ $unwind: { path: '$isElectiveDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          gradeCode: 1,
          gradeDescription: 1,
          instituteName: '$instituteDetails.instituteName',
          departmentName:'$departmentDetails.departmentName',
          instituteId: '$instituteDetails._id',
          gradeDuration: '$gradeDurationDetails.gradeDurationValue',
          isElective: '$isElectiveDetails.isElectiveValue'
        }
      },
      { $sort: sortObj }
    ]);
    return res.status(200).json(allData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createGradesInInstitute = async (req, res) => {
  const GradesInInstitute = createGradesInInstituteModel(req.collegeDB);
  const { instituteId, gradeCode, gradeDescription, gradeDuration, isElective,department } = req.body;

  try {
    const newGrade = await handleCRUD(GradesInInstitute, 'create', {}, {
      instituteId,
      gradeCode,
      department,
      gradeDescription,
      gradeDuration,
      isElective
    });

    res.status(200).json({
      message: 'Grade added successfully!',
      data: newGrade
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add grade', details: error.message });
  }
};



exports.updateGradesInInstitute = async (req, res) => {
  const GradesInInstitute = createGradesInInstituteModel(req.collegeDB);
  const { _id, updatedData } = req.body;

  try {
    console.log("Update Request Body:", req.body); // Log the request body
    const result = await handleCRUD(GradesInInstitute, 'update', { _id }, { $set: updatedData });

    console.log("Update Result:", result); // Log the result of the update operation

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'Grade updated successfully' });
    } else if (result.matchedCount > 0 && result.modifiedCount === 0) {
      res.status(200).json({ message: 'No updates were made' });
    } else {
      res.status(404).json({ message: 'No matching grade found or values are unchanged' });
    }
  } catch (error) {
    console.error("Update Error:", error); // Log the error
    res.status(500).json({ error: 'Failed to update grade', details: error.message });
  }
};


// exports.deleteGradesInInstitute = async (req, res) => {
//   const GradesInInstitute = createGradesInInstituteModel(req.collegeDB);
//   const { ids } = req.body;

//   try {
//     const result = await handleCRUD(GradesInInstitute, 'delete', { _id: { $in: ids.map(id => id) } });

//     if (result.deletedCount > 0) {
//       res.status(200).json({ message: 'Grades deleted successfully' });
//     } else {
//       res.status(404).json({ message: 'No matching grades found' });
//     }
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to delete grades', details: error.message });
//   }
// };


// Delete grades(s) with dependency options
exports.deleteGradesInInstitute = async (req, res) => {
  // Register all dependent models for the current connection
  createSubjectsInInstituteModel(req.collegeDB);
  createGradeBatchesInInstituteModel(req.collegeDB);
  createGradeSectionsInInstituteModel(req.collegeDB);
  createGradeSectionBatchesInInstituteModel(req.collegeDB);
  createMemberDataModel(req.collegeDB);

  const Grade = createGradesInInstituteModel(req.collegeDB);
  const { ids, deleteDependents, transferTo } = req.body;

  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ message: 'Grade ID(s) required' });
  }

  // Import generic cascade utils
  const { countDependents, deleteWithDependents, transferDependents } = require('../../../Utilities/dependencyCascadeUtils');

  try {
    // 1. Count dependents for each grade
    const depCounts = await countDependents(req.collegeDB, ids, gradesDependents);
    // If all dependent counts are zero, delete directly
    const allZero = depCounts.every(dep => Object.values(dep).every(count => count === 0));
    if (allZero) {
      const result = await handleCRUD(Grade, 'delete', { _id: { $in: ids.map(id => new ObjectId(id)) } });
      if (result.deletedCount > 0) {
        return res.status(200).json({ message: 'Grade(s) deleted successfully', deletedCount: result.deletedCount });
      } else {
        return res.status(404).json({ message: 'No matching Grades found for deletion' });
      }
    }
    // If not all zero, keep existing logic
    if (!deleteDependents && !transferTo) {
      return res.status(201).json({ message: 'Dependency summary', dependencies: depCounts });
    }
    if (deleteDependents && transferTo) {
      return res.status(400).json({ message: 'Either transfer or delete dependencies'});
    }
    // 2. Transfer dependents if requested
    if (transferTo) {
      if (ids.length !== 1) {
        return res.status(400).json({ message: 'Please select one grade to transfer dependents from.' });
      }
      const transferRes = await transferDependents(req.collegeDB, ids[0], transferTo, gradesDependents);
      // After transfer, delete the original Grade(s)
      const result = await handleCRUD(Grade, 'delete', { _id: { $in: ids.map(id => new ObjectId(id)) } });
      return res.status(200).json({ message: 'Dependents transferred and Grade(s) deleted', transfer: transferRes, deletedCount: result.deletedCount });
    }
    // 3. Delete dependents and Grade(s) in a transaction
    if (deleteDependents) {
      const results = [];
      for (const id of ids) {
        const delRes = await deleteWithDependents(req.collegeDB, id, gradesDependents, 'Grades');
        results.push({ gradeId: id, ...delRes });
      }
      return res.status(200).json({ message: 'Deleted with dependents', results });
    }
    // Default: just delete the Grade(s) if no dependents
    const result = await handleCRUD(Grade, 'delete', { _id: { $in: ids.map(id => new ObjectId(id)) } });
    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Grade(s) deleted successfully', deletedCount: result.deletedCount });
    } else {
      res.status(404).json({ message: 'No matching Grades found for deletion' });
    }
  } catch (error) {
    console.error('Error deleting Grades:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};