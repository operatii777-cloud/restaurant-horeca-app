/**
 * 👥 EMPLOYEES API - CRUD Angajați
 * Data: 3 Decembrie 2025
 */

const express = require('express');
const router = express.Router();
const { dbPromise } = require('../database');
const crypto = require('crypto');

// GET /api/employees - Lista angajați
router.get('/', async (req, res) => {
  try {
    const { role, status, location_id } = req.query;
    const db = await dbPromise;
    
    let sql = `SELECT * FROM employees WHERE 1=1`;
    const params = [];
    
    if (role) {
      sql += ` AND role = ?`;
      params.push(role);
    }
    
    if (status) {
      sql += ` AND status = ?`;
      params.push(status);
    } else {
      sql += ` AND status != 'terminated'`; // Exclude terminated by default
    }
    
    if (location_id) {
      sql += ` AND location_id = ?`;
      params.push(location_id);
    }
    
    sql += ` ORDER BY name ASC`;
    
    const employees = await new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, employees });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/employees - Creare angajat
router.post('/', async (req, res) => {
  try {
    const {
      name, role, phone, email, hourly_rate, hire_date,
      birth_date, address, emergency_contact, emergency_phone,
      location_id, notes
    } = req.body;
    
    if (!name || !role || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Nume, rol și telefon sunt obligatorii'
      });
    }
    
    const db = await dbPromise;
    
    // Generează cod unic
    const code = 'EMP-' + crypto.randomBytes(3).toString('hex').toUpperCase();
    
    const result = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO employees 
        (code, name, role, phone, email, hourly_rate, hire_date, birth_date, 
         address, emergency_contact, emergency_phone, location_id, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        code, name, role, phone, email, hourly_rate || 0, hire_date,
        birth_date, address, emergency_contact, emergency_phone,
        location_id || 1, notes
      ], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
    
    res.json({
      success: true,
      employee: {
        id: result.id,
        code,
        name,
        role
      }
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/employees/:id - Actualizare angajat
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, role, phone, email, hourly_rate,
      address, emergency_contact, emergency_phone,
      status, notes
    } = req.body;
    
    const db = await dbPromise;
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE employees 
        SET name = ?, role = ?, phone = ?, email = ?, hourly_rate = ?,
            address = ?, emergency_contact = ?, emergency_phone = ?,
            status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        name, role, phone, email, hourly_rate,
        address, emergency_contact, emergency_phone,
        status, notes, id
      ], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({ success: true, message: 'Angajat actualizat cu succes' });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/employees/:id - Ștergere angajat
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    // Verifică dacă are ture viitoare
    const futureShifts = await new Promise((resolve, reject) => {
      db.get(`
        SELECT COUNT(*) as count 
        FROM employee_shifts 
        WHERE employee_id = ? AND shift_date >= DATE('now')
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
    
    if (futureShifts > 0) {
      return res.status(400).json({
        success: false,
        error: `Angajatul are ${futureShifts} ture programate în viitor. Anulează-le mai întâi.`
      });
    }
    
    // Marchează ca terminated în loc de ștergere
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE employees 
        SET status = 'terminated', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({ success: true, message: 'Angajat marcat ca terminat' });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/employees/:id/schedule - Program angajat
router.get('/:id/schedule', async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    const db = await dbPromise;
    
    const shifts = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM employee_shifts
        WHERE employee_id = ?
          AND shift_date BETWEEN ? AND ?
        ORDER BY shift_date, start_time
      `, [id, startDate, endDate], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, shifts });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

