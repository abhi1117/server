const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ProgramManager = require("../models/ProgramManager");
const Organization = require("../models/Organization");
const auth = require("../middleware/auth");
const nodemailer = require("nodemailer");
const path = require("path");
const passport = require("passport");
const Superadmin = require("../models/Superadmin");
// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// UPDATED ROUTE TO ADD PROGRAM MANAGER.
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { email, adminName, adminPhone, username, password } = req.body;
    console.log("user:", req.user.role);
    // Validate required fields
    if (!email || !adminName || !adminPhone || !username || !password) {
      return res
        .status(400)
        .json({ msg: "Please provide all required fields." });
    }

    console.log("Adding new Program Manager...");

    try {
      // Check if the program manager already exists
      let existingPM = await ProgramManager.findOne({ email });
      if (existingPM) {
        return res.status(400).json({ msg: "Program Manager already exists." });
      }

      // Initialize program manager data object
      let programManagerData = {
        email,
        adminName,
        adminPhone,
        username,
        password,
        isActive: true,
      };

      // Determine if the logged-in user is a Superadmin or Admin
      if (req.user.role === "Super Admin") {
        const superAdmin = await Superadmin.findById(req.user._id);
        if (!superAdmin) {
          return res.status(404).json({ msg: "Super Admin not found." });
        }
        // Assign the super admin's ID to the program manager
        programManagerData.superAdmin = req.user._id;
      } else if (req.user.role === "Admin") {
        //console.log('*******')
        const organization = await Organization.findById(req.user._id);
        //console.log('org:',organization)
        if (!organization) {
          return res.status(404).json({ msg: "Admin organization not found." });
        }
        // Assign the admin's (organization's) ID to the program manager
        programManagerData.admin = req.user._id;
      }

      // Create a new Program Manager
      const newPM = new ProgramManager(programManagerData);

      // Hash the password before saving
      const salt = await bcrypt.genSalt(10);
      newPM.password = await bcrypt.hash(password, salt);

      // Save the new Program Manager
      await newPM.save();
      console.log("New Program Manager:", newPM);

      // If admin, push the PM ID to the organization's list of program managers
      if (req.user.role == "Admin") {
        await Organization.findByIdAndUpdate(
          req.user._id,
          { $push: { programManager: newPM._id } },
          { new: true }
        );
      } else {
        // If super admin, push the PM ID to the super admin's list of program managers
        await Superadmin.findByIdAndUpdate(
          req.user._id,
          { $push: { programManager: newPM._id } },
          { new: true }
        );
      }

      // Send welcome email to the new program manager
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "WELCOME TO IITI DRISHTI CPS FOUNDATION",
        html: `
          <div style="max-width: 600px; margin: auto; border: 1px solid #ccc; padding: 20px; font-family: 'Helvetica', 'Arial', sans-serif; color: #333;">
            <div style="text-align: center; margin-bottom: 20px;">
              <a href="https://drishticps.iiti.ac.in/">
                <img src="cid:logo" alt="IITI DRISHTI CPS FOUNDATION Logo" style="width: 100px; height: auto;">
              </a>
            </div>
            <h2 style="color: #005A9C; text-align: center;">WELCOME TO <strong>IITI DRISHTI CPS FOUNDATION</strong></h2>
            <p>Hello <strong>${adminName}</strong>,</p>
            <p>You have been added as a Program Manager</p>
            
            <p>If you have any questions, feel free to <a href="mailto:${process.env.EMAIL}" style="color: #005A9C;">contact us</a> at any time.</p>
            <p style="border-top: 1px solid #ccc; padding-top: 10px; text-align: center;">Best regards,<br>Your <strong>IITI DRISHTI CPS FOUNDATION</strong> Team</p>
            <footer style="text-align: center; color: #888; font-size: 12px; margin-top: 20px;">
              <p>Follow us on:
                <a href="https://drishticps.iiti.ac.in/" style="text-decoration: none; color: #3b5998;">Facebook</a>,
                <a href="https://drishticps.iiti.ac.in/" style="text-decoration: none; color: #1DA1F2;">Twitter</a>,
                <a href="https://in.linkedin.com/company/iiti-drishti-cps-foundation-iit-indore/" style="text-decoration: none; color: #0077B5;">LinkedIn</a>
              </p>
            </footer>
          </div>
        `,
        attachments: [
          {
            filename: "logo.jpg",
            path: path.join(__dirname, "../assets/logo.jpg"),
            cid: "logo",
          },
        ],
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.error("Error sending email:", error);
          return res.status(500).json({ msg: "Error in sending email" });
        }
        console.log("Email sent: " + info.response);
        res.status(201).json({
          programManager: newPM,
        });
      });
    } catch (err) {
      console.error("Server error:", err.message);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

module.exports = router;



//LOGIN PROGRAM MANAGER.
// Route to log in as a Program Manager
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("PROGRAM MANAGER LOGIN*********");

  try {
    const user = await ProgramManager.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    // Check if the user is active
    if (!user.isActive) {
      return res.status(403).json({ msg: "Account Disabled" });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    // Create JWT payload
    const payload = {
      user,
      pm: {
        role: "Program Manager",
      },
    };

    // Sign JWT token
    jwt.sign(
      user.toJSON(),
      process.env.JWT_SECRET,
      { expiresIn: "5h" }, // Set an appropriate expiration time
      (err, token) => {
        if (err) throw err;

        // Set the JWT token in an HTTP-only cookie
        res.cookie(`programManagerToken._${user._id}`, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production", // Use HTTPS in production
          sameSite: "strict", // Prevent CSRF attacks
          maxAge: 5 * 60 * 60 * 1000, // 5 hours in milliseconds
        });
        //  console.log("********:",req.body.role)
        // Respond with user data but not the token
        res.status(200).json({
          user,
          payload,
          token,
          role: req.body.role,
          id: user._id,
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

/*
// @route GET api/programmanagers/me
// @desc Get the logged-in program manager details
router.get("/me", passport.authenticate('jwt',{session:false}), async (req, res) => {
 // console.log('***************')
  try {
    let programManager;
    if (req.user.id === "default-id") {
      // If the default program manager
      programManager = {
        email: "default@manager.com",
        name: "Program Manager",
      };
    } else {
      programManager = await ProgramManager.findById(req.user.id).select(
        "-password"
      );
    }

    if (!programManager) {
      return res.status(400).json({ msg: "Program Manager not found" });
    }

    res.json(programManager);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});
*/
//UPDATING PROGRAM MANAGER DETAILS ROUTE.
router.get(
  "/me",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      console.log("role:", req.user.role);
      const programManager = await ProgramManager.findById(req.user._id);
      if (programManager) {
        return res.json(programManager);
      } else {
        res.json({ msg: "Program Manager not found" });
      }
    } catch (err) {
      console.log("error", err);
      res.json({ msg: "Internal Server Error" });
    }
  }
);

// Route to get all program managers across all organizations
router.get("/all", auth, async (req, res) => {
  try {
    const programManagers = await ProgramManager.find();
    res.json(programManagers);
  } catch (err) {
    console.error("Error fetching program managers:", err.message);
    res.status(500).send("Server error");
  }
});

// Route to get all active program managers
router.get(
  "/active",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const activeProgramManagers = await ProgramManager.find({
        isActive: true,
      });
      // console.log('pm1:',activeProgramManagers);
      res.json(activeProgramManagers);
    } catch (err) {
      console.error("Error fetching active program managers:", err.message);
      res.status(500).send("Server error");
    }
  }
);

// Route to get all inactive program managers
router.get(
  "/inactive",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const inactiveProgramManagers = await ProgramManager.find({
        isActive: false,
      });
      //  console.log('pm2:',inactiveProgramManagers);
      res.json(inactiveProgramManagers);
    } catch (err) {
      console.error("Error fetching inactive program managers:", err.message);
      res.status(500).send("Server error");
    }
  }
);

