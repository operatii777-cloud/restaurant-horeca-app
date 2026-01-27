/**
 * ENTERPRISE MODULE
 * Phase: E7 - Portions Routes (logic migrated)
 * Original: routes/portions.js
 */

const express = require('express');
const router = express.Router();
const controller = require('./controllers/portions.controller');

router.get('/', controller.list);
router.get('/product/:productId', controller.getByProduct);
router.post('/', controller.create);
router.post('/recalculate/:productId', controller.recalculate);

module.exports = router;
