/**
 * PLATFORM STATISTICS ROUTES
 * 
 * Routes pentru statistici detaliate per platformă
 */

const express = require('express');
const router = express.Router();
const {
  getPlatforms,
  getPlatformOverview,
  getPlatformTrends,
  getPlatformTopProducts,
  comparePlatforms,
  getPlatformHourly,
} = require('./platform-stats.controller');

// GET /api/platform-stats/platforms - Lista platformelor cu statistici
router.get('/platforms', getPlatforms);

// GET /api/platform-stats/compare - Comparație între platforme
router.get('/compare', comparePlatforms);

// GET /api/platform-stats/:platform/overview - Overview pentru o platformă
router.get('/:platform/overview', getPlatformOverview);

// GET /api/platform-stats/:platform/trends - Trenduri pentru o platformă
router.get('/:platform/trends', getPlatformTrends);

// GET /api/platform-stats/:platform/top-products - Top produse pentru o platformă
router.get('/:platform/top-products', getPlatformTopProducts);

// GET /api/platform-stats/:platform/hourly - Statistici pe ore pentru o platformă
router.get('/:platform/hourly', getPlatformHourly);

module.exports = router;
