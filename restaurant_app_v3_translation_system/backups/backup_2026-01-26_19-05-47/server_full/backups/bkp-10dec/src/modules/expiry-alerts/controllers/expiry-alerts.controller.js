/**
 * ENTERPRISE CONTROLLER
 * Phase: E7 - Logic migrated from routes/expiry-alerts.js
 */

const ExpiryService = require('../../../services/expiry.service');

async function list(req, res, next) {
  try {
    const db = require('../../../config/database');
    
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
}

async function generate(req, res, next) {
  try {
    const alerts = await ExpiryService.generateDailyAlerts();
    res.json({ success: true, data: alerts, count: alerts.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function resolve(req, res, next) {
  try {
    const { resolution_type } = req.body;
    const db = require('../../../config/database');
    
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
}

module.exports = { list, generate, resolve };
