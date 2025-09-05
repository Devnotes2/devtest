// Enrollments-specific lookup utilities

function enrollmentsSubjectsLookup() {
  return [
    {
      $lookup: {
        from: 'subjects',
        localField: 'subjectsIds',
        foreignField: '_id',
        as: 'subjectsDetails'
      }
    }
  ];
}

function enrollmentsMemberLookup() {
  return [
    {
      $lookup: {
        from: 'membersdatas',
        localField: 'memberId',
        foreignField: '_id',
        as: 'memberDetails'
      }
    },
    { $unwind: { path: '$memberDetails', preserveNullAndEmptyArrays: true } }
  ];
}

function enrollmentsAcademicYearLookup() {
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

module.exports = { 
  enrollmentsSubjectsLookup,
  enrollmentsMemberLookup,
  enrollmentsAcademicYearLookup
};
