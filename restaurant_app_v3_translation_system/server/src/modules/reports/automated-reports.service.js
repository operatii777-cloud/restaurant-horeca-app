/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AUTOMATED REPORTS SERVICE
 * 
 * Rapoarte automate programate:
 * - Raport zilnic (email cu statistici zilnice)
 * - Raport săptămânal (email cu statistici săptămânale)
 * - Raport lunar (email cu statistici lunare)
 * - Export ANAF automat (lunar)
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { dbPromise } = require('../../../database');
const fs = require('fs');
const path = require('path');

class AutomatedReportsService {
  constructor() {
    this.reportsDir = path.join(__dirname, '../../../Dev-Files/01-Rapoarte/Automated');
    this.ensureReportsDirectory();
  }

  /**
   * Ensure reports directory exists
   */
  ensureReportsDirectory() {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  /**
   * Generate daily report
   */
  async generateDailyReport() {
    try {
      const db = await dbPromise;
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Get today's statistics
      const todayStats = await new Promise((resolve, reject) => {
        db.get(`
          SELECT 
            COUNT(*) as total_orders,
            SUM(total) as total_revenue,
            AVG(total) as avg_order_value,
            COUNT(DISTINCT customer_phone) as unique_customers,
            SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders
          FROM orders
          WHERE DATE(timestamp) = ? AND status != 'cancelled'
        `, [today], (err, row) => {
          if (err) reject(err);
          else resolve(row || {});
        });
      });
      
      // Get yesterday's statistics for comparison
      const yesterdayStats = await new Promise((resolve, reject) => {
        db.get(`
          SELECT 
            COUNT(*) as total_orders,
            SUM(total) as total_revenue
          FROM orders
          WHERE DATE(timestamp) = ? AND status != 'cancelled'
        `, [yesterday], (err, row) => {
          if (err) reject(err);
          else resolve(row || {});
        });
      });
      
      // Get platform breakdown
      const platformStats = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            COALESCE(platform, 'POS') as platform,
            COUNT(*) as total_orders,
            SUM(total) as total_revenue
          FROM orders
          WHERE DATE(timestamp) = ? AND status != 'cancelled'
          GROUP BY COALESCE(platform, 'POS')
          ORDER BY total_revenue DESC
        `, [today], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
      
      // Get top products
      const topProducts = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            oi.name as product_name,
            SUM(oi.quantity) as total_quantity,
            SUM(oi.total) as total_revenue
          FROM order_items oi
          JOIN orders o ON oi.order_id = o.id
          WHERE DATE(o.timestamp) = ? AND o.status != 'cancelled'
          GROUP BY oi.name
          ORDER BY total_quantity DESC
          LIMIT 10
        `, [today], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
      
      // Calculate changes
      const revenueChange = yesterdayStats.total_revenue > 0
        ? ((todayStats.total_revenue - yesterdayStats.total_revenue) / yesterdayStats.total_revenue) * 100
        : 0;
      
      const ordersChange = yesterdayStats.total_orders > 0
        ? ((todayStats.total_orders - yesterdayStats.total_orders) / yesterdayStats.total_orders) * 100
        : 0;
      
      const report = {
        date: today,
        type: 'daily',
        generated_at: new Date().toISOString(),
        statistics: {
          today: {
            total_orders: todayStats.total_orders || 0,
            total_revenue: parseFloat(todayStats.total_revenue || 0),
            avg_order_value: parseFloat(todayStats.avg_order_value || 0),
            unique_customers: todayStats.unique_customers || 0,
            cancelled_orders: todayStats.cancelled_orders || 0
          },
          yesterday: {
            total_orders: yesterdayStats.total_orders || 0,
            total_revenue: parseFloat(yesterdayStats.total_revenue || 0)
          },
          changes: {
            revenue_change_percent: revenueChange,
            orders_change_percent: ordersChange
          },
          platform_breakdown: platformStats.map(p => ({
            platform: p.platform,
            total_orders: p.total_orders || 0,
            total_revenue: parseFloat(p.total_revenue || 0)
          })),
          top_products: topProducts.map(p => ({
            product_name: p.product_name,
            total_quantity: p.total_quantity || 0,
            total_revenue: parseFloat(p.total_revenue || 0)
          }))
        }
      };
      
      // Save report to file
      const reportFile = path.join(this.reportsDir, `daily-report-${today}.json`);
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
      
      console.log(`✅ [AUTOMATED REPORTS] Daily report generated: ${reportFile}`);
      
      return report;
    } catch (error) {
      console.error('❌ [AUTOMATED REPORTS] Error generating daily report:', error);
      throw error;
    }
  }

  /**
   * Generate weekly report
   */
  async generateWeeklyReport() {
    try {
      const db = await dbPromise;
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 7);
      const weekStartStr = weekStart.toISOString().split('T')[0];
      const weekEndStr = today.toISOString().split('T')[0];
      
      // Get weekly statistics
      const weeklyStats = await new Promise((resolve, reject) => {
        db.get(`
          SELECT 
            COUNT(*) as total_orders,
            SUM(total) as total_revenue,
            AVG(total) as avg_order_value,
            COUNT(DISTINCT customer_phone) as unique_customers,
            COUNT(DISTINCT DATE(timestamp)) as active_days
          FROM orders
          WHERE DATE(timestamp) >= ? AND DATE(timestamp) <= ? AND status != 'cancelled'
        `, [weekStartStr, weekEndStr], (err, row) => {
          if (err) reject(err);
          else resolve(row || {});
        });
      });
      
      // Get daily breakdown
      const dailyBreakdown = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            DATE(timestamp) as date,
            COUNT(*) as total_orders,
            SUM(total) as total_revenue
          FROM orders
          WHERE DATE(timestamp) >= ? AND DATE(timestamp) <= ? AND status != 'cancelled'
          GROUP BY DATE(timestamp)
          ORDER BY date ASC
        `, [weekStartStr, weekEndStr], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
      
      // Get platform breakdown
      const platformStats = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            COALESCE(platform, 'POS') as platform,
            COUNT(*) as total_orders,
            SUM(total) as total_revenue
          FROM orders
          WHERE DATE(timestamp) >= ? AND DATE(timestamp) <= ? AND status != 'cancelled'
          GROUP BY COALESCE(platform, 'POS')
          ORDER BY total_revenue DESC
        `, [weekStartStr, weekEndStr], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
      
      const report = {
        period: {
          from: weekStartStr,
          to: weekEndStr
        },
        type: 'weekly',
        generated_at: new Date().toISOString(),
        statistics: {
          total_orders: weeklyStats.total_orders || 0,
          total_revenue: parseFloat(weeklyStats.total_revenue || 0),
          avg_order_value: parseFloat(weeklyStats.avg_order_value || 0),
          unique_customers: weeklyStats.unique_customers || 0,
          active_days: weeklyStats.active_days || 0,
          daily_breakdown: dailyBreakdown.map(d => ({
            date: d.date,
            total_orders: d.total_orders || 0,
            total_revenue: parseFloat(d.total_revenue || 0)
          })),
          platform_breakdown: platformStats.map(p => ({
            platform: p.platform,
            total_orders: p.total_orders || 0,
            total_revenue: parseFloat(p.total_revenue || 0)
          }))
        }
      };
      
      // Save report to file
      const reportFile = path.join(this.reportsDir, `weekly-report-${weekEndStr}.json`);
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
      
      console.log(`✅ [AUTOMATED REPORTS] Weekly report generated: ${reportFile}`);
      
      return report;
    } catch (error) {
      console.error('❌ [AUTOMATED REPORTS] Error generating weekly report:', error);
      throw error;
    }
  }

