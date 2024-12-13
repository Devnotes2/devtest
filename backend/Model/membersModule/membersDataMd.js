// membersDataMd.js (Model for member data)
const mongoose = require('mongoose');
const { Schema } = mongoose;

const MembersDataSchema = new Schema({
    memberType: { type: mongoose.Schema.Types.ObjectId }, // Member type (e.g., student, staff)
    firstName: { type: String },
    middleName: { type: String },
    lastName: { type: String },
    gender: { type: mongoose.Schema.Types.ObjectId },
    DOB: { type: String },
    bloodGroup: { type: mongoose.Schema.Types.ObjectId },
    instituteId: { type: mongoose.Schema.Types.ObjectId },
    department: { type: mongoose.Schema.Types.ObjectId },
    gradeId: { type: mongoose.Schema.Types.ObjectId },
    createdDate: { type: String },
    expiryDate: { type: String },
    password: { type: String },
    image: { type: String },  // Array to store multiple image paths
    mobileNo1: { type: String },
    mobileNo2: { type: String },
    email: { type: String },
    fatherName: { type: String },
    motherName: { type: String },
    guardian: { type: String },
    parentGuardianNo: { type: String },
    parentGuardianEmail: { type: String },
    parentGuardianOccupation: { type: String },
    tempAddress: { type: String },
    permAddress: { type: String },
}, { timestamps: true });

const createMembersDataModel = (connection) => {
    return connection.model('MembersData', MembersDataSchema);
};

module.exports = createMembersDataModel;
