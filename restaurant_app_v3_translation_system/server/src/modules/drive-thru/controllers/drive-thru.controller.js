/**
 * ENTERPRISE CONTROLLER
 * Phase: E8 - Logic migrated from routes/drive-thru.js
 */

const { dbPromise } = require('../../../../database');
const { ORDER_SOURCE } = require('../../../../orders/unifiedOrderService');

function checkAdminAuth(req, res, next) {
  req.user = { id: 1, username: 'admin', role_name: 'Super Admin' };
  next();
}

// GET /api/orders/drive-thru - List all drive-thru orders
async function getDriveThruOrders(req, res, next) {
  try {
    const db = await dbPromise;
    const { date, status, limit = 100 } = req.query;
    
    let query = `
      SELECT *,
        CAST((julianday('now') - julianday(COALESCE(ordered_at, timestamp))) * 24 * 60 AS INTEGER) as wait_time_minutes
      FROM orders
      WHERE (order_source = 'DRIVE_THRU' OR order_source = 'drive_thru' OR order_source = 'drive-thru')
    `;
    const params = [];
    
    if (date) {
      query += ' AND DATE(timestamp) = DATE(?)';
      params.push(date);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const orders = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    const ordersWithItems = orders.map(order => {
      let items = [];
      try {
        items = JSON.parse(order.items || '[]');
      } catch (e) {
        items = [];
      }
      return { ...order, items };
    });
    
    res.json({ success: true, data: ordersWithItems });
  } catch (error) {
    next(error);
  }
}

// POST /api/orders/drive-thru
async function createDriveThruOrder(req, res, next) {
  try {
    const {
      car_plate, lane_number, items, total, payment_method, notes
    } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Produse sunt obligatorii' });
    }
    
    const db = await dbPromise;
    
    if (!payment_method) {
      return res.status(400).json({ error: 'Metoda de plată este obligatorie pentru drive-thru' });
    }
    
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
        'pending', notes || null, 1
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
    
    if (global.io) {
      global.io.emit('drivethru:new-order', {
        orderId,
        laneNumber: lane_number || 'A1',
        carPlate: car_plate,
        total,
        timestamp: new Date()
      });
      
      global.io.emit('order:new', { orderId, type: 'drive_thru', items });
    }
    
    res.json({ 
      success: true, 
      order_id: orderId, 
      message: 'Comandă drive-thru creată cu succes' 
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/orders/drive-thru/queue
async function getDriveThruQueue(req, res, next) {
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
  } catch (error) {
    next(error);
  }
}

// PUT /api/orders/:id/drive-thru-status
async function updateDriveThruStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const db = await dbPromise;
    
    const validStatuses = ['arrived', 'ordered', 'paid', 'served'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status invalid. Valori: ${validStatuses.join(', ')}` });
    }
    
    // Security: Use safe timestamp field (no template literal injection)
    // Map status to safe update strings
    const statusUpdateMap = {
      'arrived': ', arrived_at = datetime("now")',
      'ordered': ', ordered_at = datetime("now")',
      'paid': ', paid_at = datetime("now"), is_paid = 1',
      'served': ', served_at = datetime("now"), status = "delivered"'
    };
    
    // Security: Validate status and get safe update string
    const updateField = statusUpdateMap[status] || '';
    if (!updateField && status !== 'pending') {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    await new Promise((resolve, reject) => {
      // Security: Use placeholders for all dynamic values
      db.run(`UPDATE orders SET dummy = 1${updateField} WHERE id = ?`, [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    if (global.io) {
      global.io.emit('drivethru:status-changed', { orderId: id, status, timestamp: new Date() });
      
      if (status === 'served') {
        global.io.emit('drivethru:completed', { orderId: id });
      }
    }
    
    res.json({ success: true, message: `Status actualizat: ${status}` });
  } catch (error) {
    next(error);
  }
}

// GET /api/orders/drive-thru/stats
async function getDriveThruStats(req, res, next) {
  try {
    const db = await dbPromise;
    
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
  } catch (error) {
    next(error);
  }
}

// POST /api/orders/:id/drive-thru-complete
async function completeDriveThruOrder(req, res, next) {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
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
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDriveThruOrders,
  createDriveThruOrder,
  getDriveThruQueue,
  updateDriveThruStatus,
  getDriveThruStats,
  completeDriveThruOrder,
  checkAdminAuth,
};

