/**
 * PHASE S12 - Payment Routes
 * 
 * Express routes for payment operations.
 */

const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');

/**
 * GET /api/payments/methods
 * Get available payment methods
 */
router.get('/methods', paymentController.getPaymentMethods.bind(paymentController));

/**
 * GET /api/payments/:id
 * Get payment by ID
 * NOTE: Must check if :id is numeric to avoid intercepting /api/reservations
 */
router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  // If id is not numeric, skip this route (let other routes handle it)
  if (isNaN(Number(id))) {
    return next(); // Skip to next route
  }
  // If numeric, proceed to payment controller
  paymentController.getPayment(req, res, next);
});

/**
 * POST /api/payments/:id/capture
 * Capture a payment
 * NOTE: Must check if :id is numeric to avoid intercepting /api/reservations
 */
router.post('/:id/capture', (req, res, next) => {
  const id = req.params.id;
  if (isNaN(Number(id))) {
    return next();
  }
  paymentController.capturePayment(req, res, next);
});

/**
 * POST /api/payments/:id/cancel
 * Cancel a payment
 * NOTE: Must check if :id is numeric to avoid intercepting /api/reservations
 */
router.post('/:id/cancel', (req, res, next) => {
  const id = req.params.id;
  if (isNaN(Number(id))) {
    return next();
  }
  paymentController.cancelPayment(req, res, next);
});

/**
 * GET /api/orders/:id/payments
 * Get all payments for an order
 */
router.get('/orders/:id/payments', paymentController.getOrderPayments.bind(paymentController));

/**
 * POST /api/orders/:id/payments
 * Create a new payment for an order
 */
router.post('/orders/:id/payments', paymentController.createPayment.bind(paymentController));

module.exports = router;

