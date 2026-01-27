/**
 * PHASE S8.8 - Fiscal Engine Routes
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * Unified API routes for fiscal engine
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/fiscalEngine.controller');

/**
 * POST /api/fiscal-engine/fiscalize
 * Fiscalize order
 */
router.post('/fiscalize', controller.fiscalize);

/**
 * POST /api/fiscal-engine/ubl
 * Generate UBL
 */
router.post('/ubl', controller.generateUBL);

/**
 * POST /api/fiscal-engine/submit-anaf
 * Submit document to ANAF
 */
router.post('/submit-anaf', controller.submitANAF);

/**
 * GET /api/fiscal-engine/status
 * Get fiscal engine status
 */
router.get('/status', controller.getStatus);

module.exports = router;


