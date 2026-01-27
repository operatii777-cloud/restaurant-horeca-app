/**
 * ENTERPRISE MODULE
 * Phase: E7 - Hostess Routes (logic migrated)
 * Original: routes/hostess.js
 * 
 * NOTE: Uses bridge to original handlers. Full extraction in PHASE E8.
 */

const express = require('express');
const router = express.Router();
const controller = require('./controllers/hostess.controller');

router.get('/tables', controller.getTables);
router.get('/stats', controller.getStats);
router.post('/sessions/start', controller.startSession);
router.post('/sessions/:id/close', controller.closeSession);
router.get('/sessions', controller.getSessions);

module.exports = router;
