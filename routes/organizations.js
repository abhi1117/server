const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Organization = require("../models/Organization");
const auth = require("../middleware/auth");
const passport=require('passport');
const Superadmin = require("../models/Superadmin");

// @route   POST api/organizations
// @desc    Create a new organization
router.post("/",passport.authenticate('jwt',{session:false}), async (req, res) => {
 // console.log('Creating organization',req.body)
  const {
    organizationName,
    adminName,
    phoneNumber,
    username,
    email,
    password,
  } = req.body;

  try {
    let org = await Organization.findOne({ email });
    if (org) {
      return res.status(400).json({ msg: "Organization already exists" });
    }

    org = new Organization({
      name: organizationName,
      adminName,
      adminPhone: phoneNumber,
      username,
      email,
      password,
      isActive: true, // New field to track active status
      superAdmin:req.user._id
    });
   
    const salt = await bcrypt.genSalt(10);
    org.password = await bcrypt.hash(password, salt);

    await org.save();
  //  console.log(org)
    await Superadmin.findByIdAndUpdate(
      req.user._id,
      { $push: { organizations: org._id } }, // Add the new organization ID to the array
      { new: true, useFindAndModify: false } // Return the updated document
    );
    
    res.json({
      message: "Organization created successfully",
      organization: org,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET api/organizations
// @desc    Get all organizations
router.get("/", passport.authenticate('jwt',{session:false}), async (req, res) => {
  try {
    const organizations = await Organization.find();
  //  console.log('ALL ORG:',organizations);
    res.json(organizations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET api/organizations/active
// @desc    Get all active organizations
router.get("/active", passport.authenticate('jwt',{session:false}) , async (req, res) => {
  try {
    const organizations = await Organization.find({ isActive: true });
  //  console.log('ORG1:',organizations);
    res.json(organizations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET api/organizations/inactive
// @desc    Get all inactive organizations
router.get("/inactive", passport.authenticate('jwt',{session:false}), async (req, res) => {
  try {
    const organizations = await Organization.find({ isActive: false });
  //  console.log('ORG2:',organizations);
    res.json(organizations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET api/organizations/:id
// @desc    Get organization by ID
router.get("/:id", passport.authenticate('jwt',{session:false}) ,async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
   // console.log('ORG3:',organization);
    if (!organization) {
      return res.status(404).json({ msg: "Organization not found" });
    }
    res.json(organization);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Organization not found" });
    }
    res.status(500).send("Server error");
  }
});

// @route   PUT api/organizations/:id
// @desc    Update an organization
router.put("/update/:id", passport.authenticate('jwt',{session:false}), async (req, res) => {
 // console.log('updating org')
  const {
    organizationName,
    adminName,
    phoneNumber,
    username,
    email,
    password,
  } = req.body;

  const organizationFields = {};
  if (organizationName) organizationFields.name = organizationName;
  if (adminName) organizationFields.adminName = adminName;
  if (phoneNumber) organizationFields.adminPhone = phoneNumber;
  if (username) organizationFields.username = username;
  if (email) organizationFields.email = email;
  if (password) {
    const salt = await bcrypt.genSalt(10);
    organizationFields.password = await bcrypt.hash(password, salt);
  }

  try {
    let organization = await Organization.findById(req.params.id);
  //  console.log('ORG4:',organization);
    if (!organization)
      return res.status(404).json({ msg: "Organization not found" });

    organization = await Organization.findByIdAndUpdate(
      req.params.id,
      { $set: organizationFields },
      { new: true }
    );

    res.json(organization);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Organization not found" });
    }
    res.status(500).send("Server error");
  }
});

module.exports = router;
