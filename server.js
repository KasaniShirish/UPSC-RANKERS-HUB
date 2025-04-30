const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB using mongoose
mongoose.connect('mongodb://localhost:27017/authdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("✅ Connected to MongoDB");
}).catch((err) => {
  console.log("❌ Failed to connect to MongoDB", err);
});

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, "public"), { extensions: ['html'] }));

// Import the routes from auth.js
const authRoutes = require("./routes/auth");

// Use auth routes
app.use("/auth", authRoutes);

// Serve the homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Serve other pages
app.get("/forgotpassword", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "forgotpassword.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// Start the server
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});