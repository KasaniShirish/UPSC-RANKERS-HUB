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

// Handle test submission and score calculation
app.post("/submit-test", (req, res) => {
    const { answers } = req.body;  // This should contain all 50 answers
    const correctAnswers = {
        q1: 'Article 123',
        q2: 'Allow non-resident Indians to vote online',
        q3: 'Jail and fine',
        q4: 'International Monetary Fund',
        q5: 'All of the above',
        q6: 'UAE',
        q7: 'India',
        q8: 'Absorb and store carbon dioxide',
        q9: 'Gujarat',
        q10: 'Delhi',
        q11: 'Solar flares and their impact on Earth',
        q12: 'Conducts electricity without resistance at room temperature',
        q13: 'Developing software solutions for societal problems',
        q14: 'Strengthening agricultural infrastructure',
        q15: 'Madhya Pradesh',
        q16: 'Wildlife Protection Act',
        q17: 'Supreme Court of India',
        q18: 'Reduce carbon emissions',
        q19: 'Infrastructure development',
        q20: 'Maharashtra',
        q21: 'India Semiconductor Mission',
        q22: 'India\'s first crewed spaceflight',
        q23: 'Mahanadi Wetlands Conservation Program',
        q24: 'Strengthening supply chains between continents',
        q25: 'Digital identity verification at airports',
        q26: 'Hypersonic speed capabilities',
        q27: 'Renewable energy collaboration',
        q28: 'Offer a government-backed cryptocurrency alternative',
        q29: 'Encouraging sustainable lifestyle practices',
        q30: 'Expand nuclear energy capacity in Tamil Nadu',
        q31: 'Developing sustainable tourism in border regions',
        q32: 'Making India self-reliant in semiconductor technology',
        q33: 'Ministry of Electronics and IT',
        q34: 'Sustainable waste management solutions',
        q35: 'Next-generation railway safety system',
        q36: 'Coastal community welfare programs',
        q37: 'Stricter penalties for misleading advertisements',
        q38: 'Strengthening national identity through education',
        q39: 'Establish a unified energy distribution network',
        q40: 'Rajasthan',
        q41: 'Developing indigenous AI cloud services',
        q42: 'Gujarat',
        q43: 'Enhancing counter-piracy operations',
        q44: 'Deploy a rover for deep subsurface lunar exploration',
        q45: 'Ladakh',
        q46: 'AI-based motion sensors',
        q47: 'Fund climate-friendly infrastructure projects',
        q48: 'All of the above',
        q49: 'Reduce carbon emissions from Indian ports and vessels',
        q50: 'All of the above'
    };
    

    let score = 0;

    // Check each answer
    answers.forEach((answer, index) => {
        if (answer.answer === correctAnswers[index].correctAnswer) {
            score++;
        }
    });

    console.log(`✅ Score calculated: ${score} out of 50`);

    // Send the score back to the frontend
    res.status(200).json({ score, totalQuestions: 50 });
});

// Start the server
app.listen(port, () => console.log(`✅ Server running on port ${port}`));
