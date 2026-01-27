/**
 * PLATFORM STATISTICS CONTROLLER
 * 
 * Statistici detaliate per platformă:
 * - MOBILE_APP (aplicația mobilă)
 * - FRIENDSRIDE (integrare Friends Ride)
 * - GLOVO
 * - WOLT
 * - UBER_EATS
 * - BOLT_FOOD
 * - POS (comenzi din restaurant)
 * - KIOSK (self-service)
 * - PHONE (telefon)
 * 
 * Funcționalități:
 * - Overview per platformă
 * - Trenduri pe perioade de timp
 * - Comparații între platforme
 * - Top produse per platformă
 * - Statistici financiare
 */

const { dbPromise } = require('../../../database');
const StatsCache = require('../cache/stats-cache.service');

/**
 * GET /api/platform-stats/platforms
 * Obține lista tuturor platformelor cu statistici de bază
 */
async function getPlatforms(req, res, next) {
  try {
    const { startDate, endDate } = req.query;
    
    // Check cache
    const cacheKey = `platforms_${startDate || 'all'}_${endDate || 'all'}`;
    const cached = StatsCache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    
    const db = await dbPromise;
    
    // Construiește query-ul cu filtrare pe date
    let dateFilter = '';
    const params = [];
    
    if (startDate && endDate) {
      dateFilter = 'WHERE o.timestamp >= ? AND o.timestamp <= ?';
      params.push(startDate, endDate);
    }
    
    // Obține toate platformele cu statistici
    const platforms = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          COALESCE(o.platform, 'POS') as platform,
          COUNT(DISTINCT o.id) as total_orders,
          COALESCE(SUM(o.total), 0) as total_revenue,
          COALESCE(AVG(o.total), 0) as avg_order_value,
          COUNT(DISTINCT o.customer_phone) as unique_customers,
          COUNT(DISTINCT DATE(o.timestamp)) as active_days
        FROM orders o
        ${dateFilter}
        GROUP BY COALESCE(o.platform, 'POS')
        ORDER BY total_revenue DESC
      `, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Formatează rezultatele
    const formattedPlatforms = platforms.map(p => ({
      platform: p.platform || 'POS',
      total_orders: p.total_orders || 0,
      total_revenue: parseFloat(p.total_revenue || 0),
      avg_order_value: parseFloat(p.avg_order_value || 0),
      unique_customers: p.unique_customers || 0,
      active_days: p.active_days || 0,
    }));
    
    const response = {
      success: true,
      platforms: formattedPlatforms,
    };
    
    // Cache response (5 minutes)
    StatsCache.set(cacheKey, response, 5 * 60 * 1000);
    
    res.json(response);
  } catch (error) {
    console.error('❌ Error in getPlatforms:', error);
    next(error);
  }
}

/**
 * GET /api/platform-stats/:platform/overview
 * Statistici generale pentru o platformă specifică
 */
async function getPlatformOverview(req, res, next) {
  try {
    const { platform } = req.params;
    const { startDate, endDate } = req.query;
    const db = await dbPromise;
    
    // Construiește query-ul cu filtrare pe platform și date
    let dateFilter = '';
    const params = [platform || 'POS'];
    
    if (startDate && endDate) {
      dateFilter = 'AND o.timestamp >= ? AND o.timestamp <= ?';
      params.push(startDate, endDate);
    }
    
    // Statistici generale
    const stats = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(DISTINCT o.id) as total_orders,
          COUNT(DISTINCT o.customer_phone) as unique_customers,
          COALESCE(SUM(o.total), 0) as total_revenue,
          COALESCE(AVG(o.total), 0) as avg_order_value,
          COALESCE(MIN(o.total), 0) as min_order_value,
          COALESCE(MAX(o.total), 0) as max_order_value,
          COUNT(DISTINCT DATE(o.timestamp)) as active_days,
          COUNT(DISTINCT o.table_number) as tables_served
        FROM orders o
        WHERE COALESCE(o.platform, 'POS') = ? ${dateFilter}
      `, params, (err, row) => {
        if (err) reject(err);
        else resolve(row || {});
      });
    });
    
    // Statistici per tip comandă
    const orderTypes = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          o.type,
          COUNT(*) as count,
          COALESCE(SUM(o.total), 0) as revenue
        FROM orders o
        WHERE COALESCE(o.platform, 'POS') = ? ${dateFilter}
        GROUP BY o.type
      `, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Statistici per status
    const orderStatuses = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          o.status,
          COUNT(*) as count
        FROM orders o
        WHERE COALESCE(o.platform, 'POS') = ? ${dateFilter}
        GROUP BY o.status
      `, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({
      success: true,
      platform: platform || 'POS',
      stats: {
        total_orders: stats.total_orders || 0,
        unique_customers: stats.unique_customers || 0,
        total_revenue: parseFloat(stats.total_revenue || 0),
        avg_order_value: parseFloat(stats.avg_order_value || 0),
        min_order_value: parseFloat(stats.min_order_value || 0),
        max_order_value: parseFloat(stats.max_order_value || 0),
        active_days: stats.active_days || 0,
        tables_served: stats.tables_served || 0,
      },
      order_types: orderTypes.map(ot => ({
        type: ot.type,
        count: ot.count || 0,
        revenue: parseFloat(ot.revenue || 0),
      })),
      order_statuses: orderStatuses.map(os => ({
        status: os.status,
        count: os.count || 0,
      })),
    });
  } catch (error) {
    console.error('❌ Error in getPlatformOverview:', error);
    next(error);
  }
}

