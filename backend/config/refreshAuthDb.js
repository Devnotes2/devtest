// scripts/syncAuthMembers.js
const mongoose = require('mongoose');
require('dotenv').config();
const AuthMember = require('./AuthMember'); // path to global AuthMember model
const tenants = [
  {
    dbName: 'svb',
    uri: process.env.COLLEGE_DB_URI.replace('{dbname}', 'svb'),
  },
  {
    dbName: 'devtest2',
    uri: process.env.COLLEGE_DB_URI.replace('{dbname}', 'devtest2'),
  },
  // Add more as needed
];

async function sync() {
  for (const tenant of tenants) {
    const conn = await mongoose.createConnection(tenant.uri);

    const Member = conn.model('MemberData', new mongoose.Schema({
      memberId: String,
      email: String,
      contactNo1: String,
      password: String,
      memberType: mongoose.Types.ObjectId,
      instituteId: mongoose.Types.ObjectId,
    }, { collection: 'membersdatas' }));

    // Aggregation utilities
    const { memberDataLookup } = require('../Utilities/aggregations/memberDataLookups');
    const { instituteLookup } = require('../Utilities/aggregations/instituteDataLookups');
    const { generalDataLookup } = require('../Utilities/aggregations/generalDataLookups');

    // Build aggregation pipeline
    const pipeline = [
      ...memberDataLookup({
        localField: 'memberId',
        as: 'memberDetails',
        projectFields: {
          memberName: 'fullName',
          email: 'email',
          contactNo1: 'contactNo1',
          memberType: 'memberType',
          password: 'password',
          instituteId: 'instituteId'
        }
      }),
      ...instituteLookup(),
      ...generalDataLookup('memberType', 'memberType', 'memberTypeDetails', 'memberTypeValue'),
      {
        $project: {
          memberId: 1,
          memberName: 1,
          email: 1,
          contactNo1: 1,
          memberType: 1,
          memberTypeValue: '$memberTypeDetails.memberTypeValue',
          password: 1,
          instituteId: 1,
          instituteName: '$instituteDetails.instituteName'
        }
      }
    ];

    const aggregatedMembers = await Member.aggregate(pipeline);

    for (const m of aggregatedMembers) {
      await AuthMember.updateOne(
        { memberId: m.memberId, instituteId: m.instituteId },
        {
          $set: {
            memberName: m.memberName,
            email: m.email,
            contactNo1: m.contactNo1,
            password: m.password,
            memberType: m.memberType,
            memberTypeValue: m.memberTypeValue,
            dbName: tenant.dbName,
            instituteId: m.instituteId,
            instituteName: m.instituteName,
            isActive: true,
          },
        },
        { upsert: true }
      );
    }

    await conn.close();
  }

  console.log('✅ Auth DB sync complete.');
  process.exit();
}

sync().catch(err => {
  console.error('❌ Sync failed:', err);
  process.exit(1);
});
