/**
 * Happy Hour Routes
 */

const express = require('express');
const router = express.Router();
const controller = require('./happy-hour.controller');

// GET /api/happyhour/active
router.get('/active', controller.getActiveHappyHour);

// POST /api/happyhour/calculate-discounts
router.post('/calculate-discounts', controller.calculateDiscounts);

module.exports = router;

