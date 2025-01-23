// const mongoose = require('mongoose');

// const OrganizationSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   adminName: { type: String, required: true },
//   adminPhone: { type: String, required: true },
//   username: { type: String, required: true, unique: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true }
// });

// module.exports = mongoose.model('organization', OrganizationSchema);





// const mongoose = require("mongoose");

// const OrganizationSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   adminName: {
//     type: String,
//     required: true,
//   },
//   adminPhone: {
//     type: String,
//     required: true,
//   },
//   username: {
//     type: String,
//     required: true,
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   password: {
//     type: String,
//     required: true,
//   },
//   isActive: {
//     type: Boolean,
//     default: true,
//   },
// });

// module.exports = mongoose.model("organization", OrganizationSchema);












const mongoose = require("mongoose");

const OrganizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  adminName: {
    type: String,
    required: true,
  },
  adminPhone: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
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
    default: true, // This ensures new accounts are active by default
  },
  superAdmin:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Superadmin'
  },
  programManager:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'ProgramManager'
  }]
});

module.exports = mongoose.model("Organization", OrganizationSchema);
