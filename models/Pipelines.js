const mongoose = require("mongoose");

// Define the schema for each tab within a round
const GeneralSchema = new mongoose.Schema({
  isActive: { type: Boolean, default: false },
  showLastDateToApply: { type: Boolean, default: false },
});

const ApplicationSchema = new mongoose.Schema({
  addApplication: { type: Boolean, default: false },
  formId: { type: mongoose.Schema.Types.ObjectId, ref: "Form", default: null },
  formTitle: { type: String, default: "" },
});

const ApplicationFormDesignSchema = new mongoose.Schema({
  applicationTitle: { type: String, default: "" }, 
  posterUrl: { type: String, default: "" },
  description: { type: String, default: "" },
  supportingDocuments: [
    {
      name: { type: String, default: "" },
      url: { type: String, default: "" },
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
});

// Define the Round schema to include separate schemas for each tab
const RoundSchema = new mongoose.Schema({
  roundNumber: { type: Number, required: true },
  type: { type: String, enum: ["Public", "Private"], required: true },
  // link: { type: String, default: "" },
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
  status: { type: String, default: "Not open yet" },
  /*** START CHANGE --- Adding isolated data for each round's tabs ***/
  general: { type: GeneralSchema, default: () => ({}) },
  application: { type: ApplicationSchema, default: () => ({}) },
  applicationFormDesign: { type: ApplicationFormDesignSchema, default: () => ({}) },
  /*** END CHANGE --- Adding isolated data for each round's tabs ***/
});

// Define the main Pipeline schema with an array of RoundSchema
const PipelineSchema = new mongoose.Schema({
  program: { type: String, required: true },
  cohort: { type: String, required: true },
  type: { type: String, required: true, enum: ["Application", "Startup"] },
  title: { type: String, required: true },
  programManager: { type: mongoose.Schema.Types.ObjectId, required: true },
  rounds: [RoundSchema], // Array of rounds
  roundLink: {
    type: String,
    default: "", // Single link for all rounds
  },
  createdAt: { type: Date, default: Date.now },
});

const Pipeline = mongoose.model("Pipeline", PipelineSchema);

module.exports = Pipeline;








//Each round's response is shown under its respective Round Response Tab 22 11 2024 ///


// const mongoose = require("mongoose");

// // Define the schema for each tab within a round
// const GeneralSchema = new mongoose.Schema({
//   isActive: { type: Boolean, default: false },
//   showLastDateToApply: { type: Boolean, default: false },
// });

// const ApplicationSchema = new mongoose.Schema({
//   addApplication: { type: Boolean, default: false },
//   formId: { type: mongoose.Schema.Types.ObjectId, ref: "Form", default: null },
//   formTitle: { type: String, default: "" },
// });

// const ApplicationFormDesignSchema = new mongoose.Schema({
//   applicationTitle: { type: String, default: "" }, 
//   posterUrl: { type: String, default: "" },
//   description: { type: String, default: "" },
//   supportingDocuments: [
//     {
//       name: { type: String, default: "" },
//       url: { type: String, default: "" },
//       uploadedAt: { type: Date, default: Date.now },
//     },
//   ],
// });

// // Define the Round schema to include separate schemas for each tab
// const RoundSchema = new mongoose.Schema({
//   roundNumber: { type: Number, required: true },
//   type: { type: String, enum: ["Public", "Private"], required: true },
//   // link: { type: String, default: "" },
//   startDate: { type: Date, default: null },
//   endDate: { type: Date, default: null },
//   status: { type: String, default: "Not open yet" },
//   /*** START CHANGE --- Adding isolated data for each round's tabs ***/
//   general: { type: GeneralSchema, default: () => ({}) },
//   application: { type: ApplicationSchema, default: () => ({}) },
//   applicationFormDesign: { type: ApplicationFormDesignSchema, default: () => ({}) },
//   /*** END CHANGE --- Adding isolated data for each round's tabs ***/
// });

// // Define the main Pipeline schema with an array of RoundSchema
// const PipelineSchema = new mongoose.Schema({
//   program: { type: String, required: true },
//   cohort: { type: String, required: true },
//   type: { type: String, required: true, enum: ["Application", "Startup"] },
//   title: { type: String, required: true },
//   programManager: { type: mongoose.Schema.Types.ObjectId, required: true },
//   rounds: [RoundSchema], // Array of rounds
//   roundLink: {
//     type: String,
//     default: "", // Single link for all rounds
//   },
//   createdAt: { type: Date, default: Date.now },
// });

// const Pipeline = mongoose.model("Pipeline", PipelineSchema);

// module.exports = Pipeline;





//vb 16 11 2024

// const mongoose = require("mongoose");

// // Define the schema for each tab within a round
// const GeneralSchema = new mongoose.Schema({
//   isActive: { type: Boolean, default: false },
//   showLastDateToApply: { type: Boolean, default: false },
// });

// const ApplicationSchema = new mongoose.Schema({
//   addApplication: { type: Boolean, default: false },
//   formId: { type: mongoose.Schema.Types.ObjectId, ref: "Form", default: null },
//   formTitle: { type: String, default: "" },
// });

// const ApplicationFormDesignSchema = new mongoose.Schema({
//   applicationTitle: { type: String, default: "" }, 
//   posterUrl: { type: String, default: "" },
//   description: { type: String, default: "" },
//   supportingDocuments: [
//     {
//       name: { type: String, default: "" },
//       url: { type: String, default: "" },
//       uploadedAt: { type: Date, default: Date.now },
//     },
//   ],
// });

// // Define the Round schema to include separate schemas for each tab
// const RoundSchema = new mongoose.Schema({
//   roundNumber: { type: Number, required: true },
//   type: { type: String, enum: ["Public", "Private"], required: true },
//   // link: { type: String, default: "" },
//   startDate: { type: Date, default: null },
//   endDate: { type: Date, default: null },
//   status: { type: String, default: "Not open yet" },
//   /*** START CHANGE --- Adding isolated data for each round's tabs ***/
//   general: { type: GeneralSchema, default: () => ({}) },
//   application: { type: ApplicationSchema, default: () => ({}) },
//   applicationFormDesign: { type: ApplicationFormDesignSchema, default: () => ({}) },
//   /*** END CHANGE --- Adding isolated data for each round's tabs ***/
// });

// // Define the main Pipeline schema with an array of RoundSchema
// const PipelineSchema = new mongoose.Schema({
//   program: { type: String, required: true },
//   cohort: { type: String, required: true },
//   type: { type: String, required: true, enum: ["Application", "Startup"] },
//   title: { type: String, required: true },
//   programManager: { type: mongoose.Schema.Types.ObjectId, required: true },
//   rounds: [RoundSchema], // Array of rounds
//   roundLink: {
//     type: String,
//     default: "", // Single link for all rounds
//   },
//   createdAt: { type: Date, default: Date.now },
// });

// const Pipeline = mongoose.model("Pipeline", PipelineSchema);

// module.exports = Pipeline;




/////not 1 link 
// const mongoose = require("mongoose");

// // Define the schema for each tab within a round
// const GeneralSchema = new mongoose.Schema({
//   isActive: { type: Boolean, default: false },
//   showLastDateToApply: { type: Boolean, default: false },
// });

// const ApplicationSchema = new mongoose.Schema({
//   addApplication: { type: Boolean, default: false },
//   formId: { type: mongoose.Schema.Types.ObjectId, ref: "Form", default: null },
//   formTitle: { type: String, default: "" },
// });

// const ApplicationFormDesignSchema = new mongoose.Schema({
//   applicationTitle: { type: String, default: "" },
//   posterUrl: { type: String, default: "" },
//   description: { type: String, default: "" },
//   supportingDocuments: [
//     {
//       name: { type: String, default: "" },
//       url: { type: String, default: "" },
//       uploadedAt: { type: Date, default: Date.now },
//     },
//   ],
// });

// // Define the Round schema to include separate schemas for each tab
// const RoundSchema = new mongoose.Schema({
//   roundNumber: { type: Number, required: true },
//   type: { type: String, enum: ["Public", "Private"], required: true },
//   link: { type: String, default: "" },
//   startDate: { type: Date, default: null },
//   endDate: { type: Date, default: null },
//   status: { type: String, default: "Not open yet" },
//   /*** START CHANGE --- Adding isolated data for each round's tabs ***/
//   general: { type: GeneralSchema, default: () => ({}) },
//   application: { type: ApplicationSchema, default: () => ({}) },
//   applicationFormDesign: { type: ApplicationFormDesignSchema, default: () => ({}) },
//   /*** END CHANGE --- Adding isolated data for each round's tabs ***/
// });

// // Define the main Pipeline schema with an array of RoundSchema
// const PipelineSchema = new mongoose.Schema({
//   program: { type: String, required: true },
//   cohort: { type: String, required: true },
//   type: { type: String, required: true, enum: ["Application", "Startup"] },
//   title: { type: String, required: true },
//   programManager: { type: mongoose.Schema.Types.ObjectId, required: true },
//   rounds: [RoundSchema], // Array of rounds
//   createdAt: { type: Date, default: Date.now },
// });

// const Pipeline = mongoose.model("Pipeline", PipelineSchema);

// module.exports = Pipeline;








// const mongoose = require("mongoose");

// // Define the Round schema as a sub-document schema
// const RoundSchema = new mongoose.Schema({
//   roundNumber: {
//     type: Number,
//     required: true,
//   },
//   type: {
//     type: String,
//     enum: ["Public", "Private"],
//     required: true,
//   },
//   link: {
//     type: String,
//     default: "",
//   },
//   startDate: {
//     type: Date,
//     default: null,
//   },
//   endDate: {
//     type: Date,
//     default: null,
//   },
//   status: {
//     type: String,
//     default: "Not open yet",
//   },
//   general: {
//     isActive: { type: Boolean, default: false },
//     showLastDateToApply: { type: Boolean, default: false },
//   },
//   application: {
//     forms: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Form",
//     },
//     formTitle: {
//       type: String,
//       required: false,
//     },
//       /*** START CHANGE FOR addApplication toggle persistence --- ***/
//   addApplication: {
//     type: Boolean,
//     default: false,
//   },
//   /*** END CHANGE FOR addApplication toggle persistence --- ***/
//   },
//   applicationFormDesign: {
//     applicationTitle: { type: String, default: "" },
//     posterUrl: { type: String, default: "" },
//     description: { type: String, default: "" },
//     supportingDocuments: [
//       {
//         name: { type: String, default: "" },
//         url: { type: String, default: "" },
//         uploadedAt: {
//           type: Date,
//           default: Date.now,
//         },
//       },
//     ],
//   },
// });


// // Define the Pipeline schema with an array of RoundSchema
//  const PipelineSchema = new mongoose.Schema({
//   program: {
//     type: String,
//     required: true,
//   },
//   cohort: {
//     type: String,
//     required: true,
//   },
//   type: {
//     type: String,
//     required: true,
//     enum: ["Application", "Startup"], 
//   }, 
//   title: {
//     type: String,
//     required: true,
//   },
//   programManager:{
//     type:mongoose.Schema.Types.ObjectId,  
//     required:true
//   },
//   forms: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Form",
//   },
//   formTitle: {
//     // New field to store the form title
//     type: String,
//     required: false,
//   },
//   /*** START CHANGE FOR addApplication toggle persistence --- ***/
//   addApplication: {
//     type: Boolean,
//     default: false,
//   },
//   /*** END CHANGE FOR addApplication toggle persistence --- ***/
//   /*** START CHANGE FOR description --- ***/
//   description: {
//     type: String,
//     required: false,
//   },
//   /*** END CHANGE FOR description --- ***/
//   /*** START CHANGE FOR application title --- ***/
//   applicationTitle: {
//     type: String,
//     required: false,
//   },
//   /*** END CHANGE FOR application title --- ***/
//   /*** START CHANGE FOR Supporting Documents --- ***/
//   supportingDocuments: [
//     {
//       name: String,
//       url: String,
//       uploadedAt: {
//         type: Date,
//         default: Date.now,
//       },
//     },
//   ],

//   /*** END CHANGE FOR Supporting Documents --- ***/
//   /*** START CHANGE FOR Poster --- ***/
//   poster: [
//     {
//       name: String,
//       url: String,
//       uploadedAt: {
//         type: Date,
//         default: Date.now,
//       },
//     },
//   ],
//   /*** END CHANGE FOR Poster --- ***/

//   roundLink: {
//     type: String,
//     default: "",
//   },
//   roundStatus: {
//     type: String,
//     default: "Not open yet",
//   },
//   startDate: {
//     type: Date, // New field for start date
//   },
//   endDate: {
//     type: Date, // End date for the round
//   }, 

//   showLastDateToApply: {
//     type: Boolean,
//     default: false, // Toggle for "Show Last Date to Apply"
//   },
//   rounds: [RoundSchema],   // Adding the rounds array to hold multiple rounds 
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// const Pipeline = mongoose.model("Pipeline", PipelineSchema);

// module.exports = Pipeline;








////////////////////////////////////////\\\\before tab data save in backend



/////////Every round mein same tabs show ho rahi hAI and start ans end date work kar raha hai 


// const mongoose = require("mongoose");

// // Define the Round schema as a sub-document schema
// const RoundSchema = new mongoose.Schema({
//   roundNumber: {
//     type: Number,
//     required: true,
//   },
//   type: {
//     type: String,
//     enum: ["Public", "Private"],
//     required: true,
//   },
//   link: {
//     type: String,
//     default: "",
//   },
//   startDate: {
//     type: Date,
//     default: null,
//   },
//   endDate: {
//     type: Date,
//     default: null,
//   },
//   status: {
//     type: String,
//     default: "Not open yet",
//   },
// });

// // Define the Pipeline schema with an array of RoundSchema
//  const PipelineSchema = new mongoose.Schema({
//   program: {
//     type: String,
//     required: true,
//   },
//   cohort: {
//     type: String,
//     required: true,
//   },
//   type: {
//     type: String,
//     required: true,
//     enum: ["Application", "Startup"], 
//   }, 
//   title: {
//     type: String,
//     required: true,
//   },
//   programManager:{
//     type:mongoose.Schema.Types.ObjectId, 
//     required:true
//   },
//   forms: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Form",
//   },
//   formTitle: {
//     // New field to store the form title
//     type: String,
//     required: false,
//   },
//   /*** START CHANGE FOR description --- ***/
//   description: {
//     type: String,
//     required: false,
//   },
//   /*** END CHANGE FOR description --- ***/
//   /*** START CHANGE FOR application title --- ***/
//   applicationTitle: {
//     type: String,
//     required: false,
//   },
//   /*** END CHANGE FOR application title --- ***/
//   /*** START CHANGE FOR Supporting Documents --- ***/
//   supportingDocuments: [
//     {
//       name: String,
//       url: String,
//       uploadedAt: {
//         type: Date,
//         default: Date.now,
//       },
//     },
//   ],

//   /*** END CHANGE FOR Supporting Documents --- ***/
//   /*** START CHANGE FOR Poster --- ***/
//   poster: [
//     {
//       name: String,
//       url: String,
//       uploadedAt: {
//         type: Date,
//         default: Date.now,
//       },
//     },
//   ],
//   /*** END CHANGE FOR Poster --- ***/

//   roundLink: {
//     type: String,
//     default: "",
//   },
//   roundStatus: {
//     type: String,
//     default: "Not open yet",
//   },
//   startDate: {
//     type: Date, // New field for start date
//   },
//   endDate: {
//     type: Date, // End date for the round
//   },

//   showLastDateToApply: {
//     type: Boolean,
//     default: false, // Toggle for "Show Last Date to Apply"
//   },
//   // Adding the rounds array to hold multiple rounds
//   rounds: [RoundSchema],
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// const Pipeline = mongoose.model("Pipeline", PipelineSchema);

// module.exports = Pipeline;









////b round




// const mongoose = require("mongoose");

// // Define the Pipeline schema
// const PipelineSchema = new mongoose.Schema({
//   program: {
//     type: String,
//     required: true,
//   },
//   cohort: {
//     type: String,
//     required: true,
//   },
//   type: {
//     type: String,
//     required: true,
//     enum: ["Application", "Startup"], 
//   }, 
//   title: {
//     type: String,
//     required: true,
//   },
//   programManager:{
//     type:mongoose.Schema.Types.ObjectId, 
//     required:true
//   },
//   forms: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Form",
//   },
//   formTitle: {
//     // New field to store the form title
//     type: String,
//     required: false,
//   },
//   /*** START CHANGE FOR description --- ***/
//   description: {
//     type: String,
//     required: false,
//   },
//   /*** END CHANGE FOR description --- ***/
//   /*** START CHANGE FOR application title --- ***/
//   applicationTitle: {
//     type: String,
//     required: false,
//   },
//   /*** END CHANGE FOR application title --- ***/
//   /*** START CHANGE FOR Supporting Documents --- ***/
//   supportingDocuments: [
//     {
//       name: String,
//       url: String,
//       uploadedAt: {
//         type: Date,
//         default: Date.now,
//       },
//     },
//   ],

//   /*** END CHANGE FOR Supporting Documents --- ***/
//   /*** START CHANGE FOR Poster --- ***/
//   poster: [
//     {
//       name: String,
//       url: String,
//       uploadedAt: {
//         type: Date,
//         default: Date.now,
//       },
//     },
//   ],
//   /*** END CHANGE FOR Poster --- ***/

//   roundLink: {
//     type: String,
//     default: "",
//   },
//   roundStatus: {
//     type: String,
//     default: "Not open yet",
//   },
//   startDate: {
//     type: Date, // New field for start date
//   },
//   endDate: {
//     type: Date, // End date for the round
//   },

//   showLastDateToApply: {
//     type: Boolean,
//     default: false, // Toggle for "Show Last Date to Apply"
//   },

//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// const Pipeline = mongoose.model("Pipeline", PipelineSchema);

// module.exports = Pipeline;


 