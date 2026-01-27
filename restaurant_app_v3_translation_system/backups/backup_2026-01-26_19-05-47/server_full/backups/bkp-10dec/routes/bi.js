// routes/bi.js - Business Intelligence API Endpoints
// Toate endpoint-urile BI într-un router separat, modular

const express = require('express');
const router = express.Router();
const { dbPromise } = require('../database.js');
const { 
    calculateKPIs, 
    checkKPIThresholds, 
    formatCurrency, 
    generateForecast 
} = require('../bi-helpers.js');

// Middleware pentru autentificare admin (va fi importat din server.js)
// Temporar: funcție placeholder
const checkAdminAuth = (req, res, next) => {
    // TODO: Implementare reală autentificare
    next();
};

// ==================== BI ENDPOINTS ====================

/**
 * GET /api/bi/profit-analysis
 * Analiză profitabilitate completă cu toate KPI-urile
 * Query params: startDate, endDate
 */
router.get('/profit-analysis', checkAdminAuth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                error: 'Parametri lipsă: startDate și endDate sunt obligatorii'
            });
        }

        console.log(`📊 [BI API] Profit Analysis requested: ${startDate} - ${endDate}`);

        const db = await dbPromise;
        const kpis = await calculateKPIs(db, startDate, endDate);

        // Verifică praguri și generează alerte
        await checkKPIThresholds(db, kpis, startDate);

        res.json({
            success: true,
            period: { startDate, endDate },
            data: kpis,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ [BI API] Error in profit-analysis:', error);
        res.status(500).json({
            error: 'Eroare la calculul profitabilității',
            details: error.message
        });
    }
});

/**
 * GET /api/bi/trends
 * Evoluție KPI-uri în timp (daily, weekly, monthly)
 * Query params: startDate, endDate, interval (daily|weekly|monthly)
 */
router.get('/trends', checkAdminAuth, async (req, res) => {
    try {
        const { startDate, endDate, interval = 'daily' } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                error: 'Parametri lipsă: startDate și endDate sunt obligatorii'
            });
        }

        console.log(`📈 [BI API] Trends requested: ${startDate} - ${endDate} (${interval})`);

        const db = await dbPromise;

        // Determine grouping
        let groupBy = "DATE(snapshot_date)";
        if (interval === 'weekly') groupBy = "strftime('%Y-W%W', snapshot_date)";
        if (interval === 'monthly') groupBy = "strftime('%Y-%m', snapshot_date)";

        const trends = await db.all(`
            SELECT 
                ${groupBy} as period,
                AVG(total_revenue) as avg_revenue,
                AVG(net_profit) as avg_profit,
                AVG(food_cost_pct) as avg_food_cost_pct,
                AVG(labor_cost_pct) as avg_labor_cost_pct,
                AVG(prime_cost_pct) as avg_prime_cost_pct,
                AVG(net_margin_pct) as avg_net_margin_pct,
                AVG(avg_rating) as avg_rating,
                SUM(total_orders) as total_orders
            FROM bi_sales_summary
            WHERE snapshot_date BETWEEN ? AND ?
            GROUP BY ${groupBy}
            ORDER BY period
        `, [startDate, endDate]);

        res.json({
            success: true,
            period: { startDate, endDate },
            interval,
            data: trends,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ [BI API] Error in trends:', error);
        res.status(500).json({
            error: 'Eroare la obținerea trend-urilor',
            details: error.message
        });
    }
});

/**
 * GET /api/bi/performance/staff
 * Performanță personal (sales, tips, rating)
 * Query params: startDate, endDate, waiterId (optional)
 */
router.get('/performance/staff', checkAdminAuth, async (req, res) => {
    try {
        const { startDate, endDate, waiterId } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                error: 'Parametri lipsă: startDate și endDate sunt obligatorii'
            });
        }

        console.log(`👥 [BI API] Staff Performance requested: ${startDate} - ${endDate}`);

        const db = await dbPromise;

        let whereClause = "WHERE snapshot_date BETWEEN ? AND ?";
        let params = [startDate, endDate];

        if (waiterId) {
            whereClause += " AND waiter_id = ?";
            params.push(waiterId);
        }

        const staffPerf = await db.all(`
            SELECT 
                waiter_id,
                waiter_name,
                SUM(total_orders) as total_orders,
                SUM(total_sales) as total_sales,
                SUM(total_tips) as total_tips,
                AVG(avg_check) as avg_check,
                AVG(avg_rating) as avg_rating,
                SUM(hours_worked) as hours_worked,
                (SUM(total_sales) / NULLIF(SUM(hours_worked), 0)) as sales_per_hour,
                (SUM(total_tips) / NULLIF(SUM(hours_worked), 0)) as tips_per_hour
            FROM bi_staff_performance
            ${whereClause}
            GROUP BY waiter_id
            ORDER BY total_sales DESC
        `, params);

        res.json({
            success: true,
            period: { startDate, endDate },
            data: staffPerf,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ [BI API] Error in staff performance:', error);
        res.status(500).json({
            error: 'Eroare la obținerea performanței personalului',
            details: error.message
        });
    }
});

