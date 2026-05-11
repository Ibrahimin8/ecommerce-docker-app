const { body, validationResult } = require('express-validator');

// Common function to handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  return res.status(400).json({ errors: errors.array() });
};

// Rules for Registration
exports.registerRules = [
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
  body('name').notEmpty().withMessage('Name is required'),
  validate
];

// Rules for Products
exports.productRules = [
  body('name').notEmpty().trim().escape(),
  body('price').isDecimal().withMessage('Price must be a number'),
  body('categoryId').isInt().withMessage('Valid Category ID is required'),
  validate
];