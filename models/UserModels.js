const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
});

const Admin = mongoose.model("Admin", userSchema);
const SuperAdmin = mongoose.model("SuperAdmin", userSchema);
const ProgramManager = mongoose.model("ProgramManager", userSchema);
const Startup = mongoose.model("Startup", userSchema);

module.exports = { Admin, SuperAdmin, ProgramManager, Startup };
