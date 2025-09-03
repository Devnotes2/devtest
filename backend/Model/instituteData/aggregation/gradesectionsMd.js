const mongoose = require('mongoose');
const { Schema } = mongoose;

const GradeSectionsSchema = new Schema({
  instituteId: {
    type: mongoose.Schema.Types.ObjectId,  // Reference to the institute (ObjectId)
    required: true,
  },
  departmentId:{
    type: mongoose.Schema.Types.ObjectId,  // Reference to the institute (ObjectId)
    required: true,
  },
  gradeId : {
    type: mongoose.Schema.Types.ObjectId,  // Reference to the institute (ObjectId)
    required: true,
  },
  sectionName: {
    type: String,  // Description of the grade
    required: true,
    unique: true
  },
  description: {
    type: String,  // Description of the grade
    required: false
  },
  archive: {
    type: Boolean,
    default: false
    }
});  // Optionally, you can use timestamps to track creation and update times



const createGradeSectionsInInstituteModel = (connection) => {
  return connection.model('GradeSections', GradeSectionsSchema);
};


module.exports = createGradeSectionsInInstituteModel;
