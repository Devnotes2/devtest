// departmentsDataMd.js (Model for department data)
const mongoose = require('mongoose');
const { Schema } = mongoose;

const DepartmentDataSchema = new Schema({
    instituteId: { 
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'instituteData'
    },
    departmentName: {
        type: mongoose.Schema.Types.String, 
        required: true,
        trim: true
    },
    departmentCode: {
        type: mongoose.Schema.Types.String, 
        required: true,
        trim: true
    },
    description: {
        type: mongoose.Schema.Types.String, 
        required: false,
        trim: true
    },
    archive: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Compound unique indexes for proper constraint enforcement
DepartmentDataSchema.index(
    { instituteId: 1, departmentName: 1 }, 
    { 
        unique: true, 
        name: 'unique_department_name_per_institute',
        partialFilterExpression: { archive: { $ne: true } }
    }
);

DepartmentDataSchema.index(
    { instituteId: 1, departmentCode: 1 }, 
    { 
        unique: true, 
        name: 'unique_department_code_per_institute',
        partialFilterExpression: { archive: { $ne: true } }
    }
);

// Pre-save middleware to validate uniqueness before saving
DepartmentDataSchema.pre('save', async function(next) {
    if (this.isNew || this.isModified('instituteId') || this.isModified('departmentName') || this.isModified('departmentCode')) {
        const DepartmentData = this.constructor;
        
        // Check for duplicate department name within the same institute
        const existingName = await DepartmentData.findOne({
            instituteId: this.instituteId,
            departmentName: this.departmentName,
            _id: { $ne: this._id },
            archive: { $ne: true }
        });
        
        if (existingName) {
            const error = new Error('Department name already exists in this institute');
            error.code = 'DUPLICATE_DEPARTMENT_NAME';
            return next(error);
        }
        
        // Check for duplicate department code within the same institute
        const existingCode = await DepartmentData.findOne({
            instituteId: this.instituteId,
            departmentCode: this.departmentCode,
            _id: { $ne: this._id },
            archive: { $ne: true }
        });
        
        if (existingCode) {
            const error = new Error('Department code already exists in this institute');
            error.code = 'DUPLICATE_DEPARTMENT_CODE';
            return next(error);
        }
    }
    next();
});

// Pre-update middleware to validate uniqueness before updating
DepartmentDataSchema.pre('findOneAndUpdate', async function(next) {
    const update = this.getUpdate();
    const filter = this.getFilter();
    
    if (update.instituteId || update.departmentName || update.departmentCode) {
        const DepartmentData = this.model;
        const doc = await DepartmentData.findOne(filter);
        
        if (!doc) return next();
        
        const instituteId = update.instituteId || doc.instituteId;
        const departmentName = update.departmentName || doc.departmentName;
        const departmentCode = update.departmentCode || doc.departmentCode;
        
        // Check for duplicate department name
        if (update.departmentName) {
            const existingName = await DepartmentData.findOne({
                instituteId,
                departmentName,
                _id: { $ne: doc._id },
                archive: { $ne: true }
            });
            
            if (existingName) {
                const error = new Error('Department name already exists in this institute');
                error.code = 'DUPLICATE_DEPARTMENT_NAME';
                return next(error);
            }
        }
        
        // Check for duplicate department code
        if (update.departmentCode) {
            const existingCode = await DepartmentData.findOne({
                instituteId,
                departmentCode,
                _id: { $ne: doc._id },
                archive: { $ne: true }
            });
            
            if (existingCode) {
                const error = new Error('Department code already exists in this institute');
                error.code = 'DUPLICATE_DEPARTMENT_CODE';
                return next(error);
            }
        }
    }
    next();
});

const createDepartmentDataModel = (connection) => {
    return connection.model('DepartmentData', DepartmentDataSchema);
};

module.exports = createDepartmentDataModel;