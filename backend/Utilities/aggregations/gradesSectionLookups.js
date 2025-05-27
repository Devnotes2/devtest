function gradeSectionLookup() {
  return [
    {
      $lookup: {
        from: 'gradesections',
        localField: 'gradeSectionId',
        foreignField: '_id',
        as: 'gradeSectionDetails'
      }
    },
    { $unwind: { path: '$gradeSectionDetails', preserveNullAndEmptyArrays: true } }
  ];
}
module.exports = { gradeSectionLookup };