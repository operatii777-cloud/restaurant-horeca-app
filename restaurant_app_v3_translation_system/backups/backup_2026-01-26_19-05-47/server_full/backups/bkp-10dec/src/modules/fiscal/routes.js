/**
 * PHASE S7.2 - Fiscalizare ANAF Routes (Enterprise)
 * PHASE S7.3 - Print Queue Integration
 * 
 * Routes for fiscal receipt generation and ANAF compliance.
 */

const express = require('express');
const router = express.Router();
const fiscalizareController = require('./controllers/fiscalizare.controller');
const fiscalController = require('./controllers/fiscal.controller');
const printQueueController = require('./controllers/printQueue.controller');
const eFacturaController = require('./controllers/eFactura.controller');

// PHASE S7.3 - Start print queue worker when module loads
const PrintQueueService = require('./services/printQueue.service');
PrintQueueService.start();

// GET fiscal configuration
router.get('/config', fiscalizareController.getFiscalConfig);

// PUT update fiscal configuration
router.put('/config', fiscalizareController.updateFiscalConfig);

// POST generate fiscal receipt
router.post('/receipt', fiscalizareController.generateReceipt);

// GET fiscal receipt by ID
router.get('/receipt/:id', fiscalizareController.getReceipt);

// GET all fiscal receipts (with filters)
router.get('/receipts', fiscalizareController.getReceipts);

// POST print receipt (to fiscal printer)
router.post('/receipt/:id/print', fiscalizareController.printReceipt);

// POST cancel receipt
router.post('/receipt/:id/cancel', fiscalizareController.cancelReceipt);

// GET fiscal status (printer status) - Real status via FiscalPrinterProtocol
router.get('/status', fiscalController.getFiscalStatus.bind(fiscalController));

// GET daily Z report
router.get('/z-report', fiscalizareController.getZReport);

// POST generate Z report
router.post('/z-report', fiscalizareController.generateZReport);

// GET X report (intermediary report)
router.get('/x-report', fiscalizareController.getXReport);

// POST /api/fiscal/fiscalize-order (for backward compatibility)
router.post('/fiscalize-order', fiscalController.fiscalizeOrder.bind(fiscalController));

// ========================================
// PHASE S7.3 - Print Queue Endpoints
// ========================================
router.get('/print-jobs', printQueueController.getJobs.bind(printQueueController));
router.get('/print-jobs/status', printQueueController.getStatus.bind(printQueueController));
router.get('/print-jobs/:id', printQueueController.getJobById.bind(printQueueController));
router.post('/print-jobs/:id/retry', printQueueController.retryJob.bind(printQueueController));

// ========================================
// PHASE S8.2 - E-Factura Enterprise Endpoints
// ========================================
router.post('/invoice/generate', eFacturaController.generateInvoice.bind(eFacturaController));
router.post('/invoice/:id/upload-spv', eFacturaController.uploadToSPV.bind(eFacturaController));
router.get('/invoice/:id', eFacturaController.getInvoice.bind(eFacturaController));
router.get('/invoices', eFacturaController.getInvoices.bind(eFacturaController));
router.post('/invoice/:id/cancel', eFacturaController.cancelInvoice.bind(eFacturaController));

module.exports = router;
