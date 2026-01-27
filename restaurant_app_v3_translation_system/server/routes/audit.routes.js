/**
 * ENTERPRISE MODULE - Audit & Security Routes
 * 
 * Provides API endpoints for:
 * - Audit logs
 * - Security events
 * - Login history
 * - User activity
 * - Security alerts
 */

const express = require('express');
const router = express.Router();
const { dbPromise } = require('../database');
const auditService = require('../src/modules/audit/audit.service');

/**
 * GET /api/audit/logs
 * Get audit logs with filters
 */
router.get('/logs', async (req, res) => {
  try {
    const {
      userId,
      action,
      module,
      resourceType,
      entityType,
      entityId,
      status,
      startDate,
      endDate,
      dateFrom,
      dateTo,
      limit = 500,
      offset = 0
    } = req.query;

    // Map frontend params to backend params (dateFrom/dateTo -> startDate/endDate)
    const startDateParam = startDate || dateFrom;
    const endDateParam = endDate || dateTo;
    const resourceTypeParam = resourceType || module || entityType;

    const logs = await auditService.getAuditLogs({
      userId: userId ? parseInt(userId) : null,
      action,
      module: resourceTypeParam,
      entityType: resourceTypeParam,
      entityId: entityId ? parseInt(entityId) : null,
      status,
      startDate: startDateParam,
      endDate: endDateParam,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Join with users table to get usernames
    const db = await dbPromise;
    const logsWithUsers = await Promise.all(logs.map(async (log) => {
      if (log.user_id) {
        try {
          const user = await new Promise((resolve, reject) => {
            db.get('SELECT username FROM users WHERE id = ?', [log.user_id], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          });
          return { ...log, username: user?.username || 'Unknown' };
        } catch (err) {
          return { ...log, username: 'Unknown' };
        }
      }
      return { ...log, username: null };
    }));

    res.json(logsWithUsers);
  } catch (error) {
    console.error('❌ Error in GET /api/audit/logs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/audit/login-history
 * Get login history (combines admin_login_history and kiosk_login_history)
 */
router.get('/login-history', async (req, res) => {
  try {
    const { limit = 500, userId, source } = req.query;
    const db = await dbPromise;

    let history = [];

    // Get admin login history
    if (!source || source === 'admin') {
      try {
        const adminHistory = await new Promise((resolve, reject) => {
          let query = 'SELECT * FROM admin_login_history WHERE 1=1';
          const params = [];
          
          if (userId) {
            query += ' AND user_id = ?';
            params.push(parseInt(userId));
          }
          
          query += ' ORDER BY login_time DESC LIMIT ?';
          params.push(parseInt(limit));
          
          db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(Array.isArray(rows) ? rows : []);
          });
        });

        history = history.concat(adminHistory.map(h => ({
          ...h,
          source: 'admin'
        })));
      } catch (err) {
        console.warn('⚠️ Error fetching admin login history:', err.message);
      }
    }

    // Get kiosk login history
    if (!source || source === 'kiosk') {
      try {
        const kioskHistory = await new Promise((resolve, reject) => {
          let query = 'SELECT * FROM kiosk_login_history WHERE 1=1';
          const params = [];
          
          if (userId) {
            query += ' AND user_id = ?';
            params.push(parseInt(userId));
          }
          
          query += ' ORDER BY login_time DESC LIMIT ?';
          params.push(parseInt(limit));
          
          db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(Array.isArray(rows) ? rows : []);
          });
        });

        history = history.concat(kioskHistory.map(h => ({
          ...h,
          source: 'kiosk'
        })));
      } catch (err) {
        console.warn('⚠️ Error fetching kiosk login history:', err.message);
      }
    }

    // Sort by login_time descending
    history.sort((a, b) => {
      const timeA = new Date(a.login_time || 0).getTime();
      const timeB = new Date(b.login_time || 0).getTime();
      return timeB - timeA;
    });

    // Limit results
    history = history.slice(0, parseInt(limit));

    res.json(history);
  } catch (error) {
    console.error('❌ Error in GET /api/audit/login-history:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/audit/login-history/failed
 * Get failed login attempts
 */
router.get('/login-history/failed', async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const db = await dbPromise;

    let failedLogins = [];

    try {
      failedLogins = await new Promise((resolve, reject) => {
        db.all(`
          SELECT * FROM admin_login_history
          WHERE success = 0 OR success IS NULL
          ORDER BY login_time DESC
          LIMIT ?
        `, [parseInt(limit)], (err, rows) => {
          if (err) reject(err);
          else resolve(Array.isArray(rows) ? rows : []);
        });
      });
    } catch (err) {
      console.warn('⚠️ Error fetching failed logins:', err.message);
    }

    res.json(failedLogins);
  } catch (error) {
    console.error('❌ Error in GET /api/audit/login-history/failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/audit/security
 * Get security events (filtered audit logs)
 */
router.get('/security', async (req, res) => {
  try {
    const { limit = 500 } = req.query;
    const db = await dbPromise;

    // Get all audit logs directly from database (bypass service to avoid module column issue)
    const allLogs = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM audit_log
        ORDER BY timestamp DESC
        LIMIT ?
      `, [parseInt(limit) * 2], (err, rows) => {
        if (err) {
          if (err.message.includes('no such table')) {
            resolve([]);
          } else {
            reject(err);
          }
        } else {
          // Map to expected format
          const logs = (Array.isArray(rows) ? rows : []).map(row => ({
            ...row,
            module: row.resource_type || 'unknown',
            entity_type: row.resource_type,
            entity_id: row.resource_id,
            details: row.new_values ? (() => {
              try { return JSON.parse(row.new_values); } catch { return {}; }
            })() : {},
            status: 'success'
          }));
          resolve(logs);
        }
      });
    });

    // Filter for security events
    const securityEvents = allLogs.filter(log => {
      const action = (log.action || '').toLowerCase();
      const resourceType = (log.resource_type || log.entity_type || '').toLowerCase();
      const status = (log.status || '').toLowerCase();
      
      return resourceType === 'security' ||
             action.includes('login') ||
             action.includes('logout') ||
             action.includes('security') ||
             action.includes('access') ||
             action.includes('failed') ||
             action.includes('auth') ||
             status === 'error';
    }).slice(0, parseInt(limit));

    // Join with users table
    const eventsWithUsers = await Promise.all(securityEvents.map(async (event) => {
      if (event.user_id) {
        try {
          const user = await new Promise((resolve, reject) => {
            db.get('SELECT username FROM users WHERE id = ?', [event.user_id], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          });
          return { ...event, username: user?.username || 'Unknown' };
        } catch (err) {
          return { ...event, username: 'Unknown' };
        }
      }
      return { ...event, username: null };
    }));

    res.json(eventsWithUsers);
  } catch (error) {
    console.error('❌ Error in GET /api/audit/security:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/audit/user-activity
 * Get user activity statistics
 */
router.get('/user-activity', async (req, res) => {
  try {
    const { limit = 1000 } = req.query;
    const db = await dbPromise;

    // Get all audit logs
    const logs = await auditService.getAuditLogs({
      limit: parseInt(limit),
      offset: 0
    });

    // Group by user
    const activityMap = {};
    
    for (const log of logs) {
      const userId = log.user_id || 0;
      if (!activityMap[userId]) {
        // Get username
        let username = 'Unknown';
        if (userId) {
          try {
            const user = await new Promise((resolve, reject) => {
              db.get('SELECT username FROM users WHERE id = ?', [userId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
              });
            });
            username = user?.username || 'Unknown';
          } catch (err) {
            // Keep default
          }
        }
        
        activityMap[userId] = {
          user_id: userId,
          username,
          total_actions: 0,
          last_activity: log.timestamp,
          actions_by_type: {}
        };
      }
      
      activityMap[userId].total_actions++;
      const actionType = log.action || 'unknown';
      activityMap[userId].actions_by_type[actionType] = 
        (activityMap[userId].actions_by_type[actionType] || 0) + 1;
      
      if (new Date(log.timestamp) > new Date(activityMap[userId].last_activity)) {
        activityMap[userId].last_activity = log.timestamp;
      }
    }

    const activities = Object.values(activityMap);
    activities.sort((a, b) => b.total_actions - a.total_actions);

    res.json(activities);
  } catch (error) {
    console.error('❌ Error in GET /api/audit/user-activity:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/audit/user-activity/chart
 * Get user activity chart data
 */
router.get('/user-activity/chart', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const db = await dbPromise;

    // Get audit logs for the last N days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const logs = await auditService.getAuditLogs({
      startDate: startDate.toISOString(),
      limit: 10000,
      offset: 0
    });

    // Group by date
    const dateMap = {};
    const userSet = new Set();
    
    for (const log of logs) {
      const date = new Date(log.timestamp).toISOString().split('T')[0];
      if (!dateMap[date]) {
        dateMap[date] = {
          date,
          actions: 0,
          users: new Set()
        };
      }
      
      dateMap[date].actions++;
      if (log.user_id) {
        dateMap[date].users.add(log.user_id);
        userSet.add(log.user_id);
      }
    }

    // Convert to array
    const chartData = Object.values(dateMap).map(item => ({
      date: item.date,
      actions: item.actions,
      users: item.users.size
    }));

    // Sort by date
    chartData.sort((a, b) => a.date.localeCompare(b.date));

    res.json(chartData);
  } catch (error) {
    console.error('❌ Error in GET /api/audit/user-activity/chart:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/audit/alerts
 * Get security alerts based on rules
 */
router.get('/alerts', async (req, res) => {
  try {
    const db = await dbPromise;
    const alerts = [];

    // Get active alert rules
    const rules = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM security_alert_rules
        WHERE is_active = 1
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(Array.isArray(rows) ? rows : []);
      });
    });

    // Check each rule
    for (const rule of rules) {
      const timeWindow = new Date();
      timeWindow.setMinutes(timeWindow.getMinutes() - rule.time_window_minutes);

      if (rule.rule_type === 'failed_logins') {
        // Count failed logins in time window
        const failedCount = await new Promise((resolve, reject) => {
          db.get(`
            SELECT COUNT(*) as count FROM admin_login_history
            WHERE (success = 0 OR success IS NULL)
              AND login_time >= ?
          `, [timeWindow.toISOString()], (err, row) => {
            if (err) reject(err);
            else resolve(row?.count || 0);
          });
        });

        if (failedCount >= rule.threshold) {
          alerts.push({
            id: `rule_${rule.id}_${Date.now()}`,
            alert_type: rule.rule_name,
            severity: rule.severity,
            message: `${failedCount} încercări de login eșuate în ultimele ${rule.time_window_minutes} minute`,
            timestamp: new Date().toISOString(),
            resolved: false
          });
        }
      } else if (rule.rule_type === 'massive_deletions') {
        // Count deletions in time window
        const deletionCount = await new Promise((resolve, reject) => {
          db.get(`
            SELECT COUNT(*) as count FROM audit_log
            WHERE action LIKE '%DELETE%'
              AND timestamp >= ?
          `, [timeWindow.toISOString()], (err, row) => {
            if (err) reject(err);
            else resolve(row?.count || 0);
          });
        });

        if (deletionCount >= rule.threshold) {
          alerts.push({
            id: `rule_${rule.id}_${Date.now()}`,
            alert_type: rule.rule_name,
            severity: rule.severity,
            message: `${deletionCount} ștergeri detectate în ultimele ${rule.time_window_minutes} minute`,
            timestamp: new Date().toISOString(),
            resolved: false
          });
        }
      }
    }

    // Also get system alerts
    try {
      const systemAlerts = await new Promise((resolve, reject) => {
        db.all(`
          SELECT * FROM system_alerts
          WHERE acknowledged = 0
          ORDER BY timestamp DESC
          LIMIT 50
        `, [], (err, rows) => {
          if (err) reject(err);
          else resolve(Array.isArray(rows) ? rows : []);
        });
      });

      for (const alert of systemAlerts) {
        alerts.push({
          id: alert.id,
          alert_type: alert.type,
          severity: alert.severity,
          message: alert.message,
          timestamp: alert.timestamp,
          resolved: alert.acknowledged === 1
        });
      }
    } catch (err) {
      console.warn('⚠️ Error fetching system alerts:', err.message);
    }

    // Sort by timestamp descending
    alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json(alerts);
  } catch (error) {
    console.error('❌ Error in GET /api/audit/alerts:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