/**
 * GET /api/bi/alerts
 * Alerte critice (threshold exceeded, anomalii, stockout)
 * Query params: status (active|acknowledged|resolved), severity (low|medium|high|critical)
 */
router.get('/alerts', checkAdminAuth, async (req, res) => {
    try {
        const { status = 'active', severity } = req.query;

        console.log(`🔔 [BI API] Alerts requested: status=${status}, severity=${severity || 'all'}`);

        const db = await dbPromise;

        let whereClause = "WHERE status = ?";
        let params = [status];

        if (severity) {
            whereClause += " AND severity = ?";
            params.push(severity);
        }

        const alerts = await db.all(`
            SELECT * FROM bi_alerts
            ${whereClause}
            ORDER BY 
                CASE severity 
                    WHEN 'critical' THEN 1
                    WHEN 'high' THEN 2
                    WHEN 'medium' THEN 3
                    ELSE 4
                END,
                created_at DESC
            LIMIT 100
        `, params);

        res.json({
            success: true,
            filters: { status, severity },
            count: alerts.length,
            data: alerts,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ [BI API] Error in alerts:', error);
        res.status(500).json({
            error: 'Eroare la obținerea alertelor',
            details: error.message
        });
    }
});

/**
 * POST /api/bi/alerts/:id/acknowledge
 * Confirmă o alertă
 * Body: { userId }
 */
router.post('/alerts/:id/acknowledge', checkAdminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        console.log(`✅ [BI API] Acknowledging alert ${id} by user ${userId}`);

        const db = await dbPromise;

        await db.run(`
            UPDATE bi_alerts
            SET status = 'acknowledged',
                acknowledged_by = ?,
                acknowledged_at = datetime('now')
            WHERE id = ? AND status = 'active'
        `, [userId, id]);

        res.json({
            success: true,
            message: 'Alertă confirmată',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ [BI API] Error acknowledging alert:', error);
        res.status(500).json({
            error: 'Eroare la confirmarea alertei',
            details: error.message
        });
    }
});

/**
 * GET /api/bi/forecast
 * Previziuni vânzări (simple linear regression)
 * Query params: targetDate, days (default: 7)
 */
router.get('/forecast', checkAdminAuth, async (req, res) => {
    try {
        const { targetDate, days = 7 } = req.query;

        if (!targetDate) {
            return res.status(400).json({
                error: 'Parametru lipsă: targetDate este obligatoriu'
            });
        }

        console.log(`🔮 [BI API] Forecast requested: ${targetDate} (+${days} days)`);

        const db = await dbPromise;
        const forecast = await generateForecast(db, targetDate, parseInt(days));

        res.json({
            success: true,
            ...forecast,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ [BI API] Error in forecast:', error);
        res.status(500).json({
            error: 'Eroare la generarea forecast-ului',
            details: error.message
        });
    }
});

/**
 * GET /api/bi/comparison
 * Compară două perioade (week vs week, month vs month, etc.)
 * Query params: period1Start, period1End, period2Start, period2End
 */
router.get('/comparison', checkAdminAuth, async (req, res) => {
    try {
        const { period1Start, period1End, period2Start, period2End } = req.query;

        if (!period1Start || !period1End || !period2Start || !period2End) {
            return res.status(400).json({
                error: 'Parametri lipsă: toate datele sunt obligatorii (period1Start, period1End, period2Start, period2End)'
            });
        }

        console.log(`🔄 [BI API] Comparison requested: [${period1Start} - ${period1End}] vs [${period2Start} - ${period2End}]`);

        const db = await dbPromise;

        const period1 = await calculateKPIs(db, period1Start, period1End);
        const period2 = await calculateKPIs(db, period2Start, period2End);

        // Calculează diferențe
        const comparison = {
            period1: { start: period1Start, end: period1End, data: period1 },
            period2: { start: period2Start, end: period2End, data: period2 },
            changes: {
                revenue_change: parseFloat((period1.revenue.total - period2.revenue.total).toFixed(2)),
                revenue_change_pct: parseFloat(((period1.revenue.total - period2.revenue.total) / period2.revenue.total * 100).toFixed(2)),
                profit_change: parseFloat((period1.profit.net - period2.profit.net).toFixed(2)),
                profit_change_pct: parseFloat(((period1.profit.net - period2.profit.net) / period2.profit.net * 100).toFixed(2)),
                food_cost_change: parseFloat((period1.kpis.food_cost_pct - period2.kpis.food_cost_pct).toFixed(2)),
                labor_cost_change: parseFloat((period1.kpis.labor_cost_pct - period2.kpis.labor_cost_pct).toFixed(2)),
                orders_change: period1.revenue.orders - period2.revenue.orders,
                orders_change_pct: parseFloat(((period1.revenue.orders - period2.revenue.orders) / period2.revenue.orders * 100).toFixed(2))
            }
        };

        res.json({
            success: true,
            data: comparison,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ [BI API] Error in comparison:', error);
        res.status(500).json({
            error: 'Eroare la comparația perioadelor',
            details: error.message
        });
    }
});

/**
 * GET /api/bi/category-performance
 * Performanță pe categorii (Pizza, Paste, Băuturi, etc.)
 * Query params: startDate, endDate
 */
router.get('/category-performance', checkAdminAuth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                error: 'Parametri lipsă: startDate și endDate sunt obligatorii'
            });
        }

        console.log(`📂 [BI API] Category Performance requested: ${startDate} - ${endDate}`);

        const db = await dbPromise;

        const categoryPerf = await db.all(`
            SELECT 
                category,
                SUM(orders_count) as total_orders,
                SUM(items_sold) as total_items_sold,
                SUM(revenue) as total_revenue,
                SUM(material_cost) as total_material_cost,
                SUM(gross_profit) as total_gross_profit,
                AVG(margin_pct) as avg_margin_pct,
                AVG(revenue_pct_of_total) as avg_revenue_pct
            FROM bi_category_performance
            WHERE snapshot_date BETWEEN ? AND ?
            GROUP BY category
            ORDER BY total_revenue DESC
        `, [startDate, endDate]);

        res.json({
            success: true,
            period: { startDate, endDate },
            data: categoryPerf,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ [BI API] Error in category performance:', error);
        res.status(500).json({
            error: 'Eroare la obținerea performanței pe categorii',
            details: error.message
        });
    }
});

/**
 * GET /api/bi/expenses-breakdown
 * Detaliere cheltuieli pe categorii
 * Query params: startDate, endDate
 */
router.get('/expenses-breakdown', checkAdminAuth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                error: 'Parametri lipsă: startDate și endDate sunt obligatorii'
            });
        }

        console.log(`💰 [BI API] Expenses Breakdown requested: ${startDate} - ${endDate}`);

        const db = await dbPromise;

        const expenses = await db.all(`
            SELECT 
                expense_type,
                category,
                SUM(amount) as total_amount,
                COUNT(*) as count,
                AVG(amount) as avg_amount
            FROM expenses
            WHERE expense_date BETWEEN ? AND ?
            GROUP BY expense_type, category
            ORDER BY total_amount DESC
        `, [startDate, endDate]);

        // Total per categorii (fixed vs variable)
        const byCategory = await db.all(`
            SELECT 
                category,
                SUM(amount) as total_amount,
                COUNT(*) as count
            FROM expenses
            WHERE expense_date BETWEEN ? AND ?
            GROUP BY category
        `, [startDate, endDate]);

        res.json({
            success: true,
            period: { startDate, endDate },
            data: {
                by_type: expenses,
                by_category: byCategory
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ [BI API] Error in expenses breakdown:', error);
        res.status(500).json({
            error: 'Eroare la obținerea detaliere cheltuieli',
            details: error.message
        });
    }
});

/**
 * GET /api/bi/kds-metrics
 * Kitchen Display System metrics (prep time, fulfillment time)
 * Query params: startDate, endDate
 */
router.get('/kds-metrics', checkAdminAuth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                error: 'Parametri lipsă: startDate și endDate sunt obligatorii'
            });
        }

        console.log(`🍳 [BI API] KDS Metrics requested: ${startDate} - ${endDate}`);

        const db = await dbPromise;

        const kdsStats = await db.all(`
            SELECT 
                DATE(timestamp) as date,
                AVG((julianday(prep_started_at) - julianday(timestamp)) * 24 * 60) as avg_order_to_prep_minutes,
                AVG((julianday(prep_completed_at) - julianday(prep_started_at)) * 24 * 60) as avg_prep_time_minutes,
                AVG((julianday(served_at) - julianday(prep_completed_at)) * 24 * 60) as avg_waiting_time_minutes,
                AVG((julianday(served_at) - julianday(timestamp)) * 24 * 60) as avg_total_fulfillment_minutes,
                COUNT(*) as total_orders,
                SUM(CASE WHEN (julianday(served_at) - julianday(timestamp)) * 24 * 60 > 30 THEN 1 ELSE 0 END) as delayed_orders,
                (SUM(CASE WHEN (julianday(served_at) - julianday(timestamp)) * 24 * 60 > 30 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as delay_rate_pct
            FROM orders
            WHERE DATE(timestamp) BETWEEN ? AND ? 
              AND status = 'completed'
              AND prep_started_at IS NOT NULL
              AND served_at IS NOT NULL
            GROUP BY DATE(timestamp)
            ORDER BY date DESC
        `, [startDate, endDate]);

        res.json({
            success: true,
            period: { startDate, endDate },
            data: kdsStats,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ [BI API] Error in KDS metrics:', error);
        res.status(500).json({
            error: 'Eroare la obținerea metrici KDS',
            details: error.message
        });
    }
});

module.exports = router;

