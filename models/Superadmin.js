// const mongoose = require("mongoose");

// const SuperadminSchema = new mongoose.Schema({
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   password: {
//     type: String,
//     required: true,
//   },
//   name: {
//     type: String,
//     required: true,
//   },
//   isActive: {
//     type: Boolean,
//     default: true, // This ensures new accounts are active by default
//   },
// });

// module.exports = mongoose.model("Superadmin", SuperadminSchema);

const mongoose = require("mongoose");

const SuperadminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true, // This ensures new accounts are active by default
  },
  organizations:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Admin'
  }],
  programManager:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"ProgramManager"
  }]
});

module.exports = mongoose.model("Superadmin", SuperadminSchema);
