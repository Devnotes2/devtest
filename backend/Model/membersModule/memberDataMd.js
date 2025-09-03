// membersDataMd.js (Model for member data)
const mongoose = require('mongoose');
const { Schema } = mongoose;

const MembersDataSchema = new Schema({

    memberType: { type: mongoose.Schema.Types.ObjectId ,required: true}, // Member type (e.g., student, staff)
    memberId: {type:String ,required:true,unique: true},
    firstName: { type: String ,required: true},
    middleName: { type: String },
    lastName: { type: String ,required: true},
    fullName: { type: String ,required: true},
    gender: { type: mongoose.Schema.Types.ObjectId ,required: true},
    dob: { type: Date ,required: true},
    bloodGroup: { type: mongoose.Schema.Types.ObjectId ,required: true},
    instituteId: { type: mongoose.Schema.Types.ObjectId ,required: true},
    department: { type: mongoose.Schema.Types.ObjectId ,required: false},
    gradeId: { type: mongoose.Schema.Types.ObjectId ,required: false},
    gradeBatchId: { type: mongoose.Schema.Types.ObjectId ,required: false},
    gradeSectionId: { type: mongoose.Schema.Types.ObjectId ,required: false},
    gradeSectionBatchId: { type: mongoose.Schema.Types.ObjectId ,required: false},
    gradeSubjectId: [{ type: mongoose.Schema.Types.ObjectId ,required: false}],
    gradeBatchSubjectId: [{ type: mongoose.Schema.Types.ObjectId ,required: false}],
    gradeSectionSubjectId: [{ type: mongoose.Schema.Types.ObjectId ,required: false}],
    gradeSectionBatchSubjectId: [{ type: mongoose.Schema.Types.ObjectId ,required: false}],
    createdDate: { type: Date ,required: true},
    expiryDate: { type: Date ,required: true},
    image: { type: String ,required: false},  // Array to store multiple image paths
    contactNo1: { type: String ,required: true,unique: true},
    contactNo2: { type: String ,required: false},
    email: { type: String ,required: true ,unique: true},
    fatherName: { type: String ,required: true},
    motherName: { type: String ,required: true},
    guardian: { type: String ,required: true},
    parentOrGuardianContactNo1: { type: String ,required: true},
    parentOrGuardianContactNo2: { type: String ,required: false},
    parentOrGuardianEmail: { type: String ,required: true},
    parentOrGuardianOccupation: { type: String ,required: true},
    tempAddress: { type: String ,required: true},
    permAddress: { type: String ,required: true},
    role: { type: String, enum: ['student', 'admin', 'parent'], default: 'student' },

}, { timestamps: true });


const createMembersDataModel = (connection) => {
    return connection.model('MembersData', MembersDataSchema);
};

module.exports = { createMembersDataModel, MembersDataSchema };