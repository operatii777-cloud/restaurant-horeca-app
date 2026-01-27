/**
 * ENTERPRISE MODULE (CORE)
 * Phase: E8 - Suppliers Routes (logic migrated)
 * Original: routes/suppliers.js
 */

const express = require('express');
const router = express.Router();
const controller = require('./controllers/suppliers.controller');

router.get('/', controller.getSuppliers);
router.get('/stats/summary', controller.getSupplierStats);
router.get('/category/:category', controller.getSuppliersByCategory);
router.get('/:id', controller.getSupplierById);
router.post('/', controller.createSupplier);
router.put('/:id', controller.updateSupplier);
router.delete('/:id', controller.deleteSupplier);

module.exports = router;
