/**
 * ENTERPRISE MODULE
 * Phase: E7 - Technical Sheets Routes (logic migrated)
 * Original: routes/technical-sheets.js
 */

const express = require('express');
const router = express.Router();
const controller = require('./controllers/technical-sheets.controller');

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/generate', controller.generateFromRecipe);
router.post('/:id/approve-chef', controller.approveByChef);
router.post('/:id/approve-manager', controller.approveByManager);
router.post('/:id/lock', controller.lock);
router.get('/:id/pdf', controller.downloadPDF);

module.exports = router;
