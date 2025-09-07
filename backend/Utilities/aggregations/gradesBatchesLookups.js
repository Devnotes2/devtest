function gradeBatchesLookup() {
  return [
    {
      $lookup: {
        from: 'gradebatches',
        localField: 'gradeBatchId',
        foreignField: '_id',
        as: 'gradeBatchesDetails'
      }
    },
    { $unwind: { path: '$gradeBatchesDetails', preserveNullAndEmptyArrays: true } }
  ];
}

function gradeBatchesInInstituteLookup() {
  return [
    {
      $lookup: {
        from: 'instituteData',
        localField: 'instituteId',
        foreignField: '_id',
        as: 'instituteDetails'
      }
    },
    { $unwind: { path: '$instituteDetails', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'grades',
        localField: 'gradeId',
        foreignField: '_id',
        as: 'gradeDetails'
      }
    },
    { $unwind: { path: '$gradeDetails', preserveNullAndEmptyArrays: true } },
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

module.exports = { gradeBatchesLookup, gradeBatchesInInstituteLookup };