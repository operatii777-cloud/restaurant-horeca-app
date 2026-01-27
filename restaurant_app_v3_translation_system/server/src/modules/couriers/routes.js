/**
 * PHASE E10 - Couriers Module Routes
 * Migrated from routes/couriers.js
 * 
 * Handles:
 * - Courier authentication (username/password + API token)
 * - Mobile app endpoints (Bearer token auth)
 * - Delivery assignments and status updates
 */

const express = require('express');
const router = express.Router();
const { dbPromise } = require('../../../database');
const { COURIER_STATUS, VEHICLE_TYPES } = require('../../../constants/delivery');
const argon2 = require('argon2');

// Middleware de autentificare (importat din server.js)
function checkAdminAuth(req, res, next) {
  // TODO: Implementare reală cu session
  req.user = { id: 1, username: 'admin', role_name: 'Super Admin' };
  next();
}

// =====================================================================
// GET /api/couriers - Lista curieri (pentru admin)
// =====================================================================

/**
 * GET /api/couriers - Lista toți curierii activi
 */
router.get('/', async (req, res) => {
  try {
    const { dbPromise } = require('../../../database');
    const db = await dbPromise;
    
    // Verifică dacă tabela couriers există
    const tableExists = await new Promise((resolve) => {
      db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='couriers'`, (err, row) => {
        resolve(!!row);
      });
    });
    
    if (!tableExists) {
      return res.json({
        success: true,
        couriers: []
      });
    }
    
    const couriers = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          id, code, name, phone, email, vehicle_type, status,
          current_lat, current_lng, is_active, created_at, updated_at
        FROM couriers
        WHERE is_active = 1
        ORDER BY name ASC
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({
      success: true,
      couriers: couriers || []
    });
  } catch (error) {
    console.error('Error fetching couriers:', error);
    res.json({
      success: true,
      couriers: []
    });
  }
});

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
      // Selectează doar coloanele care există sigur, fără api_token pentru a evita erori
      db.get(`
        SELECT id, code, name, phone, email, vehicle_type, status, is_active, password_hash
        FROM couriers 
        WHERE (code = ? OR phone = ? OR email = ?) AND is_active = 1
      `, [username, username, username], (err, row) => {
        if (err) {
          console.error('Error fetching courier:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
    
    if (!courier) {
      return res.status(401).json({ error: 'Curier negăsit sau inactiv' });
    }
    
    // Verifică parola (dacă există password_hash în DB)
    if (courier.password_hash) {
      try {
        // Verifică dacă hash-ul este în format argon2 (începe cu $argon2)
        const isArgon2 = courier.password_hash.startsWith('$argon2');
        
        if (isArgon2) {
          // Hash nou (argon2)
          const isValid = await argon2.verify(courier.password_hash, password);
          if (!isValid) {
            return res.status(401).json({ error: 'Parolă incorectă' });
          }
        } else {
          // Hash vechi (bcrypt) - pentru compatibilitate temporară
          // TODO: Migrează toate hash-urile bcrypt la argon2
          // Pentru moment, dacă hash-ul nu este argon2, respinge
          // (pentru a forța migrarea la argon2)
          return res.status(401).json({ 
            error: 'Parolă incorectă sau necesită resetare (migrare la argon2)' 
          });
        }
      } catch (error) {
        console.error('Error verifying password:', error);
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
    // Verifică dacă coloana api_token există înainte de a o folosi
    let token = null;
    try {
      // Încearcă să obțină token-ul existent
      const courierWithToken = await new Promise((resolve, reject) => {
        db.get('SELECT api_token FROM couriers WHERE id = ?', [courier.id], (err, row) => {
          if (err) {
            // Dacă coloana nu există, err.message va conține "no such column"
            if (err.message.includes('no such column')) {
              resolve(null); // Coloana nu există încă
            } else {
              reject(err);
            }
          } else {
            resolve(row);
          }
        });
      });
      
      token = courierWithToken?.api_token || null;
    } catch (err) {
      // Dacă coloana nu există, continuă fără token existent
      console.warn('api_token column may not exist yet, will create new token');
      token = null;
    }
    
    if (!token) {
      const crypto = require('crypto');
      token = crypto.randomBytes(32).toString('hex');
      
      try {
        await new Promise((resolve, reject) => {
          db.run('UPDATE couriers SET api_token = ?, updated_at = datetime("now") WHERE id = ?', [token, courier.id], (err) => {
            if (err) {
              // Dacă coloana nu există, ignoră eroarea și continuă
              if (err.message.includes('no such column')) {
                console.warn('api_token column does not exist, skipping token save');
                resolve();
              } else {
                reject(err);
              }
            } else {
              resolve();
            }
          });
        });
      } catch (err) {
        // Continuă chiar dacă nu s-a putut salva token-ul
        console.warn('Could not save api_token, but continuing with login:', err.message);
      }
    }
    
    // Actualizează status la online (fără active_since pentru a evita erori)
    try {
      await new Promise((resolve, reject) => {
        db.run(`
          UPDATE couriers 
          SET status = 'online',
              updated_at = datetime('now')
          WHERE id = ?
        `, [courier.id], (err) => {
          if (err) {
            console.error('Error updating courier status:', err.message);
            // Continuă chiar dacă actualizarea eșuează
            resolve();
          } else {
            resolve();
          }
        });
      });
    } catch (err) {
      // Continuă chiar dacă actualizarea statusului eșuează
      console.warn('Could not update courier status, but continuing with login:', err.message);
    }
    
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
 * ✅ CREATE INDEXES for performance (run once)
 * Optimizes: courier_id + status + delivered_at
 */
async function ensureDeliveryIndexes(db) {
  return new Promise((resolve) => {
    db.run(`CREATE INDEX IF NOT EXISTS idx_delivery_courier_status 
            ON delivery_assignments(courier_id, status, delivered_at DESC)`, () => {
      db.run(`CREATE INDEX IF NOT EXISTS idx_delivery_delivered 
              ON delivery_assignments(status, delivered_at DESC) WHERE status = 'delivered'`, () => {
        resolve();
      });
    });
  });
}

/**
 * GET /api/couriers/me/assignments - Comenzi alocate curier (app mobil)
 * FIXED: Returns delivered orders when ?status=delivered
 */
router.get('/me/assignments', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const { status } = req.query;
    
    if (!token) {
      return res.status(401).json({ error: 'Token lipsește' });
    }
    
    const db = await dbPromise;
    
    // Ensure indexes exist
    await ensureDeliveryIndexes(db);
    
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
    
    // Default: active orders
    let statusFilter = "('assigned', 'picked_up', 'in_transit')";
    if (status) {
      // Allow requesting specific statuses
      const statuses = status.split(',').map(s => `'${s.trim()}'`).join(',');
      statusFilter = `(${statuses})`;
    }
    
    const deliveries = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          da.id,
          da.order_id,
          da.courier_id,
          da.status,
          da.assigned_at as created_at,
          da.picked_up_at,
          da.delivered_at,
          da.delivery_fee,
          da.tip_amount,
          o.id as order_number, 
          o.customer_name, 
          o.customer_phone, 
          o.delivery_address,
          o.total, 
          o.payment_method, 
          o.platform, 
          o.items, 
          o.timestamp, 
          o.status as order_status
        FROM delivery_assignments da
        JOIN orders o ON da.order_id = o.id
        WHERE da.courier_id = ? AND da.status IN ${statusFilter}
        ORDER BY 
          CASE WHEN da.delivered_at IS NOT NULL THEN da.delivered_at ELSE da.assigned_at END DESC
      `, [courier.id], (err, rows) => {
        if (err) reject(err);
        else {
          if (rows && rows.length > 0) {
            console.log('✅ Query returned', rows.length, 'rows. First row keys:', Object.keys(rows[0]).join(', '));
            console.log('📦 First row delivery_fee:', rows[0].delivery_fee, ', tip_amount:', rows[0].tip_amount);
          }
          resolve(rows || []);
        }
      });
    });
    
    res.json({ 
      success: true, 
      deliveries: deliveries || [],
      assignments: deliveries || []
    });
  } catch (err) {
    console.error('Error fetching courier assignments:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * ✅ GET /api/couriers/me/history/delivered - PAGINATED delivered orders
 * Returns full order details with items, customer info, etc.
 * Query params: ?limit=50&offset=0
 */
router.get('/me/history/delivered', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const limit = Math.min(parseInt(req.query.limit) || 50, 100); // Max 100
    const offset = parseInt(req.query.offset) || 0;
    
    if (!token) {
      return res.status(401).json({ error: 'Token lipsește' });
    }
    
    const db = await dbPromise;
    
    // Ensure indexes exist
    await ensureDeliveryIndexes(db);
    
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
    
    // Get total count
    const total = await new Promise((resolve, reject) => {
      db.get(
        'SELECT COUNT(*) as count FROM delivery_assignments WHERE courier_id = ? AND status = ?',
        [courier.id, 'delivered'],
        (err, row) => {
          if (err) reject(err);
          else resolve(row?.count || 0);
        }
      );
    });
    
    // Get paginated delivered orders WITH full details
    const deliveries = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          da.id as delivery_id,
          da.order_id,
          da.courier_id,
          da.status,
          da.assigned_at,
          da.picked_up_at,
          da.delivered_at,
          da.delivery_fee,
          da.tip_amount,
          
          o.id as order_number,
          o.customer_name,
          o.customer_phone,
          o.delivery_address,
          o.total as order_total,
          o.payment_method,
          o.platform,
          o.items,
          o.timestamp as order_created_at,
          o.completed_timestamp,
          
          COUNT(oi.id) as items_count,
          SUM(oi.quantity) as total_items_qty
        FROM delivery_assignments da
        JOIN orders o ON da.order_id = o.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE da.courier_id = ? AND da.status = 'delivered'
        GROUP BY da.id
        ORDER BY da.delivered_at DESC
        LIMIT ? OFFSET ?
      `, [courier.id, limit, offset], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Format response with pagination
    res.json({ 
      success: true,
      pagination: {
        total,
        limit,
        offset,
        returned: deliveries.length,
        hasMore: (offset + deliveries.length) < total
      },
      deliveries: deliveries.map(d => ({
        ...d,
        items: d.items ? JSON.parse(d.items) : []
      })) || []
    });
  } catch (err) {
    console.error('Error fetching delivery history:', err);
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
    
    // Actualizează locația curierului
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE couriers 
         SET current_lat = ?, current_lng = ?, last_location_update = datetime('now')
         WHERE id = ?`,
        [lat, lng, courier.id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    console.log(`📍 Locație actualizată pentru curier ${courier.id}: ${lat}, ${lng}`);
    
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
    // Security: Use safe timestamp field (no template literal injection)
    let timestampUpdate = '';
    if (status === 'delivered') {
      timestampUpdate = ', delivered_at = datetime("now")';
    }
    
    await new Promise((resolve, reject) => {
      // Security: Use placeholders for all dynamic values
      db.run(`UPDATE delivery_assignments SET status = ?${timestampUpdate} WHERE id = ?`, [status, assignment.id], (err) => {
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
// DISPATCH ENDPOINTS
// =====================================================================

/**
 * POST /api/couriers/dispatch/assign - Alocare curier la comandă
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
    
    // Emit Socket.IO event
    if (global.io) {
      global.io.emit('delivery:assigned', {
        orderId: order_id,
        courierId: courier_id,
        assignmentId,
        timestamp: new Date()
      });
    }
    
    res.json({ success: true, assignmentId, message: 'Curier alocat cu succes' });
  } catch (err) {
    console.error('Error assigning courier:', err);
    res.status(500).json({ error: err.message });
  }
});

// =====================================================================
// CRUD CURIERI (Backward Compatibility - pentru admin)
// =====================================================================

/**
 * GET /api/couriers/:id/deliveries - Istoric livrări curier (backward compatibility)
 * Returnează datele grupate pe date calendaristice pentru istoric îmbunătățit
 */
router.get('/:id/deliveries', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0, status, grouped = 'false' } = req.query;
    const db = await dbPromise;
    
    let query = `
      SELECT 
        da.*,
        o.id as order_number, o.customer_name, o.delivery_address, o.total, o.timestamp, o.status as order_status,
        DATE(da.delivered_at) as delivery_date
      FROM delivery_assignments da
      JOIN orders o ON da.order_id = o.id
      WHERE da.courier_id = ?
    `;
    const params = [id];

    if (status) {
      const statuses = status.split(',').map(s => `'${s.trim()}'`).join(',');
      query += ` AND da.status IN (${statuses})`;
    }

    // Dacă grouped=true, returnează datele grupate pe date calendaristice
    if (grouped === 'true') {
      query += `
        AND da.delivered_at IS NOT NULL
        ORDER BY da.delivered_at DESC
      `;
      
      const deliveries = await new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
      
      // Grupează pe date calendaristice
      const groupedByDate = {};
      let totalEarnings = 0;
      
      deliveries.forEach(d => {
        const date = d.delivery_date || new Date(d.delivered_at).toISOString().split('T')[0];
        if (!groupedByDate[date]) {
          groupedByDate[date] = {
            date: date,
            deliveries: [],
            earnings: 0,
            count: 0
          };
        }
        
        const deliveryFee = parseFloat(d.delivery_fee || 0);
        const tipAmount = parseFloat(d.tip_amount || 0);
        const earnings = deliveryFee + tipAmount;
        
        groupedByDate[date].deliveries.push({
          ...d,
          earnings: earnings
        });
        groupedByDate[date].earnings += earnings;
        groupedByDate[date].count += 1;
        totalEarnings += earnings;
      });
      
      // Convertește în array și sortează descrescător după dată
      const groupedArray = Object.values(groupedByDate).sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
      
      return res.json({ 
        success: true, 
        grouped: true,
        totalEarnings: totalEarnings,
        byDate: groupedArray,
        deliveries: deliveries || [], // Pentru backward compatibility
        assignments: deliveries || [] // Alias for backward compatibility
      });
    }
    
    // Format normal (backward compatibility)
    query += `
      ORDER BY da.assigned_at DESC
      LIMIT ? OFFSET ?
    `;
    params.push(limit, offset);
    
    const deliveries = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Normalize response format - return both 'deliveries' and 'assignments' for compatibility
    res.json({ 
      success: true, 
      deliveries: deliveries || [],
      assignments: deliveries || [] // Alias for backward compatibility
    });
  } catch (err) {
    console.error('Error fetching courier deliveries:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

