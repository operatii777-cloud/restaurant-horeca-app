/**
 * ENTERPRISE CONTROLLER
 * Phase: E8 - Lost & Found Stats Controller
 * Migrated from routes/lostfound-stats.js
 */

const { dbPromise } = require('../../../../database');

/**
 * GET /api/stats/lostfound/overview
 * Overview stats for lost & found dashboard
 */
async function getLostfoundOverview(req, res, next) {
  try {
    const { from, to } = req.query;
    const db = await dbPromise;
    
    if (!from || !to) {
      return res.status(400).json({ error: 'from and to dates are required' });
    }
    
    const items = await new Promise((resolve, reject) => {
      db.all(`
        SELECT status FROM lostfound_items
        WHERE DATE(found_at) >= DATE(?) AND DATE(found_at) <= DATE(?)
      `, [from, to], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    const total = items.length;
    const stored = items.filter(i => i.status === 'STORED').length;
    const returned = items.filter(i => i.status === 'RETURNED').length;
    const discarded = items.filter(i => i.status === 'DISCARDED').length;
    
    res.json({
      success: true,
      total,
      stored,
      returned,
      discarded,
      period: { from, to },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error computing lost&found overview:', error);
    next(error);
  }
}

/**
 * GET /api/stats/lostfound/by-location
 * Stats by location
 */
async function getLostfoundByLocation(req, res, next) {
  try {
    const { from, to } = req.query;
    const db = await dbPromise;
    
    if (!from || !to) {
      return res.status(400).json({ error: 'from and to dates are required' });
    }
    
    const results = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          COALESCE(location_found, 'Necunoscut') as location,
          COUNT(*) as count
        FROM lostfound_items
        WHERE DATE(found_at) >= DATE(?) AND DATE(found_at) <= DATE(?)
        GROUP BY location_found
        ORDER BY count DESC
      `, [from, to], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({
      success: true,
      data: results,
      period: { from, to },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error computing by-location stats:', error);
    next(error);
  }
}

/**
 * GET /api/stats/lostfound/return-rate
 * Return rate percentage
 */
async function getLostfoundReturnRate(req, res, next) {
  try {
    const { from, to } = req.query;
    const db = await dbPromise;
    
    if (!from || !to) {
      return res.status(400).json({ error: 'from and to dates are required' });
    }
    
    const items = await new Promise((resolve, reject) => {
      db.all(`
        SELECT status FROM lostfound_items
        WHERE DATE(found_at) >= DATE(?) AND DATE(found_at) <= DATE(?)
      `, [from, to], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    const total = items.length;
    const returned = items.filter(i => i.status === 'RETURNED').length;
    const returnRate = total > 0 ? Math.round((returned / total) * 100) : 0;
    
    res.json({
      success: true,
      total,
      returned,
      returnRate,
      stored: items.filter(i => i.status === 'STORED').length,
      discarded: items.filter(i => i.status === 'DISCARDED').length,
      period: { from, to },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error computing return rate:', error);
    next(error);
  }
}

module.exports = {
  getLostfoundOverview,
  getLostfoundByLocation,
  getLostfoundReturnRate
};

