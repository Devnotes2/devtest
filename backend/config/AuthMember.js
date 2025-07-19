// models/AuthMember.js
const mongoose = require('mongoose');
const collegeName = "authDB";
if (!process.env) {
  throw new Error('COLLEGE_DB_URI environment variable is not set. Please set it before running this script.');
}
const dbURI = process.env.COLLEGE_DB_URI.replace('{dbname}', collegeName);

const globalConnection = mongoose.createConnection(dbURI);
const authMemberSchema = new mongoose.Schema({
  memberId: { type: String, required: true },
  email: { type: String, required: true },
  contactNo1: { type: String, required: true },
  password: { type: String, required: true }, // hashed
  memberType: { type: mongoose.Schema.Types.ObjectId, required: true },
  dbName: { type: String, required: true },
  instituteId: { type: mongoose.Schema.Types.ObjectId, required: true },
  isActive: { type: Boolean, default: true },
  otp: { type: String, default: null },
  otpExpiry: { type: Date, default: null },
  lastLogin: { type: Date, default: null },
}, { timestamps: true });

// compound unique index
authMemberSchema.index({ memberId: 1, instituteId: 1 }, { unique: true });

module.exports = globalConnection.model('AuthMember', authMemberSchema);
