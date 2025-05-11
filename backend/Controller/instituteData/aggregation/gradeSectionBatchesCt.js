const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const createGradeSectionBatchesInInstituteModel = require('../../../Model/instituteData/aggregation/gradeSectionBatchesMd');
const { handleCRUD } = require('../../../Utilities/crudUtils');

exports.gradeSectionBatchesInInstituteAg = async (req, res) => {
  const GradeSectionBatchesInInstitute = createGradeSectionBatchesInInstituteModel(req.collegeDB);
  const { ids, aggregate, instituteId, gradeId, gradeSectionId } = req.query;

  try {
    const matchConditions = {};
    if (instituteId) matchConditions.instituteId = new ObjectId(instituteId);
    if (gradeId) matchConditions.gradeId = new ObjectId(gradeId);
    if (gradeSectionId) matchConditions.gradeSectionId = new ObjectId(gradeSectionId);

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
          $lookup: {
            from: 'gradesections',
            let: { gradeSectionId: '$gradeSectionId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$gradeSectionId'] } } },
              {
                $project: {
                  section: 1
                }
              }
            ],
            as: 'gradeSectionDetails'
          }
        },
        { $unwind: { path: '$gradeSectionDetails', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            gradeSectionBatch: 1,
            instituteName: '$instituteDetails.instituteName',
            instituteId: '$instituteDetails.instituteId',
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

    const allData = await GradeSectionBatchesInInstitute.aggregate([
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
        $lookup: {
          from: 'gradesections',
          let: { gradeSectionId: '$gradeSectionId' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$gradeSectionId'] } } },
            {
              $project: {
                section: 1
              }
            }
          ],
          as: 'gradeSectionDetails'
        }
      },
      { $unwind: { path: '$gradeSectionDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          gradeSectionBatch: 1,
          instituteName: '$instituteDetails.instituteName',
          instituteId: '$instituteDetails.instituteId',
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

exports.deleteGradeSectionBatchesInInstitute = async (req, res) => {
  const GradeSectionBatchesInInstitute = createGradeSectionBatchesInInstituteModel(req.collegeDB);
  const { ids } = req.body;

  try {
    const result = await handleCRUD(GradeSectionBatchesInInstitute, 'delete', { _id: { $in: ids.map(id => id) } });

    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'GradeSectionBatches deleted successfully' });
    } else {
      res.status(404).json({ message: 'No matching gradeSectionBatches found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete gradeSectionBatches', details: error.message });
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
