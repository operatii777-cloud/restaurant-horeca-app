/**
 * Daily Menu Routes
 */

const express = require('express');
const router = express.Router();
const controller = require('./daily-menu.controller');

// GET /api/daily-menu (public endpoint)
router.get('/', controller.getDailyMenu);

// Admin endpoints (mounted at /api/admin/daily-menu)
// POST /api/admin/daily-menu
router.post('/', controller.createOrUpdateDailyMenu);

// DELETE /api/admin/daily-menu
router.delete('/', controller.deleteDailyMenu);

// GET /api/admin/daily-menu/schedule
router.get('/schedule', controller.getDailyMenuSchedule);

// POST /api/admin/daily-menu/schedule
router.post('/schedule', controller.scheduleDailyMenu);

// DELETE /api/admin/daily-menu/schedule/:id
router.delete('/schedule/:id', controller.deleteDailyMenuSchedule);

// GET /api/admin/daily-menu/exceptions
router.get('/exceptions', controller.getDailyMenuExceptions);

// POST /api/admin/daily-menu/exception
router.post('/exception', controller.addDailyMenuException);

// DELETE /api/admin/daily-menu/exception/:id
router.delete('/exception/:id', controller.deleteDailyMenuException);

module.exports = router;

