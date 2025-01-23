const express = require("express");
const router = express.Router();
const Pipeline = require("../models/Pipelines");
const { Form } = require("../models/Form");
const multer = require("multer");
const path = require("path");
const AWS = require("aws-sdk"); // For S3 integration
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");
const passport = require("passport");
const ProgramManager = require("../models/ProgramManager");
const { FormSubmission } = require("../models/Form"); // after round in Applications.jsx
// Initialize AWS S3 SDK
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// ===================== START CHANGE FOR application Poster and supporting Documents =====================

// Multer S3 Storage Setup for supporting documents
const storageSupportingDocuments = multerS3({
  s3: s3,
  bucket: process.env.S3_BUCKET_NAME,
  acl: "public-read", // Change as per your ACL policy
  key: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`; // Create unique file name
    const filePath = `supportingDocuments/${fileName}`; // Store in 'supportingDocuments' folder
    cb(null, filePath);
  },
});

// Multer S3 Storage Setup for application posters
const storageApplicationPosters = multerS3({
  s3: s3,
  bucket: process.env.S3_BUCKET_NAME,
  acl: "public-read", // Change as per your ACL policy
  key: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`; // Create unique file name
    const filePath = `applicationPosters/${fileName}`; // Store in 'applicationPosters' folder
    cb(null, filePath);
  },
});

// Initialize Multer for supporting documents
const uploadSupportingDocuments = multer({
  storage: storageSupportingDocuments,
  limits: { fileSize: 1024 * 1024 * 10 }, // 10MB file size limit
});

// Initialize Multer for application posters
const uploadApplicationPosters = multer({
  storage: storageApplicationPosters,
  limits: { fileSize: 1024 * 1024 * 10 }, // 10MB file size limit
});
// ===================== END CHANGE FOR application Poster and supporting Documents =====================

// @route   GET /api/pipelines
// @desc    Get all pipelines or filter by cohort
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { cohort } = req.query;

      let pipelines;
      if (cohort) {
        pipelines = await Pipeline.find({ cohort });
      } else {
        pipelines = await Pipeline.find({ programManager: req.user._id });
      }

      res.json(pipelines);
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

