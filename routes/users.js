const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const passport = require("passport");
//require('../config/passport');
const path = require('path');

// Register or Resend OTP Route (Same logic for both)
router.post("/register", async (req, res) => {
  const { email } = req.body;
  console.log('email:',email);
  try {
    // Find user by email
    let user = await User.findOne({ email });

    if (user) {
      // Check if OTP is expired
      if (user.otpExpiration && user.otpExpiration < Date.now()) {
        // OTP is expired, generate a new one
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
        user.otp = newOtp;
        user.otpExpiration = Date.now() + 10 * 60 * 1000; // Valid for 10 minutes

        await user.save(); // Save updated OTP and expiration
        console.log("Expired OTP, new OTP generated:", newOtp);

        // Send the new OTP via email
        const transporter = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
          },
        });

        const mailOptions = {
          from: process.env.EMAIL,
          to: user.email,
          subject: "Your New OTP Code",
          text: `Your new OTP code is ${newOtp}. It will expire in 10 minutes.`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return res.status(500).json({ msg: "Error sending OTP" });
          }
          res.status(200).json({ msg: "New OTP sent to your email." });
        });
      } else {
        // OTP is still valid
        return res.status(400).json({ msg: "OTP already sent. Please check your email." });
      }
    } else {
      // No user exists, create a new user and send OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
      user = new User({
        email,
        otp,
        otpExpiration: Date.now() + 10 * 60 * 1000, // OTP valid for 10 minutes
      });

      await user.save(); // Save new user and OTP

      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL,
        to: user.email,
        subject: "Your OTP Code",
        text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).json({ msg: "Error sending OTP" });
        }
        res.status(200).json({ msg: "User registered and OTP sent to email for verification." });
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});




// ** Verify OTP Route **
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  console.log('otp-verify')
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user.otp !== otp || user.otpExpiration < Date.now()) {
      // return res.status(400).json({ msg: "Invalid or expired OTP" });/
      return res.status(400).json({ msg: "OTP is either invalid or has expired. Please check." });
    }

    // OTP verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiration = undefined;

    // Generate a random password
    const newPassword = Math.random().toString(36).slice(-8); // Generate a random password

    // Hash the new password before saving it
    const salt = await bcrypt.genSalt(10);  // Generate salt
    user.password = await bcrypt.hash(newPassword, salt);  // Hash the password
    await user.save();

    // Send Password to User's Email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    // const mailOptions = {
    //   from: process.env.EMAIL,
    //   to: user.email,
    //   subject: "Your Password",
    //   text: `Your password is: ${newPassword}`,  // Send plain password
    // };
    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Your Login Password",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #0056b3;">Hello,</h2>
          <p>You have successfully verified your OTP. Below is your password for login:</p>
          <p style="font-size: 18px; font-weight: bold;">Password: <span style="color: #FF5733;">${newPassword}</span></p>
          <p>Please use this password to log in.</p>
          <p>Thank you,<br>Team DRISHTI CPS Foundation</p>
          <!-- Social Media Section Start -->
          <div style="text-align: center; margin-top: 30px; padding-left: 30px;">
            <p style="font-size: 14px; color: #555; margin-bottom: 10px;">Follow us for more insights</p>
            <div style="display: inline-block;">
              <a href="https://www.linkedin.com/company/iiti-drishti-cps-foundation-iit-indore/" style="margin: 0 10px; text-decoration: none;">
                <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" style="width: 24px; vertical-align: middle;">
              </a>
              <a href="https://twitter.com/drishticps" style="margin: 0 10px; text-decoration: none;">
                <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" style="width: 24px; vertical-align: middle;">
              </a>
              <a href="https://www.facebook.com/DrishtiCPS/" style="margin: 0 10px; text-decoration: none;">
                <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" style="width: 24px; vertical-align: middle;">
              </a>
            </div>
          </div>
          <!-- Social Media Section End -->
        </div>
      `,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ msg: "Error sending password" });
      }
      res.status(200).json({ msg: "OTP verified and password sent" });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Add this route to handle "Forgot Password" OTP sending
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User with this email does not exist" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    user.otp = otp;
    user.otpExpiration = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
    await user.save();

    // Send OTP via Email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ msg: "Error sending OTP" });
      }
      res.status(200).json({ msg: "OTP sent to email for password reset." });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Add this route to verify "Forgot Password" OTP
router.post("/verify-forgot-password-otp", async (req, res) => {
  const { email, otp } = req.body;
  console.log('verify forget pass')
  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Check if OTP matches and if it hasn't expired
    if (user.otp !== otp || user.otpExpiration < Date.now()) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    // OTP verified: proceed with password reset (generate and send a new password)
    const newPassword = Math.random().toString(36).slice(-8); // Generate random password

    // Hash the new password before saving it
    const salt = await bcrypt.genSalt(10);  // Generate salt
    user.password = await bcrypt.hash(newPassword, salt);  // Hash the password
    user.otp = undefined;  // Clear the OTP since it's been used
    user.otpExpiration = undefined;  // Clear OTP expiration
    await user.save();  // Save the updated user details

    // Send the new password to the user's email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Your New Password",
      text: `Your new password is: ${newPassword}`,  // Send plain password in the email
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ msg: "Error sending new password" });
      }
      res.status(200).json({ msg: "OTP verified and new password sent to email" });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});
// ** Resend OTP Route **
// *** START CHANGE FOR OTP resend route --- ***
router.post("/resend-otp", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiration = Date.now() + 10 * 60 * 1000;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Your New OTP Code",
      text: `Your new OTP code is ${otp}. It will expire in 10 minutes.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ msg: "Error sending OTP" });
      }
      res.status(200).json({ msg: "New OTP sent to your email." });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});
// *** END CHANGE FOR OTP resend route --- ***

// ** Login Route **
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Received login request with email:", email, "and password:", password);  // Log the received email and password

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(404).json({ msg: "Invalid credentials" });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password comparison result:', isMatch);  // Debugging log to check comparison
    
    if (!isMatch) {
      console.log("Password mismatch for email:", email);
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    
    // Set the JWT as an HTTP-only cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 60 * 60 * 1000, // 1 hour expiry
    });

    console.log("Login successful for email:", email);
    res.status(200).json({ msg: "Login successful" });
  } catch (err) {
    console.error("Server error during login:", err.message);
    res.status(500).send("Server error");
  }
});

// Protected route to get user information
router.get("/get-user-info", passport.authenticate("jwt-user", { session: false }), (req, res) => {
  console.log('get-user-info')
  res.status(200).json({
    name: req.user.username,
    email: req.user.email,
  });
});

// ** Logout Route **
router.post("/logout", (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  res.status(200).json({ msg: "Logged out successfully" });
});

module.exports = router;










 











 