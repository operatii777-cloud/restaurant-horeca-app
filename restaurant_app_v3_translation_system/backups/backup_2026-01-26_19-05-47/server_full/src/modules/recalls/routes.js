/**
 * ENTERPRISE MODULE
 * Phase: E7 - Recalls Routes (logic migrated)
 * Original: routes/recalls.js
 */

const express = require('express');
const router = express.Router();
const controller = require('./controllers/recalls.controller');

router.get('/', controller.list);
router.post('/', controller.create);
router.post('/:id/resolve', controller.resolve);

module.exports = router;
