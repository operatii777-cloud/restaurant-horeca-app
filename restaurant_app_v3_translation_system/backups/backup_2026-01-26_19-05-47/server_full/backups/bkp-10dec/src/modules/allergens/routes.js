/**
 * ENTERPRISE MODULE (CORE)
 * Phase: E8 - Allergens Routes (logic migrated)
 * Original: routes/allergens.routes.js
 */

const express = require('express');
const router = express.Router();
const controller = require('./controllers/allergens.controller');

router.get('/', controller.getAllergens);
router.get('/:id', controller.getAllergenById);
router.post('/', controller.createAllergen);
router.put('/:id', controller.updateAllergen);
router.delete('/:id', controller.deleteAllergen);

module.exports = router;
