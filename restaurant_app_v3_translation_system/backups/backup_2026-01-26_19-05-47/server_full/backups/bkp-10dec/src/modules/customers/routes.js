/**
 * ENTERPRISE MODULE (CORE)
 * Phase: E8 - Customers Routes (logic migrated)
 * Original: routes/customers.routes.js
 */

const express = require('express');
const router = express.Router();
const controller = require('./controllers/customers.controller');

router.get('/', controller.getCustomers);
router.get('/:id', controller.getCustomerById);
router.put('/:id', controller.updateCustomer);

module.exports = router;
