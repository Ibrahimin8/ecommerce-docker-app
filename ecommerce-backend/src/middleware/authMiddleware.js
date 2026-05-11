const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Verify if the user is logged in
exports.verifyToken = (req, res, next) => {
  // Check for token in Authorization header (Format: Bearer <token>)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: "Access Denied: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Contains id and role
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Verify if the user is an Admin (for Product/Category management)
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: "Require Admin Role!" });
  }
};