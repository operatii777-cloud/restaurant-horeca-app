'use strict';

/**
 * HORECA AI Engine - Routes
 * Mounted at: /api/ai
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const ctrl = require('./horeca-ai.controller');

// Memory storage for file ingestion (no disk writes)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// POST /api/ai/ingest - Accept file (multipart) or text body
router.post('/ingest', upload.single('file'), ctrl.ingest);

// POST /api/ai/extract-products - Extract products from text
router.post('/extract-products', ctrl.extractProducts);

// POST /api/ai/detect-allergens - Analyze ingredients for EU 14 allergens
router.post('/detect-allergens', ctrl.detectAllergens);

// POST /api/ai/suggest-price - Calculate price suggestion
router.post('/suggest-price', ctrl.suggestPrice);

// POST /api/ai/audit - Run health check on menu data
router.post('/audit', ctrl.audit);

// POST /api/ai/repair - Auto-fix allergens, VAT, etc.
router.post('/repair', ctrl.repair);

// GET /api/ai/market-prices - Get reference prices for ingredients
router.get('/market-prices', ctrl.marketPrices);

module.exports = router;
