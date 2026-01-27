// =====================================================================
// API ROUTES: CURIERI (Delivery & Drive-Thru)
// Date: 2025-12-05
// =====================================================================

const express = require('express');
const router = express.Router();
const { dbPromise } = require('../database');
const { COURIER_STATUS, VEHICLE_TYPES } = require('../constants/delivery');

// Middleware de autentificare (importat din server.js)
function checkAdminAuth(req, res, next) {
  // TODO: Implementare reală cu session
  req.user = { id: 1, username: 'admin', role_name: 'Super Admin' };
  next();
}

// Middleware pentru verificare permisiuni
async function requirePermission(permissionName) {
  return async (req, res, next) => {
    // TODO: Implementare reală verificare permisiuni
    next();
  };
}

// =====================================================================
// CRUD CURIERI
// =====================================================================

/**
 * GET /api/couriers - Lista curieri
 */
router.get('/', checkAdminAuth, async (req, res) => {
  try {
    const { status, is_active } = req.query;
    const db = await dbPromise;
    
    let query = 'SELECT * FROM couriers WHERE 1=1';
    const params = [];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    if (is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    }
    
    query += ' ORDER BY name ASC';
    
    const couriers = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    res.json({ success: true, couriers });
  } catch (err) {
    console.error('Error fetching couriers:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/couriers/:id - Detalii curier
 */
router.get('/:id', checkAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    const courier = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM couriers WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!courier) {
      return res.status(404).json({ error: 'Curier negăsit' });
    }
    
    // Statistici livrări
    const stats = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as total_assignments,
          SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as completed,
          AVG(CASE WHEN status = 'delivered' THEN actual_time_minutes ELSE NULL END) as avg_time,
          SUM(delivery_fee + tip) as total_earned
        FROM delivery_assignments
        WHERE courier_id = ?
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    res.json({ success: true, courier: { ...courier, stats } });
  } catch (err) {
    console.error('Error fetching courier:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/couriers - Creare curier nou
 */
router.post('/', checkAdminAuth, async (req, res) => {
  try {
    const {
      code, name, phone, email, vehicle_type, license_plate,
      assigned_zones, max_concurrent_deliveries, payment_type, commission_percent
    } = req.body;
    
    if (!code || !name) {
      return res.status(400).json({ error: 'Cod și nume sunt obligatorii' });
    }
    
    const db = await dbPromise;
    
    // Verifică dacă codul există deja
    const existing = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM couriers WHERE code = ?', [code], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (existing) {
      return res.status(409).json({ error: `Curier cu codul ${code} există deja` });
    }
    
    const courierId = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO couriers (
          code, name, phone, email, vehicle_type, license_plate,
          assigned_zones, max_concurrent_deliveries, payment_type, commission_percent,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `, [
        code, name, phone || null, email || null, vehicle_type || 'scooter', license_plate || null,
        assigned_zones || null, max_concurrent_deliveries || 3, payment_type || 'salary', commission_percent || 0
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
    
    res.json({ success: true, courier_id: courierId, message: 'Curier creat cu succes' });
  } catch (err) {
    console.error('Error creating courier:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/couriers/:id - Actualizare curier
 */
router.put('/:id', checkAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const db = await dbPromise;
    
    const allowedFields = [
      'name', 'phone', 'email', 'vehicle_type', 'license_plate',
      'assigned_zones', 'max_concurrent_deliveries', 'payment_type', 'commission_percent', 'is_active'
    ];
    
    const fields = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'Niciun câmp valid pentru actualizare' });
    }
    
    fields.push('updated_at = datetime("now")');
    values.push(id);
    
    await new Promise((resolve, reject) => {
      db.run(`UPDATE couriers SET ${fields.join(', ')} WHERE id = ?`, values, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({ success: true, message: 'Curier actualizat cu succes' });
  } catch (err) {
    console.error('Error updating courier:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/couriers/:id - Dezactivare curier
 */
router.delete('/:id', checkAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    await new Promise((resolve, reject) => {
      db.run(`UPDATE couriers SET is_active = 0, updated_at = datetime('now') WHERE id = ?`, [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({ success: true, message: 'Curier dezactivat cu succes' });
  } catch (err) {
    console.error('Error deactivating courier:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/couriers/:id/status - Schimbă status curier (online/offline/busy/break)
 */
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const db = await dbPromise;
    
    const validStatuses = Object.values(COURIER_STATUS);
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status invalid. Valori acceptate: ${validStatuses.join(', ')}` });
    }
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE couriers 
        SET status = ?, 
            updated_at = datetime('now'),
            active_since = CASE WHEN status = 'offline' AND ? = 'online' THEN datetime('now') ELSE active_since END
        WHERE id = ?
      `, [status, status, id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Emit Socket.io event
    if (global.io) {
      global.io.emit('courier:status-changed', { courierId: id, status, timestamp: new Date() });
    }
    
    res.json({ success: true, message: `Status curier schimbat în ${status}` });
  } catch (err) {
    console.error('Error updating courier status:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/couriers/:id/deliveries - Istoric livrări curier
 */
router.get('/:id/deliveries', checkAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const db = await dbPromise;
    
    const deliveries = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          da.*,
          o.order_number, o.customer_name, o.delivery_address, o.total, o.timestamp
        FROM delivery_assignments da
        JOIN orders o ON da.order_id = o.id
        WHERE da.courier_id = ?
        ORDER BY da.assigned_at DESC
        LIMIT ? OFFSET ?
      `, [id, limit, offset], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    res.json({ success: true, deliveries });
  } catch (err) {
    console.error('Error fetching courier deliveries:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/couriers/:id/generate-token - Generează token API pentru app mobil
 */
router.post('/:id/generate-token', checkAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    const crypto = require('crypto');
    
    // Generează token unic
    const token = crypto.randomBytes(32).toString('hex');
    
    await new Promise((resolve, reject) => {
      db.run('UPDATE couriers SET api_token = ?, updated_at = datetime("now") WHERE id = ?', [token, id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({ success: true, api_token: token, message: 'Token generat cu succes' });
  } catch (err) {
    console.error('Error generating token:', err);
    res.status(500).json({ error: err.message });
  }
});

// =====================================================================
// DISPATCH (ALOCARE COMENZI)
// =====================================================================

/**
 * GET /api/couriers/dispatch/pending - Comenzi de alocat
 */
router.get('/dispatch/pending', checkAdminAuth, async (req, res) => {
  try {
    const db = await dbPromise;
    
    const orders = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          o.*,
          c.name as courier_name
        FROM orders o
        LEFT JOIN couriers c ON o.courier_id = c.id
        WHERE o.order_source IN ('DELIVERY', 'DRIVE_THRU')
          AND o.status IN ('pending', 'completed', 'ready', 'assigned', 'picked_up', 'in_transit')
          AND o.status NOT IN ('delivered', 'cancelled', 'paid')
        ORDER BY o.timestamp ASC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    res.json({ success: true, orders });
  } catch (err) {
    console.error('Error fetching pending orders:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/couriers/dispatch/available - Curieri disponibili
 */
router.get('/dispatch/available', checkAdminAuth, async (req, res) => {
  try {
    const db = await dbPromise;
    
    const couriers = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          c.*,
          COUNT(da.id) as active_count
        FROM couriers c
        LEFT JOIN delivery_assignments da ON c.id = da.courier_id AND da.status IN ('assigned', 'picked_up', 'in_transit')
        WHERE c.is_active = 1
        GROUP BY c.id
        ORDER BY active_count ASC, c.rating DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    res.json({ success: true, couriers });
  } catch (err) {
    console.error('Error fetching available couriers:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/couriers/dispatch/assign - Alocă comandă la curier
 */
router.post('/dispatch/assign', checkAdminAuth, async (req, res) => {
  try {
    const { order_id, courier_id, delivery_fee, estimated_time_minutes, distance_km } = req.body;
    
    if (!order_id || !courier_id) {
      return res.status(400).json({ error: 'order_id și courier_id sunt obligatorii' });
    }
    
    const db = await dbPromise;
    
    // Verifică dacă comanda există și poate fi alocată
    const order = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE id = ?', [order_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Comandă negăsită' });
    }
    
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({ error: 'Comanda nu poate fi alocată (deja livrată sau anulată)' });
    }
    
    // Verifică dacă curierul există și e disponibil
    const courier = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM couriers WHERE id = ? AND is_active = 1', [courier_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!courier) {
      return res.status(404).json({ error: 'Curier negăsit sau inactiv' });
    }
    
    // Creează assignment
    const assignmentId = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO delivery_assignments (
          order_id, courier_id, assigned_by, delivery_fee, estimated_time_minutes, distance_km, status
        ) VALUES (?, ?, ?, ?, ?, ?, 'assigned')
      `, [order_id, courier_id, req.user.id, delivery_fee || 10, estimated_time_minutes || 30, distance_km || null], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
    
    // Actualizează order cu courier_id
    await new Promise((resolve, reject) => {
      db.run('UPDATE orders SET courier_id = ?, estimated_delivery_time = datetime("now", "+? minutes") WHERE id = ?', [courier_id, estimated_time_minutes || 30, order_id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Emit Socket.io event
    if (global.io) {
      global.io.emit('delivery:assigned', { orderId: order_id, courierId: courier_id, courierName: courier.name, timestamp: new Date() });
      global.io.to(`courier_${courier_id}`).emit('delivery:new-assignment', { orderId: order_id, assignmentId });
    }
    
    res.json({ success: true, assignment_id: assignmentId, message: 'Comandă alocată cu succes' });
  } catch (err) {
    console.error('Error assigning courier:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/couriers/dispatch/reassign - Re-alocă comandă la alt curier
 */
router.post('/dispatch/reassign', checkAdminAuth, async (req, res) => {
  try {
    const { order_id, new_courier_id, reason } = req.body;
    
    if (!order_id || !new_courier_id || !reason) {
      return res.status(400).json({ error: 'order_id, new_courier_id și reason sunt obligatorii' });
    }
    
    const db = await dbPromise;
    
    // Găsește assignment-ul curent
    const currentAssignment = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM delivery_assignments 
        WHERE order_id = ? AND status IN ('assigned', 'picked_up')
        ORDER BY assigned_at DESC LIMIT 1
      `, [order_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!currentAssignment) {
      return res.status(404).json({ error: 'Assignment negăsit sau comandă deja livrată' });
    }
    
    const oldCourierId = currentAssignment.courier_id;
    
    // Marchează vechiul assignment ca reassigned
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE delivery_assignments 
        SET status = 'reassigned', reassignment_timestamp = datetime('now'), reassignment_reason = ?
        WHERE id = ?
      `, [reason, currentAssignment.id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Creează assignment nou
    const newAssignmentId = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO delivery_assignments (
          order_id, courier_id, assigned_by, delivery_fee, estimated_time_minutes, 
          distance_km, status, reassigned_from, reassignment_reason
        ) VALUES (?, ?, ?, ?, ?, ?, 'assigned', ?, ?)
      `, [
        order_id, new_courier_id, req.user.id, 
        currentAssignment.delivery_fee, currentAssignment.estimated_time_minutes,
        currentAssignment.distance_km, oldCourierId, reason
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
    
    // Actualizează order
    await new Promise((resolve, reject) => {
      db.run('UPDATE orders SET courier_id = ? WHERE id = ?', [new_courier_id, order_id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Emit Socket.io events
    if (global.io) {
      global.io.to(`courier_${oldCourierId}`).emit('delivery:reassigned-away', { orderId: order_id, reason });
      global.io.to(`courier_${new_courier_id}`).emit('delivery:new-assignment', { orderId: order_id, assignmentId: newAssignmentId });
      global.io.emit('delivery:reassigned', { orderId: order_id, oldCourierId, newCourierId: new_courier_id, reason });
    }
    
    res.json({ success: true, assignment_id: newAssignmentId, message: 'Comandă re-alocată cu succes' });
  } catch (err) {
    console.error('Error reassigning courier:', err);
    res.status(500).json({ error: err.message });
  }
});

// =====================================================================
// TRACKING LIVE
// =====================================================================

/**
 * GET /api/couriers/tracking/live - Poziții live curieri
 */
router.get('/tracking/live', checkAdminAuth, async (req, res) => {
  try {
    const db = await dbPromise;
    
    const couriers = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          c.id, c.code, c.name, c.status, c.current_lat, c.current_lng,
          da.id as delivery_id, da.status as delivery_status,
          o.id as order_id, o.customer_name, o.delivery_address
        FROM couriers c
        LEFT JOIN delivery_assignments da ON c.id = da.courier_id AND da.status IN ('assigned', 'picked_up', 'in_transit')
        LEFT JOIN orders o ON da.order_id = o.id
        WHERE c.is_active = 1 AND c.status != 'offline'
        ORDER BY c.status ASC, c.name ASC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    res.json({ success: true, couriers });
  } catch (err) {
    console.error('Error fetching live tracking:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/couriers/:id/location - Actualizează poziție GPS (app curier)
 */
router.put('/:id/location', async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;
    
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'lat și lng sunt obligatorii' });
    }
    
    const db = await dbPromise;
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE couriers 
        SET current_lat = ?, current_lng = ?, last_location_update = datetime('now')
        WHERE id = ?
      `, [lat, lng, id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Emit Socket.io event
    if (global.io) {
      global.io.emit('courier:location-update', { courierId: id, lat, lng, timestamp: new Date() });
    }
    
    res.json({ success: true, message: 'Poziție actualizată' });
  } catch (err) {
    console.error('Error updating location:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/couriers/:id/route - Traseu curier (ultimele 30 min)
 */
router.get('/:id/route', checkAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    // Găsește livrarea activă
    const activeDelivery = await new Promise((resolve, reject) => {
      db.get(`
        SELECT route_gps_log 
        FROM delivery_assignments 
        WHERE courier_id = ? AND status IN ('picked_up', 'in_transit')
        ORDER BY assigned_at DESC LIMIT 1
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    let route = [];
    if (activeDelivery && activeDelivery.route_gps_log) {
      try {
        route = JSON.parse(activeDelivery.route_gps_log);
      } catch (e) {
        route = [];
      }
    }
    
    res.json({ success: true, route });
  } catch (err) {
    console.error('Error fetching route:', err);
    res.status(500).json({ error: err.message });
  }
});

// =====================================================================
// APP CURIER (MOBILE)
// =====================================================================

/**
 * GET /api/couriers/me - Info curier curent (autentificat cu token)
 */
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token lipsește' });
    }
    
    const db = await dbPromise;
    
    const courier = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM couriers WHERE api_token = ? AND is_active = 1', [token], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!courier) {
      return res.status(401).json({ error: 'Token invalid' });
    }
    
    res.json({ success: true, courier });
  } catch (err) {
    console.error('Error fetching courier info:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/couriers/me/assignments - Comenzi alocate curier (app mobil)
 */
router.get('/me/assignments', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const { status } = req.query; // assigned,picked_up
    
    if (!token) {
      return res.status(401).json({ error: 'Token lipsește' });
    }
    
    const db = await dbPromise;
    
    // Găsește courierul
    const courier = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM couriers WHERE api_token = ? AND is_active = 1', [token], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!courier) {
      return res.status(401).json({ error: 'Token invalid' });
    }
    
    // Filtrare statusuri
    let statusFilter = "('assigned', 'picked_up', 'in_transit')";
    if (status) {
      const statuses = status.split(',').map(s => `'${s.trim()}'`).join(',');
      statusFilter = `(${statuses})`;
    }
    
    const deliveries = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          da.*,
          o.order_number, o.customer_name, o.customer_phone, o.delivery_address,
          o.total, o.payment_method, o.platform, o.items, o.timestamp, o.status as order_status
        FROM delivery_assignments da
        JOIN orders o ON da.order_id = o.id
        WHERE da.courier_id = ? AND da.status IN ${statusFilter}
        ORDER BY da.assigned_at DESC
      `, [courier.id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    res.json({ success: true, deliveries });
  } catch (err) {
    console.error('Error fetching courier assignments:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/couriers/delivery/:id/status - Schimbă status livrare (app curier)
 */
router.put('/delivery/:id/status', async (req, res) => {
  try {
    const { id } = req.params; // delivery_assignments.id sau order_id
    const { status } = req.body;
    const db = await dbPromise;
    
    const validStatuses = ['assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status invalid. Valori: ${validStatuses.join(', ')}` });
    }
    
    // Determină dacă id e assignment_id sau order_id
    let assignment = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM delivery_assignments WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!assignment) {
      // Încearcă să găsească după order_id
      assignment = await new Promise((resolve, reject) => {
        db.get(`
          SELECT * FROM delivery_assignments 
          WHERE order_id = ? 
          ORDER BY assigned_at DESC LIMIT 1
        `, [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    }
    
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment negăsit' });
    }
    
    // Actualizează status cu timestamp-uri corespunzătoare
    let timestampField = '';
    if (status === 'picked_up') timestampField = ', picked_up_at = datetime("now")';
    if (status === 'delivered') timestampField = ', delivered_at = datetime("now")';
    
    await new Promise((resolve, reject) => {
      db.run(`UPDATE delivery_assignments SET status = ?${timestampField} WHERE id = ?`, [status, assignment.id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Actualizează status order dacă e delivered
    if (status === 'delivered') {
      await new Promise((resolve, reject) => {
        db.run(`
          UPDATE orders 
          SET status = 'delivered', delivered_timestamp = datetime('now'), actual_delivery_time = datetime('now')
          WHERE id = ?
        `, [assignment.order_id], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    
    // Emit Socket.io event
    if (global.io) {
      global.io.emit('delivery:status-changed', { 
        orderId: assignment.order_id, 
        assignmentId: assignment.id,
        status, 
        timestamp: new Date() 
      });
    }
    
    res.json({ success: true, message: `Status schimbat în ${status}` });
  } catch (err) {
    console.error('Error updating delivery status:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/couriers/delivery/:id/complete - Finalizează cu semnătură și foto
 */
router.post('/delivery/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { signature, photo, notes } = req.body;
    const db = await dbPromise;
    
    // Calculează timpul real
    const assignment = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM delivery_assignments WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment negăsit' });
    }
    
    const actualTime = Math.floor((Date.now() - new Date(assignment.assigned_at).getTime()) / 60000);
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE delivery_assignments 
        SET status = 'delivered',
            delivered_at = datetime('now'),
            customer_signature = ?,
            delivery_photo = ?,
            delivery_notes = ?,
            actual_time_minutes = ?
        WHERE id = ?
      `, [signature || null, photo || null, notes || null, actualTime, id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Actualizează order
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE orders 
        SET status = 'delivered', 
            delivered_timestamp = datetime('now'),
            actual_delivery_time = datetime('now')
        WHERE id = ?
      `, [assignment.order_id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Actualizează statistici curier
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE couriers 
        SET total_deliveries = total_deliveries + 1,
            successful_deliveries = successful_deliveries + 1,
            avg_delivery_time_minutes = (
              SELECT AVG(actual_time_minutes) 
              FROM delivery_assignments 
              WHERE courier_id = ? AND status = 'delivered'
            )
        WHERE id = ?
      `, [assignment.courier_id, assignment.courier_id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Emit Socket.io event
    if (global.io) {
      global.io.emit('delivery:delivered', { 
        orderId: assignment.order_id, 
        courierId: assignment.courier_id,
        signature: !!signature,
        timestamp: new Date() 
      });
    }
    
    res.json({ success: true, message: 'Livrare finalizată cu succes' });
  } catch (err) {
    console.error('Error completing delivery:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
