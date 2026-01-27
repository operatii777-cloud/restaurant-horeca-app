/**
 * ENTERPRISE MODULE
 * Phase: E7 - Delivery Reports Routes (logic migrated)
 * Phase: E2 - Advanced Reports Routes (added)
 * Original: routes/delivery-reports.js
 * 
 * NOTE: This includes both DELIVERY REPORTS and ADVANCED BI REPORTS.
 */

const express = require('express');
const router = express.Router();
const deliveryController = require('./controllers/delivery-reports.controller');
const advancedController = require('./controllers/advanced-reports.controller');

// Delivery Reports
router.get('/delivery-performance', deliveryController.getDeliveryPerformance);

// Advanced Reports (FAZA 2)
router.get('/sales-detailed', advancedController.generateSalesReport);
router.get('/profitability', advancedController.generateProfitabilityReport);
router.get('/customer-behavior', advancedController.generateCustomerBehaviorReport);
router.get('/time-trends', advancedController.generateTimeTrendsReport);

// Legacy compatibility (admin-advanced.html)
router.get('/admin/reports/sales-detailed', advancedController.generateSalesReport);
router.get('/admin/reports/profitability', advancedController.generateProfitabilityReport);
router.get('/admin/reports/customer-behavior', advancedController.generateCustomerBehaviorReport);
router.get('/admin/reports/time-trends', advancedController.generateTimeTrendsReport);

module.exports = router;
