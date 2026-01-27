/**
 * PHASE S8.4 - TVA Routes
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * API routes for TVA System v2
 */

const express = require('express');
const router = express.Router();
// TVA controller is TypeScript - temporarily disabled
// const controller = require('./tva.controller');
const controller = {
  getVatRateForProduct: (req, res) => res.status(501).json({ error: 'TVA module requires TypeScript compilation' }),
  getVatBreakdown: (req, res) => res.status(501).json({ error: 'TVA module requires TypeScript compilation' }),
  getVatRates: (req, res) => res.status(501).json({ error: 'TVA module requires TypeScript compilation' }),
};

/**
 * GET /api/tva/product/:productId/rate
 * Get VAT rate for a product (optional date query param)
 */
router.get('/product/:productId/rate', controller.getVatRateForProduct);

/**
 * POST /api/tva/breakdown
 * Calculate VAT breakdown for multiple items
 */
router.post('/breakdown', controller.getVatBreakdown);

/**
 * GET /api/tva/rules
 * Get VAT rules (optional date query param)
 */
router.get('/rules', controller.getVatRates || controller.getVatBreakdown);

module.exports = router;


