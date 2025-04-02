// Import necessary modules
const express = require('express');
const cors = require('cors');
require('dotenv').config();  // To use the .env file
const authRoutes = require('./routes/auth');  // Import auth routes

// Initialize Express application
const app = express(); app.use(express.static('public'));


// Middleware
app.use(cors());  // Enable cross-origin requests
app.use(express.json());  // Parse incoming JSON data

// Use the auth routes for any requests starting with /auth
app.use('/auth', authRoutes);

// Basic route to test if the server is working
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Set server to listen on a port (5000)
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
