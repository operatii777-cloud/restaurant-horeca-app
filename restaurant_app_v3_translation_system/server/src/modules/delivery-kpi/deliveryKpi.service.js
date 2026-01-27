/**
 * S17.H - Delivery KPI Service
 * Business logic for delivery KPIs and analytics
 * 
 * FAZA MT.3 - Updated to use location filtering
 */

const { dbPromise } = require('../../../database');

// Helper pentru locationQuery (fallback dacă nu există)
let locationQuery = null;
try {
  const dbModule = require('../../../database');
  if (dbModule.locationQuery) {
    locationQuery = dbModule.locationQuery;
  }
} catch (err) {
  // locationQuery nu există, folosim fallback
}

/**
 * Get delivery overview KPIs
 * 
 * @param {Object} options - Options object
 * @param {string} options.dateFrom - Start date
 * @param {string} options.dateTo - End date
 * @param {number} options.locationId - Location ID (optional, will use req.locationId if not provided)
 * @param {Object} req - Express request object (for location filtering)
 */
async function getDeliveryOverview({ dateFrom, dateTo, locationId } = {}, req = null) {
  const db = await dbPromise;
  
  // Use locationId from req if not provided
  if (!locationId && req && req.locationId) {
    locationId = req.locationId;
  }
  
  let dateFilter = '';
  const params = [];
  
  if (dateFrom && dateTo) {
    dateFilter = 'AND o.timestamp >= ? AND o.timestamp <= ?';
    params.push(dateFrom, dateTo);
  } else if (dateFrom) {
    dateFilter = 'AND o.timestamp >= ?';
    params.push(dateFrom);
  } else if (dateTo) {
    dateFilter = 'AND o.timestamp <= ?';
    params.push(dateTo);
  }
  
  // Build base query
  let baseQuery = `SELECT COUNT(*) as count FROM orders o WHERE o.type = 'delivery' ${dateFilter}`;
  
  // Add location filter if available
  if (locationId) {
    baseQuery += ' AND o.location_id = ?';
    params.push(locationId);
  } else if (req && req.locationId) {
    baseQuery += ' AND o.location_id = ?';
    params.push(req.locationId);
  }
  
  // Total deliveries - with error handling
  let totalDeliveries = 0;
  try {
    totalDeliveries = await new Promise((resolve, reject) => {
      db.get(baseQuery, params, (err, row) => {
        if (err) {
          console.warn('⚠️ [getDeliveryOverview] Error counting deliveries:', err.message);
          resolve(0); // Return 0 instead of rejecting
        } else {
          resolve(row?.count || 0);
        }
      });
    });
  } catch (error) {
    console.warn('⚠️ [getDeliveryOverview] Error in totalDeliveries query:', error.message);
    totalDeliveries = 0;
  }
  
  // Average delivery minutes (from created to delivered) - with error handling
  let avgDeliveryMinutes = 0;
  try {
    avgDeliveryMinutes = await new Promise((resolve, reject) => {
      db.get(`
        SELECT AVG(
          (julianday(COALESCE(o.delivered_timestamp, da.delivered_at, o.updated_at)) - julianday(o.timestamp)) * 24 * 60
        ) as avgMinutes
        FROM orders o
        LEFT JOIN delivery_assignments da ON o.id = da.order_id AND da.status = 'delivered'
        WHERE o.type = 'delivery' 
          AND (o.delivered_timestamp IS NOT NULL OR da.delivered_at IS NOT NULL)
          ${dateFilter}
          ${locationId || (req && req.locationId) ? 'AND o.location_id = ?' : ''}
      `, params, (err, row) => {
        if (err) {
          console.warn('⚠️ [getDeliveryOverview] Error calculating avg delivery minutes:', err.message);
          resolve(0); // Return 0 instead of rejecting
        } else {
          resolve(Math.round(row?.avgMinutes || 0));
        }
      });
    });
  } catch (error) {
    console.warn('⚠️ [getDeliveryOverview] Error in avgDeliveryMinutes query:', error.message);
    avgDeliveryMinutes = 0;
  }
  
  // On-time rate (assuming SLA is 45 minutes) - with error handling
  const SLA_MINUTES = 45;
  let onTimeDeliveries = 0;
  try {
    onTimeDeliveries = await new Promise((resolve, reject) => {
      db.get(`
        SELECT COUNT(*) as count
        FROM orders o
        LEFT JOIN delivery_assignments da ON o.id = da.order_id AND da.status = 'delivered'
        WHERE o.type = 'delivery'
          AND (o.delivered_timestamp IS NOT NULL OR da.delivered_at IS NOT NULL)
          AND ((julianday(COALESCE(o.delivered_timestamp, da.delivered_at)) - julianday(o.timestamp)) * 24 * 60) <= ?
          ${dateFilter}
          ${locationId || (req && req.locationId) ? 'AND o.location_id = ?' : ''}
      `, [SLA_MINUTES, ...params], (err, row) => {
        if (err) {
          console.warn('⚠️ [getDeliveryOverview] Error counting on-time deliveries:', err.message);
          resolve(0); // Return 0 instead of rejecting
        } else {
          resolve(row?.count || 0);
        }
      });
    });
  } catch (error) {
    console.warn('⚠️ [getDeliveryOverview] Error in onTimeDeliveries query:', error.message);
    onTimeDeliveries = 0;
  }
  
  const onTimeRate = totalDeliveries > 0 ? (onTimeDeliveries / totalDeliveries) : 0;
  
  // Cancel rate - with error handling
  let cancelledDeliveries = 0;
  try {
    cancelledDeliveries = await new Promise((resolve, reject) => {
      db.get(`
        SELECT COUNT(*) as count
        FROM orders o
        WHERE o.type = 'delivery' 
          AND o.status = 'cancelled'
          ${dateFilter}
          ${locationId || (req && req.locationId) ? 'AND o.location_id = ?' : ''}
      `, params, (err, row) => {
        if (err) {
          console.warn('⚠️ [getDeliveryOverview] Error counting cancelled deliveries:', err.message);
          resolve(0); // Return 0 instead of rejecting
        } else {
          resolve(row?.count || 0);
        }
      });
    });
  } catch (error) {
    console.warn('⚠️ [getDeliveryOverview] Error in cancelledDeliveries query:', error.message);
    cancelledDeliveries = 0;
  }
  
  const cancelRate = totalDeliveries > 0 ? (cancelledDeliveries / totalDeliveries) : 0;
  
  // Average preparation minutes - with error handling
  let avgPreparationMinutes = 0;
  try {
    avgPreparationMinutes = await new Promise((resolve, reject) => {
      db.get(`
        SELECT AVG(
          (julianday(COALESCE(o.ready_at, o.completed_timestamp, o.updated_at)) - julianday(o.timestamp)) * 24 * 60
        ) as avgMinutes
        FROM orders o
        WHERE o.type = 'delivery'
          AND (o.ready_at IS NOT NULL OR o.completed_timestamp IS NOT NULL)
          ${dateFilter}
          ${locationId || (req && req.locationId) ? 'AND o.location_id = ?' : ''}
      `, params, (err, row) => {
        if (err) {
          console.warn('⚠️ [getDeliveryOverview] Error calculating avg preparation minutes:', err.message);
          resolve(0);
        } else {
          resolve(Math.round(row?.avgMinutes || 0));
        }
      });
    });
  } catch (error) {
    console.warn('⚠️ [getDeliveryOverview] Error in avgPreparationMinutes query:', error.message);
    avgPreparationMinutes = 0;
  }
  
  // Average assign minutes (from ready to assigned) - with error handling
  let avgAssignMinutes = 0;
  try {
    avgAssignMinutes = await new Promise((resolve, reject) => {
      db.get(`
        SELECT AVG(
          (julianday(da.assigned_at) - julianday(COALESCE(o.ready_at, o.completed_timestamp, o.timestamp))) * 24 * 60
        ) as avgMinutes
        FROM orders o
        JOIN delivery_assignments da ON o.id = da.order_id
        WHERE o.type = 'delivery'
          AND da.assigned_at IS NOT NULL
          ${dateFilter}
          ${locationId || (req && req.locationId) ? 'AND o.location_id = ?' : ''}
      `, params, (err, row) => {
        if (err) {
          console.warn('⚠️ [getDeliveryOverview] Error calculating avg assign minutes:', err.message);
          resolve(0);
        } else {
          resolve(Math.round(row?.avgMinutes || 0));
        }
      });
    });
  } catch (error) {
    console.warn('⚠️ [getDeliveryOverview] Error in avgAssignMinutes query:', error.message);
    avgAssignMinutes = 0;
  }
  
  // Average transit minutes (from picked up to delivered) - with error handling
  let avgTransitMinutes = 0;
  try {
    avgTransitMinutes = await new Promise((resolve, reject) => {
      db.get(`
        SELECT AVG(
          (julianday(COALESCE(da.delivered_at, o.delivered_timestamp)) - julianday(da.picked_up_at)) * 24 * 60
        ) as avgMinutes
        FROM orders o
        JOIN delivery_assignments da ON o.id = da.order_id
        WHERE o.type = 'delivery'
          AND da.picked_up_at IS NOT NULL
          AND (da.delivered_at IS NOT NULL OR o.delivered_timestamp IS NOT NULL)
          ${dateFilter}
          ${locationId || (req && req.locationId) ? 'AND o.location_id = ?' : ''}
      `, params, (err, row) => {
        if (err) {
          console.warn('⚠️ [getDeliveryOverview] Error calculating avg transit minutes:', err.message);
          resolve(0);
        } else {
          resolve(Math.round(row?.avgMinutes || 0));
        }
      });
    });
  } catch (error) {
    console.warn('⚠️ [getDeliveryOverview] Error in avgTransitMinutes query:', error.message);
    avgTransitMinutes = 0;
  }
  
  // Platform mix - with error handling
  let platformMix = [];
  try {
    platformMix = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          COALESCE(o.platform, 'UNKNOWN') as platform,
          COUNT(*) as count
        FROM orders o
        WHERE o.type = 'delivery' ${dateFilter}
          ${locationId || (req && req.locationId) ? 'AND o.location_id = ?' : ''}
        GROUP BY o.platform
        ORDER BY count DESC
      `, params, (err, rows) => {
        if (err) {
          console.warn('⚠️ [getDeliveryOverview] Error getting platform mix:', err.message);
          resolve([]);
        } else {
          const result = Array.isArray(rows) ? JSON.parse(JSON.stringify(rows)) : [];
          const total = result.reduce((sum, r) => sum + (r.count || 0), 0);
          const mix = result.map(row => ({
            platform: row.platform || 'UNKNOWN',
            count: row.count || 0,
            share: total > 0 ? ((row.count || 0) / total) : 0
          }));
          resolve(mix);
        }
      });
    });
  } catch (error) {
    console.warn('⚠️ [getDeliveryOverview] Error in platformMix query:', error.message);
    platformMix = [];
  }
  
  // Calculate total revenue - with error handling
  let totalRevenue = 0;
  try {
    totalRevenue = await new Promise((resolve, reject) => {
      db.get(`
        SELECT SUM(COALESCE(o.total, 0)) as total
        FROM orders o
        WHERE o.type = 'delivery' 
          AND o.status != 'cancelled'
          ${dateFilter}
          ${locationId || (req && req.locationId) ? 'AND o.location_id = ?' : ''}
      `, params, (err, row) => {
        if (err) {
          console.warn('⚠️ [getDeliveryOverview] Error calculating total revenue:', err.message);
          resolve(0);
        } else {
          resolve(row?.total || 0);
        }
      });
    });
  } catch (error) {
    console.warn('⚠️ [getDeliveryOverview] Error in totalRevenue query:', error.message);
    totalRevenue = 0;
  }
  
  return {
    totalDeliveries,
    avgDeliveryMinutes,
    onTimeRate: Math.round(onTimeRate * 100) / 100,
    cancelRate: Math.round(cancelRate * 100) / 100,
    avgPreparationMinutes,
    avgAssignMinutes,
    avgTransitMinutes,
    platformMix,
    totalRevenue: Math.round(totalRevenue * 100) / 100
  };
}

/**
 * Get KPIs by courier
 */
async function getDeliveryByCourier({ dateFrom, dateTo } = {}) {
  const db = await dbPromise;
  
  let dateFilter = '';
  const params = [];
  
  if (dateFrom && dateTo) {
    dateFilter = 'AND o.timestamp >= ? AND o.timestamp <= ?';
    params.push(dateFrom, dateTo);
  } else if (dateFrom) {
    dateFilter = 'AND o.timestamp >= ?';
    params.push(dateFrom);
  } else if (dateTo) {
    dateFilter = 'AND o.timestamp <= ?';
    params.push(dateTo);
  }
  
  const couriers = await new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        c.id as courierId,
        c.name,
        COUNT(DISTINCT da.order_id) as totalDeliveries,
        AVG(
          (julianday(COALESCE(da.delivered_at, o.delivered_timestamp)) - julianday(o.timestamp)) * 24 * 60
        ) as avgDeliveryMinutes,
        SUM(
          CASE 
            WHEN (julianday(COALESCE(da.delivered_at, o.delivered_timestamp)) - julianday(o.timestamp)) * 24 * 60 <= 45 
            THEN 1 
            ELSE 0 
          END
        ) as onTimeCount,
        SUM(
          CASE 
            WHEN o.status = 'cancelled' 
            THEN 1 
            ELSE 0 
          END
        ) as cancelledCount,
        SUM(COALESCE(da.distance_km, 0)) as distanceKmTotal
      FROM couriers c
      JOIN delivery_assignments da ON c.id = da.courier_id
      JOIN orders o ON da.order_id = o.id
      WHERE o.type = 'delivery' ${dateFilter}
      GROUP BY c.id, c.name
      HAVING totalDeliveries > 0
      ORDER BY totalDeliveries DESC
    `, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
  
  // Calculate score for each courier
  const couriersWithScore = couriers.map(courier => {
    const totalDeliveries = courier.totalDeliveries || 0;
    const onTimeRate = totalDeliveries > 0 ? (courier.onTimeCount / totalDeliveries) : 0;
    const cancelRate = totalDeliveries > 0 ? (courier.cancelledCount / totalDeliveries) : 0;
    
    // Score formula: 5 - 0.7 * (1 - onTimeRate) * 5 - 0.3 * cancelRate * 5
    const score = Math.max(1, Math.min(5, 
      5 - 0.7 * (1 - onTimeRate) * 5 - 0.3 * cancelRate * 5
    ));
    
    return {
      courierId: courier.courierId,
      name: courier.name,
      totalDeliveries,
      avgDeliveryMinutes: Math.round(courier.avgDeliveryMinutes || 0),
      onTimeRate: Math.round(onTimeRate * 100) / 100,
      cancelRate: Math.round(cancelRate * 100) / 100,
      distanceKmTotal: Math.round((courier.distanceKmTotal || 0) * 100) / 100,
      score: Math.round(score * 10) / 10
    };
  });
  
  return couriersWithScore;
}

/**
 * Get timeseries data (daily)
 */
async function getDeliveryTimeseries({ dateFrom, dateTo } = {}) {
  const db = await dbPromise;
  
  let dateFilter = '';
  const params = [];
  
  if (dateFrom && dateTo) {
    dateFilter = 'AND o.timestamp >= ? AND o.timestamp <= ?';
    params.push(dateFrom, dateTo);
  } else if (dateFrom) {
    dateFilter = 'AND o.timestamp >= ?';
    params.push(dateFrom);
  } else if (dateTo) {
    dateFilter = 'AND o.timestamp <= ?';
    params.push(dateTo);
  }
  
  const timeseries = await new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        DATE(o.timestamp) as day,
        COUNT(*) as totalDeliveries,
        AVG(
          (julianday(COALESCE(o.delivered_timestamp, da.delivered_at)) - julianday(o.timestamp)) * 24 * 60
        ) as avgDeliveryMinutes,
        SUM(
          CASE 
            WHEN (julianday(COALESCE(o.delivered_timestamp, da.delivered_at)) - julianday(o.timestamp)) * 24 * 60 <= 45 
            THEN 1 
            ELSE 0 
          END
        ) * 1.0 / COUNT(*) as onTimeRate,
        SUM(
          CASE 
            WHEN o.status = 'cancelled' 
            THEN 1 
            ELSE 0 
          END
        ) * 1.0 / COUNT(*) as cancelRate
      FROM orders o
      LEFT JOIN delivery_assignments da ON o.id = da.order_id AND da.status = 'delivered'
      WHERE o.type = 'delivery' ${dateFilter}
      GROUP BY DATE(o.timestamp)
      ORDER BY day ASC
    `, params, (err, rows) => {
      if (err) reject(err);
      else {
        const result = rows.map(row => ({
          day: row.day,
          totalDeliveries: row.totalDeliveries,
          avgDeliveryMinutes: Math.round(row.avgDeliveryMinutes || 0),
          onTimeRate: Math.round((row.onTimeRate || 0) * 100) / 100,
          cancelRate: Math.round((row.cancelRate || 0) * 100) / 100
        }));
        resolve(result);
      }
    });
  });
  
  return timeseries;
}

/**
 * Get hourly heatmap data
 */
async function getDeliveryHourlyHeatmap({ dateFrom, dateTo } = {}) {
  const db = await dbPromise;
  
  let dateFilter = '';
  const params = [];
  
  if (dateFrom && dateTo) {
    dateFilter = 'AND o.timestamp >= ? AND o.timestamp <= ?';
    params.push(dateFrom, dateTo);
  } else if (dateFrom) {
    dateFilter = 'AND o.timestamp >= ?';
    params.push(dateFrom);
  } else if (dateTo) {
    dateFilter = 'AND o.timestamp <= ?';
    params.push(dateTo);
  }
  
  const heatmap = await new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        CAST(strftime('%w', o.timestamp) AS INTEGER) as weekday,
        CAST(strftime('%H', o.timestamp) AS INTEGER) as hour,
        COUNT(*) as totalDeliveries,
        AVG(
          (julianday(COALESCE(o.delivered_timestamp, da.delivered_at)) - julianday(o.timestamp)) * 24 * 60
        ) as avgDeliveryMinutes
      FROM orders o
      LEFT JOIN delivery_assignments da ON o.id = da.order_id AND da.status = 'delivered'
      WHERE o.type = 'delivery' ${dateFilter}
      GROUP BY weekday, hour
      ORDER BY weekday, hour
    `, params, (err, rows) => {
      if (err) reject(err);
      else {
        const result = rows.map(row => ({
          weekday: row.weekday === 0 ? 7 : row.weekday, // Convert Sunday from 0 to 7
          hour: row.hour,
          totalDeliveries: row.totalDeliveries,
          avgDeliveryMinutes: Math.round(row.avgDeliveryMinutes || 0)
        }));
        resolve(result);
      }
    });
  });
  
  return heatmap;
}

module.exports = {
  getDeliveryOverview,
  getDeliveryByCourier,
  getDeliveryTimeseries,
  getDeliveryHourlyHeatmap
};

