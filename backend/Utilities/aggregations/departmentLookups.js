function departmentLookup() {
  return [
    {
      $lookup: {
        from: 'instituteData',
        localField: 'departmentId',
        foreignField: '_id',
        as: 'departmentDetails'
      }
    },
    { $unwind: { path: '$departmentDetails', preserveNullAndEmptyArrays: true } }
  ];
}
module.exports = { departmentLookup };