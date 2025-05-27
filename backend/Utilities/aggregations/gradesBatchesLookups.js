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
module.exports = { gradeBatchesLookup };