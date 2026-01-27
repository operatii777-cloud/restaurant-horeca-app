/**
 * ENTERPRISE MODULE
 * Phase: E7 - Laundry Routes (logic migrated)
 * Original: routes/laundry.js
 */

const express = require('express');
const router = express.Router();
const controller = require('./controllers/laundry.controller');

// GET /items is already defined through controller
router.get('/items', controller.getItems);
router.get('/items/:id', controller.getItemById);
router.post('/items', controller.createItem);
router.put('/items/:id', controller.updateItem);
router.post('/items/:id/wash', controller.washItem);
router.post('/items/:id/assign', controller.assignItem);
router.post('/items/:id/unassign', controller.unassignItem);
router.get('/stats', controller.getStats);
router.delete('/items/:id', controller.deleteItem);

module.exports = router;
