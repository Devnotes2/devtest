function subjectsLookup(localField = 'gradeSubjectId') {
  return [
    {
      $lookup: {
        from: 'subjects',
        localField: localField,
        foreignField: '_id',
        as: 'subjectDetails'
      }
    },
    { $unwind: { path: '$subjectDetails', preserveNullAndEmptyArrays: true } }
  ];
}

function subjectsInInstituteLookup() {
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
        from: 'departmentdatas',
        localField: 'departmentId',
        foreignField: '_id',
        as: 'departmentDetails'
      }
    },
    { $unwind: { path: '$departmentDetails', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'generalData',
        let: { learningTypeId: '$learningTypeId' },
        pipeline: [
          { $match: { _id: 'learningTypes' } },
          { $unwind: '$data' },
          { $match: { $expr: { $eq: ['$data._id', '$$learningTypeId'] } } },
          { $project: { learningTypeValue: '$data.value' } }
        ],
        as: 'learningTypeDetails'
      }
    },
    { $unwind: { path: '$learningTypeDetails', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'generalData',
        let: { subjectTypeId: '$subjectTypeId' },
        pipeline: [
          { $match: { _id: 'subjectTypes' } },
          { $unwind: '$data' },
          { $match: { $expr: { $eq: ['$data._id', '$$subjectTypeId'] } } },
          { $project: { subjectTypeValue: '$data.value' } }
        ],
        as: 'subjectTypeDetails'
      }
    },
    { $unwind: { path: '$subjectTypeDetails', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'grades',
        localField: 'gradeId',
        foreignField: '_id',
        as: 'gradeDetails'
      }
    },
    { $unwind: { path: '$gradeDetails', preserveNullAndEmptyArrays: true } }
  ];
}

module.exports = { subjectsLookup, subjectsInInstituteLookup };
