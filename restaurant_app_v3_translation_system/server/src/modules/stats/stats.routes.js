/**
 * ENTERPRISE MODULE
 * Phase: E8 - Stats Routes (BI Dashboards)
 * 
 * Centralized stats routes for Enterprise BI dashboards
 */

const express = require('express');
const router = express.Router();

// Import stats controllers
const coatroomStatsController = require('../coatroom/controllers/coatroom-stats.controller');
const hostessStatsController = require('../hostess/controllers/hostess-stats.controller');
const lostfoundStatsController = require('../lostfound/controllers/lostfound-stats.controller');

// Coatroom Stats
router.get('/coatroom/overview', coatroomStatsController.getCoatroomOverview);
router.get('/coatroom/hourly', coatroomStatsController.getCoatroomHourly);
router.get('/coatroom/by-type', coatroomStatsController.getCoatroomByType);

// Hostess Stats
router.get('/hostess/overview', hostessStatsController.getHostessOverview);
router.get('/hostess/by-zone', hostessStatsController.getHostessByZone);
router.get('/hostess/hourly', hostessStatsController.getHostessHourly);

// Lost & Found Stats
router.get('/lostfound/overview', lostfoundStatsController.getLostfoundOverview);
router.get('/lostfound/by-location', lostfoundStatsController.getLostfoundByLocation);
router.get('/lostfound/return-rate', lostfoundStatsController.getLostfoundReturnRate);

// Delivery KPI (mount from delivery-kpi module)
const deliveryKpiRoutes = require('../delivery-kpi/deliveryKpi.routes');
router.use('/delivery', deliveryKpiRoutes);

module.exports = router;

