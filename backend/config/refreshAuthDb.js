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

    const members = await Member.find({});

    for (const m of members) {
      await AuthMember.updateOne(
        { memberId: m.memberId, instituteId: m.instituteId },
        {
          $set: {
            email: m.email,
            contactNo1: m.contactNo1,
            password: m.password,
            memberType: m.memberType,
            dbName: tenant.dbName,
            instituteId: m.instituteId,
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
