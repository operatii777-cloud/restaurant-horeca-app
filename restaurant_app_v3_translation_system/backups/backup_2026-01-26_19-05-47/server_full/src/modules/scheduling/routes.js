/**
 * Scheduling Routes
 * 
 * Employee shift scheduling and time management
 * Similar to Toast/Lightspeed scheduling features
 */

const express = require('express');
const router = express.Router();
const { dbPromise } = require('../../../database');

/**
 * GET /api/scheduling/shifts
 * Get shifts for a date range
 */
router.get('/shifts', async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;
    const db = await dbPromise;
    
    let query = `
      SELECT 
        s.*,
        w.name as employee_name,
        w.role as employee_role
      FROM shifts s
      LEFT JOIN waiters w ON s.employee_id = w.id
      WHERE 1=1
    `;
    const params = [];
    
    if (startDate) {
      query += ' AND DATE(s.start_time) >= DATE(?)';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND DATE(s.end_time) <= DATE(?)';
      params.push(endDate);
    }
    
    if (employeeId) {
      query += ' AND s.employee_id = ?';
      params.push(employeeId);
    }
    
    query += ' ORDER BY s.start_time ASC';
    
    const shifts = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({
      success: true,
      data: shifts.map(s => ({
        id: s.id,
        employeeId: s.employee_id,
        employeeName: s.employee_name,
        employeeRole: s.employee_role,
        start: s.start_time,
        end: s.end_time,
        role: s.role,
        position: s.position,
        notes: s.notes,
        status: s.status,
        color: getShiftColor(s.role || s.employee_role)
      }))
    });
  } catch (error) {
    console.error('Error fetching shifts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/scheduling/shifts
 * Create a new shift
 */
router.post('/shifts', async (req, res) => {
  try {
    const { employeeId, startTime, endTime, role, position, notes } = req.body;
    const db = await dbPromise;
    
    // Validate
    if (!employeeId || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        error: 'Employee, start time, and end time are required'
      });
    }
    
    // Check for overlapping shifts
    const overlap = await new Promise((resolve, reject) => {
      db.get(`
        SELECT id FROM shifts 
        WHERE employee_id = ? 
        AND status != 'cancelled'
        AND (
          (start_time <= ? AND end_time > ?) OR
          (start_time < ? AND end_time >= ?) OR
          (start_time >= ? AND end_time <= ?)
        )
      `, [employeeId, startTime, startTime, endTime, endTime, startTime, endTime], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (overlap) {
      return res.status(400).json({
        success: false,
        error: 'This shift overlaps with an existing shift for this employee'
      });
    }
    
    const result = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO shifts (employee_id, start_time, end_time, role, position, notes, status, created_by)
        VALUES (?, ?, ?, ?, ?, ?, 'scheduled', ?)
      `, [employeeId, startTime, endTime, role || null, position || null, notes || null, req.userId || null], 
      function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
    
    res.status(201).json({
      success: true,
      data: { id: result.id }
    });
  } catch (error) {
    console.error('Error creating shift:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/scheduling/shifts/:id
 * Update a shift
 */
router.put('/shifts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, startTime, endTime, role, position, notes, status } = req.body;
    const db = await dbPromise;
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE shifts 
        SET employee_id = ?, start_time = ?, end_time = ?, role = ?, 
            position = ?, notes = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [employeeId, startTime, endTime, role, position, notes, status || 'scheduled', id], 
      (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({ success: true, message: 'Shift updated' });
  } catch (error) {
    console.error('Error updating shift:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/scheduling/shifts/:id
 * Delete a shift
 */
router.delete('/shifts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM shifts WHERE id = ?', [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({ success: true, message: 'Shift deleted' });
  } catch (error) {
    console.error('Error deleting shift:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/scheduling/employees
 * Get employees available for scheduling
 */
router.get('/employees', async (req, res) => {
  try {
    const db = await dbPromise;
    
    const employees = await new Promise((resolve, reject) => {
      db.all(`
        SELECT id, name, role, active
        FROM waiters
        WHERE active = 1
        ORDER BY name ASC
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({
      success: true,
      data: employees.map(e => ({
        id: e.id,
        name: e.name,
        role: e.role || 'waiter',
        color: getShiftColor(e.role)
      }))
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/scheduling/summary
 * Get scheduling summary (hours per employee, labor cost estimate)
 */
router.get('/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const db = await dbPromise;
    
    const summary = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          w.id,
          w.name,
          w.role,
          COUNT(s.id) as shift_count,
          SUM(
            (JULIANDAY(s.end_time) - JULIANDAY(s.start_time)) * 24
          ) as total_hours
        FROM waiters w
        LEFT JOIN shifts s ON w.id = s.employee_id 
          AND s.status != 'cancelled'
          AND DATE(s.start_time) >= DATE(?)
          AND DATE(s.end_time) <= DATE(?)
        WHERE w.active = 1
        GROUP BY w.id, w.name, w.role
        ORDER BY total_hours DESC
      `, [startDate || '1900-01-01', endDate || '2100-01-01'], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Calculate totals
    const totalShifts = summary.reduce((sum, e) => sum + (e.shift_count || 0), 0);
    const totalHours = summary.reduce((sum, e) => sum + (e.total_hours || 0), 0);
    
    res.json({
      success: true,
      data: {
        employees: summary.map(e => ({
          id: e.id,
          name: e.name,
          role: e.role,
          shiftCount: e.shift_count || 0,
          totalHours: Math.round((e.total_hours || 0) * 100) / 100
        })),
        totals: {
          totalShifts,
          totalHours: Math.round(totalHours * 100) / 100,
          averageHoursPerEmployee: summary.length > 0 ? 
            Math.round((totalHours / summary.length) * 100) / 100 : 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/scheduling/shifts/copy-week
 * Copy shifts from one week to another
 */
router.post('/shifts/copy-week', async (req, res) => {
  try {
    const { sourceWeekStart, targetWeekStart } = req.body;
    const db = await dbPromise;
    
    // Get source week shifts
    const sourceShifts = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM shifts 
        WHERE DATE(start_time) >= DATE(?) 
        AND DATE(start_time) < DATE(?, '+7 days')
        AND status != 'cancelled'
      `, [sourceWeekStart, sourceWeekStart], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Calculate day difference
    const sourceDateMs = new Date(sourceWeekStart).getTime();
    const targetDateMs = new Date(targetWeekStart).getTime();
    const daysDiff = Math.round((targetDateMs - sourceDateMs) / (24 * 60 * 60 * 1000));
    
    // Copy shifts with adjusted dates
    let copiedCount = 0;
    for (const shift of sourceShifts) {
      const newStart = new Date(new Date(shift.start_time).getTime() + daysDiff * 24 * 60 * 60 * 1000);
      const newEnd = new Date(new Date(shift.end_time).getTime() + daysDiff * 24 * 60 * 60 * 1000);
      
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO shifts (employee_id, start_time, end_time, role, position, notes, status)
          VALUES (?, ?, ?, ?, ?, ?, 'scheduled')
        `, [
          shift.employee_id, 
          newStart.toISOString(), 
          newEnd.toISOString(), 
          shift.role, 
          shift.position, 
          shift.notes
        ], (err) => {
          if (err) reject(err);
          else {
            copiedCount++;
            resolve();
          }
        });
      });
    }
    
    res.json({
      success: true,
      message: `Copied ${copiedCount} shifts from week of ${sourceWeekStart} to ${targetWeekStart}`
    });
  } catch (error) {
    console.error('Error copying shifts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/scheduling/availability/:employeeId
 * Get employee availability preferences
 */
router.get('/availability/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const db = await dbPromise;
    
    // For now, return mock availability (can be expanded with actual table)
    const defaultAvailability = {
      monday: { available: true, start: '09:00', end: '22:00' },
      tuesday: { available: true, start: '09:00', end: '22:00' },
      wednesday: { available: true, start: '09:00', end: '22:00' },
      thursday: { available: true, start: '09:00', end: '22:00' },
      friday: { available: true, start: '09:00', end: '23:00' },
      saturday: { available: true, start: '10:00', end: '23:00' },
      sunday: { available: false, start: '', end: '' }
    };
    
    res.json({
      success: true,
      data: {
        employeeId: parseInt(employeeId),
        availability: defaultAvailability
      }
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Helper: Get shift color based on role
 */
function getShiftColor(role) {
  const colors = {
    manager: '#e91e63',
    supervisor: '#9c27b0',
    head_chef: '#f44336',
    chef: '#ff5722',
    cook: '#ff9800',
    waiter: '#2196f3',
    bartender: '#00bcd4',
    host: '#4caf50',
    busser: '#8bc34a',
    dishwasher: '#607d8b'
  };
  
  return colors[role?.toLowerCase()] || '#9e9e9e';
}

module.exports = router;

