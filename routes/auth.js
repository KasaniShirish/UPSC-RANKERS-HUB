const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const router = express.Router();
const saltRounds = 10; // Number of rounds for bcrypt hashing

// ✅ Signup Route (Only username + password)
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  console.log("Signup request received:", req.body);

  if (!username || !password) {
    return res.status(400).send("❌ Missing username or password.");
  }

  const existingUser = await User.findOne({ username });

  if (existingUser) {
    return res.status(400).send("❌ Username already exists.");
  }

  try {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create a new user with the hashed password
    const user = new User({ username, password: hashedPassword });
    await user.save();

    console.log(`✅ New user signed up: ${username}`);
    res.send("✅ Signup successful! Please log in.");
  } catch (err) {
    console.error("❌ Failed to save user data:", err);
    res.status(500).send("❌ Server error: Could not save user.");
  }
});

// ✅ Login Route (Only username + password)
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  console.log("Login request received:", req.body);

  const user = await User.findOne({ username });

  if (!user) {
    return res.status(401).send("❌ Login failed: Invalid username.");
  }

  // Compare the entered password with the stored hashed password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).send("❌ Login failed: Invalid password.");
  }

  console.log(`✅ User logged in: ${username}`);
  res.send("✅ Login successful!");
});

module.exports = router;
