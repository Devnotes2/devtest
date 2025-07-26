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
module.exports = { subjectsLookup };
