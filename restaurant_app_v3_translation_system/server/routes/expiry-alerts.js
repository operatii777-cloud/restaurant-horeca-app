/**
 * EXPIRY ALERTS ROUTES - API pentru Alerte Expirare
 * Data: 03 Decembrie 2025
 * 
 * ENTERPRISE TODO (PHASE E5): This route will be migrated to src/modules/expiry-alerts/routes.js
 */

const express = require('express');
const router = express.Router();
const ExpiryService = require('../services/expiry.service');

// GET all active alerts
router.get('/', async (req, res) => {
  try {
    const db = require('../config/database');
    
    db.all(`
      SELECT * FROM expiry_alerts 
      WHERE resolved = 0
      ORDER BY alert_level DESC, days_until_expiry ASC
    `, [], (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      res.json({ success: true, data: rows || [] });
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST generate alerts (cron job)
router.post('/generate', async (req, res) => {
  try {
    const alerts = await ExpiryService.generateDailyAlerts();
    res.json({ success: true, data: alerts, count: alerts.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST resolve alert
router.post('/:id/resolve', async (req, res) => {
  try {
    const { resolution_type } = req.body;
    
    const db = require('../config/database');
    
    db.run(`
      UPDATE expiry_alerts 
      SET resolved = 1, resolved_at = ?, resolution_type = ?
      WHERE id = ?
    `, [new Date().toISOString(), resolution_type, parseInt(req.params.id)], (err) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      res.json({ success: true, message: 'Alert resolved' });
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

