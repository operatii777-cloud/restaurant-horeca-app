/**
 * Queue Monitor Routes
 * 
 * API routes pentru monitorizarea cozii de comenzi
 */

const express = require('express');
const router = express.Router();
const queueMonitorController = require('./queue-monitor.controller');

// GET /api/queue/monitor - Get queue monitor status
router.get('/monitor', queueMonitorController.getQueueMonitor);

module.exports = router;

