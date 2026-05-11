const { User, Cart } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../service/emailService');

// 1. REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "Email already in use" });

    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Remove the bcrypt.hash line from here!
    // Just pass the plain password; the Model Hook will hash it for you.
    const user = await User.create({ 
      name, 
      email, 
      password, // Plain text here -> Model Hook hashes it once
      role: role || 'user',
      verificationToken,
      isVerified: false 
    });
    
    await Cart.create({ userId: user.id });

    try {
      await emailService.sendVerificationEmail(email, verificationToken);
    } catch (mailError) {
      console.error("Non-fatal Mail Error:", mailError.message);
    }

    res.status(201).json({ message: "User registered. Check email to verify." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// 2. LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the user
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // --- ADD THE CODE HERE ---
    if (!user.isVerified) {
      return res.status(403).json({ 
        message: "Please verify your email first. Check your inbox for the link!" 
      });
    }
    // -------------------------

    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // 3. Generate Token
    if (!process.env.JWT_SECRET) {
      console.error("ERROR: JWT_SECRET is missing from .env file");
      return res.status(500).json({ message: "Internal server configuration error" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, role: user.role }
    });

  } catch (error) {
    console.error("DETAILED LOGIN CRASH:", error);
    res.status(500).json({ error: "Server error during login" });
  }
};

// 3. VERIFY EMAIL
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    console.log("Token received from Frontend:", token);

    // Find user and explicitly log it to see if Sequelize finds a match
    const user = await User.findOne({ 
      where: { verificationToken: token.trim() } // Added .trim() to be safe
    });

    if (!user) {
      console.log("No user found with that token.");
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Update and Save
    user.isVerified = true;
    user.verificationToken = null; 
    
    await user.save();
    console.log("Database updated successfully for:", user.email);

    res.status(200).json({ message: "Email verified successfully!" });
  } catch (error) {
    console.error("CRASH IN VERIFY EMAIL:", error);
    res.status(500).json({ error: error.message });
  }
};