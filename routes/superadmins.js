// const express = require("express");
// const router = express.Router();
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const Superadmin = require("../models/Superadmin");

// // Default email and password for testing
// const defaultEmail = "drishti@admin.com";
// const defaultPassword = "dcpsf@!123";

// // @route   POST api/superadmins/login
// // @desc    Authenticate superadmin and get token
// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Check if the provided credentials match the default ones
//     if (email === defaultEmail && password === defaultPassword) {
//       const payload = {
//         superadmin: {
//           id: "default-id", // You can set a specific id or any identifier
//         },
//       };

//       return jwt.sign(
//         payload,
//         process.env.JWT_SECRET,
//         { expiresIn: "5 days" },
//         (err, token) => {
//           if (err) throw err;
//           return res.json({ token });
//         }
//       );
//     }

//     let superadmin = await Superadmin.findOne({ email });
//     if (!superadmin) {
//       return res.status(400).json({ msg: "Invalid Credentials" });
//     }

//     const isMatch = await bcrypt.compare(password, superadmin.password);
//     if (!isMatch) {
//       return res.status(400).json({ msg: "Invalid Credentials" });
//     }

//     const payload = {
//       superadmin: {
//         id: superadmin.id,
//       },
//     };

//     jwt.sign(
//       payload,
//       process.env.JWT_SECRET,
//       { expiresIn: "5 days" },
//       (err, token) => {
//         if (err) throw err;
//         res.json({ token });
//       }
//     );
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server error");
//   }
// });

// module.exports = router;

//regular

// const express = require("express");
// const router = express.Router();
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const Superadmin = require("../models/Superadmin");
// const auth = require("../middleware/auth"); // Import the auth middleware

// // Default email and password for testing
// const defaultEmail = "drishti@admin.com";
// const defaultPassword = "drishti";

// // @route   POST api/superadmins/login
// // @desc    Authenticate superadmin and get token
// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Check if the provided credentials match the default ones
//     if (email === defaultEmail && password === defaultPassword) {
//       const payload = {
//         user: {
//           id: "default-id", // You can set a specific id or any identifier
//           role: "Super Admin",
//         },
//       };

//       return jwt.sign(
//         payload,
//         process.env.JWT_SECRET,
//         { expiresIn: "5 days" },
//         (err, token) => {
//           if (err) throw err;
//           return res.json({ token });
//         }
//       );
//     }

//     let superadmin = await Superadmin.findOne({ email });
//     if (!superadmin) {
//       return res.status(400).json({ msg: "Invalid Credentials" });
//     }

//     const isMatch = await bcrypt.compare(password, superadmin.password);
//     if (!isMatch) {
//       return res.status(400).json({ msg: "Invalid Credentials" });
//     }

//     const payload = {
//       user: {
//         id: superadmin.id,
//         role: "Super Admin",
//       },
//     };

//     jwt.sign(
//       payload,
//       process.env.JWT_SECRET,
//       { expiresIn: "5 days" },
//       (err, token) => {
//         if (err) throw err;
//         res.json({ token });
//       }
//     );
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server error");
//   }
// });

// // @route   GET api/superadmins/me
// // @desc    Get the logged-in superadmin details
// router.get("/me", auth, async (req, res) => {
//   try {
//     let superadmin;
//     if (req.user.id === "default-id") {
//       // If the default superadmin
//       superadmin = { email: "drishti@admin.com", name: "SuperAdmin" };
//     } else {
//       superadmin = await Superadmin.findById(req.user.id).select("-password");
//     }

//     if (!superadmin) {
//       return res.status(400).json({ msg: "Superadmin not found" });
//     }

//     res.json(superadmin);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server error");
//   }
// });

// module.exports = router;

//working on 10/04/2024
// const express = require("express");
// const router = express.Router();
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const Superadmin = require("../models/Superadmin");
// const auth = require("../middleware/auth"); // Import the auth middleware

// // Default email and password for testing
// const defaultEmail = "drishti@admin.com";
// const defaultPassword = "drishti";

// // @route   POST api/superadmins/login
// // @desc    Authenticate superadmin and get token
// // router.post("/login", async (req, res) => {
// //   const { email, password } = req.body;

// //   try {
// //     // Check if the provided credentials match the default ones
// //     if (email === defaultEmail && password === defaultPassword) {
// //       const payload = {
// //         user: {
// //           id: "default-id", // You can set a specific id or any identifier
// //           role: "Super Admin",
// //         },
// //       };

// //       return jwt.sign(
// //         payload,
// //         process.env.JWT_SECRET,
// //         { expiresIn: "5 days" },
// //         (err, token) => {
// //           if (err) throw err;
// //           return res.json({ token });
// //         }
// //       );
// //     }

