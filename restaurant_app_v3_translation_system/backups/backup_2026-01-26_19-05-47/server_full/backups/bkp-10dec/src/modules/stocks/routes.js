/**
 * ENTERPRISE MODULE (CORE)
 * Phase: E8 - Stocks Routes (logic migrated)
 * Original: routes/stocks.routes.js
 */
const express = require('express');
const router = express.Router();
const controller = require('./controllers/stocks.controller');

router.get('/', controller.getStocks);
router.get('/alerts/low', controller.getLowStockAlerts);
router.get('/ingredient/:ingredientId', controller.getIngredientStock);
router.get('/history/:ingredientId', controller.getStockHistory);
router.post('/adjust', controller.adjustStock);

module.exports = router;
