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
    DOB: { type: Date ,required: true},
    bloodGroup: { type: mongoose.Schema.Types.ObjectId ,required: true},
    instituteId: { type: mongoose.Schema.Types.ObjectId ,required: true},
    department: { type: mongoose.Schema.Types.ObjectId ,required: true},
    gradeId: { type: mongoose.Schema.Types.ObjectId ,required: true},
    gradeBatchId: { type: mongoose.Schema.Types.ObjectId ,required: true},
    gradeSectionId: { type: mongoose.Schema.Types.ObjectId ,required: true},
    gradeSectionBatchId: { type: mongoose.Schema.Types.ObjectId ,required: true},
    createdDate: { type: Date ,required: true},
    expiryDate: { type: Date ,required: true},
    password: { type: String ,required: true},
    image: { type: String ,required: false},  // Array to store multiple image paths
    contactNo1: { type: String ,required: true},
    contactNo2: { type: String ,required: false},
    email: { type: String ,required: true},
    fatherName: { type: String ,required: true},
    motherName: { type: String ,required: true},
    guardian: { type: String ,required: true},
    parentOrGuardianNo: { type: String ,required: true},
    parentOrGuardianEmail: { type: String ,required: true},
    parentOrGuardianOccupation: { type: String ,required: true},
    tempAddress: { type: String ,required: true},
    permAddress: { type: String ,required: true},
}, { timestamps: true });

const createMembersDataModel = (connection) => {
    return connection.model('MembersData', MembersDataSchema);
};

module.exports = createMembersDataModel;
