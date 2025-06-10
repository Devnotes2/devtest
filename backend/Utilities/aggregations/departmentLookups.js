function departmentLookup() {
  return [
    {
      $lookup: {
        from: 'departmentdatas',
        localField: 'department',
        foreignField: '_id',
        as: 'departmentDetails'
      }
    },
    { $unwind: { path: '$departmentDetails', preserveNullAndEmptyArrays: true } }
  ];
}
module.exports = { departmentLookup };