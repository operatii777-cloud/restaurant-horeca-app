/**
 * PHASE S8.5 - SAF-T Routes
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * API routes for SAF-T validation
 */

const express = require('express');
const router = express.Router();
const controller = require('./saft.controller');

/**
 * POST /api/saft/validate/fiscal-receipt/:id
 * Validate fiscal receipt
 */
router.post('/validate/fiscal-receipt/:id', controller.validateFiscalReceipt);

/**
 * POST /api/saft/validate/ubl/:id
 * Validate UBL XML
 */
router.post('/validate/ubl/:id', controller.validateUBL);

/**
 * POST /api/saft/validate/tipizat/:docType/:id
 * Validate tipizate document
 */
router.post('/validate/tipizat/:docType/:id', controller.validateTipizat);

/**
 * POST /api/saft/validate/stock/:id
 * Validate stock transaction
 */
router.post('/validate/stock/:id', controller.validateStock);

/**
 * POST /api/saft/validate/payment/:id
 * Validate payment
 */
router.post('/validate/payment/:id', controller.validatePayment);

module.exports = router;


