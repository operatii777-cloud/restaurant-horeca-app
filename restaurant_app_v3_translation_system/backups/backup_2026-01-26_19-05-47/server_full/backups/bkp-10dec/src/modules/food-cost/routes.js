/**
 * ENTERPRISE MODULE (CORE)
 * Phase: E8 - Food Cost Routes (logic migrated)
 * Original: routes/food-cost.js
 */

const express = require('express');
const router = express.Router();
const controller = require('./controllers/food-cost.controller');

router.get('/products', controller.getProducts);
router.get('/stats', controller.getStats);
router.get('/products/:id', controller.getProductById);
router.post('/suggest-price', controller.suggestPrice);

module.exports = router;
