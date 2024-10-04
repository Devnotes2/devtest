const mongoose = require('mongoose');

const generalDataItemSchema = new mongoose.Schema({
  _id: { type: Number, required: true }, // We will manually set _id as an incrementing number
  value: { type: String, required: true } // The actual value, e.g., religion name, language name
});

const generalDataSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // The name of the metadata field, e.g., 'religion', 'state'
  data: [generalDataItemSchema] // An array of items with incremental _id
},
{ collection: 'generalData' });

const createGeneralDataModel = (connection) => {
  return connection.model('generalData', generalDataSchema);
};

module.exports = createGeneralDataModel;
