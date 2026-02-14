/**
 * SERVING ORDER ROUTES
 * API routes for serving order management
 * Data: 14 Februarie 2026
 */

const express = require('express');
const router = express.Router();
const servingOrderController = require('./controllers/serving-order.controller');

// Get all groups
router.get('/groups', servingOrderController.getAllGroups.bind(servingOrderController));

// Get group by ID
router.get('/groups/:id', servingOrderController.getGroupById.bind(servingOrderController));

// Create new group
router.post('/groups', servingOrderController.createGroup.bind(servingOrderController));

// Update group
router.put('/groups/:id', servingOrderController.updateGroup.bind(servingOrderController));

// Delete group
router.delete('/groups/:id', servingOrderController.deleteGroup.bind(servingOrderController));

// Assign group to order item
router.post('/assign-item', servingOrderController.assignGroupToItem.bind(servingOrderController));

// Get order items grouped by serving order
router.get('/order/:orderId/grouped', servingOrderController.getOrderItemsGrouped.bind(servingOrderController));

module.exports = router;
