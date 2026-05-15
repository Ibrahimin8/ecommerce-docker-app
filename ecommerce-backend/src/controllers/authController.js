const { User, Cart } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');

// Make sure these paths are correct for your project structure
const emailService = require('../service/emailService'); 
const sendEmail = require('../utils/email'); 

// 1. REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "Email already in use" });

    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Passing plain password; assuming your User model has a beforeCreate hook to hash it
    const user = await User.create({ 
      name, 
      email, 
      password, 
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

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if email is verified before allowing login
    if (!user.isVerified) {
      return res.status(403).json({ 
        message: "Please verify your email first. Check your inbox for the link!" 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

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
    if (!token) return res.status(400).json({ message: "Token is required" });

    const user = await User.findOne({ 
      where: { verificationToken: token.trim() } 
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.isVerified = true;
    user.verificationToken = null; 
    await user.save();

    res.status(200).json({ message: "Email verified successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. FORGOT PASSWORD (OTP)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ message: "No account found with this email." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); 
    await user.save();

    await sendEmail({
      email: user.email,
      subject: "Password Reset Code",
      message: `Your verification code is: ${otp}. It will expire in 10 minutes.`
    });

    res.status(200).json({ message: "OTP sent to your email!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. RESET PASSWORD (Verify OTP)
// Step 3: Final Reset in authController.js
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    const user = await User.findOne({
      where: { 
        email, 
        otpCode: otp, 
        otpExpires: { [Op.gt]: new Date() } 
      }
    });

    if (!user) return res.status(400).json({ message: "Session expired. Try again." });

    // FIX: Set the PLAIN TEXT password. 
    // The 'beforeUpdate' hook in your User model will detect the change and hash it correctly.
    user.password = newPassword; 
    
    user.otpCode = null;
    user.otpExpires = null;
    
    await user.save(); // This triggers the beforeUpdate hook

    res.status(200).json({ message: "Password updated successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const user = await User.findOne({
      where: {
        email,
        otpCode: otp,
        otpExpires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired code." });
    }

    res.status(200).json({ message: "OTP Verified. Proceed to reset." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};