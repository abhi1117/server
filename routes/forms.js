const express = require("express");
const multer = require("multer");
const fs = require("fs");
const {
  Form,
  GeneralFormStructure,
  ShareableLink,
  FormSubmission,
} = require("../models/Form");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const ExcelJS = require("exceljs"); // Added for Excel generation
const nodemailer = require("nodemailer");
const Pipeline = require("../models/Pipelines"); // Adjust the path if necessary
const Cohort = require("../models/Cohorts"); ///for grandtotal response (all responses under cohorts under pipeline under form)
// AWS S3 setup
const AWS = require("aws-sdk"); // Added for AWS S3
const multerS3 = require("multer-s3"); // Added for AWS S3 Multer Integration
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const passport = require("passport");
const ProgramManager = require("../models/ProgramManager");

// Ensure the uploads directory exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ===================== START: AWS S3 Storage Setup =====================
// Initialize AWS S3 SDK
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const storage = multerS3({
  s3: s3,
  bucket: process.env.S3_BUCKET_NAME,
  acl: "public-read",
  key: function (req, file, cb) {
    let formData;
    try {
      // Check if formValues is sent in the draft or responses in the final submission
      formData = req.body.formValues
        ? JSON.parse(req.body.formValues)
        : req.body.responses
        ? JSON.parse(req.body.responses)
        : {};
    } catch (error) {
      console.error("Error parsing form data:", error);
      return cb(new Error("Invalid JSON in form data."), null);
    }

    const email = formData["Email"]
      ? formData["Email"].replace(/[^a-zA-Z0-9]/g, "_")
      : "unknown_email";

    // Prepend folder name (startup-documents) to file path
    const folderName = "startup-documents";
    const uniqueFileName = `${Date.now()}-${email}-${file.originalname}`;

    const filePath = `${folderName}/${uniqueFileName}`;
    cb(null, filePath);
  },
});

// Initialize Multer with custom storage engine
const upload = multer({
  storage: storage, // Using the defined storage engine for S3
});
// ===================== END: AWS S3 Storage Setup =====================

// Middleware to handle JSON data
router.use(express.json());

/*
// Create a new form
router.post("/", async (req, res) => {
  try {
    const form = new Form(req.body);
    await form.save();
    res.status(201).send(form);
  } catch (error) {
    res.status(400).send(error);
  }
});
*/

//CREATE NEW FORM.
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      // Get Program Manager's ID from authenticated user (req.user._id)
      const programManagerId = req.user._id;
      console.log("*****:", programManagerId);
      // Create new form and include Program Manager's ID
      const form = new Form({
        ...req.body, // Spread the form data from req.body
        programManager: programManagerId, // Add the program manager ID
      });

      // Save the form in the database
      await form.save();

      // After form is created, add the form ID to the Program Manager's `forms` array
      await ProgramManager.findByIdAndUpdate(programManagerId, {
        $push: { forms: form._id }, // Add the form ID to the forms array
      });

      // Return the newly created form as response
      res.status(201).send(form);
    } catch (error) {
      console.error("Error creating form:", error.message);
      res.status(400).send(error);
    }
  }
);

/*
// Get all forms
router.get("/" ,async (req, res) => {
  try {
    const forms = await Form.find();
    res.send(forms);
  } catch (error) {
    res.status(500).send(error);
  }
});
*/

// GET ALL FORMS THAT BELONGS TO SPECIFIC PM.
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      // Get the Program Manager's ID from the authenticated user
      const programManagerId = req.user._id;
      console.log(req.user._id);
      // Find forms that belong to this Program Manager
      const forms = await Form.find({ programManager: programManagerId });

      res.send(forms);
    } catch (error) {
      console.error("Error fetching forms:", error.message);
      res.status(500).send("Server Error");
    }
  }
);

// Update a form
router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updatedForm = await Form.findByIdAndUpdate(
        id,
        { ...req.body, lastModified: new Date().toLocaleDateString() },
        { new: true }
      );
      if (!updatedForm) {
        return res.status(404).send({ message: "Form not found" });
      }
      res.send(updatedForm);
    } catch (error) {
      res.status(400).send(error);
    }
  }
);

// Delete a form
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { id } = req.params;
      //  console.log("user:",req.user)
      const deletedForm = await Form.findByIdAndDelete(id);
      if (!deletedForm) {
        return res.status(404).send({ message: "Form not found" });
      }
      // Remove the form ID from the Program Manager's `forms` array
      await ProgramManager.findByIdAndUpdate(deletedForm.programManager, {
        $pull: { forms: deletedForm._id }, // Remove form ID from the `forms` array
      });
      res.send({ message: "Form deleted successfully" });
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

// General Form Structure Routes

