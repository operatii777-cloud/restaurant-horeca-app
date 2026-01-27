/**
 * ENTERPRISE MODULE
 * Phase: E7 - Expiry Alerts Routes (logic migrated)
 * Original: routes/expiry-alerts.js
 */

const express = require('express');
const router = express.Router();
const controller = require('./controllers/expiry-alerts.controller');

router.get('/', controller.list);
router.post('/generate', controller.generate);
router.post('/:id/resolve', controller.resolve);

module.exports = router;
