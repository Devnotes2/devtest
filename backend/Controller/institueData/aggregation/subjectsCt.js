const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const createSubjectsInInstituteModel = require('../../../Model/instituteData/aggregation/subjectsMd.js');

exports.subjectsInInstituteAg = async (req, res) => {
    const SubjectsInInstitute = createSubjectsInInstituteModel(req.collegeDB);
    const { ids } = req.query;
  
    try {
      if (ids && Array.isArray(ids)) {
        const objectIds = ids.map(id => id);
        const matchingData = await SubjectsInInstitute.find({ _id: { $in: objectIds } });
        if (matchingData.length === 0) {
          return res.json({ message: 'No matching grade sections found' });
        }
        
        return res.json(matchingData);
      } else {
        const data = await SubjectsInInstitute.aggregate([
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
              let: { gradeId: "$gradeId" }, // Use the string gradeId
              pipeline: [
                { $match: { $expr: { $eq: ["$_id","$$gradeId"] } } }, // Convert gradeId to ObjectId
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
          { $unwind: { path: "$gradeDetails", preserveNullAndEmptyArrays: true } }, // Handle if no matching grade found
          {
            $lookup: {
              from: "gradesections",
              let: { subjectId: "$subjectId" }, // Use the string gradeId
              pipeline: [
                { $match: { $expr: { $eq: ["$_id","$$subjectId"] } } }, // Convert gradeId to ObjectId
                {
                  $project: {
                    section: 1,

                  }
                }
              ],
              as: "subjectDetails"
            }
          },
          { $unwind: { path: "$subjectDetails", preserveNullAndEmptyArrays: true } }, // Handle if no matching grade found
          {
            $lookup: {
              from: "generalData",
              let: { subjectTypeId: "$subjectTypeId" },
              pipeline: [
                {
                  $match: { "_id": "subjectTypes" }
                },
                {
                  $unwind: "$data"
                },
                {
                  $match: {
                    $expr: {
                      $eq: ["$data._id", "$$subjectTypeId"]
                    }
                  }
                }
              ],
              as: "subjectInfo"
            }
          },
          {
            $unwind: {
              path: "$subjectInfo",
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $lookup: {
              from: "generalData",
              let: { learningTypeId: "$learningTypeId" },
              pipeline: [
                {
                  $match: { "_id": "learningTypes" }
                },
                {
                  $unwind: "$data"
                },
                {
                  $match: {
                    $expr: {
                      $eq: ["$data._id", "$$learningTypeId"]
                    }
                  }
                }
              ],
              as: "learningInfo"
            }
          },
          {
            $unwind: {
              path: "$learningInfo",
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $project: {
              subject: 1,
              subjectCode:1,
              description:1,
              instituteName: { $arrayElemAt: ["$instituteDetails.instituteName", 0] },
              instituteId: { $arrayElemAt: ["$instituteDetails.instituteId", 0] },
              gradeCode: "$gradeDetails.gradeCode",
              gradeDescription: "$gradeDetails.gradeDescription",
              gradeDuration: "$gradeDetails.gradeDuration",
              isElective: "$gradeDetails.isElective",
              section: "$subjectDetails.section",
              subjectType: "$subjectInfo.data.value",
              learningType: "$learningInfo.data.value",
            }
          }
        ]);
  
        res.status(200).json(data);
      }
    } catch (error) {
      console.error("Error in subjectsInInstitute:", error.message);
      res.status(500).json({ message: 'Server error', error: error.message });
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
    const { _id, newData } = req.body;
  
    try {
      const SubjectsInInstitute = createSubjectsInInstituteModel(req.collegeDB);
  
      // Retrieve the current document before the update
      const currentDoc = await SubjectsInInstitute.findOne(
        { _id, "data._id": _id },
        { "data.$": 1 }
      );
      console.log('Current Document:', currentDoc);
  
      const updateObject = {};
      if (newData.instituteId) updateObject["instituteId"] = newData.instituteId;
      if (newData.subjectCode) updateObject["subjectCode"] = newData.subjectCode;
      if (newData.gradeId) updateObject["gradeId"] = newData.gradeId;
      if (newData.subject) updateObject["subject"] = newData.subject;
      if (newData.learningTypeId) updateObject["learningTypeId"] = newData.learningTypeId;
      if (newData.subjectTypeId) updateObject["subjectTypeId"] = newData.subjectTypeId;
      if (newData.description) updateObject["description"] = newData.description;

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
  