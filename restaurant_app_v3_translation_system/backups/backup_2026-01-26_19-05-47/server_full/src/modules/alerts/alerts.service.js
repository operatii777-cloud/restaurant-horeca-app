/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CENTRALIZED ALERTING SERVICE
 * 
 * Sistem centralizat de alerting pentru toate evenimentele critice:
 * - Stoc scăzut (critic/warning)
 * - Comenzi blocate (>30 min în pending)
 * - Anulări de comenzi
 * - Platforme externe (Glovo/Wolt comenzi noi)
 * - Performanță (rate anulare >10%)
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { dbPromise } = require('../../../database');

class AlertsService {
  constructor() {
    this.io = null; // Will be set via setSocketIO
    this.alertHistory = []; // In-memory cache for recent alerts
    this.maxHistorySize = 1000;
  }

  /**
   * Set Socket.IO instance for real-time alerts
   */
  setSocketIO(io) {
    this.io = io;
    console.log('✅ AlertsService: Socket.IO initialized');
  }

  /**
   * Emit alert via Socket.IO
   */
  emitAlert(alert) {
    if (this.io) {
      this.io.emit('alert', alert);
      console.log(`📢 [ALERT] ${alert.type}: ${alert.message}`);
    } else {
      console.warn('⚠️ [ALERT] Socket.IO not initialized, alert not sent:', alert);
    }

    // Store in history
    this.alertHistory.push({
      ...alert,
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString()
    });

    // Keep only last N alerts
    if (this.alertHistory.length > this.maxHistorySize) {
      this.alertHistory = this.alertHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Alert: Stoc scăzut (critic/warning)
   */
  alertLowStock(ingredient, level = 'warning') {
    const alert = {
      type: 'LOW_STOCK',
      severity: level === 'critical' ? 'error' : 'warning',
      message: `Stoc scăzut pentru ${ingredient.name}`,
      data: {
        ingredient_id: ingredient.id,
        ingredient_name: ingredient.name,
        current_stock: ingredient.current_stock,
        min_stock: ingredient.min_stock,
        stock_percent: ingredient.stock_percent,
        level: level
      },
      timestamp: new Date().toISOString()
    };

    this.emitAlert(alert);
    return alert;
  }

  /**
   * Alert: Comandă blocată (stoc insuficient)
   */
  alertOrderBlockedStock(orderItems, stockChecks, platform) {
    const alert = {
      type: 'ORDER_BLOCKED_STOCK',
      severity: 'error',
      message: 'Comandă blocată - stoc insuficient',
      data: {
        orderItems: orderItems,
        stockChecks: stockChecks,
        platform: platform || 'UNKNOWN'
      },
      timestamp: new Date().toISOString()
    };

    this.emitAlert(alert);
    return alert;
  }

  /**
   * Alert: Comenzi blocate (>30 min în pending)
   */
  async alertBlockedOrders() {
    const db = await dbPromise;
    
    try {
      const blockedOrders = await new Promise((resolve, reject) => {
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
        db.all(`
          SELECT 
            id, 
            status, 
            timestamp, 
            total, 
            platform,
            customer_name,
            table_number
          FROM orders 
          WHERE status = 'pending' 
            AND timestamp < ?
          ORDER BY timestamp ASC
        `, [thirtyMinutesAgo], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });

      if (blockedOrders.length > 0) {
        const alert = {
          type: 'BLOCKED_ORDERS',
          severity: 'warning',
          message: `${blockedOrders.length} comenzi blocate (>30 min în pending)`,
          data: {
            count: blockedOrders.length,
            orders: blockedOrders,
            oldestOrder: blockedOrders[0]
          },
          timestamp: new Date().toISOString()
        };

        this.emitAlert(alert);
        return alert;
      }
    } catch (error) {
      console.error('❌ [ALERTS] Error checking blocked orders:', error);
    }

    return null;
  }

  /**
   * Alert: Anulare comandă
   */
  alertOrderCancelled(order, reason, platform) {
    const alert = {
      type: 'ORDER_CANCELLED',
      severity: 'warning',
      message: `Comandă #${order.id} anulată`,
      data: {
        order_id: order.id,
        order_total: order.total,
        reason: reason,
        platform: platform || order.platform || 'UNKNOWN',
        customer_name: order.customer_name,
        timestamp: order.timestamp
      },
      timestamp: new Date().toISOString()
    };

    this.emitAlert(alert);
    return alert;
  }

  /**
   * Alert: Comandă nouă de la platformă externă
   */
  alertExternalPlatformOrder(order, platform) {
    const alert = {
      type: 'EXTERNAL_PLATFORM_ORDER',
      severity: 'info',
      message: `Comandă nouă de la ${platform}`,
      data: {
        order_id: order.id,
        order_total: order.total,
        platform: platform,
        customer_name: order.customer_name,
        items_count: order.items?.length || 0
      },
      timestamp: new Date().toISOString()
    };

    this.emitAlert(alert);
    return alert;
  }

  /**
   * Alert: Rate anulare ridicat (>10%)
   */
  async alertHighCancellationRate(platform = null) {
    const db = await dbPromise;
    
    try {
      const fromDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // Last 24 hours
      
      let sql = `
        SELECT 
          COUNT(*) as total_orders,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
          platform
        FROM orders 
        WHERE timestamp >= ?
      `;
      const params = [fromDate];

      if (platform) {
        sql += ' AND platform = ?';
        params.push(platform);
      }

      sql += ' GROUP BY platform';

      const stats = await new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });

      for (const stat of stats) {
        const cancellationRate = stat.total_orders > 0 
          ? (stat.cancelled_orders / stat.total_orders) * 100 
          : 0;

        if (cancellationRate > 10) {
          const alert = {
            type: 'HIGH_CANCELLATION_RATE',
            severity: 'warning',
            message: `Rate anulare ridicat pentru ${stat.platform || 'UNKNOWN'}: ${cancellationRate.toFixed(1)}%`,
            data: {
              platform: stat.platform || 'UNKNOWN',
              total_orders: stat.total_orders,
              cancelled_orders: stat.cancelled_orders,
              cancellation_rate: cancellationRate
            },
            timestamp: new Date().toISOString()
          };

          this.emitAlert(alert);
        }
      }
    } catch (error) {
      console.error('❌ [ALERTS] Error checking cancellation rate:', error);
    }
  }

  /**
   * Alert: Stock override (admin a acceptat comandă cu stoc insuficient)
   */
  alertStockOverride(orderItems, stockChecks, adminUsername) {
    const alert = {
      type: 'STOCK_OVERRIDE',
      severity: 'warning',
      message: `Admin ${adminUsername} a acceptat o comandă cu stoc insuficient`,
      data: {
        orderItems: orderItems,
        stockChecks: stockChecks,
        admin_username: adminUsername
      },
      timestamp: new Date().toISOString()
    };

    this.emitAlert(alert);
    return alert;
  }

  /**
   * Get alert history
   */
  getAlertHistory(limit = 100, type = null) {
    let history = this.alertHistory;

    if (type) {
      history = history.filter(alert => alert.type === type);
    }

    return history.slice(-limit).reverse(); // Most recent first
  }

  /**
   * Periodic check for alerts (should be called by cron/scheduler)
   */
  async checkAllAlerts() {
    // Check blocked orders
    await this.alertBlockedOrders();

    // Check cancellation rates
    await this.alertHighCancellationRate();

    console.log('✅ [ALERTS] Periodic check completed');
  }
}

module.exports = new AlertsService();
