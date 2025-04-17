const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;

// Load or initialize user data
let users = {};
const dataFilePath = path.join(__dirname, "data.json");
if (fs.existsSync(dataFilePath)) {
    users = JSON.parse(fs.readFileSync(dataFilePath));
}

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, "public"), { extensions: ['html'] }));

// Route to serve index.html as the default page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Serve forgotpassword.html
app.get("/forgotpassword", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "forgotpassword.html"));
});

// Handle signup POST route
app.post("/auth/signup", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send("❌ Signup failed: Missing username or password.");
    }

    if (users[username]) {
        return res.status(400).send("❌ Signup failed: Username already exists.");
    }

    users[username] = password;

    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(users, null, 2));
        console.log(`✅ New user signed up: ${username}`);
        res.send("✅ Signup successful! Please log in.");
    } catch (err) {
        console.error("❌ Failed to save user data:", err);
        res.status(500).send("❌ Server error: Could not save data.");
    }
});

// Handle login POST route
app.post("/auth/login", (req, res) => {
    const { username, password } = req.body;
    console.log("🔍 Login attempt:", { username, password });

    if (users[username] && users[username] === password) {
        console.log(`✅ User logged in: ${username}`);
        res.redirect("/dashboard"); 
    } else {
        console.log("❌ Invalid credentials", { storedPassword: users[username], enteredPassword: password });
        res.status(401).send("❌ Login failed: Invalid credentials.");
    }
});

// Serve the dashboard page after login
app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// Handle forgot password POST route
app.post("/auth/forgot-password", (req, res) => {
    const { username, newPassword } = req.body;

    if (users[username]) {
        users[username] = newPassword;
        try {
            fs.writeFileSync(dataFilePath, JSON.stringify(users, null, 2));
            console.log(`🔑 Password reset for: ${username}`);
            res.send("✅ Password reset successful! Please log in with your new password.");
        } catch (err) {
            console.error("❌ Failed to save new password:", err);
            res.status(500).send("❌ Server error: Could not reset password.");
        }
    } else {
        res.status(404).send("❌ Username not found.");
    }
});

// Serve the test page
app.get("/test", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "test.html"));
});

// Start the server
app.listen(port, () => console.log(`✅ Server running on port ${port}`));
