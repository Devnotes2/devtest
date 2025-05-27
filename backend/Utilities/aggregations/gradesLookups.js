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
module.exports = { gradesLookup };