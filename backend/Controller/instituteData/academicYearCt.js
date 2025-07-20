const createAcademicYearModel = require('../../Model/instituteData/academicYearMd');
const { handleCRUD } = require('../../Utilities/crudUtils');
const { ObjectId } = require('mongoose').Types;

// Function to get all academic years or a specific academic year by ID
exports.getAcademicYears = async (req, res) => {
  const AcademicYear = createAcademicYearModel(req.collegeDB);
  const { id, page, limit, dropdown } = req.query;
  try {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    let sortObj = { startDate: -1 };
    // Dropdown mode: only _id and yearName
    if (dropdown === 'true') {
      let findQuery = AcademicYear.find({}, { _id: 1, yearName: 1 });
      findQuery = findQuery.sort(sortObj);
      const data = await findQuery;
      return res.status(200).json({ count: data.length, filteredDocs: data.length, totalDocs: data.length, data });
    }
    // Single academic year by ID
    if (id) {
      const academicYear = await handleCRUD(AcademicYear, 'findOne', { _id: new ObjectId(id) });
      if (!academicYear) {
        return res.status(404).json({ message: 'Academic year not found' });
      }
      return res.status(200).json({ data: academicYear });
    }
    // List all academic years with pagination
    const totalDocs = await AcademicYear.countDocuments();
    let query = AcademicYear.find();
    query = query.sort(sortObj);
    query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
    const data = await query;
    const filteredDocs = await AcademicYear.countDocuments();
    return res.status(200).json({ count: data.length, filteredDocs, totalDocs, data });
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