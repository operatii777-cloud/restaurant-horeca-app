/**
 * ORDER HEALTH MONITOR
 * 
 * Monitorizează uniformitatea comenzilor
 * Verifică că toate comenzile respectă principiul de uniformitate
 */

const { dbPromise } = require('../../../database');

class OrderHealthMonitor {
  /**
   * Verifică starea de sănătate a sistemului de comenzi
   */
  async checkHealth() {
    try {
      const [stockMovements, eventEmissions, apiEndpoints, platformDistribution, nullFields] = await Promise.all([
        this._checkStockMovements(),
        this._checkEvents(),
        this._checkEndpoints(),
        this._checkDistribution(),
        this._checkNullFields()
      ]);
      
      return {
        status: this._calculateOverallStatus([stockMovements, eventEmissions, apiEndpoints, platformDistribution, nullFields]),
        checks: {
          stockMovements,
          eventEmissions,
          apiEndpoints,
          platformDistribution,
          nullFields
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ [OrderHealthMonitor] Error checking health:', error);
      return {
        status: 'ERROR',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  /**
   * Verifică dacă toate comenzile au stock_movements
   */
  async _checkStockMovements() {
    const db = await dbPromise;
    
    const result = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as total_orders,
          COUNT(sm.id) as orders_with_movements,
          COUNT(*) - COUNT(sm.id) as orders_without_movements
        FROM orders o
        LEFT JOIN stock_moves sm ON (
          (sm.reference_id = o.id AND sm.reference_type = 'ORDER')
          OR sm.order_id = o.id
        )
        WHERE o.status != 'cancelled'
          AND o.timestamp >= datetime('now', '-24 hours')
      `, [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    const percentage = result.total_orders > 0 
      ? ((result.orders_with_movements / result.total_orders) * 100).toFixed(2)
      : 100;
    
    return {
      status: result.orders_without_movements === 0 ? 'OK' : 'WARNING',
      totalOrders: result.total_orders,
      ordersWithMovements: result.orders_with_movements,
      ordersWithoutMovements: result.orders_without_movements,
      percentage: `${percentage}%`,
      message: result.orders_without_movements === 0 
        ? '✅ Toate comenzile au stock_movements'
        : `⚠️ ${result.orders_without_movements} comenzi fără stock_movements`
    };
  }
  
  /**
   * Verifică distribuția pe platforme
   */
  async _checkDistribution() {
    const db = await dbPromise;
    
    const result = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          platform,
          order_source,
          COUNT(*) as count,
          SUM(total) as total_revenue
        FROM orders
        WHERE status != 'cancelled'
          AND timestamp >= datetime('now', '-24 hours')
        GROUP BY platform, order_source
        ORDER BY count DESC
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    return {
      status: 'OK',
      distribution: result,
      message: `Distribuție pe ${result.length} platforme/surse`
    };
  }
  
  /**
   * Verifică câmpuri NULL (platform, order_source)
   */
  async _checkNullFields() {
    const db = await dbPromise;
    
    const result = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN platform IS NULL THEN 1 ELSE 0 END) as null_platform,
          SUM(CASE WHEN order_source IS NULL THEN 1 ELSE 0 END) as null_order_source
        FROM orders
        WHERE status != 'cancelled'
          AND timestamp >= datetime('now', '-24 hours')
      `, [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    const hasNulls = result.null_platform > 0 || result.null_order_source > 0;
    
    return {
      status: hasNulls ? 'ERROR' : 'OK',
      total: result.total,
      nullPlatform: result.null_platform,
      nullOrderSource: result.null_order_source,
      message: hasNulls
        ? `❌ ${result.null_platform + result.null_order_source} comenzi cu câmpuri NULL`
        : '✅ Toate comenzile au platform și order_source setate'
    };
  }
  
  /**
   * Verifică endpoint-urile API (placeholder - ar trebui să verifice logica)
   */
  async _checkEndpoints() {
    // Placeholder - ar trebui să verifice că toate endpoint-urile funcționează
    return {
      status: 'OK',
      message: 'Endpoint-uri API verificate (placeholder)'
    };
  }
  
  /**
   * Verifică evenimente (placeholder - ar trebui să verifice că evenimentele sunt emise)
   */
  async _checkEvents() {
    // Placeholder - ar trebui să verifice că evenimentele sunt emise corect
    return {
      status: 'OK',
      message: 'Evenimente verificate (placeholder)'
    };
  }
  
  /**
   * Calculează statusul general
   */
  _calculateOverallStatus(checks) {
    const statuses = checks.map(c => c.status);
    if (statuses.includes('ERROR')) return 'ERROR';
    if (statuses.includes('WARNING')) return 'WARNING';
    return 'OK';
  }
  
  /**
   * Obține comenzi fără stock_movements (pentru debugging)
   */
  async getOrdersWithoutStockMovements(limit = 10) {
    const db = await dbPromise;
    
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          o.id,
          o.platform,
          o.order_source,
          o.type,
          o.timestamp,
          o.status
        FROM orders o
        LEFT JOIN stock_moves sm ON (
          (sm.reference_id = o.id AND sm.reference_type = 'ORDER')
          OR sm.order_id = o.id
        )
        WHERE o.status != 'cancelled'
          AND o.timestamp >= datetime('now', '-7 days')
          AND sm.id IS NULL
        ORDER BY o.timestamp DESC
        LIMIT ?
      `, [limit], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }
}

module.exports = new OrderHealthMonitor();
