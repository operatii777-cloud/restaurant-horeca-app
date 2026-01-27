/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EXECUTIVE DASHBOARD CONTROLLER
 * 
 * Dashboard executive cu KPI-uri critice:
 * - Vânzări zilnice (total, per platformă, comparații)
 * - Stocuri critice
 * - Comenzi în așteptare
 * - Rate anulare per platformă
 * - Top produse
 * - Profitabilitate
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { dbPromise } = require('../../../database');
const StockAlertsService = require('../stocks/services/stock-alerts.service');
const AlertsService = require('../alerts/alerts.service');
const StatsCache = require('../cache/stats-cache.service');

/**
 * GET /api/executive-dashboard/metrics
 * KPI-uri principale pentru dashboard executive
 */
async function getExecutiveMetrics(req, res, next) {
  try {
    const { startDate, endDate } = req.query;
    
    // Check cache
    const cacheKey = `executive_metrics_${startDate || 'default'}_${endDate || 'default'}`;
    const cached = StatsCache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    
    const db = await dbPromise;
    
    // Default: ultimele 24 ore
    const defaultEndDate = new Date().toISOString();
    const defaultStartDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const fromDate = startDate || defaultStartDate;
    const toDate = endDate || defaultEndDate;
    
    // 1. Vânzări zilnice (total, per platformă)
    const salesStats = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          DATE(timestamp) as date,
          COALESCE(platform, 'POS') as platform,
          COUNT(*) as total_orders,
          SUM(total) as total_revenue,
          AVG(total) as avg_order_value
        FROM orders
        WHERE timestamp >= ? AND timestamp <= ?
          AND status != 'cancelled'
        GROUP BY DATE(timestamp), COALESCE(platform, 'POS')
        ORDER BY date DESC, total_revenue DESC
      `, [fromDate, toDate], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // 2. Total vânzări (astăzi vs ieri)
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const todaySales = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as total_orders,
          SUM(total) as total_revenue,
          AVG(total) as avg_order_value
        FROM orders
        WHERE DATE(timestamp) = ? AND status != 'cancelled'
      `, [today], (err, row) => {
        if (err) reject(err);
        else resolve(row || { total_orders: 0, total_revenue: 0, avg_order_value: 0 });
      });
    });
    
    const yesterdaySales = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as total_orders,
          SUM(total) as total_revenue,
          AVG(total) as avg_order_value
        FROM orders
        WHERE DATE(timestamp) = ? AND status != 'cancelled'
      `, [yesterday], (err, row) => {
        if (err) reject(err);
        else resolve(row || { total_orders: 0, total_revenue: 0, avg_order_value: 0 });
      });
    });
    
    // 3. Vânzări per platformă (astăzi)
    const platformSales = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          COALESCE(platform, 'POS') as platform,
          COUNT(*) as total_orders,
          SUM(total) as total_revenue,
          AVG(total) as avg_order_value
        FROM orders
        WHERE DATE(timestamp) = ? AND status != 'cancelled'
        GROUP BY COALESCE(platform, 'POS')
        ORDER BY total_revenue DESC
      `, [today], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // 4. Stocuri critice
    const criticalStock = await StockAlertsService.getCriticalAlerts();
    const warningStock = await StockAlertsService.getWarningAlerts();
    
    // 5. Comenzi în așteptare
    const pendingOrders = await new Promise((resolve, reject) => {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      db.all(`
        SELECT 
          id,
          status,
          timestamp,
          total,
          platform,
          customer_name,
          table_number,
          CAST((julianday('now') - julianday(timestamp)) * 24 * 60 AS INTEGER) as wait_minutes
        FROM orders
        WHERE status = 'pending' AND timestamp < ?
        ORDER BY timestamp ASC
      `, [thirtyMinutesAgo], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // 6. Rate anulare per platformă
    const cancellationRates = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          COALESCE(platform, 'POS') as platform,
          COUNT(*) as total_orders,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
          CASE 
            WHEN COUNT(*) > 0 THEN 
              ROUND((SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2)
            ELSE 0
          END as cancellation_rate
        FROM orders
        WHERE timestamp >= ? AND timestamp <= ?
        GROUP BY COALESCE(platform, 'POS')
        ORDER BY cancellation_rate DESC
      `, [fromDate, toDate], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // 7. Top 10 produse vândute
    const topProducts = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          oi.product_id,
          oi.name as product_name,
          SUM(oi.quantity) as total_quantity,
          SUM(oi.total) as total_revenue,
          COUNT(DISTINCT oi.order_id) as order_count
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.timestamp >= ? AND o.timestamp <= ?
          AND o.status != 'cancelled'
        GROUP BY oi.product_id, oi.name
        ORDER BY total_quantity DESC
        LIMIT 10
      `, [fromDate, toDate], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // 8. Profitabilitate (estimare bazată pe food cost)
    // Notă: Acest calcul este simplificat, poate fi extins cu costuri reale
    const profitability = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          SUM(o.total) as total_revenue,
          COUNT(*) as total_orders,
          AVG(o.total) as avg_order_value
        FROM orders o
        WHERE o.timestamp >= ? AND o.timestamp <= ?
          AND o.status != 'cancelled'
      `, [fromDate, toDate], (err, row) => {
        if (err) reject(err);
        else {
          // Estimare simplă: 30% food cost, 70% profit brut
          const revenue = parseFloat(row?.total_revenue || 0);
          const estimatedFoodCost = revenue * 0.30;
          const estimatedGrossProfit = revenue * 0.70;
          
          resolve({
            total_revenue: revenue,
            estimated_food_cost: estimatedFoodCost,
            estimated_gross_profit: estimatedGrossProfit,
            profit_margin_percent: 70,
            total_orders: row?.total_orders || 0,
            avg_order_value: parseFloat(row?.avg_order_value || 0)
          });
        }
      });
    });
    
    // Calculează variații (astăzi vs ieri)
    const revenueChange = yesterdaySales.total_revenue > 0
      ? ((todaySales.total_revenue - yesterdaySales.total_revenue) / yesterdaySales.total_revenue) * 100
      : 0;
    
    const ordersChange = yesterdaySales.total_orders > 0
      ? ((todaySales.total_orders - yesterdaySales.total_orders) / yesterdaySales.total_orders) * 100
      : 0;
    
    const response = {
      success: true,
      metrics: {
        // Vânzări astăzi
        today: {
          total_orders: todaySales.total_orders || 0,
          total_revenue: parseFloat(todaySales.total_revenue || 0),
          avg_order_value: parseFloat(todaySales.avg_order_value || 0),
          revenue_change_percent: revenueChange,
          orders_change_percent: ordersChange
        },
        
        // Vânzări ieri (pentru comparație)
        yesterday: {
          total_orders: yesterdaySales.total_orders || 0,
          total_revenue: parseFloat(yesterdaySales.total_revenue || 0),
          avg_order_value: parseFloat(yesterdaySales.avg_order_value || 0)
        },
        
        // Vânzări per platformă
        platform_sales: platformSales.map(p => ({
          platform: p.platform,
          total_orders: p.total_orders || 0,
          total_revenue: parseFloat(p.total_revenue || 0),
          avg_order_value: parseFloat(p.avg_order_value || 0)
        })),
        
        // Stocuri critice
        critical_stock: {
          count: criticalStock.length,
          items: criticalStock.slice(0, 10) // Top 10
        },
        
        // Stocuri warning
        warning_stock: {
          count: warningStock.length,
          items: warningStock.slice(0, 10) // Top 10
        },
        
        // Comenzi în așteptare
        pending_orders: {
          count: pendingOrders.length,
          orders: pendingOrders.slice(0, 10) // Top 10
        },
        
        // Rate anulare
        cancellation_rates: cancellationRates.map(c => ({
          platform: c.platform,
          total_orders: c.total_orders || 0,
          cancelled_orders: c.cancelled_orders || 0,
          cancellation_rate: parseFloat(c.cancellation_rate || 0)
        })),
        
        // Top produse
        top_products: topProducts.map(p => ({
          product_id: p.product_id,
          product_name: p.product_name,
          total_quantity: p.total_quantity || 0,
          total_revenue: parseFloat(p.total_revenue || 0),
          order_count: p.order_count || 0
        })),
        
        // Profitabilitate
        profitability: profitability,
        
        // Vânzări zilnice (pentru grafic)
        daily_sales: salesStats.map(s => ({
          date: s.date,
          platform: s.platform,
          total_orders: s.total_orders || 0,
          total_revenue: parseFloat(s.total_revenue || 0),
          avg_order_value: parseFloat(s.avg_order_value || 0)
        }))
      },
      period: {
        from: fromDate,
        to: toDate
      }
    };
    
    // Cache response (5 minutes)
    StatsCache.set(cacheKey, response, 5 * 60 * 1000);
    
    res.json(response);
  } catch (error) {
    console.error('❌ Error in getExecutiveMetrics:', error);
    next(error);
  }
}

/**
 * GET /api/executive-dashboard/stock-value
 * Valoarea stocului actual
 */
async function getStockValue(req, res, next) {
  try {
    const db = await dbPromise;
    
    const stockValue = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          i.id,
          i.name,
          i.current_stock,
          i.unit,
          i.cost_per_unit,
          (i.current_stock * i.cost_per_unit) as total_value
        FROM ingredients i
        WHERE (i.is_available = 1 OR i.is_available IS NULL)
          AND i.current_stock > 0
        ORDER BY total_value DESC
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    const totalValue = stockValue.reduce((sum, item) => {
      return sum + (parseFloat(item.total_value || 0));
    }, 0);
    
    res.json({
      success: true,
      data: {
        total_value: totalValue,
        items: stockValue.map(item => ({
          id: item.id,
          name: item.name,
          current_stock: parseFloat(item.current_stock || 0),
          unit: item.unit,
          cost_per_unit: parseFloat(item.cost_per_unit || 0),
          total_value: parseFloat(item.total_value || 0)
        }))
      }
    });
  } catch (error) {
    console.error('❌ Error in getStockValue:', error);
    next(error);
  }
}

module.exports = {
  getExecutiveMetrics,
  getStockValue
};
