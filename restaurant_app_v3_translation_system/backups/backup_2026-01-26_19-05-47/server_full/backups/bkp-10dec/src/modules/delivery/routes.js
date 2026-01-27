/**
 * ENTERPRISE MODULE (CORE)
 * Phase: E8 - Delivery Routes (logic migrated)
 * Original: routes/delivery-orders.js
 */

const express = require('express');
const router = express.Router();
const controller = require('./controllers/delivery.controller');

// Apply auth middleware to protected routes
router.post('/', controller.checkAdminAuth, controller.createDeliveryOrder);
router.get('/active', controller.checkAdminAuth, controller.getActiveDeliveryOrders);
router.get('/monitor', controller.getDeliveryMonitor);
router.put('/:id/delivery-details', controller.checkAdminAuth, controller.updateDeliveryDetails);
router.get('/:id/delivery-timeline', controller.checkAdminAuth, controller.getDeliveryTimeline);

module.exports = router;
