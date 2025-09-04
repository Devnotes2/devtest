const mongoose = require('mongoose');
const { Schema } = mongoose;

const instituteSchema = new Schema({
  instituteName: { 
    type: String, 
    required: true,
    trim: true,
    // Keep unique: true for institute names globally
    unique: true
  },
  instituteCode: { 
    type: String, 
    required: true,
    trim: true,
    // Keep unique: true for institute codes globally
    unique: true
  },
  address: { 
    type: String, 
    required: true,
    trim: true
  },
  city: { 
    type: String, 
    required: true,
    trim: true
  },
  district: { 
    type: String, 
    required: true,
    trim: true
  },
  state: { 
    type: String, 
    required: true,
    trim: true
  },
  country: { 
    type: String, 
    required: true,
    trim: true
  },
  pinCode: { 
    type: Number, 
    required: true
  },
  contactNo1: { 
    type: String, 
    required: true,
    trim: true
  },
  contactNo2: { 
    type: String,
    trim: true
  },
  emailId: { 
    type: String, 
    required: true,
    trim: true
  },
  archive: {
    type: Boolean,
    default: false
  }
}, { collection: 'instituteData', timestamps: true });

const createInstitutesModel = (connection) => {
  return connection.model('instituteData', instituteSchema);
};

module.exports = createInstitutesModel;