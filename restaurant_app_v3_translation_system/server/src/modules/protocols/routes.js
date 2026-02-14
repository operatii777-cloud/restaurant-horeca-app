/**
 * PROTOCOL ROUTES
 * API routes for protocol sales management
 * Data: 14 Februarie 2026
 */

const express = require('express');
const router = express.Router();
const protocolController = require('./controllers/protocol.controller');

// Get all protocols
router.get('/', protocolController.getAllProtocols.bind(protocolController));

// Get protocol by ID
router.get('/:id', protocolController.getProtocolById.bind(protocolController));

// Create new protocol
router.post('/', protocolController.createProtocol.bind(protocolController));

// Update protocol
router.put('/:id', protocolController.updateProtocol.bind(protocolController));

// Delete protocol
router.delete('/:id', protocolController.deleteProtocol.bind(protocolController));

// Apply protocol to order
router.post('/:id/apply-to-order', protocolController.applyProtocolToOrder.bind(protocolController));

// Generate invoice for protocol
router.post('/:id/generate-invoice', protocolController.generateInvoice.bind(protocolController));

// Get invoices for protocol
router.get('/:id/invoices', protocolController.getProtocolInvoices.bind(protocolController));

module.exports = router;