// Route to get the count of active program managers
router.get("/active/count", async (req, res) => {
  try {
    console.log("Active count");
    const count = await ProgramManager.countDocuments({ isActive: true });
    res.json({ count });
  } catch (err) {
    console.error(
      "Error fetching count of active program managers:",
      err.message
    );
    res.status(500).send("Server error");
  }
});

// Route to get the count of inactive program managers
router.get("/inactive/count", auth, async (req, res) => {
  try {
    const count = await ProgramManager.countDocuments({ isActive: false });
    res.json({ count });
  } catch (err) {
    console.error(
      "Error fetching count of inactive program managers:",
      err.message
    );
    res.status(500).send("Server error");
  }
});

// Route to get all program managers for the logged-in admin
router.get("/", auth, async (req, res) => {
  try {
    console.log("Fetching Program Managers for Admin:", req.user.id); // Debugging line
    const programManagers = await ProgramManager.find({ admin: req.user.id });
    console.log("Fetched Program Managers:", programManagers); // Debugging line
    res.json(programManagers);
  } catch (err) {
    console.error("Error fetching program managers:", err.message);
    res.status(500).send("Server error");
  }
});

// Route to get all active program managers for the logged-in admin
router.get("/active/by-admin", async (req, res) => {
  try {
    //  console.log(req.user)
    const activeProgramManagers = await ProgramManager.find({
      isActive: true,
      admin: req.user._id, // Filter by the logged-in admin's ID
    });
    res.json(activeProgramManagers);
  } catch (err) {
    console.error("Error fetching active program managers:", err.message);
    res.status(500).send("Server error");
  }
});

