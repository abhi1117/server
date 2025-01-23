const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// Form Schema
const formSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  // HIGHLIGHT START: Change lastModified to Date type
  lastModified: {
    type: Date, // Use Date type for sorting
    default: Date.now,
  },
  // HIGHLIGHT END
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  programManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProgramManager",
  },
});

// Middleware to update timestamps
formSchema.pre("save", function (next) {
  // HIGHLIGHT START: Ensure lastModified is a Date
  this.lastModified = Date.now();
  this.updatedAt = Date.now();
  // HIGHLIGHT END
  next();
});

formSchema.pre("findOneAndUpdate", function (next) {
  // HIGHLIGHT START: Ensure lastModified is a Date
  this._update.lastModified = Date.now();
  this._update.updatedAt = Date.now();
  // HIGHLIGHT END
  next();
});

const Form = mongoose.model("Form", formSchema);

// General Form Structure Schema
const generalFormStructureSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
  },
  programManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProgramManager",
  },

  title: String,
  fields: Array,
  lastModified: { type: Date, default: Date.now },
});

const GeneralFormStructure = mongoose.model(
  "GeneralFormStructure",
  generalFormStructureSchema
);

// Shareable Link Schema
const shareableLinkSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: "Form", required: true },
  link: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

const ShareableLink = mongoose.model("ShareableLink", shareableLinkSchema);

// Form Submission Schema
const formSubmissionSchema = new mongoose.Schema(
  {
    formTitle: {
      type: String,
      required: true,
    },
    pipelineId: {
      type: String, // Ensure it's stored as a string (or ObjectId, depending on your logic) // for GET Application list and count separately
      required: true, // Make it required
    },
    formData: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      required: true,
    },
    isDraft: { type: Boolean, default: false }, // Add draft status
    /*** START CHANGE to show form status and date/time ***/
    // New fields to track form status and submission times
    formFirstSavedTime: {
      type: Date, // Stores when the form was first saved as draft
    },
    formSubmissionTime: {
      type: Date, // Stores when the form was fully submitted
    },
    lastModified: {
      type: Date, // ** Ensure the Date type **
      default: Date.now, // Default value is the current time
    },
    formStatus: {
      type: String, // To store status like "Saved" or "Submitted"
      enum: ["Saved", "Submitted"], // Two valid values
      default: "Saved", // Default to "Saved" when saving as a draft
    },
    /*** END CHANGE to show form status and date/time--- ***/

    files: [
      {
        originalName: { type: String, required: true },
        path: { type: String, required: true },
        mimeType: { type: String, required: true },
        /*** START  CHANGE FOR save label name with file  ***/
        // labelName: { type: String, required: true }, // Add field to store the label name associated with the file
        labelName: { type: [String], required: true },
        /*** END CHANGE FOR save label name with file  --- ***/
        /*** START CHANGE FOR save file with upload time ***/
        uploadedAt: { type: Date, default: Date.now }, // <-- Add uploadedAt field to store file upload date/time
        /*** END CHANGE FOR save file with upload time --- ***/
      },
    ],
    /*** START CHANGE FOR applicant round tracking --- ***/
    currentRound: { type: Number, default: 1 }, // Tracks the current round of the applicant
    roundsCompleted: { type: [Number], default: [] }, // Tracks completed rounds
    /*** END CHANGE FOR applicant round tracking --- ***/
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { minimize: false }
);

formSubmissionSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  this.lastModified = Date.now(); // ** Ensure lastModified is updated on save **
  next();
});

// Middleware to update form status and submission times when submitting a form
formSubmissionSchema.pre("save", function (next) {
  // If the form is being submitted (not saved as a draft)
  if (!this.isDraft && this.formStatus === "Submitted") {
    // Set form submission time if it's being submitted
    this.formSubmissionTime = Date.now();
  }

  // If this is the first time saving the form (as draft or otherwise), set the first saved time
  if (!this.formFirstSavedTime) {
    this.formFirstSavedTime = Date.now();
  }

  // Set the last modified time
  this.lastModified = Date.now();

  next();
});

