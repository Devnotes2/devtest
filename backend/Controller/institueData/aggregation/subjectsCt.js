const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const createSubjectsInInstituteModel = require('../../../Model/instituteData/aggregation/subjectsMd.js');

exports.subjectsInInstituteAg = async (req, res) => {
  const SubjectsInInstitute = createSubjectsInInstituteModel(req.collegeDB);
  const { ids, aggregate, instituteId, gradeId, subjectTypeId, learningTypeId } = req.query; // Accept additional filters

  try {
    let matchCriteria = {}; // Prepare the match criteria object

    // Add filters to matchCriteria if they exist
    if (instituteId) {
      matchCriteria.instituteId = new ObjectId(instituteId);
    }
    if (gradeId) {
      matchCriteria.gradeId = new ObjectId(gradeId);
    }
    if (subjectTypeId) {
      matchCriteria.subjectTypeId = new ObjectId(subjectTypeId);
    }
    if (learningTypeId) {
      matchCriteria.learningTypeId = new ObjectId(learningTypeId);
    }

    if (ids && Array.isArray(ids)) {
      const objectIds = ids.map(id => new ObjectId(id)); // Convert to ObjectId
      matchCriteria._id = { $in: objectIds }; // Add id filter to match criteria

      // If `aggregate=true` is passed, return aggregated data for selected ids
      if (aggregate === 'true') {
        const aggregatedData = await SubjectsInInstitute.aggregate([
          { $match: matchCriteria }, // Use the matchCriteria
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
              let: { subjectId: "$subjectId" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$subjectId"] } } },
                {
                  $project: {
                    section: 1,
                  }
                }
              ],
              as: "subjectDetails"
            }
          },
          { $unwind: { path: "$subjectDetails", preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: "generalData",
              let: { subjectTypeId: "$subjectTypeId" },
              pipeline: [
                { $match: { "_id": "subjectTypes" } },
                { $unwind: "$data" },
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
                { $match: { "_id": "learningTypes" } },
                { $unwind: "$data" },
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
              subjectCode: 1,
              description: 1,
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

        return res.status(200).json(aggregatedData); // Return aggregated data for selected ids
      }

      // Return the raw data without aggregation
      const matchingData = await SubjectsInInstitute.find(matchCriteria);
      return res.status(200).json(matchingData);
    } else {
      // If no ids are passed, return all subjects with aggregation
      const data = await SubjectsInInstitute.aggregate([
        { $match: matchCriteria }, // Use the matchCriteria
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
            let: { subjectId: "$subjectId" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$subjectId"] } } },
              {
                $project: {
                  section: 1,
                }
              }
            ],
            as: "subjectDetails"
          }
        },
        { $unwind: { path: "$subjectDetails", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "generalData",
            let: { subjectTypeId: "$subjectTypeId" },
            pipeline: [
              { $match: { "_id": "subjectTypes" } },
              { $unwind: "$data" },
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
              { $match: { "_id": "learningTypes" } },
              { $unwind: "$data" },
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
            subjectCode: 1,
            description: 1,
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

      return res.status(200).json(data); // Return aggregated data for all subjects
    }
  } catch (error) {
    console.error("Error in subjectsInInstitute:", error);
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
  