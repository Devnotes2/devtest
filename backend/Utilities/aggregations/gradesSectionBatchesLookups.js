function gradeSectionBatchesLookup() {
  return [
    {
      $lookup: {
        from: 'gradesectionbatches',
        localField: 'gradeSectionBatchId',
        foreignField: '_id',
        as: 'gradeSectionBatchDetails'
      }
    },
    { $unwind: { path: '$gradeSectionBatchDetails', preserveNullAndEmptyArrays: true } }
  ];
}
module.exports = { gradeSectionBatchesLookup };