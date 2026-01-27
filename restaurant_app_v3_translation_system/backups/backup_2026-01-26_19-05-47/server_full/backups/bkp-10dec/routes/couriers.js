// =====================================================================
// API ROUTES: CURIERI (Delivery & Drive-Thru)
// Date: 2025-12-05
// =====================================================================

const express = require('express');
const router = express.Router();
const { dbPromise } = require('../database');
const { COURIER_STATUS, VEHICLE_TYPES } = require('../constants/delivery');
const bcrypt = require('bcrypt');

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

// =====================================================================
// CRUD CURIERI (Backward Compatibility - pentru admin)
// =====================================================================

/**
 * GET /api/couriers/:id/deliveries - Istoric livrări curier (backward compatibility)
 */
router.get('/:id/deliveries', checkAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0, status } = req.query;
    const db = await dbPromise;
    
    let query = `
      SELECT 
        da.*,
        o.order_number, o.customer_name, o.delivery_address, o.total, o.timestamp, o.status as order_status
      FROM delivery_assignments da
      JOIN orders o ON da.order_id = o.id
      WHERE da.courier_id = ?
    `;
    const params = [id];

    if (status) {
      const statuses = status.split(',').map(s => `'${s.trim()}'`).join(',');
      query += ` AND da.status IN (${statuses})`;
    }

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
    
    res.json({ success: true, deliveries });
  } catch (err) {
    console.error('Error fetching courier deliveries:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
