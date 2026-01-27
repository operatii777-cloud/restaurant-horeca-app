/**
 * ENTERPRISE MODULE (CORE)
 * Phase: E8 - Orders Routes (logic migrated)
 * Original: routes/delivery-cancellations.js
 */

const express = require('express');
const router = express.Router();
const controller = require('./controllers/orders.controller');

// Apply auth middleware to all routes
router.use(controller.checkAdminAuth);

router.post('/:id/cancel-delivery', controller.cancelDelivery);
router.get('/cancellations', controller.getCancellations);
router.put('/cancellations/:id/approve', controller.approveCancellation);

module.exports = router;
