/**
 * ENTERPRISE MODULE
 * Phase: E7 - Variance Routes (logic migrated)
 * Original: routes/variance.js
 */

const express = require('express');
const router = express.Router();
const controller = require('./controllers/variance.controller');

router.get('/daily', controller.getVarianceDaily);
router.post('/calculate', controller.calculateVariance);

module.exports = router;
