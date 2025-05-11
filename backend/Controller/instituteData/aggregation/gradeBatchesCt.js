const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const createGradeBatchesInInstituteModel = require('../../../Model/instituteData/aggregation/gradeBatchesMd');
const { handleCRUD } = require('../../../Utilities/crudUtils');

exports.gradeBatchesInInstituteAg = async (req, res) => {
  const GradeBatchesInInstitute = createGradeBatchesInInstituteModel(req.collegeDB);
  const { ids, aggregate, instituteId, gradeId, batch } = req.query;

  try {
    const matchConditions = {};
    if (instituteId) matchConditions.instituteId = new ObjectId(instituteId);
    if (gradeId) matchConditions.gradeId = new ObjectId(gradeId);
    if (batch) matchConditions.batch = batch;

    if (ids && Array.isArray(ids)) {
      const objectIds = ids.map(id => new ObjectId(id));
      const matchingData = await handleCRUD(GradeBatchesInInstitute, 'find', { _id: { $in: objectIds }, ...matchConditions });

      if (aggregate === 'false') {
        return res.status(200).json(matchingData);
      }

      const aggregatedData = await GradeBatchesInInstitute.aggregate([
        { $match: { _id: { $in: objectIds }, ...matchConditions } },
        {
          $lookup: {
            from: 'instituteData',
            let: { gradeInstituteId: '$instituteId' },
            pipeline: [
              { $match: { _id: 'institutes' } },
              { $unwind: '$data' },
              { $match: { $expr: { $eq: ['$data._id', '$$gradeInstituteId'] } } },
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
              {
                $project: {
                  gradeCode: 1,
                  gradeDescription: 1,
                  isElective: 1,
                  gradeDuration: 1
                }
              }
            ],
            as: 'gradeDetails'
          }
        },
        { $unwind: { path: '$gradeDetails', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            batch: 1,
            instituteName: '$instituteDetails.instituteName',
            instituteId: '$instituteDetails.instituteId',
            gradeCode: '$gradeDetails.gradeCode',
            gradeDescription: '$gradeDetails.gradeDescription',
            gradeDuration: '$gradeDetails.gradeDuration',
            isElective: '$gradeDetails.isElective'
          }
        }
      ]);

      return res.status(200).json(aggregatedData);
    }

    const allData = await GradeBatchesInInstitute.aggregate([
      { $match: { ...matchConditions } },
      {
        $lookup: {
          from: 'instituteData',
          let: { gradeInstituteId: '$instituteId' },
          pipeline: [
            { $match: { _id: 'institutes' } },
            { $unwind: '$data' },
            { $match: { $expr: { $eq: ['$data._id', '$$gradeInstituteId'] } } },
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
            {
              $project: {
                gradeCode: 1,
                gradeDescription: 1,
                isElective: 1,
                gradeDuration: 1
              }
            }
          ],
          as: 'gradeDetails'
        }
      },
      { $unwind: { path: '$gradeDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          batch: 1,
          instituteName: '$instituteDetails.instituteName',
          instituteId: '$instituteDetails.instituteId',
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
      message: 'GradeSection added successfully!',
      data: newGradeSection
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add grade', details: error.message });
  }
};

exports.deleteGradeBatchesInInstitute = async (req, res) => {
  const GradeBatchesInInstitute = createGradeBatchesInInstituteModel(req.collegeDB);
  const { ids } = req.body;

  try {
    const result = await handleCRUD(GradeBatchesInInstitute, 'delete', { _id: { $in: ids.map(id => id) } });

    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'GradeBatches deleted successfully' });
    } else {
      res.status(404).json({ message: 'No matching gradeBatches found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete gradeBatches', details: error.message });
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
