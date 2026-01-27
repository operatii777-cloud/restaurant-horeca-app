/**
 * REPORTS CONTROLLER
 * Advanced reporting endpoints for sales, profitability, customer behavior, and time trends
 */

const { dbPromise } = require('../../../database');

// Helper function pentru a obține categoria unui produs
async function getCategoryForProduct(productId, db) {
  if (!productId) return null;
  return new Promise((resolve) => {
    db.get('SELECT category FROM menu WHERE id = ?', [productId], (err, row) => {
      if (err || !row) resolve(null);
      else resolve(row.category);
    });
  });
}

/**
 * GET /api/reports/customer-behavior
 * Raport comportament clienți: frecvență, valoare medie, top clienți
 */
async function getCustomerBehaviorReport(req, res, next) {
  try {
    const { startDate, endDate } = req.query;
    const db = await dbPromise;

    // Validare date
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'startDate și endDate sunt obligatorii'
      });
    }

    // 1. Top clienți după valoare totală
    const topCustomers = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          customer_name,
          customer_phone,
          COUNT(*) as order_count,
          SUM(total) as total_spent,
          AVG(total) as avg_order_value,
          MAX(timestamp) as last_order_date
        FROM orders
        WHERE DATE(timestamp) BETWEEN ? AND ?
          AND status IN ('paid', 'completed', 'delivered')
          AND (table_number IS NULL OR table_number >= 0)
          AND (client_identifier IS NULL OR LOWER(client_identifier) NOT LIKE '%test%')
          AND customer_name IS NOT NULL
          AND customer_name != ''
        GROUP BY customer_name, customer_phone
        ORDER BY total_spent DESC
        LIMIT 20
      `, [startDate, endDate], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // 2. Distribuție frecvență comenzi
    const frequencyDistribution = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          CASE 
            WHEN order_count = 1 THEN '1 comandă'
            WHEN order_count BETWEEN 2 AND 5 THEN '2-5 comenzi'
            WHEN order_count BETWEEN 6 AND 10 THEN '6-10 comenzi'
            WHEN order_count BETWEEN 11 AND 20 THEN '11-20 comenzi'
            ELSE '20+ comenzi'
          END as frequency_range,
          COUNT(*) as customer_count,
          SUM(total_spent) as total_revenue
        FROM (
          SELECT 
            customer_name,
            COUNT(*) as order_count,
            SUM(total) as total_spent
          FROM orders
          WHERE DATE(timestamp) BETWEEN ? AND ?
            AND status IN ('paid', 'completed', 'delivered')
            AND (table_number IS NULL OR table_number >= 0)
            AND (client_identifier IS NULL OR LOWER(client_identifier) NOT LIKE '%test%')
            AND customer_name IS NOT NULL
            AND customer_name != ''
          GROUP BY customer_name
        )
        GROUP BY frequency_range
        ORDER BY 
          CASE frequency_range
            WHEN '1 comandă' THEN 1
            WHEN '2-5 comenzi' THEN 2
            WHEN '6-10 comenzi' THEN 3
            WHEN '11-20 comenzi' THEN 4
            ELSE 5
          END
      `, [startDate, endDate], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // 3. Valoare medie per segment
    const avgOrderValue = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          AVG(total) as avg_order_value,
          MIN(total) as min_order_value,
          MAX(total) as max_order_value,
          COUNT(*) as total_orders
        FROM orders
        WHERE DATE(timestamp) BETWEEN ? AND ?
          AND status IN ('paid', 'completed', 'delivered')
          AND (table_number IS NULL OR table_number >= 0)
          AND (client_identifier IS NULL OR LOWER(client_identifier) NOT LIKE '%test%')
      `, [startDate, endDate], (err, row) => {
        if (err) reject(err);
        else resolve(row || {});
      });
    });

    // 4. Tipuri de comenzi (dine_in, delivery, takeaway)
    const orderTypes = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          type,
          COUNT(*) as count,
          SUM(total) as revenue,
          AVG(total) as avg_value
        FROM orders
        WHERE DATE(timestamp) BETWEEN ? AND ?
          AND status IN ('paid', 'completed', 'delivered')
          AND (status IS NULL OR status <> 'cancelled')
          AND (table_number IS NULL OR table_number >= 0)
          AND (client_identifier IS NULL OR LOWER(client_identifier) NOT LIKE '%test%')
        GROUP BY type
      `, [startDate, endDate], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    res.json({
      success: true,
      data: {
        topCustomers,
        frequencyDistribution,
        avgOrderValue,
        orderTypes
      },
      summary: {
        totalCustomers: topCustomers.length,
        totalOrders: avgOrderValue.total_orders || 0,
        avgOrderValue: avgOrderValue.avg_order_value || 0,
        period: { startDate, endDate }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error in getCustomerBehaviorReport:', error);
    next(error);
  }
}

/**
 * GET /api/reports/profitability
 * Raport profitabilitate: venituri, costuri, profit, marjă per PRODUS
 */
async function getProfitabilityReport(req, res, next) {
  console.log('🚀 [PROFITABILITY] Function called!');
  try {
    const { startDate, endDate } = req.query;
    console.log(`📊 [PROFITABILITY] Params: startDate=${startDate}, endDate=${endDate}`);
    const db = await dbPromise;
    console.log(`📊 [PROFITABILITY] DB obtained: ${db ? 'yes' : 'no'}`);

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'startDate și endDate sunt obligatorii'
      });
    }

    // 1. Produse individuale agregate din comenzi - folosim exact același pattern ca /api/admin/top-products
    console.log(`📊 [PROFITABILITY] Querying products for ${startDate} to ${endDate}`);
    const productsData = await new Promise((resolve) => {
      console.log(`📊 [PROFITABILITY] Executing query...`);
      db.all(`
        SELECT 
          COALESCE(json_extract(item.value, '$.productName'), json_extract(item.value, '$.name')) as name,
          COALESCE(json_extract(item.value, '$.productId'), json_extract(item.value, '$.id')) as product_id,
          COALESCE(json_extract(item.value, '$.category'), m.category, 'Fără categorie') as category,
          COUNT(DISTINCT o.id) as times_ordered,
          SUM(CAST(COALESCE(json_extract(item.value, '$.quantity'), json_extract(item.value, '$.qty'), 1) AS REAL)) as total_quantity_sold,
          SUM(CAST(COALESCE(json_extract(item.value, '$.finalPrice'), json_extract(item.value, '$.total'), json_extract(item.value, '$.price') * COALESCE(json_extract(item.value, '$.quantity'), json_extract(item.value, '$.qty'), 1)) AS REAL)) as total_revenue,
          AVG(CAST(COALESCE(json_extract(item.value, '$.finalPrice'), json_extract(item.value, '$.total'), json_extract(item.value, '$.price') * COALESCE(json_extract(item.value, '$.quantity'), json_extract(item.value, '$.qty'), 1)) AS REAL) / NULLIF(CAST(COALESCE(json_extract(item.value, '$.quantity'), json_extract(item.value, '$.qty'), 1) AS REAL), 0)) as avg_selling_price
        FROM orders o
        JOIN json_each(o.items) item
        LEFT JOIN menu m ON json_extract(item.value, '$.productId') = m.id OR json_extract(item.value, '$.id') = m.id
        WHERE DATE(o.timestamp) BETWEEN ? AND ?
          AND o.status IN ('paid', 'completed', 'delivered')
          AND (o.table_number IS NULL OR o.table_number >= 0)
          AND (o.client_identifier IS NULL OR LOWER(o.client_identifier) NOT LIKE '%test%')
          AND (json_extract(item.value, '$.productName') IS NOT NULL OR json_extract(item.value, '$.name') IS NOT NULL)
        GROUP BY 
          COALESCE(json_extract(item.value, '$.productName'), json_extract(item.value, '$.name')),
          COALESCE(json_extract(item.value, '$.productId'), json_extract(item.value, '$.id')),
          COALESCE(json_extract(item.value, '$.category'), m.category, 'Fără categorie')
        ORDER BY total_revenue DESC
      `, [startDate, endDate], (err, rows) => {
        if (err) {
          console.error('❌ Error in profitability products query:', err);
          resolve([]);
        } else {
          console.log(`📊 [PROFITABILITY] Query executed, rows: ${rows?.length || 0}`);
          resolve(rows || []);
        }
      });
    });
    
    console.log(`📊 [PROFITABILITY] ProductsData received: ${productsData?.length || 0} items`);
    
    // Transformăm datele pentru a se potrivi cu interfața TopProduct
    const products = (productsData || []).map((row, index) => ({
      id: row.product_id || index + 1,
      name: row.name || 'Produs necunoscut',
      category: row.category || 'Fără categorie',
      times_ordered: parseInt(row.times_ordered) || 0,
      total_quantity_sold: parseFloat(row.total_quantity_sold) || 0,
      total_revenue: parseFloat(row.total_revenue) || 0,
      avg_selling_price: parseFloat(row.avg_selling_price) || 0,
    }));
    
    console.log(`📊 [PROFITABILITY] Final products array: ${products.length} items`);

    // 2. Venituri totale din comenzi (pentru summary)
    const revenue = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          SUM(total) as total_revenue,
          COUNT(*) as order_count,
          AVG(total) as avg_order_value
        FROM orders
        WHERE DATE(timestamp) BETWEEN ? AND ?
          AND status IN ('paid', 'completed', 'delivered')
          AND (table_number IS NULL OR table_number >= 0)
          AND (client_identifier IS NULL OR LOWER(client_identifier) NOT LIKE '%test%')
      `, [startDate, endDate], (err, row) => {
        if (err) reject(err);
        else resolve(row || {});
      });
    });

    // 3. Costuri ingrediente (din stock_moves pentru perioada)
    const costs = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COALESCE(SUM(sm.value_out), 0) as total_cost
        FROM stock_moves sm
        JOIN orders o ON sm.order_id = o.id
        WHERE DATE(o.timestamp) BETWEEN ? AND ?
          AND o.status IN ('paid', 'completed', 'delivered')
          AND (o.table_number IS NULL OR o.table_number >= 0)
          AND (o.client_identifier IS NULL OR LOWER(o.client_identifier) NOT LIKE '%test%')
          AND sm.type IN ('SALE_OUT', 'CONSUME')
      `, [startDate, endDate], (err, row) => {
        if (err) {
          resolve({ total_cost: 0 });
        } else {
          resolve(row || { total_cost: 0 });
        }
      });
    });

    // 4. Profit și marjă totale
    const totalRevenue = parseFloat(revenue.total_revenue) || 0;
    const totalCost = parseFloat(costs.total_cost) || 0;
    const profit = totalRevenue - totalCost;
    const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    res.json({
      success: true,
      data: products,
      summary: {
        revenue: totalRevenue,
        costs: totalCost,
        profit: profit,
        margin: margin.toFixed(2),
        orderCount: revenue.order_count || 0,
        avgOrderValue: revenue.avg_order_value || 0
      },
      period: { startDate, endDate },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error in getProfitabilityReport:', error);
    next(error);
  }
}

