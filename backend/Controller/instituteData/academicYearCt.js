const createAcademicYearModel = require('../../Model/instituteData/academicYearMd');
const { handleCRUD } = require('../../Utilities/crudUtils');
const { ObjectId } = require('mongoose').Types;

// Function to get all academic years or a specific academic year by ID
exports.getAcademicYears = async (req, res) => {
  const AcademicYear = createAcademicYearModel(req.collegeDB);
  const { id } = req.params;

  try {
    if (id) {
      // Fetch a specific academic year by ID
      const academicYear = await handleCRUD(AcademicYear, 'findOne', { _id: new ObjectId(id) });
      if (!academicYear) {
        return res.status(404).json({ message: 'Academic year not found' });
      }
      return res.json(academicYear);
    } else {
      // Fetch all academic years
      const academicYears = await handleCRUD(AcademicYear, 'find', {});
      academicYears.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      return res.json(academicYears);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Function to add a new academic year
exports.insertAcademicYear = async (req, res) => {
  const AcademicYear = createAcademicYearModel(req.collegeDB);
  const { newYear } = req.body;

  try {
    const newDoc = await handleCRUD(AcademicYear, 'create', {}, newYear);
    res.status(200).json({ message: 'Academic year added successfully', newDoc });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Function to update an academic year
exports.updateAcademicYear = async (req, res) => {
  const AcademicYear = createAcademicYearModel(req.collegeDB);
  const { id, updatedData } = req.body;

  try {
    const result = await handleCRUD(AcademicYear, 'update', { _id: id }, { $set: updatedData });

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'Academic year updated successfully' });
    } else if (result.matchedCount > 0 && result.modifiedCount === 0) {
      res.status(200).json({ message: 'No updates were made' });
    } else {
      res.status(404).json({ message: 'Academic year not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Function to delete academic years
exports.deleteAcademicYear = async (req, res) => {
  const AcademicYear = createAcademicYearModel(req.collegeDB);
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ message: 'Academic year ID(s) required' });
  }

  try {
    const result = await handleCRUD(AcademicYear, 'delete', { _id: { $in: ids } });

    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Academic year(s) deleted successfully', deletedCount: result.deletedCount });
    } else {
      res.status(404).json({ message: 'No matching academic years found for deletion' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};