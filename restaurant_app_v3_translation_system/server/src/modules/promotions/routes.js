/**
 * Promotions Routes Aggregator
 * Aggregates routes for Happy Hour, Daily Offer, and Daily Menu
 */

const express = require('express');
const router = express.Router();

// Import sub-routes
const happyHourRoutes = require('./happy-hour/routes');
const dailyOfferRoutes = require('./daily-offer/routes');
const dailyMenuRoutes = require('./daily-menu/routes');

// Import admin routes
const adminHappyHourRoutes = require('./happy-hour/admin-routes');

// Mount sub-routes
router.use('/happyhour', happyHourRoutes);
router.use('/daily-offer', dailyOfferRoutes);
router.use('/daily-menu', dailyMenuRoutes);

// Admin endpoints for Happy Hour (mounted at /api/admin/happy-hour)
router.use('/admin/happy-hour', adminHappyHourRoutes);

// Admin endpoints for daily-menu (mounted at /api/admin/daily-menu)
// These are handled by daily-menu routes but need to be accessible at /api/admin/daily-menu
const adminDailyMenuRoutes = require('./daily-menu/routes');
router.use('/admin/daily-menu', adminDailyMenuRoutes);

module.exports = router;

