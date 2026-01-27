/**
 * ENTERPRISE MODULE (CORE)
 * Phase: E8 - Labels Routes (logic migrated)
 * Original: routes/labels.js
 */

const express = require('express');
const router = express.Router();
const controller = require('./controllers/labels.controller');

router.get('/products', controller.getProducts);
router.post('/generate', controller.generateLabel);
router.post('/print-batch', controller.printBatch);

module.exports = router;

