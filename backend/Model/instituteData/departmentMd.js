// departmentsDataMd.js (Model for department data)
const mongoose = require('mongoose');
const { Schema } = mongoose;

const DepartmentDataSchema = new Schema({
    instituteId: { 
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    departmentName: {
        type: mongoose.Schema.Types.String, 
        required: true,
        // Remove unique: true - will be compound unique
    },
    departmentCode: {
        type: mongoose.Schema.Types.String, 
        required: true,
        // Remove unique: true - will be compound unique
    },
    description: {
        type: mongoose.Schema.Types.String, 
        required: false
    },
    archive: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Compound unique: department name and code unique per institute
DepartmentDataSchema.index(
    { instituteId: 1, departmentName: 1 }, 
    { unique: true, name: 'unique_department_name_per_institute' }
);

DepartmentDataSchema.index(
    { instituteId: 1, departmentCode: 1 }, 
    { unique: true, name: 'unique_department_code_per_institute' }
);

const createDepartmentDataModel = (connection) => {
    return connection.model('DepartmentData', DepartmentDataSchema);
};

module.exports = createDepartmentDataModel;