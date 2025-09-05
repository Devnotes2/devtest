const createInstitutesModel = require('../../Model/instituteData/institutesMd');
const { ObjectId } = require('mongoose').Types;
const createDepartmentDataModel = require('../../Model/instituteData/departmentMd');
const createGradesInInstituteModel = require('../../Model/instituteData/aggregation/gradesMd');
const createSubjectsInInstituteModel = require('../../Model/instituteData/aggregation/subjectsMd');
const createLocationTypesInInstituteModel = require('../../Model/instituteData/aggregation/locationTypesInInstituteMd');
const createGradeBatchesInInstituteModel = require('../../Model/instituteData/aggregation/gradeBatchesMd');
const createGradeSectionsInInstituteModel = require('../../Model/instituteData/aggregation/gradesectionsMd');
const createGradeSectionBatchesInInstituteModel = require('../../Model/instituteData/aggregation/gradeSectionBatchesMd');
const { createMembersDataModel } = require('../../Model/membersModule/memberDataMd');
const { handleCRUD } = require('../../Utilities/crudUtils');


// --- INSTITUTE DEPENDENTS CONFIG ---
const instituteDependents = [
  { model: 'DepartmentData', field: 'instituteId', name: 'departments' },
  { model: 'Grades', field: 'instituteId', name: 'grades' },
  { model: 'Subjects', field: 'instituteId', name: 'subjects' },
  { model: 'LocationTypesInInstitute', field: 'instituteId', name: 'LocationTypesInInstitute' },
  { model: 'MembersData', field: 'instituteId', name: 'MembersData' },
  { model: 'GradeBatches', field: 'instituteId', name: 'gradeBatches' },
  { model: 'GradeSections', field: 'instituteId', name: 'gradeSections' },
  { model: 'GradeSectionBatches', field: 'instituteId', name: 'gradeSectionBatches' }
  // Add more as needed
];

// Get all institutes or a specific institute by ID
exports.getInstitutes = async (req, res) => {
  const Institute = createInstitutesModel(req.collegeDB);
    const {dropdown} = req.query;

  if (dropdown === 'true') {
      let filter = { archive: { $ne: true } };
      // If you want to support more filters in the future, merge them here
      let findQuery = Institute.find(filter, { _id: 1, instituteName: 1 });
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
  const InstitutesData = createInstitutesModel(req.collegeDB);
  try {
    const newInstitute = await handleCRUD(InstitutesData, 'create', {}, req.body);
    res.status(200).json({
      message: 'Institute created successfully!',
      data: newInstitute
    });
  } catch (error) {
    // Handle unique constraint violations
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      
      let fieldDisplayName = field === 'instituteName' ? 'Institute Name' : 'Institute Code';
      
      return res.status(400).json({
        error: 'Duplicate value',
        details: `${fieldDisplayName} '${value}' already exists`,
        field: field,
        value: value,
        suggestion: 'Please choose a different institute name or code'
      });
    }
    
    res.status(500).json({ error: 'Failed to create Institute', details: error.message });
  }
};

exports.updateInstitute = async (req, res) => {
  const InstitutesData = createInstitutesModel(req.collegeDB);
  const { _id, updatedData } = req.body;
  try {
    const result = await handleCRUD(InstitutesData, 'update', { _id }, { $set: updatedData });
    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'Institute updated successfully' });
    } else if (result.matchedCount > 0 && result.modifiedCount === 0) {
      res.status(200).json({ message: 'No updates were made' });
    } else {
      res.status(404).json({ message: 'No matching institute found or values are unchanged' });
    }
  } catch (error) {
    // Handle unique constraint violations
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      
      let fieldDisplayName = field === 'instituteName' ? 'Institute Name' : 'Institute Code';
      
      return res.status(400).json({
        error: 'Duplicate value',
        details: `${fieldDisplayName} '${value}' already exists`,
        field: field,
        value: value,
        suggestion: 'Please choose a different institute name or code'
      });
    }
    
    res.status(500).json({ error: 'Failed to update institute', details: error.message });
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
  createMembersDataModel(req.collegeDB);

  const Institute = createInstitutesModel(req.collegeDB);
  const { ids, deleteDependents, transferTo, archive } = req.body;

  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ message: 'Institute ID(s) required' });
  }

  // Import generic cascade utils
  const { countDependents, deleteWithDependents, transferDependents, archiveParents } = require('../../Utilities/dependencyCascadeUtils');

  // Only one of archive or transferTo can be requested at a time
  if (archive !== undefined && transferTo) {
    return res.status(400).json({ message: 'Only one of archive or transfer can be requested at a time.' });
  }
  // Archive must be a boolean if present
  if (archive !== undefined && typeof archive !== 'boolean') {
    return res.status(400).json({ message: 'The archive parameter must be a boolean (true or false).' });
  }

  // Archive/unarchive logic (match gradeBatchesCt.js)
  if (archive !== undefined) {
    try {
      const archiveResult = await archiveParents(req.collegeDB, ids, 'instituteData', Boolean(archive));
      if (!archiveResult || !archiveResult.archivedCount) {
        return res.status(404).json({ message: 'No matching institutes found to archive/unarchive' });
      }
      return res.status(200).json({ message: `Institute(s) ${archive ? 'archived' : 'unarchived'} successfully`, archiveResult });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to archive/unarchive Institute(s)', error: error.message });
    }
  }

  try {
    // 1. Count dependents for each institute
    const depCounts = await countDependents(req.collegeDB, ids, instituteDependents);
    // Fetch original Institute docs to get the value field (e.g., instituteName)
    const originalDocs = await Institute.find(
      { _id: { $in: ids.map(id => new ObjectId(id)) } },
      { instituteName: 1 }
    );
    const docMap = {};
    originalDocs.forEach(doc => {
      docMap[doc._id.toString()] = doc.instituteName;
    });

    // Partition IDs into zero and non-zero dependents
    const zeroDepIds = Object.keys(depCounts).filter(id => Object.values(depCounts[id]).every(count => count === 0));
    const nonZeroDepIds = Object.keys(depCounts).filter(id => !zeroDepIds.includes(id));
    let deletedCount = 0;
    if (zeroDepIds.length > 0) {
      const result = await handleCRUD(Institute, 'delete', { _id: { $in: zeroDepIds.map(id => new ObjectId(id)) } });
      deletedCount = result.deletedCount || 0;
    }
    if (nonZeroDepIds.length === 0) {
      return res.status(200).json({ message: 'Institute(s) deleted successfully', deleted: zeroDepIds, dependencies: [] });
    }
    if (!deleteDependents && !transferTo) {
      const dependencies = nonZeroDepIds.map(id => ({
        _id: id,
        value: docMap[id] || null,
        dependsOn: depCounts[id]
      }));
      return res.status(201).json({ message: 'Dependency summary', deleted: zeroDepIds, dependencies: dependencies });
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