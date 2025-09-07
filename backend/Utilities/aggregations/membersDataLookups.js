const { ObjectId } = require('mongodb');

/**
 * Basic lookup for members data
 * @param {string} localField - The local field to match on (default: 'memberId')
 * @returns {Object} MongoDB lookup stage
 */
function memberDataLookup(localField = 'memberId') {
  return {
    $lookup: {
      from: 'membersData',
      localField: localField,
      foreignField: '_id',
      as: 'memberDataDetails'
    }
  };
}

/**
 * Comprehensive lookup for members data with all related data
 * @returns {Array} Array of MongoDB lookup stages
 */
function membersDataInInstituteLookup() {
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
    
    // Lookup department data
    {
      $lookup: {
        from: 'departmentdatas',
        localField: 'departmentId',
        foreignField: '_id',
        as: 'departmentDetails'
      }
    },
    { $unwind: { path: '$departmentDetails', preserveNullAndEmptyArrays: true } },
    
    // Lookup grade data
    {
      $lookup: {
        from: 'grades',
        localField: 'gradeId',
        foreignField: '_id',
        as: 'gradeDetails'
      }
    },
    { $unwind: { path: '$gradeDetails', preserveNullAndEmptyArrays: true } },
    
    // Lookup grade batch data
    {
      $lookup: {
        from: 'gradeBatches',
        localField: 'gradeBatchId',
        foreignField: '_id',
        as: 'gradeBatchDetails'
      }
    },
    { $unwind: { path: '$gradeBatchDetails', preserveNullAndEmptyArrays: true } },
    
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
    
    // Lookup grade section batch data
    {
      $lookup: {
        from: 'gradeSectionBatches',
        localField: 'gradeSectionBatchId',
        foreignField: '_id',
        as: 'gradeSectionBatchDetails'
      }
    },
    { $unwind: { path: '$gradeSectionBatchDetails', preserveNullAndEmptyArrays: true } }
  ];
}

module.exports = {
  memberDataLookup,
  membersDataInInstituteLookup
};
