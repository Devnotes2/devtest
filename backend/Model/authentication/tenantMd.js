const mongoose = require('mongoose');
const { globalConnection } = require('../../config/db'); // Use the shared global connection

const tenantSchema = new mongoose.Schema({
  instituteCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  dbName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  clusterURI: {
    type: String,
    required: true,
    trim: true, 
  },
  description: {
    type: String,
    trim: true,
  },
  s3StaticUrl: {
    type: String,
    trim: true,
  },
}, { collection: 'tenants', timestamps: true });

module.exports = globalConnection.model('Tenant', tenantSchema);