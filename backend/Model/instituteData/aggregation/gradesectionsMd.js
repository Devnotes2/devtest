const mongoose = require('mongoose');
const { Schema } = mongoose;

const GradeSectionsSchema = new Schema({
  instituteId: {
    type: String,  // Reference to the institute
    required: true
  },
  gradeId : {
    type: String,  // Numeric code for the grade
    required: true
  },
  section: {
    type: String,  // Description of the grade
    required: true
  }
});  // Optionally, you can use timestamps to track creation and update times



const createGradeSectionsInInstituteModel = (connection) => {
  return connection.model('GradeSections', GradeSectionsSchema);
};

module.exports = createGradeSectionsInInstituteModel;
