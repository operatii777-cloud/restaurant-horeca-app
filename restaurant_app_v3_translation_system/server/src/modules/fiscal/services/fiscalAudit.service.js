/**
 * PHASE E10.1 - Fiscal Audit Service
 * 
 * Handles fiscal audit logging and status queries for orders
 */

const { dbPromise } = require('../../../../database');

class FiscalAuditService {
  /**
   * Get fiscal status for an order
   * @param {number} orderId - Order ID
   * @returns {Promise<Object>} Fiscal status object
   */
  static async getOrderFiscalStatus(orderId) {
    try {
      const db = await dbPromise;
      
      // Check if fiscal_audit table exists
      const tableExists = await new Promise((resolve) => {
        db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='fiscal_audit'`, (err, row) => {
          resolve(!!row);
        });
      });
      
      if (!tableExists) {
        return {
          orderId,
          isFiscalized: false,
          fiscalReceiptNumber: null,
          fiscalizedAt: null,
          status: 'not_fiscalized',
          error: null
        };
      }
      
      // Get fiscal audit record
      const audit = await new Promise((resolve, reject) => {
        db.get(`
          SELECT 
            id, order_id, fiscal_receipt_number, fiscalized_at, 
            status, error_message, retry_count
          FROM fiscal_audit
          WHERE order_id = ?
          ORDER BY fiscalized_at DESC
          LIMIT 1
        `, [orderId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      if (!audit) {
        return {
          orderId,
          isFiscalized: false,
          fiscalReceiptNumber: null,
          fiscalizedAt: null,
          status: 'not_fiscalized',
          error: null
        };
      }
      
      return {
        orderId: audit.order_id,
        isFiscalized: audit.status === 'success',
        fiscalReceiptNumber: audit.fiscal_receipt_number,
        fiscalizedAt: audit.fiscalized_at,
        status: audit.status || 'unknown',
        error: audit.error_message,
        retryCount: audit.retry_count || 0
      };
    } catch (error) {
      console.error('Error getting fiscal status:', error);
      return {
        orderId,
        isFiscalized: false,
        fiscalReceiptNumber: null,
        fiscalizedAt: null,
        status: 'error',
        error: error.message
      };
    }
  }
  
  /**
   * Get audit log for an order
   * @param {number} orderId - Order ID
   * @returns {Promise<Array>} Array of audit log entries
   */
  static async getOrderAuditLog(orderId) {
    try {
      const db = await dbPromise;
      
      // Check if fiscal_audit table exists
      const tableExists = await new Promise((resolve) => {
        db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='fiscal_audit'`, (err, row) => {
          resolve(!!row);
        });
      });
      
      if (!tableExists) {
        return [];
      }
      
      // Get all audit log entries for this order
      const logs = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            id, order_id, fiscal_receipt_number, fiscalized_at,
            status, error_message, retry_count, created_at
          FROM fiscal_audit
          WHERE order_id = ?
          ORDER BY created_at DESC
        `, [orderId], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
      
      return logs.map(log => ({
        id: log.id,
        orderId: log.order_id,
        fiscalReceiptNumber: log.fiscal_receipt_number,
        fiscalizedAt: log.fiscalized_at,
        status: log.status,
        error: log.error_message,
        retryCount: log.retry_count || 0,
        createdAt: log.created_at
      }));
    } catch (error) {
      console.error('Error getting audit log:', error);
      return [];
    }
  }
  
  /**
   * Log fiscal operation
   * @param {Object} data - Audit log data
   * @returns {Promise<number>} Audit log ID
   */
  static async logFiscalOperation(data) {
    try {
      const db = await dbPromise;
      
      // Check if fiscal_audit table exists
      const tableExists = await new Promise((resolve) => {
        db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='fiscal_audit'`, (err, row) => {
          resolve(!!row);
        });
      });
      
      if (!tableExists) {
        console.warn('⚠️ fiscal_audit table does not exist - skipping audit log');
        return null;
      }
      
      const auditId = await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO fiscal_audit (
            order_id, fiscal_receipt_number, fiscalized_at,
            status, error_message, retry_count, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
        `, [
          data.orderId,
          data.fiscalReceiptNumber || null,
          data.fiscalizedAt || null,
          data.status || 'pending',
          data.error || null,
          data.retryCount || 0
        ], function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        });
      });
      
      return auditId;
    } catch (error) {
      console.error('Error logging fiscal operation:', error);
      return null;
    }
  }
}

module.exports = FiscalAuditService;

