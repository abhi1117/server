const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
  otp: {
    type: String,
    required: false, 
  },
  otpExpiration: {
    type: Date,  // Field to store when OTP will expire
  },
  isVerified: {
    type: Boolean,
    default: false,  // Track whether the user has completed verification
  },
  date: {
    type: Date,
    default: Date.now,  // Timestamp for when the user was created
  },
});

// Password comparison for login
UserSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);

 