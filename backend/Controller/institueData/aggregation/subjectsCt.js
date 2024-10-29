const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const createSubjectsInInstituteModel = require('../../../Model/instituteData/aggregation/subjectsMd.js');

exports.subjectsInInstituteAg = async (req, res) => {
  const SubjectsInInstitute = createSubjectsInInstituteModel(req.collegeDB);
  const { ids, aggregate, instituteId, subjectCode, isElective, learningTypeId, subjectTypeId, gradeId } = req.query; // Accept additional filters

  try {
    // Build the match conditions based on filters
    const matchConditions = {};
    if (instituteId) matchConditions.instituteId = new ObjectId(instituteId);
    if (subjectCode) matchConditions.subjectCode = Number(subjectCode);
    if (isElective) matchConditions.isElective = Boolean(isElective);
    if (learningTypeId) matchConditions.learningTypeId = new ObjectId(learningTypeId);
    if (subjectTypeId) matchConditions.subjectTypeId = new ObjectId(subjectTypeId); // Include subjectTypeId filter
    if (gradeId) matchConditions.gradeId = new ObjectId(gradeId); // Include gradeId filter

    // When ids are passed, return the raw data without aggregation
    if (ids && Array.isArray(ids)) {
      const objectIds = ids.map(id => new ObjectId(id));
      const matchingData = await SubjectsInInstitute.find({ _id: { $in: objectIds }, ...matchConditions });

      if (aggregate === 'false') {
        // Return the raw data without aggregation
        return res.status(200).json(matchingData);
      }
      
      // Return aggregated data for selected ids
      const aggregatedData = await SubjectsInInstitute.aggregate([
        { $match: { _id: { $in: objectIds }, ...matchConditions } },
        {
          $lookup: {
            from: "instituteData",
            let: { subjectInstituteId: "$instituteId" },
            pipeline: [
              { $match: { _id: "institutes" } },
              { $unwind: "$data" },
              { $match: { $expr: { $eq: ["$data._id", "$$subjectInstituteId"] } } },
              { $project: { instituteName: "$data.instituteName", instituteId: "$data._id" } }
            ],
            as: "instituteDetails"
          }
        },
        { $unwind: "$instituteDetails" },
        {
          $lookup: {
            from: "generalData",
            let: { learningTypeId: "$learningTypeId" },
            pipeline: [
              { $match: { _id: "learningTypes" } },
              { $unwind: "$data" },
              { $match: { $expr: { $eq: ["$data._id", "$$learningTypeId"] } } },
              { $project: { learningTypeValue: "$data.value" } }
            ],
            as: "learningTypeDetails"
          }
        },
        { $unwind: "$learningTypeDetails" },
        {
          $lookup: {
            from: "subjectTypes", // Assuming this is the collection for subject types
            let: { subjectTypeId: "$subjectTypeId" },
            pipeline: [
              { $match: { _id: { $eq: "$$subjectTypeId" } } },
              { $project: { subjectTypeValue: 1 } } // Adjust as necessary to fetch the right field
            ],
            as: "subjectTypeDetails"
          }
        },
        { $unwind: "$subjectTypeDetails" },
        {
          $lookup: {
            from: "grades", // Assuming this is the collection for grades
            let: { gradeId: "$gradeId" },
            pipeline: [
              { $match: { _id: { $eq: "$$gradeId" } } },
              { $project: { gradeDescription: 1 } } // Adjust as necessary to fetch the right field
            ],
            as: "gradeDetails"
          }
        },
        { $unwind: "$gradeDetails" },
        {
          $project: {
            subject: 1,
            subjectCode: 1,
            description: 1,
            instituteName: "$instituteDetails.instituteName",
            instituteId: "$instituteDetails.instituteId",
            learningType: "$learningTypeDetails.learningTypeValue",
            subjectType: "$subjectTypeDetails.subjectTypeValue", // Include subjectTypeValue
            gradeDescription: "$gradeDetails.gradeDescription" // Include gradeDescription
          }
        }
      ]);

      return res.status(200).json(aggregatedData);
    }

    // If no ids are passed, return all subjects with aggregation and filters
    const allData = await SubjectsInInstitute.aggregate([
      { $match: { ...matchConditions } },
      {
        $lookup: {
          from: "instituteData",
          let: { subjectInstituteId: "$instituteId" },
          pipeline: [
            { $match: { _id: "institutes" } },
            { $unwind: "$data" },
            { $match: { $expr: { $eq: ["$data._id", "$$subjectInstituteId"] } } },
            { $project: { instituteName: "$data.instituteName", instituteId: "$data._id" } }
          ],
          as: "instituteDetails"
        }
      },
      { $unwind: "$instituteDetails" },
      {
        $lookup: {
          from: "generalData",
          let: { learningTypeId: "$learningTypeId" },
          pipeline: [
            { $match: { _id: "learningTypes" } },
            { $unwind: "$data" },
            { $match: { $expr: { $eq: ["$data._id", "$$learningTypeId"] } } },
            { $project: { learningTypeValue: "$data.value" } }
          ],
          as: "learningTypeDetails"
        }
      },
      { $unwind: "$learningTypeDetails" },
      {
        $lookup: {
          from: "generalData",
          let: { subjectTypeId: "$subjectTypeId" },
          pipeline: [
            { $match: { _id: "subjectTypes" } },
            { $unwind: "$data" },
            { $match: { $expr: { $eq: ["$data._id", "$$subjectTypeId"] } } },
            { $project: { subjectTypeValue: "$data.value" } }
          ],
          as: "subjectTypeDetails"
        }
      },
      { $unwind: "$subjectTypeDetails" },
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
      { $unwind: "$gradeDetails" },
      {
        $project: {
          subject: 1,
          subjectCode: 1,
          description: 1,
          instituteName: "$instituteDetails.instituteName",
          instituteId: "$instituteDetails.instituteId",
          learningType: "$learningTypeDetails.learningTypeValue",
          subjectType: "$subjectTypeDetails.subjectTypeValue", // Include subjectTypeValue
          gradeDescription: "$gradeDetails.gradeDescription" // Include gradeDescription
        }
      }
    ]);

    return res.status(200).json(allData);
  } catch (error) {
    console.error("Error in subjectsInInstituteAg:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

  
exports.createSubjectsInInstitute = async (req, res) => {
    try {
        const SubjectsInInstitute = createSubjectsInInstituteModel(req.collegeDB);
        
        const {instituteId,subjectCode,gradeId,subject,learningTypeId ,subjectTypeId ,description } = req.body;
        
        // Create a new grade document
        const newSubject = new SubjectsInInstitute({
            instituteId,
            subjectCode,
            gradeId,
            subject,
            learningTypeId ,
            subjectTypeId ,
            description 
        });
        
        // Save the new grade to the database
        await newSubject.save();
        
        // Send a success response
        res.status(200).json({
            message: 'Subject added successfully!',
            data: newSubject
        });
    } catch (error) {
        console.error('Error adding grade:', error);
        res.status(500).json({ error: 'Failed to add grade', details: error.message });
    }
};

// DELETE /api/subjects-institute
exports.deleteSubjectsInInstitute = async (req, res) => {
    const { ids } = req.body;
  
    try {
      const SubjectsInInstitute = createSubjectsInInstituteModel(req.collegeDB);
  
      // Find the subjects that match the ids
      const result = await SubjectsInInstitute.deleteMany({ _id: { $in: ids.map(id =>id) } });
  
      if (result.deletedCount > 0) {
        res.status(200).json({ message: 'Subjects deleted successfully' });
      } else {
        res.status(404).json({ message: 'No matching subjects found' });
      }
    } catch (error) {
      console.error('Error during delete:', error);
      res.status(500).json({ error: 'Failed to delete subjects', details: error.message });
    }
  };
  

  // PUT /api/subjects-institute
exports.updateSubjectsInInstitute = async (req, res) => {
    const { _id, updatedData } = req.body;
  
    try {
      const SubjectsInInstitute = createSubjectsInInstituteModel(req.collegeDB);
  
      // Retrieve the current document before the update
      const currentDoc = await SubjectsInInstitute.findOne(
        { _id, "data._id": _id },
        { "data.$": 1 }
      );
      console.log('Current Document:', currentDoc);
  
      const updateObject = {};
      if (updatedData.instituteId) updateObject["instituteId"] = updatedData.instituteId;
      if (updatedData.subjectCode) updateObject["subjectCode"] = updatedData.subjectCode;
      if (updatedData.gradeId) updateObject["gradeId"] = updatedData.gradeId;
      if (updatedData.subject) updateObject["subject"] = updatedData.subject;
      if (updatedData.learningTypeId) updateObject["learningTypeId"] = updatedData.learningTypeId;
      if (updatedData.subjectTypeId) updateObject["subjectTypeId"] = updatedData.subjectTypeId;
      if (updatedData.description) updateObject["description"] = updatedData.description;

      console.log('Update Object:', updateObject);
  
      const result = await SubjectsInInstitute.updateOne(
        { _id },
        { $set: updateObject }
      );
  
      console.log('Update Result:', result);
  
      if (result.modifiedCount > 0) {
        res.status(200).json({ message: 'Subject updated successfully' });
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
  