// //     let superadmin = await Superadmin.findOne({ email });
// //     if (!superadmin) {
// //       return res.status(400).json({ msg: "Invalid Credentials" });
// //     }

// //     const isMatch = await bcrypt.compare(password, superadmin.password);
// //     if (!isMatch) {
// //       return res.status(400).json({ msg: "Invalid Credentials" });
// //     }

// //     const payload = {
// //       user: {
// //         id: superadmin.id,
// //         role: "Super Admin",
// //       },
// //     };

// //     jwt.sign(
// //       payload,
// //       process.env.JWT_SECRET,
// //       { expiresIn: "5 days" },
// //       (err, token) => {
// //         if (err) throw err;
// //         res.json({ token });
// //       }
// //     );
// //   } catch (err) {
// //     console.error(err.message);
// //     res.status(500).send("Server error");
// //   }
// // });

// // @route   POST api/superadmins/login
// // @desc    Authenticate superadmin and get token
// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Check if the provided credentials match the default ones
//     if (email === defaultEmail && password === defaultPassword) {
//       const payload = {
//         user: {
//           id: "default-id", // You can set a specific id or any identifier
//           role: "Super Admin",
//         },
//       };

//       return jwt.sign(
//         payload,
//         process.env.JWT_SECRET,
//         { expiresIn: "5 days" },
//         (err, token) => {
//           if (err) throw err;
//           return res.json({ token });
//         }
//       );
//     }

//     // Find the superadmin by email
//     let superadmin = await Superadmin.findOne({ email });
//     if (!superadmin) {
//       return res.status(400).json({ msg: "Invalid Credentials" });
//     }

//     // Check if the superadmin is active
//     if (!superadmin.isActive) {
//       return res.status(403).json({ msg: "Account is disabled. Please contact support." });
//     }

//     // Compare password
//     const isMatch = await bcrypt.compare(password, superadmin.password);
//     if (!isMatch) {
//       return res.status(400).json({ msg: "Invalid Credentials" });
//     }

//     const payload = {
//       user: {
//         id: superadmin.id,
//         role: "Super Admin",
//       },
//     };

//     // Sign the JWT token
//     jwt.sign(
//       payload,
//       process.env.JWT_SECRET,
//       { expiresIn: "5 days" },
//       (err, token) => {
//         if (err) throw err;
//         res.json({ token });
//       }
//     );
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server error");
//   }
// });

// // @route   GET api/superadmins/me
// // @desc    Get the logged-in superadmin details
// router.get("/me", auth, async (req, res) => {
//   try {
//     let superadmin;
//     if (req.user.id === "default-id") {
//       // If the default superadmin
//       superadmin = { email: "drishti@admin.com", name: "SuperAdmin" };
//     } else {
//       superadmin = await Superadmin.findById(req.user.id).select("-password");
//     }

//     if (!superadmin) {
//       return res.status(400).json({ msg: "Superadmin not found" });
//     }

//     res.json(superadmin);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server error");
//   }
// });

// module.exports = router;
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Superadmin = require("../models/Superadmin");
//const auth = require("../middleware/auth"); // Import the auth middleware
const passport=require('passport');


//REQUIRE THIS.
const rateLimit = require('express-rate-limit');


// Default email and password for testing
const defaultEmail = "drishti@admin.com";
const defaultPassword = "drishti";
const defaultName= "Super Admin"
// @route   POST api/superadmins/login
// @desc    Authenticate superadmin and get token
/*
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the provided credentials match the default ones
    if (email === defaultEmail && password === defaultPassword) {
      const payload = {
        user: {
          id: "default-id", // You can set a specific id or any identifier
          role: "Super Admin",
        },
      };

    //  await Superadmin.create(req.body);
      return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "5 days" },
        (err, token) => {
          if (err) throw err;
          return res.json({ token });
        }
      );
    }

    // Find the superadmin by email
    let superadmin = await Superadmin.findOne({ email });
    //console.log('super admin:',superadmin);
    if (!superadmin) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    // Check if the superadmin is active
    if (!superadmin.isActive) {
      return res
        .status(403)
        .json({ msg: "Account is disabled. Please contact support." });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, superadmin.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const payload = {
      user: {
        id: superadmin.id,
        role: "Super Admin",
      },
    };

    // Sign the JWT token
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
    res.status(500).send("Server error");
  }
});
*/

