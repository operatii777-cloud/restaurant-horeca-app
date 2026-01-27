/**
 * FAZA MT.6 - Branding Routes
 * 
 * API routes for managing tenant branding.
 */

const express = require('express');
const router = express.Router();
const brandingController = require('./branding.controller');

// GET /api/config/branding - Get branding config
router.get('/', brandingController.getBranding);

// PUT /api/config/branding - Update branding config
router.put('/', brandingController.updateBranding);

// POST /api/config/branding/upload-logo - Upload logo (TODO: multer middleware)
router.post('/upload-logo', brandingController.uploadLogo);

module.exports = router;

