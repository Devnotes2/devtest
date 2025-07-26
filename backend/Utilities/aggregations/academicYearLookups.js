function academicYearLookup() {
  return [
    {
      $lookup: {
        from: 'academicyears',
        localField: 'academicYearId',
        foreignField: '_id',
        as: 'academicYearDetails'
      }
    },
    { $unwind: { path: '$academicYearDetails', preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        academicYear: {
          $cond: [
            {
              $and: [
                { $ifNull: ['$academicYearDetails.startDate', false] },
                { $ifNull: ['$academicYearDetails.endDate', false] }
              ]
            },
            {
              $concat: [
                { $dateToString: { format: '%d/%m/%Y', date: '$academicYearDetails.startDate' } },
                '-',
                { $dateToString: { format: '%d/%m/%Y', date: '$academicYearDetails.endDate' } }
              ]
            },
            ''
          ]
        }
      }
    }
  ];
}
module.exports = { academicYearLookup };