/*
//LOGIN IN MORE SECURE WAY.***************************************************************
router.post('/login',async(req,res)=>{
  const { email, password } = req.body;
  try{
      const superAdmin=await Superadmin.findOne({email:email});
      if(superAdmin){
        if (email === defaultEmail && password === defaultPassword) {
          const token=jwt.sign(superAdmin.toJSON(),process.env.JWT_SECRET,{ expiresIn: "5 days" })
          console.log('token sign-in:',token);
          res.json({
            token,
            superAdmin
          })
          }else{
            res.status(401).json({message:'Invalid Credentials'})
          }     
      }else{
        if(email === defaultEmail && password === defaultPassword){
          const superAdmin=await Superadmin.create(req.body);
          console.log(superAdmin);
          const token=jwt.sign(superAdmin.toJSON(),process.env.JWT_SECRET,{ expiresIn: "5 days" })
          console.log('token sign-up:',token);
          res.json({
            token,
            superAdmin
          })
        }
      }
  }catch(err){
    console.log('Internal server error in super admin:',err);
    res.json(500,{
      message:'Internal server error in super admin'
    })
  }
})
*/



// Rate limiting to protect against brute force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: "Too many login attempts. Please try again after 15 minutes."
});

// Hash the password for storing it securely (should be done at account creation)
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Verify the password during login
const verifyPassword = async (inputPassword, storedHash) => {
  return await bcrypt.compare(inputPassword, storedHash);
};

// LOGIN OR CREATE SUPER ADMIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('SUPER ADMIN LOGIN*******')
  try {
    let superAdmin = await Superadmin.findOne({ email });

    // If super admin doesn't exist, create one
    if (!superAdmin && email === defaultEmail && password === defaultPassword) {
      // Optionally, hash the password before saving it (if you decide to add hashing)
      const hashedPassword = await bcrypt.hash(password, 5);

      superAdmin = new Superadmin({ email, password: hashedPassword,name:defaultName });
      await superAdmin.save(); // Save the new super admin to the database

      console.log("Super Admin created:", superAdmin.email);
      const token = jwt.sign(superAdmin.toJSON(), process.env.JWT_SECRET, { expiresIn: "24h" });
        
      // Set token in HTTP-Only cookie
      res.cookie('superAdminToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookie only in production
        sameSite: 'Strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      console.log('ROLE:',req.body.role)
      // Send token in the response body (for frontend use with Passport-JWT)
      return res.json({
        token, // Frontend can store this token temporarily in memory
        superAdmin: superAdmin,
        role:req.body.role,
        id:superAdmin._id
      });
    }

    // If super admin exists, check the credentials
    if (superAdmin) {
      // Compare the provided password with the hashed password
      const isMatch = await bcrypt.compare(password, superAdmin.password);
      
      if (isMatch) {
        // Generate JWT token
        const token = jwt.sign(superAdmin.toJSON(), process.env.JWT_SECRET, { expiresIn: "24h" });
        
        // Set token in HTTP-Only cookie
        res.cookie('superAdminToken', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', // Use secure cookie only in production
          sameSite: 'Strict',
          maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
      //  console.log('ROLE:',req.body.role)
        // Send token in the response body (for frontend use with Passport-JWT)
        return res.json({
          token, // Frontend can store this token temporarily in memory
          superAdmin: superAdmin,
          role:req.body.role,
          id:superAdmin._id
        });
      } else {
        // Invalid credentials
        return res.status(401).json({ message: 'Invalid Credentials' });
      }
    }
    
    // If super admin is not found
    return res.status(404).json({ message: 'Super Admin not found' });

  } catch (err) {
    console.error('Error during login:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

//Route to get id and role to update redux state.
router.get('/auth/me', passport.authenticate('jwt', { session: false }), (req, res) => {
  // Send back user data if authenticated
  res.json({ id: req.user._id, role: req.user.role });
});


// @route   GET api/superadmins/me
// @desc    Get the logged-in superadmin details
router.get("/me", passport.authenticate('jwt',{session:false}), async (req, res) => {
  //console.log('USER:',req.user);
   
  try {
    let superadmin;
    if (req.user.id === "default-id") {
      // If the default superadmin
      superadmin = { email: "drishti@admin.com", name: "SuperAdmin" };
    } else {
      superadmin = await Superadmin.findById(req.user.id).select("-password");
    }

    if (!superadmin) {
      return res.status(400).json({ msg: "Superadmin not found" });
    }

    res.json(superadmin);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//ROUTE TO CLEAR COOKIE(LOGOUT).
router.post('/superAdmin', (req, res) => {
    res.clearCookie('superAdminToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV,
      sameSite: 'Strict',
    });
    res.json({ message: 'Super Admin Logged out successfully' });

  });
  
router.post('/admin/:id',(req,res)=>{
  console.log(req.params.id)
  res.clearCookie(`adminToken._${req.params.id}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV,
    sameSite: 'Strict',
  });
  res.json({ message: 'Admin Logged out successfully' });

})
router.post('/programManager/:id',(req,res)=>{
  console.log("ID:",req.params.id)
  res.clearCookie(`programManagerToken._${req.params.id}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV,
    sameSite: 'Strict',
  });
  res.json({ message: 'Program Manager Logged out successfully' });

})



module.exports = router;
