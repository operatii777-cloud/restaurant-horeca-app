/**
 * ENTERPRISE MODULE
 * Phase: E7 - Delivery Reports Routes (logic migrated)
 * Original: routes/delivery-reports.js
 * 
 * NOTE: This is for DELIVERY REPORTS only, not BI reports.
 */

const express = require('express');
const router = express.Router();
const controller = require('./controllers/delivery-reports.controller');

router.get('/delivery-performance', controller.getDeliveryPerformance);

module.exports = router;
