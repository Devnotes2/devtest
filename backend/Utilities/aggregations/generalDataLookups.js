function generalDataLookup(generalType, localField, as, valueField) {
  if (![generalType, localField, as, valueField].every(Boolean)) {
    throw new Error(`❌ Invalid generalDataLookup args: ${JSON.stringify({ generalType, localField, as, valueField })}`);
  }

  return [
    {
      $lookup: {
        from: 'generalData',
        let: { localId: `$${localField}` },
        pipeline: [
          { $match: { _id: generalType } },
          { $unwind: '$data' },
          { $match: { $expr: { $eq: ['$data._id', '$$localId'] } } },
          { $project: { [valueField]: '$data.value' } }
        ],
        as
      }
    },
    { $unwind: { path: `$${as}`, preserveNullAndEmptyArrays: true } }
  ];
}


module.exports = { generalDataLookup };