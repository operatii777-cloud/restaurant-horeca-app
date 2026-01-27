/**
 * ENTERPRISE MODULE (CORE)
 * Phase: E8 - Cash Register Routes (logic migrated)
 * Original: routes/cash-register.js
 */

const express = require('express');
const router = express.Router();
const controller = require('./controllers/cash-register.controller');

router.get('/current', controller.getCurrentSession);
router.get('/sessions', controller.getSessions);
router.get('/sessions/:id', controller.getSessionById);
router.post('/open', controller.openSession);
router.post('/close', controller.closeSession);

module.exports = router;
