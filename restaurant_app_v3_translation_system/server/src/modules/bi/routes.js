/**
 * ENTERPRISE MODULE (CORE)
 * Phase: E8 - BI Routes (logic migrated)
 * Original: routes/bi-routes.js
 */

const express = require('express');
const router = express.Router();
const controller = require('./controllers/bi.controller');
const pythonDemoController = require('./controllers/python-demo.controller');

// Standard BI routes
router.get('/health', controller.getHealth);
router.get('/metrics', controller.requireAuth, controller.getMetrics);
router.get('/dashboard', controller.requireAuth, controller.getDashboard);
router.get('/kpis/:kpiId', controller.requireAuth, controller.getKPIById);
router.get('/trends', controller.requireAuth, controller.getTrends);
router.get('/config', controller.requireAuth, controller.getConfig);
router.put('/config', controller.requireAuth, controller.updateConfig);

// Python integration demo routes
router.get('/python/health', pythonDemoController.checkPythonHealth);
router.get('/python/example', pythonDemoController.getPythonExample);
router.post('/python/sentiment', pythonDemoController.analyzeSentiment);

module.exports = router;
