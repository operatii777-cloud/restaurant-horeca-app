/**
 * Compliance Controller
 * 
 * Endpoint-uri pentru gestionarea conformității (cleaning schedule, equipment maintenance, temperature log)
 */

const { dbPromise } = require('../../../database');
const haccpService = require('./haccp.service');

/**
 * POST /api/compliance/cleaning-schedule
 * Creează sau actualizează programul de curățenie
 */
async function createOrUpdateCleaningSchedule(req, res, next) {
  try {
    const { title, description, frequency, shift_type, checklist_items, assigned_to, due_date, status } = req.body;
    const db = await dbPromise;

    if (!title || !frequency) {
      return res.status(400).json({
        success: false,
        error: 'title, frequency sunt obligatorii'
      });
    }

    // Verifică dacă există deja (după title)
    const existing = await new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM compliance_cleaning_schedule WHERE title = ?`,
        [title],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    const checklistItemsJson = checklist_items ? JSON.stringify(checklist_items) : null;

    if (existing) {
      // Actualizează
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE compliance_cleaning_schedule 
           SET description = ?, frequency = ?, shift_type = ?, checklist_items = ?, assigned_to = ?, due_date = ?, status = ?
           WHERE title = ?`,
          [description || null, frequency, shift_type || null, checklistItemsJson, assigned_to || null, due_date || null, status || 'pending', title],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      res.json({
        success: true,
        message: 'Program de curățenie actualizat',
        id: existing.id
      });
    } else {
      // Creează nou
      const result = await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO compliance_cleaning_schedule (title, description, frequency, shift_type, checklist_items, assigned_to, due_date, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [title, description || null, frequency, shift_type || null, checklistItemsJson, assigned_to || null, due_date || null, status || 'pending'],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
          }
        );
      });

      res.json({
        success: true,
        message: 'Program de curățenie creat',
        id: result.id
      });
    }
  } catch (error) {
    console.error('Error in createOrUpdateCleaningSchedule:', error);
    next(error);
  }
}

/**
 * GET /api/compliance/equipment-maintenance
 * List all equipment maintenance records with optional filters
 */
async function getEquipmentMaintenance(req, res, next) {
  try {
    const db = await dbPromise;
    const { status, equipment_id, limit = 100, offset = 0 } = req.query;
    
    let query = `
      SELECT 
        em.*,
        e.name as equipment_name,
        e.type as equipment_type,
        e.location as equipment_location
      FROM compliance_equipment_maintenance em
      LEFT JOIN compliance_equipment e ON em.equipment_id = e.id
      WHERE 1=1
    `;
    
    const params = [];
    
    // Filter by status
    if (status) {
      query += ' AND em.status = ?';
      params.push(status);
    }
    
    // Filter by equipment_id
    if (equipment_id) {
      query += ' AND em.equipment_id = ?';
      params.push(parseInt(equipment_id));
    }
    
    // Order by date
    query += ' ORDER BY em.scheduled_date DESC, em.created_at DESC';
    
    // Pagination
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const rows = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error in getEquipmentMaintenance:', error);
    next(error);
  }
}

/**
 * POST /api/compliance/equipment-maintenance
 * Creează sau actualizează întreținerea echipamentelor
 */
async function createOrUpdateEquipmentMaintenance(req, res, next) {
  try {
    const { equipment_id, maintenance_type, scheduled_date, description, operator_id, cost, documents } = req.body;
    const db = await dbPromise;

    if (!equipment_id || !maintenance_type) {
      return res.status(400).json({
        success: false,
        error: 'equipment_id, maintenance_type sunt obligatorii'
      });
    }

    // Verifică dacă există echipamentul
    const equipment = await new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM compliance_equipment WHERE id = ?`,
        [equipment_id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!equipment) {
      return res.status(404).json({
        success: false,
        error: 'Echipamentul nu există'
      });
    }

    // Verifică dacă există deja întreținere (scheduled, in_progress)
    const existing = await new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM compliance_equipment_maintenance 
         WHERE equipment_id = ? AND maintenance_type = ? AND status IN ('scheduled', 'in_progress')`,
        [equipment_id, maintenance_type],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    const documentsJson = documents ? JSON.stringify(documents) : null;

    if (existing) {
      // Actualizează
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE compliance_equipment_maintenance 
           SET scheduled_date = ?, description = ?, operator_id = ?, cost = ?, documents = ?
           WHERE equipment_id = ? AND maintenance_type = ? AND status IN ('scheduled', 'in_progress')`,
          [scheduled_date || null, description || null, operator_id || null, cost || null, documentsJson, equipment_id, maintenance_type],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      res.json({
        success: true,
        message: 'Întreținere echipament actualizată',
        id: existing.id
      });
    } else {
      // Creează nou
      const result = await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO compliance_equipment_maintenance (equipment_id, maintenance_type, scheduled_date, description, operator_id, cost, documents, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled', CURRENT_TIMESTAMP)`,
          [equipment_id, maintenance_type, scheduled_date || null, description || null, operator_id || null, cost || null, documentsJson],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
          }
        );
      });

      res.json({
        success: true,
        message: 'Întreținere echipament creată',
        id: result.id
      });
    }
  } catch (error) {
    console.error('Error in createOrUpdateEquipmentMaintenance:', error);
    next(error);
  }
}

