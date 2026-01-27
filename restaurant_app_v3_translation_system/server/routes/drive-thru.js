// =====================================================================
// API ROUTES: DRIVE-THRU
// Date: 2025-12-05
// =====================================================================

const express = require('express');
const router = express.Router();
const { dbPromise } = require('../database');
const { ORDER_SOURCE } = require('../orders/unifiedOrderService');

// Middleware
function checkAdminAuth(req, res, next) {
  req.user = { id: 1, username: 'admin', role_name: 'Super Admin' };
  next();
}

// =====================================================================
// COMENZI DRIVE-THRU
// =====================================================================

/**
 * POST /api/orders/drive-thru - Creare comandă drive-thru
 */
router.post('/', checkAdminAuth, async (req, res) => {
  try {
    const {
      car_plate, lane_number, items, total, payment_method, notes
    } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Produse sunt obligatorii' });
    }
    
    const db = await dbPromise;
    
    // Verifică plata (drive-thru necesită plată instant)
    if (!payment_method) {
      return res.status(400).json({ error: 'Metoda de plată este obligatorie pentru drive-thru' });
    }
    
    // Creează comanda
    const orderId = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO orders (
          type, order_source, car_plate, lane_number,
          items, total, payment_method,
          status, general_notes, timestamp, is_paid,
          arrived_at, ordered_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, datetime('now'), datetime('now'))
      `, [
        'drive_thru', ORDER_SOURCE.DRIVE_THRU, car_plate || null, lane_number || 'A1',
        JSON.stringify(items), total, payment_method,
        'pending', notes || null, 1 // is_paid = 1 (plătită instant)
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
    
    // Emit Socket.io event
    if (global.io) {
      global.io.emit('drivethru:new-order', {
        orderId,
        laneNumber: lane_number || 'A1',
        carPlate: car_plate,
        total,
        timestamp: new Date()
      });
      
      // Emit la KDS
      global.io.emit('order:new', { orderId, type: 'drive_thru', items });
    }
    
    res.json({ 
      success: true, 
      order_id: orderId, 
      message: 'Comandă drive-thru creată cu succes' 
    });
  } catch (err) {
    console.error('Error creating drive-thru order:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/orders/drive-thru/queue - Coadă drive-thru (toate comenzile active)
 */
router.get('/queue', async (req, res) => {
  try {
    const db = await dbPromise;
    
    const orders = await new Promise((resolve, reject) => {
      db.all(`
        SELECT *,
          CAST((julianday('now') - julianday(ordered_at)) * 24 * 60 AS INTEGER) as wait_time_minutes
        FROM orders
        WHERE order_source = 'DRIVE_THRU'
          AND status NOT IN ('delivered', 'cancelled', 'paid', 'served')
        ORDER BY 
          CASE status
            WHEN 'completed' THEN 1
            WHEN 'preparing' THEN 2
            WHEN 'pending' THEN 3
            ELSE 4
          END,
          ordered_at ASC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    // Parse items pentru fiecare comandă
    const ordersWithItems = orders.map(order => {
      let items = [];
      try {
        items = JSON.parse(order.items || '[]');
      } catch (e) {
        items = [];
      }
      return { ...order, items };
    });
    
    res.json({ success: true, orders: ordersWithItems, count: ordersWithItems.length });
  } catch (err) {
    console.error('Error fetching drive-thru queue:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/orders/:id/drive-thru-status - Actualizează status drive-thru
 */
router.put('/:id/drive-thru-status', checkAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // arrived, ordered, paid, served
    const db = await dbPromise;
    
    const validStatuses = ['arrived', 'ordered', 'paid', 'served'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status invalid. Valori: ${validStatuses.join(', ')}` });
    }
    
    // Determină care timestamp să actualizeze
    let updateField = '';
    switch(status) {
      case 'arrived':
        updateField = ', arrived_at = datetime("now")';
        break;
      case 'ordered':
        updateField = ', ordered_at = datetime("now")';
        break;
      case 'paid':
        updateField = ', paid_at = datetime("now"), is_paid = 1';
        break;
      case 'served':
        updateField = ', served_at = datetime("now"), status = "delivered"';
        break;
    }
    
    await new Promise((resolve, reject) => {
      db.run(`UPDATE orders SET dummy = 1${updateField} WHERE id = ?`, [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Emit Socket.io event
    if (global.io) {
      global.io.emit('drivethru:status-changed', { orderId: id, status, timestamp: new Date() });
      
      if (status === 'served') {
        global.io.emit('drivethru:completed', { orderId: id });
      }
    }
    
    res.json({ success: true, message: `Status actualizat: ${status}` });
  } catch (err) {
    console.error('Error updating drive-thru status:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/orders/drive-thru/stats - Statistici în timp real
 */
router.get('/stats', async (req, res) => {
  try {
    const db = await dbPromise;
    
    // Comenzi azi
    const today = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as total_orders,
          AVG(CAST((julianday(served_at) - julianday(ordered_at)) * 24 * 60 * 60 AS INTEGER)) as avg_service_time_seconds,
          SUM(total) as revenue
        FROM orders
        WHERE order_source = 'DRIVE_THRU'
          AND date(timestamp) = date('now')
      `, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    // Comenzi în coadă acum
    const queueLength = await new Promise((resolve, reject) => {
      db.get(`
        SELECT COUNT(*) as count
        FROM orders
        WHERE order_source = 'DRIVE_THRU'
          AND status NOT IN ('delivered', 'cancelled', 'served')
      `, (err, row) => {
        if (err) reject(err);
        else resolve(row?.count || 0);
      });
    });
    
    // Comenzi peste 5 min
    const slowOrders = await new Promise((resolve, reject) => {
      db.get(`
        SELECT COUNT(*) as count
        FROM orders
        WHERE order_source = 'DRIVE_THRU'
          AND status NOT IN ('delivered', 'cancelled', 'served')
          AND CAST((julianday('now') - julianday(ordered_at)) * 24 * 60 AS INTEGER) > 5
      `, (err, row) => {
        if (err) reject(err);
        else resolve(row?.count || 0);
      });
    });
    
    res.json({
      success: true,
      stats: {
        orders_today: today.total_orders || 0,
        avg_service_time_seconds: Math.round(today.avg_service_time_seconds || 0),
        revenue_today: today.revenue || 0,
        current_queue_length: queueLength,
        slow_orders_count: slowOrders
      }
    });
  } catch (err) {
    console.error('Error fetching drive-thru stats:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/orders/:id/drive-thru-complete - Finalizare rapidă (servit + încasat)
 */
router.post('/:id/complete', checkAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    // Calculează timpul total de servire
    const order = await new Promise((resolve, reject) => {
      db.get('SELECT ordered_at FROM orders WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Comandă negăsită' });
    }
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE orders 
        SET status = 'delivered',
            served_at = datetime('now'),
            is_paid = 1,
            paid_at = datetime('now')
        WHERE id = ?
      `, [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Calculează timpul de servire
    const finalOrder = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          CAST((julianday(served_at) - julianday(ordered_at)) * 24 * 60 AS INTEGER) as service_time_minutes
        FROM orders 
        WHERE id = ?
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    // Emit Socket.io event
    if (global.io) {
      global.io.emit('drivethru:completed', { 
        orderId: id, 
        serviceTimeMinutes: finalOrder?.service_time_minutes || 0,
        timestamp: new Date() 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Comandă finalizată cu succes',
      service_time_minutes: finalOrder?.service_time_minutes || 0
    });
  } catch (err) {
    console.error('Error completing drive-thru order:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