// Save general form structure
router.post("/general", async (req, res) => {
  const { title, fields } = req.body;
  try {
    const newFormStructure = new GeneralFormStructure({
      id: uuidv4(),
      title,
      fields,
    });
    await newFormStructure.save();
    res.status(201).send(newFormStructure);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Retrieve general form structure by id
router.get("/general/:id", async (req, res) => {
  try {
    const formStructure = await GeneralFormStructure.findById(req.params.id);
    if (formStructure) {
      res.status(200).json(formStructure);
    } else {
      res.status(404).json({ error: "Form not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Retrieve all general form structures
router.get("/general", async (req, res) => {
  try {
    const formStructures = await GeneralFormStructure.find();
    res.status(200).send(formStructures);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Update general form structure
router.put(
  "/general/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { title, fields } = req.body;
      //  console.log('form id:',req.params.id);
      const formStructure = await GeneralFormStructure.findByIdAndUpdate(
        req.params.id,
        { title, fields, lastModified: Date.now() },
        { new: true, upsert: true }
      );
      res.status(200).json(formStructure);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// Generate Shareable Link
router.post("/generate-link/:formId", async (req, res) => {
  try {
    const { formId } = req.params;
    const link = `${req.protocol}://${req.get(
      "host"
    )}/shared-form-preview/${uuidv4()}`;
    const newLink = new ShareableLink({ formId, link });
    await newLink.save();
    res.status(201).send(newLink);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Retrieve Form via Shareable Link
router.get("/shared-form/:link", async (req, res) => {
  try {
    const { link } = req.params;
    const shareableLink = await ShareableLink.findOne({ link });
    if (!shareableLink) {
      return res.status(404).send({ message: "Link not found" });
    }
    const formStructure = await GeneralFormStructure.findById(
      shareableLink.formId
    );
    if (!formStructure) {
      return res.status(404).send({ message: "Form not found" });
    }
    res.status(200).send(formStructure);
  } catch (error) {
    res.status(500).send(error);
  }
});

// // Form Submission Route

router.post("/public-form-submission", upload.any(), async (req, res) => {
  try {
    console.log("Request received for form submission."); // Debug log
    console.log("Request body:", req.body);
    console.log("Files uploaded to S3:", req.files); // Adjusted for S3
    console.log("Body:", req.body);

    // const { formId, responses, pipelineId } = req.body;
    /*** START CHANGE: Extract and parse roundNumber safely ***/
    // Ensure roundNumber is passed correctly in the request body
    const { formId, responses, pipelineId, roundNumber } = req.body;
    const parsedRoundNumber = roundNumber ? parseInt(roundNumber, 10) : null; // Parse roundNumber safely
    console.log("Parsed roundNumber:", parsedRoundNumber);
    /*** END CHANGE: Extract and parse roundNumber safely ***/
    // Check if pipelineId and formId are provided
    // Validate input
    if (!pipelineId || !formId || !parsedRoundNumber) {
      console.log("Missing required fields:", {
        formId,
        pipelineId,
        roundNumber: parsedRoundNumber,
      });
      return res
        .status(400)
        .send({ error: "Form ID, Pipeline ID, and Round Number are required" });
    }

    // const formData = JSON.parse(responses);
    // let formData = JSON.parse(responses); // Changed const to let , comment for else if
    let formData;

    // Check if responses exist before attempting to parse
    if (!responses) {
      console.log("Responses missing in the request body.");

      return res.status(400).json({ error: "Missing form responses." });
    }

    try {
      formData = JSON.parse(responses); // Attempt to parse the form responses
      console.log("Parsed formData:", formData);
    } catch (err) {
      console.error("Error parsing form responses:", err);
      return res.status(400).json({ error: "Invalid JSON in form responses." });
    }

    /*** START CHANGE submit form --- ***/
    // Sanitize form data keys by removing or replacing invalid characters
    formData = Object.entries(formData).reduce((acc, [key, value]) => {
      const sanitizedKey = key.replace(/[^\w\s]/gi, "_"); // Replace invalid characters with underscores
      acc[sanitizedKey] = value;
      return acc;
    }, {});
    /*** END CHANGE FOR submit form --- ***/

    // *** START CHANGE FOR i want to show "Form Title:" which is came from 'pipeline.js' file after press 'Submit' button- ***
    // Fetch applicationTitle from the pipeline.js
    // const pipeline = await Pipeline.findById(pipelineId);
    // Fetch the pipeline
    const pipeline = await Pipeline.findById(pipelineId);
    console.log("Pipeline not found with ID:", pipelineId);

    if (!pipeline) {
      return res.status(404).json({ error: "Pipeline not found" });
    }
    console.log("Pipeline fetched successfully:", pipeline);

    // Locate the round within the pipeline
    const round = pipeline.rounds.find(
      (r) => r.roundNumber === parsedRoundNumber
    );
    if (!round) {
      console.log("Round not found for roundNumber:", parsedRoundNumber);
      return res.status(404).json({ error: "Round not found" });
    }
    console.log("Round fetched successfully:", round);

    // const applicationTitle = pipeline
    //   ? pipeline.applicationTitle
    //   : "Untitled Application"; // Fetch the title from pipeline.js
    const applicationTitle =
      round.applicationFormDesign.applicationTitle || "Untitled Application";
    console.log("Application title for submission:", applicationTitle);

    const email = formData["Email"];

    // Fetch the form title using formId
    const form = await Form.findById(formId);
    if (!form) {
      console.log("Form not found with ID:", formId);
      return res.status(404).json({ error: "Form not found" });
    }
    const formTitle = form ? form.title : "Untitled Form"; // HIGHLIGHT: Get the form title
    console.log("Form title fetched successfully:", formTitle);

    // Check for existing submission
    const existingSubmission = await FormSubmission.findOne({
      formTitle: formId,
      "formData.Email": email,
      pipelineId,
      isDraft: false, // Ensure to only check final submissions
    });

    if (existingSubmission) {
      return res
        .status(400)
        .send({ error: "Form is already submitted for this email." });
    }

    // Check for an existing draft
    const existingDraft = await FormSubmission.findOne({
      formTitle: formId,
      "formData.Email": email,
      pipelineId,
      isDraft: true, // Only look for drafts
    });

    if (existingDraft) {
      // If a draft exists, update it as a final submission
      existingDraft.isDraft = false; // Mark it as a final submission
      existingDraft.formData = formData;
      existingDraft.formSubmissionTime = Date.now(); // Set the submission time
      existingDraft.lastModified = Date.now(); // ** Update lastModified **

      // Re-save the files
      const newFiles = req.files.map((file) => {
        const labelName =
          req.body[`label_${file.originalname}`] || "unknown_label";
        const uploadedAt = new Date();
        return {
          originalName: file.originalname,
          path: file.location,
          mimeType: file.mimetype,
          labelName: labelName,
          uploadedAt: uploadedAt,
        };
      });

      existingDraft.files = [...existingDraft.files, ...newFiles];

      /*** START CHANGE to show form status ***/
      existingDraft.formStatus = "Submitted"; // Update form status to Submitted
      /*** END CHANGE to show form status--- ***/
      await existingDraft.save();
      // Update the pipeline round response
      round.response = {
        formTitle,
        pipelineId,
        formData,
        // currentRound: Number(roundNumber),
        currentRound: parsedRoundNumber,
        roundsCompleted: pipeline.rounds
          .filter((r) => r.roundNumber < Number(parsedRoundNumber))
          .map((r) => r.roundNumber),
        isDraft: false,
        formStatus: "Submitted",
        formSubmissionTime: existingDraft.formSubmissionTime,
      };
      /*** START CHANGE FOR send email to both user and program manager when use fill form and press 'Submit' button button on each and every time- ***/
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      // const formEntriesForPM = Object.entries(formData)
      //   .map(
      //     ([key, value]) => `
      //     <tr>
      //       <td style="padding: 8px 0; font-size: 14px; color: #555;">
      //         <strong>${key}:</strong> ${value}
      //       </td>
      //     </tr>
      //   `
      //   )
      //   .join("");

      const emailTemplateForPM = (title, applicationTitle, userName, email) => `
              <div style="background-color: #f4f4f7; padding: 0; width: 100%; margin: 0; box-sizing: border-box;">
                <table style="width: 100%; max-width: 100%; margin: 0 auto; font-family: 'Roboto', sans-serif; border-radius: 0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); overflow: hidden;">
                  <thead style="background-color: #0056b3; color: #fff;">
                    <tr>
                      <th style="padding: 25px; font-size: 24px; text-align: center; font-weight: 600;">${title}</th>
                    </tr>
                  </thead>
                  <tbody style="padding: 25px;">
                    <tr>
                      <td style="padding: 5px 5px 5px 30px; font-size: 16px; color: #333; line-height: 1.6;">
                        <strong>Application Title:</strong> ${applicationTitle}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 5px 5px 5px 30px; font-size: 16px; color: #333;">
                        <strong>User Name:</strong> ${userName || "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 5px 5px 5px 30px; font-size: 16px; color: #333;">
                        <strong>User Email:</strong> 
                        <a href="mailto:${email}" style="color: #007bff; text-decoration: none;">
                          ${email}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 30px; line-height: 1.6;">
                        <p style="font-size: 16px;">The application form titled "<strong>${applicationTitle}</strong>" has been successfully completed and submitted by <strong>${
        userName || "a user"
      }</strong>.</p>
                        <p style="font-size: 16px;">The submission has been received, and you can now review the details.</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 50px; text-align: center;">
                        <a href="https://incubator.drishticps.org" style="background-color: #28a745; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: 600;">
                          Review Submission
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 30px; font-size: 16px; color: #333;">
                        <p style="font-weight: 500; margin-top: 20px;">Best regards,<br>IITI DRISHTI CPS Foundation</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            `;

      const mailOptionsPM = {
        from: process.env.EMAIL,
        to: process.env.PROGRAM_MANAGER_EMAIL,
        subject: `New Form Submission: ${applicationTitle || formTitle}`,
        html: emailTemplateForPM(
          "You have a new form submission",
          applicationTitle,
          formData["Name"],
          formData["Email"]
        ),
      };

      await transporter.sendMail(mailOptionsPM);
      console.log("Email sent to program manager");

      // *** START CHANGE FOR shows only email and name in user Email- ***
      const userEmailTemplate = (
        title,
        applicationTitle,
        includeSocialIcons = false
      ) => `
            <div style="background-color: #f4f4f7; padding: 0; width: 100%; margin: 0; box-sizing: border-box;">
              <table style="width: 100%; max-width: 100%; margin: 0 auto; font-family: 'Roboto', sans-serif; border-radius: 0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); overflow: hidden;">
                <thead style="background-color: #0056b3; color: #fff;">
                  <tr>
                    <th style="padding: 25px; font-size: 24px; text-align: center; font-weight: 600;">${title}</th>
                  </tr>
                </thead>
                <tbody style="padding: 25px;">
                  <tr>
                    <td style="padding: 5px 5px 5px 30px; font-size: 16px; color: #333; line-height: 1.6;">
                      <strong>Form Title:</strong> ${
                        applicationTitle || formTitle
                      }
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 5px 5px 30px; font-size: 16px; color: #333;">
                     
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 5px 5px 30px; font-size: 16px; color: #333;">
                      <p style="font-size: 18px; font-weight: 500;">Dear ${
                        formData["Name"] || "User"
                      },</p>
                      <p>Thank you for submitting your application! We’re excited to inform you that your submission has been received successfully. Our team of expert evaluators will now review it carefully for the next round.</p>
                      <p>You will receive further updates on the progress of your application via email. We truly appreciate the time and effort you’ve put into this, and we’re looking forward to the next rounds!</p>
                      <p style="font-weight: 500; margin-top: 20px;">Regards,<br>IITI DRISHTI CPS Foundation</p>
                    </td>
                  </tr>
                </tbody>
              </table>
              ${
                includeSocialIcons
                  ? `<div style="text-align: center; margin-top: 30px;">
                    <p style="font-size: 14px; color: #555; margin-bottom: 10px;">Follow us for more insights</p>
                    <div style="display: inline-block;">
                      <a href="https://www.linkedin.com/company/iiti-drishti-cps-foundation-iit-indore/" style="margin: 0 10px; text-decoration: none;">
                        <img src="https://cdn-icons-png.flaticon.com/512/733/733561.png" alt="LinkedIn" style="width: 24px; vertical-align: middle;">
                      </a>
                      <a href="https://twitter.com/intent/follow?screen_name=DRISHTICPS&ref_src=twsrc%5Etfw%7Ctwcamp%5Eembeddedtimeline%7Ctwterm%5Escreen-name%3ADRISHTICPS%7Ctwcon%5Es2" style="margin: 0 10px; text-decoration: none;">
                        <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" style="width: 24px; vertical-align: middle;">
                      </a>
                        <a href="https://www.facebook.com/DrishtiCPS/" style="margin: 0 10px; text-decoration: none;">
                         <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" style="width: 24px; vertical-align: middle;">
                        </a>
                    </div>
                  </div>`
                  : ""
              }
              <div style="padding-bottom: 50px;"></div>
            </div>
          `;

      const mailOptionsUser = {
        from: process.env.EMAIL,
        to: email,
        subject: `Thank you for your submission: ${applicationTitle}`,
        html: userEmailTemplate(
          "Thank you for your submission!",
          applicationTitle,
          true
        ),
      };

      await transporter.sendMail(mailOptionsUser);
      console.log("Email sent to the user");
      /*** END CHANGE FOR send email to both user and program manager when use fill form and press 'Submit' button button on each and every time--- ***/

      return res.status(200).send(existingDraft);
    }
    await pipeline.save();

    // Handle files
    /*** START  CHANGE FOR save label name with file  ***/
    const files = req.files
      ? req.files.map((file) => {
          const labelName =
            req.body[`label_${file.originalname}`] || "unknown_label"; // Get label name from the request
          const uploadedAt = new Date(); // Store current upload date and time
          return {
            originalName: file.originalname,
            path: file.location, // Adjusted to use S3 file location
            mimeType: file.mimetype,
            labelName: labelName, // Save the label name associated with the file
            uploadedAt: uploadedAt, // Save upload date and time
          };
        })
      : [];
    /*** END  CHANGE FOR save label name with file  --- ***/

    const formSubmission = new FormSubmission({
      formTitle: formId, // Still storing the formId for reference
      formData,
      files,
      pipelineId,
      isDraft: false, // HIGHLIGHT: Mark as not draft
      formSubmissionTime: Date.now(), // HIGHLIGHT: Set the form submission time
      lastModified: Date.now(), // ** Set lastModified on new submission **
      /*** START CHANGE to show form status ***/
      formStatus: "Submitted", // Set formStatus to Submitted
    });

    await formSubmission.save();
    // Update the pipeline round response
    round.response = {
      formTitle,
      pipelineId,
      formData,
      // currentRound: Number(roundNumber),
      currentRound: Number(parsedRoundNumber),
      roundsCompleted: pipeline.rounds
        .filter((r) => r.roundNumber < Number(parsedRoundNumber))
        .map((r) => r.roundNumber),
      isDraft: false,
      formStatus: "Submitted",
      formSubmissionTime: formSubmission.formSubmissionTime,
    };
    // HIGHLIGHT START: Send email to program manager after form submission
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // *** Email template for Program Manager showing all form data ***
    // const formEntriesForPM = Object.entries(formData)
    //   .map(
    //     ([key, value]) => `
    //       <tr>
    //         <td style="padding: 8px 0; font-size: 14px; color: #555;">
    //           <strong>${key}:</strong> ${value}
    //         </td>
    //       </tr>
    //     `
    //   )
    //   .join("");
    const emailTemplateForPM = (title, applicationTitle, userName, email) => `
  <div style="background-color: #f4f4f7; padding: 0; width: 100%; margin: 0; box-sizing: border-box;">
    <table style="width: 100%; max-width: 100%; margin: 0 auto; font-family: 'Roboto', sans-serif; border-radius: 0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); overflow: hidden;">
      <thead style="background-color: #0056b3; color: #fff;">
        <tr>
          <th style="padding: 25px; font-size: 24px; text-align: center; font-weight: 600;">${title}</th>
        </tr>
      </thead>
      <tbody style="padding: 25px;">
        <tr>
          <td style="padding: 5px 5px 5px 30px; font-size: 16px; color: #333; line-height: 1.6;">
            <strong>Application Title:</strong> ${applicationTitle}
          </td>
        </tr>
        <tr>
          <td style="padding: 5px 5px 5px 30px; font-size: 16px; color: #333;">
            <strong>User Name:</strong> ${userName || "N/A"}
          </td>
        </tr>
        <tr>
          <td style="padding: 5px 5px 5px 30px; font-size: 16px; color: #333;">
            <strong>User Email:</strong> 
            <a href="mailto:${email}" style="color: #007bff; text-decoration: none;">
              ${email}
            </a>
          </td>
        </tr>

                <tr>
          <td style="padding: 20px 30px; line-height: 1.6;">
            <p style="font-size: 16px;">The application form titled "<strong>${applicationTitle}</strong>" has been successfully completed and submitted by <strong>${
      userName || "a user"
    }</strong>.</p>
            <p style="font-size: 16px;">The submission has been received, and you can now review the details. Below is a summary of the information submitted:</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px 50px; text-align: center;">
            <a href="https://incubator.drishticps.org" style="background-color: #28a745; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: 600;">
              Review Submission
            </a>
          </td>
        </tr>

        <tr>
          <td style="padding: 8px 30px; font-size: 16px; color: #333;">
            <p style="font-weight: 500; margin-top: 20px;">Best regards,<br>IITI DRISHTI CPS Foundation</p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
`;

    const mailOptionsPM = {
      from: process.env.EMAIL,
      to: process.env.PROGRAM_MANAGER_EMAIL,
      subject: `New Form Submission: ${applicationTitle || formTitle}`,
      // html: emailTemplateForPM("You have a new form submission", applicationTitle, false),
      html: emailTemplateForPM(
        "You have a new form submission",
        applicationTitle,
        formData["Name"],
        formData["Email"]
      ),
    };

    await transporter.sendMail(mailOptionsPM);
    console.log("Email sent to program manager");

    // *** START CHANGE FOR shows only email and name in user Email- ***
    const userEmailTemplate = (
      title,
      applicationTitle,
      includeSocialIcons = false
    ) => `
      <div style="background-color: #f4f4f7; padding: 0; width: 100%; margin: 0; box-sizing: border-box;">
        <table style="width: 100%; max-width: 100%; margin: 0 auto; font-family: 'Roboto', sans-serif; border-radius: 0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); overflow: hidden;">
          <thead style="background-color: #0056b3; color: #fff;">
            <tr>
              <th style="padding: 25px; font-size: 24px; text-align: center; font-weight: 600;">${title}</th>
            </tr>
          </thead>
          <tbody style="padding: 25px;">
            <tr>
              <td style="padding: 5px 5px 5px 30px; font-size: 16px; color: #333; line-height: 1.6;">
                <strong>Form Title:</strong> ${applicationTitle || formTitle}
              </td>
            </tr>
        <tr>
          <td style="padding: 5px 5px 5px 30px; font-size: 16px; color: #333;">
            <strong>Email:</strong> 
            <a href="mailto:${formData["Email"]}" 
               style="color: #007bff; text-decoration: none;"
               onmouseover="this.style.color='#000';"
               onmouseout="this.style.color='#007bff';">
               ${formData["Email"]}
            </a>
          </td>
        </tr>
            <tr>
              <td style="padding: 8px 5px 5px 30px; font-size: 16px; color: #333;">
                <p style="font-size: 18px; font-weight: 500;">Dear ${
                  formData["Name"] || "User"
                },</p>
           <p>Thank you for submitting your application! We’re excited to inform you that your submission has been received successfully. Our team of expert evaluators will now review it carefully for the next round.</p>
            <p>You will receive further updates on the progress of your application via email. We truly appreciate the time and effort you’ve put into this, and we’re looking forward to the next rounds!</p>
                <p style="font-weight: 500; margin-top: 20px;">Regards,<br>IITI DRISHTI CPS Foundation</p>
              </td>
            </tr>
          </tbody>
        </table>
        ${
          includeSocialIcons
            ? `<div style="text-align: center; margin-top: 30px;">
              <p style="font-size: 14px; color: #555; margin-bottom: 10px;">Follow us for more insights</p>
              <div style="display: inline-block;">
                <a href="https://www.linkedin.com/company/iiti-drishti-cps-foundation-iit-indore/" style="margin: 0 10px; text-decoration: none;">
                  <img src="https://cdn-icons-png.flaticon.com/512/733/733561.png" alt="LinkedIn" style="width: 24px; vertical-align: middle;">
                </a>
                <a href="https://twitter.com/intent/follow?screen_name=DRISHTICPS&ref_src=twsrc%5Etfw%7Ctwcamp%5Eembeddedtimeline%7Ctwterm%5Escreen-name%3ADRISHTICPS%7Ctwcon%5Es2" style="margin: 0 10px; text-decoration: none;">
                  <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" style="width: 24px; vertical-align: middle;">
                </a>
                <a href="https://www.facebook.com/DrishtiCPS/" style="margin: 0 10px; text-decoration: none;">
                  <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" style="width: 24px; vertical-align: middle;">
                </a>               
              </div>
            </div>`
            : ""
        }
              <div style="padding-bottom: 50px;"></div>
      </div>
    `;
    // Email to User - WITH social media icons but only shows Email and Name
    const mailOptionsUser = {
      from: process.env.EMAIL,
      to: email,
      subject: `Thank you for your submission: ${applicationTitle}`,
      html: userEmailTemplate(
        "Thank you for your submission!",
        applicationTitle,
        true
      ),
    };

    await transporter.sendMail(mailOptionsUser);
    console.log("Email sent to the user");
    // *** END CHANGE FOR shows only email and name in user Email--- ***
    await pipeline.save();

    res.status(201).send(formSubmission);
  } catch (error) {
    // console.error("Error submitting form:", error);
    // res.status(400).send(error);
    console.error("Error submitting form:", error);

    // Return JSON error response if something goes wrong
    res.status(500).json({ error: "Server error while submitting the form" });
  }
});

router.get("/form-submissions/:id/view-summary", async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await FormSubmission.findById(id);

    if (!submission) {
      return res.status(404).send({ message: "Submission not found" });
    }

    // Render a page displaying form submission details
    const formData = submission.formData;
    const formTitle = submission.formTitle;
    const email = formData["Email"];

    // Construct the HTML response to show submission details
    let submissionDetails = `
      <h2>Form Title: ${formTitle}</h2>
      <p>Email: ${email}</p>
      <ul>
    `;

    Object.entries(formData).forEach(([key, value]) => {
      submissionDetails += `<li><strong>${key}</strong>: ${value}</li>`;
    });

    submissionDetails += `</ul>`;

    // Send HTML response showing submission details
    res.send(`
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { color: #4285f4; }
            ul { list-style: none; padding: 0; }
            li { padding: 10px 0; font-size: 16px; }
            li strong { color: #555; }
          </style>
        </head>
        <body>
          ${submissionDetails}
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Error fetching submission:", error);
    res.status(500).send(error);
  }
});
// HIGHLIGHT END

// Get all form submissions
router.get("/form-submissions", async (req, res) => {
  try {
    const submissions = await FormSubmission.find();
    res.send(submissions);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get all form submissions for a specific form title
router.get("/form-submissions/:formTitle", async (req, res) => {
  try {
    const { formTitle } = req.params;
    const submissions = await FormSubmission.find({ formTitle });

    if (!submissions.length) {
      return res
        .status(404)
        .json({ message: "No submissions found for this form." });
    }

    res.send(submissions);
  } catch (error) {
    console.error("Error fetching form submissions:", error);
    res.status(500).send(error);
  }
});

// Delete all form submissions for a specific form title
router.delete("/form-submissions/:formTitle", async (req, res) => {
  try {
    const { formTitle } = req.params;
    const result = await FormSubmission.deleteMany({ formTitle });
    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "No submissions found for this form." });
    }
    res.send({ message: "All form submissions deleted successfully" });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Delete a specific form submission by ID
router.delete("/form-submission/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await FormSubmission.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ message: "Form submission not found" });
    }
    res.send({ message: "Form submission deleted successfully" });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Excel download route
router.get("/form-submissions/:formId/download-excel", async (req, res) => {
  try {
    const { formId } = req.params;
    const submissions = await FormSubmission.find({ formTitle: formId });

    if (!submissions.length) {
      return res
        .status(404)
        .json({ message: "No submissions found for this form." });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Form Submissions");

    // Define the columns in the Excel sheet
    const columns = [
      { header: "Timestamp", key: "createdAt", width: 25 },
      { header: "Email", key: "email", width: 25 },
    ];

    // Dynamically add form data keys as columns
    let formDataKeys = new Set();
    submissions.forEach((submission) => {
      Object.keys(submission.formData).forEach((key) => {
        formDataKeys.add(key);
      });
    });

    formDataKeys.forEach((key) => {
      columns.push({ header: key, key });
    });

    worksheet.columns = columns;

    // Add rows to the Excel sheet
    submissions.forEach((submission) => {
      const rowData = {
        createdAt: new Date(submission.createdAt).toLocaleString(),
      };

      // Add form data to row in a readable format
      Object.keys(submission.formData).forEach((key) => {
        rowData[key] = submission.formData[key];
      });

      // Add file data to row
      submission.files.forEach((file, index) => {
        rowData[`File ${index + 1}`] = file.originalName;
      });

      worksheet.addRow(rowData);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=form_submissions.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generating Excel file:", error);
    res.status(500).send(error);
  }
});
///////get all forms for pipeline
router.get("/:id", async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }
    res.json(form);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// /*** START CHANGE FOR all responses --- ***/

router.get(
  "/pipeline/:pipelineId/form/:formId/responses/count",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { pipelineId, formId } = req.params;

      // Log the pipelineId and formId for debugging
      // console.log(`Received request to count submissions for formId: ${formId} and pipelineId: ${pipelineId}`);

      // Find form submissions that belong to this pipeline and form
      const count = await FormSubmission.countDocuments({
        formTitle: formId, // FormId (which acts as form title in the FormSubmission collection)
        pipelineId: pipelineId, // Ensure to store pipelineId in form submissions
      });

      // Log the result of the query
      // console.log(`Querying submissions with formId: ${formId} and pipelineId: ${pipelineId}, found count: ${count}`);

      // Send the response
      res.status(200).json({ count });
    } catch (err) {
      console.error("Error fetching submission count:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

router.get(
  "/pipeline/:pipelineId/form/:formId/responses",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { pipelineId, formId } = req.params;
      const { round } = req.query; // Get the round number from the query parameter

      // Log the pipelineId and formId for debugging
      // console.log(`Received request to get responses for formId: ${formId} and pipelineId: ${pipelineId}`);

      // Find form submissions that belong to this pipeline and form
      const submissions = await FormSubmission.find({
        formTitle: formId, // FormId (which acts as form title in the FormSubmission collection)
        pipelineId: pipelineId, // Ensure to filter by pipelineId
        currentRound: parseInt(round, 10), // Filter by the current round
      });

      // Log the number of found submissions
      // console.log(`Found ${submissions.length} submissions for formId: ${formId} and pipelineId: ${pipelineId}`);

      // Check if there are no submissions
      if (submissions.length === 0) {
        return res.status(404).json({
          message:
            "No submissions found for this form in the specified pipeline.",
        });
      }

      // Send the list of submissions as the response
      res.status(200).json(submissions);
    } catch (err) {
      console.error("Error fetching form responses:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// ** START CHANGE for 'Grand Total count' for all responses under cohorts under pipeline under form --- **
/*** START CHANGE FOR fetch all responses for Round 1 including completed rounds for Applications.jsx ***/
router.get(
  "/pipeline/:pipelineId/form/:formId/responses/all",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { pipelineId, formId } = req.params;

    try {
      const submissions = await FormSubmission.find({
        formTitle: formId,
        pipelineId: pipelineId,
      });

      res.status(200).json(submissions);
    } catch (err) {
      console.error("Error fetching all responses:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);
/*** END CHANGE FOR fetch all responses for Round 1 including completed rounds ***/
/*** START CHANGE FOR fetch responses based on current round ***/
router.get(
  "/pipeline/:pipelineId/form/:formId/responses/current",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { pipelineId, formId } = req.params;
    const { round } = req.query;

    try {
      const submissions = await FormSubmission.find({
        formTitle: formId,
        pipelineId: pipelineId,
        currentRound: parseInt(round, 10),
      });

      res.status(200).json(submissions);
    } catch (err) {
      console.error("Error fetching current round responses:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

/*** END CHANGE FOR fetch responses based on current round ***/
// ** API to get the Grand Total of all form responses (applications) under all pipelines in a specific cohort **
/*** START CHANGE FOR FETCHING ROUND-SPECIFIC RESPONSES ***/
router.get(
  "/pipeline/:pipelineId/user/:userId/responses",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { pipelineId, userId } = req.params;

      // Fetch all responses for the given pipeline and user
      const responses = await FormSubmission.find({
        pipelineId,
        "formData.Email": userId,
      });

      console.log("Fetched Responses:", responses); // Debugging: Check if responses exist

      // If no responses, return an error message
      if (!responses.length) {
        console.warn("No responses found for the user.");
        return res
          .status(404)
          .json({ message: "No responses found for this user." });
      }

      // Fetch the pipeline details to get the attached forms for each round
      const pipeline = await Pipeline.findById(pipelineId);

      console.log("Pipeline Details:", pipeline); // Debugging: Log pipeline details

      if (!pipeline) {
        return res.status(404).json({ message: "Pipeline not found." });
      }

      const allResponses = [];
      responses.forEach((response) => {
        // Match the round based on formId and formTitle
        const roundData = pipeline.rounds.find(
          (round) =>
            round.application.formId &&
            round.application.formId.toString() === response.formTitle // Match ObjectId as string
        );

        if (roundData) {
          allResponses.push({
            ...response.toObject(),
            formData: Object.fromEntries(response.formData || []), // Convert Map to Object
            roundNumber: roundData.roundNumber, // Add roundNumber for easier mapping
            roundDetails: roundData, // Include round details
          });
        }
      });

      // Debugging: Log valid responses
      console.log("All Responses with Rounds:", allResponses);

      // Send only the valid responses to the frontend
      res.status(200).json(allResponses);
    } catch (error) {
      console.error("Error fetching user responses:", error);
      res
        .status(500)
        .json({ error: "Server error while fetching user responses." });
    }
  }
);

/*** END CHANGE FOR FILTERING USER RESPONSES BY ROUND ***/

/*** END CHANGE FOR FETCHING ROUND-SPECIFIC RESPONSES ***/

router.get(
  "/:id/pipelines/grandtotalresponses",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      // Find the cohort by the ID provided in the request params
      const cohort = await Cohort.findById(req.params.id);
      if (!cohort) {
        return res.status(404).json({ msg: "Cohort not found" });
      }

      // Find all pipelines under the specific cohort
      const pipelines = await Pipeline.find({ cohort: cohort.name });

      let grandTotalResponses = 0;

      // Loop through each pipeline and get the count of responses for all forms
      for (const pipeline of pipelines) {
        const formIds = await FormSubmission.find({
          pipelineId: pipeline._id,
        }).distinct("formTitle");

        for (const formId of formIds) {
          const count = await FormSubmission.countDocuments({
            formTitle: formId,
            pipelineId: pipeline._id,
          });
          grandTotalResponses += count;
        }
      }

      // Send the grand total count in the response
      res.json({ grandTotalCount: grandTotalResponses });
    } catch (err) {
      console.error("Error fetching grand total count:", err);
      res.status(500).send("Server Error");
    }
  }
);

// ** END CHANGE for 'Grand Total count' --- **

// Route to get count of submitted responses (isDraft = false)
router.get(
  "/pipeline/:pipelineId/form/:formId/responses/submit/count",
  async (req, res) => {
    try {
      const { pipelineId, formId } = req.params;

      // Query for submitted responses (isDraft: false)
      const submitCount = await FormSubmission.countDocuments({
        formTitle: formId,
        pipelineId: pipelineId,
        isDraft: false, // Only submitted forms
      });

      res.status(200).json({ count: submitCount });
    } catch (err) {
      console.error("Error fetching submit count:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Route to get count of draft responses (isDraft = true)
router.get(
  "/pipeline/:pipelineId/form/:formId/responses/draft/count",
  async (req, res) => {
    try {
      const { pipelineId, formId } = req.params;

      // Query for draft responses (isDraft: true)
      const draftCount = await FormSubmission.countDocuments({
        formTitle: formId,
        pipelineId: pipelineId,
        isDraft: true, // Only draft forms
      });

      res.status(200).json({ count: draftCount });
    } catch (err) {
      console.error("Error fetching draft count:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// // Retrieve for 'already submitted the form using same email ID.'

router.post("/check-email", async (req, res) => {
  const { formId, pipelineId, email } = req.body;

  try {
    // Check for existing submission
    const existingSubmission = await FormSubmission.findOne({
      formTitle: formId,
      "formData.Email": email,
      pipelineId,
      isDraft: false, // Ensure to check only fully submitted forms, not drafts
    });

    if (existingSubmission) {
      return res.json({ isDuplicate: true });
    } else {
      return res.json({ isDuplicate: false });
    }
  } catch (error) {
    console.error("Error checking duplicate email:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Save Draft Route

///new console
router.post("/save-draft", upload.any(), async (req, res) => {
  // const { formId, pipelineId } = req.body;
  /*** START CHANGE: Extract and parse roundNumber safely ***/
  // Ensure roundNumber is passed correctly in the request body
  const { formId, pipelineId, roundNumber } = req.body;
  const parsedRoundNumber = roundNumber ? parseInt(roundNumber, 10) : null; // Parse roundNumber safely
  console.log("Parsed roundNumber:", parsedRoundNumber);
  /*** END CHANGE: Extract and parse roundNumber safely ***/
  if (!pipelineId || !formId || !parsedRoundNumber) {
    console.log("Missing required fields:", {
      formId,
      pipelineId,
      roundNumber: parsedRoundNumber,
    });
    return res
      .status(400)
      .json({ error: "Form ID, Pipeline ID, and Round Number are required" });
  }
  const formValues = JSON.parse(req.body.formValues);
  console.log("Request received for saving draft."); // Debug log
  console.log("Request body:", req.body);
  try {
    const email = formValues.Email;
    console.log("Parsed formValues:", formValues);

    // Fetch the form title using formId
    const formStructure = await GeneralFormStructure.findById(formId);
    const formTitle = formStructure ? formStructure.title : "Untitled Form"; // Get the form title or use 'Untitled Form'

    console.log("Form ID: ", formId); // Debug statement
    console.log("Form Title: ", formTitle); // Debug statement
    const pipeline = await Pipeline.findById(pipelineId);
    if (!pipeline) {
      console.log("Pipeline not found with ID:", pipelineId);
      return res.status(404).json({ error: "Pipeline not found" });
    }
    console.log("Pipeline fetched successfully:", pipeline);

    const round = pipeline.rounds.find(
      (r) => r.roundNumber === parsedRoundNumber
    );
    if (!round) {
      console.log("Round not found for roundNumber:", parsedRoundNumber);
      return res.status(404).json({ error: "Round not found" });
    }
    console.log("Round fetched successfully:", round);

    /*** START CHANGE FOR i want to show "Form Title:" which is came from 'pipeline.js' file- ***/
    // Fetch applicationTitle from the pipeline.js
    // const applicationTitle = pipeline
    //   ? pipeline.applicationTitle
    //   : "Untitled Application"; // Fetch the title from pipeline.js
    const applicationTitle =
      round.applicationFormDesign.applicationTitle || "Untitled Application";

    console.log("Pipeline ID: ", pipelineId); // Debug statement
    console.log("Application Title: ", applicationTitle); // Debug statement
    console.log("Application title for draft:", applicationTitle);

    /*** END CHANGE FOR i want to show "Form Title:" which is came from 'pipeline.js' file--- ***/
    // const sanitizedFormValues = Object.entries(formValues).reduce(
    //   (acc, [key, value]) => {
    //     acc[key] = value;
    //     return acc;
    //   },
    //   {}
    // );
    const sanitizedFormValues = Object.entries(formValues).reduce(
      (acc, [key, value]) => {
        const sanitizedKey = key.replace(/[^\w\s]/gi, "_"); // Replace invalid characters with underscores
        acc[sanitizedKey] = value;
        return acc;
      },
      {}
    );

    const existingDraft = await FormSubmission.findOne({
      formTitle: formId,
      "formData.Email": email,
      pipelineId,
      isDraft: true,
    });

    console.log("Existing Draft Found: ", existingDraft ? true : false); // Debug statement

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const draftEmailTemplate = (
      title,
      formTitle,
      includeSocialIcons = true
    ) => {
      // console.log("Generating draft email template...");
      // console.log("Title: ", title);
      // console.log("Form Title: ", formTitle);
      // console.log("Include Social Icons: ", includeSocialIcons);

      const socialIcons = includeSocialIcons
        ? `<div style="text-align: center; margin-top: 30px; padding-left: 30px;">
          <p style="font-size: 14px; color: #555; margin-bottom: 10px;">Follow us for more insights</p>
          <div style="display: inline-block;">
            <a href="https://www.linkedin.com/company/iiti-drishti-cps-foundation-iit-indore/" style="margin: 0 10px; text-decoration: none;">
              <img src="https://cdn-icons-png.flaticon.com/512/733/733561.png" alt="LinkedIn" style="width: 24px; vertical-align: middle;">
            </a>
            <a href="https://twitter.com/intent/follow?screen_name=DRISHTICPS&ref_src=twsrc%5Etfw%7Ctwcamp%5Eembeddedtimeline%7Ctwterm%5Escreen-name%3ADRISHTICPS%7Ctwcon%5Es2" style="margin: 0 10px; text-decoration: none;">
              <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" style="width: 24px; vertical-align: middle;">
            </a>
            <a href="https://www.facebook.com/DrishtiCPS/" style="margin: 0 10px; text-decoration: none;">
              <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" style="width: 24px; vertical-align: middle;">
            </a>           
          </div>
        </div>`
        : "";

      // console.log("Social Icons HTML: ", socialIcons);  // Log the generated social icons HTML

      return `
      <div style="background-color: #f4f4f7; padding: 0; width: 100%; margin: 0; box-sizing: border-box;">
        <table style="width: 100%; max-width: 100%; margin: 0 auto; font-family: 'Roboto', sans-serif; border-radius: 0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); overflow: hidden;">
          <thead style="background-color: #0056b3; color: #fff;">
            <tr>
              <th style="padding: 25px; font-size: 24px; text-align: center; font-weight: 600;">${title}</th>
            </tr>
          </thead>
          <tbody style="padding: 25px;">
            <tr>
              <td style="padding: 5px 30px 5px 30px; font-size: 16px; color: #333; line-height: 1.6;">
                <strong>Form Title:</strong> ${formTitle}
              </td>
            </tr>
            <tr>
            <td style="padding: 5px 30px 5px 30px; font-size: 16px; color: #333;">
             
            </td>
            </tr>
            <tr>
            <td style="padding: 8px 30px 8px 30px; font-size: 16px; color: #333;">
              <p style="font-size: 18px; font-weight: 500;">Dear ${
                formValues["Name"] || "User"
              },</p>
              <p>Your draft has been successfully saved! Please complete and submit your application before the form's submission deadline.</p>
              <p>
                To complete your application, log in using your credentials here:
                <a href="https://incubator.drishticps.org" style="color: #007bff; text-decoration: none;">Complete Your Application</a>.
              </p>
              <p>Thank you for your time. We look forward to receiving your submission!</p>
              <p style="font-weight: 500; margin-top: 20px;">Best regards,<br>IITI DRISHTI CPS Foundation</p>
            </td>
            </tr>
          </tbody>
        </table>
        ${socialIcons}
        <div style="padding-bottom: 50px;"></div>
      </div>
    `;
    };

    if (existingDraft) {
      existingDraft.formData = sanitizedFormValues;
      existingDraft.lastModified = Date.now();

      /*** START CHANGE FOR save files in mongoDb  after press "Save as Draft" button ***/
      /*** START  CHANGE FOR save label name with file  ***/
      const newFiles = req.files.map((file) => {
        // Assuming that the formData contains the labelName information for each file
        // const labelName = formValues[file.fieldname] || "unknown_label"; // Use the fieldname to get the label name
        // const labelName = formValues[`label_${file.fieldname}`] || file.originalname;
        const labelName =
          req.body[`label_${file.originalname}`] || "unknown_label"; // Get label name from the request body

        const uploadedAt = new Date(); // Store current upload date and time

        return {
          originalName: file.originalname,
          path: file.location,
          mimeType: file.mimetype,
          labelName: labelName, // Save the label name associated with the file
          uploadedAt: uploadedAt, // Save upload date and time
        };
      });
      /*** END  CHANGE FOR save label name with file  --- ***/

      existingDraft.files = [...existingDraft.files, ...newFiles];
      /*** END CHANGE FOR save files in mongoDb  after press "Save as Draft" button--- ***/

      await existingDraft.save();

      // console.log("Draft updated, sending 'Save as Draft' email to user"); // Log draft updated

      // Update the round response in the pipeline
      round.response = {
        formTitle,
        pipelineId,
        formData: sanitizedFormValues,
        currentRound: Number(parsedRoundNumber),
        roundsCompleted: pipeline.rounds
          .filter((r) => r.roundNumber < Number(parsedRoundNumber))
          .map((r) => r.roundNumber),
        isDraft: true,
        lastModified: existingDraft.lastModified,
        formStatus: "Draft",
      };

      await pipeline.save();

      const draftMailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: `Your draft has been saved: ${applicationTitle || formTitle}`, // Fallback to formTitle if applicationTitle is undefined
        html: draftEmailTemplate(
          "Draft Saved Successfully!",
          applicationTitle || formTitle,
          true
        ), // Use formTitle as fallback in email template
      };

      //       console.log("Sending email to: ", email);
      // console.log("Email content: ", draftMailOptions.html);  // Log the email content including social icons

      await transporter.sendMail(draftMailOptions);
      // console.log("Draft save email sent to the user"); // Log email sent
      console.log("Draft save email sent to the user with social icons"); // Log email sent

      /*** START CHANGE FOR text message to program manager after press 'saved as a draft' button ***/

      const emailTemplateForPM = (
        title,
        applicationTitle,
        userName,
        userEmail
      ) => `
            <div style="background-color: #f4f4f7; padding: 0; width: 100%; margin: 0; box-sizing: border-box;">
              <table style="width: 100%; max-width: 100%; margin: 0 auto; font-family: 'Roboto', sans-serif; border-radius: 0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); overflow: hidden;">
                <thead style="background-color: #0056b3; color: #fff;">
                  <tr>
                    <th style="padding: 25px; font-size: 24px; text-align: center; font-weight: 600;">${title}</th>
                  </tr>
                </thead>
                <tbody style="padding: 25px;">
                  <tr>
                    <td style="padding: 5px 5px 5px 30px; font-size: 16px; color: #333; line-height: 1.6;">
                      <strong>Application Title:</strong> ${
                        applicationTitle || "N/A"
                      }
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 5px 5px 30px; font-size: 16px; color: #333;">
                      <strong>User Name:</strong> ${userName || "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 5px 5px 30px; font-size: 16px; color: #333;">
                    
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 5px 5px 30px; font-size: 16px; color: #333;">
                      <p>${
                        userName || "A user"
                      } has saved their draft for the application titled "<strong>${
        applicationTitle || "N/A"
      }</strong>".</p>
                      <p>They have partially completed the form and may return to complete it before the deadline.</p>
                     </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 5px 5px 30px; font-size: 16px; color: #333;">
                      <p style="font-weight: 500; margin-top: 20px;">Best regards,<br>IITI DRISHTI CPS Foundation</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          `;

      const mailOptionsPM = {
        from: process.env.EMAIL,
        to: process.env.PROGRAM_MANAGER_EMAIL,
        subject: `Draft Saved: ${applicationTitle || formTitle}`,
        html: emailTemplateForPM(
          "Draft Saved for Review",
          applicationTitle,
          formValues["Name"],
          email
        ),
      };

      console.log("Sending 'Save as Draft' email to program manager...");

      await transporter.sendMail(mailOptionsPM);
      console.log("Draft saved email sent to program manager successfully!");

      /*** END CHANGE FOR text message to program manager after press 'saved as a draft' button ***/

      return res.status(200).send(existingDraft);
    }

    /*** START  CHANGE FOR save label name with file  ***/
    const newDraft = new FormSubmission({
      formTitle: formId,
      formData: sanitizedFormValues,
      files: req.files.map((file) => {
        // const labelName = formValues[file.fieldname] || 'unknown_label';
        // const labelName =
        //   req.body[`label_${file.originalname}`] || "unknown_label"; // Get label name from the request
        const labelName =
          formValues[`label_${file.fieldname}`] || file.originalname;

        const uploadedAt = new Date(); // Store current upload date and time
        return {
          originalName: file.originalname,
          path: file.location,
          mimeType: file.mimetype,
          labelName: labelName, // Save the label name associated with the file
          uploadedAt: uploadedAt, // Save upload date and time
        };
      }),
      pipelineId,
      isDraft: true,
      formFirstSavedTime: Date.now(),
      lastModified: Date.now(),
    });
    /*** END  CHANGE FOR save label name with file  --- ***/

    await newDraft.save();
    console.log("Sending email for new draft with social icons...");
    // Update the round response in the pipeline
    round.response = {
      formTitle,
      pipelineId,
      formData: sanitizedFormValues,
      currentRound: Number(roundNumber),
      roundsCompleted: pipeline.rounds
        .filter((r) => r.roundNumber < Number(roundNumber))
        .map((r) => r.roundNumber),
      isDraft: true,
      lastModified: newDraft.lastModified,
      formStatus: "Draft",
    };

    await pipeline.save();
    // Send 'draft saved' email for the new draft
    const newDraftMailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: `Your draft has been saved: ${applicationTitle || formTitle}`,
      html: draftEmailTemplate(
        "Draft Saved Successfully!",
        applicationTitle || formTitle,
        true // This ensures the social icons are included on the first-time email
      ),
    };

    await transporter.sendMail(newDraftMailOptions);
    console.log("Draft save email for new draft sent"); // Log email sent

    /*** START CHANGE FOR sending email to program manager for the first draft save ***/
    const emailTemplateForPMNew = (
      title,
      applicationTitle,
      userName,
      userEmail
    ) => `
        <div style="background-color: #f4f4f7; padding: 0; width: 100%; margin: 0; box-sizing: border-box;">
          <table style="width: 100%; max-width: 100%; margin: 0 auto; font-family: 'Roboto', sans-serif; border-radius: 0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); overflow: hidden;">
            <thead style="background-color: #0056b3; color: #fff;">
              <tr>
                <th style="padding: 25px; font-size: 24px; text-align: center; font-weight: 600;">${title}</th>
              </tr>
            </thead>
            <tbody style="padding: 25px;">
              <tr>
                <td style="padding: 5px 30px; font-size: 16px; color: #333; line-height: 1.6;">
                  <strong>Application Title:</strong> ${
                    applicationTitle || "N/A"
                  }
                </td>
              </tr>
              <tr>
                <td style="padding: 5px 30px; font-size: 16px; color: #333;">
                  <strong>User Name:</strong> ${userName || "N/A"}
                </td>
              </tr>
              <tr>
                <td style="padding: 5px 30px; font-size: 16px; color: #333;">
                  <strong>User Email:</strong> <a href="mailto:${userEmail}" style="color: #007bff;">${userEmail}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 30px; font-size: 16px; color: #333;">
                  <p>The user has saved their draft for the first time for the application titled "<strong>${
                    applicationTitle || "N/A"
                  }</strong>".</p>
                 </td>
              </tr>
              <tr>
                <td style="padding: 20px 30px; font-size: 16px; color: #333;">
                  <p>Best regards,<br>IITI DRISHTI CPS Foundation</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>`;

    const mailOptionsPMNew = {
      from: process.env.EMAIL,
      to: process.env.PROGRAM_MANAGER_EMAIL,
      subject: `Draft Saved: ${applicationTitle}`,
      html: emailTemplateForPMNew(
        "First Draft Saved for Review",
        applicationTitle,
        formValues["Name"],
        email
      ),
    };

    console.log(
      "Sending draft email to program manager for first save: ",
      process.env.PROGRAM_MANAGER_EMAIL
    );
    await transporter.sendMail(mailOptionsPMNew);
    console.log("Draft email sent to program manager for first-time draft!");

    /*** END CHANGE ***/

    res.status(201).send(newDraft);
  } catch (error) {
    console.error("Error saving draft:", error);
    res.status(500).send({ error: "Error saving draft" });
  }
});

// Fetch saved draft by email for pre-filling the form
router.post("/fetch-draft", async (req, res) => {
  const { formId, pipelineId, email } = req.body;

  try {
    // const formData=await Form.findById(formId);
    //console.log('form data:',formData)
    const draftSubmission = await FormSubmission.findOne({
      formTitle: formId,
      "formData.Email": email,
      pipelineId,
      isDraft: true,
    });

    if (draftSubmission) {
      return res.status(200).json(draftSubmission);
    } else {
      return res
        .status(404)
        .json({ message: "No draft found for this email." });
    }
  } catch (error) {
    console.error("Error fetching draft:", error);
    res.status(500).json({ error: "Server error while fetching draft" });
  }
});

////user section

router.post(
  "/fetch-draft-by-email",
  passport.authenticate("jwt-user", { session: false }),
  async (req, res) => {
    const { email } = req.body;

    console.log("Fetching draft or submitted form for email:", email);

    try {
      // Fetch submitted form first
      let submission = await FormSubmission.findOne({
        "formData.Email": email,
        isDraft: false, // Look for the final submission
      });

      if (!submission) {
        // If no submitted form, fetch a draft
        submission = await FormSubmission.findOne({
          "formData.Email": email,
          isDraft: true, // Look for draft submissions
        });
      }

      if (submission) {
        console.log("Form found for email:", email);

        // Add pipelineId, formId, and metadata to the response
        const responseData = {
          pipelineId: submission.pipelineId,
          // formId: submission._id,
          formId: submission._id.toString(), // Ensure formId is included and is a string
          formTitle: submission.formTitle,
          formStatus: submission.formStatus,
          currentRound: submission.currentRound,
          roundsCompleted: submission.roundsCompleted,
          // formData: submission.formData,
          formData: submission.formData || {}, // Ensure formData is not null
          files: submission.files || [],
        };

        console.log("Response Data:", responseData); // Debugging log
        return res.status(200).json(responseData);
      } else {
        console.log("No form (Draft or Submitted) found for email:", email);
        return res.status(404).json({
          message: "No form found for this email.",
          email: email,
        });
      }
    } catch (error) {
      console.error("Error fetching form by email:", error);
      return res.status(500).json({
        error: "Server error while fetching form by email",
        details: error.message,
      });
    }
  }
);

//for get form status time
router.get(
  "/form-submissions/:id/status",
  passport.authenticate("jwt-user", { session: false }),
  async (req, res) => {
    console.log("status");
    try {
      const { id } = req.params;
      console.log("Fetching form submission by ID:", id); // Log the form ID being used

      const submission = await FormSubmission.findById(id);

      if (!submission) {
        console.log("No submission found for ID:", id); // Log if no submission is found
        return res
          .status(404)
          .json({ message: "No submissions found for this form." });
      }

      const {
        formStatus,
        formFirstSavedTime,
        lastModified,
        formSubmissionTime,
      } = submission;

      const statusDetails = {
        formStatus,
        formFirstSavedTime,
        lastModified,
        formSubmissionTime,
      };

      res.status(200).json(statusDetails);
    } catch (error) {
      console.error("Error fetching form status:", error);
      res.status(500).json({ message: "Error fetching form status." });
    }
  }
);

router.get(
  "/form-submissions/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const submission = await FormSubmission.findById(id);

      if (!submission) {
        return res
          .status(404)
          .json({ message: "No submissions found for this form." });
      }

      res.status(200).json(submission);
    } catch (error) {
      console.error("Error fetching form submissions:", error);
      res.status(500).send(error);
    }
  }
);

//For User round
// routes/forms.js or relevant file
router.get(
  "/user/pipeline/:pipelineId/form/:formId/responses",
  passport.authenticate("jwt-user", { session: false }),
  async (req, res) => {
    const { pipelineId, formId } = req.params;
    const { email } = req.query;

    console.log("Pipeline ID:", pipelineId);
    console.log("Form ID:", formId);
    console.log("Email:", email);

    if (!pipelineId || !formId || !email) {
      console.error("Missing required parameters.");
      return res.status(400).json({ error: "Missing required parameters." });
    }

    try {
      console.log("Fetching form submission...");
      const formSubmission = await FormSubmission.find({
        pipelineId,
        _id: formId,
        "formData.Email": email,
      });

      console.log("Form Submission Data:", formSubmission);

      if (!formSubmission || formSubmission.length === 0) {
        console.warn("No responses found.");
        return res.status(404).json({ error: "No responses found." });
      }

      const groupedResponses = formSubmission.reduce((acc, submission) => {
        const round = `Round ${submission.currentRound}`;
        if (!acc[round]) acc[round] = [];
        acc[round].push(submission);
        return acc;
      }, {});

      return res.status(200).json(groupedResponses);
    } catch (error) {
      console.error("Error fetching responses:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  }
);

//for UserFormDetails.jsx
/*** START CHANGE: Fetch all responses for completed and current rounds ***/
router.get(
  "/pipeline/:pipelineId/form/:formId/responses/user",
  passport.authenticate("jwt-user", { session: false }),
  async (req, res) => {
    const { pipelineId, formId } = req.params;
    const { email } = req.query;

    if (!pipelineId || !formId || !email) {
      console.error("Missing required parameters.");
      return res.status(400).json({ error: "Missing required parameters." });
    }

    try {
      // Find all responses for the user
      const responses = await FormSubmission.find({
        pipelineId,
        formTitle: formId,
        "formData.Email": email,
      });

      if (!responses || responses.length === 0) {
        return res.status(404).json({ message: "No responses found." });
      }

      // Group responses by round
      const groupedResponses = responses.reduce((acc, response) => {
        const roundKey = `Round ${response.currentRound}`;
        if (!acc[roundKey]) acc[roundKey] = [];
        acc[roundKey].push(response);
        return acc;
      }, {});

      // Return grouped responses
      res.status(200).json(groupedResponses);
    } catch (error) {
      console.error("Error fetching responses:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  }
);
/*** END CHANGE: Fetch all responses for completed and current rounds ***/

router.post("/pipeline/:pipelineId/responses", async (req, res) => {
  const { pipelineId } = req.params;
  const { email } = req.body;

  try {
    console.log("Fetching pipeline and submissions...");

    // Fetch pipeline details
    const pipeline = await Pipeline.findById(pipelineId);
    if (!pipeline) {
      console.log("Pipeline not found");
      return res.status(404).json({ message: "Pipeline not found" });
    }
    console.log("Pipeline fetched successfully:", pipeline.title);

    // Fetch form submissions for the given email and pipeline
    const formSubmissions = await FormSubmission.find({
      pipelineId,
      "formData.Email": email,
    });
    console.log("Form Submissions Fetched:", formSubmissions);

    // Fetch all forms to resolve form titles
    const allForms = await Form.find({});
    const formIdToTitleMap = {};
    allForms.forEach((form) => {
      formIdToTitleMap[form._id.toString()] = form.title; // Map formId to its title
    });

    const responses = pipeline.rounds.map((round) => {
      console.log(`\n--- Processing Round ${round.roundNumber} ---`);

      // Resolve formTitle from formId in the pipeline
      const roundFormTitle = round.application.formTitle;
      const roundFormId = round.application.formId?.toString();

      // Filter submissions strictly matching currentRound OR completed round
      const submission = formSubmissions.find((submission) => {
        const isCompletedRound = submission.roundsCompleted.includes(
          round.roundNumber
        );
        const isCurrentRound = submission.currentRound === round.roundNumber;
        const hasValidStatus =
          submission.formStatus === "Saved" ||
          submission.formStatus === "Submitted";

        // Resolve submission's form title
        const submissionFormTitle =
          formIdToTitleMap[submission.formTitle] || submission.formTitle;

        // Match round's form title with submission's form title
        const matchesForm = submissionFormTitle === roundFormTitle;

        // Log checks for debugging
        console.log(`Checking Submission ID: ${submission._id}`);
        console.log(
          `  Completed Rounds: ${submission.roundsCompleted}, Is Completed: ${isCompletedRound}`
        );
        console.log(
          `  Current Round: ${submission.currentRound}, Is Current: ${isCurrentRound}`
        );
        console.log(
          `  Form Status: ${submission.formStatus}, Is Valid: ${hasValidStatus}`
        );
        console.log(
          `  Submission Form Title: ${submissionFormTitle}, Round Form Title: ${roundFormTitle}`
        );
        console.log(`  Form Match: ${matchesForm}`);

        return (
          hasValidStatus && matchesForm && (isCompletedRound || isCurrentRound)
        );
      });

      console.log(
        `Submission found for Round ${round.roundNumber}:`,
        submission ? "Yes" : "No"
      );

      return {
        roundNumber: round.roundNumber,
        formTitle: roundFormTitle || "No Form Attached",
        response: submission
          ? {
              formData: submission.formData,
              formStatus: submission.formStatus,
              formFirstSavedTime: submission.formFirstSavedTime,
              lastModified: submission.lastModified,
              files: submission.files || [],
              isDraft: submission.isDraft,
            }
          : {
              formStatus: "No Response",
              formData: {},
              files: [],
            },
      };
    });

    console.log("\n--- Final Responses ---");
    console.log(JSON.stringify(responses, null, 2));

    res.json(responses);
  } catch (error) {
    console.error("Error fetching responses:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
