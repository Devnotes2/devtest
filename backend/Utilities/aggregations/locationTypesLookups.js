const { ObjectId } = require('mongodb');

/**
 * Basic lookup for location types
 * @param {string} localField - The local field to match on (default: 'locationTypeId')
 * @returns {Object} MongoDB lookup stage
 */
function locationTypeLookup(localField = 'locationTypeId') {
  return {
    $lookup: {
      from: 'locationTypes',
      localField: localField,
      foreignField: '_id',
      as: 'locationTypeDetails'
    }
  };
}

/**
 * Comprehensive lookup for location types in institute with all related data
 * @returns {Array} Array of MongoDB lookup stages
 */
function locationTypesInInstituteLookup() {
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
    { $unwind: { path: '$instituteDetails', preserveNullAndEmptyArrays: true } }
  ];
}

module.exports = {
  locationTypeLookup,
  locationTypesInInstituteLookup
};