const FormSubmission = mongoose.model("FormSubmission", formSubmissionSchema);

module.exports = {
  Form,
  GeneralFormStructure,
  ShareableLink,
  FormSubmission,
};






// const mongoose = require("mongoose");
// const { v4: uuidv4 } = require("uuid");

// // Form Schema
// const formSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   category: { type: String, required: true },
//   // HIGHLIGHT START: Change lastModified to Date type
//   lastModified: {
//     type: Date, // Use Date type for sorting
//     default: Date.now,
//   },
//   // HIGHLIGHT END
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now,
//   },
//   programManager:{
//     type:mongoose.Schema.Types.ObjectId,
//     ref:'ProgramManager'
//   }
// });

// // Middleware to update timestamps
// formSchema.pre("save", function (next) {
//   // HIGHLIGHT START: Ensure lastModified is a Date
//   this.lastModified = Date.now();
//   this.updatedAt = Date.now();
//   // HIGHLIGHT END
//   next();
// });

// formSchema.pre("findOneAndUpdate", function (next) {
//   // HIGHLIGHT START: Ensure lastModified is a Date
//   this._update.lastModified = Date.now();
//   this._update.updatedAt = Date.now();
//   // HIGHLIGHT END
//   next();
// });

// const Form = mongoose.model("Form", formSchema);

// // General Form Structure Schema
// const generalFormStructureSchema = new mongoose.Schema({
//   id: {
//     type: String,
//     default: uuidv4,
//     unique: true,
//   },
//   programManager:{
//     type:mongoose.Schema.Types.ObjectId,
//     ref:'ProgramManager'
//   },

//   title: String,
//   fields: Array,
//   lastModified: { type: Date, default: Date.now },
// });

// const GeneralFormStructure = mongoose.model(
//   "GeneralFormStructure",
//   generalFormStructureSchema
// );

// // Shareable Link Schema
// const shareableLinkSchema = new mongoose.Schema({
//   formId: { type: mongoose.Schema.Types.ObjectId, ref: "Form", required: true },
//   link: { type: String, required: true, unique: true },
//   createdAt: { type: Date, default: Date.now },
// });

// const ShareableLink = mongoose.model("ShareableLink", shareableLinkSchema);

// // Form Submission Schema
// const formSubmissionSchema = new mongoose.Schema(
//   {
//     formTitle: {
//       type: String,
//       required: true,
//     },
//     pipelineId: {
//       type: String, // Ensure it's stored as a string (or ObjectId, depending on your logic) // for GET Application list and count separately
//       required: true, // Make it required
//     },
//     formData: {
//       type: Map,
//       of: mongoose.Schema.Types.Mixed,
//       required: true,
//     },
//     isDraft: { type: Boolean, default: false }, // Add draft status
//     /*** START CHANGE to show form status and date/time ***/
//     // New fields to track form status and submission times
//     formFirstSavedTime: {
//       type: Date, // Stores when the form was first saved as draft
//     },
//     formSubmissionTime: {
//       type: Date, // Stores when the form was fully submitted
//     },
//     lastModified: {
//       type: Date, // ** Ensure the Date type **
//       default: Date.now, // Default value is the current time
//     },
//     formStatus: {
//       type: String, // To store status like "Saved" or "Submitted"
//       enum: ["Saved", "Submitted"], // Two valid values
//       default: "Saved", // Default to "Saved" when saving as a draft
//     },
//     /*** END CHANGE to show form status and date/time--- ***/

//     files: [
//       {
//         originalName: { type: String, required: true },
//         path: { type: String, required: true },
//         mimeType: { type: String, required: true },
//         /*** START  CHANGE FOR save label name with file  ***/
//         labelName: { type: String, required: true }, // Add field to store the label name associated with the file
//         /*** END CHANGE FOR save label name with file  --- ***/
//         /*** START CHANGE FOR save file with upload time ***/
//         uploadedAt: { type: Date, default: Date.now }, // <-- Add uploadedAt field to store file upload date/time
//         /*** END CHANGE FOR save file with upload time --- ***/
//       },
//     ],
// /*** START CHANGE FOR applicant round tracking --- ***/
// currentRound: { type: Number, default: 1 }, // Tracks the current round of the applicant
// roundsCompleted: { type: [Number], default: [] }, // Tracks completed rounds
// /*** END CHANGE FOR applicant round tracking --- ***/
//     createdAt: {
//       type: Date,
//       default: Date.now,
//     },
//     updatedAt: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   { minimize: false }
// );

