const { dbPromise } = require('../../../database');

/**
 * HACCP Service - Logică de business pentru HACCP monitoring
 */
class HaccpService {
  /**
   * Get monitoring statistics for dashboard KPIs
   */
  async getMonitoringStats() {
    const db = await dbPromise;

    const today = new Date().toISOString().split('T')[0];
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Total Equipment Count
    const totalEquipment = await new Promise((resolve, reject) => {
      db.get(
        'SELECT COUNT(*) as count FROM compliance_equipment WHERE is_active = 1',
        (err, row) => {
          if (err) reject(err);
          else resolve(row?.count || 0);
        }
      );
    });

    // Overdue Maintenance Count
    const overdueMaintenance = await new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as count FROM compliance_equipment_maintenance 
         WHERE status IN ('scheduled', 'in_progress') AND scheduled_date < ?`,
        [today],
        (err, row) => {
          if (err) reject(err);
          else resolve(row?.count || 0);
        }
      );
    });

    // Upcoming Maintenance (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingMaintenance = await new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as count FROM compliance_equipment_maintenance 
         WHERE status IN ('scheduled', 'in_progress') 
         AND scheduled_date >= ? AND scheduled_date <= ?`,
        [today, nextWeek.toISOString().split('T')[0]],
        (err, row) => {
          if (err) reject(err);
          else resolve(row?.count || 0);
        }
      );
    });

    // Critical Temperature Logs (last 24h)
    const criticalTempLogs = await new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as count FROM compliance_temperature_log 
         WHERE status = 'critical' AND created_at >= ?`,
        [twentyFourHoursAgo],
        (err, row) => {
          if (err) reject(err);
          else resolve(row?.count || 0);
        }
      );
    });

    // Overdue Cleaning Tasks
    const overdueCleaning = await new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as count FROM compliance_cleaning_schedule 
         WHERE status = 'pending' AND due_date < ?`,
        [today],
        (err, row) => {
          if (err) reject(err);
          else resolve(row?.count || 0);
        }
      );
    });

    // Active CCPs (Critical Control Points)
    const activeCCPs = await new Promise((resolve, reject) => {
      db.get(
        'SELECT COUNT(*) as count FROM haccp_ccp WHERE is_active = 1',
        (err, row) => {
          if (err) reject(err);
          else resolve(row?.count || 0);
        }
      );
    });

    // Today's monitoring records
    const todayMonitoring = await new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as count FROM haccp_monitoring 
         WHERE DATE(monitored_at) = ?`,
        [today],
        (err, row) => {
          if (err) reject(err);
          else resolve(row?.count || 0);
        }
      );
    });

    // Open corrective actions (resolved = 0 means not yet resolved)
    const openCorrectiveActions = await new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as count FROM haccp_corrective_actions 
         WHERE resolved = 0 OR resolved IS NULL`,
        (err, row) => {
          if (err) reject(err);
          else resolve(row?.count || 0);
        }
      );
    });

    return {
      totalEquipment,
      overdueMaintenance,
      upcomingMaintenance,
      criticalTempLogs,
      overdueCleaning,
      activeCCPs,
      todayMonitoring,
      openCorrectiveActions,
    };
  }

  /**
   * Get detailed monitoring records
   */
  /**
   * Get all HACCP processes
   */
  async getAllProcesses() {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM haccp_processes WHERE is_active = 1 ORDER BY process_name', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  /**
   * Get CCPs for a process
   */
  async getCCPsByProcess(processId) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM haccp_ccp WHERE process_id = ? AND is_active = 1 ORDER BY ccp_number', [processId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  /**
   * Get limits for a CCP
   */
  async getLimitsByCCP(ccpId) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM haccp_limits WHERE ccp_id = ?', [ccpId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  /**
   * Record monitoring data
   */
  async recordMonitoring(ccpId, parameterName, value, userId, notes, unit = null) {
    const db = await dbPromise;

    // Determine status (simple logic for now, should check limits)
    let status = 'ok';
    let derivedUnit = unit;

    // Check limits if possible
    try {
      const limits = await this.getLimitsByCCP(ccpId);
      const limit = limits.find(l => l.parameter_name === parameterName);
      if (limit) {
        // Check Minimum Limit
        if (limit.min_value !== null && limit.min_value !== undefined) {
          if (value < limit.min_value) status = 'critical';
        }

        // Check Maximum Limit
        if (limit.max_value !== null && limit.max_value !== undefined) {
          if (value > limit.max_value) status = 'critical';
        }

        // Use unit from limit if not provided
        if (!derivedUnit) {
          derivedUnit = limit.unit;
        }
      }
    } catch (e) {
      console.error('Error checking HACCP limits:', e);
    }

    // Final fallback for unit to avoid Not Null constraint
    if (!derivedUnit) derivedUnit = '-';

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO haccp_monitoring (
          ccp_id, parameter_name, measured_value, monitored_by, notes, status, monitored_at, unit
        ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)`,
        [ccpId, parameterName, value, userId, notes, status, derivedUnit],
        function (err) {
          if (err) reject(err);
          else resolve({
            id: this.lastID,
            ccp_id: ccpId,
            parameter_name: parameterName,
            measured_value: value,
            monitored_by: userId,
            status,
            unit: derivedUnit,
            monitored_at: new Date()
          });
        }
      );
    });
  }

  /**
   * Get filtered monitoring records (RENAMED to match controller)
   */
  async getMonitoring(filters = {}) {
    const db = await dbPromise;
    const { limit = 100, offset = 0, status, ccp_id, date_from, date_to } = filters;

    let query = `
      SELECT 
        hm.*,
        hccp.ccp_number as ccp_name,
        hp.name as process_name,
        u.username as operator_name
      FROM haccp_monitoring hm
      LEFT JOIN haccp_ccp hccp ON hm.ccp_id = hccp.id
      LEFT JOIN haccp_processes hp ON hccp.process_id = hp.id
      LEFT JOIN users u ON hm.monitored_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND hm.status = ?';
      params.push(status);
    }
    if (ccp_id) {
      query += ' AND hm.ccp_id = ?';
      params.push(parseInt(ccp_id));
    }
    if (date_from) {
      query += ' AND DATE(hm.monitored_at) >= ?';
      params.push(date_from);
    }
    if (date_to) {
      query += ' AND DATE(hm.monitored_at) <= ?';
      params.push(date_to);
    }

    query += ' ORDER BY hm.monitored_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  /**
   * Create corrective action
   */
  async createCorrectiveAction(ccpId, monitoringId, actionTaken, takenBy) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO haccp_corrective_actions (
          ccp_id, monitoring_id, action_taken, taken_by, resolved, created_at
        ) VALUES (?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
        [ccpId, monitoringId, actionTaken, takenBy],
        function (err) {
          if (err) reject(err);
          else resolve({
            id: this.lastID,
            ccp_id: ccpId,
            action_taken: actionTaken,
            resolved: 0
          });
        }
      );
    });
  }

  /**
   * Resolve corrective action
   */
  async resolveCorrectiveAction(actionId, notes) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE haccp_corrective_actions 
               SET resolved = 1, verification_notes = ?, resolved_at = CURRENT_TIMESTAMP 
               WHERE id = ?`,
        [notes, actionId],
        function (err) {
          if (err) reject(err);
          else resolve({ id: actionId, resolved: 1, notes });
        }
      );
    });
  }
}

module.exports = new HaccpService();

