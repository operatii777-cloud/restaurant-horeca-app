/**
 * ENTERPRISE MODULE (CORE)
 * Phase: E8 - Stocks Routes (logic migrated)
 * Original: routes/stocks.routes.js
 */
const express = require('express');
const router = express.Router();
const controller = require('./controllers/stocks.controller');
const forecastMLController = require('./controllers/stock-forecast-ml.controller');
// PHASE PRODUCTION-READY: Stock alerts routes
const stockAlertsRoutes = require('./routes.stock-alerts');

router.get('/', controller.getStocks);
router.get('/alerts/low', controller.getLowStockAlerts);
router.get('/low-stock', controller.getLowStock); // Alias pentru compatibilitate cu admin.html
router.get('/ingredient/:ingredientId', controller.getIngredientStock);
router.get('/history/:ingredientId', controller.getStockHistory);
router.get('/movements', controller.getStockMovements); // NEW: Generic stock movements endpoint
router.post('/adjust', controller.adjustStock);

// Quick stub for /ingredients endpoint (alias to /)
router.get('/ingredients', controller.getStocks);

// GET /api/stock/finished-products - Produse finite cu stoc
// IMPORTANT: Must be BEFORE stockAlertsRoutes to avoid route conflicts
router.get('/finished-products', controller.getFinishedProducts);

// GET /api/stock/finished-products/:id - Detalii stoc produs finit
router.get('/finished-products/:id', controller.getFinishedProduct);

// POST/PUT /api/stock/finished-products - Actualizare stoc produs finit
router.post('/finished-products', controller.updateFinishedProductStock);
router.put('/finished-products/:id', controller.updateFinishedProductStock);

// ML Forecast routes (must be BEFORE stockAlertsRoutes)
router.get('/forecast-ml/compare', forecastMLController.compareForecasts);
router.get('/forecast-ml/batch', forecastMLController.getBatchForecastML);
router.get('/:id/forecast-ml', forecastMLController.getIngredientForecastML);

// PHASE PRODUCTION-READY: Mount stock alerts routes
// Mount AFTER specific routes to avoid conflicts
router.use('/', stockAlertsRoutes);

module.exports = router;