  /**
   * Generate monthly report
   */
  async generateMonthlyReport() {
    try {
      const db = await dbPromise;
      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthStartStr = monthStart.toISOString().split('T')[0];
      const monthEndStr = today.toISOString().split('T')[0];
      
      // Get monthly statistics
      const monthlyStats = await new Promise((resolve, reject) => {
        db.get(`
          SELECT 
            COUNT(*) as total_orders,
            SUM(total) as total_revenue,
            AVG(total) as avg_order_value,
            COUNT(DISTINCT customer_phone) as unique_customers,
            COUNT(DISTINCT DATE(timestamp)) as active_days
          FROM orders
          WHERE DATE(timestamp) >= ? AND DATE(timestamp) <= ? AND status != 'cancelled'
        `, [monthStartStr, monthEndStr], (err, row) => {
          if (err) reject(err);
          else resolve(row || {});
        });
      });
      
      // Get platform breakdown
      const platformStats = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            COALESCE(platform, 'POS') as platform,
            COUNT(*) as total_orders,
            SUM(total) as total_revenue,
            AVG(total) as avg_order_value
          FROM orders
          WHERE DATE(timestamp) >= ? AND DATE(timestamp) <= ? AND status != 'cancelled'
          GROUP BY COALESCE(platform, 'POS')
          ORDER BY total_revenue DESC
        `, [monthStartStr, monthEndStr], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
      
      // Get top 20 products
      const topProducts = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            oi.name as product_name,
            SUM(oi.quantity) as total_quantity,
            SUM(oi.total) as total_revenue
          FROM order_items oi
          JOIN orders o ON oi.order_id = o.id
          WHERE DATE(o.timestamp) >= ? AND DATE(o.timestamp) <= ? AND o.status != 'cancelled'
          GROUP BY oi.name
          ORDER BY total_quantity DESC
          LIMIT 20
        `, [monthStartStr, monthEndStr], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
      
      const report = {
        period: {
          from: monthStartStr,
          to: monthEndStr,
          month: today.getMonth() + 1,
          year: today.getFullYear()
        },
        type: 'monthly',
        generated_at: new Date().toISOString(),
        statistics: {
          total_orders: monthlyStats.total_orders || 0,
          total_revenue: parseFloat(monthlyStats.total_revenue || 0),
          avg_order_value: parseFloat(monthlyStats.avg_order_value || 0),
          unique_customers: monthlyStats.unique_customers || 0,
          active_days: monthlyStats.active_days || 0,
          platform_breakdown: platformStats.map(p => ({
            platform: p.platform,
            total_orders: p.total_orders || 0,
            total_revenue: parseFloat(p.total_revenue || 0),
            avg_order_value: parseFloat(p.avg_order_value || 0)
          })),
          top_products: topProducts.map(p => ({
            product_name: p.product_name,
            total_quantity: p.total_quantity || 0,
            total_revenue: parseFloat(p.total_revenue || 0)
          }))
        }
      };
      
      // Save report to file
      const reportFile = path.join(this.reportsDir, `monthly-report-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}.json`);
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
      
      console.log(`✅ [AUTOMATED REPORTS] Monthly report generated: ${reportFile}`);
      
      return report;
    } catch (error) {
      console.error('❌ [AUTOMATED REPORTS] Error generating monthly report:', error);
      throw error;
    }
  }

  /**
   * Schedule reports (should be called by cron/scheduler)
   */
  async scheduleReports() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const date = now.getDate();
    
    try {
      // Daily report at 23:00 (11 PM)
      if (hour === 23) {
        await this.generateDailyReport();
      }
      
      // Weekly report on Sunday at 23:00
      if (day === 0 && hour === 23) {
        await this.generateWeeklyReport();
      }
      
      // Monthly report on last day of month at 23:00
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      if (date === lastDayOfMonth && hour === 23) {
        await this.generateMonthlyReport();
      }
    } catch (error) {
      console.error('❌ [AUTOMATED REPORTS] Error in scheduled reports:', error);
    }
  }
}

module.exports = new AutomatedReportsService();
