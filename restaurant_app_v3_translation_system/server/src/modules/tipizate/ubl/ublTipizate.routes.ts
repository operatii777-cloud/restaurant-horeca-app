/**
 * PHASE S8.3 - UBL Tipizate Routes
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * API routes for UBL generation for tipizate documents
 */

const express = require('express');
const router = express.Router();
const controller = require('./ublTipizate.controller');

/**
 * POST /api/tipizate/:docType/:id/ubl
 * Generate UBL XML for a tipizate document
 */
router.post('/:docType/:id/ubl', controller.generateUBL);

/**
 * GET /api/tipizate/:docType/:id/ubl/xml
 * Get UBL XML for a tipizate document
 */
router.get('/:docType/:id/ubl/xml', controller.getUBLXml);

/**
 * GET /api/tipizate/:docType/:id/ubl/download
 * Download UBL XML for a tipizate document
 */
router.get('/:docType/:id/ubl/download', controller.downloadUBL);

module.exports = router;