/**
 * POST /api/compliance/temperature-log
 * Creează log de temperatură (pentru conformitate HACCP)
 */
async function createTemperatureLog(req, res, next) {
  try {
    const { equipment_id, temperature, operator_id, notes } = req.body;
    const db = await dbPromise;

    if (!equipment_id || temperature === undefined) {
      return res.status(400).json({
        success: false,
        error: 'equipment_id, temperature sunt obligatorii'
      });
    }

    // Verifică dacă echipamentul există
    const equipment = await new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM compliance_equipment WHERE id = ?`,
        [equipment_id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!equipment) {
      return res.status(404).json({
        success: false,
        error: 'Echipamentul nu există'
      });
    }

    // Determină status bazat pe temperatură
    let status = 'ok';
    if (equipment.min_temp && temperature < equipment.min_temp) {
      status = 'critical';
    } else if (equipment.max_temp && temperature > equipment.max_temp) {
      status = 'critical';
    } else if (equipment.min_temp && temperature < (equipment.min_temp + 2)) {
      status = 'warning';
    } else if (equipment.max_temp && temperature > (equipment.max_temp - 2)) {
      status = 'warning';
    }

    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO compliance_temperature_log (equipment_id, temperature, operator_id, notes, status, created_at)
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [equipment_id, temperature, operator_id || null, notes || null, status],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    res.json({
      success: true,
      message: 'Log temperatură creat',
      id: result.id,
      equipment_id,
      temperature,
      status,
      recorded_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in createTemperatureLog:', error);
    next(error);
  }
}

/**
 * GET /api/compliance/dashboard/kpis
 * Obține KPI-uri generale pentru dashboard Compliance (nu HACCP specific)
 */
async function getComplianceDashboardKPIs(req, res, next) {
  try {
    const db = await dbPromise;
    
    // 1. Echipamente active
    const equipmentCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM compliance_equipment WHERE is_active = 1', (err, row) => {
        if (err) reject(err);
        else resolve(row?.count || 0);
      });
    });
    
    // 2. Loguri de temperatură din ultimele 24h
    const tempLogsToday = await new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as count FROM compliance_temperature_log 
         WHERE created_at >= datetime('now', '-24 hours')`,
        (err, row) => {
          if (err) reject(err);
          else resolve(row?.count || 0);
        }
      );
    });
    
    // 3. Alerte critice (temperaturi în afara limitelor)
    const criticalAlerts = await new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as count FROM compliance_temperature_log 
         WHERE status = 'critical' AND created_at >= datetime('now', '-24 hours')`,
        (err, row) => {
          if (err) reject(err);
          else resolve(row?.count || 0);
        }
      );
    });
    
    // 4. Curățenie programată restantă
    const overdueCleaning = await new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as count FROM compliance_cleaning_schedule 
         WHERE status = 'pending' AND due_date < date('now')`,
        (err, row) => {
          if (err) reject(err);
          else resolve(row?.count || 0);
        }
      );
    });
    
    // 5. Întrețineri programate
    const scheduledMaintenance = await new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as count FROM compliance_equipment_maintenance 
         WHERE status = 'scheduled'`,
        (err, row) => {
          if (err) reject(err);
          else resolve(row?.count || 0);
        }
      );
    });
    
    // Calculează rata de conformitate (simplificată: % echipamente fără alerte critice)
    const complianceRate = equipmentCount > 0 
      ? Math.round(((equipmentCount - criticalAlerts) / equipmentCount) * 100)
      : 100;
    
    res.json({
      success: true,
      data: {
        equipmentCount,
        tempLogsToday,
        criticalAlerts,
        overdueCleaning,
        scheduledMaintenance,
        complianceRate
      }
    });
  } catch (error) {
    console.error('Error in getComplianceDashboardKPIs:', error);
    next(error);
  }
}

/**
 * GET /api/compliance/cleaning-schedule
 * Listează programele de curățenie
 */
async function getCleaningSchedule(req, res, next) {
  try {
    const db = await dbPromise;
    const { overdue, status, limit = 100, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM compliance_cleaning_schedule WHERE 1=1';
    const params = [];
    
    if (overdue === 'true') {
      query += ` AND status = 'pending' AND due_date < date('now')`;
    }
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY due_date ASC, created_at DESC';
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const rows = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error in getCleaningSchedule:', error);
    next(error);
  }
}

/**
 * GET /api/compliance/temperature-log
 * Listează loguri de temperatură
 */
async function getTemperatureLogs(req, res, next) {
  try {
    const db = await dbPromise;
    const { equipment_id, status, limit = 100, offset = 0 } = req.query;
    
    let query = `
      SELECT 
        ctl.*,
        ce.name as equipment_name,
        ce.type as equipment_type,
        ce.location as equipment_location
      FROM compliance_temperature_log ctl
      LEFT JOIN compliance_equipment ce ON ctl.equipment_id = ce.id
      WHERE 1=1
    `;
    const params = [];
    
    if (equipment_id) {
      query += ' AND ctl.equipment_id = ?';
      params.push(parseInt(equipment_id));
    }
    
    if (status) {
      query += ' AND ctl.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY ctl.created_at DESC';
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const rows = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error in getTemperatureLogs:', error);
    next(error);
  }
}

// ==================== HACCP Controllers ====================

/**
 * GET /api/compliance/haccp/processes
 * Obține toate procesele HACCP
 */
async function getHaccpProcesses(req, res, next) {
  try {
    const processes = await haccpService.getAllProcesses();
    res.json({ success: true, data: processes });
  } catch (error) {
    console.error('Error in getHaccpProcesses:', error);
    next(error);
  }
}

/**
 * GET /api/compliance/haccp/processes/:processId/ccps
 * Obține toate CCP-urile pentru un proces
 */
async function getHaccpCCPs(req, res, next) {
  try {
    const { processId } = req.params;
    const ccps = await haccpService.getCCPsByProcess(parseInt(processId));
    res.json({ success: true, data: ccps });
  } catch (error) {
    console.error('Error in getHaccpCCPs:', error);
    next(error);
  }
}

/**
 * GET /api/compliance/haccp/ccps/:ccpId/limits
 * Obține toate limitele pentru un CCP
 */
async function getHaccpLimits(req, res, next) {
  try {
    const { ccpId } = req.params;
    const limits = await haccpService.getLimitsByCCP(parseInt(ccpId));
    res.json({ success: true, data: limits });
  } catch (error) {
    console.error('Error in getHaccpLimits:', error);
    next(error);
  }
}

/**
 * POST /api/compliance/haccp/monitoring
 * Înregistrează o monitorizare HACCP
 */
async function recordHaccpMonitoring(req, res, next) {
  try {
    const { ccp_id, parameter_name, measured_value, monitored_by, notes } = req.body;

    if (!ccp_id || !parameter_name || measured_value === undefined || measured_value === null) {
      return res.status(400).json({
        success: false,
        error: 'ccp_id, parameter_name, și measured_value sunt obligatorii'
      });
    }

    const monitoring = await haccpService.recordMonitoring(
      parseInt(ccp_id),
      parameter_name,
      parseFloat(measured_value),
      monitored_by || 1, // TODO: Use user_id from session
      notes || null
    );

    if (!monitoring) {
      return res.status(500).json({
        success: false,
        error: 'Monitorizarea nu a putut fi creată'
      });
    }

    res.json({
      success: true,
      data: monitoring,
      message: monitoring.status === 'critical' 
        ? 'Monitorizare înregistrată cu succes. ALERTĂ CRITICĂ declanșată!'
        : 'Monitorizare înregistrată cu succes'
    });
  } catch (error) {
    console.error('Error in recordHaccpMonitoring:', error);
    next(error);
  }
}

/**
 * GET /api/compliance/haccp/monitoring
 * Obține înregistrări de monitorizare (cu filtre opționale)
 */
async function getHaccpMonitoring(req, res, next) {
  try {
    const { ccp_id, status, date_from, date_to, limit = 100, offset = 0 } = req.query;
    
    const filters = {};
    if (ccp_id) filters.ccp_id = parseInt(ccp_id);
    if (status) filters.status = status;
    if (date_from) filters.date_from = date_from;
    if (date_to) filters.date_to = date_to;
    if (limit) filters.limit = parseInt(limit);
    if (offset) filters.offset = parseInt(offset);

    const records = await haccpService.getMonitoring(filters);
    res.json({ success: true, data: records });
  } catch (error) {
    console.error('Error in getHaccpMonitoring:', error);
    next(error);
  }
}

/**
 * GET /api/compliance/haccp/dashboard/kpis
 * Obține KPI-uri pentru dashboard HACCP
 */
async function getHaccpDashboardKPIs(req, res, next) {
  try {
    const kpis = await haccpService.getMonitoringStats();
    res.json({ success: true, data: kpis });
  } catch (error) {
    console.error('Error in getHaccpDashboardKPIs:', error);
    next(error);
  }
}

/**
 * POST /api/compliance/haccp/corrective-actions
 * Creează o acțiune corectivă
 */
async function createHaccpCorrectiveAction(req, res, next) {
  try {
    const { ccp_id, monitoring_id, action_taken, taken_by } = req.body;

    if (!ccp_id || !action_taken) {
      return res.status(400).json({
        success: false,
        error: 'ccp_id și action_taken sunt obligatorii'
      });
    }

    const action = await haccpService.createCorrectiveAction(
      parseInt(ccp_id),
      monitoring_id ? parseInt(monitoring_id) : null,
      action_taken,
      taken_by || 1 // TODO: Use user_id from session
    );

    res.json({
      success: true,
      data: action,
      message: 'Acțiune corectivă creată cu succes'
    });
  } catch (error) {
    console.error('Error in createHaccpCorrectiveAction:', error);
    next(error);
  }
}

/**
 * PUT /api/compliance/haccp/corrective-actions/:actionId/resolve
 * Marchează o acțiune corectivă ca rezolvată
 */
async function resolveHaccpCorrectiveAction(req, res, next) {
  try {
    const { actionId } = req.params;
    const { verification_notes } = req.body;

    const action = await haccpService.resolveCorrectiveAction(
      parseInt(actionId),
      verification_notes || null
    );

    res.json({
      success: true,
      data: action,
      message: 'Acțiune corectivă marcată ca rezolvată'
    });
  } catch (error) {
    console.error('Error in resolveHaccpCorrectiveAction:', error);
    next(error);
  }
}

/**
 * GET /api/compliance/haccp/corrective-actions
 * Obține toate acțiunile corective (cu filtre opționale)
 */
async function getAllCorrectiveActions(req, res, next) {
  try {
    const { resolved, ccp_id, limit = 50, offset = 0 } = req.query;
    const db = await dbPromise;
    
    let query = `
      SELECT 
        hca.*,
        hc.ccp_number,
        hc.hazard_description,
        hp.name as process_name,
        u1.username as taken_by_name
      FROM haccp_corrective_actions hca
      LEFT JOIN haccp_ccp hc ON hca.ccp_id = hc.id
      LEFT JOIN haccp_processes hp ON hc.process_id = hp.id
      LEFT JOIN users u1 ON hca.taken_by = u1.id
      WHERE 1=1
    `;
    
    const params = [];
    
    // Filter by resolved status
    if (resolved !== undefined) {
      query += ' AND hca.resolved = ?';
      params.push(resolved === 'true' || resolved === '1' ? 1 : 0);
    }
    
    // Filter by CCP
    if (ccp_id) {
      query += ' AND hca.ccp_id = ?';
      params.push(parseInt(ccp_id));
    }
    
    // Order by date
    query += ' ORDER BY hca.created_at DESC';
    
    // Pagination
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const rows = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error in getAllCorrectiveActions:', error);
    next(error);
  }
}

// ==================== EQUIPMENT CRUD ====================

/**
 * GET /api/compliance/equipment
 * Listează toate echipamentele
 */
async function getEquipment(req, res, next) {
  try {
    const db = await dbPromise;
    const { active_only } = req.query;
    
    let query = 'SELECT * FROM compliance_equipment';
    const params = [];
    
    if (active_only === 'true') {
      query += ' WHERE is_active = 1';
    }
    
    query += ' ORDER BY name ASC';
    
    const rows = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error in getEquipment:', error);
    next(error);
  }
}

/**
 * GET /api/compliance/equipment/:id
 * Detalii echipament
 */
async function getEquipmentById(req, res, next) {
  try {
    const db = await dbPromise;
    const { id } = req.params;
    
    const equipment = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM compliance_equipment WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!equipment) {
      return res.status(404).json({ success: false, error: 'Echipamentul nu există' });
    }
    
    res.json({ success: true, data: equipment });
  } catch (error) {
    console.error('Error in getEquipmentById:', error);
    next(error);
  }
}

/**
 * POST /api/compliance/equipment
 * Creează echipament nou
 */
async function createEquipment(req, res, next) {
  try {
    const db = await dbPromise;
    const { name, type, location, min_temp, max_temp, is_active } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ success: false, error: 'name și type sunt obligatorii' });
    }
    
    const validTypes = ['fridge', 'freezer', 'hot_holding', 'receiving', 'other'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        success: false, 
        error: `type invalid. Valori acceptate: ${validTypes.join(', ')}` 
      });
    }
    
    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO compliance_equipment (name, type, location, min_temp, max_temp, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [name, type, location || null, min_temp || null, max_temp || null, is_active !== false ? 1 : 0],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
    
    res.status(201).json({ success: true, message: 'Echipament creat', id: result.id });
  } catch (error) {
    console.error('Error in createEquipment:', error);
    next(error);
  }
}

/**
 * PUT /api/compliance/equipment/:id
 * Actualizează echipament
 */
async function updateEquipment(req, res, next) {
  try {
    const db = await dbPromise;
    const { id } = req.params;
    const { name, type, location, min_temp, max_temp, is_active } = req.body;
    
    // Verifică dacă există
    const existing = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM compliance_equipment WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Echipamentul nu există' });
    }
    
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE compliance_equipment 
         SET name = ?, type = ?, location = ?, min_temp = ?, max_temp = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          name || existing.name,
          type || existing.type,
          location !== undefined ? location : existing.location,
          min_temp !== undefined ? min_temp : existing.min_temp,
          max_temp !== undefined ? max_temp : existing.max_temp,
          is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
          id
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    res.json({ success: true, message: 'Echipament actualizat' });
  } catch (error) {
    console.error('Error in updateEquipment:', error);
    next(error);
  }
}

/**
 * DELETE /api/compliance/equipment/:id
 * Șterge echipament (soft delete - setează is_active = 0)
 */
async function deleteEquipment(req, res, next) {
  try {
    const db = await dbPromise;
    const { id } = req.params;
    
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE compliance_equipment SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    res.json({ success: true, message: 'Echipament dezactivat' });
  } catch (error) {
    console.error('Error in deleteEquipment:', error);
    next(error);
  }
}

/**
 * POST /api/compliance/equipment/populate-template
 * Populează echipamentele standard pentru un restaurant
 */
async function populateEquipmentTemplate(req, res, next) {
  try {
    const db = await dbPromise;
    
    // Template echipamente standard restaurant
    const standardEquipment = [
      // Frigidere (2°C - 8°C)
      { name: 'Frigider Principal Bucătărie', type: 'fridge', location: 'Bucătărie', min_temp: 2, max_temp: 8 },
      { name: 'Frigider Legume & Fructe', type: 'fridge', location: 'Bucătărie', min_temp: 4, max_temp: 8 },
      { name: 'Frigider Lactate & Ouă', type: 'fridge', location: 'Bucătărie', min_temp: 2, max_temp: 6 },
      { name: 'Frigider Sosuri & Preparate Reci', type: 'fridge', location: 'Bucătărie', min_temp: 2, max_temp: 6 },
      { name: 'Frigider Deserturi', type: 'fridge', location: 'Patiserie', min_temp: 2, max_temp: 6 },
      { name: 'Frigider Bar', type: 'fridge', location: 'Bar', min_temp: 2, max_temp: 8 },
      { name: 'Frigider Depozit', type: 'fridge', location: 'Depozit', min_temp: 2, max_temp: 8 },
      
      // Congelatoare (-18°C - -15°C)
      { name: 'Congelator Carne', type: 'freezer', location: 'Depozit', min_temp: -20, max_temp: -18 },
      { name: 'Congelator Pește & Fructe de Mare', type: 'freezer', location: 'Depozit', min_temp: -22, max_temp: -18 },
      { name: 'Congelator Produse Semifabricate', type: 'freezer', location: 'Bucătărie', min_temp: -20, max_temp: -18 },
      { name: 'Congelator Înghețată & Deserturi', type: 'freezer', location: 'Patiserie', min_temp: -22, max_temp: -18 },
      
      // Menținere caldă (63°C - 85°C) - pentru bufet/linie servire
      { name: 'Bain-Marie Linie Caldă 1', type: 'hot_holding', location: 'Bucătărie - Linie Servire', min_temp: 63, max_temp: 85 },
      { name: 'Bain-Marie Linie Caldă 2', type: 'hot_holding', location: 'Bucătărie - Linie Servire', min_temp: 63, max_temp: 85 },
      { name: 'Vitrină Caldă Bufet', type: 'hot_holding', location: 'Sala Restaurant', min_temp: 65, max_temp: 80 },
      
      // Zona recepție marfă
      { name: 'Zonă Recepție Marfă', type: 'receiving', location: 'Recepție', min_temp: null, max_temp: 15 },
    ];
    
    let inserted = 0;
    let skipped = 0;
    
    for (const eq of standardEquipment) {
      // Verifică dacă există deja (după nume)
      const existing = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM compliance_equipment WHERE name = ?', [eq.name], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      if (existing) {
        skipped++;
        continue;
      }
      
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO compliance_equipment (name, type, location, min_temp, max_temp, is_active, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [eq.name, eq.type, eq.location, eq.min_temp, eq.max_temp],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      inserted++;
    }
    
    res.json({ 
      success: true, 
      message: `Template echipamente populate: ${inserted} adăugate, ${skipped} existente (skip)`,
      inserted,
      skipped,
      total: standardEquipment.length
    });
  } catch (error) {
    console.error('Error in populateEquipmentTemplate:', error);
    next(error);
  }
}

module.exports = {
  // General Compliance
  getComplianceDashboardKPIs,
  getCleaningSchedule,
  createOrUpdateCleaningSchedule,
  getTemperatureLogs,
  getEquipmentMaintenance,
  createOrUpdateEquipmentMaintenance,
  createTemperatureLog,
  // HACCP
  getHaccpProcesses,
  getHaccpCCPs,
  getHaccpLimits,
  recordHaccpMonitoring,
  getHaccpMonitoring,
  getHaccpDashboardKPIs,
  createHaccpCorrectiveAction,
  resolveHaccpCorrectiveAction,
  getAllCorrectiveActions,
  // Equipment CRUD
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  populateEquipmentTemplate,
  populateHaccpTemplate
};

/**
 * POST /api/compliance/haccp/populate-template
 * Populează baza de date cu procese HACCP, CCP-uri și limite standard pentru un restaurant
 */
async function populateHaccpTemplate(req, res, next) {
  try {
    const db = await dbPromise;
    
    let insertedProcesses = 0;
    let insertedCCPs = 0;
    let insertedLimits = 0;
    let skippedProcesses = 0;
    let skippedCCPs = 0;
    let skippedLimits = 0;
    
    // ==================== PROCESE HACCP ====================
    const haccpProcesses = [
      {
        name: 'Recepție Materii Prime',
        description: 'Verificarea calității, temperaturii și documentelor la recepția mărfurilor',
        category: 'receiving',
        sort_order: 1
      },
      {
        name: 'Depozitare la Rece',
        description: 'Păstrarea alimentelor perisabile în frigidere și congelatoare',
        category: 'storage',
        sort_order: 2
      },
      {
        name: 'Preparare Alimente',
        description: 'Spălare, curățare, tăiere și preparare ingrediente crude',
        category: 'preparation',
        sort_order: 3
      },
      {
        name: 'Tratament Termic (Gătire)',
        description: 'Procesarea termică a alimentelor pentru eliminarea patogenilor',
        category: 'cooking',
        sort_order: 4
      },
      {
        name: 'Menținere Caldă',
        description: 'Păstrarea preparatelor gata servite la temperatura corectă',
        category: 'serving',
        sort_order: 5
      },
      {
        name: 'Răcire Rapidă',
        description: 'Răcirea controlată a preparatelor care vor fi recondienționate',
        category: 'other',
        sort_order: 6
      },
      {
        name: 'Servire Mese',
        description: 'Prezentarea și servirea finală către client',
        category: 'serving',
        sort_order: 7
      }
    ];
    
    const processIdMap = {};
    
    for (const proc of haccpProcesses) {
      const existing = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM haccp_processes WHERE name = ?', [proc.name], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      if (existing) {
        processIdMap[proc.name] = existing.id;
        skippedProcesses++;
        continue;
      }
      
      const processId = await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO haccp_processes (name, description, category, sort_order, is_active, created_at, updated_at)
           VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [proc.name, proc.description, proc.category, proc.sort_order],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
      
      processIdMap[proc.name] = processId;
      insertedProcesses++;
    }
    
    // ==================== CCP-uri (Puncte Critice de Control) ====================
    const haccpCCPs = [
      // Recepție
      {
        process: 'Recepție Materii Prime',
        ccp_number: 'CCP-1',
        hazard_type: 'biological',
        hazard_description: 'Dezvoltare microbiană din cauza temperaturii inadecvate la livrare',
        control_measure: 'Verificare temperatură produse perisabile cu termometru calibrat'
      },
      {
        process: 'Recepție Materii Prime',
        ccp_number: 'CCP-2',
        hazard_type: 'physical',
        hazard_description: 'Contaminare fizică - ambalaje deteriorate, corpuri străine',
        control_measure: 'Inspecție vizuală ambalaje, respingere loturi compromise'
      },
      
      // Depozitare
      {
        process: 'Depozitare la Rece',
        ccp_number: 'CCP-3',
        hazard_type: 'biological',
        hazard_description: 'Multiplicare bacteriană în frigidere/congelatoare defecte',
        control_measure: 'Monitorizare continuă temperatură (2-8°C frigider, -18°C congelator)'
      },
      {
        process: 'Depozitare la Rece',
        ccp_number: 'CCP-4',
        hazard_type: 'chemical',
        hazard_description: 'Contaminare încrucișată chimică (detergenți, alergeni)',
        control_measure: 'Separare produse chimice, etichetare clară, FIFO'
      },
      
      // Preparare
      {
        process: 'Preparare Alimente',
        ccp_number: 'CCP-5',
        hazard_type: 'biological',
        hazard_description: 'Contaminare încrucișată între alimente crude și preparate',
        control_measure: 'Utilizare planșete separate (roșu carne, verde legume, albastru pește)'
      },
      {
        process: 'Preparare Alimente',
        ccp_number: 'CCP-6',
        hazard_type: 'physical',
        hazard_description: 'Prezența corpuri străine (metal, plastic, păr)',
        control_measure: 'Purtare echipament protecție (bonetă, mănuși), inspecție vizuală'
      },
      
      // Gătire
      {
        process: 'Tratament Termic (Gătire)',
        ccp_number: 'CCP-7',
        hazard_type: 'biological',
        hazard_description: 'Supraviețuire patogeni (Salmonella, E.coli, Listeria) - gătire incompletă',
        control_measure: 'Verificare temperatură internă minimum 75°C (carne) / 63°C (pește)'
      },
      {
        process: 'Tratament Termic (Gătire)',
        ccp_number: 'CCP-8',
        hazard_type: 'chemical',
        hazard_description: 'Formare compuși toxici (acrilamidă) din prăjire excesivă',
        control_measure: 'Control temperatură ulei (<180°C), schimbare ulei conform program'
      },
      
      // Menținere Caldă
      {
        process: 'Menținere Caldă',
        ccp_number: 'CCP-9',
        hazard_type: 'biological',
        hazard_description: 'Recontaminare și multiplicare bacteriană sub 63°C',
        control_measure: 'Menținere temperatura >63°C în bain-marie / vitrină caldă'
      },
      {
        process: 'Menținere Caldă',
        ccp_number: 'CCP-10',
        hazard_type: 'biological',
        hazard_description: 'Depășire timp maxim menținere la cald (>4 ore)',
        control_measure: 'Etichetare cu ora start, eliminare după 4 ore'
      },
      
      // Răcire
      {
        process: 'Răcire Rapidă',
        ccp_number: 'CCP-11',
        hazard_type: 'biological',
        hazard_description: 'Multiplicare sporită bacterii în zona de temperatură periculoasă (5-60°C)',
        control_measure: 'Răcire de la 60°C la 10°C în max 2 ore, apoi <5°C'
      },
      
      // Servire
      {
        process: 'Servire Mese',
        ccp_number: 'CCP-12',
        hazard_type: 'biological',
        hazard_description: 'Contaminare prin manipulare neigienică (mâini, ustensile)',
        control_measure: 'Spălare mâini, utilizare clești/linguri, nu atingere directă'
      },
      {
        process: 'Servire Mese',
        ccp_number: 'CCP-13',
        hazard_type: 'chemical',
        hazard_description: 'Reacții alergice severe (alergeni declarați incorect)',
        control_measure: 'Etichetare corectă alergeni în meniu, instruire personal'
      }
    ];
    
    const ccpIdMap = {};
    
    for (const ccp of haccpCCPs) {
      const processId = processIdMap[ccp.process];
      if (!processId) {
        console.warn(`⚠️ Proces "${ccp.process}" nu a fost găsit, skip CCP ${ccp.ccp_number}`);
        continue;
      }
      
      const existing = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM haccp_ccp WHERE ccp_number = ? AND process_id = ?', 
          [ccp.ccp_number, processId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      if (existing) {
        ccpIdMap[ccp.ccp_number] = existing.id;
        skippedCCPs++;
        continue;
      }
      
      const ccpId = await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO haccp_ccp (process_id, ccp_number, hazard_type, hazard_description, control_measure, is_active, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [processId, ccp.ccp_number, ccp.hazard_type, ccp.hazard_description, ccp.control_measure],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
      
      ccpIdMap[ccp.ccp_number] = ccpId;
      insertedCCPs++;
    }
    
    // ==================== LIMITE CRITICE ====================
    // monitoring_frequency: 'every_batch', 'hourly', 'daily', 'weekly'
    const haccpLimits = [
      // CCP-1: Recepție - Temperatură produse refrigerate
      {
        ccp: 'CCP-1',
        parameter_name: 'temperature',
        min_value: 0,
        max_value: 8,
        target_value: 4,
        unit: '°C',
        monitoring_frequency: 'every_batch' // La fiecare livrare
      },
      // CCP-1: Recepție - Temperatură produse congelate
      {
        ccp: 'CCP-1',
        parameter_name: 'temperature_frozen',
        min_value: -22,
        max_value: -15,
        target_value: -18,
        unit: '°C',
        monitoring_frequency: 'every_batch' // La fiecare livrare
      },
      
      // CCP-3: Frigider general (3x/zi = every 8 hours ≈ hourly când e monitorizat)
      {
        ccp: 'CCP-3',
        parameter_name: 'temperature',
        min_value: 2,
        max_value: 8,
        target_value: 4,
        unit: '°C',
        monitoring_frequency: 'daily' // De 3 ori pe zi
      },
      // CCP-3: Congelator
      {
        ccp: 'CCP-3',
        parameter_name: 'temperature_freezer',
        min_value: -22,
        max_value: -15,
        target_value: -18,
        unit: '°C',
        monitoring_frequency: 'daily' // De 2 ori pe zi
      },
      
      // CCP-5: Timp preparare (alimente perisabile la temperatura camerei)
      {
        ccp: 'CCP-5',
        parameter_name: 'time',
        min_value: 0,
        max_value: 30,
        target_value: 15,
        unit: 'minute',
        monitoring_frequency: 'hourly' // Continuu (verificare orară)
      },
      
      // CCP-7: Temperatură internă carne
      {
        ccp: 'CCP-7',
        parameter_name: 'temperature',
        min_value: 75,
        max_value: 95,
        target_value: 80,
        unit: '°C',
        monitoring_frequency: 'every_batch' // La fiecare lot preparat
      },
      // CCP-7: Temperatură internă pește
      {
        ccp: 'CCP-7',
        parameter_name: 'temperature_fish',
        min_value: 63,
        max_value: 85,
        target_value: 70,
        unit: '°C',
        monitoring_frequency: 'every_batch' // La fiecare lot preparat
      },
      
      // CCP-8: Temperatură ulei prăjit
      {
        ccp: 'CCP-8',
        parameter_name: 'temperature',
        min_value: 150,
        max_value: 180,
        target_value: 170,
        unit: '°C',
        monitoring_frequency: 'every_batch' // La fiecare utilizare
      },
      // CCP-8: Utilizări ulei (schimbat după X utilizări)
      {
        ccp: 'CCP-8',
        parameter_name: 'oil_usage_count',
        min_value: 0,
        max_value: 8,
        target_value: 5,
        unit: 'utilizări',
        monitoring_frequency: 'daily' // Zilnic
      },
      
      // CCP-9: Menținere caldă
      {
        ccp: 'CCP-9',
        parameter_name: 'temperature',
        min_value: 63,
        max_value: 85,
        target_value: 70,
        unit: '°C',
        monitoring_frequency: 'hourly' // Orar
      },
      
      // CCP-10: Timp maxim menținere la cald
      {
        ccp: 'CCP-10',
        parameter_name: 'time',
        min_value: 0,
        max_value: 240,
        target_value: 180,
        unit: 'minute',
        monitoring_frequency: 'hourly' // Continuu (verificare orară)
      },
      
      // CCP-11: Răcire rapidă - Etapa 1 (60°C → 10°C)
      {
        ccp: 'CCP-11',
        parameter_name: 'cooling_time_stage1',
        min_value: 0,
        max_value: 120,
        target_value: 90,
        unit: 'minute',
        monitoring_frequency: 'every_batch' // La fiecare lot răcit
      },
      // CCP-11: Răcire rapidă - Etapa 2 (10°C → 5°C)
      {
        ccp: 'CCP-11',
        parameter_name: 'cooling_time_stage2',
        min_value: 0,
        max_value: 240,
        target_value: 180,
        unit: 'minute',
        monitoring_frequency: 'every_batch' // La fiecare lot răcit
      },
      
      // CCP-12: Igienă personal (spălări mâini pe tură)
      {
        ccp: 'CCP-12',
        parameter_name: 'handwash_count',
        min_value: 8,
        max_value: null,
        target_value: 15,
        unit: 'spălări/tură',
        monitoring_frequency: 'daily' // Zilnic
      },
      
      // CCP-13: Etichetare alergeni (produse cu alergeni etichetate corect)
      {
        ccp: 'CCP-13',
        parameter_name: 'allergen_compliance',
        min_value: 100,
        max_value: 100,
        target_value: 100,
        unit: '%',
        monitoring_frequency: 'weekly' // Săptămânal
      }
    ];
    
    for (const limit of haccpLimits) {
      const ccpId = ccpIdMap[limit.ccp];
      if (!ccpId) {
        console.warn(`⚠️ CCP "${limit.ccp}" nu a fost găsit, skip limită ${limit.parameter_name}`);
        continue;
      }
      
      const existing = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM haccp_limits WHERE ccp_id = ? AND parameter_name = ?', 
          [ccpId, limit.parameter_name], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      if (existing) {
        skippedLimits++;
        continue;
      }
      
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO haccp_limits (ccp_id, parameter_name, min_value, max_value, target_value, unit, monitoring_frequency, is_active, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [ccpId, limit.parameter_name, limit.min_value, limit.max_value, limit.target_value, limit.unit, limit.monitoring_frequency],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
      
      insertedLimits++;
    }
    
    // ==================== RĂSPUNS ====================
    res.json({
      success: true,
      message: `Template HACCP populat cu succes! 
        Procese: ${insertedProcesses} adăugate, ${skippedProcesses} existente
        CCP-uri: ${insertedCCPs} adăugate, ${skippedCCPs} existente
        Limite: ${insertedLimits} adăugate, ${skippedLimits} existente`,
      data: {
        processes: { inserted: insertedProcesses, skipped: skippedProcesses, total: haccpProcesses.length },
        ccps: { inserted: insertedCCPs, skipped: skippedCCPs, total: haccpCCPs.length },
        limits: { inserted: insertedLimits, skipped: skippedLimits, total: haccpLimits.length }
      }
    });
    
  } catch (error) {
    console.error('❌ Error in populateHaccpTemplate:', error);
    next(error);
  }
}

