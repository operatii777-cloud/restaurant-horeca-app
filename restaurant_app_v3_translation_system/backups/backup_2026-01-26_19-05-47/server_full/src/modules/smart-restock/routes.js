/**
 * ENTERPRISE MODULE
 * Phase: E7 - Smart Restock Routes (logic migrated)
 * Original: routes/smart-restock-v2.js
 * 
 * NOTE: This module contains complex ML-based logic that will be fully refactored in PHASE E8
 */

const express = require('express');
const router = express.Router();
const controller = require('./controllers/smart-restock.controller');

router.get('/analysis', controller.analysis);
router.post('/generate-order', controller.generateOrder);

module.exports = router;
