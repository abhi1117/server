

const { Schemas } = require("aws-sdk");
const mongoose = require("mongoose");
const { pipeline } = require("nodemailer/lib/xoauth2");
const Schema = mongoose.Schema;

const ProgramManagerSchema = new Schema({
  admin: {
    type: Schema.Types.ObjectId,
    ref:'Organization',
  },
  
  superAdmin:{
    type:Schema.Types.ObjectId,
    ref:'Superadmin'
  },
  adminName: {
    type: String,
    required: true,
  },
  adminPhone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  cohorts:[{
    type:Schema.Types.ObjectId,
    ref:'Cohort'
  }    
  ],
  forms:[{
    type:Schema.Types.ObjectId,
    ref:'Form'
  }],
  pipeLine:[{
    type:Schema.Types.ObjectId,
    ref:'Pipeline'
  }],
  evalForms:[{
    type:Schema.Types.ObjectId,
    ref:'EvaluationForm'
  }]
});

module.exports = ProgramManager = mongoose.model(
  "programmanagers",
  ProgramManagerSchema
);
