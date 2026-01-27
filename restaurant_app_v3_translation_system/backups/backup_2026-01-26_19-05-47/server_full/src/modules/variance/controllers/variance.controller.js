/**
 * ENTERPRISE CONTROLLER
 * Phase: E7 - Logic migrated from routes/variance.js
 */

const VarianceService = require('../services/variance.service');

async function getVarianceDaily(req, res, next) {
  try {
    const { date } = req.query;
    
    const { dbPromise } = require('../../../../database');
    const db = await dbPromise;
    
    db.all(`
      SELECT * FROM stock_variance 
      WHERE variance_date = ?
      ORDER BY ABS(variance_percentage) DESC
    `, [date], (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      res.json({ success: true, data: rows || [] });
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function calculateVariance(req, res, next) {
  try {
    const { date, location_id } = req.body;
    
    const variances = await VarianceService.calculateDailyVariance(date, location_id);
    
    res.json({ success: true, data: variances, count: variances.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  getVarianceDaily,
  calculateVariance
};
