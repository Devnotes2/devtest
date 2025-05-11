const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const { handleCRUD } = require('../../../Utilities/crudUtils');

exports.gradeSectionsInInstituteAg = async (req, res) => {
  const { ids, instituteId, gradeId, section, aggregate } = req.query;

  try {
    const matchConditions = {};
    if (instituteId) matchConditions.instituteId = new ObjectId(instituteId);
    if (gradeId) matchConditions.gradeId = new ObjectId(gradeId);
    if (section) matchConditions.section = section;

    if (ids && Array.isArray(ids)) {
      const objectIds = ids.map(id => new ObjectId(id));
      const query = { _id: { $in: objectIds }, ...matchConditions };

      if (aggregate === 'false') {
        return handleCRUD.find(req, res, 'GradeSectionsInInstitute', query);
      }

      const aggregationPipeline = [
        { $match: query },
        {
          $lookup: {
            from: 'instituteData',
            let: { instituteId: '$instituteId' },
            pipeline: [
              { $match: { _id: 'institutes' } },
              { $unwind: '$data' },
              { $match: { $expr: { $eq: ['$data._id', '$$instituteId'] } } },
              { $project: { instituteName: '$data.instituteName', instituteId: '$data._id' } }
            ],
            as: 'instituteDetails'
          }
        },
        { $unwind: '$instituteDetails' },
        {
          $lookup: {
            from: 'grades',
            let: { gradeId: '$gradeId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$gradeId'] } } },
              { $project: { gradeCode: 1, gradeDescription: 1, isElective: 1, gradeDuration: 1 } }
            ],
            as: 'gradeDetails'
          }
        },
        { $unwind: { path: '$gradeDetails', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            section: 1,
            instituteName: '$instituteDetails.instituteName',
            instituteId: '$instituteDetails.instituteId',
            gradeCode: '$gradeDetails.gradeCode',
            gradeDescription: '$gradeDetails.gradeDescription',
            gradeDuration: '$gradeDetails.gradeDuration',
            isElective: '$gradeDetails.isElective'
          }
        }
      ];

      return handleCRUD.aggregate(req, res, 'GradeSectionsInInstitute', aggregationPipeline);
    }

    const aggregationPipeline = [
      { $match: { ...matchConditions } },
      {
        $lookup: {
          from: 'instituteData',
          let: { instituteId: '$instituteId' },
          pipeline: [
            { $match: { _id: 'institutes' } },
            { $unwind: '$data' },
            { $match: { $expr: { $eq: ['$data._id', '$$instituteId'] } } },
            { $project: { instituteName: '$data.instituteName', instituteId: '$data._id' } }
          ],
          as: 'instituteDetails'
        }
      },
      { $unwind: '$instituteDetails' },
      {
        $lookup: {
          from: 'grades',
          let: { gradeId: '$gradeId' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$gradeId'] } } },
            { $project: { gradeCode: 1, gradeDescription: 1, isElective: 1, gradeDuration: 1 } }
          ],
          as: 'gradeDetails'
        }
      },
      { $unwind: { path: '$gradeDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          section: 1,
          instituteName: '$instituteDetails.instituteName',
          instituteId: '$instituteDetails.instituteId',
          gradeCode: '$gradeDetails.gradeCode',
          gradeDescription: '$gradeDetails.gradeDescription',
          gradeDuration: '$gradeDetails.gradeDuration',
          isElective: '$gradeDetails.isElective'
        }
      }
    ];

    return handleCRUD.aggregate(req, res, 'GradeSectionsInInstitute', aggregationPipeline);
  } catch (error) {
    console.error('Error in gradeSectionsInInstituteAg:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createGradeSectionsInInstitute = (req, res) => {
  handleCRUD.create(req, res, 'GradeSectionsInInstitute');
};

exports.deleteGradeSectionsInInstitute = (req, res) => {
  handleCRUD.deleteMany(req, res, 'GradeSectionsInInstitute');
};

exports.updateGradeSectionsInInstitute = (req, res) => {
  handleCRUD.updateOne(req, res, 'GradeSectionsInInstitute');
};
