/**
 * ENTERPRISE CONTROLLER
 * Phase: E8 - Coatroom Stats Controller
 * Migrated from routes/coatroom-stats.js
 */

const { dbPromise } = require('../../../../database');

/**
 * GET /api/stats/coatroom/overview
 * Overview stats for coatroom dashboard
 */
async function getCoatroomOverview(req, res, next) {
  try {
    const { date } = req.query;
    const db = await dbPromise;
    
    if (!date) {
      return res.status(400).json({ error: 'date is required' });
    }
    
    const tickets = await new Promise((resolve, reject) => {
      db.all(`
        SELECT status FROM coatroom_tickets
        WHERE DATE(created_at) = DATE(?)
      `, [date], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'OPEN').length;
    const closed = tickets.filter(t => t.status === 'CLOSED').length;
    const lost = tickets.filter(t => t.status === 'LOST').length;
    
    res.json({ 
      success: true,
      total, 
      open, 
      closed, 
      lost,
      date,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error computing coatroom overview:', error);
    next(error);
  }
}

/**
 * GET /api/stats/coatroom/hourly
 * Hourly distribution of tickets
 */
async function getCoatroomHourly(req, res, next) {
  try {
    const { date } = req.query;
    const db = await dbPromise;
    
    if (!date) {
      return res.status(400).json({ error: 'date is required' });
    }
    
    const tickets = await new Promise((resolve, reject) => {
      db.all(`
        SELECT strftime('%H', created_at) as hour_str
        FROM coatroom_tickets
        WHERE DATE(created_at) = DATE(?)
      `, [date], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
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

/**
 * GET /api/stats/coatroom/by-type
 * Stats by ticket type
 */
async function getCoatroomByType(req, res, next) {
  try {
    const { date } = req.query;
    const db = await dbPromise;
    
    if (!date) {
      return res.status(400).json({ error: 'date is required' });
    }
    
    const results = await new Promise((resolve, reject) => {
      db.all(`
        SELECT type, COUNT(*) as count
        FROM coatroom_tickets
        WHERE DATE(created_at) = DATE(?)
        GROUP BY type
        ORDER BY count DESC
      `, [date], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({
      success: true,
      data: results,
      date,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error computing by-type stats:', error);
    next(error);
  }
}

module.exports = {
  getCoatroomOverview,
  getCoatroomHourly,
  getCoatroomByType
};

