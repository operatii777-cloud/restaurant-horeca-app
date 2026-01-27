/**
 * PHASE PRODUCTION-READY - Stock Alerts Service
 * 
 * Serviciu pentru gestionarea alertelor de stoc minim
 */

const { dbPromise } = require('../../../../database');
const { logger } = require('../../../utils/logger');
const alertLogger = logger.child('STOCK_ALERTS');

class StockAlertsService {
  /**
   * Get all ingredients with low stock (below min_stock)
   */
  async getLowStockAlerts(thresholdPercent = null) {
    const db = await dbPromise;
    
    try {
      let sql = `
        SELECT 
          i.id,
          i.name,
          i.current_stock,
          i.min_stock,
          i.unit,
          i.cost_per_unit,
          CASE 
            WHEN i.min_stock > 0 THEN 
              ROUND((i.current_stock / i.min_stock) * 100, 2)
            ELSE 0
          END as stock_percent,
          CASE 
            WHEN i.current_stock < i.min_stock THEN 'CRITICAL'
            WHEN i.current_stock < (i.min_stock * 1.5) THEN 'WARNING'
            ELSE 'OK'
          END as alert_level
        FROM ingredients i
        WHERE (i.is_available = 1 OR i.is_available IS NULL)
          AND i.min_stock > 0
          AND i.current_stock <= (i.min_stock * 1.5)
        ORDER BY 
          CASE 
            WHEN i.current_stock < i.min_stock THEN 1
            WHEN i.current_stock < (i.min_stock * 1.5) THEN 2
            ELSE 3
          END,
          i.name
      `;
      
      const alerts = await new Promise((resolve, reject) => {
        db.all(sql, [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
      
      // Filter by threshold if provided
      if (thresholdPercent !== null) {
        return alerts.filter(alert => alert.stock_percent <= thresholdPercent);
      }
      
      return alerts;
    } catch (error) {
      alertLogger.error('Error getting low stock alerts', { error: error.message });
      throw error;
    }
  }
  
  /**
   * Get critical stock alerts (below min_stock)
   */
  async getCriticalAlerts() {
    const alerts = await this.getLowStockAlerts();
    return alerts.filter(alert => alert.alert_level === 'CRITICAL');
  }
  
  /**
   * Get warning stock alerts (below 1.5x min_stock)
   */
  async getWarningAlerts() {
    const alerts = await this.getLowStockAlerts();
    return alerts.filter(alert => alert.alert_level === 'WARNING');
  }
  
  /**
   * Calculate suggested reorder quantity
   */
  async getReorderSuggestions(ingredientId = null) {
    const db = await dbPromise;
    
    try {
      let sql = `
        SELECT 
          i.id,
          i.name,
          i.current_stock,
          i.min_stock,
          i.max_stock,
          i.unit,
          i.cost_per_unit,
          CASE 
            WHEN i.max_stock > 0 THEN i.max_stock - i.current_stock
            WHEN i.min_stock > 0 THEN i.min_stock * 2 - i.current_stock
            ELSE 0
          END as suggested_qty,
          CASE 
            WHEN i.current_stock < i.min_stock THEN 'URGENT'
            WHEN i.current_stock < (i.min_stock * 1.5) THEN 'SOON'
            ELSE 'OK'
          END as priority
        FROM ingredients i
        WHERE (i.is_available = 1 OR i.is_available IS NULL)
          AND i.min_stock > 0
          AND i.current_stock < (i.min_stock * 1.5)
      `;
      
      const params = [];
      if (ingredientId) {
        sql += ' AND i.id = ?';
        params.push(ingredientId);
      }
      
      sql += ' ORDER BY priority, i.name';
      
      const suggestions = await new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
      
      // Filter out negative or zero suggestions
      return suggestions
        .filter(s => s.suggested_qty > 0)
        .map(s => ({
          ...s,
          estimated_cost: (s.suggested_qty * (s.cost_per_unit || 0)).toFixed(2)
        }));
    } catch (error) {
      alertLogger.error('Error getting reorder suggestions', { error: error.message });
      throw error;
    }
  }
  
  /**
   * Get stock alert summary (counts by level)
   */
  async getAlertSummary() {
    try {
      const alerts = await this.getLowStockAlerts();
      
      const summary = {
        total: alerts.length,
        critical: alerts.filter(a => a.alert_level === 'CRITICAL').length,
        warning: alerts.filter(a => a.alert_level === 'WARNING').length,
        total_value_at_risk: alerts.reduce((sum, a) => {
          const stockValue = (a.current_stock || 0) * (a.cost_per_unit || 0);
          return sum + stockValue;
        }, 0)
      };
      
      return summary;
    } catch (error) {
      alertLogger.error('Error getting alert summary', { error: error.message });
      throw error;
    }
  }
  
  /**
   * Check and log stock alerts (for cron jobs or scheduled tasks)
   */
  async checkAndLogAlerts() {
    try {
      const alerts = await this.getLowStockAlerts();
      const summary = await this.getAlertSummary();
      
      if (summary.critical > 0) {
        alertLogger.warn('CRITICAL stock alerts detected', {
          critical_count: summary.critical,
          warning_count: summary.warning,
          total: summary.total
        });
      } else if (summary.warning > 0) {
        alertLogger.info('Stock warnings detected', {
          warning_count: summary.warning,
          total: summary.total
        });
      }
      
      return {
        alerts,
        summary,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      alertLogger.error('Error checking stock alerts', { error: error.message });
      throw error;
    }
  }
}

module.exports = new StockAlertsService();

