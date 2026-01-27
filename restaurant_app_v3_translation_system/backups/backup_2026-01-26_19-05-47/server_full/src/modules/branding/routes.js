/**
 * FAZA MT.6 - Branding Routes
 * 
 * Routes for managing tenant branding configuration.
 */

const express = require('express');
const router = express.Router();
const brandingController = require('./branding.controller');

// GET /api/config/branding - Get branding config for current tenant
router.get('/', brandingController.getBranding);

// PUT /api/config/branding - Update branding config
router.put('/', brandingController.updateBranding);

module.exports = router;

