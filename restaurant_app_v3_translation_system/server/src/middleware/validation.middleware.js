/**
 * ENTERPRISE MODULE - VALIDATION MIDDLEWARE
 * Phase: E9.7 - Input Validation with express-validator
 * 
 * Common validation schemas and error handling for all routes
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware to check validation results
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  
  next();
};

/**
 * Common validation schemas
 */
const validate = {
  // ID validation (positive integer)
  id: param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer'),
  
  // Email validation
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format'),
  
  // Password validation (min 8 chars, uppercase, lowercase, number)
  password: body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  
  // Username validation
  username: body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  
  // Date validation (ISO8601)
  date: body('date')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Invalid date format (use ISO8601)'),
  
  // Status enum validation
  status: (allowedStatuses = ['pending', 'processing', 'completed', 'cancelled']) => 
    body('status')
      .isIn(allowedStatuses)
      .withMessage(`Status must be one of: ${allowedStatuses.join(', ')}`),
  
  // Price validation (positive number)
  price: body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  // Quantity validation (positive integer)
  quantity: body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  
  // Phone number validation
  phone: body('phone')
    .optional()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .withMessage('Invalid phone number format'),
  
  // URL validation
  url: body('url')
    .optional()
    .isURL()
    .withMessage('Invalid URL format'),
  
  // Query pagination
  pagination: [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset must be a non-negative integer')
  ],
  
  // Query date range
  dateRange: [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('startDate must be a valid ISO8601 date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('endDate must be a valid ISO8601 date')
  ]
};

module.exports = {
  handleValidationErrors,
  validate
};

