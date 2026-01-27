// Lost & Found Routes
// Purpose: Lost and found items management
// Created: 3 Dec 2025
// ENTERPRISE TODO (PHASE E5): This route will be migrated to src/modules/lostfound/routes.js

const express = require('express');
const router = express.Router();
const { dbPromise } = require('../database');

// Helper functions
const runQuery = async (sql, params = []) => {
  try {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  } catch (error) {
    console.error('[Lost & Found] Database error:', error);
    throw error;
  }
};

const runQuerySingle = async (sql, params = []) => {
  try {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  } catch (error) {
    console.error('[Lost & Found] Database error:', error);
    throw error;
  }
};

// ==================== ITEMS ====================

// GET all items
router.get('/items', async (req, res) => {
  try {
    const { status, location, limit = 100 } = req.query;
    
    let sql = `SELECT * FROM lostfound_items WHERE 1=1`;
    const params = [];
    
    if (status) {
      sql += ` AND status = ?`;
      params.push(status);
    }
    if (location) {
      sql += ` AND found_location = ?`;
      params.push(location);
    }
    
    sql += ` ORDER BY found_date DESC LIMIT ?`;
    params.push(parseInt(limit));
    
    const items = await runQuery(sql, params);
    res.json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Error fetching items' });
  }
});

// GET item by ID
router.get('/items/:id', async (req, res) => {
  try {
    const items = await runQuery(
      `SELECT * FROM lostfound_items WHERE id = ?`,
      [req.params.id]
    );
    
    if (items.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json({ success: true, data: items[0] });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Error fetching item' });
  }
});

// POST create item
router.post('/items', async (req, res) => {
  try {
    const { description, found_location, found_date, found_by, photo_url, notes } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }
    
    const result = await runQuerySingle(
      `INSERT INTO lostfound_items (item_type, description, found_location, found_date, found_by, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, 'unclaimed')`,
      [
        'general', // default item_type
        description,
        found_location || null,
        found_date || new Date().toISOString().split('T')[0], // DATE format
        found_by || null,
        notes || null
      ]
    );
    
    const item = await runQuery(
      `SELECT * FROM lostfound_items WHERE id = ?`,
      [result.id]
    );
    
    res.status(201).json({ success: true, data: item[0], message: 'Item created' });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Error creating item' });
  }
});

// PUT update item
router.put('/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { description, found_location, notes } = req.body;
    
    const result = await runQuerySingle(
      `UPDATE lostfound_items 
       SET description = ?, found_location = ?, notes = ?
       WHERE id = ?`,
      [description, found_location, notes, id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    const item = await runQuery(
      `SELECT * FROM lostfound_items WHERE id = ?`,
      [id]
    );
    
    res.json({ success: true, data: item[0], message: 'Item updated' });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Error updating item' });
  }
});

// POST mark as returned
router.post('/items/:id/return', async (req, res) => {
  try {
    const { id } = req.params;
    const { returned_to } = req.body;
    
    if (!returned_to) {
      return res.status(400).json({ error: 'Returned to is required' });
    }
    
    const result = await runQuerySingle(
      `UPDATE lostfound_items 
       SET status = 'RETURNED', returned_at = datetime('now'), returned_to = ?
       WHERE id = ? AND status = 'STORED'`,
      [returned_to, id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Item not found or already processed' });
    }
    
    res.json({ success: true, message: 'Item marked as returned' });
  } catch (error) {
    console.error('Error marking item as returned:', error);
    res.status(500).json({ error: 'Error marking item as returned' });
  }
});

// POST mark as discarded
router.post('/items/:id/discard', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await runQuerySingle(
      `UPDATE lostfound_items SET status = 'DISCARDED' WHERE id = ? AND status = 'STORED'`,
      [id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Item not found or already processed' });
    }
    
    res.json({ success: true, message: 'Item marked as discarded' });
  } catch (error) {
    console.error('Error marking item as discarded:', error);
    res.status(500).json({ error: 'Error marking item as discarded' });
  }
});

// GET statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await runQuery(`
      SELECT 
        COUNT(*) as total_items,
        SUM(CASE WHEN status = 'unclaimed' OR status = 'STORED' THEN 1 ELSE 0 END) as stored_items,
        SUM(CASE WHEN status = 'claimed' OR status = 'RETURNED' THEN 1 ELSE 0 END) as returned_items,
        SUM(CASE WHEN status = 'discarded' OR status = 'DISCARDED' THEN 1 ELSE 0 END) as discarded_items,
        SUM(CASE WHEN DATE(found_date) = DATE('now') THEN 1 ELSE 0 END) as today_items
      FROM lostfound_items
    `);
    
    res.json({ success: true, data: stats[0] });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Error fetching statistics' });
  }
});

module.exports = router;

