const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const createGradeBatchesInInstituteModel = require('../../../Model/instituteData/aggregation/gradeBatchesMd');


exports.gradeBatchesInInstituteAg = async (req, res) => {
  const GradeBatchesInInstitute = createGradeBatchesInInstituteModel(req.collegeDB);
  const { ids, aggregate, instituteId, gradeId, batch } = req.query; 

  try {
    // Build the match conditions based on filters
    const matchConditions = {};
    if (instituteId) matchConditions.instituteId = new ObjectId(instituteId);
    if (gradeId) matchConditions.gradeId = new ObjectId(gradeId);
    if (batch) matchConditions.batch = batch;

    // When ids are passed, return the raw data without aggregation
    if (ids && Array.isArray(ids)) {
      const objectIds = ids.map(id => new ObjectId(id));
      const matchingData = await GradeBatchesInInstitute.find({ _id: { $in: objectIds }, ...matchConditions });

      if (aggregate === 'false') {
        // Return the raw data without aggregation
        return res.status(200).json(matchingData);
      }

      // Return aggregated data for selected ids
      const aggregatedData = await GradeBatchesInInstitute.aggregate([
        { $match: { _id: { $in: objectIds }, ...matchConditions } },
        {
          $lookup: {
            from: "instituteData",
            let: { gradeInstituteId: "$instituteId" },
            pipeline: [
              { $match: { _id: "institutes" } },
              { $unwind: "$data" },
              { $match: { $expr: { $eq: ["$data._id", "$$gradeInstituteId"] } } },
              { $project: { instituteName: "$data.instituteName", instituteId: "$data._id" } }
            ],
            as: "instituteDetails"
          }
        },
        { $unwind: "$instituteDetails" },
        {
          $lookup: {
            from: "grades",
            let: { gradeId: "$gradeId" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$gradeId"] } } },
              {
                $project: {
                  gradeCode: 1,
                  gradeDescription: 1,
                  isElective: 1,
                  gradeDuration: 1
                }
              }
            ],
            as: "gradeDetails"
          }
        },
        { $unwind: { path: "$gradeDetails", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            batch: 1,
            instituteName: "$instituteDetails.instituteName",
            instituteId: "$instituteDetails.instituteId",
            gradeCode: "$gradeDetails.gradeCode",
            gradeDescription: "$gradeDetails.gradeDescription",
            gradeDuration: "$gradeDetails.gradeDuration",
            isElective: "$gradeDetails.isElective"
          }
        }
      ]);

      return res.status(200).json(aggregatedData);
    }

    // If no ids are passed, return all grade batches with aggregation and filters
    const allData = await GradeBatchesInInstitute.aggregate([
      { $match: { ...matchConditions } },
      {
        $lookup: {
          from: "instituteData",
          let: { gradeInstituteId: "$instituteId" },
          pipeline: [
            { $match: { _id: "institutes" } },
            { $unwind: "$data" },
            { $match: { $expr: { $eq: ["$data._id", "$$gradeInstituteId"] } } },
            { $project: { instituteName: "$data.instituteName", instituteId: "$data._id" } }
          ],
          as: "instituteDetails"
        }
      },
      { $unwind: "$instituteDetails" },
      {
        $lookup: {
          from: "grades",
          let: { gradeId: "$gradeId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$gradeId"] } } },
            {
              $project: {
                gradeCode: 1,
                gradeDescription: 1,
                isElective: 1,
                gradeDuration: 1
              }
            }
          ],
          as: "gradeDetails"
        }
      },
      { $unwind: { path: "$gradeDetails", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          batch: 1,
          instituteName: "$instituteDetails.instituteName",
          instituteId: "$instituteDetails.instituteId",
          gradeCode: "$gradeDetails.gradeCode",
          gradeDescription: "$gradeDetails.gradeDescription",
          gradeDuration: "$gradeDetails.gradeDuration",
          isElective: "$gradeDetails.isElective"
        }
      }
    ]);

    return res.status(200).json(allData);
  } catch (error) {
    console.error("Error in gradeBatchesInInstituteAg:", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

  
exports.createGradeBatchesInInstitute = async (req, res) => {
    try {
        const GradeBatchesInInstitute = createGradeBatchesInInstituteModel(req.collegeDB);
        
        const { instituteId, gradeId, batch } = req.body;
        
        // Create a new grade document
        const newGradeSection = new GradeBatchesInInstitute({
            instituteId,
            batch,
            gradeId
        });
        
        // Save the new grade to the database
        await newGradeSection.save();
        
        // Send a success response
        res.status(200).json({
            message: 'GradeSection added successfully!',
            data: newGradeSection
        });
    } catch (error) {
        console.error('Error adding grade:', error);
        res.status(500).json({ error: 'Failed to add grade', details: error.message });
    }
};

// DELETE /api/gradeBatches-institute
exports.deleteGradeBatchesInInstitute = async (req, res) => {
    const { ids } = req.body;
  
    try {
      const GradeBatchesInInstitute = createGradeBatchesInInstituteModel(req.collegeDB);
  
      // Find the gradeBatches that match the ids
      const result = await GradeBatchesInInstitute.deleteMany({ _id: { $in: ids.map(id =>id) } });
  
      if (result.deletedCount > 0) {
        res.status(200).json({ message: 'GradeBatches deleted successfully' });
      } else {
        res.status(404).json({ message: 'No matching gradeBatches found' });
      }
    } catch (error) {
      console.error('Error during delete:', error);
      res.status(500).json({ error: 'Failed to delete gradeBatches', details: error.message });
    }
  };
  

  // PUT /api/gradeBatches-institute
exports.updateGradeBatchesInInstitute = async (req, res) => {
    const { _id, updatedData } = req.body;
  
    try {
      const GradeBatchesInInstitute = createGradeBatchesInInstituteModel(req.collegeDB);
  
      // Retrieve the current document before the update
      const currentDoc = await GradeBatchesInInstitute.findOne(
        { _id, "data._id": _id },
        { "data.$": 1 }
      );
      console.log('Current Document:', currentDoc);
  
      const updateObject = {};
      if (updatedData.instituteId) updateObject["instituteId"] = updatedData.instituteId;
      if (updatedData.gradeId) updateObject["gradeId"] = updatedData.gradeId;
      if (updatedData.batch) updateObject["batch"] = updatedData.batch;
  
      console.log('Update Object:', updateObject);
  
      const result = await GradeBatchesInInstitute.updateOne(
        { _id },
        { $set: updateObject }
      );
  
      console.log('Update Result:', result);
  
      if (result.modifiedCount > 0) {
        res.status(200).json({ message: 'GradeSection updated successfully' });
      } else if(result.matchedCount > 0 && result.modifiedCount === 0) {
        res.status(200).json({ message: 'No updates were made' });
      } else {
        res.json({ message: 'No matching grade found or values are unchanged' });
      }
    } catch (error) {
      console.error('Error during update:', error);
      res.status(500).json({ error: 'Failed to update grade', details: error.message });
    }
  };
  