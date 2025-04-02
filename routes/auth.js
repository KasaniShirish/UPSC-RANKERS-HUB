const express = require("express");
const router = express.Router();
const fs = require("fs");

// Load user data from data.json
let users = JSON.parse(fs.readFileSync("data.json", "utf-8"));

// Helper function to save users to data.json
const saveUsers = (users) => fs.writeFileSync("data.json", JSON.stringify(users, null, 2));

// Signup Route (POST /auth/signup)
router.post("/signup", (req, res) => {
  const { username, password } = req.body;
  console.log("🔧 Signup request for username:", username);

  if (!username || !password) {
    console.log("❌ Missing username or password");
    return res.status(400).send("Username and password are required");
  }

  if (users.find((user) => user.username === username)) {
    console.log("⚠️ User already exists:", username);
    return res.status(400).send("User already exists");
  }

  const newUser = { username, password, attempts: 0 };
  users.push(newUser);
  saveUsers(users);

  console.log("✅ New user created:", newUser);
  res.status(201).send("User created successfully");
});

// Login Route (POST /auth/login)
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  console.log("🔧 Login attempt for username:", username);

  const user = users.find((user) => user.username === username);
  if (!user || user.password !== password) {
    console.log("❌ Invalid username or password for:", username);
    return res.status(400).send("Invalid username or password");
  }

  console.log("✅ Login successful for:", username);
  res.status(200).send("Login successful");
});

// Forgot Password Route (POST /auth/forgot-password)
router.post("/forgot-password", (req, res) => {
  const { username, newPassword } = req.body;
  console.log("🔍 Reset password request for:", username);
  console.log("📌 Current users data:", users);

  if (!username || !newPassword) {
    console.log("❌ Missing username or new password");
    return res.status(400).send("Username and new password are required");
  }

  const user = users.find((user) => user.username === username);
  if (!user) {
    console.log("❌ User not found in data.json! Username:", username);
    return res.status(404).send("User not found");
  }

  if (newPassword.length < 4) {
    console.log("⚠️ New password too short for username:", username);
    return res.status(400).send("New password must be at least 4 characters long");
  }

  user.password = newPassword;
  saveUsers(users);

  console.log("✅ Password updated successfully for:", username);
  res.status(200).send("Password reset successfully");
});

module.exports = router;
