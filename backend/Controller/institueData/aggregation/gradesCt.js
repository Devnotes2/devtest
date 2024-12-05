const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const createGradesInInstituteModel = require('../../../Model/instituteData/aggregation/gradesMd');

exports.gradesInInstituteAg = async (req, res) => {
  const GradesInInstitute = createGradesInInstituteModel(req.collegeDB);
  const { ids, aggregate, instituteId, gradeCode, isElective, gradeDuration } = req.query;

  try {
    // Build the match conditions based on filters
    const matchConditions = {};
    if (instituteId) matchConditions.instituteId = new ObjectId(instituteId);
    if (gradeCode) matchConditions.gradeCode = Number(gradeCode);
    if (isElective) matchConditions.isElective = new ObjectId(isElective);
    if (gradeDuration) matchConditions.gradeDuration = new ObjectId(gradeDuration);

    // When ids are passed, return the raw data without aggregation
    if (ids && Array.isArray(ids)) {
      const objectIds = ids.map(id => new ObjectId(id));
      const matchingData = await GradesInInstitute.find({ _id: { $in: objectIds }, ...matchConditions });

      if (aggregate === 'false') {
          // Return the raw data without aggregation
          return res.status(200).json(matchingData);
      }
        // Return aggregated data for selected ids
        const aggregatedData = await GradesInInstitute.aggregate([
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
              from: "generalData",
              let: { gradeDurationId: "$gradeDuration" },
              pipeline: [
                { $match: { _id: "gradeDuration" } },
                { $unwind: "$data" },
                { $match: { $expr: { $eq: ["$data._id", "$$gradeDurationId"] } } },
                { $project: { gradeDurationValue: "$data.value" } }
              ],
              as: "gradeDurationDetails"
            }
          },
          { $unwind: "$gradeDurationDetails" },
          {
            $lookup: {
              from: "generalData",
              let: { electiveFlag: "$isElective" },
              pipeline: [
                { $match: { _id: "booleanChoices" } },
                { $unwind: "$data" },
                { $match: { $expr: { $eq: ["$data._id", "$$electiveFlag"] } } },
                { $project: { isElectiveValue: "$data.value" } }
              ],
              as: "isElectiveDetails"
            }
          },
          { $unwind: "$isElectiveDetails" },
          {
            $project: {
              gradeCode: 1,
              gradeDescription: 1,
              instituteName: "$instituteDetails.instituteName",
              instituteId: "$instituteDetails.instituteId",
              gradeDuration: "$gradeDurationDetails.gradeDurationValue",
              isElective: "$isElectiveDetails.isElectiveValue"
            }
          }
        ]);

        return res.status(200).json(aggregatedData);
      


    }

    // If no ids are passed, return all grades with aggregation and filters
    const allData = await GradesInInstitute.aggregate([
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
          from: "generalData",
          let: { gradeDurationId: "$gradeDuration" },
          pipeline: [
            { $match: { _id: "gradeDuration" } },
            { $unwind: "$data" },
            { $match: { $expr: { $eq: ["$data._id", "$$gradeDurationId"] } } },
            { $project: { gradeDurationValue: "$data.value" } }
          ],
          as: "gradeDurationDetails"
        }
      },
      { $unwind: "$gradeDurationDetails" },
      {
        $lookup: {
          from: "generalData",
          let: { electiveFlag: "$isElective" },
          pipeline: [
            { $match: { _id: "booleanChoices" } },
            { $unwind: "$data" },
            { $match: { $expr: { $eq: ["$data._id", "$$electiveFlag"] } } },
            { $project: { isElectiveValue: "$data.value" } }
          ],
          as: "isElectiveDetails"
        }
      },
      { $unwind: "$isElectiveDetails" },
      {
        $project: {
          gradeCode: 1,
          gradeDescription: 1,
          instituteName: "$instituteDetails.instituteName",
          instituteId: "$instituteDetails.instituteId",
          gradeDuration: "$gradeDurationDetails.gradeDurationValue",
          isElective: "$isElectiveDetails.isElectiveValue"
        }
      }
    ]);

    return res.status(200).json(allData);
  } catch (error) {
    console.error("Error in gradesInInstituteAg:", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



// exports.gradesInInstitute = async (req, res) => {
//     const GradesInInstitute = createGradesInInstituteModel(req.collegeDB);
//     const { _id } = req.params;
//     console.log(_id);
//     try {
//       const document = await GradesInInstitute.findById(_id);
      
//       if (!document) {
//         return res.json({ message: 'Grade data not found' });
//       }  
  
//     } catch (error) {
//         console.error("Error in gradesInInstitute:", error.message);
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
//   };

exports.createGradesInInstitute = async (req, res) => {
    try {
        const GradesInInstitute = createGradesInInstituteModel(req.collegeDB);
        
        const { instituteId, gradeCode, gradeDescription, gradeDuration, isElective } = req.body;
        
        // Create a new grade document
        const newGrade = new GradesInInstitute({
            instituteId,
            gradeCode,
            gradeDescription,
            gradeDuration,
            isElective
        });
        
        // Save the new grade to the database
        await newGrade.save();
        
        // Send a success response
        res.status(200).json({
            message: 'Grade added successfully!',
            data: newGrade
        });
    } catch (error) {
        console.error('Error adding grade:', error);
        res.status(500).json({ error: 'Failed to add grade', details: error.message });
    }
};

// DELETE /api/grades-institute
exports.deleteGradesInInstitute = async (req, res) => {
    const { ids } = req.body;
  
    try {
      const GradesInInstitute = createGradesInInstituteModel(req.collegeDB);
  
      // Find the grades that match the ids
      const result = await GradesInInstitute.deleteMany({ _id: { $in: ids.map(id =>id) } });
  
      if (result.deletedCount > 0) {
        res.status(200).json({ message: 'Grades deleted successfully' });
      } else {
        res.status(404).json({ message: 'No matching grades found' });
      }
    } catch (error) {
      console.error('Error during delete:', error);
      res.status(500).json({ error: 'Failed to delete grades', details: error.message });
    }
  };
  

  // PUT /api/grades-institute
exports.updateGradesInInstitute = async (req, res) => {
    const { _id, updatedData } = req.body;
  
    try {
      const GradesInInstitute = createGradesInInstituteModel(req.collegeDB);
  
      // Retrieve the current document before the update
      const currentDoc = await GradesInInstitute.findOne(
        { _id, "data._id": _id },
        { "data.$": 1 }
      );
      console.log('Current Document:', currentDoc);
  
      const updateObject = {};
      if (updatedData.instituteId) updateObject["instituteId"] = updatedData.instituteId;
      if (updatedData.gradeCode) updateObject["gradeCode"] = updatedData.gradeCode;
      if (updatedData.gradeDescription) updateObject["gradeDescription"] = updatedData.gradeDescription;
      if (updatedData.gradeDuration) updateObject["gradeDuration"] = updatedData.gradeDuration;
      if (updatedData.isElective !== undefined) updateObject["isElective"] = updatedData.isElective;
  
      console.log('Update Object:', updateObject);
  
      const result = await GradesInInstitute.updateOne(
        { _id },
        { $set: updateObject }
      );
  
      console.log('Update Result:', result);
  
      if (result.modifiedCount > 0) {
        res.status(200).json({ message: 'Grade updated successfully' });
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
  
