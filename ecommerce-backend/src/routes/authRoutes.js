const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Debugging line: If this prints undefined, the import path is wrong
console.log("Verify function check:", authController.verifyEmail);

// Forgot Password - Step 1: Send OTP to Email
router.post('/forgot-password', authController.forgotPassword);

//Step 2 : verify OTP for password reset
router.post('/verify-otp', authController.verifyOTP);

router.post('/logout', authController.logout);

// Reset Password - Step 3: Verify OTP and Change Password
router.post('/reset-password', authController.resetPassword);

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/verify-email', authController.verifyEmail); // Ensure this matches the export name

module.exports = router;