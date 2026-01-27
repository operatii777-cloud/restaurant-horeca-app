/**
 * PHASE PRODUCTION-READY - Stock Alerts Routes
 * 
 * Routes pentru gestionarea alertelor de stoc minim
 */

const express = require('express');
const router = express.Router();
const stockAlertsService = require('./services/stock-alerts.service');
const { asyncHandler } = require('../../utils/error-handler');

/**
 * GET /api/stocks/alerts
 * Get all low stock alerts
 */
router.get('/alerts', asyncHandler(async (req, res) => {
  const { threshold } = req.query;
  const thresholdPercent = threshold ? parseFloat(threshold) : null;
  
  const alerts = await stockAlertsService.getLowStockAlerts(thresholdPercent);
  res.json({
    success: true,
    data: alerts,
    count: alerts.length
  });
}));

/**
 * GET /api/stocks/alerts/critical
 * Get critical stock alerts (below min_stock)
 */
router.get('/alerts/critical', asyncHandler(async (req, res) => {
  const alerts = await stockAlertsService.getCriticalAlerts();
  res.json({
    success: true,
    data: alerts,
    count: alerts.length
  });
}));

/**
 * GET /api/stocks/alerts/warning
 * Get warning stock alerts (below 1.5x min_stock)
 */
router.get('/alerts/warning', asyncHandler(async (req, res) => {
  const alerts = await stockAlertsService.getWarningAlerts();
  res.json({
    success: true,
    data: alerts,
    count: alerts.length
  });
}));

/**
 * GET /api/stocks/alerts/summary
 * Get stock alert summary (counts by level)
 */
router.get('/alerts/summary', asyncHandler(async (req, res) => {
  const summary = await stockAlertsService.getAlertSummary();
  res.json({
    success: true,
    data: summary
  });
}));

/**
 * GET /api/stocks/reorder-suggestions
 * Get reorder suggestions for low stock items
 */
router.get('/reorder-suggestions', asyncHandler(async (req, res) => {
  const { ingredient_id } = req.query;
  const suggestions = await stockAlertsService.getReorderSuggestions(
    ingredient_id ? parseInt(ingredient_id, 10) : null
  );
  res.json({
    success: true,
    data: suggestions,
    count: suggestions.length
  });
}));

module.exports = router;

