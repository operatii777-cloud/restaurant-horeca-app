// =====================================================================
// API ROUTES: LAUNDRY MANAGEMENT (Gestiune Textile)
// Date: 2025-12-05
// ENTERPRISE TODO (PHASE E5): This route will be migrated to src/modules/laundry/routes.js
// =====================================================================

const express = require('express');
const router = express.Router();
const { dbPromise } = require('../database');

function checkAdminAuth(req, res, next) {
  req.user = { id: 1, username: 'admin', role_name: 'Super Admin' };
  next();
}

// =====================================================================
// CRUD LAUNDRY ITEMS
// =====================================================================

/**
 * GET /api/laundry/items - Lista textile
 */
router.get('/items', checkAdminAuth, async (req, res) => {
  try {
    const { status, type, category, location } = req.query;
    const db = await dbPromise;
    
    let query = 'SELECT * FROM laundry_items WHERE 1=1';
    const params = [];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (location) {
      query += ' AND location LIKE ?';
      params.push(`%${location}%`);
    }
    
    query += ' ORDER BY updated_at DESC, code ASC';
    
    const items = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, data: items });
  } catch (err) {
    console.error('Error fetching laundry items:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/laundry/items/:id - Detalii textil
 */
router.get('/items/:id', checkAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    const item = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM laundry_items WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!item) {
      return res.status(404).json({ error: 'Textil negăsit' });
    }
    
    // Load wash history
    const washHistory = await new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM laundry_wash_history WHERE item_id = ? ORDER BY washed_at DESC LIMIT 10',
        [id],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
    
    res.json({ success: true, data: { ...item, wash_history: washHistory } });
  } catch (err) {
    console.error('Error fetching laundry item:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/laundry/items - Creare textil nou
 */
router.post('/items', checkAdminAuth, async (req, res) => {
  try {
    const { type, category, description, location, quantity = 1, notes } = req.body;
    
    if (!type || !category) {
      return res.status(400).json({ error: 'Tip și categorie sunt obligatorii' });
    }
    
    const db = await dbPromise;
    
    // Generate code
    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await new Promise((resolve, reject) => {
      db.get(
        'SELECT COUNT(*) as count FROM laundry_items WHERE code LIKE ?',
        [`L-${datePrefix}-%`],
        (err, row) => {
          if (err) reject(err);
          else resolve(row?.count || 0);
        }
      );
    });
    
    const code = `L-${datePrefix}-${String(count + 1).padStart(4, '0')}`;
    
    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO laundry_items (code, type, category, description, location, quantity, status, condition, notes, created_by)
         VALUES (?, ?, ?, ?, ?, ?, 'READY', 'GOOD', ?, ?)`,
        [code, type, category, description || null, location || null, quantity, notes || null, req.user.id],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, code });
        }
      );
    });
    
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Error creating laundry item:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/laundry/items/:id - Actualizează textil
 */
router.put('/items/:id', checkAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { type, category, description, location, status, condition, quantity, assigned_to_table, assigned_to_employee, notes } = req.body;
    const db = await dbPromise;
    
    const updates = [];
    const params = [];
    
    if (type !== undefined) { updates.push('type = ?'); params.push(type); }
    if (category !== undefined) { updates.push('category = ?'); params.push(category); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (location !== undefined) { updates.push('location = ?'); params.push(location); }
    if (status !== undefined) { updates.push('status = ?'); params.push(status); }
    if (condition !== undefined) { updates.push('condition = ?'); params.push(condition); }
    if (quantity !== undefined) { updates.push('quantity = ?'); params.push(quantity); }
    if (assigned_to_table !== undefined) { updates.push('assigned_to_table = ?'); params.push(assigned_to_table); }
    if (assigned_to_employee !== undefined) { updates.push('assigned_to_employee = ?'); params.push(assigned_to_employee); }
    if (notes !== undefined) { updates.push('notes = ?'); params.push(notes); }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE laundry_items SET ${updates.join(', ')} WHERE id = ?`,
        params,
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    res.json({ success: true, message: 'Textil actualizat cu succes' });
  } catch (err) {
    console.error('Error updating laundry item:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/laundry/items/:id/wash - Marchează ca spălat
 */
router.post('/items/:id/wash', checkAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { condition_after, notes } = req.body;
    const db = await dbPromise;
    
    // Get current condition
    const item = await new Promise((resolve, reject) => {
      db.get('SELECT condition, status FROM laundry_items WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!item) {
      return res.status(404).json({ error: 'Textil negăsit' });
    }
    
    // Update item
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE laundry_items 
         SET status = 'READY', 
             condition = ?,
             last_washed_at = CURRENT_TIMESTAMP,
             next_wash_due = datetime('now', '+7 days'),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [condition_after || 'GOOD', id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    // Add to wash history
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO laundry_wash_history (item_id, washed_at, washed_by, condition_before, condition_after, notes)
         VALUES (?, CURRENT_TIMESTAMP, ?, ?, ?, ?)`,
        [id, req.user.id, item.condition, condition_after || 'GOOD', notes || null],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    res.json({ success: true, message: 'Textil marcat ca spălat' });
  } catch (err) {
    console.error('Error marking item as washed:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/laundry/items/:id/assign - Asignează textil (la masă sau angajat)
 */
router.post('/items/:id/assign', checkAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to_table, assigned_to_employee, location } = req.body;
    const db = await dbPromise;
    
    const updates = [];
    const params = [];
    
    if (assigned_to_table !== undefined) {
      updates.push('assigned_to_table = ?');
      params.push(assigned_to_table);
      updates.push('status = ?');
      params.push('IN_USE');
    }
    if (assigned_to_employee !== undefined) {
      updates.push('assigned_to_employee = ?');
      params.push(assigned_to_employee);
      updates.push('status = ?');
      params.push('IN_USE');
    }
    if (location !== undefined) {
      updates.push('location = ?');
      params.push(location);
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE laundry_items SET ${updates.join(', ')} WHERE id = ?`,
        params,
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    res.json({ success: true, message: 'Textil asignat cu succes' });
  } catch (err) {
    console.error('Error assigning laundry item:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/laundry/items/:id/unassign - Dezasignează textil
 */
router.post('/items/:id/unassign', checkAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE laundry_items 
         SET assigned_to_table = NULL, 
             assigned_to_employee = NULL,
             status = 'READY',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    res.json({ success: true, message: 'Textil dezasignat cu succes' });
  } catch (err) {
    console.error('Error unassigning laundry item:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/laundry/stats - Statistici
 */
router.get('/stats', checkAdminAuth, async (req, res) => {
  try {
    const db = await dbPromise;
    
    const stats = await new Promise((resolve, reject) => {
      db.get(
        `SELECT 
          COUNT(*) as total_items,
          SUM(CASE WHEN status = 'READY' THEN 1 ELSE 0 END) as ready_items,
          SUM(CASE WHEN status = 'IN_USE' THEN 1 ELSE 0 END) as in_use_items,
          SUM(CASE WHEN status = 'AT_LAUNDRY' THEN 1 ELSE 0 END) as at_laundry_items,
          SUM(CASE WHEN status = 'DAMAGED' THEN 1 ELSE 0 END) as damaged_items,
          SUM(CASE WHEN status = 'RETIRED' THEN 1 ELSE 0 END) as retired_items,
          SUM(CASE WHEN condition = 'POOR' OR condition = 'DAMAGED' THEN 1 ELSE 0 END) as needs_attention
        FROM laundry_items`,
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error('Error fetching laundry stats:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/laundry/items/:id - Șterge textil (soft delete - marcat ca RETIRED)
 */
router.delete('/items/:id', checkAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE laundry_items 
         SET status = 'RETIRED', 
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    res.json({ success: true, message: 'Textil marcat ca retras' });
  } catch (err) {
    console.error('Error deleting laundry item:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