/**
 * GET /api/platform-stats/:platform/trends
 * Trenduri pe perioade de timp pentru o platformă
 */
async function getPlatformTrends(req, res, next) {
  try {
    const { platform } = req.params;
    const { startDate, endDate, period = 'day' } = req.query; // period: 'day', 'week', 'month'
    const db = await dbPromise;
    
    // Setează datele default (ultimele 30 de zile)
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);
    
    const start = startDate || defaultStartDate.toISOString().split('T')[0];
    const end = endDate || defaultEndDate.toISOString().split('T')[0];
    
    let dateFormat, groupBy;
    switch (period) {
      case 'hour':
        dateFormat = "strftime('%Y-%m-%d %H:00:00', o.timestamp)";
        groupBy = "strftime('%Y-%m-%d %H:00:00', o.timestamp)";
        break;
      case 'week':
        dateFormat = "strftime('%Y-W%W', o.timestamp)";
        groupBy = "strftime('%Y-W%W', o.timestamp)";
        break;
      case 'month':
        dateFormat = "strftime('%Y-%m', o.timestamp)";
        groupBy = "strftime('%Y-%m', o.timestamp)";
        break;
      default: // 'day'
        dateFormat = "DATE(o.timestamp)";
        groupBy = "DATE(o.timestamp)";
    }
    
    const trends = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          ${dateFormat} as period,
          COUNT(DISTINCT o.id) as orders,
          COALESCE(SUM(o.total), 0) as revenue,
          COALESCE(AVG(o.total), 0) as avg_order_value,
          COUNT(DISTINCT o.customer_phone) as unique_customers
        FROM orders o
        WHERE COALESCE(o.platform, 'POS') = ? 
          AND o.timestamp >= ? 
          AND o.timestamp <= ?
        GROUP BY ${groupBy}
        ORDER BY period ASC
      `, [platform || 'POS', start, end + ' 23:59:59'], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({
      success: true,
      platform: platform || 'POS',
      period: period,
      startDate: start,
      endDate: end,
      trends: trends.map(t => ({
        period: t.period,
        orders: t.orders || 0,
        revenue: parseFloat(t.revenue || 0),
        avg_order_value: parseFloat(t.avg_order_value || 0),
        unique_customers: t.unique_customers || 0,
      })),
    });
  } catch (error) {
    console.error('❌ Error in getPlatformTrends:', error);
    next(error);
  }
}

/**
 * GET /api/platform-stats/:platform/top-products
 * Top produse pentru o platformă
 */
async function getPlatformTopProducts(req, res, next) {
  try {
    const { platform } = req.params;
    const { startDate, endDate, limit = 10 } = req.query;
    const db = await dbPromise;
    
    // Construiește query-ul cu filtrare pe platform și date
    let dateFilter = '';
    const params = [platform || 'POS'];
    
    if (startDate && endDate) {
      dateFilter = 'AND o.timestamp >= ? AND o.timestamp <= ?';
      params.push(startDate, endDate);
    }
    
    // Verifică dacă există tabela order_items
    const orderItemsExists = await new Promise((resolve) => {
      db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='order_items'`, (err, row) => {
        resolve(!!row);
      });
    });
    
    let topProducts = [];
    
    if (orderItemsExists) {
      // Folosește order_items pentru statistici precise
      topProducts = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            oi.product_id,
            oi.name as product_name,
            SUM(oi.quantity) as total_quantity,
            COUNT(DISTINCT oi.order_id) as order_count,
            COALESCE(SUM(oi.total), 0) as total_revenue
          FROM order_items oi
          INNER JOIN orders o ON oi.order_id = o.id
          WHERE COALESCE(o.platform, 'POS') = ? ${dateFilter}
          GROUP BY oi.product_id, oi.name
          ORDER BY total_quantity DESC
          LIMIT ?
        `, [...params, parseInt(limit)], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    } else {
      // Fallback: parsează items din JSON
      const orders = await new Promise((resolve, reject) => {
        db.all(`
          SELECT o.items
          FROM orders o
          WHERE COALESCE(o.platform, 'POS') = ? ${dateFilter}
        `, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
      
      // Agregă produsele manual
      const productMap = {};
      orders.forEach(order => {
        try {
          const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
          if (Array.isArray(items)) {
            items.forEach(item => {
              const key = item.product_id || item.id || item.name;
              if (!productMap[key]) {
                productMap[key] = {
                  product_id: item.product_id || item.id,
                  product_name: item.name || item.product_name,
                  total_quantity: 0,
                  order_count: 0,
                  total_revenue: 0,
                };
              }
              productMap[key].total_quantity += item.quantity || 1;
              productMap[key].order_count += 1;
              productMap[key].total_revenue += (item.price || 0) * (item.quantity || 1);
            });
          }
        } catch (e) {
          // Ignoră erorile de parsing
        }
      });
      
      topProducts = Object.values(productMap)
        .sort((a, b) => b.total_quantity - a.total_quantity)
        .slice(0, parseInt(limit));
    }
    
    res.json({
      success: true,
      platform: platform || 'POS',
      top_products: topProducts.map(p => ({
        product_id: p.product_id,
        product_name: p.product_name,
        total_quantity: p.total_quantity || 0,
        order_count: p.order_count || 0,
        total_revenue: parseFloat(p.total_revenue || 0),
      })),
    });
  } catch (error) {
    console.error('❌ Error in getPlatformTopProducts:', error);
    next(error);
  }
}

/**
 * GET /api/platform-stats/compare
 * Comparație între platforme
 */
async function comparePlatforms(req, res, next) {
  try {
    const { startDate, endDate, platforms } = req.query;
    const db = await dbPromise;
    
    // Construiește query-ul cu filtrare pe date
    let dateFilter = '';
    const params = [];
    
    if (startDate && endDate) {
      dateFilter = 'WHERE o.timestamp >= ? AND o.timestamp <= ?';
      params.push(startDate, endDate);
    }
    
    // Parsează platformele (dacă sunt specificate)
    let platformFilter = '';
    if (platforms) {
      const platformList = platforms.split(',').map(p => p.trim());
      platformFilter = dateFilter ? 'AND' : 'WHERE';
      platformFilter += ` COALESCE(o.platform, 'POS') IN (${platformList.map(() => '?').join(',')})`;
      params.push(...platformList);
    }
    
    // Comparație între platforme
    const comparison = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          COALESCE(o.platform, 'POS') as platform,
          COUNT(DISTINCT o.id) as total_orders,
          COALESCE(SUM(o.total), 0) as total_revenue,
          COALESCE(AVG(o.total), 0) as avg_order_value,
          COUNT(DISTINCT o.customer_phone) as unique_customers,
          COUNT(DISTINCT DATE(o.timestamp)) as active_days,
          COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total ELSE 0 END), 0) as completed_revenue,
          COUNT(CASE WHEN o.status = 'completed' THEN 1 END) as completed_orders
        FROM orders o
        ${dateFilter} ${platformFilter}
        GROUP BY COALESCE(o.platform, 'POS')
        ORDER BY total_revenue DESC
      `, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Calculează totaluri pentru procente
    const totalRevenue = comparison.reduce((sum, p) => sum + parseFloat(p.total_revenue || 0), 0);
    const totalOrders = comparison.reduce((sum, p) => sum + (p.total_orders || 0), 0);
    
    res.json({
      success: true,
      startDate: startDate || null,
      endDate: endDate || null,
      comparison: comparison.map(p => ({
        platform: p.platform || 'POS',
        total_orders: p.total_orders || 0,
        total_revenue: parseFloat(p.total_revenue || 0),
        avg_order_value: parseFloat(p.avg_order_value || 0),
        unique_customers: p.unique_customers || 0,
        active_days: p.active_days || 0,
        completed_revenue: parseFloat(p.completed_revenue || 0),
        completed_orders: p.completed_orders || 0,
        revenue_percentage: totalRevenue > 0 ? (parseFloat(p.total_revenue || 0) / totalRevenue * 100).toFixed(2) : 0,
        orders_percentage: totalOrders > 0 ? ((p.total_orders || 0) / totalOrders * 100).toFixed(2) : 0,
      })),
      totals: {
        total_revenue: totalRevenue,
        total_orders: totalOrders,
      },
    });
  } catch (error) {
    console.error('❌ Error in comparePlatforms:', error);
    next(error);
  }
}

