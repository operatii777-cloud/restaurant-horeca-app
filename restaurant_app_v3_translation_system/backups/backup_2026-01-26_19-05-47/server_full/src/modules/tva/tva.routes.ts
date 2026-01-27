/**
 * PHASE S8.4 - TVA Routes
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * API routes for TVA System v2
 */

const express = require('express');
const router = express.Router();
const controller = require('./tva.controller');

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
router.get('/rules', controller.getVatRules);

module.exports = router;


