/**
 * ENTERPRISE MODULE
 * Phase: E8 - Fiscal Routes
 * ANAF sync and fiscal operations
 */

const express = require('express');
const router = express.Router();
const controller = require('./fiscal.controller');

// ANAF Sync endpoints
router.get('/anaf-sync-status', controller.getAnafSyncStatus);
router.post('/retransmit-monthly', controller.retransmitMonthly);
router.post('/sync-all', controller.syncAll);

module.exports = router;

