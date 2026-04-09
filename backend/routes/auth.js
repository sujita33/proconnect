// routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ➕ Google OAuth
// const passport = require("passport"); // REMOVED
// const passport = require("../auth/google"); // REMOVED
const admin = require("../config/firebaseAdmin");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

// ---------------------------
// REGISTER (SIGNUP)
// ---------------------------
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }

    // Strong Password Validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character."
      });
    }


    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Auto-verify if email is from a .edu.np domain
    const isEduEmail = email.endsWith(".edu.np");

    // Create user with empty name & username
    const user = new User({
      email,
      password: hashedPassword,
      name: "",
      username: `user_${Date.now()}`,
      verified: isEduEmail, // Set based on domain
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        verified: user.verified,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------------------
// LOGIN (EMAIL OR USERNAME)
// ---------------------------
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find by email or username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if banned
    if (user.status === "banned") {
      return res.status(403).json({ message: "Your account has been suspended for violating community guidelines." });
    }

    // Lazy Migration: Sync verification status
    const shouldBeVerified = user.email.endsWith(".edu.np");

    if (user.verified !== shouldBeVerified) {
      user.verified = shouldBeVerified;
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        verified: user.verified,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------------------
// GOOGLE OAUTH ROUTES
// ---------------------------

// ---------------------------
// GOOGLE OAUTH ROUTE (FIREBASE)
// ---------------------------
router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // Verify the token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email, name, picture } = decodedToken;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create a new user
      const isEduEmail = email.endsWith(".edu.np");

      user = new User({
        email,
        name: name || "",
        username: `user_${Date.now()}`, // Temporary username
        avatarUrl: picture || "",
        verified: isEduEmail, // Only verify if college email
        // password is not set (undefined)
      });
      await user.save();
      await user.save();
    } else {
      // Check existing user for verification eligibility (Grant OR Revoke)
      const shouldBeVerified = user.email.endsWith(".edu.np");
      if (user.verified !== shouldBeVerified) {
        user.verified = shouldBeVerified;
        await user.save();
      }
    }

    // Check if banned
    if (user.status === "banned") {
      return res.status(403).json({ message: "Your account has been suspended for violating community guidelines." });
    }

    // Generate JWT for our app
    const appToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        verified: user.verified,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
      token: appToken,
    });
  } catch (err) {
    console.error("❌ Google Auth error:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

module.exports = router;
