const { ObjectId } = require('mongodb');

/**
 * Basic lookup for grade section batches
 * @param {string} localField - The local field to match on (default: 'gradeSectionBatchId')
 * @returns {Object} MongoDB lookup stage
 */
function gradeSectionBatchLookup(localField = 'gradeSectionBatchId') {
  return {
    $lookup: {
      from: 'gradeSectionBatches',
      localField: localField,
      foreignField: '_id',
      as: 'gradeSectionBatchDetails'
    }
  };
}

/**
 * Comprehensive lookup for grade section batches in institute with all related data
 * @returns {Array} Array of MongoDB lookup stages
 */
function gradeSectionBatchesInInstituteLookup() {
  return [
    // Lookup institute data
    {
      $lookup: {
        from: 'instituteData',
        localField: 'instituteId',
        foreignField: '_id',
        as: 'instituteDetails'
      }
    },
    { $unwind: { path: '$instituteDetails', preserveNullAndEmptyArrays: true } },
    
    // Lookup grade section data
    {
      $lookup: {
        from: 'gradeSections',
        localField: 'gradeSectionId',
        foreignField: '_id',
        as: 'gradeSectionDetails'
      }
    },
    { $unwind: { path: '$gradeSectionDetails', preserveNullAndEmptyArrays: true } },
    
    // Lookup grade data
    {
      $lookup: {
        from: 'grades',
        localField: 'gradeSectionDetails.gradeId',
        foreignField: '_id',
        as: 'gradeDetails'
      }
    },
    { $unwind: { path: '$gradeDetails', preserveNullAndEmptyArrays: true } },
    
    // Lookup department data
    {
      $lookup: {
        from: 'departmentdatas',
        localField: 'departmentId',
        foreignField: '_id',
        as: 'departmentDetails'
      }
    },
    { $unwind: { path: '$departmentDetails', preserveNullAndEmptyArrays: true } }
  ];
}

module.exports = {
  gradeSectionBatchLookup,
  gradeSectionBatchesInInstituteLookup
};