// formSubmissionSchema.pre("save", function (next) {
//   this.updatedAt = Date.now();
//   this.lastModified = Date.now(); // ** Ensure lastModified is updated on save **
//   next();
// });

// // Middleware to update form status and submission times when submitting a form
// formSubmissionSchema.pre("save", function (next) {
//   // If the form is being submitted (not saved as a draft)
//   if (!this.isDraft && this.formStatus === "Submitted") {
//     // Set form submission time if it's being submitted
//     this.formSubmissionTime = Date.now();
//   }

//   // If this is the first time saving the form (as draft or otherwise), set the first saved time
//   if (!this.formFirstSavedTime) {
//     this.formFirstSavedTime = Date.now();
//   }

//   // Set the last modified time
//   this.lastModified = Date.now();

//   next();
// });

// const FormSubmission = mongoose.model("FormSubmission", formSubmissionSchema);

// module.exports = {
//   Form,
//   GeneralFormStructure,
//   ShareableLink,
//   FormSubmission,
// };

//Each round's response is shown under its respective Round Response Tab 22 11 2024 ///

// const mongoose = require("mongoose");
// const { v4: uuidv4 } = require("uuid");

// // Form Schema
// const formSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   category: { type: String, required: true },
//   // label: { type: String, required: true },
//   // status: { type: String, required: true },
//   // HIGHLIGHT START: Change lastModified to Date type
//   lastModified: {
//     type: Date, // Use Date type for sorting
//     default: Date.now,
//   },
//   // HIGHLIGHT END
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now,
//   },
//   programManager:{
//     type:mongoose.Schema.Types.ObjectId,
//     ref:'ProgramManager'
//   }
// });

// // Middleware to update timestamps
// formSchema.pre("save", function (next) {
//   // HIGHLIGHT START: Ensure lastModified is a Date
//   this.lastModified = Date.now();
//   this.updatedAt = Date.now();
//   // HIGHLIGHT END
//   next();
// });

// formSchema.pre("findOneAndUpdate", function (next) {
//   // HIGHLIGHT START: Ensure lastModified is a Date
//   this._update.lastModified = Date.now();
//   this._update.updatedAt = Date.now();
//   // HIGHLIGHT END
//   next();
// });

// const Form = mongoose.model("Form", formSchema);

// // General Form Structure Schema
// const generalFormStructureSchema = new mongoose.Schema({
//   id: {
//     type: String,
//     default: uuidv4,
//     unique: true,
//   },
//   programManager:{
//     type:mongoose.Schema.Types.ObjectId,
//     ref:'ProgramManager'
//   },

//   title: String,
//   fields: Array,
//   lastModified: { type: Date, default: Date.now },
// });

// const GeneralFormStructure = mongoose.model(
//   "GeneralFormStructure",
//   generalFormStructureSchema
// );

// // Shareable Link Schema
// const shareableLinkSchema = new mongoose.Schema({
//   formId: { type: mongoose.Schema.Types.ObjectId, ref: "Form", required: true },
//   link: { type: String, required: true, unique: true },
//   createdAt: { type: Date, default: Date.now },
// });

// const ShareableLink = mongoose.model("ShareableLink", shareableLinkSchema);

