const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const createSubjectsInInstituteModel = require('../../../Model/instituteData/aggregation/subjectsMd.js');
const { handleCRUD } = require('../../../Utilities/crudUtils.js');
const { buildMatchConditions, buildSortObject } = require('../../../Utilities/filterSortUtils');

exports.subjectsInInstituteAg = async (req, res) => {
  const SubjectsInInstitute = createSubjectsInInstituteModel(req.collegeDB);
  const { ids, aggregate, page, limit, sortField, sort } = req.query;
  try {
    // Filtering
    const matchConditions = buildMatchConditions(req.query);
    const sortObj = buildSortObject(req.query);
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    // Helper: get ids as array
    let idsArr = Array.isArray(ids) ? ids : (typeof ids === 'string' ? ids.split(',') : undefined);
    if (idsArr && idsArr.length > 0) {
      const objectIds = idsArr.map(id => new ObjectId(id));
      const query = { _id: { $in: objectIds }, ...matchConditions };
      if (aggregate === 'false') {
        let findQuery = SubjectsInInstitute.find(query);
        if (sortObj) findQuery = findQuery.sort(sortObj);
        findQuery = findQuery.skip((pageNum - 1) * limitNum).limit(limitNum);
        const matchingData = await findQuery;
        const filteredDocs = await SubjectsInInstitute.countDocuments(query);
        const totalDocs = await SubjectsInInstitute.countDocuments();
        return res.status(200).json({ count: matchingData.length, filteredDocs, totalDocs, data: matchingData });
      }
      // Aggregate branch with IDs
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
    if (aggregate === 'true') {
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

// Delete Subjects (DELETE)
exports.deleteSubjectsInInstitute = async (req, res) => {
  const SubjectsInInstitute = createSubjectsInInstituteModel(req.collegeDB);
  const { ids } = req.body;
  try {
    const result = await SubjectsInInstitute.deleteMany({ _id: { $in: ids.map(id => id) } });
    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Subjects deleted successfully' });
    } else {
      res.status(404).json({ message: 'No matching subjects found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete subjects', details: error.message });
  }
};
