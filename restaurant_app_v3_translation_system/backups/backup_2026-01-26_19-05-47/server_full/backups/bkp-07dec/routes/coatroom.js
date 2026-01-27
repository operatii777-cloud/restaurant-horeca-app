// Coatroom & Valet Routes
// Purpose: Coat check and valet ticket management
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

// Generate ticket code
const generateTicketCode = async () => {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const prefix = `C-${dateStr}-`;
  
  const lastTicket = await runQuery(
    `SELECT code FROM coatroom_tickets WHERE code LIKE ? ORDER BY id DESC LIMIT 1`,
    [`${prefix}%`]
  );
  
  if (lastTicket.length === 0) {
    return `${prefix}0001`;
  }
  
  const lastNumber = parseInt(lastTicket[0].code.split('-')[2]);
  return `${prefix}${String(lastNumber + 1).padStart(4, '0')}`;
};

// ==================== TICKETS ====================

// GET all tickets
router.get('/tickets', async (req, res) => {
  try {
    const { status, date, limit = 100 } = req.query;
    
    let sql = `SELECT * FROM coatroom_tickets WHERE 1=1`;
    const params = [];
    
    if (status) {
      sql += ` AND status = ?`;
      params.push(status);
    }
    if (date) {
      sql += ` AND DATE(created_at) = DATE(?)`;
      params.push(date);
    }
    
    sql += ` ORDER BY created_at DESC LIMIT ?`;
    params.push(parseInt(limit));
    
    const tickets = await runQuery(sql, params);
    res.json({ success: true, data: tickets });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Error fetching tickets' });
  }
});

// GET ticket by code
router.get('/tickets/:code', async (req, res) => {
  try {
    const tickets = await runQuery(
      `SELECT * FROM coatroom_tickets WHERE code = ?`,
      [req.params.code]
    );
    
    if (tickets.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json({ success: true, data: tickets[0] });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: 'Error fetching ticket' });
  }
});

// POST check-in (create ticket)
router.post('/checkin', async (req, res) => {
  try {
    const { type, customer_name, notes, photo_url, created_by } = req.body;
    
    if (!type) {
      return res.status(400).json({ error: 'Type is required' });
    }
    
    const code = await generateTicketCode();
    
    const result = await runQuerySingle(
      `INSERT INTO coatroom_tickets (code, type, customer_name, notes, photo_url, created_by, status)
       VALUES (?, ?, ?, ?, ?, ?, 'OPEN')`,
      [code, type, customer_name || null, notes || null, photo_url || null, created_by || null]
    );
    
    const ticket = await runQuery(
      `SELECT * FROM coatroom_tickets WHERE id = ?`,
      [result.id]
    );
    
    res.status(201).json({ success: true, data: ticket[0], message: 'Ticket created' });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Error creating ticket' });
  }
});

// POST check-out (close ticket)
router.post('/checkout', async (req, res) => {
  try {
    const { code, closed_by } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Ticket code is required' });
    }
    
    const result = await runQuerySingle(
      `UPDATE coatroom_tickets 
       SET closed_at = datetime('now'), status = 'CLOSED', closed_by = ?
       WHERE code = ? AND status = 'OPEN'`,
      [closed_by || null, code]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Ticket not found or already closed' });
    }
    
    const ticket = await runQuery(
      `SELECT * FROM coatroom_tickets WHERE code = ?`,
      [code]
    );
    
    res.json({ success: true, data: ticket[0], message: 'Ticket closed' });
  } catch (error) {
    console.error('Error closing ticket:', error);
    res.status(500).json({ error: 'Error closing ticket' });
  }
});

// POST mark as lost
router.post('/mark-lost', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Ticket code is required' });
    }
    
    const result = await runQuerySingle(
      `UPDATE coatroom_tickets SET status = 'LOST' WHERE code = ? AND status = 'OPEN'`,
      [code]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Ticket not found or already closed' });
    }
    
    res.json({ success: true, message: 'Ticket marked as lost' });
  } catch (error) {
    console.error('Error marking ticket as lost:', error);
    res.status(500).json({ error: 'Error marking ticket as lost' });
  }
});

// GET statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await runQuery(`
      SELECT 
        COUNT(*) as total_tickets,
        SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END) as open_tickets,
        SUM(CASE WHEN status = 'CLOSED' THEN 1 ELSE 0 END) as closed_tickets,
        SUM(CASE WHEN status = 'LOST' THEN 1 ELSE 0 END) as lost_tickets,
        SUM(CASE WHEN DATE(created_at) = DATE('now') THEN 1 ELSE 0 END) as today_tickets
      FROM coatroom_tickets
    `);
    
    res.json({ success: true, data: stats[0] });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Error fetching statistics' });
  }
});

module.exports = router;

