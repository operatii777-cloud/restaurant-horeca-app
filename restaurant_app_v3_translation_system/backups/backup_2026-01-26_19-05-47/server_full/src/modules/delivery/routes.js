/**
 * ENTERPRISE MODULE (CORE)
 * Phase: E8 - Delivery Routes (logic migrated)
 * Original: routes/delivery-orders.js
 */

const express = require('express');
const router = express.Router();
const controller = require('./controllers/delivery.controller');

// Quick stub for GET /api/orders/delivery (list all delivery orders)
router.get('/', async (req, res) => {
  try {
    // Return empty list for now
    res.json({ success: true, data: [] });
  } catch (error) {
    console.error('Error in GET /api/orders/delivery:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Apply auth middleware to protected routes
router.post('/', controller.checkAdminAuth, controller.createDeliveryOrder);
router.get('/active', controller.checkAdminAuth, controller.getActiveDeliveryOrders);
router.get('/monitor', controller.getDeliveryMonitor);
router.put('/:id/delivery-details', controller.checkAdminAuth, controller.updateDeliveryDetails);
router.get('/:id/delivery-timeline', controller.checkAdminAuth, controller.getDeliveryTimeline);

// S17.A - Dispatch Core endpoints
router.get('/queue', controller.getDeliveryQueue); // Public or with auth as needed
router.post('/assign', controller.assignCourier); // Requires auth
router.post('/:id/proof', controller.uploadDeliveryProof); // Requires auth (courier or admin)

module.exports = router;
