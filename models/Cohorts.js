const mongoose = require('mongoose');

const CohortSchema = new mongoose.Schema({
  program: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  poster: {
    type: String,
  },
  about: {
    type: String,
  },
  eligibility: {
    type: String,
  },
  industry: {
    type: String,
  },
  focusArea: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  programManager:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'ProgramManager'
  }
});

module.exports = mongoose.model('Cohort', CohortSchema);



 