const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const createGradesInInstituteModel = require('../../../Model/instituteData/aggregation/gradesMd');

exports.gradesInInstituteAg = async (req, res) => {
  const GradesInInstitute = createGradesInInstituteModel(req.collegeDB);
  const { ids } = req.query;

  try {
    if (ids && Array.isArray(ids)) {
      const objectIds = ids.map(id => id);
      const matchingData = await GradesInInstitute.find({ _id: { $in: objectIds } });
      if (matchingData.length === 0) {
        return res.json({ message: 'No matching grades found' });
      }
      
      return res.json(matchingData);
    } else {
      const data = await GradesInInstitute.aggregate([
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
              { $match: { _id: "gradeDuration" } },  // Match document with _id = "gradeDuration"
              { $unwind: "$data" },  // Unwind the 'data' array
              { $match: { $expr: { $eq: ["$data._id", "$$gradeDurationId"] } } },  // Match _id inside 'data' with gradeDuration
              { $project: { gradeDurationValue: "$data.value" } }  // Get the corresponding 'value'
            ],
            as: "gradeDurationDetails"
          }
        },
        { $unwind: "$gradeDurationDetails" },
        {
          $lookup: {
            from: "generalData",
            let: { electiveFlag: "$isElective" },  // Pass the `isElective` value to lookup for booleanChoices
            pipeline: [
              { $match: { _id: "booleanChoices" } },  // Match the document with _id = "booleanChoices"
              { $unwind: "$data" },  // Unwind the `data` array
              { $match: { $expr: { $eq: ["$data._id","$$electiveFlag" ] } } },  // Match `isElective` (0/1) to booleanChoices _id
              { $project: { isElectiveValue: "$data.value" } }  // Get the corresponding "Yes" or "No" value
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
            isElective: "$isElectiveDetails.isElectiveValue"  // Get the "Yes" or "No" value for isElective
          }
        }
      ]);

      console.log(data);
      res.status(200).json(data);
    }
  } catch (error) {
    console.error("Error in gradesInInstitute:", error.message);
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
  