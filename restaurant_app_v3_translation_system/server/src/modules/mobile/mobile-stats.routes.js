/**
 * MOBILE APP STATISTICS ROUTES
 */

const express = require('express');
const router = express.Router();
const mobileStatsController = require('./mobile-stats.controller');

// Middleware de autentificare (importat din server.js)
function checkAdminAuth(req, res, next) {
  // TODO: Implementare reală cu session
  req.user = { id: 1, username: 'admin', role_name: 'Super Admin' };
  next();
}

// Statistici generale
router.get('/stats/overview', checkAdminAuth, mobileStatsController.getMobileStatsOverview);

// Top 10 produse
router.get('/stats/top-products', checkAdminAuth, mobileStatsController.getTopProducts);

// Statistici pe segmente
router.get('/stats/by-segment', checkAdminAuth, mobileStatsController.getStatsBySegment);

// Statistici pe categorii
router.get('/stats/by-category', checkAdminAuth, mobileStatsController.getStatsByCategory);

// Statistici retenție
router.get('/stats/retention', checkAdminAuth, mobileStatsController.getRetentionStats);

// Dashboard complet
router.get('/dashboard', checkAdminAuth, mobileStatsController.getMobileDashboard);

module.exports = router;
