// Coatroom Statistics & BI
// Purpose: Analytics endpoints for Coatroom Dashboard
// Created: 3 Dec 2025

const express = require('express');
const router = express.Router();
const db = require('../config/database');

const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// GET Overview Stats (for a specific day)
router.get('/overview', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'date is required' });
    }
    
    const tickets = await runQuery(`
      SELECT status FROM coatroom_tickets
      WHERE DATE(created_at) = DATE(?)
    `, [date]);
    
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'OPEN').length;
    const closed = tickets.filter(t => t.status === 'CLOSED').length;
    const lost = tickets.filter(t => t.status === 'LOST').length;
    
    res.json({ total, open, closed, lost });
    
  } catch (error) {
    console.error('Error computing coatroom overview:', error);
    res.status(500).json({ error: 'Failed to load overview' });
  }
});

// GET Hourly Distribution
router.get('/hourly', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'date is required' });
    }
    
    const tickets = await runQuery(`
      SELECT strftime('%H', created_at) as hour_str
      FROM coatroom_tickets
      WHERE DATE(created_at) = DATE(?)
    `, [date]);
    
    const buckets = Array.from({ length: 24 }, (_, h) => ({ 
      hour: h, 
      tickets: 0 
    }));
    
    tickets.forEach(t => {
      const hour = parseInt(t.hour_str);
      if (hour >= 0 && hour < 24) {
        buckets[hour].tickets += 1;
      }
    });
    
    res.json(buckets);
    
  } catch (error) {
    console.error('Error computing hourly stats:', error);
    res.status(500).json({ error: 'Failed to load hourly stats' });
  }
});

// GET Stats by Type
router.get('/by-type', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'date is required' });
    }
    
    const results = await runQuery(`
      SELECT type, COUNT(*) as count
      FROM coatroom_tickets
      WHERE DATE(created_at) = DATE(?)
      GROUP BY type
      ORDER BY count DESC
    `, [date]);
    
    res.json(results);
    
  } catch (error) {
    console.error('Error computing by-type stats:', error);
    res.status(500).json({ error: 'Failed to load by-type stats' });
  }
});

module.exports = router;

