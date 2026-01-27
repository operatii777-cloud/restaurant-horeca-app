/**
 * MARKETING MODULE - Routes
 * Segmentare automată clienți și gestiune campanii de marketing
 */

const express = require('express');
const router = express.Router();
const controller = require('./marketing.controller');

// POST /api/marketing/auto-segment - Segmentare automată
router.post('/auto-segment', controller.autoSegment);

// GET /api/marketing/segments - Listă segmente
router.get('/segments', controller.getSegments);

// GET /api/marketing/segments/:id/customers - Clienți dintr-un segment
router.get('/segments/:id/customers', controller.getSegmentCustomers);

// GET /api/marketing/campaigns - Listă campanii
router.get('/campaigns', controller.getCampaigns);

// POST /api/marketing/campaigns - Creare campanie
router.post('/campaigns', controller.createCampaign);

module.exports = router;

