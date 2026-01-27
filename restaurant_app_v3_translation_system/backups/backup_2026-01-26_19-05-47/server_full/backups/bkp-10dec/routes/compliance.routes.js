/**
 * 🛡️ CONFORMITATE & HACCP API ROUTES
 * 
 * Endpoints pentru gestionarea conformității și siguranței alimentare
 * - Jurnal temperaturi
 * - Plan curățenie
 * - Mentenanță echipamente
 */

const express = require('express');
const router = express.Router();
const { dbPromise } = require('../database');

function dbAll(db, query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

function dbGet(db, query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row || null);
    });
  });
}

function dbRun(db, query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

// ========================================
// EQUIPMENT - Echipamente
// ========================================

// GET /api/compliance/equipment - Listă echipamente
router.get('/equipment', async (req, res) => {
  try {
    const db = await dbPromise;
    const equipment = await dbAll(db, `
      SELECT * FROM compliance_equipment
      WHERE is_active = 1
      ORDER BY name
    `);
    res.json({ success: true, data: equipment });
  } catch (error) {
    console.error('❌ [COMPLIANCE] Eroare la obținerea echipamentelor:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/compliance/equipment - Creare echipament
router.post('/equipment', async (req, res) => {
  try {
    const { name, type, location, min_temp, max_temp } = req.body;
    const db = await dbPromise;
    
    const result = await dbRun(db, `
      INSERT INTO compliance_equipment (name, type, location, min_temp, max_temp)
      VALUES (?, ?, ?, ?, ?)
    `, [name, type, location || null, min_temp || null, max_temp || null]);
    
    res.json({ success: true, data: { id: result.lastID } });
  } catch (error) {
    console.error('❌ [COMPLIANCE] Eroare la crearea echipamentului:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/compliance/equipment/:id - Actualizare echipament
router.put('/equipment/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, location, min_temp, max_temp, is_active } = req.body;
    const db = await dbPromise;
    
    await dbRun(db, `
      UPDATE compliance_equipment
      SET name = ?, type = ?, location = ?, min_temp = ?, max_temp = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, type, location || null, min_temp || null, max_temp || null, is_active !== undefined ? is_active : 1, id]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('❌ [COMPLIANCE] Eroare la actualizarea echipamentului:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// TEMPERATURE LOG - Jurnal Temperaturi
// ========================================

// GET /api/compliance/temperature-log - Listă înregistrări temperaturi
router.get('/temperature-log', async (req, res) => {
  try {
    const { equipment_id, start_date, end_date, limit = 100 } = req.query;
    const db = await dbPromise;
    
    let query = `
      SELECT 
        tl.*,
        e.name as equipment_name,
        e.type as equipment_type,
        e.min_temp,
        e.max_temp,
        w.name as operator_name
      FROM compliance_temperature_log tl
      LEFT JOIN compliance_equipment e ON tl.equipment_id = e.id
      LEFT JOIN waiters w ON tl.operator_id = w.id
      WHERE 1=1
    `;
    const params = [];
    
    if (equipment_id) {
      query += ' AND tl.equipment_id = ?';
      params.push(equipment_id);
    }
    
    if (start_date) {
      query += ' AND DATE(tl.created_at) >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      query += ' AND DATE(tl.created_at) <= ?';
      params.push(end_date);
    }
    
    query += ' ORDER BY tl.created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const logs = await dbAll(db, query, params);
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('❌ [COMPLIANCE] Eroare la obținerea jurnalului temperaturi:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/compliance/temperature-log - Adăugare înregistrare temperatură
router.post('/temperature-log', async (req, res) => {
  try {
    const { equipment_id, temperature, operator_id, notes } = req.body;
    const db = await dbPromise;
    
    // Obține echipamentul pentru a determina status-ul
    const equipment = await dbGet(db, 'SELECT min_temp, max_temp FROM compliance_equipment WHERE id = ?', [equipment_id]);
    
    if (!equipment) {
      return res.status(404).json({ success: false, error: 'Echipamentul nu a fost găsit' });
    }
    
    // Determină status-ul bazat pe temperatură
    let status = 'ok';
    if (equipment.min_temp !== null && temperature < equipment.min_temp) {
      status = 'critical';
    } else if (equipment.max_temp !== null && temperature > equipment.max_temp) {
      status = 'critical';
    } else if (equipment.min_temp !== null && (temperature < equipment.min_temp + 2 || temperature > equipment.max_temp - 2)) {
      status = 'warning';
    }
    
    const result = await dbRun(db, `
      INSERT INTO compliance_temperature_log (equipment_id, temperature, operator_id, notes, status)
      VALUES (?, ?, ?, ?, ?)
    `, [equipment_id, temperature, operator_id || null, notes || null, status]);
    
    res.json({ success: true, data: { id: result.lastID, status } });
  } catch (error) {
    console.error('❌ [COMPLIANCE] Eroare la adăugarea înregistrării temperaturi:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// CLEANING SCHEDULE - Plan Curățenie
// ========================================

// GET /api/compliance/cleaning-schedule - Listă task-uri curățenie
router.get('/cleaning-schedule', async (req, res) => {
  try {
    const { status, overdue } = req.query;
    const db = await dbPromise;
    
    let query = `
      SELECT 
        cs.*,
        w1.name as assigned_to_name,
        w2.name as completed_by_name,
        (SELECT COUNT(*) FROM compliance_cleaning_checklist_items WHERE cleaning_schedule_id = cs.id) as total_items,
        (SELECT COUNT(*) FROM compliance_cleaning_checklist_items WHERE cleaning_schedule_id = cs.id AND is_checked = 1) as checked_items
      FROM compliance_cleaning_schedule cs
      LEFT JOIN waiters w1 ON cs.assigned_to = w1.id
      LEFT JOIN waiters w2 ON cs.completed_by = w2.id
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      query += ' AND cs.status = ?';
      params.push(status);
    }
    
    if (overdue === 'true') {
      query += ' AND cs.due_date < datetime("now") AND cs.status != "completed"';
    }
    
    query += ' ORDER BY cs.due_date ASC, cs.created_at DESC';
    
    const schedules = await dbAll(db, query, params);
    res.json({ success: true, data: schedules });
  } catch (error) {
    console.error('❌ [COMPLIANCE] Eroare la obținerea planului curățenie:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/compliance/cleaning-schedule - Creare task curățenie
router.post('/cleaning-schedule', async (req, res) => {
  try {
    const { title, description, frequency, shift_type, checklist_items, assigned_to, due_date } = req.body;
    const db = await dbPromise;
    
    const result = await dbRun(db, `
      INSERT INTO compliance_cleaning_schedule (title, description, frequency, shift_type, checklist_items, assigned_to, due_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [title, description || null, frequency, shift_type || null, JSON.stringify(checklist_items || []), assigned_to || null, due_date]);
    
    const scheduleId = result.lastID;
    
    // Creează checklist items
    if (checklist_items && checklist_items.length > 0) {
      for (const item of checklist_items) {
        await dbRun(db, `
          INSERT INTO compliance_cleaning_checklist_items (cleaning_schedule_id, item_text)
          VALUES (?, ?)
        `, [scheduleId, item]);
      }
    }
    
    res.json({ success: true, data: { id: scheduleId } });
  } catch (error) {
    console.error('❌ [COMPLIANCE] Eroare la crearea task-ului curățenie:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/compliance/cleaning-schedule/:id/complete - Completare task curățenie
router.put('/cleaning-schedule/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed_by, signature_image } = req.body;
    const db = await dbPromise;
    
    await dbRun(db, `
      UPDATE compliance_cleaning_schedule
      SET status = 'completed', completed_at = CURRENT_TIMESTAMP, completed_by = ?, signature_image = ?
      WHERE id = ?
    `, [completed_by, signature_image || null, id]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('❌ [COMPLIANCE] Eroare la completarea task-ului curățenie:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/compliance/cleaning-schedule/:id/checklist - Obține checklist pentru task
router.get('/cleaning-schedule/:id/checklist', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    const items = await dbAll(db, `
      SELECT 
        ci.*,
        w.name as checked_by_name
      FROM compliance_cleaning_checklist_items ci
      LEFT JOIN waiters w ON ci.checked_by = w.id
      WHERE ci.cleaning_schedule_id = ?
      ORDER BY ci.id
    `, [id]);
    
    res.json({ success: true, data: items });
  } catch (error) {
    console.error('❌ [COMPLIANCE] Eroare la obținerea checklist-ului:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/compliance/cleaning-schedule/:id/checklist/:item_id - Bifează item checklist
router.put('/cleaning-schedule/:id/checklist/:item_id', async (req, res) => {
  try {
    const { id, item_id } = req.params;
    const { is_checked, checked_by } = req.body;
    const db = await dbPromise;
    
    await dbRun(db, `
      UPDATE compliance_cleaning_checklist_items
      SET is_checked = ?, checked_at = CURRENT_TIMESTAMP, checked_by = ?
      WHERE id = ? AND cleaning_schedule_id = ?
    `, [is_checked ? 1 : 0, checked_by || null, item_id, id]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('❌ [COMPLIANCE] Eroare la actualizarea checklist-ului:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// EQUIPMENT MAINTENANCE - Mentenanță Echipamente
// ========================================

// GET /api/compliance/equipment-maintenance - Listă mentenanțe
router.get('/equipment-maintenance', async (req, res) => {
  try {
    const { equipment_id, status, scheduled_date } = req.query;
    const db = await dbPromise;
    
    let query = `
      SELECT 
        em.*,
        e.name as equipment_name,
        e.type as equipment_type,
        w.name as operator_name
      FROM compliance_equipment_maintenance em
      LEFT JOIN compliance_equipment e ON em.equipment_id = e.id
      LEFT JOIN waiters w ON em.operator_id = w.id
      WHERE 1=1
    `;
    const params = [];
    
    if (equipment_id) {
      query += ' AND em.equipment_id = ?';
      params.push(equipment_id);
    }
    
    if (status) {
      query += ' AND em.status = ?';
      params.push(status);
    }
    
    if (scheduled_date) {
      query += ' AND DATE(em.scheduled_date) = ?';
      params.push(scheduled_date);
    }
    
    query += ' ORDER BY em.scheduled_date DESC, em.created_at DESC';
    
    const maintenance = await dbAll(db, query, params);
    res.json({ success: true, data: maintenance });
  } catch (error) {
    console.error('❌ [COMPLIANCE] Eroare la obținerea mentenanțelor:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/compliance/equipment-maintenance - Creare mentenanță
router.post('/equipment-maintenance', async (req, res) => {
  try {
    const { equipment_id, maintenance_type, scheduled_date, description } = req.body;
    const db = await dbPromise;
    
    const result = await dbRun(db, `
      INSERT INTO compliance_equipment_maintenance (equipment_id, maintenance_type, scheduled_date, description, status)
      VALUES (?, ?, ?, ?, 'scheduled')
    `, [equipment_id, maintenance_type, scheduled_date, description || null]);
    
    res.json({ success: true, data: { id: result.lastID } });
  } catch (error) {
    console.error('❌ [COMPLIANCE] Eroare la crearea mentenanței:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/compliance/equipment-maintenance/:id/complete - Completare mentenanță
router.put('/equipment-maintenance/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { operator_id, result: resultValue, cost, documents } = req.body;
    const db = await dbPromise;
    
    await dbRun(db, `
      UPDATE compliance_equipment_maintenance
      SET status = 'completed', completed_date = CURRENT_TIMESTAMP, operator_id = ?, result = ?, cost = ?, documents = ?
      WHERE id = ?
    `, [operator_id || null, resultValue || null, cost || null, documents ? JSON.stringify(documents) : null, id]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('❌ [COMPLIANCE] Eroare la completarea mentenanței:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/compliance/equipment/:id/maintenance-history - Istoric mentenanțe pentru echipament
router.get('/equipment/:id/maintenance-history', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    const history = await dbAll(db, `
      SELECT 
        em.*,
        w.name as operator_name
      FROM compliance_equipment_maintenance em
      LEFT JOIN waiters w ON em.operator_id = w.id
      WHERE em.equipment_id = ?
      ORDER BY em.scheduled_date DESC
    `, [id]);
    
    res.json({ success: true, data: history });
  } catch (error) {
    console.error('❌ [COMPLIANCE] Eroare la obținerea istoricului mentenanțelor:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// DASHBOARD & REPORTS
// ========================================

// GET /api/compliance/dashboard/kpis - KPI-uri pentru dashboard
router.get('/dashboard/kpis', async (req, res) => {
  try {
    const db = await dbPromise;
    
    // Temperaturi OK (ultimele 24h)
    const temps24h = await dbGet(db, `
      SELECT COUNT(*) as count
      FROM compliance_temperature_log
      WHERE created_at >= datetime('now', '-24 hours') AND status = 'ok'
    `);
    
    // Task-uri overdue
    const overdue = await dbGet(db, `
      SELECT COUNT(*) as count
      FROM compliance_cleaning_schedule
      WHERE due_date < datetime('now') AND status != 'completed'
    `);
    
    // Mentenanțe programate această săptămână
    const maintenanceThisWeek = await dbGet(db, `
      SELECT COUNT(*) as count
      FROM compliance_equipment_maintenance
      WHERE DATE(scheduled_date) BETWEEN DATE('now', 'weekday 0', '-7 days') AND DATE('now', 'weekday 6')
      AND status IN ('scheduled', 'in_progress')
    `);
    
    // Conformitate % (task-uri completate / total)
    const compliance = await dbGet(db, `
      SELECT 
        (SELECT COUNT(*) FROM compliance_cleaning_schedule WHERE status = 'completed') * 100.0 / 
        NULLIF((SELECT COUNT(*) FROM compliance_cleaning_schedule), 0) as percentage
    `);
    
    res.json({
      success: true,
      data: {
        temperaturesOk24h: temps24h?.count || 0,
        cleaningTasksOverdue: overdue?.count || 0,
        maintenanceScheduledThisWeek: maintenanceThisWeek?.count || 0,
        compliancePercentage: compliance?.percentage || 0
      }
    });
  } catch (error) {
    console.error('❌ [COMPLIANCE] Eroare la obținerea KPI-urilor:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

