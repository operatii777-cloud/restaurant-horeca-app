/**
 * Inventory Dashboard Controller
 * 
 * Endpoints pentru dashboard-ul de inventar:
 * - Stats (statistici generale)
 * - Trends (evoluție în timp)
 * - Top Variances (top varianțe)
 * - Locations (statistici per locație)
 */

const { dbPromise } = require('../../../../database');

/**
 * GET /api/admin/inventory/dashboard/stats
 * Obține statistici generale pentru inventar
 */
async function getInventoryStats(req, res, next) {
  try {
    const { start_date, end_date } = req.query;
    const db = await dbPromise;

    // Query pentru documente de tip INVENTAR
    let query = `
      SELECT 
        COUNT(*) as total_inventories,
        SUM(CASE WHEN status = 'LOCKED' THEN 1 ELSE 0 END) as locked_count,
        SUM(CASE WHEN status = 'DRAFT' THEN 1 ELSE 0 END) as draft_count
      FROM tipizate_documents
      WHERE type = 'INVENTAR'
    `;

    const params = [];

    if (start_date) {
      query += ' AND date >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND date <= ?';
      params.push(end_date);
    }

    const stats = await new Promise((resolve, reject) => {
      db.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row || {});
      });
    });

    // Calculează valoarea totală și varianțe din liniile documentelor
    let valueQuery = `
      SELECT 
        SUM(
          CASE 
            WHEN json_extract(line.value, '$.quantity_adjustment') > 0 
            THEN json_extract(line.value, '$.quantity_adjustment') * json_extract(line.value, '$.unit_price')
            ELSE 0
          END
        ) as total_positive,
        SUM(
          CASE 
            WHEN json_extract(line.value, '$.quantity_adjustment') < 0 
            THEN ABS(json_extract(line.value, '$.quantity_adjustment')) * json_extract(line.value, '$.unit_price')
            ELSE 0
          END
        ) as total_negative
      FROM tipizate_documents doc
      CROSS JOIN json_each(doc.lines) as line
      WHERE doc.type = 'INVENTAR'
        AND doc.status = 'LOCKED'
    `;

    const valueParams = [];
    if (start_date) {
      valueQuery += ' AND doc.date >= ?';
      valueParams.push(start_date);
    }
    if (end_date) {
      valueQuery += ' AND doc.date <= ?';
      valueParams.push(end_date);
    }

    const values = await new Promise((resolve, reject) => {
      db.get(valueQuery, valueParams, (err, row) => {
        if (err) {
          // Dacă query-ul eșuează (ex: structură JSON diferită), returnează valori default
          resolve({ total_positive: 0, total_negative: 0 });
        } else {
          resolve(row || { total_positive: 0, total_negative: 0 });
        }
      });
    });

    const totalValue = (values.total_positive || 0) - (values.total_negative || 0);
    const totalPositive = values.total_positive || 0;
    const totalNegative = values.total_negative || 0;

    // Calculează varianța medie (simplificat - bazat pe numărul de linii cu varianță)
    let varianceQuery = `
      SELECT 
        COUNT(*) as variance_count,
        AVG(ABS(json_extract(line.value, '$.quantity_adjustment'))) as avg_variance
      FROM tipizate_documents doc
      CROSS JOIN json_each(doc.lines) as line
      WHERE doc.type = 'INVENTAR'
        AND doc.status = 'LOCKED'
        AND json_extract(line.value, '$.quantity_adjustment') != 0
    `;

    const varianceParams = [];
    if (start_date) {
      varianceQuery += ' AND doc.date >= ?';
      varianceParams.push(start_date);
    }
    if (end_date) {
      varianceQuery += ' AND doc.date <= ?';
      varianceParams.push(end_date);
    }

    const variance = await new Promise((resolve, reject) => {
      db.get(varianceQuery, varianceParams, (err, row) => {
        if (err) {
          resolve({ variance_count: 0, avg_variance: 0 });
        } else {
          resolve(row || { variance_count: 0, avg_variance: 0 });
        }
      });
    });

    // Calculează alerte (critice > 10%, warning > 5%)
    let alertsQuery = `
      SELECT 
        SUM(CASE WHEN ABS(json_extract(line.value, '$.quantity_adjustment')) > 10 THEN 1 ELSE 0 END) as critical_alerts,
        SUM(CASE WHEN ABS(json_extract(line.value, '$.quantity_adjustment')) BETWEEN 5 AND 10 THEN 1 ELSE 0 END) as warning_alerts
      FROM tipizate_documents doc
      CROSS JOIN json_each(doc.lines) as line
      WHERE doc.type = 'INVENTAR'
        AND doc.status = 'LOCKED'
    `;

    const alertsParams = [];
    if (start_date) {
      alertsQuery += ' AND doc.date >= ?';
      alertsParams.push(start_date);
    }
    if (end_date) {
      alertsQuery += ' AND doc.date <= ?';
      alertsParams.push(end_date);
    }

    const alerts = await new Promise((resolve, reject) => {
      db.get(alertsQuery, alertsParams, (err, row) => {
        if (err) {
          resolve({ critical_alerts: 0, warning_alerts: 0 });
        } else {
          resolve(row || { critical_alerts: 0, warning_alerts: 0 });
        }
      });
    });

    res.json({
      success: true,
      total_inventories: stats.total_inventories || 0,
      total_value: totalValue,
      total_positive: totalPositive,
      total_negative: totalNegative,
      average_variance: variance.avg_variance || 0,
      critical_alerts: alerts.critical_alerts || 0,
      warning_alerts: alerts.warning_alerts || 0,
    });
  } catch (error) {
    console.error('❌ Error in getInventoryStats:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Eroare la încărcarea statisticilor inventar',
    });
  }
}

