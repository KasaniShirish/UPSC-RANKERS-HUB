// Import necessary modules
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Added for MongoDB connection
require('dotenv').config();  // To use the .env file
const authRoutes = require('./routes/auth');  // Import auth routes

// Initialize Express application
const app = express();
app.use(express.static('public'));

// Middleware
app.use(cors());  // Enable cross-origin requests
app.use(express.json());  // Parse incoming JSON data

// Use the auth routes for any requests starting with /auth
app.use('/auth', authRoutes);

// Basic route to test if the server is working
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// MongoDB connection using MONGO_URI from .env
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

// Set server to listen on a port (default 3000)
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});