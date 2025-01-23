const mongoose = require('mongoose');

// EvaluationForm Schema
const EvaluationFormSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  lastModified: {
    type: String,
    default: new Date().toLocaleDateString() 
  },
  createdAt: {
    type: Date,
    default: Date.now 
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  programManager:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"ProgramManager"
  }
});

EvaluationFormSchema.pre('save', function(next) {
  this.lastModified = new Date().toLocaleDateString();
  this.updatedAt = Date.now();
  next();
});

EvaluationFormSchema.pre('findOneAndUpdate', function(next) {
  this._update.lastModified = new Date().toLocaleDateString();
  this._update.updatedAt = Date.now();
  next();
});

const EvaluationForm = mongoose.model('EvaluationForm', EvaluationFormSchema);

// FormStructure Schema
const formStructureSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: String,
    fields: Array,
    lastModified: { type: Date, default: Date.now }
});

const FormStructure = mongoose.model('FormStructure', formStructureSchema);

// SaveSharedEvaluatorForm Schema
const SaveSharedEvaluatorFormSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  fields: [
    {
      label: { 
        type: String,
        required: true,
      },
      type: {
        type: String,
        required: true,
      },
      placeholder: {
        type: String,
      },
      required: {
        type: Boolean,
        default: false,
      },
      value: {
        type: String,
      },
      rating: {
        type: Number, // Ensure this is a number
        required: false,
      },
    },
  ],
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

const SaveSharedEvaluatorForm = mongoose.model('SaveSharedEvaluatorForm', SaveSharedEvaluatorFormSchema);

module.exports = {
  EvaluationForm,
  FormStructure,
  SaveSharedEvaluatorForm
};




 