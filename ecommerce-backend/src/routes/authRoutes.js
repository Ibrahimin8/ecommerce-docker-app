const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Debugging line: If this prints undefined, the import path is wrong
console.log("Verify function check:", authController.verifyEmail);

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/verify-email', authController.verifyEmail); // Ensure this matches the export name

module.exports = router;