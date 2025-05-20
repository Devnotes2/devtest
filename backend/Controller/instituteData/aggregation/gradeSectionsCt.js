const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const createGradeSectionsInInstituteModel = require('../../../Model/instituteData/aggregation/gradeSectionsMd');
const { handleCRUD } = require('../../../Utilities/crudUtils');

exports.gradeSectionsInInstituteAg = async (req, res) => {
  const GradeSectionsInInstitute = createGradeSectionsInInstituteModel(req.collegeDB);
  const { ids, instituteId, gradeId, section, aggregate } = req.query;

  try {
    const matchConditions = {};
    if (instituteId) matchConditions.instituteId = new ObjectId(instituteId);
    if (gradeId) matchConditions.gradeId = new ObjectId(gradeId);
    if (section) matchConditions.section = String(section);

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

exports.deleteGradeSectionsInInstitute = async (req, res) => {
  const GradeSectionsInInstitute = createGradeSectionsInInstituteModel(req.collegeDB);
  const { ids } = req.body;

  try {
    const objectIds = ids.map(id => new ObjectId(id));
    const result = await handleCRUD(GradeSectionsInInstitute, 'delete', { _id: { $in: objectIds } });

    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Grade sections deleted successfully' });
    } else {
      res.status(404).json({ message: 'No matching grade sections found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete grade sections', details: error.message });
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
