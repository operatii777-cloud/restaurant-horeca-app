/**
 * Admin Happy Hour Routes
 * CRUD operations for Happy Hour settings (admin interface)
 */

const express = require('express');
const router = express.Router();
const controller = require('./admin-happy-hour.controller');

// GET /api/admin/happy-hour
router.get('/', controller.getAllHappyHours);

// GET /api/admin/happy-hour/stats
router.get('/stats', controller.getHappyHourStats);

// GET /api/admin/happy-hour/stats/revenue
router.get('/stats/revenue', controller.getHappyHourRevenueStats);

// GET /api/admin/happy-hour/stats/top-products
router.get('/stats/top-products', controller.getHappyHourTopProducts);

// GET /api/admin/happy-hour/:id
router.get('/:id', controller.getHappyHourById);

// POST /api/admin/happy-hour
router.post('/', controller.createHappyHour);

// PUT /api/admin/happy-hour/:id
router.put('/:id', controller.updateHappyHour);

// PUT /api/admin/happy-hour/:id/toggle
router.put('/:id/toggle', controller.toggleHappyHourStatus);

// DELETE /api/admin/happy-hour/:id
router.delete('/:id', controller.deleteHappyHour);

module.exports = router;

