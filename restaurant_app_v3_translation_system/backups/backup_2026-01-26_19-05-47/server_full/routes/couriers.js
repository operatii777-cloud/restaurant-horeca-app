// =====================================================================
// API ROUTES: CURIERI (Delivery & Drive-Thru)
// Date: 2025-12-05
// =====================================================================

const express = require('express');
const router = express.Router();
const { dbPromise } = require('../database');
const { COURIER_STATUS, VEHICLE_TYPES } = require('../constants/delivery');
const bcrypt = require('bcrypt');
const couriersService = require('../src/modules/couriers/couriers.service');

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
// AUTENTIFICARE CURIER (HorecaAI Style)
// =====================================================================

/**
 * POST /api/couriers/login - Autentificare curier cu username/password
 * Returnează token API pentru utilizare în app mobil
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username și parolă sunt obligatorii' });
    }
    
    const db = await dbPromise;
    
    // Caută curier după username (poate fi code, phone, sau email)
    const courier = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM couriers 
        WHERE (code = ? OR phone = ? OR email = ?) AND is_active = 1
      `, [username, username, username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!courier) {
      return res.status(401).json({ error: 'Curier negăsit sau inactiv' });
    }
    
    // Verifică parola (dacă există password_hash în DB)
    if (courier.password_hash) {
      const isValid = await bcrypt.compare(password, courier.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: 'Parolă incorectă' });
      }
    } else {
      // Dacă nu există password_hash, verifică dacă parola e codul curierului (pentru testare)
      // În producție, toți curierii ar trebui să aibă password_hash
      if (password !== courier.code && password !== 'test123') {
        return res.status(401).json({ error: 'Parolă incorectă' });
      }
    }
    
    // Generează sau folosește token existent
    let token = courier.api_token;
    if (!token) {
      const crypto = require('crypto');
      token = crypto.randomBytes(32).toString('hex');
      
      await new Promise((resolve, reject) => {
        db.run('UPDATE couriers SET api_token = ?, updated_at = datetime("now") WHERE id = ?', [token, courier.id], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    
    // Actualizează status la online
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE couriers 
        SET status = 'online', 
            active_since = CASE WHEN status = 'offline' THEN datetime('now') ELSE active_since END,
            updated_at = datetime('now')
        WHERE id = ?
      `, [courier.id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({ 
      success: true, 
      token,
      courier: {
        id: courier.id,
        name: courier.name,
        code: courier.code,
        phone: courier.phone,
        status: 'online'
      },
      message: 'Autentificare reușită'
    });
  } catch (err) {
    console.error('Error in courier login:', err);
    res.status(500).json({ error: err.message });
  }
});

// =====================================================================
// APP CURIER (MOBILE) - Endpoints cu Bearer Token
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
    // Dacă nu se specifică status, include toate statusurile (inclusiv delivered pentru istoric)
    let statusFilter = "('assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled')";
    if (status) {
      const statuses = status.split(',').map(s => `'${s.trim()}'`).join(',');
      statusFilter = `(${statuses})`;
    }
    
    const deliveries = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          da.id,
          da.courier_id,
          da.order_id,
          da.status,
          da.assigned_at,
          da.picked_up_at,
          da.delivered_at,
          da.delivery_fee,
          o.id as order_number, 
          o.customer_name, 
          o.customer_phone, 
          o.delivery_address,
          o.total, 
          o.payment_method, 
          o.is_paid,
          o.platform, 
          o.items, 
          o.timestamp, 
          o.status as order_status
        FROM delivery_assignments da
        JOIN orders o ON da.order_id = o.id
        WHERE da.courier_id = ? AND da.status IN ${statusFilter}
        ORDER BY da.assigned_at DESC
        LIMIT 100
      `, [courier.id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, deliveries });
  } catch (err) {
    console.error('Error fetching courier assignments:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/couriers/me/location - Actualizează locația curierului (GPS tracking)
 */
