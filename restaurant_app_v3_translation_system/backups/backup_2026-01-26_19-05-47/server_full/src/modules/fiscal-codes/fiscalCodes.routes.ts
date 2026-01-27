/**
 * PHASE S8.6 - Fiscal Codes Routes
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * API routes for NCM/CN fiscal codes
 */

const express = require('express');
const router = express.Router();
const controller = require('./fiscalCodes.controller');

/**
 * GET /api/fiscal-codes/search?q=tomato
 * Search NCM/CN codes
 */
router.get('/search', controller.searchFiscalCodes);

/**
 * POST /api/fiscal-codes/assign
 * Assign fiscal code to product
 */
router.post('/assign', controller.assignFiscalCode);

/**
 * GET /api/fiscal-codes/:productId
 * Get fiscal code for product
 */
router.get('/:productId', controller.getFiscalCode);

/**
 * GET /api/fiscal-codes/:productId/history
 * Get fiscal code history
 */
router.get('/:productId/history', controller.getFiscalCodeHistory);

module.exports = router;


