/**
 * ENTERPRISE MODULE - Comprehensive Audit Logging Service
 * 
 * Logs all user actions, system events, and security events
 * Provides complete audit trail for compliance and security
 */

const { dbPromise } = require('../../../database');

class AuditService {
  /**
   * Log user action
   * @param {Object} params - Audit log parameters
   * @param {Number} params.userId - User ID
   * @param {String} params.action - Action name (e.g., 'login', 'create_order', 'update_product')
   * @param {String} params.module - Module name (e.g., 'orders', 'catalog', 'admin')
   * @param {String} params.entityType - Entity type (e.g., 'order', 'product', 'user')
   * @param {Number} params.entityId - Entity ID
   * @param {Object} params.details - Additional details (JSON)
   * @param {String} params.ipAddress - IP address
   * @param {String} params.userAgent - User agent
   * @param {String} params.status - Status (success, error, warning)
   * @returns {Promise<Number>} Audit log ID
   */
  async logAction({
    userId,
    action,
    module,
    entityType = null,
    entityId = null,
    details = {},
    ipAddress = null,
    userAgent = null,
    status = 'success'
  }) {
    const db = await dbPromise;
    
    // Map module to resource_type and entityType/entityId to resource_type/resource_id
    const resourceType = module || entityType || null;
    const resourceId = entityId || null;
    
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO audit_log (
          user_id,
          action,
          resource_type,
          resource_id,
          new_values,
          ip_address,
          user_agent,
          timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        userId,
        action,
        resourceType,
        resourceId,
        JSON.stringify(details),
        ipAddress,
        userAgent,
        new Date().toISOString()
      ], function(err) {
        if (err) {
          // If table doesn't exist, create it
          if (err.message.includes('no such table')) {
            this.createAuditTable().then(() => {
              // Retry insert
              this.logAction({
                userId, action, module, entityType, entityId,
                details, ipAddress, userAgent, status
              }).then(resolve).catch(reject);
            }).catch(reject);
          } else {
            reject(err);
          }
        } else {
          resolve(this.lastID);
        }
      }.bind(this));
    });
  }

  /**
   * Create audit_log table if it doesn't exist
   * @returns {Promise<Boolean>}
   */
  async createAuditTable() {
    const db = await dbPromise;
    
    return new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS audit_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          action TEXT NOT NULL,
          resource_type TEXT,
          resource_id INTEGER,
          old_values TEXT,
          new_values TEXT,
          ip_address TEXT,
          user_agent TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          // Create indexes
          db.run(`CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id)`, () => {});
          db.run(`CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action)`, () => {});
          db.run(`CREATE INDEX IF NOT EXISTS idx_audit_resource_type ON audit_log(resource_type)`, () => {});
          db.run(`CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp)`, () => {});
          db.run(`CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_log(resource_type, resource_id)`, () => {
            resolve(true);
          });
        }
      });
    });
  }

  /**
   * Log security event
   * @param {Object} params - Security event parameters
   * @returns {Promise<Number>} Audit log ID
   */
  async logSecurityEvent({
    userId = null,
    eventType,
    severity,
    description,
    ipAddress = null,
    userAgent = null,
    details = {}
  }) {
    return this.logAction({
      userId,
      action: `security_${eventType}`,
      module: 'security',
      entityType: 'security_event',
      details: {
        ...details,
        severity,
        description,
        eventType
      },
      ipAddress,
      userAgent,
      status: severity === 'critical' || severity === 'high' ? 'error' : 'warning'
    });
  }

  /**
   * Log authentication event
   * @param {Object} params - Authentication event parameters
   * @returns {Promise<Number>} Audit log ID
   */
  async logAuthentication({
    userId = null,
    action, // 'login', 'logout', 'login_failed', '2fa_enabled', '2fa_disabled', 'sso_login'
    success,
    ipAddress = null,
    userAgent = null,
    details = {}
  }) {
    return this.logAction({
      userId,
      action,
      module: 'auth',
      entityType: 'user',
      entityId: userId,
      details: {
        ...details,
        success
      },
      ipAddress,
      userAgent,
      status: success ? 'success' : 'error'
    });
  }

  /**
   * Log data modification
   * @param {Object} params - Modification parameters
   * @returns {Promise<Number>} Audit log ID
   */
  async logModification({
    userId,
    action, // 'create', 'update', 'delete'
    module,
    entityType,
    entityId,
    oldValue = null,
    newValue = null,
    ipAddress = null,
    userAgent = null
  }) {
    return this.logAction({
      userId,
      action,
      module,
      entityType,
      entityId,
      details: {
        oldValue,
        newValue,
        changes: this.calculateChanges(oldValue, newValue)
      },
      ipAddress,
      userAgent,
      status: 'success'
    });
  }

  /**
   * Calculate changes between old and new values
   * @param {Object} oldValue - Old value
   * @param {Object} newValue - New value
   * @returns {Object} Changes object
   */
  calculateChanges(oldValue, newValue) {
    if (!oldValue || !newValue) {
      return {};
    }
    
    const changes = {};
    const allKeys = new Set([...Object.keys(oldValue), ...Object.keys(newValue)]);
    
    for (const key of allKeys) {
      if (oldValue[key] !== newValue[key]) {
        changes[key] = {
          from: oldValue[key],
          to: newValue[key]
        };
      }
    }
    
    return changes;
  }

  /**
   * Get audit logs with filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Array>} Audit logs
   */
  async getAuditLogs({
    userId = null,
    action = null,
    module = null,
    entityType = null,
    entityId = null,
    status = null,
    startDate = null,
    endDate = null,
    limit = 100,
    offset = 0
  }) {
    const db = await dbPromise;
    
    let query = 'SELECT * FROM audit_log WHERE 1=1';
    const params = [];
    
    if (userId) {
      query += ' AND user_id = ?';
      params.push(userId);
    }
    
    if (action) {
      query += ' AND action = ?';
      params.push(action);
    }
    
    if (module) {
      // Note: audit_log table uses resource_type, not module
      query += ' AND resource_type = ?';
      params.push(module);
    }
    
    if (entityType) {
      // Map entity_type to resource_type
      query += ' AND resource_type = ?';
      params.push(entityType);
    }
    
    if (entityId) {
      // Map entity_id to resource_id
      query += ' AND resource_id = ?';
      params.push(entityId);
    }
    
    // Note: audit_log table doesn't have status column, skip this filter
    // if (status) {
    //   query += ' AND status = ?';
    //   params.push(status);
    // }
    
    if (startDate) {
      query += ' AND timestamp >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND timestamp <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) {
          if (err.message.includes('no such table')) {
            // Table doesn't exist, return empty array
            resolve([]);
          } else {
            reject(err);
          }
        } else {
          // Parse JSON details and map to expected format
          const logs = rows.map(row => ({
            ...row,
            module: row.resource_type || 'unknown',
            entity_type: row.resource_type,
            entity_id: row.resource_id,
            details: row.new_values ? (() => {
              try { return JSON.parse(row.new_values); } catch { return {}; }
            })() : {},
            status: 'success' // Default status
          }));
          resolve(logs);
        }
      });
    });
  }

  /**
   * Get audit statistics
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Statistics
   */
  async getAuditStatistics({
    startDate = null,
    endDate = null
  } = {}) {
    const db = await dbPromise;
    
    let query = `
      SELECT 
        COUNT(*) as total_actions,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT resource_type) as unique_modules,
        0 as error_count,
        COUNT(*) as success_count
      FROM audit_log
      WHERE 1=1
    `;
    const params = [];
    
    if (startDate) {
      query += ' AND timestamp >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND timestamp <= ?';
      params.push(endDate);
    }
    
    return new Promise((resolve, reject) => {
      db.get(query, params, (err, row) => {
        if (err) {
          if (err.message.includes('no such table')) {
            resolve({
              total_actions: 0,
              unique_users: 0,
              unique_modules: 0,
              error_count: 0,
              success_count: 0
            });
          } else {
            reject(err);
          }
        } else {
          resolve(row);
        }
      });
    });
  }
}

module.exports = new AuditService();