/**
 * GET /api/admin/inventory/dashboard/trends
 * Obține evoluția inventarului în timp
 */
async function getInventoryTrends(req, res, next) {
  try {
    const { start_date, end_date } = req.query;
    const db = await dbPromise;

    // Query pentru trend-uri zilnice
    let query = `
      SELECT 
        doc.date,
        COUNT(DISTINCT doc.id) as inventory_count,
        SUM(
          CASE 
            WHEN json_extract(line.value, '$.quantity_adjustment') > 0 
            THEN json_extract(line.value, '$.quantity_adjustment') * json_extract(line.value, '$.unit_price')
            ELSE 0
          END
        ) as positive,
        SUM(
          CASE 
            WHEN json_extract(line.value, '$.quantity_adjustment') < 0 
            THEN ABS(json_extract(line.value, '$.quantity_adjustment')) * json_extract(line.value, '$.unit_price')
            ELSE 0
          END
        ) as negative
      FROM tipizate_documents doc
      CROSS JOIN json_each(doc.lines) as line
      WHERE doc.type = 'INVENTAR'
        AND doc.status = 'LOCKED'
    `;

    const params = [];
    if (start_date) {
      query += ' AND doc.date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND doc.date <= ?';
      params.push(end_date);
    }

    query += ' GROUP BY doc.date ORDER BY doc.date ASC';

    const trends = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) {
          console.warn('⚠️ Error fetching trends, returning empty array:', err.message);
          resolve([]);
        } else {
          resolve(rows || []);
        }
      });
    });

    // Formatează rezultatele
    const formattedTrends = trends.map(trend => ({
      date: trend.date,
      total_value: (trend.positive || 0) - (trend.negative || 0),
      positive: trend.positive || 0,
      negative: trend.negative || 0,
    }));

    res.json({
      success: true,
      data: formattedTrends,
    });
  } catch (error) {
    console.error('❌ Error in getInventoryTrends:', error);
    res.json({
      success: true,
      data: [],
    });
  }
}

/**
 * GET /api/admin/inventory/dashboard/top-variances
 * Obține top varianțe (ingrediente cu cele mai mari diferențe)
 */
