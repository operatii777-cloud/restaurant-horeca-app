// Hostess Map Routes
// Purpose: Table management and session tracking for hostess/front desk
// Created: 3 Dec 2025

const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Helper functions
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const runQuerySingle = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// ==================== TABLES ====================

// GET all tables with current session info
router.get('/tables', async (req, res) => {
  try {
    const { zone, status } = req.query;
    
    let sql = `
      SELECT 
        t.*,
        ts.id as session_id,
        ts.started_at,
        ts.covers,
        ts.server_id,
        ts.notes as session_notes,
        w.name as server_name
      FROM tables t
      LEFT JOIN table_sessions ts ON ts.table_id = t.id AND ts.status = 'OPEN'
      LEFT JOIN waiters w ON w.id = ts.server_id
      WHERE 1=1
    `;
    
    const params = [];
    if (zone) {
      sql += ` AND t.location = ?`;
      params.push(zone);
    }
    if (status) {
      sql += ` AND t.is_active = ?`;
      params.push(status === 'active' ? 1 : 0);
    }
    
    sql += ` ORDER BY t.table_number`;
    
    const tables = await runQuery(sql, params);
    
    // Map status based on session
    const mappedTables = tables.map(t => ({
      ...t,
      status: t.session_id ? 'OCCUPIED' : 'FREE'
    }));
    
    res.json({ success: true, data: mappedTables });
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ error: 'Error fetching tables' });
  }
});

// GET table statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await runQuery(`
      SELECT 
        COUNT(*) as total_tables,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_tables,
        (SELECT COUNT(*) FROM table_sessions WHERE status = 'OPEN') as occupied_tables,
        (SELECT SUM(covers) FROM table_sessions WHERE status = 'OPEN') as total_covers
      FROM tables
    `);
    
    res.json({ success: true, data: stats[0] });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Error fetching statistics' });
  }
});

// ==================== SESSIONS ====================

// POST start session (occupy table)
router.post('/sessions/start', async (req, res) => {
  try {
    const { table_id, server_id, covers, notes } = req.body;
    
    if (!table_id) {
      return res.status(400).json({ error: 'Table ID is required' });
    }
    
    // Check if table already has open session
    const existing = await runQuery(
      `SELECT id FROM table_sessions WHERE table_id = ? AND status = 'OPEN'`,
      [table_id]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Table already has an open session' });
    }
    
    const result = await runQuerySingle(
      `INSERT INTO table_sessions (table_id, started_at, server_id, covers, notes, status)
       VALUES (?, datetime('now'), ?, ?, ?, 'OPEN')`,
      [table_id, server_id || null, covers || 0, notes || null]
    );
    
    res.json({ success: true, data: { id: result.id }, message: 'Session started' });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({ error: 'Error starting session' });
  }
});

// POST close session
router.post('/sessions/:id/close', async (req, res) => {
  try {
    const { id } = req.params;
    const { pos_order_id } = req.body;
    
    const result = await runQuerySingle(
      `UPDATE table_sessions 
       SET closed_at = datetime('now'), status = 'CLOSED', pos_order_id = ?
       WHERE id = ? AND status = 'OPEN'`,
      [pos_order_id || null, id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Session not found or already closed' });
    }
    
    res.json({ success: true, message: 'Session closed' });
  } catch (error) {
    console.error('Error closing session:', error);
    res.status(500).json({ error: 'Error closing session' });
  }
});

// GET session history
router.get('/sessions', async (req, res) => {
  try {
    const { table_id, status, limit = 50 } = req.query;
    
    let sql = `
      SELECT 
        ts.*,
        t.table_number,
        t.location as zone,
        w.name as server_name
      FROM table_sessions ts
      JOIN tables t ON t.id = ts.table_id
      LEFT JOIN waiters w ON w.id = ts.server_id
      WHERE 1=1
    `;
    
    const params = [];
    if (table_id) {
      sql += ` AND ts.table_id = ?`;
      params.push(table_id);
    }
    if (status) {
      sql += ` AND ts.status = ?`;
      params.push(status);
    }
    
    sql += ` ORDER BY ts.started_at DESC LIMIT ?`;
    params.push(parseInt(limit));
    
    const sessions = await runQuery(sql, params);
    res.json({ success: true, data: sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Error fetching sessions' });
  }
});

module.exports = router;

