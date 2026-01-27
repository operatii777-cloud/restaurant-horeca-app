/**
 * ENTERPRISE MODULE (CORE)
 * Phase: E8 - Drive-Thru Routes (logic migrated)
 * Original: routes/drive-thru.js
 */

const express = require('express');
const router = express.Router();
const controller = require('./controllers/drive-thru.controller');

router.get('/', controller.getDriveThruOrders);
router.post('/', controller.checkAdminAuth, controller.createDriveThruOrder);
router.get('/queue', controller.getDriveThruQueue);
router.put('/:id/drive-thru-status', controller.checkAdminAuth, controller.updateDriveThruStatus);
router.get('/stats', controller.getDriveThruStats);
router.post('/:id/complete', controller.checkAdminAuth, controller.completeDriveThruOrder);

module.exports = router;
