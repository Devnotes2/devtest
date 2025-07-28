const createAcademicYearModel = require('../../Model/instituteData/academicYearMd');
const { handleCRUD } = require('../../Utilities/crudUtils');
const { ObjectId } = require('mongoose').Types;

// Function to get all academic years or a specific academic year by ID
exports.getAcademicYears = async (req, res) => {
  const AcademicYear = createAcademicYearModel(req.collegeDB);
  const dropdown = req.query.dropdown || req.body.dropdown;
  const { id } = req.params;
  
  function formatAcademicYear(startDate, endDate) {
    function extractDate(val) {
      if (val && typeof val === 'object' && val.$date) return new Date(val.$date);
      return new Date(val);
    }
    const sd = extractDate(startDate);
    const ed = extractDate(endDate);
    if (isNaN(sd.getTime()) || isNaN(ed.getTime())) return '';
    const pad = n => n < 10 ? '0' + n : n;
    return `${pad(sd.getDate())}/${pad(sd.getMonth()+1)}/${sd.getFullYear()}-${pad(ed.getDate())}/${pad(ed.getMonth()+1)}/${ed.getFullYear()}`;
  }

  try {
    if (dropdown === 'true') {
      let academicYears = await handleCRUD(AcademicYear, 'find', {});
      academicYears = academicYears.map(ay => ({
        _id: ay._id,
        academicYear: formatAcademicYear(ay.startDate, ay.endDate)
      }));

      academicYears.sort((a, b) => b.academicYear.localeCompare(a.academicYear));
      return res.json(academicYears);
    }
    if (id) {

      // Fetch a specific academic year by ID
      const academicYear = await handleCRUD(AcademicYear, 'findOne', { _id: new ObjectId(id) });
      if (!academicYear) {

        return res.status(404).json({ message: 'Academic year not found' });
      }
      // Return only plain object with academicYear field
      return res.json({ academicYear: formatAcademicYear(academicYear.startDate, academicYear.endDate) });
    } else {
      // Fetch all academic years
      let academicYears = await handleCRUD(AcademicYear, 'find', {});

      academicYears = academicYears.map(ay => ({
        _id: ay._id,
        startDate:ay.startDate,
        endDate:ay.endDate,
        academicYear: formatAcademicYear(ay.startDate, ay.endDate)
      }));
      academicYears.sort((a, b) => b.academicYear.localeCompare(a.academicYear));
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