function memberDataLookup({ localField = 'memberId', as = 'memberDetails', projectFields = {} } = {}) {
  const addFieldsStage = Object.keys(projectFields).length
    ? { $addFields: Object.fromEntries(Object.entries(projectFields).map(([k, v]) => [k, `$${as}.${v}`])) }
    : null;
  const pipeline = [
    {
      $lookup: {
        from: 'membersdatas',
        localField,
        foreignField: 'memberId',
        as
      }
    },
    { $unwind: { path: `$${as}`, preserveNullAndEmptyArrays: true } }
  ];
  if (addFieldsStage) pipeline.push(addFieldsStage);
  return pipeline;
}

module.exports = { memberDataLookup };
