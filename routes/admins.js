const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Organization = require("../models/Organization");
const auth = require("../middleware/auth");
const passport=require('passport');

// Default email and password for Super Admin
const defaultEmail = "drishti@admin.com";
const defaultPassword = "drishti";

// @route   POST api/admins/login
// @desc    Authenticate organization (admin) and get token
/*
 router.post("/login", async (req, res) => {
   const { email, password, role } = req.body;
  console.log('admin')
   try {
     let user;

     // If logging in as an admin or super admin
     if (role === "Admin" || role === "Super Admin") {
       user = await Organization.findOne({
         email: new RegExp(`^${email}$`, "i"), // Case-insensitive email match
       });
     } else {
       return res.status(400).json({ msg: "Invalid Role" });
     }

     // Check if the user exists
     if (!user) {
       return res.status(400).json({ msg: "Invalid Credentials" });
     }

     // Check if the user is active
     if (!user.isActive) {
       return res.status(403).json({ msg: "Account Disabled" });
     }

     // Compare passwords
     const isMatch = await bcrypt.compare(password, user.password);
     if (!isMatch) {
       return res.status(400).json({ msg: "Invalid Credentials" });
     }

     const payload = {
       user: {
         id: user.id,
         role: role,
       },
     };

     // Sign token and send back
     jwt.sign(
       payload,
       process.env.JWT_SECRET,
       { expiresIn: "5 days" },
       (err, token) => {
         if (err) throw err;
         res.json({ token });
       }
     );
   } catch (err) {
     console.error(err.message);
     res.status(500).send("Server Error");
   }
 });
*/




/*
router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  try {
    let user;

    // If logging in as an admin or super admin
    if (role === "Admin" || role === "Super Admin") {
      user = await Organization.findOne({
        email: new RegExp(`^${email}$`, "i"),
      });
    } else {
      return res.status(400).json({ msg: "Invalid Role" });
    }

    // Check if the user exists
    if (!user) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    // Check if user is active
    if (!user.isActive) {
      return res
        .status(403)
        .json({ msg: "Your account is disabled. Please contact support." });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const payload = {
      user: {
        id: user.id,
        role: role,
      },
    };

    // Sign token and send back
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "5 days" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
*/

//NEW CODE FOR LOGIN.
router.post("/login", async (req, res) => {
 const { email, password, role } = req.body;
  console.log('ADMIN LOGIN********')
  try {
    let admin;
   // console.log('body:',req.body)
    // If logging in as an admin or super admin
    if (role === "Admin") {
      admin = await Organization.findOne({
        email: new RegExp(`^${email}$`, "i"),
      });
    } else {
      return res.status(400).json({ msg: "Invalid Role" });
    }

    // Check if the admin exists
    if (!admin) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res
        .status(403)
        .json({ msg: "Your account is disabled. Please contact support." });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const payload = {
      admin: {
        id: admin.id,
        role: role,
      },
    };

    // Sign token
    const token = jwt.sign(admin.toJSON(), process.env.JWT_SECRET, {
      expiresIn: "5 days",
    });

    // Set the token in an HTTP-only cookie
    res.cookie(`adminToken._${admin._id}`, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use HTTPS in production
      sameSite: "strict",
      maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days in milliseconds
    });

    res.status(200).json(
      {
        token,
        admin:admin,
        role:req.body.role,
        id:admin._id
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});





// @route   POST api/admins/change-password
// @desc    Change password for organization (admin)
router.post("/change-password", auth, async (req, res) => {
  const { newPassword, confirmNewPassword } = req.body;
  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ msg: "Passwords do not match" });
  }

  try {
    let user = await Organization.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.firstTimeLogin = false;
    await user.save();
    res.json({ msg: "Password changed successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET api/admins/me
// @desc    Get admin (organization) profile
/*
router.get("/me",passport.authenticate('jwt',{session:false}), async (req, res) => {
  try {
    let user;
    if (req.user.name === "Super Admin") {
      // If the default Super Admin
      user = { email: "drishti@admin.com", name: "SuperAdmin" };
    } else {
      user = await Organization.findById(req.user.id).select("-password");
    }

    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});
*/

//NEW GET FOR ADMIN DETAIL.
router.get('/me',passport.authenticate('jwt',{session:false}),async(req,res)=>{
  try{
    console.log("role:",req.user.role)
    const admin=await Organization.findById(req.user._id);
    if(admin){
     return res.json(admin)
    }else{
      res.json({msg:'Admin not found'})
    }
  }catch(err){
    console.log('error',err)
    res.json({msg:'Internal Server Error'})
  }
})

// @route   GET api/admins/me/programmanagers
// @desc    Get program managers associated with the logged-in admin
router.get("/me/programmanagers",passport.authenticate('jwt',{session:false}), async (req, res) => {
  try {
    const programManagers = await ProgramManager.find({ admin: req.user.id });
    res.json(programManagers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET api/admins/me/programmanagers/active
// @desc    Get active program managers associated with the logged-in admin
router.get("/me/programmanagers/active", auth, async (req, res) => {
  try {
    const activeProgramManagers = await ProgramManager.find({
      admin: req.user.id,
      isActive: true,
    });
    res.json(activeProgramManagers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET api/admins/me/programmanagers/inactive
// @desc    Get inactive program managers associated with the logged-in admin
router.get("/me/programmanagers/inactive", auth, async (req, res) => {
  try {
    const inactiveProgramManagers = await ProgramManager.find({
      admin: req.user.id,
      isActive: false,
    });
    res.json(inactiveProgramManagers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