// @route   GET /api/pipelines/:id
// @desc    Get a pipeline by ID
router.get("/:id", async (req, res) => {
  try {
    const pipeline = await Pipeline.findById(req.params.id);

    if (!pipeline) {
      return res.status(404).json({ error: "Pipeline not found" });
    }

    res.json(pipeline);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// @route   POST /api/pipelines
// @desc    Create a new pipeline
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { program, cohort, type, title } = req.body;

    try {
      // Initialize with default Round 1
      const defaultRound1 = {
        roundNumber: 1,
        type: "Public",
        link: "",
        startDate: new Date(),
        endDate: new Date(),
        status: "Not open yet",
      };

      const newPipeline = new Pipeline({
        program,
        cohort,
        type,
        title,
        programManager: req.user._id,
        rounds: [defaultRound1], // Default Round 1 added here
      });

      const savedPipeline = await newPipeline.save();
      await ProgramManager.findByIdAndUpdate(req.user._id, {
        $push: { pipeLine: savedPipeline._id },
      });
      res.json(savedPipeline);
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

// @route   PUT /api/pipelines/:id
// @desc    Update a pipeline
router.put("/:id", async (req, res) => {
  const { program, cohort, type, title } = req.body;

  try {
    const updatedPipeline = await Pipeline.findByIdAndUpdate(
      req.params.id,
      { program, cohort, type, title },
      { new: true }
    );

    if (!updatedPipeline) {
      return res.status(404).json({ error: "Pipeline not found" });
    }

    res.json(updatedPipeline);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// @route   DELETE /api/pipelines/:id
// @desc    Delete a pipeline
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const deletedPipeline = await Pipeline.findByIdAndDelete(req.params.id);

      if (!deletedPipeline) {
        return res.status(404).json({ error: "Pipeline not found" });
      }
      await ProgramManager.findByIdAndUpdate(deletedPipeline.programManager, {
        $pull: { pipeLine: deletedPipeline._id }, // Remove form ID from the `forms` array
      });
      res.json({ message: "Pipeline deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }
);
// @route   PUT /api/pipelines/:id/forms
// @desc    Attach a form to a pipeline
/** START  CHANGE FOR form--- **/
console.log("Form model:", Form); // This should not be undefined or empty
/** END CHANGE FOR form--- **/

router.put(
  "/:id/forms",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { formId } = req.body;

    try {
      // console.log('Received formId:', formId); // Debugging statement to log formId

      const pipeline = await Pipeline.findById(req.params.id);
      const form = await Form.findById(formId); // This line should not throw an error

      if (!pipeline) {
        console.warn("Pipeline not found with id:", req.params.id);
        return res.status(404).json({ error: "Pipeline not found" });
      }

      if (!form) {
        console.warn("Form not found with id:", formId);
        return res.status(404).json({ error: "Form not found" });
      }

      // console.log('Attaching form with title:', form.title);

      pipeline.forms = formId; // Update the form reference in the pipeline
      pipeline.formTitle = form.title; // Update the form title in the pipeline

      await pipeline.save();

      // console.log('Pipeline updated successfully with form');

      res.json(pipeline);
    } catch (err) {
      console.error("Error updating pipeline with form:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// @route   PUT /api/pipelines/:id/rounds/:roundNumber/forms
// @desc    Attach a form to a specific round in a pipeline
router.put(
  "/:id/rounds/:roundNumber/forms",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { formId } = req.body;

    try {
      const pipeline = await Pipeline.findById(req.params.id);
      const form = await Form.findById(formId);

      if (!pipeline || !form) {
        return res.status(404).json({ error: "Pipeline or form not found" });
      }

      // Find the round by roundNumber and update the application form data
      const round = pipeline.rounds.find(
        (r) => r.roundNumber === parseInt(req.params.roundNumber)
      );
      if (!round) return res.status(404).json({ error: "Round not found" });

      round.application = {
        addApplication: true,
        formId,
        formTitle: form.title,
      };
      await pipeline.save();

      res.json(pipeline);
    } catch (error) {
      console.error("Error attaching form to round:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// PUT route to update addApplication toggle
router.put(
  "/:id/rounds/:roundNumber/addApplication",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const pipeline = await Pipeline.findById(req.params.id);
      if (!pipeline) {
        return res.status(404).json({ error: "Pipeline not found" });
      }

      const round = pipeline.rounds.find(
        (r) => r.roundNumber === parseInt(req.params.roundNumber)
      );
      if (!round) {
        return res.status(404).json({ error: "Round not found" });
      }

      round.application.addApplication = req.body.addApplication;
      await pipeline.save();

      res.status(200).json(pipeline);
    } catch (error) {
      console.error("Error updating addApplication toggle:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// @route   PUT /api/pipelines/:id/applicationTitle
// @desc    Update application title in a specific pipeline
/*** START CHANGE FOR application title --- ***/

// POST: Create a new application title
router.post(
  "/:id/applicationTitle",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      console.log(req.user);
      const pipelineId = req.params.id;
      console.log(`Pipeline ID: ${pipelineId}`);
      const pipeline = await Pipeline.findById(pipelineId);
      if (!pipeline) {
        return res.status(404).json({ error: "Pipeline not found" });
      }

      console.log(`Received application title: ${req.body.applicationTitle}`);
      pipeline.applicationTitle = req.body.applicationTitle;
      await pipeline.save();

      res.status(201).json(pipeline);
    } catch (err) {
      console.error("Error creating application title:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// PUT: Update an existing application title
router.put(
  "/:id/applicationTitle",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const pipeline = await Pipeline.findById(req.params.id);
      if (!pipeline) {
        return res.status(404).json({ error: "Pipeline not found" });
      }

      pipeline.applicationTitle = req.body.applicationTitle;
      await pipeline.save();

      res.status(200).json(pipeline);
    } catch (err) {
      console.error("Error updating application title:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

/*** END CHANGE FOR application title --- ***/

/*** START CHANGE FOR application title --- ***/

// POST: Create a new application title
router.post(
  "/:id/rounds/:roundNumber/applicationTitle",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const pipeline = await Pipeline.findById(req.params.id);
      if (!pipeline)
        return res.status(404).json({ error: "Pipeline not found" });

      const round = pipeline.rounds.find(
        (r) => r.roundNumber === parseInt(req.params.roundNumber)
      );
      if (!round) return res.status(404).json({ error: "Round not found" });

      round.applicationFormDesign.applicationTitle = req.body.applicationTitle;
      await pipeline.save();

      res.status(201).json(round);
    } catch (err) {
      console.error("Error creating application title:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// PUT: Update an existing application title
router.put(
  "/:id/rounds/:roundNumber/applicationTitle",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const pipeline = await Pipeline.findById(req.params.id);
      if (!pipeline)
        return res.status(404).json({ error: "Pipeline not found" });

      const round = pipeline.rounds.find(
        (r) => r.roundNumber === parseInt(req.params.roundNumber)
      );
      if (!round) return res.status(404).json({ error: "Round not found" });

      round.applicationFormDesign.applicationTitle = req.body.applicationTitle;
      await pipeline.save();

      res.status(200).json(round);
    } catch (err) {
      console.error("Error updating application title:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

/*** END CHANGE FOR application title --- ***/

/*** START CHANGE FOR description --- ***/
// POST: Create a new description
router.post(
  "/:id/description",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const pipelineId = req.params.id;
      const pipeline = await Pipeline.findById(pipelineId);
      if (!pipeline) {
        return res.status(404).json({ error: "Pipeline not found" });
      }

      pipeline.description = req.body.description;
      await pipeline.save();

      res.status(201).json(pipeline);
    } catch (err) {
      console.error("Error creating description:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// PUT: Update an existing description
router.put(
  "/:id/description",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const pipeline = await Pipeline.findById(req.params.id);
      if (!pipeline) {
        return res.status(404).json({ error: "Pipeline not found" });
      }

      pipeline.description = req.body.description;
      await pipeline.save();

      res.status(200).json(pipeline);
    } catch (err) {
      console.error("Error updating description:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);
/*** END CHANGE FOR description --- ***/
/*** START CHANGE FOR description --- ***/
// POST: Create a new description in the specified round
router.post(
  "/:id/rounds/:roundNumber/description",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const pipeline = await Pipeline.findById(req.params.id);
      if (!pipeline)
        return res.status(404).json({ error: "Pipeline not found" });

      const round = pipeline.rounds.find(
        (r) => r.roundNumber === parseInt(req.params.roundNumber)
      );
      if (!round) return res.status(404).json({ error: "Round not found" });

      round.applicationFormDesign.description = req.body.description;
      await pipeline.save();

      res.status(201).json(round);
    } catch (err) {
      console.error("Error creating description:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// PUT: Update an existing description in the specified round
router.put(
  "/:id/rounds/:roundNumber/description",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const pipeline = await Pipeline.findById(req.params.id);
      if (!pipeline)
        return res.status(404).json({ error: "Pipeline not found" });

      const round = pipeline.rounds.find(
        (r) => r.roundNumber === parseInt(req.params.roundNumber)
      );
      if (!round) return res.status(404).json({ error: "Round not found" });

      round.applicationFormDesign.description = req.body.description;
      await pipeline.save();

      res.status(200).json(round);
    } catch (err) {
      console.error("Error updating description:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);
/*** END CHANGE FOR description --- ***/

/*** START CHANGE FOR Supporting Documents --- ***/

// ===================== START CHANGE FOR application Poster and supporting Documents =====================
// POST: Add a new supporting document and upload to S3
router.post(
  "/:id/rounds/:roundNumber/supportingDocuments",
  passport.authenticate("jwt", { session: false }),
  uploadSupportingDocuments.single("supportingDocument"),
  async (req, res) => {
    try {
      const pipeline = await Pipeline.findById(req.params.id);
      if (!pipeline) {
        return res.status(404).json({ error: "Pipeline not found" });
      }

      const round = pipeline.rounds.find(
        (r) => r.roundNumber === parseInt(req.params.roundNumber)
      );
      if (!round) {
        return res.status(404).json({ error: "Round not found" });
      }

      // Ensure supportingDocuments is initialized
      if (!round.applicationFormDesign.supportingDocuments) {
        round.applicationFormDesign.supportingDocuments = [];
      }

      const newDocument = {
        name: req.file.originalname,
        url: req.file.location, // S3 file location
      };

      round.applicationFormDesign.supportingDocuments.push(newDocument);
      await pipeline.save();

      res.status(201).json(newDocument);
    } catch (err) {
      console.error("Error uploading document:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// POST: Add a new application poster and upload to S3
router.post(
  "/:id/poster",
  uploadApplicationPosters.single("poster"),
  async (req, res) => {
    try {
      const pipeline = await Pipeline.findById(req.params.id);

      if (!pipeline) {
        return res.status(404).json({ error: "Pipeline not found" });
      }

      const newPoster = {
        name: req.file.originalname,
        url: req.file.location, // S3 file location
      };

      pipeline.poster = newPoster;
      await pipeline.save();

      res.status(201).json(newPoster);
    } catch (err) {
      console.error("Error details:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// ===================== END CHANGE FOR application Poster and supporting Documents =====================

// GET: Retrieve all supporting documents for a pipeline
router.get(
  "/:id/supportingDocuments",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const pipeline = await Pipeline.findById(req.params.id);

      if (!pipeline) {
        return res.status(404).json({ error: "Pipeline not found" });
      }

      res.status(200).json(pipeline.supportingDocuments);
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

// DELETE: Remove a specific supporting document by its ID
router.delete(
  "/:id/supportingDocuments/:docId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const pipeline = await Pipeline.findById(req.params.id);

      if (!pipeline) {
        return res.status(404).json({ error: "Pipeline not found" });
      }

      // Check if the document ID exists in the pipeline
      const documentIndex = pipeline.supportingDocuments.findIndex(
        (doc) => doc._id.toString() === req.params.docId
      );

      if (documentIndex === -1) {
        return res.status(404).json({ error: "Document not found" });
      }

      // Remove the document from the array
      pipeline.supportingDocuments.splice(documentIndex, 1);

      await pipeline.save();

      res.status(200).json({ message: "Document removed successfully" });
    } catch (err) {
      console.error("Error deleting document:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

/*** END CHANGE FOR Supporting Documents --- ***/

// ===================== START CHANGE FOR Round-specific supporting documents upload =====================
router.post(
  "/:id/rounds/:roundNumber/supportingDocuments",
  passport.authenticate("jwt", { session: false }),
  uploadSupportingDocuments.single("supportingDocument"),
  async (req, res) => {
    try {
      const pipeline = await Pipeline.findById(req.params.id);
      if (!pipeline) {
        return res.status(404).json({ error: "Pipeline not found" });
      }

      const round = pipeline.rounds.find(
        (r) => r.roundNumber === parseInt(req.params.roundNumber)
      );
      if (!round) {
        return res.status(404).json({ error: "Round not found" });
      }

      const newDocument = {
        name: req.file.originalname,
        url: req.file.location, // S3 file location
      };

      round.applicationFormDesign.supportingDocuments.push(newDocument);
      await pipeline.save();

      res.status(201).json(newDocument);
    } catch (err) {
      console.error("Error uploading document:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);
// ===================== END CHANGE FOR Round-specific supporting documents upload =====================
// ===================== START CHANGE FOR Round-specific supporting documents retrieval =====================
// GET: Retrieve all supporting documents for a specific round in a pipeline
router.get(
  "/:id/rounds/:roundNumber/supportingDocuments",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const pipeline = await Pipeline.findById(req.params.id);
      if (!pipeline)
        return res.status(404).json({ error: "Pipeline not found" });

      const round = pipeline.rounds.find(
        (r) => r.roundNumber === parseInt(req.params.roundNumber)
      );
      if (!round) return res.status(404).json({ error: "Round not found" });

      res
        .status(200)
        .json(round.applicationFormDesign.supportingDocuments || []);
    } catch (err) {
      console.error("Error fetching supporting documents:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// ===================== END CHANGE FOR Round-specific supporting documents retrieval =====================
// ===================== START CHANGE FOR Round-specific supporting document deletion =====================
// DELETE: Remove a specific supporting document by its ID in a specific round
router.delete(
  "/:id/rounds/:roundNumber/supportingDocuments/:docId",
  async (req, res) => {
    try {
      const pipeline = await Pipeline.findById(req.params.id);
      if (!pipeline)
        return res.status(404).json({ error: "Pipeline not found" });

      const round = pipeline.rounds.find(
        (r) => r.roundNumber === parseInt(req.params.roundNumber)
      );
      if (!round) return res.status(404).json({ error: "Round not found" });

      const documentIndex =
        round.applicationFormDesign.supportingDocuments.findIndex(
          (doc) => doc._id.toString() === req.params.docId
        );
      if (documentIndex === -1)
        return res.status(404).json({ error: "Document not found" });

      round.applicationFormDesign.supportingDocuments.splice(documentIndex, 1); // Remove document
      await pipeline.save();

      res.status(200).json({ message: "Document removed successfully" });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

// ===================== END CHANGE FOR Round-specific supporting document deletion =====================

const storagePoster = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/applicationPoster"); // Define the folder for Poster uploads
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const uploadPoster = multer({
  storage: storagePoster,
  limits: { fileSize: 1024 * 1024 * 10 }, // 5MB file size limit for poster
});

// POST: Add a new poster

// GET: Retrieve poster for a pipeline
router.get(
  "/:id/poster",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const pipeline = await Pipeline.findById(req.params.id);

      if (!pipeline) {
        return res.status(404).json({ error: "Pipeline not found" });
      }

      res.status(200).json(pipeline.poster);
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

// PUT: Update an existing poster
router.put(
  "/:id/poster",
  passport.authenticate("jwt", { session: false }),
  uploadPoster.single("poster"),
  async (req, res) => {
    try {
      const pipeline = await Pipeline.findById(req.params.id);

      if (!pipeline) {
        return res.status(404).json({ error: "Pipeline not found" });
      }

      const updatedPoster = {
        name: req.file.originalname,
        url: req.file.path,
      };

      pipeline.poster = updatedPoster;
      await pipeline.save();

      res.status(200).json(updatedPoster);
    } catch (err) {
      console.error("Error updating poster:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

/*** START CHANGE FOR get application poster delete --- ***/
// DELETE: Remove the poster from a pipeline
router.delete(
  "/:id/poster",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const pipeline = await Pipeline.findById(req.params.id);

      if (!pipeline) {
        return res.status(404).json({ error: "Pipeline not found" });
      }

      pipeline.poster = []; // Clear the poster field
      await pipeline.save();

      res.status(200).json({ message: "Poster deleted successfully" });
    } catch (err) {
      console.error("Error deleting poster:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);
/*** END CHANGE FOR get application poster delete--- ***/

// POST: Add a new application poster for a specific round
router.post(
  "/:id/rounds/:roundNumber/poster",
  passport.authenticate("jwt", { session: false }),
  uploadApplicationPosters.single("poster"),
  async (req, res) => {
    try {
      const pipeline = await Pipeline.findById(req.params.id);
      const round = pipeline.rounds.find(
        (r) => r.roundNumber === parseInt(req.params.roundNumber)
      );

      if (!round) {
        return res.status(404).json({ error: "Round not found" });
      }

      const newPoster = {
        name: req.file.originalname,
        url: req.file.location,
      };

      round.applicationFormDesign.posterUrl = newPoster.url;
      await pipeline.save();

      res.status(201).json(newPoster);
    } catch (err) {
      console.error("Error adding poster:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// GET: Retrieve poster for a specific round
router.get("/:id/rounds/:roundNumber/poster", async (req, res) => {
  try {
    const pipeline = await Pipeline.findById(req.params.id);
    const round = pipeline.rounds.find(
      (r) => r.roundNumber === parseInt(req.params.roundNumber)
    );

    if (!round) return res.status(404).json({ error: "Round not found" });

    res.status(200).json({ posterUrl: round.applicationFormDesign.posterUrl });
  } catch (err) {
    console.error("Error fetching poster:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT: Update the poster for a specific round
router.put(
  "/:id/rounds/:roundNumber/poster",
  uploadApplicationPosters.single("poster"),
  async (req, res) => {
    try {
      const pipeline = await Pipeline.findById(req.params.id);
      const round = pipeline.rounds.find(
        (r) => r.roundNumber === parseInt(req.params.roundNumber)
      );

      if (!round) return res.status(404).json({ error: "Round not found" });

      round.applicationFormDesign.posterUrl = req.file.location;
      await pipeline.save();

      res.status(200).json({ posterUrl: req.file.location });
    } catch (err) {
      console.error("Error updating poster:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// DELETE: Remove poster for a specific round
router.delete("/:id/rounds/:roundNumber/poster", async (req, res) => {
  try {
    const pipeline = await Pipeline.findById(req.params.id);
    const round = pipeline.rounds.find(
      (r) => r.roundNumber === parseInt(req.params.roundNumber)
    );

    if (!round) return res.status(404).json({ error: "Round not found" });

    round.applicationFormDesign.posterUrl = "";
    await pipeline.save();

    res.status(200).json({ message: "Poster deleted successfully" });
  } catch (err) {
    console.error("Error deleting poster:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Route to activate the round and generate the link

// Middleware to check and update the round status based on the end date
const checkRoundExpiration = async (req, res, next) => {
  try {
    const pipeline = await Pipeline.findById(req.params.id);

    if (pipeline) {
      // Use the dates passed from the frontend for comparison
      const { startDate, endDate } = req.body;
      const currentISTDate = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      });
      const currentDate = new Date(currentISTDate);

      // Check if the current date is past the selected endDate
      if (endDate && currentDate > new Date(endDate)) {
        // Set the status to 'Expired' if the current date is past the selected endDate
        pipeline.roundStatus = "Expired";
      } else if (startDate && currentDate < new Date(endDate)) {
        // Set the status to 'Open' if the current date is before the selected endDate
        pipeline.roundStatus = "Open";
      }

      await pipeline.save();
    }

    next();
  } catch (err) {
    console.error("Error checking round expiration:", err);
    next();
  }
};

router.post(
  "/:id/activateRound",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { roundNumber, startDate, endDate, isActive, showLastDateToApply } =
        req.body; // Accepting round-specific dates

      // Find the pipeline by ID
      const pipeline = await Pipeline.findById(req.params.id);
      if (!pipeline) {
        return res.status(404).json({ error: "Pipeline not found" });
      }

      // Generate a single link for the pipeline
      const generatedLink = `https://incubator.drishticps.org/fa/${pipeline._id}`;
      pipeline.roundLink = generatedLink;

      // Update startDate and endDate for the specific round
      const round = pipeline.rounds.find((r) => r.roundNumber === roundNumber);
      if (!round) return res.status(404).json({ error: "Round not found" });

      round.startDate = startDate;
      round.endDate = endDate;
      round.status = "Open";
      round.startDate = startDate;
      round.endDate = endDate;
      round.status = isActive ? "Open" : "Not open yet";
      round.general.isActive = isActive;
      round.general.showLastDateToApply = showLastDateToApply;

      await pipeline.save();

      res.status(201).json({ link: generatedLink, status: round.status });
    } catch (err) {
      console.error("Error activating round:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

router.put(
  "/:id/rounds/:roundNumber/updateDates",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { startDate, endDate } = req.body;

    try {
      const pipeline = await Pipeline.findById(req.params.id);
      if (!pipeline)
        return res.status(404).json({ error: "Pipeline not found" });

      const round = pipeline.rounds.find(
        (r) => r.roundNumber === parseInt(req.params.roundNumber)
      );
      if (!round) return res.status(404).json({ error: "Round not found" });

      round.startDate = startDate;
      round.endDate = endDate;

      await pipeline.save();
      res
        .status(200)
        .json({ message: "Round dates updated successfully", round });
    } catch (error) {
      console.error("Error updating round dates:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// ===================== END CHANGE FOR save(POST) and fetch(GET) date and time =====================

// @route   GET /fa/:id
// @desc    Access the round link and check expiration
router.get("/fa/:id", async (req, res) => {
  try {
    const pipeline = await Pipeline.findById(req.params.id);

    if (!pipeline) {
      return res.status(404).json({ error: "Pipeline not found" });
    }
    // Find the active round with a status of 'Open'
    const activeRound = pipeline.rounds.find(
      (round) => round.status === "Open"
    );
    if (!activeRound) {
      return res.status(403).json({ error: "No active round available." });
    }
    // Convert server's current date to IST
    const currentDate = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });
    const currentISTDate = new Date(currentDate);

    // Check if the current date is past the endDate
    if (pipeline.endDate && currentISTDate > pipeline.endDate) {
      // Update the status to 'Expired' if it is not already
      if (pipeline.roundStatus !== "Expired") {
        pipeline.roundStatus = "Expired";
        await pipeline.save();
      }

      // Send the "Link Expired" response and do not allow access
      return res
        .status(403)
        .json({ error: "Access denied. Link has expired." });
    }

    // If the round is not expired, continue to serve the application
    res
      .status(200)
      .json({ message: "Welcome to the application form!", data: pipeline });
  } catch (err) {
    console.error("Error accessing the application link:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// @route   GET /api/pipelines/check-link/:id
// @desc    Check if the link is "Active" or "Expired"
// @route   GET /api/pipelines/check-link/:id
// @desc    Check if the link is "Active" or "Expired" based on Starts and Ends dates
router.get("/check-link/:id", async (req, res) => {
  try {
    const pipeline = await Pipeline.findById(req.params.id);
    if (!pipeline) {
      return res.status(404).json({ error: "Pipeline not found" });
    }

    const currentDate = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });
    const currentISTDate = new Date(currentDate);

    // **START CHANGE FOR checking round start and end dates ---**
    let isRoundActive = false;

    const activeRound = pipeline.rounds.find((round) => {
      const startDate = new Date(round.startDate);
      const endDate = new Date(round.endDate);

      if (
        round.status === "Open" &&
        startDate <= currentISTDate &&
        endDate >= currentISTDate
      ) {
        isRoundActive = true;
        return true;
      }
      return false;
    });

    if (!isRoundActive) {
      return res
        .status(403)
        .json({ error: "Access denied. Link has expired." });
    }

    res.status(200).json({ status: "Active", message: "The link is active." });
    // **END CHANGE FOR checking round start and end dates ---**
  } catch (err) {
    console.error("Error checking link status:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Use the middleware in the relevant route
router.get("/:id", checkRoundExpiration, async (req, res) => {
  try {
    const pipeline = await Pipeline.findById(req.params.id);

    if (!pipeline) {
      return res.status(404).json({ error: "Pipeline not found" });
    }

    res.json(pipeline);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/////for show Last Date To Apply
router.put(
  "/:id/rounds/:roundNumber/updateLastDateToggle",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const pipeline = await Pipeline.findById(req.params.id);
      if (!pipeline) {
        return res.status(404).json({ error: "Pipeline not found" });
      }

      // Locate the specific round by roundNumber
      const round = pipeline.rounds.find(
        (r) => r.roundNumber === parseInt(req.params.roundNumber)
      );
      if (!round) {
        return res.status(404).json({ error: "Round not found" });
      }

      // Update toggle and endDate for the specified round
      round.general.showLastDateToApply = req.body.showLastDateToApply || false;
      if (req.body.endDate) {
        round.endDate = req.body.endDate;
      }

      await pipeline.save();
      res.status(200).json(pipeline);
    } catch (err) {
      console.error("Error updating last date toggle:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

/** START CHANGE FOR round creation **/
router.post(
  "/:id/rounds",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { roundNumber, type, startDate, endDate, status } = req.body;

    try {
      const pipeline = await Pipeline.findById(req.params.id);
      if (!pipeline)
        return res.status(404).json({ error: "Pipeline not found" });

      const newRound = {
        roundNumber,
        type,
        startDate, // Separate "Starts" date for the round
        endDate, // Separate "Ends" date for the round
        status,
        general: { isActive: false, showLastDateToApply: false },
        application: { forms: null, formTitle: "" },
        applicationFormDesign: {
          applicationTitle: "",
          posterUrl: "",
          description: "",
          supportingDocuments: [],
        },
      };

      pipeline.rounds.push(newRound);
      await pipeline.save();
      res.status(201).json(newRound);
    } catch (error) {
      console.error("Error adding new round:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

/** END CHANGE FOR round creation **/
// DELETE: Remove a specific round by its number in a pipeline
router.delete(
  "/:id/rounds/:roundNumber",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const pipeline = await Pipeline.findById(req.params.id);
      if (!pipeline)
        return res.status(404).json({ error: "Pipeline not found" });

      const roundIndex = pipeline.rounds.findIndex(
        (r) => r.roundNumber === parseInt(req.params.roundNumber)
      );
      if (roundIndex === -1 || pipeline.rounds[roundIndex].roundNumber === 1) {
        // Prevent deletion if Round 1 or round not found
        return res
          .status(400)
          .json({ error: "Cannot delete Round 1 or round not found." });
      }

      pipeline.rounds.splice(roundIndex, 1); // Remove the round
      await pipeline.save();

      res.status(200).json({ message: "Round deleted successfully" });
    } catch (err) {
      console.error("Error deleting round:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Route to move selected applicants to the next round
router.post(
  "/:pipelineId/rounds/:currentRoundNumber/move-to-next",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { applicantIds } = req.body; // List of applicant IDs to move
    const { pipelineId, currentRoundNumber } = req.params;

    try {
      const pipeline = await Pipeline.findById(pipelineId);
      if (!pipeline)
        return res.status(404).json({ error: "Pipeline not found" });

      const nextRoundNumber = parseInt(currentRoundNumber, 10) + 1;

      // Ensure the next round exists
      const nextRound = pipeline.rounds.find(
        (round) => round.roundNumber === nextRoundNumber
      );
      if (!nextRound)
        return res.status(400).json({ error: "No next round found" });

      // Update each applicant's round data
      for (const applicantId of applicantIds) {
        const applicant = await FormSubmission.findById(applicantId);
        if (!applicant) continue;

        // Ensure roundsCompleted is initialized as an array
        if (!Array.isArray(applicant.roundsCompleted)) {
          applicant.roundsCompleted = [];
        }

        // Add the current round to roundsCompleted if it’s not already there
        if (
          !applicant.roundsCompleted.includes(parseInt(currentRoundNumber, 10))
        ) {
          applicant.roundsCompleted.push(parseInt(currentRoundNumber, 10));
        }

        // Sort the roundsCompleted array to keep it ordered
        applicant.roundsCompleted = [
          ...new Set(applicant.roundsCompleted),
        ].sort((a, b) => a - b);

        // Update the applicant's current round to the next round
        applicant.currentRound = nextRoundNumber;
        await applicant.save();
      }

      res
        .status(200)
        .json({ message: "Applicants moved to the next round successfully" });
    } catch (err) {
      console.error("Error moving applicants:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// HIGHLIGHT END
/*** START CHANGE FOR moving applicants back to the previous round --- ***/

router.post(
  "/:pipelineId/rounds/:currentRoundNumber/move-to-previous",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { applicantIds } = req.body; // List of applicant IDs to move
    const { pipelineId, currentRoundNumber } = req.params;

    try {
      const pipeline = await Pipeline.findById(pipelineId);
      if (!pipeline)
        return res.status(404).json({ error: "Pipeline not found" });

      const previousRoundNumber = parseInt(currentRoundNumber, 10) - 1;

      // Ensure the previous round exists
      const previousRound = pipeline.rounds.find(
        (round) => round.roundNumber === previousRoundNumber
      );
      if (!previousRound)
        return res.status(400).json({ error: "No previous round found" });

      // Update each applicant's round data
      for (const applicantId of applicantIds) {
        const applicant = await FormSubmission.findById(applicantId);
        if (!applicant) continue;

        // Rebuild roundsCompleted based on the currentRound
        applicant.roundsCompleted = Array.from(
          { length: previousRoundNumber - 1 }, // Include all rounds before the previous round
          (_, i) => i + 1
        );

        // Update current round to the previous round
        applicant.currentRound = previousRoundNumber;
        await applicant.save();
      }

      res
        .status(200)
        .json({
          message: "Applicants moved back to the previous round successfully",
        });
    } catch (err) {
      console.error("Error moving applicants back:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

/*** END CHANGE FOR moving applicants back to the previous round --- ***/

//for roundNumber user submit form
router.post("/round-number", async (req, res) => {
  try {
    const { formId, pipelineId } = req.body;

    if (!formId || !pipelineId) {
      return res
        .status(400)
        .json({ error: "formId and pipelineId are required" });
    }

    const pipeline = await Pipeline.findOne({
      _id: pipelineId,
      "rounds.formId": formId,
    });

    if (!pipeline) {
      return res.status(404).json({ error: "Pipeline or round not found" });
    }

    const round = pipeline.rounds.find((r) => r.formId === formId);
    if (!round) {
      return res
        .status(404)
        .json({ error: "Round not found for the given formId" });
    }

    res.json({ roundNumber: round.roundNumber });
  } catch (error) {
    console.error("Error fetching round number:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
