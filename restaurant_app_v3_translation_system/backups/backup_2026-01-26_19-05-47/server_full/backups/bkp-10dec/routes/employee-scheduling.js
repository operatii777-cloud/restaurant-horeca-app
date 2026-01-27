/**
 * Employee Scheduling API Routes
 * Programare ture, time clock, payroll
 */
const express = require('express');
const router = express.Router();
const { dbPromise } = require('../database');

// ==================== SHIFTS ====================

// GET /api/scheduling/shifts
router.get('/shifts', async (req, res) => {
  try {
    const { startDate, endDate, employee_id, location_id } = req.query;
    const db = await dbPromise;
    
    let sql = `
      SELECT es.*, u.name as employee_name, u.email as employee_email
      FROM employee_shifts es
      LEFT JOIN users u ON es.employee_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (startDate) {
      sql += ` AND es.shift_date >= ?`;
      params.push(startDate);
    }
    
    if (endDate) {
      sql += ` AND es.shift_date <= ?`;
      params.push(endDate);
    }
    
    if (employee_id) {
      sql += ` AND es.employee_id = ?`;
      params.push(employee_id);
    }
    
    if (location_id) {
      sql += ` AND es.location_id = ?`;
      params.push(location_id);
    }
    
    sql += ` ORDER BY es.shift_date, es.start_time`;
    
    const shifts = await new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, shifts });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/scheduling/shifts
router.post('/shifts', async (req, res) => {
  try {
    const { employee_id, shift_date, start_time, end_time, break_duration, position, location_id, notes, status } = req.body;
    const db = await dbPromise;
    
    const result = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO employee_shifts 
        (employee_id, shift_date, start_time, end_time, break_duration, position, location_id, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [employee_id || null, shift_date, start_time, end_time, break_duration || 30, position, location_id || 1, status || 'scheduled', notes], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
    
    res.json({ success: true, shiftId: result.id });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/scheduling/shifts/:id
router.put('/shifts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { employee_id, shift_date, start_time, end_time, break_duration, position, status, notes } = req.body;
    const db = await dbPromise;
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE employee_shifts 
        SET employee_id = ?, shift_date = ?, start_time = ?, end_time = ?, 
            break_duration = ?, position = ?, status = ?, notes = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [employee_id || null, shift_date, start_time, end_time, break_duration, position, status, notes, id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({ success: true, message: 'Tură actualizată' });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/scheduling/shifts/:id
router.delete('/shifts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    await new Promise((resolve, reject) => {
      db.run(`DELETE FROM employee_shifts WHERE id = ?`, [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({ success: true, message: 'Tură ștearsă' });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/scheduling/shifts/duplicate-week
router.post('/shifts/duplicate-week', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const db = await dbPromise;
    
    // Obține turele din săptămâna curentă
    const shifts = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM employee_shifts
        WHERE shift_date BETWEEN ? AND ?
        ORDER BY shift_date, start_time
      `, [startDate, endDate], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Duplică pentru săptămâna următoare
    let created = 0;
    
    for (const shift of shifts) {
      const oldDate = new Date(shift.shift_date);
      const newDate = new Date(oldDate);
      newDate.setDate(oldDate.getDate() + 7);
      const newDateStr = newDate.toISOString().split('T')[0];
      
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO employee_shifts 
          (employee_id, shift_date, start_time, end_time, break_duration, position, location_id, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled')
        `, [
          shift.employee_id, newDateStr, shift.start_time, shift.end_time,
          shift.break_duration, shift.position, shift.location_id
        ], function(err) {
          if (err) reject(err);
          else {
            created++;
            resolve();
          }
        });
      });
    }
    
    res.json({ success: true, created, message: `${created} ture duplicate cu succes!` });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/scheduling/shifts/:id
router.put('/shifts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { employee_id, shift_date, start_time, end_time, break_duration, position, status, notes } = req.body;
    const db = await dbPromise;
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE employee_shifts 
        SET employee_id = ?, shift_date = ?, start_time = ?, end_time = ?, 
            break_duration = ?, position = ?, status = ?, notes = ?, updated_at = datetime('now')
        WHERE id = ?
      `, [employee_id, shift_date, start_time, end_time, break_duration, position, status, notes, id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({ success: true });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/scheduling/shifts/:id
router.delete('/shifts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM employee_shifts WHERE id = ?', [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({ success: true });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/scheduling/live-stats
// Dashboard live - câți angajați sunt în tură acum
router.get('/live-stats', async (req, res) => {
  try {
    const db = await dbPromise;
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM
    const today = now.toISOString().split('T')[0];
    
    // Angajați în tură acum
    const onShift = await new Promise((resolve, reject) => {
      db.get(`
        SELECT COUNT(*) as count
        FROM employee_shifts
        WHERE shift_date = ?
          AND start_time <= ?
          AND end_time >= ?
          AND status IN ('confirmed', 'on_shift')
      `, [today, currentTime, currentTime], (err, row) => {
        if (err) reject(err);
        else resolve(row?.count || 0);
      });
    });
    
    // Urmează în următoarele 2 ore
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000).toTimeString().slice(0, 5);
    const upcoming = await new Promise((resolve, reject) => {
      db.get(`
        SELECT COUNT(*) as count
        FROM employee_shifts
        WHERE shift_date = ?
          AND start_time > ?
          AND start_time <= ?
          AND status IN ('scheduled', 'confirmed')
      `, [today, currentTime, twoHoursLater], (err, row) => {
        if (err) reject(err);
        else resolve(row?.count || 0);
      });
    });
    
    // În pauză (placeholder - ar trebui tracking din time_clock)
    const onBreak = 0;
    
    // Întârziați (placeholder - ar trebui comparare cu time_clock)
    const late = 0;
    
    res.json({
      success: true,
      stats: {
        on_shift: onShift,
        upcoming_2h: upcoming,
        on_break: onBreak,
        late: late
      }
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/scheduling/shifts/generate
// Generează ture din template-uri
router.post('/shifts/generate', async (req, res) => {
  try {
    const { startDate, endDate, location_id } = req.body;
    const db = await dbPromise;
    
    const templates = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM shift_templates WHERE is_active = 1', (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    let created = 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      const dateStr = d.toISOString().split('T')[0];
      
      for (const template of templates) {
        if (template.day_of_week === dayOfWeek) {
          // Verifică dacă există deja
          const existing = await new Promise((resolve, reject) => {
            db.get(`
              SELECT id FROM employee_shifts 
              WHERE shift_date = ? AND start_time = ? AND end_time = ?
            `, [dateStr, template.start_time, template.end_time], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          });
          
          if (!existing) {
            await new Promise((resolve, reject) => {
              db.run(`
                INSERT INTO employee_shifts 
                (shift_date, start_time, end_time, break_duration, position, location_id, status)
                VALUES (?, ?, ?, ?, ?, ?, 'scheduled')
              `, [dateStr, template.start_time, template.end_time, template.break_duration, template.position, location_id], (err) => {
                if (err) reject(err);
                else { created++; resolve(); }
              });
            });
          }
        }
      }
    }
    
    res.json({ success: true, created });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== TIME CLOCK ====================

// POST /api/scheduling/clock-in
router.post('/clock-in', async (req, res) => {
  try {
    const { employee_id, shift_id } = req.body;
    const db = await dbPromise;
    
    // Verifică dacă nu e deja clock-in
    const existing = await new Promise((resolve, reject) => {
      db.get(`
        SELECT id FROM time_clock_entries 
        WHERE employee_id = ? AND clock_out IS NULL
      `, [employee_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (existing) {
      return res.status(400).json({ success: false, error: 'Angajatul este deja pontat' });
    }
    
    const result = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO time_clock_entries (employee_id, clock_in, shift_id, status)
        VALUES (?, datetime('now'), ?, 'clocked_in')
      `, [employee_id, shift_id], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
    
    res.json({ success: true, entryId: result.id });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/scheduling/clock-out
router.post('/clock-out', async (req, res) => {
  try {
    const { employee_id, notes } = req.body;
    const db = await dbPromise;
    
    const entry = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM time_clock_entries 
        WHERE employee_id = ? AND clock_out IS NULL
      `, [employee_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!entry) {
      return res.status(400).json({ success: false, error: 'Nu există pontaj activ' });
    }
    
    // Calculează ore lucrate
    const clockIn = new Date(entry.clock_in);
    const clockOut = new Date();
    let totalHours = (clockOut - clockIn) / (1000 * 60 * 60);
    
    // Scade pauza dacă există
    if (entry.break_start && entry.break_end) {
      const breakDuration = (new Date(entry.break_end) - new Date(entry.break_start)) / (1000 * 60 * 60);
      totalHours -= breakDuration;
    }
    
    const overtime = Math.max(0, totalHours - 8);
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE time_clock_entries 
        SET clock_out = datetime('now'), total_hours = ?, overtime_hours = ?, status = 'clocked_out', notes = ?
        WHERE id = ?
      `, [totalHours, overtime, notes, entry.id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({ success: true, total_hours: totalHours.toFixed(2), overtime_hours: overtime.toFixed(2) });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/scheduling/break-start
router.post('/break-start', async (req, res) => {
  try {
    const { employee_id } = req.body;
    const db = await dbPromise;
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE time_clock_entries 
        SET break_start = datetime('now'), status = 'on_break'
        WHERE employee_id = ? AND clock_out IS NULL
      `, [employee_id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({ success: true });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/scheduling/break-end
router.post('/break-end', async (req, res) => {
  try {
    const { employee_id } = req.body;
    const db = await dbPromise;
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE time_clock_entries 
        SET break_end = datetime('now'), status = 'clocked_in'
        WHERE employee_id = ? AND clock_out IS NULL
      `, [employee_id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({ success: true });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/scheduling/time-entries
router.get('/time-entries', async (req, res) => {
  try {
    const { startDate, endDate, employee_id } = req.query;
    const db = await dbPromise;
    
    let sql = `
      SELECT tce.*, u.name as employee_name
      FROM time_clock_entries tce
      LEFT JOIN users u ON tce.employee_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (startDate) {
      sql += ` AND date(tce.clock_in) >= ?`;
      params.push(startDate);
    }
    
    if (endDate) {
      sql += ` AND date(tce.clock_in) <= ?`;
      params.push(endDate);
    }
    
    if (employee_id) {
      sql += ` AND tce.employee_id = ?`;
      params.push(employee_id);
    }
    
    sql += ` ORDER BY tce.clock_in DESC`;
    
    const entries = await new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, entries });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== PAYROLL ====================

// GET /api/scheduling/payroll/summary
router.get('/payroll/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const db = await dbPromise;
    
    const summary = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          tce.employee_id,
          u.name as employee_name,
          SUM(COALESCE(tce.total_hours, 0)) as total_hours,
          SUM(COALESCE(tce.overtime_hours, 0)) as overtime_hours,
          COUNT(*) as shifts_worked
        FROM time_clock_entries tce
        LEFT JOIN users u ON tce.employee_id = u.id
        WHERE tce.status = 'clocked_out'
          AND date(tce.clock_in) BETWEEN ? AND ?
        GROUP BY tce.employee_id
        ORDER BY total_hours DESC
      `, [startDate, endDate], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    const totals = {
      total_employees: summary.length,
      total_hours: summary.reduce((sum, e) => sum + (e.total_hours || 0), 0),
      total_overtime: summary.reduce((sum, e) => sum + (e.overtime_hours || 0), 0),
      total_shifts: summary.reduce((sum, e) => sum + (e.shifts_worked || 0), 0)
    };
    
    res.json({ success: true, employees: summary, totals });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/scheduling/payroll/export
router.post('/payroll/export', async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.body;
    const db = await dbPromise;
    
    // Creează perioada de payroll
    const period = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO payroll_periods (period_start, period_end, status)
        VALUES (?, ?, 'closed')
      `, [startDate, endDate], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
    
    // Obține datele angajaților
    const employees = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          tce.employee_id,
          u.name as employee_name,
          u.email,
          SUM(COALESCE(tce.total_hours, 0)) as regular_hours,
          SUM(COALESCE(tce.overtime_hours, 0)) as overtime_hours
        FROM time_clock_entries tce
        LEFT JOIN users u ON tce.employee_id = u.id
        WHERE tce.status = 'clocked_out'
          AND date(tce.clock_in) BETWEEN ? AND ?
        GROUP BY tce.employee_id
      `, [startDate, endDate], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Salvează intrările payroll
    for (const emp of employees) {
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO payroll_entries 
          (period_id, employee_id, regular_hours, overtime_hours, status)
          VALUES (?, ?, ?, ?, 'pending')
        `, [period.id, emp.employee_id, emp.regular_hours, emp.overtime_hours], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    
    // Actualizează totalurile perioadei
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE payroll_periods 
        SET total_hours = ?, total_overtime = ?, export_date = datetime('now')
        WHERE id = ?
      `, [
        employees.reduce((sum, e) => sum + e.regular_hours, 0),
        employees.reduce((sum, e) => sum + e.overtime_hours, 0),
        period.id
      ], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({ 
      success: true, 
      period_id: period.id,
      employees,
      totals: {
        total_hours: employees.reduce((sum, e) => sum + e.regular_hours, 0),
        total_overtime: employees.reduce((sum, e) => sum + e.overtime_hours, 0)
      }
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== SHIFT TEMPLATES ====================

// GET /api/scheduling/templates
router.get('/templates', async (req, res) => {
  try {
    const db = await dbPromise;
    
    const templates = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM shift_templates ORDER BY day_of_week, start_time', (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({ success: true, templates });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/scheduling/templates
router.post('/templates', async (req, res) => {
  try {
    const { name, day_of_week, start_time, end_time, break_duration, position, min_employees, max_employees } = req.body;
    const db = await dbPromise;
    
    const result = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO shift_templates 
        (name, day_of_week, start_time, end_time, break_duration, position, min_employees, max_employees)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [name, day_of_week, start_time, end_time, break_duration || 0, position, min_employees || 1, max_employees], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
    
    res.json({ success: true, templateId: result.id });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

