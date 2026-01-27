/**
 * Archive Routes
 */

const express = require('express');
const router = express.Router();
const controller = require('./archive.controller');

// POST /api/archive/run - Rulează arhivarea manual
router.post('/run', controller.runArchive);

// GET /api/archive/stats - Statistici arhivă
router.get('/stats', controller.getArchiveStats);

// POST /api/archive/backup - Creează backup
router.post('/backup', controller.createBackup);

// GET /api/archive/orders - Obține comenzi arhivate
router.get('/orders', controller.getArchivedOrders);

// Admin endpoints (pentru compatibilitate cu frontend)
// GET /api/admin/archive-stats
router.get('/admin/stats', controller.getAdminArchiveStats);

// POST /api/admin/archive-orders
router.post('/admin/archive-orders', controller.archiveOrdersAdmin);

// GET /api/admin/export-archived
router.get('/admin/export-archived', controller.exportArchivedOrders);

// DELETE /api/admin/delete-archived
router.delete('/admin/delete-archived', controller.deleteArchivedOrders);

module.exports = router;