// Route to get all inactive program managers for the logged-in admin
router.get("/inactive/by-admin", auth, async (req, res) => {
  try {
    const inactiveProgramManagers = await ProgramManager.find({
      isActive: false,
      admin: req.user.id, // Filter by the logged-in admin's ID
    });
    res.json(inactiveProgramManagers);
  } catch (err) {
    console.error("Error fetching inactive program managers:", err.message);
    res.status(500).send("Server error");
  }
});

// Route to get the count of active program managers for the logged-in admin
router.get(
  "/active/count/by-admin",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      // console.log(req.user)
      const count = await ProgramManager.countDocuments({
        isActive: true,
        admin: req.user._id, // Filter by the logged-in admin's ID
      });
      //  console.log(count)
      res.json({ count });
    } catch (err) {
      console.error(
        "Error fetching count of active program managers:",
        err.message
      );
      res.status(500).send("Server error");
    }
  }
);

// Route to get the count of inactive program managers for the logged-in admin
router.get(
  "/inactive/count/by-admin",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const count = await ProgramManager.countDocuments({
        isActive: false,
        admin: req.user._id, // Filter by the logged-in admin's ID
      });
      res.json({ count });
    } catch (err) {
      console.error(
        "Error fetching count of inactive program managers:",
        err.message
      );
      res.status(500).send("Server error");
    }
  }
);

// Route to get a program manager by ID
router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const programManager = await ProgramManager.findById(req.params.id);
      if (!programManager) {
        return res.status(404).json({ msg: "Program Manager not found" });
      }
      res.json(programManager);
    } catch (err) {
      console.error("Error fetching program manager:", err.message);
      res.status(500).send("Server error");
    }
  }
);

// Route to update a program manager by ID
router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { email, adminName, adminPhone, username, password } = req.body;
    // Build program manager object
    const programManagerFields = {};
    if (email) programManagerFields.email = email;
    if (adminName) programManagerFields.adminName = adminName;
    if (adminPhone) programManagerFields.adminPhone = adminPhone;
    if (username) programManagerFields.username = username;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      programManagerFields.password = await bcrypt.hash(password, salt);
    }

    try {
      let programManager = await ProgramManager.findById(req.params.id);
      if (!programManager) {
        return res.status(404).json({ msg: "Program Manager not found" });
      }

      programManager = await ProgramManager.findByIdAndUpdate(
        req.params.id,
        { $set: programManagerFields },
        { new: true }
      );

      res.json(programManager);
    } catch (err) {
      console.error("Error updating program manager:", err.message);
      res.status(500).send("Server error");
    }
  }
);

// Route to disable a program manager by ID
router.put(
  "/:id/disable",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    console.log("disable*****");
    try {
      let programManager = await ProgramManager.findById(req.params.id);
      console.log(programManager);
      if (!programManager) {
        return res.status(404).json({ msg: "Program Manager not found" });
      }

      programManager.isActive = false;
      await programManager.save();
      console.log("disable pm:", programManager);
      res.json({ msg: "Program Manager disabled successfully" });
    } catch (err) {
      console.error("Error disabling program manager:", err.message);
      res.status(500).send("Server error");
    }
  }
);

// Route to enable a program manager by ID
router.put(
  "/:id/enable",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      let programManager = await ProgramManager.findById(req.params.id);
      if (!programManager) {
        return res.status(404).json({ msg: "Program Manager not found" });
      }

      programManager.isActive = true;
      await programManager.save();
      console.log("enable pm:", programManager);
      res.json({ msg: "Program Manager enabled successfully" });
    } catch (err) {
      console.error("Error enabling program manager:", err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
