/**
 * ✅ INPUT VALIDATION SCHEMAS - Enterprise Grade
 * Folosește express-validator pentru validare robustă
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware pentru procesare erori validare
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Date invalide',
      details: errors.array()
    });
  }
  next();
};

// ==================== VALIDATION SCHEMAS ====================

/**
 * Validare pentru creare comandă
 */
const orderValidation = [
  body('table_id').optional().isInt({ min: 1 }).withMessage('Table ID invalid'),
  body('items').isArray({ min: 1 }).withMessage('Comenzi goale - minim 1 item necesar'),
  body('items.*.productId').isInt({ min: 1 }).withMessage('Product ID invalid'),
  body('items.*.quantity').isInt({ min: 1, max: 100 }).withMessage('Quantity invalidă (1-100)'),
  body('items.*.price').isFloat({ min: 0 }).withMessage('Preț invalid (trebuie >= 0)'),
  body('payment_method').optional().isIn(['cash', 'card', 'mobile', 'voucher']).withMessage('Metodă plată invalidă'),
  body('customer_email').optional().isEmail().withMessage('Email invalid'),
  body('customer_phone').optional().matches(/^07\d{8}$/).withMessage('Telefon invalid (format: 07XXXXXXXX)'),
  body('total').isFloat({ min: 0 }).withMessage('Total invalid'),
  handleValidationErrors
];

/**
 * Validare pentru creare utilizator
 */
const userValidation = [
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username trebuie să aibă 3-50 caractere'),
  body('email').optional().isEmail().withMessage('Email invalid'),
  body('password').isLength({ min: 8 }).withMessage('Parolă minim 8 caractere'),
  body('role_id').isInt({ min: 1 }).withMessage('Role ID invalid'),
  handleValidationErrors
];

/**
 * Validare pentru update utilizator
 */
const userUpdateValidation = [
  body('username').optional().trim().isLength({ min: 3, max: 50 }).withMessage('Username trebuie să aibă 3-50 caractere'),
  body('email').optional().isEmail().withMessage('Email invalid'),
  body('role_id').optional().isInt({ min: 1 }).withMessage('Role ID invalid'),
  handleValidationErrors
];

/**
 * Validare pentru creare produs
 */
const productValidation = [
  body('name').trim().isLength({ min: 1, max: 200 }).withMessage('Nume produs invalid (1-200 caractere)'),
  body('price').isFloat({ min: 0 }).withMessage('Preț invalid (trebuie >= 0)'),
  body('category').optional().trim().isLength({ max: 100 }).withMessage('Categorie invalidă'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Descriere prea lungă (max 1000 caractere)'),
  handleValidationErrors
];

/**
 * Validare pentru creare ingredient
 */
const ingredientValidation = [
  body('name').trim().isLength({ min: 1, max: 200 }).withMessage('Nume ingredient invalid'),
  body('category').optional().trim().isLength({ max: 100 }).withMessage('Categorie invalidă'),
  body('unit').optional().isIn(['kg', 'g', 'l', 'ml', 'buc', 'pachet']).withMessage('Unități invalidă'),
  body('current_stock').optional().isFloat({ min: 0 }).withMessage('Stoc invalid (trebuie >= 0)'),
  body('min_quantity').optional().isFloat({ min: 0 }).withMessage('Stoc minim invalid (trebuie >= 0)'),
  handleValidationErrors
];

/**
 * Validare pentru ID parametru
 */
const idParamValidation = [
  param('id').isInt({ min: 1 }).withMessage('ID invalid'),
  handleValidationErrors
];

/**
 * Validare pentru MFA token
 */
const mfaTokenValidation = [
  body('token').isLength({ min: 6, max: 6 }).isNumeric().withMessage('Token MFA invalid (6 cifre)'),
  handleValidationErrors
];

/**
 * Validare pentru login
 */
const loginValidation = [
  body('username').trim().notEmpty().withMessage('Username necesar'),
  body('password').notEmpty().withMessage('Parolă necesară'),
  body('mfaToken').optional().isLength({ min: 6, max: 6 }).isNumeric().withMessage('Token MFA invalid'),
  handleValidationErrors
];

/**
 * Validare pentru filtre query
 */
const queryFiltersValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page invalid (min 1)'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit invalid (1-100)'),
  query('startDate').optional().isISO8601().withMessage('Start date invalid (ISO8601)'),
  query('endDate').optional().isISO8601().withMessage('End date invalid (ISO8601)'),
  handleValidationErrors
];

/**
 * Validare pentru export date
 */
const exportValidation = [
  query('format').isIn(['csv', 'excel', 'pdf']).withMessage('Format invalid (csv, excel, pdf)'),
  query('startDate').optional().isISO8601().withMessage('Start date invalid'),
  query('endDate').optional().isISO8601().withMessage('End date invalid'),
  handleValidationErrors
];

/**
 * Validare pentru creare customer
 */
const customerValidation = [
  body('customerName').trim().isLength({ min: 1, max: 200 }).withMessage('Nume customer invalid (1-200 caractere)'),
  body('customerCui').optional().trim().isLength({ max: 20 }).withMessage('CUI invalid (max 20 caractere)'),
  body('customerPhone').optional().matches(/^07\d{8}$/).withMessage('Telefon invalid (format: 07XXXXXXXX)'),
  body('customerEmail').optional().isEmail().withMessage('Email invalid'),
  body('customerType').optional().isIn(['individual', 'company']).withMessage('Tip customer invalid'),
  handleValidationErrors
];

/**
 * Validare pentru update customer
 */
const customerUpdateValidation = [
  body('customerName').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Nume customer invalid'),
  body('customerPhone').optional().matches(/^07\d{8}$/).withMessage('Telefon invalid'),
  body('customerEmail').optional().isEmail().withMessage('Email invalid'),
  handleValidationErrors
];

module.exports = {
  orderValidation,
  userValidation,
  userUpdateValidation,
  productValidation,
  ingredientValidation,
  idParamValidation,
  mfaTokenValidation,
  loginValidation,
  queryFiltersValidation,
  exportValidation,
  customerValidation,
  customerUpdateValidation,
  handleValidationErrors
};

