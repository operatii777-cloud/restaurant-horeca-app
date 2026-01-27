/**
 * S17.A - Delivery Service
 * Business logic for delivery dispatch core
 * Extends existing delivery functionality without breaking anything
 */

const { dbPromise } = require('../../../database');

/**
 * Get delivery queue (pending, ready, assigned, etc.)
 * Used by POS, KIOSK, DispatchPage, TrackOrderPage
 */
async function getDeliveryQueue({ status, platform } = {}) {
  const db = await dbPromise;
  
  let query = `
    SELECT 
      o.id as orderId,
      o.id as order_number,
      o.status,
      o.customer_name,
      o.customer_phone,
      o.delivery_address,
      o.platform,
      o.total,
      o.payment_method,
      o.timestamp as createdAt,
      o.ready_at as readyAt,
      o.preparing_at as preparingAt,
      da.id as assignmentId,
      da.courier_id as courierId,
      da.status as assignmentStatus,
      da.assigned_at,
      da.accepted_at,
      da.picked_up_at,
      da.delivered_at,
      c.name as courierName,
      c.phone as courierPhone,
      c.status as courierStatus,
      c.code as courierCode
    FROM orders o
    LEFT JOIN delivery_assignments da ON o.id = da.order_id AND da.status NOT IN ('cancelled', 'delivered')
    LEFT JOIN couriers c ON da.courier_id = c.id
    WHERE o.type = 'delivery'
  `;
  
  const params = [];
  
  if (status) {
    if (status === 'pending') {
      query += ` AND o.status IN ('pending', 'preparing') AND da.id IS NULL`;
    } else if (status === 'ready') {
      query += ` AND o.status = 'ready' AND da.id IS NULL`;
    } else if (status === 'assigned') {
      query += ` AND da.status = 'assigned'`;
    } else if (status === 'picked_up') {
      query += ` AND da.status IN ('picked_up', 'in_transit')`;
    } else if (status === 'delivered') {
      query += ` AND o.status = 'delivered' OR da.status = 'delivered'`;
    } else {
      query += ` AND o.status = ?`;
      params.push(status);
    }
  }
  
  if (platform) {
    query += ` AND o.platform = ?`;
    params.push(platform);
  }
  
  query += ` ORDER BY o.timestamp DESC LIMIT 100`;
  
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const queue = rows.map(row => ({
          orderId: row.orderId,
          orderNumber: row.order_number,
          status: row.status,
          customerName: row.customer_name,
          customerPhone: row.customer_phone,
          deliveryAddress: row.delivery_address,
          platform: row.platform,
          total: row.total,
          paymentMethod: row.payment_method,
          createdAt: row.createdAt,
          readyAt: row.readyAt,
          preparingAt: row.preparingAt,
          assignedCourier: row.courierId ? {
            id: row.courierId,
            name: row.courierName,
            phone: row.courierPhone,
            status: row.courierStatus,
            code: row.courierCode,
            assignmentId: row.assignmentId,
            assignmentStatus: row.assignmentStatus,
            assignedAt: row.assigned_at,
            acceptedAt: row.accepted_at,
            pickedUpAt: row.picked_up_at,
            deliveredAt: row.delivered_at
          } : null
        }));
        resolve(queue);
      }
    });
  });
}

/**
 * Assign courier to delivery order
 */
async function assignCourier({ orderId, courierId, assignedBy = 'DISPATCH' }) {
  const db = await dbPromise;
  
  // Verify order exists and is delivery type
  const order = await new Promise((resolve, reject) => {
    db.get('SELECT * FROM orders WHERE id = ? AND type = ?', [orderId, 'delivery'], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
  
  if (!order) {
    throw new Error('Order not found or not a delivery order');
  }
  
  // Verify order status is compatible
  if (!['pending', 'preparing', 'ready', 'completed'].includes(order.status)) {
    throw new Error(`Order status ${order.status} is not compatible with assignment`);
  }
  
  // Verify courier exists and is online
  const courier = await new Promise((resolve, reject) => {
    db.get('SELECT * FROM couriers WHERE id = ? AND is_active = 1', [courierId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
  
  if (!courier) {
    throw new Error('Courier not found or inactive');
  }
  
  if (courier.status !== 'online' && courier.status !== 'idle') {
    throw new Error('Courier is not available (not online)');
  }
  
  // Check if assignment already exists
  const existingAssignment = await new Promise((resolve, reject) => {
    db.get(`
      SELECT * FROM delivery_assignments 
      WHERE order_id = ? AND status NOT IN ('cancelled', 'delivered')
      ORDER BY assigned_at DESC LIMIT 1
    `, [orderId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
  
  let assignmentId;
  
  if (existingAssignment) {
    // Update existing assignment
    assignmentId = existingAssignment.id;
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE delivery_assignments 
        SET courier_id = ?,
            status = 'assigned',
            assigned_at = datetime('now'),
            assigned_by_text = ?,
            updated_at = datetime('now')
        WHERE id = ?
      `, [courierId, assignedBy, assignmentId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  } else {
    // Create new assignment
    assignmentId = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO delivery_assignments (
          order_id, courier_id, status, assigned_at, assigned_by_text, created_at, updated_at
        ) VALUES (?, ?, 'assigned', datetime('now'), ?, datetime('now'), datetime('now'))
      `, [orderId, courierId, assignedBy], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }
  
  // Update order status if needed
  if (order.status === 'ready' || order.status === 'completed') {
    await new Promise((resolve, reject) => {
      db.run('UPDATE orders SET status = ? WHERE id = ?', ['assigned', orderId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
  
  return {
    orderId,
    courierId,
    assignmentId,
    status: 'assigned',
    assignedBy,
    assignedAt: new Date().toISOString()
  };
}

/**
 * Save delivery proof (photo/signature)
 */
async function saveDeliveryProof({ orderId, courierId, type, filePath }) {
  const db = await dbPromise;
  
  // Verify order exists
  const order = await new Promise((resolve, reject) => {
    db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
  
  if (!order) {
    throw new Error('Order not found');
  }
  
  // Insert proof record
  const proofId = await new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO delivery_proofs (order_id, courier_id, type, file_path, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `, [orderId, courierId, type, filePath], function(err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
  
  // Also update delivery_assignments if type is photo or signature
  if (type === 'photo') {
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE delivery_assignments 
        SET delivery_photo = ?
        WHERE order_id = ? AND status NOT IN ('cancelled')
        ORDER BY assigned_at DESC LIMIT 1
      `, [filePath, orderId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  } else if (type === 'signature') {
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE delivery_assignments 
        SET customer_signature = ?
        WHERE order_id = ? AND status NOT IN ('cancelled')
        ORDER BY assigned_at DESC LIMIT 1
      `, [filePath, orderId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
  
  return {
    id: proofId,
    orderId,
    courierId,
    type,
    filePath,
    createdAt: new Date().toISOString()
  };
}

module.exports = {
  getDeliveryQueue,
  assignCourier,
  saveDeliveryProof
};

