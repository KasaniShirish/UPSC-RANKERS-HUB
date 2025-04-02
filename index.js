const express = require('express'); // Import Express
const path = require('path'); // Helps with file paths

const app = express();
const PORT = process.env.PORT || 3000; // Use Render's port or 3000 locally

// Serve static files (HTML, CSS, JS) from "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
