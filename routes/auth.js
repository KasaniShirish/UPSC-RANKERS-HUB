const express = require("express");
const bcryptjs = require("bcryptjs");
const router = express.Router();
const fs = require("fs");

// Load user data from data.json
let users = JSON.parse(fs.readFileSync("data.json", "utf-8"));

// Helper function to save users to data.json
const saveUsers = (users) => fs.writeFileSync("data.json", JSON.stringify(users, null, 2));

// Signup Route (POST /auth/signup)
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  console.log("🔧 Signup request for username:", username);

  if (!username || !password) {
    console.log("❌ Missing username or password");
    return res.status(400).send("Username and password are required");
  }

  // Check if the user already exists
  if (users[username]) {
    console.log("⚠️ User already exists:", username);
    return res.status(400).send("User already exists");
  }

  try {
    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);
    console.log("🔐 Hashed password:", hashedPassword);  // Log hashed password

    // Save the new user with hashed password
    users[username] = hashedPassword;
    saveUsers(users);

    console.log("✅ New user created:", { username, password: hashedPassword });
    res.status(201).send("User created successfully");
  } catch (error) {
    console.log("❌ Error hashing password:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Login Route (POST /auth/login)
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("🔧 Login attempt for username:", username);

  // Find user by username
  const hashedPassword = users[username];

  if (!hashedPassword) {
    console.log("❌ User not found for username:", username);
    return res.status(400).send("Invalid username or password");
  }

  try {
    // Compare entered password with stored hashed password
    const isMatch = await bcryptjs.compare(password, hashedPassword);
    if (!isMatch) {
      console.log("❌ Invalid password for:", username);
      return res.status(400).send("Invalid username or password");
    }

    console.log("✅ Login successful for:", username);
    res.status(200).send("Login successful");
  } catch (error) {
    console.log("❌ Error comparing passwords:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Forgot Password Route (POST /auth/forgot-password)
router.post("/forgot-password", (req, res) => {
  const { username, newPassword } = req.body;
  console.log("🔍 Reset password request for:", username);

  if (!username || !newPassword) {
    console.log("❌ Missing username or new password");
    return res.status(400).send("Username and new password are required");
  }

  const user = users[username];
  if (!user) {
    console.log("❌ User not found in data.json! Username:", username);
    return res.status(404).send("User not found");
  }

  if (newPassword.length < 4) {
    console.log("⚠️ New password too short for username:", username);
    return res.status(400).send("New password must be at least 4 characters long");
  }

  // Hash the new password before saving
  bcryptjs.hash(newPassword, 10, (err, hashedPassword) => {
    if (err) {
      console.log("❌ Error hashing password:", err);
      return res.status(500).send("Internal Server Error");
    }

    // Update the password for the user
    users[username] = hashedPassword;
    saveUsers(users);

    console.log("✅ Password updated successfully for:", username);
    res.status(200).send("Password reset successfully");
  });
});

module.exports = router;
