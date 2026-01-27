/**
 * Auto Purchase Orders API Routes
 * Comenzi automate la furnizori bazate pe stoc minim
 */
const express = require('express');
const router = express.Router();
const { dbPromise } = require('../database');

// ==================== AUTO REORDER RULES ====================

// GET /api/purchase-orders/rules
router.get('/rules', async (req, res) => {
  try {
    const db = await dbPromise;
    
    const rules = await new Promise((resolve, reject) => {
      db.all(`
        SELECT arr.*, 
          i.name as ingredient_name, 
          i.current_stock,
          i.unit,
          s.name as supplier_name
        FROM auto_reorder_rules arr
        LEFT JOIN ingredients i ON arr.ingredient_id = i.id
        LEFT JOIN suppliers s ON arr.supplier_id = s.id
        ORDER BY i.name
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, rules });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/purchase-orders/rules
router.post('/rules', async (req, res) => {
  try {
    const { ingredient_id, supplier_id, reorder_point, reorder_quantity, max_stock_level, lead_time_days } = req.body;
    const db = await dbPromise;
    
    const result = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO auto_reorder_rules 
        (ingredient_id, supplier_id, reorder_point, reorder_quantity, max_stock_level, lead_time_days)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [ingredient_id, supplier_id, reorder_point, reorder_quantity, max_stock_level, lead_time_days || 1], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
    
    res.json({ success: true, ruleId: result.id });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/purchase-orders/rules/:id
router.put('/rules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { supplier_id, reorder_point, reorder_quantity, max_stock_level, lead_time_days, is_active } = req.body;
    const db = await dbPromise;
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE auto_reorder_rules 
        SET supplier_id = ?, reorder_point = ?, reorder_quantity = ?, 
            max_stock_level = ?, lead_time_days = ?, is_active = ?, updated_at = datetime('now')
        WHERE id = ?
      `, [supplier_id, reorder_point, reorder_quantity, max_stock_level, lead_time_days, is_active ? 1 : 0, id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({ success: true });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/purchase-orders/rules/:id
router.delete('/rules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM auto_reorder_rules WHERE id = ?', [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({ success: true });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== PURCHASE ORDERS ====================

// GET /api/purchase-orders
router.get('/', async (req, res) => {
  try {
    const { status, supplier_id, limit = 50 } = req.query;
    const db = await dbPromise;
    
    let sql = `
      SELECT pod.*, 
        s.name as supplier_name,
        s.email as supplier_email,
        s.phone as supplier_phone,
        (SELECT COUNT(*) FROM purchase_order_items WHERE order_id = pod.id) as item_count
      FROM purchase_order_drafts pod
      LEFT JOIN suppliers s ON pod.supplier_id = s.id
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      sql += ` AND pod.status = ?`;
      params.push(status);
    }
    
    if (supplier_id) {
      sql += ` AND pod.supplier_id = ?`;
      params.push(supplier_id);
    }
    
    sql += ` ORDER BY pod.created_at DESC LIMIT ?`;
    params.push(parseInt(limit));
    
    const orders = await new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, orders });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/purchase-orders/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    const order = await new Promise((resolve, reject) => {
      db.get(`
        SELECT pod.*, s.name as supplier_name, s.email as supplier_email
        FROM purchase_order_drafts pod
        LEFT JOIN suppliers s ON pod.supplier_id = s.id
        WHERE pod.id = ?
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Comanda nu a fost găsită' });
    }
    
    const items = await new Promise((resolve, reject) => {
      db.all(`
        SELECT poi.*, i.name as ingredient_name, i.unit as ingredient_unit
        FROM purchase_order_items poi
        LEFT JOIN ingredients i ON poi.ingredient_id = i.id
        WHERE poi.order_id = ?
      `, [id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, order, items });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/purchase-orders
router.post('/', async (req, res) => {
  try {
    const { supplier_id, items, expected_delivery, notes } = req.body;
    const db = await dbPromise;
    
    // Calculează total
    const totalValue = items.reduce((sum, item) => sum + (item.quantity * (item.unit_price || 0)), 0);
    
    // Creează comanda
    const result = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO purchase_order_drafts 
        (supplier_id, status, total_value, expected_delivery, notes, created_by)
        VALUES (?, 'draft', ?, ?, ?, ?)
      `, [supplier_id, totalValue, expected_delivery, notes, req.user?.id], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
    
    // Adaugă itemele
    for (const item of items) {
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO purchase_order_items 
          (order_id, ingredient_id, quantity, unit, unit_price, total_price)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [result.id, item.ingredient_id, item.quantity, item.unit, item.unit_price, item.quantity * (item.unit_price || 0)], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    
    res.json({ success: true, orderId: result.id });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/purchase-orders/:id/approve
router.post('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE purchase_order_drafts 
        SET status = 'approved', approved_by = ?, approved_at = datetime('now')
        WHERE id = ?
      `, [req.user?.id, id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({ success: true });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/purchase-orders/:id/send
router.post('/:id/send', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE purchase_order_drafts 
        SET status = 'sent', sent_at = datetime('now')
        WHERE id = ?
      `, [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // TODO: Trimite email la furnizor
    
    res.json({ success: true, message: 'Comanda a fost trimisă' });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/purchase-orders/:id/receive
router.post('/:id/receive', async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body; // [{ingredient_id, received_quantity}]
    const db = await dbPromise;
    
    // Actualizează cantitățile primite
    for (const item of items) {
      await new Promise((resolve, reject) => {
        db.run(`
          UPDATE purchase_order_items 
          SET received_quantity = ?
          WHERE order_id = ? AND ingredient_id = ?
        `, [item.received_quantity, id, item.ingredient_id], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      // Actualizează stocul
      await new Promise((resolve, reject) => {
        db.run(`
          UPDATE ingredients 
          SET current_stock = current_stock + ?
          WHERE id = ?
        `, [item.received_quantity, item.ingredient_id], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    
    // Marchează comanda ca primită
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE purchase_order_drafts 
        SET status = 'received', received_at = datetime('now')
        WHERE id = ?
      `, [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({ success: true });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== AUTO CHECK & GENERATE ====================

// POST /api/purchase-orders/check-reorder
// Verifică regulile și creează comenzi automate
router.post('/check-reorder', async (req, res) => {
  try {
    const db = await dbPromise;
    
    // Găsește ingrediente sub punctul de recomandă
    const triggered = await new Promise((resolve, reject) => {
      db.all(`
        SELECT arr.*, 
          i.name as ingredient_name, 
          i.current_stock,
          i.unit,
          s.name as supplier_name
        FROM auto_reorder_rules arr
        JOIN ingredients i ON arr.ingredient_id = i.id
        LEFT JOIN suppliers s ON arr.supplier_id = s.id
        WHERE arr.is_active = 1
          AND i.current_stock <= arr.reorder_point
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    if (triggered.length === 0) {
      return res.json({ success: true, message: 'Nu sunt necesare comenzi', created: 0 });
    }
    
    // Grupează pe furnizor
    const bySupplier = {};
    for (const rule of triggered) {
      const supplierId = rule.supplier_id || 'unknown';
      if (!bySupplier[supplierId]) {
        bySupplier[supplierId] = {
          supplier_id: rule.supplier_id,
          supplier_name: rule.supplier_name,
          items: []
        };
      }
      bySupplier[supplierId].items.push({
        ingredient_id: rule.ingredient_id,
        ingredient_name: rule.ingredient_name,
        quantity: rule.reorder_quantity,
        unit: rule.unit,
        current_stock: rule.current_stock,
        reorder_point: rule.reorder_point
      });
    }
    
    // Creează comenzile
    const created = [];
    for (const [supplierId, data] of Object.entries(bySupplier)) {
      if (supplierId === 'unknown') continue;
      
      const result = await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO purchase_order_drafts 
          (supplier_id, status, auto_generated, notes)
          VALUES (?, 'pending_approval', 1, 'Auto-generated based on reorder rules')
        `, [data.supplier_id], function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        });
      });
      
      for (const item of data.items) {
        await new Promise((resolve, reject) => {
          db.run(`
            INSERT INTO purchase_order_items 
            (order_id, ingredient_id, quantity, unit)
            VALUES (?, ?, ?, ?)
          `, [result.id, item.ingredient_id, item.quantity, item.unit], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
      
      created.push({
        orderId: result.id,
        supplier: data.supplier_name,
        items: data.items.length
      });
    }
    
    // Actualizează last_triggered pentru regulile folosite
    for (const rule of triggered) {
      await new Promise((resolve, reject) => {
        db.run(`
          UPDATE auto_reorder_rules SET last_triggered = datetime('now') WHERE id = ?
        `, [rule.id], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    
    res.json({ 
      success: true, 
      message: `${created.length} comenzi create`,
      orders: created
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/purchase-orders/suggestions
// Sugestii de comandă bazate pe consum
router.get('/suggestions', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const db = await dbPromise;
    
    // Analizează consumul din ultimele X zile
    const suggestions = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          i.id as ingredient_id,
          i.name as ingredient_name,
          i.current_stock,
          i.min_stock,
          i.unit,
          COALESCE(SUM(sm.quantity_out), 0) as consumed_last_period,
          COALESCE(SUM(sm.quantity_out) / ?, 0) as daily_consumption
        FROM ingredients i
        LEFT JOIN stock_moves sm ON sm.ingredient_id = i.id 
          AND sm.move_reason = 'SALE_OUT'
          AND date(sm.date) >= date('now', '-' || ? || ' days')
        WHERE i.is_available = 1
        GROUP BY i.id
        HAVING daily_consumption > 0 AND current_stock < (daily_consumption * 7)
        ORDER BY (current_stock / NULLIF(daily_consumption, 0)) ASC
      `, [days, days], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Adaugă recomandări
    const enriched = suggestions.map(s => ({
      ...s,
      days_of_stock: s.daily_consumption > 0 ? Math.floor(s.current_stock / s.daily_consumption) : 999,
      suggested_order: Math.ceil(s.daily_consumption * 14) // 2 săptămâni
    }));
    
    res.json({ success: true, suggestions: enriched });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

