const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const createGradeSectionBatchesInInstituteModel = require('../../../Model/instituteData/aggregation/gradeSectionBatchesMd');


exports.gradeSectionBatchesInInstituteAg = async (req, res) => {
  const GradeSectionBatchesInInstitute = createGradeSectionBatchesInInstituteModel(req.collegeDB);
  const { ids, aggregate } = req.query; // Accept `aggregate` to control aggregation behavior

  try {
    if (ids && Array.isArray(ids)) {
      const objectIds = ids.map(id =>new ObjectId(id)); // Convert to ObjectId
      const matchingData = await GradeSectionBatchesInInstitute.find({ _id: { $in: objectIds } });

      if (aggregate === 'true') {
        // If `aggregate=true` is passed, return aggregated data for selected ids
        const aggregatedData = await GradeSectionBatchesInInstitute.aggregate([
          { $match: { _id: { $in: objectIds } } },
          {
            $lookup: {
              from: "instituteData",
              let: { instituteId: "$instituteId" },
              pipeline: [
                { $match: { _id: "institutes" } },
                { $unwind: "$data" },
                { $match: { $expr: { $eq: ["$data._id", "$$instituteId"] } } },
                { $project: { instituteName: "$data.instituteName", instituteId: "$data._id" } }
              ],
              as: "instituteDetails"
            }
          },
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
            $lookup: {
              from: "gradesections",
              let: { gradeSectionId: "$gradeSectionId" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$gradeSectionId"] } } },
                {
                  $project: {
                    section: 1,
                  }
                }
              ],
              as: "gradeSectionDetails"
            }
          },
          { $unwind: { path: "$gradeSectionDetails", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              gradeSectionBatch: 1,
              instituteName: { $arrayElemAt: ["$instituteDetails.instituteName", 0] },
              instituteId: { $arrayElemAt: ["$instituteDetails.instituteId", 0] },
              gradeCode: "$gradeDetails.gradeCode",
              gradeDescription: "$gradeDetails.gradeDescription",
              gradeDuration: "$gradeDetails.gradeDuration",
              isElective: "$gradeDetails.isElective",
              section: "$gradeSectionDetails.section",
            }
          }
        ]);

        return res.status(200).json(aggregatedData); // Return aggregated data for selected ids
      }

      // Return the raw data without aggregation
      return res.status(200).json(matchingData);
    } else {
      // If no ids are passed, return all grade section batches with aggregation
      const data = await GradeSectionBatchesInInstitute.aggregate([
        {
          $lookup: {
            from: "instituteData",
            let: { instituteId: "$instituteId" },
            pipeline: [
              { $match: { _id: "institutes" } },
              { $unwind: "$data" },
              { $match: { $expr: { $eq: ["$data._id", "$$instituteId"] } } },
              { $project: { instituteName: "$data.instituteName", instituteId: "$data._id" } }
            ],
            as: "instituteDetails"
          }
        },
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
          $lookup: {
            from: "gradesections",
            let: { gradeSectionId: "$gradeSectionId" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$gradeSectionId"] } } },
              {
                $project: {
                  section: 1,
                }
              }
            ],
            as: "gradeSectionDetails"
          }
        },
        { $unwind: { path: "$gradeSectionDetails", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            gradeSectionBatch: 1,
            instituteName: { $arrayElemAt: ["$instituteDetails.instituteName", 0] },
            instituteId: { $arrayElemAt: ["$instituteDetails.instituteId", 0] },
            gradeCode: "$gradeDetails.gradeCode",
            gradeDescription: "$gradeDetails.gradeDescription",
            gradeDuration: "$gradeDetails.gradeDuration",
            isElective: "$gradeDetails.isElective",
            section: "$gradeSectionDetails.section",
          }
        }
      ]);

      return res.status(200).json(data); // Return aggregated data for all grade section batches
    }
  } catch (error) {
    console.error("Error in gradeSectionBatchesInInstitute:", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

  
  
  
exports.createGradeSectionBatchesInInstitute = async (req, res) => {
    try {
        const GradeSectionBatchesInInstitute = createGradeSectionBatchesInInstituteModel(req.collegeDB);
        
        const { instituteId, gradeId, gradeSectionBatch ,gradeSectionId} = req.body;
        
        // Create a new grade document
        const newGradeSection = new GradeSectionBatchesInInstitute({
            instituteId,
            gradeSectionBatch,
            gradeId,
            gradeSectionId
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

// DELETE /api/gradeSectionBatches-institute
exports.deleteGradeSectionBatchesInInstitute = async (req, res) => {
    const { ids } = req.body;
  
    try {
      const GradeSectionBatchesInInstitute = createGradeSectionBatchesInInstituteModel(req.collegeDB);
  
      // Find the gradeSectionBatches that match the ids
      const result = await GradeSectionBatchesInInstitute.deleteMany({ _id: { $in: ids.map(id =>id) } });
  
      if (result.deletedCount > 0) {
        res.status(200).json({ message: 'GradeSectionBatches deleted successfully' });
      } else {
        res.status(404).json({ message: 'No matching gradeSectionBatches found' });
      }
    } catch (error) {
      console.error('Error during delete:', error);
      res.status(500).json({ error: 'Failed to delete gradeSectionBatches', details: error.message });
    }
  };
  

  // PUT /api/gradeSectionBatches-institute
exports.updateGradeSectionBatchesInInstitute = async (req, res) => {
    const { _id, newData } = req.body;
  
    try {
      const GradeSectionBatchesInInstitute = createGradeSectionBatchesInInstituteModel(req.collegeDB);
  
      // Retrieve the current document before the update
      const currentDoc = await GradeSectionBatchesInInstitute.findOne(
        { _id, "data._id": _id },
        { "data.$": 1 }
      );
      console.log('Current Document:', currentDoc);
  
      const updateObject = {};
      if (newData.instituteId) updateObject["instituteId"] = newData.instituteId;
      if (newData.gradeId) updateObject["gradeId"] = newData.gradeId;
      if (newData.gradeSectionBatch) updateObject["gradeSectionBatch"] = newData.gradeSectionBatch;
      if (newData.gradeSectionId) updateObject["gradeSectionId"] = newData.gradeSectionId;

      console.log('Update Object:', updateObject);
  
      const result = await GradeSectionBatchesInInstitute.updateOne(
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
  