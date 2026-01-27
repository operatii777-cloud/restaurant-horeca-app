/**
 * SAGA Export Routes
 */

const express = require('express');
const router = express.Router();
const controller = require('./saga-export.controller');

// POST /api/saga/export
router.post('/export', controller.exportSaga);

// GET /api/saga/history
router.get('/history', controller.getSagaHistory);

// GET /api/saga/brand-config
router.get('/brand-config', controller.getBrandConfig);

// POST /api/saga/brand-config
router.post('/brand-config', controller.saveBrandConfig);

module.exports = router;

