/**
 * PHASE E10.1 - Fiscal Validators
 * 
 * Input validation for fiscal endpoints.
 */

const { body } = require('express-validator');

exports.fiscalize = [
  body('orderId').isInt().withMessage('Order ID must be an integer').toInt(),
  body('payment.type').isString().isIn(['CASH', 'CARD', 'VOUCHER', 'MIXED']).withMessage('Invalid payment type'),
  body('payment.amount').isFloat({ min: 0 }).withMessage('Payment amount must be a positive number').toFloat()
];

exports.cancelReceipt = [
  body('reason').isString().notEmpty().withMessage('Cancellation reason is required')
];

exports.zReport = [
  body('date').optional().isISO8601().withMessage('Date must be in ISO8601 format')
];

