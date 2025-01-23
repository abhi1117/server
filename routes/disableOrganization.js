// const express = require("express");
// const router = express.Router();
// const Organization = require("../models/Organization");
// const auth = require("../middleware/auth");

// // @route   PUT api/disableOrganization/:id
// // @desc    Disable an organization
// router.put("/:id", auth, async (req, res) => {
//   try {
//     const organization = await Organization.findById(req.params.id);
//     if (!organization) {
//       return res.status(404).json({ msg: "Organization not found" });
//     }

//     organization.isActive = false;
//     await organization.save();
//     res.json({ msg: "Organization disabled successfully", organization });
//   } catch (err) {
//     console.error(err.message);
//     if (err.kind === "ObjectId") {
//       return res.status(404).json({ msg: "Invalid organization ID" });
//     }
//     res.status(500).send("Server error");
//   }
// });

// module.exports = router;






const express = require("express");
const router = express.Router();
const Organization = require("../models/Organization");
const auth = require("../middleware/auth");
const passport=require('../config/passportJWT');

// @route   PUT api/disableOrganization/:id
// @desc    Disable an organization
router.put("/:id", passport.authenticate('jwt',{session:false}), async (req, res) => {
  console.log('id:',req.params.id)
  try {
    const organization = await Organization.findById(req.params.id);
   // console.log('disable:',organization)
    if (!organization) {
      return res.status(404).json({ msg: "Organization not found" });
    }

    organization.isActive = false;
    await organization.save();
    res.json({ msg: "Organization disabled successfully", organization });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Invalid organization ID" });
    }
    res.status(500).send("Server error");
  }
});

// @route   PUT api/disableOrganization/enable/:id
// @desc    Enable an organization
router.put("/enable/:id", passport.authenticate('jwt',{session:false}), async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    console.log('enable:',organization)
    if (!organization) {
      return res.status(404).json({ msg: "Organization not found" });
    }

    organization.isActive = true;
    await organization.save();
    console.log('enable:',organization);
    res.json({ msg: "Organization enabled successfully", organization });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Invalid organization ID" });
    }
    res.status(500).send("Server error");
  }
});

module.exports = router;