/**
 * GET /api/platform-stats/:platform/hourly
 * Statistici pe ore pentru o platformă
 */
async function getPlatformHourly(req, res, next) {
  try {
    const { platform } = req.params;
    const { startDate, endDate } = req.query;
    const db = await dbPromise;
    
    // Setează datele default (ultimele 7 zile)
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 7);
    
    const start = startDate || defaultStartDate.toISOString().split('T')[0];
    const end = endDate || defaultEndDate.toISOString().split('T')[0];
    
    const hourly = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          CAST(strftime('%H', o.timestamp) AS INTEGER) as hour,
          COUNT(DISTINCT o.id) as orders,
          COALESCE(SUM(o.total), 0) as revenue,
          COALESCE(AVG(o.total), 0) as avg_order_value
        FROM orders o
        WHERE COALESCE(o.platform, 'POS') = ? 
          AND o.timestamp >= ? 
          AND o.timestamp <= ?
        GROUP BY CAST(strftime('%H', o.timestamp) AS INTEGER)
        ORDER BY hour ASC
      `, [platform || 'POS', start, end + ' 23:59:59'], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({
      success: true,
      platform: platform || 'POS',
      startDate: start,
      endDate: end,
      hourly: hourly.map(h => ({
        hour: h.hour || 0,
        orders: h.orders || 0,
        revenue: parseFloat(h.revenue || 0),
        avg_order_value: parseFloat(h.avg_order_value || 0),
      })),
    });
  } catch (error) {
    console.error('❌ Error in getPlatformHourly:', error);
    next(error);
  }
}

module.exports = {
  getPlatforms,
  getPlatformOverview,
  getPlatformTrends,
  getPlatformTopProducts,
  comparePlatforms,
  getPlatformHourly,
};
