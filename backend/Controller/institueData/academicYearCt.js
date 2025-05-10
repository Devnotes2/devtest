const createAcademicYearModel = require('../../Model/instituteData/academicYearMd');
const { handleCRUD } = require('../../Utilities/crudUtils');

// Function to get all academic years or a specific academic year by ID
exports.getAcademicYears = async (req, res) => {
  const AcademicYear = createAcademicYearModel(req.collegeDB);
  const { id } = req.params;
  try {
    const academicYearDoc = await handleCRUD(AcademicYear, 'findOne', { _id: 'academicYear' });

    if (!academicYearDoc) {
      return res.status(404).json({ message: 'Academic year data not found' });
    }

    if (id) {
      const year = academicYearDoc.data.find(yr => yr._id.toString() === id.toString());
      if (!year) {
        return res.status(404).json({ message: 'Academic year not found' });
      }
      return res.json(year);
    } else {
      academicYearDoc.data.sort((a, b) => a.startDate - b.startDate);
      return res.json(academicYearDoc.data);
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
    let academicYearDoc = await handleCRUD(AcademicYear, 'findOne', { _id: 'academicYear' });

    if (!academicYearDoc) {
      const newDoc = await handleCRUD(AcademicYear, 'create', {}, {
        _id: 'academicYear',
        data: [newYear],
      });
      return res.status(201).json({ message: 'Document created with new academic year', newDoc });
    }

    academicYearDoc.data.push(newYear);
    await academicYearDoc.save();
    res.status(200).json({ message: 'Academic year added' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Function to update an academic year
exports.updateAcademicYear = async (req, res) => {
  const AcademicYear = createAcademicYearModel(req.collegeDB);
  const { id, updatedData } = req.body;
  try {
    const academicYearDoc = await handleCRUD(AcademicYear, 'findOne', { _id: 'academicYear' });

    if (!academicYearDoc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const yearIndex = academicYearDoc.data.findIndex(yr => yr._id.toString() === id);
    if (yearIndex !== -1) {
      const existingYear = academicYearDoc.data[yearIndex];
      academicYearDoc.data[yearIndex] = {
        _id: existingYear._id,
        ...existingYear,
        ...updatedData,
      };
      await academicYearDoc.save();
      res.json({ message: 'Academic year updated' });
    } else {
      return res.status(404).json({ message: 'Academic year not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Function to delete academic years
exports.deleteAcademicYear = async (req, res) => {
  const AcademicYear = createAcademicYearModel(req.collegeDB);
  const { ids } = req.body;

  try {
    const academicYearDoc = await handleCRUD(AcademicYear, 'findOne', { _id: 'academicYear' });

    if (!academicYearDoc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const updatedAcademicYears = academicYearDoc.data.filter(
      yr => !ids.includes(yr._id.toString())
    );

    if (updatedAcademicYears.length === academicYearDoc.data.length) {
      return res.status(404).json({ message: 'No matching academic years found for deletion' });
    }

    academicYearDoc.data = updatedAcademicYears;
    await academicYearDoc.save();

    res.json({ message: 'Academic year(s) deleted successfully', deletedCount: ids.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

