/**
 * ENTERPRISE MODULE (CORE)
 * Phase: E8 - Supplier Orders Routes (logic migrated)
 * Original: routes/supplier-orders.js
 */

const express = require('express');
const router = express.Router();
const controller = require('./controllers/supplier-orders.controller');

router.get('/', controller.getSupplierOrders);
router.get('/:id', controller.getSupplierOrderById);
router.post('/', controller.createSupplierOrder);
router.put('/:id', controller.updateSupplierOrder);
router.delete('/:id', controller.deleteSupplierOrder);

module.exports = router;
