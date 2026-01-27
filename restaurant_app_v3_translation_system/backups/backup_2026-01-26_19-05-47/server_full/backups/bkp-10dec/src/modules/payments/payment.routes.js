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
 */
router.get('/:id', paymentController.getPayment.bind(paymentController));

/**
 * POST /api/payments/:id/capture
 * Capture a payment
 */
router.post('/:id/capture', paymentController.capturePayment.bind(paymentController));

/**
 * POST /api/payments/:id/cancel
 * Cancel a payment
 */
router.post('/:id/cancel', paymentController.cancelPayment.bind(paymentController));

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