/**
 * GET /api/reports/sales-detailed
 * Raport vânzări detaliate: produse, categorii, zilnic
 */
async function getSalesDetailedReport(req, res, next) {
  try {
    const { startDate, endDate, category, start_date, end_date } = req.query;
    const db = await dbPromise;

    // Support both startDate/endDate and start_date/end_date (for compatibility)
    const dateFrom = startDate || start_date;
    const dateTo = endDate || end_date;
    
    // If no dates provided, use last 30 days as default
    const defaultDateTo = new Date().toISOString().split('T')[0];
    const defaultDateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const finalDateFrom = dateFrom || defaultDateFrom;
    const finalDateTo = dateTo || defaultDateTo;

    // Query pentru date detaliate per item (așa cum așteaptă frontend-ul)
    let query = `
      SELECT 
        o.id as order_id,
        o.timestamp,
        o.table_number,
        o.customer_name as client_identifier,
        json_extract(item.value, '$.productName') as product_name,
        json_extract(item.value, '$.category') as category,
        json_extract(item.value, '$.quantity') as quantity,
        json_extract(item.value, '$.price') as price,
        (json_extract(item.value, '$.price') * json_extract(item.value, '$.quantity')) as final_price
      FROM orders o
      JOIN json_each(o.items) item
      WHERE DATE(o.timestamp) BETWEEN ? AND ?
        AND o.status IN ('paid', 'completed', 'delivered')
        AND (o.status IS NULL OR o.status <> 'cancelled')
        AND (o.table_number IS NULL OR o.table_number >= 0)
        AND (o.client_identifier IS NULL OR LOWER(o.client_identifier) NOT LIKE '%test%')
    `;
    
    const params = [finalDateFrom, finalDateTo];
    
    if (category) {
      query += ` AND json_extract(item.value, '$.category') = ?`;
      params.push(category);
    }
    
    query += `
      ORDER BY o.timestamp DESC, o.id DESC
      LIMIT 10000
    `;

    const salesData = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else {
          // Convert quantity, price, final_price to numbers and handle nulls
          const processedRows = (rows || []).map(row => ({
            ...row,
            quantity: row.quantity ? Number(row.quantity) : 0,
            price: row.price ? Number(row.price) : 0,
            final_price: row.final_price ? Number(row.final_price) : (row.price ? Number(row.price) * (row.quantity ? Number(row.quantity) : 1) : 0)
          }));
          resolve(processedRows);
        }
      });
    });

    // Sumar zilnic
    const dailySummary = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          DATE(timestamp) as date,
          COUNT(*) as order_count,
          SUM(total) as daily_revenue,
          AVG(total) as avg_order_value
        FROM orders
        WHERE DATE(timestamp) BETWEEN ? AND ?
          AND status IN ('paid', 'completed', 'delivered')
          AND (status IS NULL OR status <> 'cancelled')
          AND (table_number IS NULL OR table_number >= 0)
          AND (client_identifier IS NULL OR LOWER(client_identifier) NOT LIKE '%test%')
        GROUP BY DATE(timestamp)
        ORDER BY date DESC
      `, [finalDateFrom, finalDateTo], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    res.json({
      success: true,
      data: salesData,
      dailySummary: dailySummary,
      period: { startDate: finalDateFrom, endDate: finalDateTo, category: category || 'all' },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error in getSalesDetailedReport:', error);
    next(error);
  }
}

/**
 * GET /api/reports/time-trends
 * Raport tendințe în timp: vânzări pe ore, zile, săptămâni
 */
async function getTimeTrendsReport(req, res, next) {
  try {
    const { startDate, endDate, period = 'daily' } = req.query;
    const db = await dbPromise;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'startDate și endDate sunt obligatorii'
      });
    }

    let timeGroup, timeFormat;
    if (period === 'hourly') {
      timeGroup = "strftime('%Y-%m-%d %H:00', timestamp)";
      timeFormat = "strftime('%Y-%m-%d %H:00', timestamp)";
    } else if (period === 'weekly') {
      timeGroup = "strftime('%Y-W%W', timestamp)";
      timeFormat = "strftime('%Y-W%W', timestamp)";
    } else {
      // daily (default)
      timeGroup = "DATE(timestamp)";
      timeFormat = "DATE(timestamp)";
    }

    const trends = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          ${timeFormat} as time_period,
          COUNT(*) as order_count,
          SUM(total) as revenue,
          AVG(total) as avg_order_value,
          COUNT(DISTINCT customer_name) as unique_customers
        FROM orders
        WHERE DATE(timestamp) BETWEEN ? AND ?
          AND status IN ('paid', 'completed', 'delivered')
          AND (table_number IS NULL OR table_number >= 0)
          AND (client_identifier IS NULL OR LOWER(client_identifier) NOT LIKE '%test%')
        GROUP BY ${timeGroup}
        ORDER BY time_period ASC
      `, [startDate, endDate], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // Statistici pe zile ale săptămânii
    const dayOfWeekStats = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          CASE strftime('%w', timestamp)
            WHEN '0' THEN 'Duminică'
            WHEN '1' THEN 'Luni'
            WHEN '2' THEN 'Marți'
            WHEN '3' THEN 'Miercuri'
            WHEN '4' THEN 'Joi'
            WHEN '5' THEN 'Vineri'
            WHEN '6' THEN 'Sâmbătă'
          END as day_name,
          strftime('%w', timestamp) as day_number,
          COUNT(*) as order_count,
          SUM(total) as revenue,
          AVG(total) as avg_order_value
        FROM orders
        WHERE DATE(timestamp) BETWEEN ? AND ?
          AND status IN ('paid', 'completed', 'delivered')
          AND (table_number IS NULL OR table_number >= 0)
          AND (client_identifier IS NULL OR LOWER(client_identifier) NOT LIKE '%test%')
        GROUP BY strftime('%w', timestamp)
        ORDER BY day_number
      `, [startDate, endDate], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // Statistici pe ore (pentru toată perioada)
    const hourStats = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          strftime('%H', timestamp) as hour,
          COUNT(*) as order_count,
          SUM(total) as revenue
        FROM orders
        WHERE DATE(timestamp) BETWEEN ? AND ?
          AND status IN ('paid', 'completed', 'delivered')
          AND (table_number IS NULL OR table_number >= 0)
          AND (client_identifier IS NULL OR LOWER(client_identifier) NOT LIKE '%test%')
        GROUP BY strftime('%H', timestamp)
        ORDER BY hour
      `, [startDate, endDate], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    res.json({
      success: true,
      data: trends,
      dayOfWeekStats: dayOfWeekStats,
      hourStats: hourStats,
      period: { startDate, endDate, period },
      summary: {
        totalOrders: trends.reduce((sum, t) => sum + (t.order_count || 0), 0),
        totalRevenue: trends.reduce((sum, t) => sum + (t.revenue || 0), 0),
        avgDailyOrders: trends.length > 0 ? trends.reduce((sum, t) => sum + (t.order_count || 0), 0) / trends.length : 0
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error in getTimeTrendsReport:', error);
    next(error);
  }
}

/**
 * GET /api/reports/stock-prediction
 * Predicție stocuri bazată pe consumul mediu zilnic
 */
async function getStockPredictionReport(req, res, next) {
  try {
    const { days_ahead = 14 } = req.query;
    const daysAhead = parseInt(days_ahead) || 14;
    const db = await dbPromise;

    // 1. Obține toate ingredientele cu stoc curent
    const ingredients = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          id as ingredient_id,
          name as ingredient_name,
          unit,
          current_stock,
          min_stock,
          cost_per_unit
        FROM ingredients
        WHERE current_stock IS NOT NULL
        ORDER BY name
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    if (ingredients.length === 0) {
      return res.json([]);
    }

    // 2. Calculează consumul mediu zilnic pentru fiecare ingredient din ultimele 30 de zile
    const predictions = await Promise.all(
      ingredients.map(async (ingredient) => {
        // Consum mediu zilnic din ultimele 30 de zile
        const avgDailyConsumption = await new Promise((resolve, reject) => {
          db.get(`
            SELECT 
              COALESCE(AVG(daily_consumption), 0) as avg_daily_consumption
            FROM (
              SELECT 
                DATE(date) as date,
                SUM(quantity_out) as daily_consumption
              FROM stock_moves
              WHERE ingredient_id = ?
                AND type = 'CONSUME'
                AND quantity_out > 0
                AND date >= datetime('now', '-30 days')
              GROUP BY DATE(date)
            )
          `, [ingredient.ingredient_id], (err, row) => {
            if (err) reject(err);
            else resolve(row?.avg_daily_consumption || 0);
          });
        });

        const currentStock = ingredient.current_stock || 0;
        const minStock = ingredient.min_stock || 0;
        const predictedConsumption = avgDailyConsumption * daysAhead;
        const predictedStock = currentStock - predictedConsumption;
        
        // Zile până ajunge la stoc minim
        const daysUntilMin = avgDailyConsumption > 0 
          ? Math.max(0, Math.floor((currentStock - minStock) / avgDailyConsumption))
          : 999;
        
        // Zile până se epuizează
        const daysUntilZero = avgDailyConsumption > 0
          ? Math.max(0, Math.floor(currentStock / avgDailyConsumption))
          : 999;

        // Recomandare
        let recommendation = 'OK';
        if (predictedStock < 0) {
          recommendation = 'URGENT: Comandă imediată necesară';
        } else if (predictedStock < minStock) {
          recommendation = 'Recomandat: Comandă în următoarele zile';
        } else if (daysUntilMin < 7) {
          recommendation = 'Monitorizare: Stoc scăzut în apropierea minimului';
        }

        return {
          ingredient_id: ingredient.ingredient_id,
          ingredient_name: ingredient.ingredient_name,
          unit: ingredient.unit || 'buc',
          current_stock: currentStock,
          min_stock: minStock,
          predicted_consumption: Math.round(predictedConsumption * 100) / 100,
          predicted_days_until_min: daysUntilMin,
          predicted_days_until_zero: daysUntilZero,
          recommendation: recommendation,
          unit_cost: ingredient.cost_per_unit || 0,
          predicted_cost: (predictedConsumption * (ingredient.cost_per_unit || 0))
        };
      })
    );

    // Sortare după zile până la epuizare (cel mai urgent primul)
    predictions.sort((a, b) => a.predicted_days_until_zero - b.predicted_days_until_zero);

    res.json(predictions);
  } catch (error) {
    console.error('❌ Error in getStockPredictionReport:', error);
    next(error);
  }
}

/**
 * GET /api/reports/delivery-performance
 * Raport performanță livrări
 */
async function getDeliveryPerformanceReport(req, res, next) {
  try {
    const { start_date, end_date } = req.query;
    const db = await dbPromise;
    
    // Default dates (current month if not provided)
    const endDate = end_date || new Date().toISOString().split('T')[0];
    const startDate = start_date || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    
    // Stats generale livrări
    const deliveryStats = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as total_orders,
          SUM(total) as total_revenue,
          AVG(total) as avg_order_value,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders
        FROM orders
        WHERE order_source IN ('delivery', 'external')
          AND DATE(timestamp) >= DATE(?)
          AND DATE(timestamp) <= DATE(?)
      `, [startDate, endDate], (err, row) => {
        if (err) reject(err);
        else resolve(row || {});
      });
    });
    
    // Breakdown by source (delivery vs drive-thru)
    const breakdownBySource = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          order_source,
          COUNT(*) as count,
          SUM(total) as revenue,
          AVG(0) as avg_prep_time_minutes,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
        FROM orders
        WHERE order_source IN ('delivery', 'external', 'drive_thru')
          AND DATE(timestamp) >= DATE(?)
          AND DATE(timestamp) <= DATE(?)
        GROUP BY order_source
      `, [startDate, endDate], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    const cancellationRate = deliveryStats.total_orders > 0 
      ? ((deliveryStats.cancelled_orders / deliveryStats.total_orders) * 100).toFixed(2) 
      : '0.00';
    
    res.json({
      period: { start: startDate, end: endDate },
      summary: {
        total_orders: deliveryStats.total_orders || 0,
        total_revenue: deliveryStats.total_revenue || 0,
        avg_order_value: deliveryStats.avg_order_value || 0,
        cancelled_orders: deliveryStats.cancelled_orders || 0,
        cancellation_rate: cancellationRate,
        breakdown_by_source: breakdownBySource,
        breakdown_by_platform: [],
        financial: {
          gross_revenue: deliveryStats.total_revenue || 0,
          platform_commissions: 0,
          delivery_fees_charged: 0,
          packaging_costs: 0,
          net_revenue: deliveryStats.total_revenue || 0
        }
      },
      couriers: [],
      cancellations: []
    });
  } catch (error) {
    console.error('Error in getDeliveryPerformanceReport:', error);
    next(error);
  }
}

/**
 * GET /api/reports/drive-thru-performance
 * Raport performanță Drive-Thru
 */
async function getDriveThruPerformanceReport(req, res, next) {
  try {
    const { from, to } = req.query;
    const db = await dbPromise;
    
    // Default dates (last 7 days if not provided)
    const endDate = to || new Date().toISOString().split('T')[0];
    const startDate = from || new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0];
    
    // Stats generale Drive-Thru
    const driveThruStats = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as total_orders,
          SUM(CASE WHEN status IN ('paid', 'completed') THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
          AVG(CASE WHEN status IN ('paid', 'completed') THEN total ELSE NULL END) as avg_order_value,
          SUM(total) as total_revenue
        FROM orders
        WHERE order_source = 'drive-thru'
          AND DATE(timestamp) >= DATE(?)
          AND DATE(timestamp) <= DATE(?)
      `, [startDate, endDate], (err, row) => {
        if (err) reject(err);
        else resolve(row || {});
      });
    });
    
    // Performanță per oră (peak hours)
    const hourlyPerformance = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          CAST(strftime('%H', timestamp) AS INTEGER) as hour,
          COUNT(*) as orders,
          SUM(total) as revenue
        FROM orders
        WHERE order_source = 'drive-thru'
          AND DATE(timestamp) >= DATE(?)
          AND DATE(timestamp) <= DATE(?)
        GROUP BY hour
        ORDER BY hour ASC
      `, [startDate, endDate], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({
      success: true,
      data: {
        stats: driveThruStats,
        hourly: hourlyPerformance,
        period: { from: startDate, to: endDate }
      }
    });
  } catch (error) {
    console.error('Error in getDriveThruPerformanceReport:', error);
    next(error);
  }
}

/**
 * GET /api/reports/abc-analysis
 * Raport ABC Analysis - clasificare produse după contribuție la venit
 * Categoria A: 80% din venit (top produse)
 * Categoria B: 15% din venit (produse medii)
 * Categoria C: 5% din venit (produse low-contribution)
 */
async function getABCAnalysisReport(req, res, next) {
  try {
    const { period_months } = req.query;
    const db = await dbPromise;
    
    // Default: ultimele 3 luni
    const months = parseInt(period_months) || 3;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = new Date().toISOString().split('T')[0];
    
    // Agregare vânzări pe produs - folosim json_each pentru a extrage din items JSON
    const productSales = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          COALESCE(json_extract(item.value, '$.productName'), json_extract(item.value, '$.name')) as product_name,
          COALESCE(json_extract(item.value, '$.productId'), json_extract(item.value, '$.id')) as product_id,
          SUM(CAST(COALESCE(json_extract(item.value, '$.quantity'), json_extract(item.value, '$.qty'), 1) AS REAL)) as total_quantity,
          SUM(CAST(COALESCE(json_extract(item.value, '$.finalPrice'), json_extract(item.value, '$.total'), 
            json_extract(item.value, '$.price') * COALESCE(json_extract(item.value, '$.quantity'), json_extract(item.value, '$.qty'), 1)) AS REAL)) as total_revenue,
          COUNT(DISTINCT o.id) as order_count
        FROM orders o
        JOIN json_each(o.items) item
        WHERE DATE(o.timestamp) >= DATE(?) AND DATE(o.timestamp) <= DATE(?)
          AND o.status IN ('paid', 'completed', 'delivered')
          AND (o.table_number IS NULL OR o.table_number >= 0)
          AND (o.client_identifier IS NULL OR LOWER(o.client_identifier) NOT LIKE '%test%')
          AND (json_extract(item.value, '$.productName') IS NOT NULL OR json_extract(item.value, '$.name') IS NOT NULL)
        GROUP BY product_id, product_name
        ORDER BY total_revenue DESC
      `, [startDateStr, endDateStr], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Calculează total venit
    const totalRevenue = productSales.reduce((sum, p) => sum + (p.total_revenue || 0), 0);
    
    // Calculează contribuție cumulativă
    let cumulativeRevenue = 0;
    const productsWithContribution = productSales.map((product) => {
      const contribution = totalRevenue > 0 ? (product.total_revenue / totalRevenue) * 100 : 0;
      cumulativeRevenue += contribution;
      
      // Clasificare ABC
      let category = 'C';
      if (cumulativeRevenue <= 80) {
        category = 'A';
      } else if (cumulativeRevenue <= 95) {
        category = 'B';
      }
      
      return {
        product_id: product.product_id,
        product_name: product.product_name,
        total_quantity: product.total_quantity,
        total_revenue: product.total_revenue,
        order_count: product.order_count,
        contribution_percent: contribution,
        cumulative_percent: cumulativeRevenue,
        category
      };
    });
    
    // Grupare pe categorii
    const categoryA = productsWithContribution.filter(p => p.category === 'A');
    const categoryB = productsWithContribution.filter(p => p.category === 'B');
    const categoryC = productsWithContribution.filter(p => p.category === 'C');
    
    // Summary statistics
    const summary = {
      total_products: productSales.length,
      total_revenue: totalRevenue,
      category_a_count: categoryA.length,
      category_b_count: categoryB.length,
      category_c_count: categoryC.length,
      category_a_revenue: categoryA.reduce((sum, p) => sum + p.total_revenue, 0),
      category_b_revenue: categoryB.reduce((sum, p) => sum + p.total_revenue, 0),
      category_c_revenue: categoryC.reduce((sum, p) => sum + p.total_revenue, 0),
      period_months: months,
      date_from: startDateStr,
      date_to: endDateStr
    };
    
    res.json({
      success: true,
      data: {
        summary,
        products: productsWithContribution,
        category_a: categoryA,
        category_b: categoryB,
        category_c: categoryC
      }
    });
    
  } catch (error) {
    console.error('Error in getABCAnalysisReport:', error);
    next(error);
  }
}

module.exports = {
  getCustomerBehaviorReport,
  getProfitabilityReport,
  getSalesDetailedReport,
  getTimeTrendsReport,
  getStockPredictionReport,
  getDeliveryPerformanceReport,
  getDriveThruPerformanceReport,
  getABCAnalysisReport
};

