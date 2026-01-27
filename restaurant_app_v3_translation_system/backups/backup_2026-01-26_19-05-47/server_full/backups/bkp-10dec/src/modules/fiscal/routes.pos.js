/**
 * PHASE S7.1 - POS Fiscal Routes
 * 
 * Routes for POS/KIOSK fiscalization endpoint.
 */

const express = require('express');
const router = express.Router();
const posFiscal = require('./controllers/posFiscal.controller');

/**
 * POST /api/admin/pos/fiscalize
 * Fiscalize order from POS/KIOSK
 */
router.post('/fiscalize', posFiscal.fiscalizeFromPos.bind(posFiscal));

module.exports = router;

