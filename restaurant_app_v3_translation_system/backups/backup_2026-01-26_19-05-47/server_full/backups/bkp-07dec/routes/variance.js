/**
 * VARIANCE ROUTES - API pentru Variance Reports
 * Data: 03 Decembrie 2025
 */

const express = require('express');
const router = express.Router();
const VarianceService = require('../services/variance.service');

// GET variance by date
router.get('/daily', async (req, res) => {
  try {
    const { date } = req.query;
    
    const db = require('../config/database');
    
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
});

// POST calculate variance
router.post('/calculate', async (req, res) => {
  try {
    const { date, location_id } = req.body;
    
    const variances = await VarianceService.calculateDailyVariance(date, location_id);
    
    res.json({ success: true, data: variances, count: variances.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

