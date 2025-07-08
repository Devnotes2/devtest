const createInstitutesModel = require('../../Model/instituteData/institutesMd');
const { handleCRUD } = require('../../Utilities/crudUtils');
const { ObjectId } = require('mongoose').Types;
const createDepartmentDataModel = require('../../Model/instituteData/departmentMd');
const createGradesInInstituteModel = require('../../Model/instituteData/aggregation/gradesMd');
const createSubjectsInInstituteModel = require('../../Model/instituteData/aggregation/subjectsMd');
const createLocationTypesInInstituteModel = require('../../Model/instituteData/aggregation/locationTypesInInstituteMd');
const createGradeBatchesInInstituteModel = require('../../Model/instituteData/aggregation/gradeBatchesMd');
const createGradeSectionsInInstituteModel = require('../../Model/instituteData/aggregation/gradesectionsMd');
const createGradeSectionBatchesInInstituteModel = require('../../Model/instituteData/aggregation/gradeSectionBatchesMd');
const createMemberDataModel = require('../../Model/membersModule/memberDataMd');


// --- INSTITUTE DEPENDENTS CONFIG ---
const instituteDependents = [
  { model: 'DepartmentData', field: 'instituteId', name: 'departments' },
  { model: 'Grades', field: 'instituteId', name: 'grades' },
  { model: 'Subjects', field: 'instituteId', name: 'subjects' },
  { model: 'LocationTypesInInstitute', field: 'instituteId', name: 'LocationTypesInInstitute' },
  { model: 'MembersData', field: 'instituteId', name: 'MembersData' },
  { model: 'GradeBatches', field: 'instituteId', name: 'gradebatches' },
  { model: 'GradeSections', field: 'instituteId', name: 'gradesections' },
  { model: 'GradeSectionBatches', field: 'instituteId', name: 'gradesectionbatches' }
  // Add more as needed
];

// Get all institutes or a specific institute by ID
exports.getInstitutes = async (req, res) => {
  const Institute = createInstitutesModel(req.collegeDB);
    const {dropdown} = req.query;

  if (dropdown === 'true') {
      let findQuery = Institute.find( { _id: 1, instituteName: 1 });
      findQuery = findQuery.sort({ instituteName: 1 });
      const data = await findQuery;
      return res.status(200).json({ data });
    }
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

// Delete institute(s) with dependency options
exports.deleteInstitutes = async (req, res) => {
  // Register all dependent models for the current connection
  createDepartmentDataModel(req.collegeDB);
  createGradesInInstituteModel(req.collegeDB);
  createSubjectsInInstituteModel(req.collegeDB);
  createLocationTypesInInstituteModel(req.collegeDB);
  createGradeBatchesInInstituteModel(req.collegeDB);
  createGradeSectionsInInstituteModel(req.collegeDB);
  createGradeSectionBatchesInInstituteModel(req.collegeDB);
  createMemberDataModel(req.collegeDB);

  const Institute = createInstitutesModel(req.collegeDB);
  const { ids, deleteDependents, transferTo } = req.body;

  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ message: 'Institute ID(s) required' });
  }

  // Import generic cascade utils
  const { countDependents, deleteWithDependents, transferDependents } = require('../../Utilities/dependencyCascadeUtils');
  try {
    // 1. Count dependents for each institute
    const depCounts = await countDependents(req.collegeDB, ids, instituteDependents);

    // Check if all dependents are zero for all institutes
    const allZero = Object.values(depCounts).every(depObj =>
      Object.values(depObj).every(count => count === 0)
    );

    if (allZero) {
      // No dependents at all, delete immediately
      const result = await handleCRUD(Institute, 'delete', { _id: { $in: ids.map(id => new ObjectId(id)) } });
      if (result.deletedCount > 0) {
        return res.status(200).json({ message: 'Institute(s) deleted successfully', deletedCount: result.deletedCount });
      } else {
        return res.status(404).json({ message: 'No matching institutes found for deletion' });
      }
    }

    // If neither deleteDependents nor transferTo, just return counts (dry run)
    if (!deleteDependents && !transferTo) {
      return res.status(201).json({ message: 'Dependency summary', dependencies: depCounts });
    }
    // 2. Transfer dependents if requested
    if (transferTo) {
      if (ids.length !== 1) {
        return res.status(400).json({ message: 'Please select one institute to transfer dependents from.' });
      }
      const transferRes = await transferDependents(req.collegeDB, ids[0], transferTo, instituteDependents);
      // After transfer, delete the original institute(s)
      const result = await handleCRUD(Institute, 'delete', { _id: { $in: ids.map(id => new ObjectId(id)) } });
      return res.status(200).json({ message: 'Dependents transferred and institute(s) deleted', transfer: transferRes, deletedCount: result.deletedCount });
    }
    // 3. Delete dependents and institute(s) in a transaction
    if (deleteDependents) {
      const results = [];
      for (const id of ids) {
        const delRes = await deleteWithDependents(req.collegeDB, id, instituteDependents, 'instituteData');
        results.push({ instituteId: id, ...delRes });
      }
      return res.status(200).json({ message: 'Deleted with dependents', results });
    }
    // Default: just delete the institute(s) if no dependents (should not reach here)
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