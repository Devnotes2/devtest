// membersDataMd.js (Model for member data)
const mongoose = require('mongoose');
const { Schema } = mongoose;

const MembersDataSchema = new Schema({
    memberType: { type: mongoose.Schema.Types.ObjectId ,required: true}, // Member type (e.g., student, staff)
    memberId: {type:String ,required:true},
    firstName: { type: String ,required: true},
    middleName: { type: String },
    lastName: { type: String ,required: true},
    gender: { type: mongoose.Schema.Types.ObjectId ,required: true},
    DOB: { type: String ,required: true},
    bloodGroup: { type: mongoose.Schema.Types.ObjectId ,required: true},
    instituteId: { type: mongoose.Schema.Types.ObjectId ,required: true},
    department: { type: mongoose.Schema.Types.ObjectId ,required: true},
    gradeId: { type: mongoose.Schema.Types.ObjectId ,required: true},
    createdDate: { type: String ,required: true},
    expiryDate: { type: String ,required: true},
    password: { type: String ,required: true},
    image: { type: String ,required: false},  // Array to store multiple image paths
    mobileNo1: { type: String ,required: true},
    mobileNo2: { type: String ,required: false},
    email: { type: String ,required: true},
    fatherName: { type: String ,required: true},
    motherName: { type: String ,required: true},
    guardian: { type: String ,required: true},
    parentGuardianNo: { type: String ,required: true},
    parentGuardianEmail: { type: String ,required: true},
    parentGuardianOccupation: { type: String ,required: true},
    tempAddress: { type: String ,required: true},
    permAddress: { type: String ,required: true},
}, { timestamps: true });

const createMembersDataModel = (connection) => {
    return connection.model('MembersData', MembersDataSchema);
};

module.exports = createMembersDataModel;
