// membersDataMd.js (Model for member data)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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
    password: { type: String ,required: false},
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
    parentOrGuardianPassword: { type: String ,required: false},
    tempAddress: { type: String ,required: true},
    permAddress: { type: String ,required: true},
}, { timestamps: true });

// Pre-save hook to hash password before creating a new member.
// This runs on `create()` and `save()`.
MembersDataSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new) and is not empty
    if (this.isModified('password') && this.password) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    // Also hash the parentOrGuardianPassword if it has been modified
    if (this.isModified('parentOrGuardianPassword') && this.parentOrGuardianPassword) {
        const salt = await bcrypt.genSalt(10);
        this.parentOrGuardianPassword = await bcrypt.hash(this.parentOrGuardianPassword, salt);
    }
    next();
});

// Pre-update hook to hash password on updates.
// This is for `updateOne` and `findOneAndUpdate`.
MembersDataSchema.pre('updateOne', async function (next) {
    const update = this.getUpdate();
    if (update.$set) {
        if (update.$set.password) {
            const salt = await bcrypt.genSalt(10);
            update.$set.password = await bcrypt.hash(update.$set.password, salt);
        }
        if (update.$set.parentOrGuardianPassword) {
            const salt = await bcrypt.genSalt(10);
            update.$set.parentOrGuardianPassword = await bcrypt.hash(update.$set.parentOrGuardianPassword, salt);
        }
    }
    next();
});

const createMembersDataModel = (connection) => {
    return connection.model('MembersData', MembersDataSchema);
};

module.exports = createMembersDataModel;