async function getTopVariances(req, res, next) {
  try {
    const { location } = req.query;
    const db = await dbPromise;

    let query = `
      SELECT 
        json_extract(line.value, '$.ingredient_name') as ingredient_name,
        json_extract(line.value, '$.expected_quantity') as expected,
        json_extract(line.value, '$.actual_quantity') as actual,
        json_extract(line.value, '$.quantity_adjustment') as adjustment,
        doc.location_id,
        loc.name as location_name
      FROM tipizate_documents doc
      CROSS JOIN json_each(doc.lines) as line
      LEFT JOIN locations loc ON doc.location_id = loc.id
      WHERE doc.type = 'INVENTAR'
        AND doc.status = 'LOCKED'
        AND json_extract(line.value, '$.quantity_adjustment') != 0
    `;

    const params = [];
    if (location) {
      query += ' AND loc.name = ?';
      params.push(location);
    }

    query += " ORDER BY ABS(json_extract(line.value, \"$.quantity_adjustment\")) DESC LIMIT 50";

    const variances = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) {
          console.warn('⚠️ Error fetching variances, returning empty array:', err.message);
          resolve([]);
        } else {
          resolve(rows || []);
        }
      });
    });

    // Calculează varianța procentuală
    const formattedVariances = variances.map(v => {
      const expected = parseFloat(v.expected) || 0;
      const actual = parseFloat(v.actual) || 0;
      const variance = expected > 0 ? ((actual - expected) / expected) * 100 : 0;

      return {
        ingredient_name: v.ingredient_name || 'Necunoscut',
        variance: Math.abs(variance),
        expected: expected,
        actual: actual,
        location: v.location_name || 'Necunoscut',
      };
    });

    res.json({
      success: true,
      data: formattedVariances,
    });
  } catch (error) {
    console.error('❌ Error in getTopVariances:', error);
    res.json({
      success: true,
      data: [],
    });
  }
}

/**
 * GET /api/admin/inventory/dashboard/locations
 * Obține statistici per locație
 */
async function getInventoryLocations(req, res, next) {
  try {
    const { start_date, end_date } = req.query;
    const db = await dbPromise;

    let query = `
      SELECT 
        loc.id,
        loc.name as location_name,
        COUNT(DISTINCT doc.id) as total_inventories,
        SUM(
          CASE 
            WHEN json_extract(line.value, '$.quantity_adjustment') > 0 
            THEN json_extract(line.value, '$.quantity_adjustment') * json_extract(line.value, '$.unit_price')
            ELSE 0
          END
        ) as total_positive,
        SUM(
          CASE 
            WHEN json_extract(line.value, '$.quantity_adjustment') < 0 
            THEN ABS(json_extract(line.value, '$.quantity_adjustment')) * json_extract(line.value, '$.unit_price')
            ELSE 0
          END
        ) as total_negative,
        SUM(CASE WHEN ABS(json_extract(line.value, '$.quantity_adjustment')) > 10 THEN 1 ELSE 0 END) as critical_alerts,
        SUM(CASE WHEN ABS(json_extract(line.value, '$.quantity_adjustment')) BETWEEN 5 AND 10 THEN 1 ELSE 0 END) as warning_alerts
      FROM tipizate_documents doc
      CROSS JOIN json_each(doc.lines) as line
      LEFT JOIN locations loc ON doc.location_id = loc.id
      WHERE doc.type = 'INVENTAR'
        AND doc.status = 'LOCKED'
    `;

    const params = [];
    if (start_date) {
      query += ' AND doc.date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND doc.date <= ?';
      params.push(end_date);
    }

    query += ' GROUP BY loc.id, loc.name ORDER BY loc.name';

    const locations = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) {
          console.warn('⚠️ Error fetching locations, returning empty array:', err.message);
          resolve([]);
        } else {
          resolve(rows || []);
        }
      });
    });

    // Formatează rezultatele
    const formattedLocations = locations.map(loc => ({
      location_name: loc.location_name || 'Necunoscut',
      total_inventories: loc.total_inventories || 0,
      total_value: (loc.total_positive || 0) - (loc.total_negative || 0),
      total_positive: loc.total_positive || 0,
      total_negative: loc.total_negative || 0,
      critical_alerts: loc.critical_alerts || 0,
      warning_alerts: loc.warning_alerts || 0,
    }));

    res.json({
      success: true,
      data: formattedLocations,
    });
  } catch (error) {
    console.error('❌ Error in getInventoryLocations:', error);
    res.json({
      success: true,
      data: [],
    });
  }
}

