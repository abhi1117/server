const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
dotenv.config(); // Load environment variables only once
const passport = require("passport");
const passportJWT = require("./config/passportJWT");
const passportJWTUser = require("./config/passportJWTUser");
const cookieParser = require("cookie-parser");

// Connect to the database
connectDB();

const app = express();

// CORS configuration
const cors = require("cors");

// Define your deployed frontend URL (replace with the actual Render URL for your frontend)
const allowedOrigins = [
  "https://incubator.drishticps.org", // Local development
  "https://incubator-ykzb.onrender.com", // Replace with your Render frontend URL
  "https://incubator.drishticps.org",
];

const corsOptions = {
  origin: allowedOrigins, // Set allowed origins
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());

// Serve static files from the uploads directory (e.g., PDFs, images)
app.use("/uploads", express.static("uploads"));

// Define Routes
app.use("/api/superadmins", require("./routes/superadmins"));
app.use("/api/logout", require("./routes/superadmins"));
app.use("/api/organizations", require("./routes/organizations"));
app.use("/api/disableOrganization", require("./routes/disableOrganization"));
app.use("/api/admins", require("./routes/admins"));
app.use("/api/programmanagers", require("./routes/programmanagers"));
app.use("/api/forms", require("./routes/forms")); // Include the forms route
app.use("/api/evaluationForms", require("./routes/evaluationForms"));
app.use("/api/cohorts", require("./routes/cohorts"));
app.use("/api/pipelines", require("./routes/pipelines"));
app.use("/api/users", require("./routes/users"));

const path = require("path");

// Serve static files from the client/build directory
app.use(express.static(path.join(__dirname, "client", "build")));

// Handle any requests that don’t match the API routes by serving the frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
