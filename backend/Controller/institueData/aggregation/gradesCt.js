const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const createGradesInInstituteModel = require('../../../Model/instituteData/aggregation/gradesMd');
const { handleCRUD } = require('../../../Utilities/crudUtils');

exports.gradesInInstituteAg = async (req, res) => {
  const GradesInInstitute = createGradesInInstituteModel(req.collegeDB);
  const { ids, aggregate, instituteId, gradeCode, isElective, gradeDuration } = req.query;

  try {
    const matchConditions = {};
    if (instituteId) matchConditions.instituteId = new ObjectId(instituteId);
    if (gradeCode) matchConditions.gradeCode = String(gradeCode);
    if (isElective) matchConditions.isElective = new ObjectId(isElective);
    if (gradeDuration) matchConditions.gradeDuration = new ObjectId(gradeDuration);

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
        { $unwind: '$gradeDurationDetails' },
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
        { $unwind: '$isElectiveDetails' },
        {
          $project: {
            gradeCode: 1,
            gradeDescription: 1,
            instituteName: '$instituteDetails.instituteName',
            instituteId: '$instituteDetails.instituteId',
            gradeDuration: '$gradeDurationDetails.gradeDurationValue',
            isElective: '$isElectiveDetails.isElectiveValue'
          }
        }
      ]);

      return res.status(200).json(aggregatedData);
    }

    const allData = await GradesInInstitute.aggregate([
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
      { $unwind: '$gradeDurationDetails' },
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
      { $unwind: '$isElectiveDetails' },
      {
        $project: {
          gradeCode: 1,
          gradeDescription: 1,
          instituteName: '$instituteDetails.instituteName',
          instituteId: '$instituteDetails.instituteId',
          gradeDuration: '$gradeDurationDetails.gradeDurationValue',
          isElective: '$isElectiveDetails.isElectiveValue'
        }
      }
    ]);

    return res.status(200).json(allData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createGradesInInstitute = async (req, res) => {
  const GradesInInstitute = createGradesInInstituteModel(req.collegeDB);
  const { instituteId, gradeCode, gradeDescription, gradeDuration, isElective } = req.body;

  try {
    const newGrade = await handleCRUD(GradesInInstitute, 'create', {}, {
      instituteId,
      gradeCode,
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

exports.deleteGradesInInstitute = async (req, res) => {
  const GradesInInstitute = createGradesInInstituteModel(req.collegeDB);
  const { ids } = req.body;

  try {
    const result = await handleCRUD(GradesInInstitute, 'delete', { _id: { $in: ids.map(id => id) } });

    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Grades deleted successfully' });
    } else {
      res.status(404).json({ message: 'No matching grades found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete grades', details: error.message });
  }
};

exports.updateGradesInInstitute = async (req, res) => {
  const GradesInInstitute = createGradesInInstituteModel(req.collegeDB);
  const { _id, updatedData } = req.body;

  try {
    const result = await handleCRUD(GradesInInstitute, 'update', { _id }, { $set: updatedData });

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'Grade updated successfully' });
    } else if (result.matchedCount > 0 && result.modifiedCount === 0) {
      res.status(200).json({ message: 'No updates were made' });
    } else {
      res.status(404).json({ message: 'No matching grade found or values are unchanged' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update grade', details: error.message });
  }
};

