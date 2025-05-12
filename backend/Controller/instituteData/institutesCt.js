const createInstitutesModel = require('../../Model/instituteData/institutesMd');
const { handleCRUD } = require('../../Utilities/crudUtils');
const { ObjectId } = require('mongoose').Types;

// Get all institutes or a specific institute by ID
exports.getInstitutes = async (req, res) => {
  const Institute = createInstitutesModel(req.collegeDB);
  const { id } = req.params;
  
  try {
    if (id) {
      // Fetch a specific institute by ID
      const institute = await handleCRUD(Institute, 'findOne', { _id: new ObjectId(id) });
      if (!institute) {
        return res.status(404).json({ message: 'Institute not found' });
      }
      return res.status(200).json(institute);
    } else {
      // Fetch all institutes
      const institutes = await handleCRUD(Institute, 'find', {});
      return res.status(200).json(institutes);
    }
  } catch (error) {
    console.error('Error fetching institutes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add a new institute
exports.insertInstitute = async (req, res) => {
  const Institute = createInstitutesModel(req.collegeDB);
  const { newInst } = req.body;

  if (!newInst || typeof newInst !== 'object') {
    return res.status(400).json({ message: 'Invalid institute data' });
  }

  try {
    const newDoc = await handleCRUD(Institute, 'create', {}, newInst);
    res.status(200).json({ message: 'Institute added successfully', newDoc });
  } catch (error) {
    console.error('Error creating institute:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update an institute
exports.updateInstitute = async (req, res) => {
  const Institute = createInstitutesModel(req.collegeDB);
  const { instituteID, updatedData } = req.body;

  if (!instituteID || !updatedData || typeof updatedData !== 'object') {
    return res.status(400).json({ message: 'Invalid institute ID or update data' });
  }

  try {
    const result = await handleCRUD(Institute, 'update', { _id: new ObjectId(instituteID) }, { $set: updatedData });

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'Institute updated successfully' });
    } else if (result.matchedCount > 0 && result.modifiedCount === 0) {
      res.status(200).json({ message: 'No updates were made' });
    } else {
      res.status(404).json({ message: 'Institute not found' });
    }
  } catch (error) {
    console.error('Error updating institute:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete institute(s)
exports.deleteInstitutes = async (req, res) => {
  const Institute = createInstitutesModel(req.collegeDB);
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ message: 'Institute ID(s) required' });
  }

  try {
    const result = await handleCRUD(Institute, 'delete', { _id: { $in: ids.map(id => new ObjectId(id)) } });

    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Institute(s) deleted successfully', deletedCount: result.deletedCount });
    } else {
      res.status(404).json({ message: 'No matching institutes found for deletion' });
    }
  } catch (error) {
    console.error('Error deleting institutes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};