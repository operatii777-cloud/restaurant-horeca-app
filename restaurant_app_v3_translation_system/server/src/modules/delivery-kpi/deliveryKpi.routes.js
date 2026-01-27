/**
 * S17.H - Delivery KPI Routes
 */

const express = require('express');
const router = express.Router();
const controller = require('./deliveryKpi.controller');

// All endpoints are public for now (add auth if needed)
router.get('/overview', controller.getDeliveryOverview);
router.get('/by-courier', controller.getDeliveryByCourier);
router.get('/timeseries', controller.getDeliveryTimeseries);
router.get('/hourly-heatmap', controller.getDeliveryHourlyHeatmap);

// Quick stub for /kpi endpoint (alias to /overview)
router.get('/kpi', controller.getDeliveryOverview);

module.exports = router;

