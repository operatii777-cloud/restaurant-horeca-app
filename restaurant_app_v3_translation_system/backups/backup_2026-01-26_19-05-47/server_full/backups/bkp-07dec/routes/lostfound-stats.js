// Lost & Found Statistics & BI
// Purpose: Analytics endpoints for Lost & Found Dashboard
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

// GET Overview Stats
router.get('/overview', async (req, res) => {
  try {
    const { from, to } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({ error: 'from and to dates are required' });
    }
    
    const items = await runQuery(`
      SELECT status FROM lostfound_items
      WHERE DATE(found_at) >= DATE(?) AND DATE(found_at) <= DATE(?)
    `, [from, to]);
    
    const total = items.length;
    const stored = items.filter(i => i.status === 'STORED').length;
    const returned = items.filter(i => i.status === 'RETURNED').length;
    const discarded = items.filter(i => i.status === 'DISCARDED').length;
    
    res.json({ total, stored, returned, discarded });
    
  } catch (error) {
    console.error('Error computing lost&found overview:', error);
    res.status(500).json({ error: 'Failed to load overview' });
  }
});

// GET Stats by Location
router.get('/by-location', async (req, res) => {
  try {
    const { from, to } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({ error: 'from and to dates are required' });
    }
    
    const results = await runQuery(`
      SELECT 
        COALESCE(location_found, 'Necunoscut') as location,
        COUNT(*) as count
      FROM lostfound_items
      WHERE DATE(found_at) >= DATE(?) AND DATE(found_at) <= DATE(?)
      GROUP BY location_found
      ORDER BY count DESC
    `, [from, to]);
    
    res.json(results);
    
  } catch (error) {
    console.error('Error computing by-location stats:', error);
    res.status(500).json({ error: 'Failed to load by-location stats' });
  }
});

// GET Return Rate (percentage)
router.get('/return-rate', async (req, res) => {
  try {
    const { from, to } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({ error: 'from and to dates are required' });
    }
    
    const items = await runQuery(`
      SELECT status FROM lostfound_items
      WHERE DATE(found_at) >= DATE(?) AND DATE(found_at) <= DATE(?)
    `, [from, to]);
    
    const total = items.length;
    const returned = items.filter(i => i.status === 'RETURNED').length;
    const returnRate = total > 0 ? Math.round((returned / total) * 100) : 0;
    
    res.json({ 
      total, 
      returned, 
      returnRate,
      stored: items.filter(i => i.status === 'STORED').length,
      discarded: items.filter(i => i.status === 'DISCARDED').length
    });
    
  } catch (error) {
    console.error('Error computing return rate:', error);
    res.status(500).json({ error: 'Failed to compute return rate' });
  }
});

module.exports = router;

