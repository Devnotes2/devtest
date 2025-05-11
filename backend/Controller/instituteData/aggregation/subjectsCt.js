const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const createSubjectsInInstituteModel = require('../../../Model/instituteData/aggregation/subjectsMd.js');
const { handleCRUD } = require('../../../Utilities/crudUtils.js');

exports.subjectsInInstituteAg = async (req, res) => {
  const { ids, aggregate, instituteId, subjectCode, isElective, learningTypeId, subjectTypeId, gradeId } = req.query;

  try {
    const matchConditions = {};
    if (instituteId) matchConditions.instituteId = new ObjectId(instituteId);
    if (subjectCode) matchConditions.subjectCode = Number(subjectCode);
    if (isElective) matchConditions.isElective = Boolean(isElective);
    if (learningTypeId) matchConditions.learningTypeId = new ObjectId(learningTypeId);
    if (subjectTypeId) matchConditions.subjectTypeId = new ObjectId(subjectTypeId);
    if (gradeId) matchConditions.gradeId = new ObjectId(gradeId);

    if (ids && Array.isArray(ids)) {
      const objectIds = ids.map(id => new ObjectId(id));
      const query = { _id: { $in: objectIds }, ...matchConditions };

      if (aggregate === 'false') {
        return handleCRUD.find(req, res, 'SubjectsInInstitute', query);
      }

      const aggregationPipeline = [
        { $match: query },
        {
          $lookup: {
            from: 'instituteData',
            let: { subjectInstituteId: '$instituteId' },
            pipeline: [
              { $match: { _id: 'institutes' } },
              { $unwind: '$data' },
              { $match: { $expr: { $eq: ['$data._id', '$$subjectInstituteId'] } } },
              { $project: { instituteName: '$data.instituteName', instituteId: '$data._id' } }
            ],
            as: 'instituteDetails'
          }
        },
        { $unwind: '$instituteDetails' },
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
        { $unwind: '$learningTypeDetails' },
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
        { $unwind: '$subjectTypeDetails' },
        {
          $lookup: {
            from: 'grades',
            let: { gradeId: '$gradeId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$gradeId'] } } },
              { $project: { gradeDescription: 1 } }
            ],
            as: 'gradeDetails'
          }
        },
        { $unwind: '$gradeDetails' },
        {
          $project: {
            subject: 1,
            subjectCode: 1,
            description: 1,
            instituteName: '$instituteDetails.instituteName',
            instituteId: '$instituteDetails.instituteId',
            learningType: '$learningTypeDetails.learningTypeValue',
            subjectType: '$subjectTypeDetails.subjectTypeValue',
            gradeDescription: '$gradeDetails.gradeDescription'
          }
        }
      ];

      return handleCRUD.aggregate(req, res, 'SubjectsInInstitute', aggregationPipeline);
    }

    const aggregationPipeline = [
      { $match: { ...matchConditions } },
      {
        $lookup: {
          from: 'instituteData',
          let: { subjectInstituteId: '$instituteId' },
          pipeline: [
            { $match: { _id: 'institutes' } },
            { $unwind: '$data' },
            { $match: { $expr: { $eq: ['$data._id', '$$subjectInstituteId'] } } },
            { $project: { instituteName: '$data.instituteName', instituteId: '$data._id' } }
          ],
          as: 'instituteDetails'
        }
      },
      { $unwind: '$instituteDetails' },
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
      { $unwind: '$learningTypeDetails' },
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
      { $unwind: '$subjectTypeDetails' },
      {
        $lookup: {
          from: 'grades',
          let: { gradeId: '$gradeId' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$gradeId'] } } },
            { $project: { gradeDescription: 1 } }
          ],
          as: 'gradeDetails'
        }
      },
      { $unwind: '$gradeDetails' },
      {
        $project: {
          subject: 1,
          subjectCode: 1,
          description: 1,
          instituteName: '$instituteDetails.instituteName',
          instituteId: '$instituteDetails.instituteId',
          learningType: '$learningTypeDetails.learningTypeValue',
          subjectType: '$subjectTypeDetails.subjectTypeValue',
          gradeDescription: '$gradeDetails.gradeDescription'
        }
      }
    ];

    return handleCRUD.aggregate(req, res, 'SubjectsInInstitute', aggregationPipeline);
  } catch (error) {
    console.error('Error in subjectsInInstituteAg:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

exports.createSubjectsInInstitute = (req, res) => {
  handleCRUD.create(req, res, 'SubjectsInInstitute');
};

exports.deleteSubjectsInInstitute = (req, res) => {
  handleCRUD.deleteMany(req, res, 'SubjectsInInstitute');
};

exports.updateSubjectsInInstitute = (req, res) => {
  handleCRUD.updateOne(req, res, 'SubjectsInInstitute');
};
