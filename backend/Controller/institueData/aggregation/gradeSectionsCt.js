const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const createGradeSectionsInInstituteModel = require('../../../Model/instituteData/aggregation/gradesectionsMd');

exports.gradeSectionsInInstituteAg = async (req, res) => {
  const GradeSectionsInInstitute = createGradeSectionsInInstituteModel(req.collegeDB);
  const { ids, instituteId, gradeId, section, aggregate } = req.query; // Added `instituteId`, `gradeId`, and `section` for filtering

  try {
    // Construct filters for multi-field filtering
    const filters = {};
    
    if (ids && Array.isArray(ids)) {
      const objectIds = ids.map(id => new ObjectId(id)); // Convert to ObjectId
      filters._id = { $in: objectIds };
    }
    if (instituteId) {
      filters.instituteId = new ObjectId(instituteId); // Add filter by `instituteId`
    }
    if (gradeId) {
      filters.gradeId = new ObjectId(gradeId); // Add filter by `gradeId`
    }
    if (section) {
      filters.section = section; // Add filter by `section`
    }

    const matchingData = await GradeSectionsInInstitute.find(filters);

    if (matchingData.length === 0) {
      return res.json({ message: 'No matching grade sections found' });
    }

    // If `aggregate=true` is passed, perform aggregation
    if (aggregate === 'true') {
      const aggregatedData = await GradeSectionsInInstitute.aggregate([
        { $match: filters },
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
          $project: {
            section: 1,
            instituteName: { $arrayElemAt: ["$instituteDetails.instituteName", 0] },
            instituteId: { $arrayElemAt: ["$instituteDetails.instituteId", 0] },
            gradeCode: "$gradeDetails.gradeCode",
            gradeDescription: "$gradeDetails.gradeDescription",
            gradeDuration: "$gradeDetails.gradeDuration",
            isElective: "$gradeDetails.isElective"
          }
        }
      ]);

      return res.status(200).json(aggregatedData); // Return aggregated data for selected filters
    }

    // Return the raw data without aggregation
    return res.status(200).json(matchingData);

  } catch (error) {
    console.error("Error in gradeSectionsInInstitute:", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Other functions (create, delete, update) remain the same...

  
  
  
exports.createGradeSectionsInInstitute = async (req, res) => {
    try {
        const GradeSectionsInInstitute = createGradeSectionsInInstituteModel(req.collegeDB);
        
        const { instituteId, gradeId, section } = req.body;
        
        // Create a new grade document
        const newGradeSection = new GradeSectionsInInstitute({
            instituteId,
            section,
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

// DELETE /api/gradeSections-institute
exports.deleteGradeSectionsInInstitute = async (req, res) => {
    const { ids } = req.body;
  
    try {
      const GradeSectionsInInstitute = createGradeSectionsInInstituteModel(req.collegeDB);
  
      // Find the gradeSections that match the ids
      const result = await GradeSectionsInInstitute.deleteMany({ _id: { $in: ids.map(id =>id) } });
  
      if (result.deletedCount > 0) {
        res.status(200).json({ message: 'GradeSections deleted successfully' });
      } else {
        res.status(404).json({ message: 'No matching gradeSections found' });
      }
    } catch (error) {
      console.error('Error during delete:', error);
      res.status(500).json({ error: 'Failed to delete gradeSections', details: error.message });
    }
  };
  

  // PUT /api/gradeSections-institute
exports.updateGradeSectionsInInstitute = async (req, res) => {
    const { _id, updatedData } = req.body;
  
    try {
      const GradeSectionsInInstitute = createGradeSectionsInInstituteModel(req.collegeDB);
  
      // Retrieve the current document before the update
      const currentDoc = await GradeSectionsInInstitute.findOne(
        { _id, "data._id": _id },
        { "data.$": 1 }
      );
      console.log('Current Document:', currentDoc);
  
      const updateObject = {};
      if (newData.instituteId) updateObject["instituteId"] = newData.instituteId;
      if (newData.gradeId) updateObject["gradeId"] = newData.gradeId;
      if (newData.section) updateObject["section"] = newData.section;
  
      console.log('Update Object:', updateObject);
  
      const result = await GradeSectionsInInstitute.updateOne(
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
  