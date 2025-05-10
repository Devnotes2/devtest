const mongoose = require('mongoose');

const asideDataSchema = new mongoose.Schema({
  _id: String,
  defaultActiveButton: String,
  content: Array,
},
{ collection: 'asideData' }
);

const createAsideDataModel = (connection) => {
    return connection.model('asideData', asideDataSchema);
  };

  module.exports = createAsideDataModel;
