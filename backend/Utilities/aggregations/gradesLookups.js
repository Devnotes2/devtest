function gradesLookup() {
  return [
    {
      $lookup: {
        from: 'grades',
        localField: 'gradeId',
        foreignField: '_id',
        as: 'gradesDetails'
      }
    },
    { $unwind: { path: '$gradesDetails', preserveNullAndEmptyArrays: true } }
  ];
}

/**
 * Comprehensive lookup for grades in institute with all related data
 * @returns {Array} Array of MongoDB lookup stages
 */
function gradesInInstituteLookup() {
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
    { $unwind: { path: '$departmentDetails', preserveNullAndEmptyArrays: true } }
  ];
}

module.exports = { 
  gradesLookup,
  gradesInInstituteLookup
};