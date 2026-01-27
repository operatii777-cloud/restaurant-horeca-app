/**
 * ENTERPRISE MODULE
 * Phase: E7 - Lost & Found Routes (logic migrated)
 * Original: routes/lostfound.js
 */

const express = require('express');
const router = express.Router();
const controller = require('./controllers/lostfound.controller');

router.get('/items', controller.getItems);
router.get('/items/:id', controller.getItemById);
router.post('/items', controller.createItem);
router.put('/items/:id', controller.updateItem);
router.post('/items/:id/return', controller.returnItem);
router.post('/items/:id/discard', controller.discardItem);
router.get('/stats', controller.getStats);

module.exports = router;
