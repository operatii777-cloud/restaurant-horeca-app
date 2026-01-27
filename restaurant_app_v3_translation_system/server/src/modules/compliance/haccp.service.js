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
  async getMonitoringRecords(filters = {}) {
    const db = await dbPromise;
    const { limit = 100, offset = 0, status, ccp_id } = filters;

    let query = `
      SELECT 
        hm.*,
        hccp.name as ccp_name,
        hp.name as process_name,
        u.username as operator_name
      FROM haccp_monitoring hm
      LEFT JOIN haccp_ccp hccp ON hm.ccp_id = hccp.id
      LEFT JOIN haccp_processes hp ON hccp.process_id = hp.id
      LEFT JOIN users u ON hm.operator_id = u.id
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

    query += ' ORDER BY hm.monitored_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }
}

module.exports = new HaccpService();

