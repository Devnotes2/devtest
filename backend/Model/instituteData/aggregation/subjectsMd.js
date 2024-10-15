const mongoose = require('mongoose');
const { Schema } = mongoose;

const SubjectsSchema = new Schema({
  instituteId: {
    type: mongoose.Schema.Types.ObjectId,  // Reference to the institute (ObjectId)
    required: true,
  },
  gradeId : {
    type: mongoose.Schema.Types.ObjectId,  // Reference to the institute (ObjectId)
    required: true,
  },
  subjectTypeId: {
    type: Number,  // Reference to the institute (ObjectId)
    required: true,
  },
  learningTypeId :{
    type: Number,  // Reference to the institute (ObjectId)
    required: true,
  },
  description :{
    type: String,  // Reference to the institute (ObjectId)
    required: true,
  },
  subjectCode :{
    type: String,  // Reference to the institute (ObjectId)
    required: true,
  },
  subject :{
    type: String,  // Reference to the institute (ObjectId)
    required: true,
  },

});  // Optionally, you can use timestamps to track creation and update times



const createSubjectsInInstituteModel = (connection) => {
  return connection.model('Subjects', SubjectsSchema);
};

module.exports = createSubjectsInInstituteModel;
