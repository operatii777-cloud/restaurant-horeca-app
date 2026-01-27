/**
 * PHASE S8.7 - ANAF Submit Routes
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * API routes for ANAF submission
 */

const express = require('express');
const router = express.Router();
const controller = require('./anafSubmit.controller');

/**
 * GET /api/anaf/status/:id?documentType=FACTURA
 * Get submission status
 */
router.get('/status/:id', controller.getStatus);

/**
 * POST /api/anaf/resubmit/:id
 * Resubmit failed document
 */
router.post('/resubmit/:id', controller.resubmit);

/**
 * GET /api/anaf/journal
 * Get ANAF journal entries
 */
router.get('/journal', controller.getJournal);

module.exports = router;


