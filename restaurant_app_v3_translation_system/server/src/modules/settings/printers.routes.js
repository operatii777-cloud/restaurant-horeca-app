/**
 * Printers Routes
 * 
 * API routes pentru gestionarea imprimantelor
 */

const express = require('express');
const router = express.Router();
const printersController = require('./printers.controller');

// GET /api/settings/printers - List all printers
router.get('/', printersController.getPrinters);

// GET /api/settings/printers/:id - Get printer by ID
router.get('/:id', printersController.getPrinterById);

// POST /api/settings/printers - Create new printer
router.post('/', printersController.createPrinter);

// PUT /api/settings/printers/:id - Update printer
router.put('/:id', printersController.updatePrinter);

// DELETE /api/settings/printers/:id - Delete printer
router.delete('/:id', printersController.deletePrinter);

// POST /api/settings/printers/:id/test - Test print
router.post('/:id/test', printersController.testPrint);

module.exports = router;

