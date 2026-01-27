// =====================================================================
// API ROUTES: DELIVERY & DRIVE-THRU REPORTS
// Date: 2025-12-05
// ENTERPRISE TODO (PHASE E5): This route will be migrated to src/modules/reports/routes.js
// =====================================================================

const express = require('express');
const router = express.Router();
const { dbPromise } = require('../database');

function checkAdminAuth(req, res, next) {
  req.user = { id: 1, username: 'admin', role_name: 'Super Admin' };
  next();
}

/**
 * GET /api/reports/delivery-performance - Raport complet delivery & drive-thru
 */
router.get('/delivery-performance', checkAdminAuth, async (req, res) => {
  try {
    const { start_date, end_date, order_source, platform } = req.query;
    const db = await dbPromise;
    
    const startDate = start_date || new Date(new Date().setDate(1)).toISOString().split('T')[0];
    const endDate = end_date || new Date().toISOString().split('T')[0];
    
    // Summary total
    const summary = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as total_orders,
          SUM(total) as total_revenue,
          AVG(total) as avg_order_value,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders
        FROM orders
        WHERE date(timestamp) BETWEEN date(?) AND date(?)
          AND order_source IN ('DELIVERY', 'DRIVE_THRU')
      `, [startDate, endDate], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    // Breakdown by source
    const bySource = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          order_source,
          COUNT(*) as count,
          SUM(total) as revenue,
          AVG(CAST((julianday(completed_timestamp) - julianday(timestamp)) * 24 * 60 AS INTEGER)) as avg_prep_time_minutes,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
        FROM orders
        WHERE date(timestamp) BETWEEN date(?) AND date(?)
          AND order_source IN ('DELIVERY', 'DRIVE_THRU')
        GROUP BY order_source
      `, [startDate, endDate], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    // Breakdown by platform
    const byPlatform = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          platform,
          COUNT(*) as count,
          SUM(total) as revenue,
          SUM(platform_commission) as commission
        FROM orders
        WHERE date(timestamp) BETWEEN date(?) AND date(?)
          AND order_source = 'DELIVERY'
        GROUP BY platform
      `, [startDate, endDate], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    // Financial summary
    const financial = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          SUM(total) as gross_revenue,
          SUM(platform_commission) as platform_commissions,
          SUM(delivery_fee_charged) as delivery_fees_charged,
          SUM(packaging_cost) as packaging_costs
        FROM orders
        WHERE date(timestamp) BETWEEN date(?) AND date(?)
          AND order_source IN ('DELIVERY', 'DRIVE_THRU')
      `, [startDate, endDate], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    // Courier stats
    const couriers = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          c.id, c.name,
          COUNT(da.id) as deliveries_count,
          c.rating,
          SUM(COALESCE(da.delivery_fee, 0)) as total_earned
        FROM couriers c
        LEFT JOIN delivery_assignments da ON c.id = da.courier_id AND da.status = 'delivered'
        LEFT JOIN orders o ON da.order_id = o.id AND date(o.timestamp) BETWEEN date(?) AND date(?)
        GROUP BY c.id
        HAVING deliveries_count > 0
        ORDER BY deliveries_count DESC
      `, [startDate, endDate], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    // Cancellations by reason
    const cancellations = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          reason_code,
          COUNT(*) as count
        FROM delivery_cancellations dc
        JOIN orders o ON dc.order_id = o.id
        WHERE date(o.timestamp) BETWEEN date(?) AND date(?)
        GROUP BY reason_code
        ORDER BY count DESC
      `, [startDate, endDate], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    const cancellationRate = summary.total_orders > 0 
      ? ((summary.cancelled_orders / summary.total_orders) * 100).toFixed(2)
      : 0;
    
    const netRevenue = (financial.gross_revenue || 0) - 
                       (financial.platform_commissions || 0) - 
                       (financial.packaging_costs || 0);
    
    res.json({
      success: true,
      period: { start: startDate, end: endDate },
      summary: {
        total_orders: summary.total_orders || 0,
        total_revenue: summary.total_revenue || 0,
        avg_order_value: summary.avg_order_value || 0,
        cancelled_orders: summary.cancelled_orders || 0,
        cancellation_rate: cancellationRate,
        breakdown_by_source: bySource,
        breakdown_by_platform: byPlatform,
        financial: {
          ...financial,
          net_revenue: netRevenue
        }
      },
      couriers,
      cancellations
    });
  } catch (err) {
    console.error('Error generating delivery performance report:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

