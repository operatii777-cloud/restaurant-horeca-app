/**
 * Daily Offer Routes
 */

const express = require('express');
const router = express.Router();
const controller = require('./daily-offer.controller');

// GET /api/daily-offer
router.get('/', controller.getDailyOffer);

// POST /api/daily-offer
router.post('/', controller.createOrUpdateDailyOffer);

// POST /api/daily-offer/check
router.post('/check', controller.checkDailyOffer);

module.exports = router;

