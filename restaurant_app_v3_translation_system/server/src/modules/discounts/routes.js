/**
 * DISCOUNT ROUTES
 * API routes for discount management
 * Data: 14 Februarie 2026
 */

const express = require('express');
const router = express.Router();
const discountController = require('./controllers/discount.controller');

// Get all discounts
router.get('/', discountController.getAllDiscounts.bind(discountController));

// Get discount by ID
router.get('/:id', discountController.getDiscountById.bind(discountController));

// Create new discount
router.post('/', discountController.createDiscount.bind(discountController));

// Update discount
router.put('/:id', discountController.updateDiscount.bind(discountController));

// Delete discount
router.delete('/:id', discountController.deleteDiscount.bind(discountController));

// Apply discount to order item
router.post('/apply-item', discountController.applyItemDiscount.bind(discountController));

// Apply discount to entire order
router.post('/apply-order', discountController.applyOrderDiscount.bind(discountController));

// Get applicable discounts for context
router.get('/applicable', discountController.getApplicableDiscounts.bind(discountController));

module.exports = router;
