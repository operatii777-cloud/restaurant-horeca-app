// Hostess Map Statistics & BI
// Purpose: Analytics endpoints for Hostess Dashboard
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
    
    const sessions = await runQuery(`
      SELECT 
        *,
        CAST((julianday(closed_at) - julianday(started_at)) * 1440 AS INTEGER) as duration_minutes
      FROM table_sessions
      WHERE started_at >= ? AND started_at <= ?
      AND closed_at IS NOT NULL
    `, [from, to]);
    
    if (sessions.length === 0) {
      return res.json({
        totalSessions: 0,
        totalCovers: 0,
        avgDurationMinutes: 0,
        avgCoversPerSession: 0
      });
    }
    
    const totalSessions = sessions.length;
    const totalCovers = sessions.reduce((sum, s) => sum + (s.covers || 0), 0);
    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    
    res.json({
      totalSessions,
      totalCovers,
      avgDurationMinutes: Math.round(totalDuration / totalSessions) || 0,
      avgCoversPerSession: +(totalCovers / totalSessions).toFixed(2) || 0
    });
    
  } catch (error) {
    console.error('Error computing hostess overview:', error);
    res.status(500).json({ error: 'Failed to compute overview' });
  }
});

// GET Stats by Zone
router.get('/by-zone', async (req, res) => {
  try {
    const { from, to } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({ error: 'from and to dates are required' });
    }
    
    const results = await runQuery(`
      SELECT 
        t.location as zone,
        COUNT(ts.id) as sessions,
        SUM(ts.covers) as covers
      FROM table_sessions ts
      JOIN tables t ON t.id = ts.table_id
      WHERE ts.started_at >= ? AND ts.started_at <= ?
      GROUP BY t.location
      ORDER BY sessions DESC
    `, [from, to]);
    
    res.json(results.map(r => ({
      zone: r.zone || 'General',
      sessions: r.sessions || 0,
      covers: r.covers || 0
    })));
    
  } catch (error) {
    console.error('Error computing by-zone stats:', error);
    res.status(500).json({ error: 'Failed to load by-zone stats' });
  }
});

// GET Hourly Distribution (for a specific day)
router.get('/hourly', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'date is required' });
    }
    
    const sessions = await runQuery(`
      SELECT 
        strftime('%H', started_at) as hour_str
      FROM table_sessions
      WHERE DATE(started_at) = DATE(?)
    `, [date]);
    
    // Initialize buckets for all 24 hours
    const buckets = Array.from({ length: 24 }, (_, h) => ({ 
      hour: h, 
      sessions: 0 
    }));
    
    // Count sessions per hour
    sessions.forEach(s => {
      const hour = parseInt(s.hour_str);
      if (hour >= 0 && hour < 24) {
        buckets[hour].sessions += 1;
      }
    });
    
    res.json(buckets);
    
  } catch (error) {
    console.error('Error computing hourly stats:', error);
    res.status(500).json({ error: 'Failed to load hourly stats' });
  }
});

module.exports = router;