// // Form Submission Schema
// const formSubmissionSchema = new mongoose.Schema(
//   {
//     formTitle: {
//       type: String,
//       required: true,
//     },
//     pipelineId: {
//       type: String, // Ensure it's stored as a string (or ObjectId, depending on your logic) // for GET Application list and count separately
//       required: true, // Make it required
//     },
//     formData: {
//       type: Map,
//       of: mongoose.Schema.Types.Mixed,
//       required: true,
//     },
//     isDraft: { type: Boolean, default: false }, // Add draft status
//     /*** START CHANGE to show form status and date/time ***/
//     // New fields to track form status and submission times
//     formFirstSavedTime: {
//       type: Date, // Stores when the form was first saved as draft
//     },
//     formSubmissionTime: {
//       type: Date, // Stores when the form was fully submitted
//     },
//     lastModified: {
//       type: Date, // ** Ensure the Date type **
//       default: Date.now, // Default value is the current time
//     },
//     formStatus: {
//       type: String, // To store status like "Saved" or "Submitted"
//       enum: ["Saved", "Submitted"], // Two valid values
//       default: "Saved", // Default to "Saved" when saving as a draft
//     },
//     /*** END CHANGE to show form status and date/time--- ***/

//     files: [
//       {
//         originalName: { type: String, required: true },
//         path: { type: String, required: true },
//         mimeType: { type: String, required: true },
//         /*** START  CHANGE FOR save label name with file  ***/
//         labelName: { type: String, required: true }, // Add field to store the label name associated with the file
//         /*** END CHANGE FOR save label name with file  --- ***/
//         /*** START CHANGE FOR save file with upload time ***/
//         uploadedAt: { type: Date, default: Date.now }, // <-- Add uploadedAt field to store file upload date/time
//         /*** END CHANGE FOR save file with upload time --- ***/
//       },
//     ],
// /*** START CHANGE FOR applicant round tracking --- ***/
// currentRound: { type: Number, default: 1 }, // Tracks the current round of the applicant
// roundsCompleted: { type: [Number], default: [] }, // Tracks completed rounds
// /*** END CHANGE FOR applicant round tracking --- ***/
//     createdAt: {
//       type: Date,
//       default: Date.now,
//     },
//     updatedAt: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   { minimize: false }
// );

// formSubmissionSchema.pre("save", function (next) {
//   this.updatedAt = Date.now();
//   this.lastModified = Date.now(); // ** Ensure lastModified is updated on save **
//   next();
// });

// // Middleware to update form status and submission times when submitting a form
// formSubmissionSchema.pre("save", function (next) {
//   // If the form is being submitted (not saved as a draft)
//   if (!this.isDraft && this.formStatus === "Submitted") {
//     // Set form submission time if it's being submitted
//     this.formSubmissionTime = Date.now();
//   }

//   // If this is the first time saving the form (as draft or otherwise), set the first saved time
//   if (!this.formFirstSavedTime) {
//     this.formFirstSavedTime = Date.now();
//   }

//   // Set the last modified time
//   this.lastModified = Date.now();

//   next();
// });

// const FormSubmission = mongoose.model("FormSubmission", formSubmissionSchema);

// module.exports = {
//   Form,
//   GeneralFormStructure,
//   ShareableLink,
//   FormSubmission,
// };

// b 16 11 2024 b round in application.jsx
// const mongoose = require("mongoose");
// const { v4: uuidv4 } = require("uuid");

// // Form Schema
// const formSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   category: { type: String, required: true },
//   // label: { type: String, required: true },
//   // status: { type: String, required: true },
//   // HIGHLIGHT START: Change lastModified to Date type
//   lastModified: {
//     type: Date, // Use Date type for sorting
//     default: Date.now,
//   },
//   // HIGHLIGHT END
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now,
//   },
//   programManager:{
//     type:mongoose.Schema.Types.ObjectId,
//     ref:'ProgramManager'
//   }
// });

// // Middleware to update timestamps
// formSchema.pre("save", function (next) {
//   // HIGHLIGHT START: Ensure lastModified is a Date
//   this.lastModified = Date.now();
//   this.updatedAt = Date.now();
//   // HIGHLIGHT END
//   next();
// });

// formSchema.pre("findOneAndUpdate", function (next) {
//   // HIGHLIGHT START: Ensure lastModified is a Date
//   this._update.lastModified = Date.now();
//   this._update.updatedAt = Date.now();
//   // HIGHLIGHT END
//   next();
// });

