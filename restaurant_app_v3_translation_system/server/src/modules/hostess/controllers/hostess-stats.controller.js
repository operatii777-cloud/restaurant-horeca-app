/**
 * ENTERPRISE CONTROLLER
 * Phase: E8 - Hostess Stats Controller
 * Migrated from routes/hostess-stats.js
 */

const { dbPromise } = require('../../../../database');

/**
 * GET /api/stats/hostess/overview
 * Overview stats for hostess dashboard
 */
async function getHostessOverview(req, res, next) {
  try {
    const { from, to } = req.query;
    const db = await dbPromise;
    
    if (!from || !to) {
      return res.status(400).json({ error: 'from and to dates are required' });
    }
    
    const sessions = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          *,
          CAST((julianday(closed_at) - julianday(started_at)) * 1440 AS INTEGER) as duration_minutes
        FROM table_sessions
        WHERE started_at >= ? AND started_at <= ?
        AND closed_at IS NOT NULL
      `, [from, to], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    if (sessions.length === 0) {
      return res.json({
        success: true,
        totalSessions: 0,
        totalCovers: 0,
        avgDurationMinutes: 0,
        avgCoversPerSession: 0,
        period: { from, to },
        timestamp: new Date().toISOString()
      });
    }
    
    const totalSessions = sessions.length;
    const totalCovers = sessions.reduce((sum, s) => sum + (s.covers || 0), 0);
    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    
    res.json({
      success: true,
      totalSessions,
      totalCovers,
      avgDurationMinutes: Math.round(totalDuration / totalSessions) || 0,
      avgCoversPerSession: +(totalCovers / totalSessions).toFixed(2) || 0,
      period: { from, to },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error computing hostess overview:', error);
    next(error);
  }
}

/**
 * GET /api/stats/hostess/by-zone
 * Stats by zone
 */
async function getHostessByZone(req, res, next) {
  try {
    const { from, to } = req.query;
    const db = await dbPromise;
    
    if (!from || !to) {
      return res.status(400).json({ error: 'from and to dates are required' });
    }
    
    const results = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          t.location as zone,
          COUNT(ts.id) as sessions,
          SUM(ts.covers) as covers
        FROM table_sessions ts
        JOIN tables t ON t.id = ts.table_id
        WHERE ts.started_at >= ? AND ts.started_at <= ?
        GROUP BY t.location
        ORDER BY sessions DESC
      `, [from, to], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({
      success: true,
      data: results.map(r => ({
        zone: r.zone || 'General',
        sessions: r.sessions || 0,
        covers: r.covers || 0
      })),
      period: { from, to },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error computing by-zone stats:', error);
    next(error);
  }
}

/**
 * GET /api/stats/hostess/hourly
 * Hourly distribution
 */
async function getHostessHourly(req, res, next) {
  try {
    const { date } = req.query;
    const db = await dbPromise;
    
    if (!date) {
      return res.status(400).json({ error: 'date is required' });
    }
    
    const sessions = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          strftime('%H', started_at) as hour_str
        FROM table_sessions
        WHERE DATE(started_at) = DATE(?)
      `, [date], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    const buckets = Array.from({ length: 24 }, (_, h) => ({ 
      hour: h, 
      sessions: 0 
    }));
    
    sessions.forEach(s => {
      const hour = parseInt(s.hour_str);
      if (hour >= 0 && hour < 24) {
        buckets[hour].sessions += 1;
      }
    });
    
    res.json({
      success: true,
      data: buckets,
      date,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error computing hourly stats:', error);
    next(error);
  }
}

module.exports = {
  getHostessOverview,
  getHostessByZone,
  getHostessHourly
};

