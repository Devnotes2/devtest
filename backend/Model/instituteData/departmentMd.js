// departmentsDataMd.js (Model for department data)
const mongoose = require('mongoose');
const { Schema } = mongoose;

const DepartmentDataSchema = new Schema({
    instituteId: { type: mongoose.Schema.Types.ObjectId ,required: true}, // department type (e.g., student, staff)
    departmentName: {type: mongoose.Schema.Types.String, required:true,unique: true,},
    departmentCode: {type: mongoose.Schema.Types.String, required:true,unique: true,},
    description:{type: mongoose.Schema.Types.String, required:false},
    archive: {
        type: Boolean,
        default: false    }
}, { timestamps: true });

const createDepartmentDataModel = (connection) => {
    return connection.model('DepartmentData', DepartmentDataSchema);
};

module.exports = createDepartmentDataModel;