// const Form = mongoose.model("Form", formSchema);

// // General Form Structure Schema
// const generalFormStructureSchema = new mongoose.Schema({
//   id: {
//     type: String,
//     default: uuidv4,
//     unique: true,
//   },
//   programManager:{
//     type:mongoose.Schema.Types.ObjectId,
//     ref:'ProgramManager'
//   },

//   title: String,
//   fields: Array,
//   lastModified: { type: Date, default: Date.now },
// });

// const GeneralFormStructure = mongoose.model(
//   "GeneralFormStructure",
//   generalFormStructureSchema
// );

// // Shareable Link Schema
// const shareableLinkSchema = new mongoose.Schema({
//   formId: { type: mongoose.Schema.Types.ObjectId, ref: "Form", required: true },
//   link: { type: String, required: true, unique: true },
//   createdAt: { type: Date, default: Date.now },
// });

// const ShareableLink = mongoose.model("ShareableLink", shareableLinkSchema);

// // Form Submission Schema
// const formSubmissionSchema = new mongoose.Schema(
//   {
//     formTitle: {
//       type: String,
//       required: true,
//     },
//     pipelineId: {
//       type: String, // Ensure it's stored as a string (or ObjectId, depending on your logic) // for GET Application list and count separately
//       required: true, // Make it required
//     },
//     formData: {
//       type: Map,
//       of: mongoose.Schema.Types.Mixed,
//       required: true,
//     },
//     isDraft: { type: Boolean, default: false }, // Add draft status
//     /*** START CHANGE to show form status and date/time ***/
//     // New fields to track form status and submission times
//     formFirstSavedTime: {
//       type: Date, // Stores when the form was first saved as draft
//     },
//     formSubmissionTime: {
//       type: Date, // Stores when the form was fully submitted
//     },
//     lastModified: {
//       type: Date, // ** Ensure the Date type **
//       default: Date.now, // Default value is the current time
//     },
//     formStatus: {
//       type: String, // To store status like "Saved" or "Submitted"
//       enum: ["Saved", "Submitted"], // Two valid values
//       default: "Saved", // Default to "Saved" when saving as a draft
//     },
//     /*** END CHANGE to show form status and date/time--- ***/

//     files: [
//       {
//         originalName: { type: String, required: true },
//         path: { type: String, required: true },
//         mimeType: { type: String, required: true },
//         /*** START  CHANGE FOR save label name with file  ***/
//         labelName: { type: String, required: true }, // Add field to store the label name associated with the file
//         /*** END CHANGE FOR save label name with file  --- ***/
//         /*** START CHANGE FOR save file with upload time ***/
//         uploadedAt: { type: Date, default: Date.now }, // <-- Add uploadedAt field to store file upload date/time
//         /*** END CHANGE FOR save file with upload time --- ***/
//       },
//     ],
//     createdAt: {
//       type: Date,
//       default: Date.now,
//     },
//     updatedAt: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   { minimize: false }
// );

// formSubmissionSchema.pre("save", function (next) {
//   this.updatedAt = Date.now();
//   this.lastModified = Date.now(); // ** Ensure lastModified is updated on save **
//   next();
// });

// // Middleware to update form status and submission times when submitting a form
// formSubmissionSchema.pre("save", function (next) {
//   // If the form is being submitted (not saved as a draft)
//   if (!this.isDraft && this.formStatus === "Submitted") {
//     // Set form submission time if it's being submitted
//     this.formSubmissionTime = Date.now();
//   }

//   // If this is the first time saving the form (as draft or otherwise), set the first saved time
//   if (!this.formFirstSavedTime) {
//     this.formFirstSavedTime = Date.now();
//   }

//   // Set the last modified time
//   this.lastModified = Date.now();

//   next();
// });

// const FormSubmission = mongoose.model("FormSubmission", formSubmissionSchema);

// module.exports = {
//   Form,
//   GeneralFormStructure,
//   ShareableLink,
//   FormSubmission,
// };
