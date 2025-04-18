const express = require("express");
const bcrypt = require("bcryptjs");  // Keep using bcryptjs
const User = require("../models/User");
const Razorpay = require("razorpay");

const router = express.Router();
const razorpay = new Razorpay({
  key_id: "rzp_test_jMOMbdM8BSDaac",
  key_secret: "m0Rn80OKBWPvH6hfCBwbnLSc",
});
const saltRounds = 10; // Number of rounds for bcryptjs hashing

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
    const hashedPassword = await bcrypt.hash(password, saltRounds);  // Correct usage of bcryptjs

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
  const isMatch = await bcrypt.compare(password, user.password);  // Correct usage of bcryptjs

  if (!isMatch) {
    return res.status(401).send("❌ Login failed: Invalid password.");
  }

  console.log(`✅ User logged in: ${username}`);
  res.send("✅ Login successful!");
});

// Forgot password route
router.post("/forgot-password", async (req, res) => {
  const { username, newPassword } = req.body;

  console.log("Forgot Password request received:", req.body);

  if (!username || !newPassword) {
    return res.status(400).send("❌ Missing username or new password.");
  }

  try {
    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).send("❌ User not found.");
    }

    // Hash the new password before saving
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Save the hashed password in the user's document
    user.password = hashedPassword;
    await user.save();

    console.log(`✅ Password updated for user: ${username}`);
    res.send("✅ Password reset successful!");
  } catch (err) {
    console.error("❌ Error during password reset:", err);
    res.status(500).send("❌ Server error: Could not reset password.");
  }
});

// Check if user has paid
router.post('/check-payment', async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    let user = await User.findOne({ username });

    if (!user) {
      // Automatically create a test user if not found
      user = new User({ username, password: "dummy", hasPaid: false });
      await user.save();
    }

    res.json({ hasPaid: user.hasPaid === true });
  } catch (err) {
    console.error("❌ Error checking payment status:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Confirm payment and update hasPaid to true
router.post('/confirm-payment', async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.hasPaid = true;
    await user.save();

    console.log(`✅ Payment confirmed for user: ${username}`);
    res.json({ message: '✅ Payment confirmed. Access granted!' });
  } catch (err) {
    console.error("❌ Error confirming payment:", err);
    res.status(500).json({ error: 'Server error while confirming payment.' });
  }
});

// Create Razorpay Order
router.post("/create-order", async (req, res) => {
  const amount = 799;

  const options = {
    amount: amount * 100, // convert to paise
    currency: "INR",
    receipt: `receipt_order_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error("❌ Error creating Razorpay order:", err);
    res.status(500).json({ error: "Server error: Unable to create order" });
  }
});

module.exports = router;