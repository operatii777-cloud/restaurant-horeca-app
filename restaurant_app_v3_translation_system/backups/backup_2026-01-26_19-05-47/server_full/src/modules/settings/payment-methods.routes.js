/**
 * Payment Methods Routes
 * 
 * API routes pentru gestionarea metodelor de plată
 */

const express = require('express');
const router = express.Router();
const paymentMethodsController = require('./payment-methods.controller');

// GET /api/settings/payment-methods - List all payment methods
router.get('/', paymentMethodsController.getPaymentMethods);

// GET /api/settings/payment-methods/:id - Get payment method by ID
router.get('/:id', paymentMethodsController.getPaymentMethodById);

// POST /api/settings/payment-methods - Create new payment method
router.post('/', paymentMethodsController.createPaymentMethod);

// PUT /api/settings/payment-methods/:id - Update payment method
router.put('/:id', paymentMethodsController.updatePaymentMethod);

// DELETE /api/settings/payment-methods/:id - Delete payment method
router.delete('/:id', paymentMethodsController.deletePaymentMethod);

module.exports = router;