router.put('/me/location', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const { lat, lng } = req.body;
    
    console.log(`📍 [GPS] Request location update: lat=${lat}, lng=${lng}, token=${token ? 'present' : 'missing'}`);
    
    if (!token) {
      return res.status(401).json({ error: 'Token lipsește' });
    }
    
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ error: 'lat și lng trebuie să fie numere' });
    }
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ error: 'Coordonate GPS invalide' });
    }
    
    const db = await dbPromise;
    
    const courier = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM couriers WHERE api_token = ? AND is_active = 1', [token], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!courier) {
      return res.status(401).json({ error: 'Token invalid' });
    }
    
    // Actualizează locația curierului - actualizează TOATE coloanele de locație pentru compatibilitate
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE couriers 
         SET current_lat = ?,
             current_lng = ?,
             last_lat = ?,
             last_lng = ?,
             last_location_update = datetime('now'),
             last_updated_at = datetime('now'),
             updated_at = datetime('now')
         WHERE id = ?`,
        [lat, lng, lat, lng, courier.id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    console.log(`✅ [GPS] Locație actualizată pentru curier ${courier.id}: lat=${lat}, lng=${lng} la ${new Date().toISOString()}`);
    
    res.json({ 
      success: true, 
      message: 'Locație actualizată cu succes',
      lat,
      lng,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error updating courier location:', err);
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

// =====================================================================
// CRUD CURIERI (Backward Compatibility - pentru admin)
// =====================================================================

/**
 * S17.A - GET /api/couriers/available - Curieri disponibili pentru atribuire
 */
router.get('/available', async (req, res) => {
  try {
    const { area } = req.query;
    const couriers = await couriersService.getAvailableCouriers({ area });
    res.json({ success: true, data: couriers });
  } catch (err) {
    console.error('Error fetching available couriers:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * FAZA 2.A - GET /api/couriers/dispatch/pending - Comenzi de alocat pentru dispatch
 */
router.get('/dispatch/pending', checkAdminAuth, async (req, res) => {
  try {
    const db = await dbPromise;
    
    const orders = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          o.*,
          da.courier_id,
          da.status as delivery_status,
          da.assigned_at,
          c.name as courier_name,
          o.delivery_lat,
          o.delivery_lng
        FROM orders o
        LEFT JOIN delivery_assignments da ON o.id = da.order_id
        LEFT JOIN couriers c ON da.courier_id = c.id
        WHERE o.type = 'delivery'
          AND o.status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed')
          AND (da.status IS NULL OR da.status = 'assigned')
        ORDER BY o.timestamp DESC
        LIMIT 50
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, orders });
  } catch (err) {
    console.error('Error fetching pending orders:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * FAZA 2.A - GET /api/couriers/dispatch/available - Curieri disponibili pentru dispatch
 */
router.get('/dispatch/available', checkAdminAuth, async (req, res) => {
  try {
    const couriers = await couriersService.getAvailableCouriers();
    res.json({ success: true, couriers });
  } catch (err) {
    console.error('Error fetching available couriers:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * FAZA 2.A - GET /api/couriers/tracking/live - Live tracking pentru curieri
 */
router.get('/tracking/live', checkAdminAuth, async (req, res) => {
  try {
    const db = await dbPromise;
    
    const couriers = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          c.*,
          da.order_id as delivery_id,
          da.status as delivery_status,
          o.delivery_address,
          o.id as order_number,
          o.customer_name
        FROM couriers c
        LEFT JOIN delivery_assignments da ON c.id = da.courier_id 
          AND da.status IN ('assigned', 'picked_up', 'in_transit')
        LEFT JOIN orders o ON da.order_id = o.id
        WHERE c.status IN ('online', 'assigned', 'en_route_to_restaurant', 'picked_up', 'en_route_to_customer')
          AND c.is_active = 1
        ORDER BY c.last_updated_at DESC
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, couriers });
  } catch (err) {
    console.error('Error fetching live couriers:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * FAZA 2.A - POST /api/couriers/dispatch/assign - Alocare curier la comandă
 */
router.post('/dispatch/assign', checkAdminAuth, async (req, res) => {
  try {
    const { order_id, courier_id, delivery_fee } = req.body;
    
    if (!order_id || !courier_id) {
      return res.status(400).json({ error: 'order_id și courier_id sunt obligatorii' });
    }
    
    const db = await dbPromise;
    
    // Verifică dacă există deja assignment
    const existing = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM delivery_assignments WHERE order_id = ? AND status != "cancelled"',
        [order_id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Comanda este deja alocată' });
    }
    
    // Creează assignment
    const assignmentId = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO delivery_assignments (order_id, courier_id, status, delivery_fee, assigned_at)
        VALUES (?, ?, 'assigned', ?, datetime('now'))
      `, [order_id, courier_id, delivery_fee || 0], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
    
    // Update order
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE orders SET courier_id = ?, status = ? WHERE id = ?',
        [courier_id, 'assigned', order_id],
        (err) => err ? reject(err) : resolve()
      );
    });
    
    // Update courier status
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE couriers SET status = ?, updated_at = datetime("now") WHERE id = ?',
        ['assigned', courier_id],
        (err) => err ? reject(err) : resolve()
      );
    });
    
    res.json({ success: true, assignmentId, message: 'Curier alocat cu succes' });
  } catch (err) {
    console.error('Error assigning courier:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * FAZA 2.B - GET /api/couriers/:id/location - Live location pentru curier
 */
router.get('/:id/location', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    const courier = await new Promise((resolve, reject) => {
      db.get(
        'SELECT current_lat, current_lng, last_location_update FROM couriers WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    if (!courier) {
      return res.status(404).json({ success: false, error: 'Curier negăsit' });
    }
    
    res.json({
      success: true,
      lat: courier.current_lat,
      lng: courier.current_lng,
      updatedAt: courier.last_location_update,
    });
  } catch (err) {
    console.error('Error fetching courier location:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/couriers/:id/deliveries - Istoric livrări curier (backward compatibility)
 * Query params:
 *   - status: filtrează după status (ex: 'delivered' sau 'delivered,assigned')
 *   - grouped: dacă este 'true', returnează datele grupate pe date calendaristice
 *   - limit, offset: paginare
 * 
 * NOTĂ: Endpoint-ul este accesibil fără autentificare pentru interfața web a curierului
 */
router.get('/:id/deliveries', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0, status, grouped } = req.query;
    const db = await dbPromise;
    
    let query = `
      SELECT 
        da.*,
        da.tip as tip_amount,
        o.id as order_number, 
        o.customer_name, 
        o.customer_phone,
        o.delivery_address, 
        o.total, 
        o.payment_method,
        o.is_paid,
        o.timestamp, 
        o.status as order_status,
        COALESCE(da.delivered_at, o.delivered_timestamp) as delivered_at
      FROM delivery_assignments da
      JOIN orders o ON da.order_id = o.id
      WHERE da.courier_id = ?
    `;
    const params = [id];

    if (status) {
      const statuses = status.split(',').map(s => `'${s.trim()}'`).join(',');
      query += ` AND da.status IN (${statuses})`;
    }

    // Dacă nu este grouped, returnează formatul vechi
    if (grouped !== 'true') {
      query += `
        ORDER BY da.assigned_at DESC
        LIMIT ? OFFSET ?
      `;
      params.push(limit, offset);
      
      const deliveries = await new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
      
      return res.json({ success: true, deliveries });
    }

    // Format grouped: grupează pe date calendaristice
    query += ` ORDER BY COALESCE(da.delivered_at, o.delivered_timestamp) DESC`;
    
    const deliveries = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // Grupează pe date calendaristice
    const byDate = {};
    
    deliveries.forEach(d => {
      // Folosește delivered_at sau delivered_timestamp pentru a determina data
      const deliveredDate = d.delivered_at || d.delivered_timestamp || d.assigned_at;
      
      if (!deliveredDate) return; // Skip dacă nu are dată
      
      // Extrage doar data (YYYY-MM-DD) fără timp
      const dateKey = deliveredDate.split(' ')[0] || deliveredDate.split('T')[0];
      
      if (!byDate[dateKey]) {
        byDate[dateKey] = {
          date: dateKey,
          deliveries: [],
          count: 0,
          earnings: 0
        };
      }
      
      // Calculează câștigul pentru această comandă
      const deliveryFee = parseFloat(d.delivery_fee || 0);
      const tipAmount = parseFloat(d.tip_amount || d.tip || 0);
      const earnings = deliveryFee + tipAmount;
      
      byDate[dateKey].deliveries.push({
        ...d,
        earnings
      });
      byDate[dateKey].count++;
      byDate[dateKey].earnings += earnings;
    });

    // Convertește obiectul în array și sortează descrescător după dată
    const byDateArray = Object.values(byDate).sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });

    res.json({ 
      success: true, 
      grouped: true,
      byDate: byDateArray,
      deliveries: deliveries // Pentru backward compatibility
    });
  } catch (err) {
    console.error('Error fetching courier deliveries:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
