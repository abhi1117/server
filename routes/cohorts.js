const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Cohort = require('../models/Cohorts');
const Pipeline = require('../models/Pipelines'); // Import the Pipeline model
const mongoose = require('mongoose'); // Import mongoose
const { S3Client } = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3");
const passport=require('passport');

// AWS S3 setup
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Multer S3 Storage Setup for cohort posters
const storage = multerS3({
  s3: s3,
  bucket: process.env.S3_BUCKET_NAME, // Your bucket name from environment variables
  acl: "public-read", // You can change this to "private" if you don't want public access
  key: function (req, file, cb) {

    const cohortName = req.body.name.replace(/[^a-zA-Z0-9]/g, '_'); // Sanitize the cohort name to remove special characters



    const folderName = "cohorts-poster"; // Folder where cohort posters will be stored
    // const uniqueFileName = `${Date.now()}-${file.originalname}`; // Unique file name with timestamp
    const uniqueFileName = `${Date.now()}-${cohortName}-${file.originalname}`; // Unique file name with cohort name and timestamp

    const filePath = `${folderName}/${uniqueFileName}`; // File path within the folder
    cb(null, filePath);
  },
});

// Initialize Multer with S3 storage engine
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 10 }, // 10MB file size limit
});

// ** START CHANGE FOR INCREASING PAYLOAD SIZE LIMIT **
// Increase payload size limit for JSON and URL-encoded bodies globally
router.use(express.json({ limit: '50mb' })); // Set 50MB limit for JSON
router.use(express.urlencoded({ limit: '50mb', extended: true })); // Set 50MB limit for URL-encoded bodies
// ** END CHANGE FOR INCREASING PAYLOAD SIZE LIMIT **


// ** CREATE ** (POST) Create a new cohort with a file upload
router.post('/',passport.authenticate('jwt',{session:false}),upload.single('poster'), async (req, res) => {
  const { program, name, about, eligibility, industry, focusArea } = req.body;
  // const poster = req.file ? req.file.path : '';
  const poster = req.file ? req.file.location : ''; // Use S3 file location

//  console.log('pm:',req.user);

  try {
    const newCohort = new Cohort({
      program,
      name,
      poster,
      about,
      eligibility,
      industry,
      focusArea,
      programManager:req.user._id
    });

    const cohort = await newCohort.save();

    await ProgramManager.findByIdAndUpdate(req.user._id, {
      $push: { cohorts: cohort._id }, // Add cohort ID to Program Manager's cohorts array
    });

    res.json(cohort);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
/*
// ** READ ** (GET) Get all cohorts
router.get('/', async (req, res) => {
  try {
    const cohorts = await Cohort.find();
    res.json(cohorts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});*/

// GET COHORTS FOR SPECIFIC PROGRAM MANAGER.
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    // Get the Program Manager's ID from the authenticated user
    const programManagerId = req.user._id;
    console.log('id:',programManagerId);
    // Find cohorts that belong to this Program Manager
    const cohorts = await Cohort.find({ programManager: programManagerId });

    res.json(cohorts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// ** READ ** (GET) Get a specific cohort by ID
router.get('/:id', passport.authenticate('jwt',{session:false}),async (req, res) => {
  try {
    //console.log('id**',req.params.id)
    const cohort = await Cohort.findById(req.params.id);

    if (!cohort) {
      return res.status(404).json({ msg: 'Cohort not found' });
    }

    res.json(cohort);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ** UPDATE ** (PUT) Update a specific cohort by ID
router.put('/:id',passport.authenticate('jwt',{session:false}), upload.single('poster'), async (req, res) => {
  const { program, name, about, eligibility, industry, focusArea } = req.body;
  // const poster = req.file ? req.file.path : '';
  const poster = req.file ? req.file.location : ''; // Use S3 file location
  console.log('id**',poster);
  try {
    let cohort = await Cohort.findById(req.params.id);

    if (!cohort) {
      return res.status(404).json({ msg: 'Cohort not found' });
    }

    cohort = await Cohort.findByIdAndUpdate(
      req.params.id,
      { program, name, poster, about, eligibility, industry, focusArea },
      { new: true }
    );

    res.json(cohort);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// ** DELETE ** (DELETE) Delete a specific cohort by ID
router.delete('/:id',passport.authenticate('jwt',{session:false}),async (req, res) => {
  try {
    // Check if the provided ID is a valid MongoDB ObjectID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: 'Invalid cohort ID format' });
    }
    console.log("id9*******",req.params.id);
    let cohort = await Cohort.findById(req.params.id);

    if (!cohort) {
      return res.status(404).json({ msg: 'Cohort not found' });
    }

    // Use findByIdAndDelete instead of findByIdAndRemove
    await Cohort.findByIdAndDelete(req.params.id);
    await ProgramManager.findByIdAndUpdate(cohort.programManager, {
      $pull: { cohorts: cohort._id }, // Remove the cohort ID from the array
    });

    res.json({ msg: 'Cohort removed and program manager updated' });

  } catch (err) {
    console.error('Error deleting cohort:', err.message); // Enhanced error logging
    res.status(500).send('Server Error');
  }
});
// ** START CHANGE for total Cohorts count --- **

// ** API to get the total count of cohorts **
router.get('/total/count',passport.authenticate('jwt',{session:false}) ,async (req, res) => {
  try {
    // Count the total number of cohorts
    const cohortCount = await Cohort.countDocuments({programManager:req.user._id});

    // Send the total count in the response
    res.json({ count: cohortCount });
  } catch (err) { 
    console.error('Error fetching cohort count:', err);
    res.status(500).send('Server Error');
  }
});

// ** END CHANGE for total Cohorts count --- **

// ** START  CHANGE FOR total pipelines count --- **

// ** API to get the total count of pipelines under a particular cohort **
router.get('/:id/pipelines/count', async (req, res) => {
  try {
    // Find the cohort by the ID provided in the request params
    const cohort = await Cohort.findById(req.params.id);
    if (!cohort) {
      return res.status(404).json({ msg: 'Cohort not found' });
    }

    // Count the number of pipelines under the specific cohort
    const pipelineCount = await Pipeline.countDocuments({ cohort: cohort.name });
    
    // Send the total count in the response
    res.json({ count: pipelineCount });
  } catch (err) {
    console.error('Error fetching pipeline count:', err);
    res.status(500).send('Server Error');
  }
});

// ** END CHANGE FOR total pipelines count --- **
// ** START  CHANGE FOR pipelines list --- **

// ** API to get the list of pipelines under a particular cohort **
router.get('/:id/pipelines',passport.authenticate('jwt',{session:false}), async (req, res) => {
  try {
    // Find the cohort by the ID provided in the request params
    const cohort = await Cohort.findById(req.params.id);
    if (!cohort) {
      return res.status(404).json({ msg: 'Cohort not found' });
    }

    // Find all pipelines under the specific cohort
    const pipelines = await Pipeline.find({ cohort: cohort.name });
    
    // Send the list of pipelines in the response
    res.json(pipelines);
  } catch (err) {
    console.error('Error fetching pipelines list:', err);
    res.status(500).send('Server Error');
  }
});

// ** END CHANGE FOR pipelines list --- **





module.exports = router;






 