/**
 * GET /api/admin/inventory/dashboard/predictions
 * Obține predicții pentru consumul de ingrediente (bazat pe istoric)
 */
async function getInventoryPredictions(req, res, next) {
  try {
    const { ingredient_id, days_ahead = 7 } = req.query;
    const db = await dbPromise;

    // Verifică dacă există date istorice pentru consum
    let predictions = [];

    if (ingredient_id) {
      // Predicție pentru un ingredient specific
      // Analizează consumul din ultimele 30 zile
      const historicalConsumption = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            DATE(date) as date,
            SUM(quantity_out) as daily_consumption
          FROM stock_moves
          WHERE ingredient_id = ?
            AND type = 'CONSUME'
            AND DATE(date) >= DATE('now', '-30 days')
          GROUP BY DATE(date)
          ORDER BY date ASC
        `, [ingredient_id], (err, rows) => {
          if (err) {
            console.warn('⚠️ Error fetching historical consumption:', err.message);
            resolve([]);
          } else {
            resolve(rows || []);
          }
        });
      });

      if (historicalConsumption.length > 0) {
        // Calculează consumul mediu zilnic
        const totalConsumption = historicalConsumption.reduce((sum, day) => sum + (day.daily_consumption || 0), 0);
        const avgDailyConsumption = totalConsumption / historicalConsumption.length;

        // Generează predicții pentru următoarele zile
        const today = new Date();
        for (let i = 1; i <= parseInt(days_ahead); i++) {
          const futureDate = new Date(today);
          futureDate.setDate(today.getDate() + i);
          
          // Ajustare bazat pe ziua săptămânii (weekend vs weekday)
          const dayOfWeek = futureDate.getDay();
          let multiplier = 1.0;
          if (dayOfWeek === 0 || dayOfWeek === 6) {
            // Weekend - consum mai mare
            multiplier = 1.2;
          } else if (dayOfWeek === 5) {
            // Vineri - consum mai mare
            multiplier = 1.15;
          }

          predictions.push({
            date: futureDate.toISOString().split('T')[0],
            predicted_consumption: avgDailyConsumption * multiplier,
            confidence: historicalConsumption.length >= 7 ? 'high' : historicalConsumption.length >= 3 ? 'medium' : 'low',
            based_on_days: historicalConsumption.length
          });
        }
      }
    } else {
      // Predicții pentru toate ingredientele (top 20)
      const topIngredients = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            i.id,
            i.name,
            AVG(sm.quantity_out) as avg_daily_consumption,
            COUNT(DISTINCT DATE(sm.date)) as days_with_data
          FROM ingredients i
          JOIN stock_moves sm ON i.id = sm.ingredient_id
          WHERE sm.type = 'CONSUME'
            AND DATE(sm.date) >= DATE('now', '-30 days')
          GROUP BY i.id, i.name
          HAVING days_with_data >= 3
          ORDER BY avg_daily_consumption DESC
          LIMIT 20
        `, [], (err, rows) => {
          if (err) {
            console.warn('⚠️ Error fetching top ingredients:', err.message);
            resolve([]);
          } else {
            resolve(rows || []);
          }
        });
      });

      predictions = topIngredients.map(ing => ({
        ingredient_id: ing.id,
        ingredient_name: ing.name,
        predicted_daily_consumption: ing.avg_daily_consumption || 0,
        confidence: ing.days_with_data >= 7 ? 'high' : ing.days_with_data >= 3 ? 'medium' : 'low',
        based_on_days: ing.days_with_data
      }));
    }

    res.json({
      success: true,
      predictions: predictions,
      count: predictions.length,
      days_ahead: parseInt(days_ahead),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error in getInventoryPredictions:', error);
    res.json({
      success: true,
      predictions: [],
      count: 0,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = {
  getInventoryStats,
  getInventoryTrends,
  getTopVariances,
  getInventoryLocations,
  getInventoryPredictions,
};

