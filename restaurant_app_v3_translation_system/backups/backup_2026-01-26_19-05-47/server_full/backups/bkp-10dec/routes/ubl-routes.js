/**
 * PHASE S8.2 - Legacy UBL Routes (Wrapper)
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * PHASE S8.2 - Legacy wrapper for backward compatibility
 * All endpoints now delegate to the new e-Factura service.
 */

const express = require('express');
const router = express.Router();
const eFacturaController = require('../src/modules/fiscal/controllers/eFactura.controller');

// PHASE S8.2 - Legacy wrapper endpoints
// All routes delegate to the new e-Factura controller

/**
 * POST /api/ubl/generate
 * Legacy endpoint - delegates to /api/fiscal/invoice/generate
 */
router.post('/generate', eFacturaController.generateInvoice.bind(eFacturaController));

/**
 * GET /api/ubl/invoice/:id
 * Legacy endpoint - delegates to /api/fiscal/invoice/:id
 */
router.get('/invoice/:id', eFacturaController.getInvoice.bind(eFacturaController));

/**
 * GET /api/ubl/invoices
 * Legacy endpoint - delegates to /api/fiscal/invoices
 */
router.get('/invoices', eFacturaController.getInvoices.bind(eFacturaController));

/**
 * POST /api/ubl/invoice/:id/upload
 * Legacy endpoint - delegates to /api/fiscal/invoice/:id/upload-spv
 */
router.post('/invoice/:id/upload', eFacturaController.uploadToSPV.bind(eFacturaController));

module.exports = router;
