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

/**
 * POST /api/admin/pos/pay
 * Process payment from POS/KIOSK (supports split bill)
 */
router.post('/pay', posFiscal.processPayment.bind(posFiscal));

/**
 * GET /api/admin/pos/order/:orderId
 * Get order payments
 */
router.get('/order/:orderId', posFiscal.getOrderPayments.bind(posFiscal));

// FAZA 1.6 - Mount fiscal status routes
try {
  const fiscalStatusRoutes = require('./routes.fiscal-status.js');
  router.use('/fiscal', fiscalStatusRoutes);
} catch (err) {
  console.warn('⚠️  Fiscal status routes not available:', err.message);
}

module.exports = router;

