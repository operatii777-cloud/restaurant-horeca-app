// bi-helpers.js - Business Intelligence Helper Functions
// Funcții reutilizabile pentru calcul KPI-uri și analize financiare

const { dbPromise } = require('./database.js');

/**
 * Calculează toate KPI-urile financiare pentru o perioadă dată
 * @param {Object} db - Database connection
 * @param {string} startDate - Data început (YYYY-MM-DD)
 * @param {string} endDate - Data sfârșit (YYYY-MM-DD)
 * @returns {Object} - Obiect cu toate KPI-urile calculate
 */
async function calculateKPIs(db, startDate, endDate) {
    try {
        console.log(`📊 [BI] Calculez KPI-uri pentru perioada ${startDate} - ${endDate}`);

        // 1️⃣ Revenue Metrics
        const revenue = await db.get(`
            SELECT 
                COUNT(*) as total_orders,
                SUM(total) as total_revenue,
                AVG(total) as avg_order_value,
                COUNT(DISTINCT client_identifier) as unique_customers,
                SUM(CASE WHEN JSON_ARRAY_LENGTH(items) > 0 THEN JSON_ARRAY_LENGTH(items) ELSE 0 END) as total_items_sold
            FROM orders
            WHERE DATE(timestamp) BETWEEN ? AND ? 
                AND status = 'completed' 
                AND is_paid = 1
        `, [startDate, endDate]);

        // 2️⃣ Material Costs (din recipes + ingredient costs + waste)
        const materialCosts = await db.get(`
            SELECT COALESCE(SUM(
                oi.quantity * r.quantity_needed * i.cost_per_unit
            ), 0) as total_material_cost
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN recipes r ON oi.product_id = r.product_id
            JOIN ingredients i ON r.ingredient_id = i.id
            WHERE DATE(o.timestamp) BETWEEN ? AND ? AND o.status = 'completed'
        `, [startDate, endDate]);

        // 3️⃣ Labor Costs
        const laborCosts = await db.get(`
            SELECT COALESCE(SUM(amount), 0) as total_labor_cost
            FROM expenses
            WHERE expense_type = 'labor' AND expense_date BETWEEN ? AND ?
        `, [startDate, endDate]);

        // 4️⃣ Fixed Costs (rent, utilities)
        const fixedCosts = await db.get(`
            SELECT COALESCE(SUM(amount), 0) as total_fixed_cost
            FROM expenses
            WHERE category = 'fixed' AND expense_date BETWEEN ? AND ?
        `, [startDate, endDate]);

        // 5️⃣ Variable Costs (platform fees, delivery, marketing)
        const variableCosts = await db.get(`
            SELECT COALESCE(SUM(amount), 0) as total_variable_cost
            FROM expenses
            WHERE category = 'variable' AND expense_date BETWEEN ? AND ?
        `, [startDate, endDate]);

        // 6️⃣ Waste Costs
        const waste = await db.get(`
            SELECT COALESCE(SUM(cost), 0) as total_waste_cost
            FROM waste_tracking
            WHERE date BETWEEN ? AND ?
        `, [startDate, endDate]);

        // 7️⃣ Customer Metrics
        const customerMetrics = await db.get(`
            SELECT 
                COALESCE(AVG(rating), 0) as avg_rating,
                COUNT(*) as feedback_count
            FROM feedback
            WHERE DATE(timestamp) BETWEEN ? AND ?
        `, [startDate, endDate]);

        // 8️⃣ Operational Metrics
        const operationalMetrics = await db.get(`
            SELECT 
                COALESCE(AVG((julianday(served_at) - julianday(timestamp)) * 24 * 60), 0) as avg_fulfillment_time,
                COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 0) as cancellation_rate,
                SUM(CASE WHEN (julianday(served_at) - julianday(timestamp)) * 24 * 60 > 30 THEN 1 ELSE 0 END) as delayed_orders
            FROM orders
            WHERE DATE(timestamp) BETWEEN ? AND ?
        `, [startDate, endDate]);

        // 📊 Calcule KPI
        const totalRevenue = revenue.total_revenue || 0;
        const totalMaterialCost = (materialCosts.total_material_cost || 0) + (waste.total_waste_cost || 0);
        const totalLaborCost = laborCosts.total_labor_cost || 0;
        const totalFixedCost = fixedCosts.total_fixed_cost || 0;
        const totalVariableCost = variableCosts.total_variable_cost || 0;

        const totalOperatingExpenses = totalFixedCost + totalVariableCost;
        const primeCost = totalMaterialCost + totalLaborCost;
        const totalCosts = totalMaterialCost + totalLaborCost + totalOperatingExpenses;

        const grossProfit = totalRevenue - totalMaterialCost;
        const netProfit = totalRevenue - totalCosts;

        // Calcule sigure (evită diviziune la 0)
        const safeDivide = (numerator, denominator, defaultValue = 0) => {
            return denominator !== 0 ? numerator / denominator : defaultValue;
        };

        // 📈 KPI-uri finale
        const kpiResult = {
            // Revenue Metrics
            revenue: {
                total: parseFloat(totalRevenue.toFixed(2)),
                orders: revenue.total_orders || 0,
                avg_order_value: parseFloat((revenue.avg_order_value || 0).toFixed(2)),
                unique_customers: revenue.unique_customers || 0,
                revenue_per_customer: parseFloat(safeDivide(totalRevenue, revenue.unique_customers || 1).toFixed(2)),
                total_items_sold: revenue.total_items_sold || 0
            },

            // Cost Breakdown
            costs: {
                material: parseFloat(totalMaterialCost.toFixed(2)),
                labor: parseFloat(totalLaborCost.toFixed(2)),
                fixed: parseFloat(totalFixedCost.toFixed(2)),
                variable: parseFloat(totalVariableCost.toFixed(2)),
                operating: parseFloat(totalOperatingExpenses.toFixed(2)),
                prime_cost: parseFloat(primeCost.toFixed(2)),
                total: parseFloat(totalCosts.toFixed(2)),
                waste: parseFloat((waste.total_waste_cost || 0).toFixed(2))
            },

            // Profit Metrics
            profit: {
                gross: parseFloat(grossProfit.toFixed(2)),
                net: parseFloat(netProfit.toFixed(2)),
                gross_margin_pct: parseFloat(safeDivide(grossProfit, totalRevenue, 0).toFixed(2) * 100),
                net_margin_pct: parseFloat(safeDivide(netProfit, totalRevenue, 0).toFixed(2) * 100)
            },

            // KPIs Standard (%)
            kpis: {
                // ✅ Food Cost % (ideal: 28-35%)
                food_cost_pct: parseFloat((safeDivide(totalMaterialCost, totalRevenue, 0) * 100).toFixed(2)),

                // ✅ Labor Cost % (ideal: 25-35%)
                labor_cost_pct: parseFloat((safeDivide(totalLaborCost, totalRevenue, 0) * 100).toFixed(2)),

                // ✅ Prime Cost % (ideal: sub 60%)
                prime_cost_pct: parseFloat((safeDivide(primeCost, totalRevenue, 0) * 100).toFixed(2)),

                // ✅ Operating Ratio (ideal: sub 30%)
                operating_ratio: parseFloat((safeDivide(totalOperatingExpenses, totalRevenue, 0) * 100).toFixed(2)),

                // ✅ Average Check Value
                avg_check_value: parseFloat((revenue.avg_order_value || 0).toFixed(2)),

                // ✅ Break-Even Point (Revenue necesar pentru profit 0)
                break_even_revenue: parseFloat((totalFixedCost / (1 - safeDivide(primeCost, totalRevenue, 1))).toFixed(2))
            },

            // Customer Metrics
            customer: {
                avg_rating: parseFloat((customerMetrics.avg_rating || 0).toFixed(2)),
                feedback_count: customerMetrics.feedback_count || 0,
                nps_score: calculateNPS(customerMetrics.avg_rating || 0)
            },

            // Operational Metrics
            operational: {
                avg_fulfillment_time_minutes: parseFloat((operationalMetrics.avg_fulfillment_time || 0).toFixed(2)),
                cancellation_rate: parseFloat((operationalMetrics.cancellation_rate || 0).toFixed(2)),
                delayed_orders: operationalMetrics.delayed_orders || 0
            }
        };

        console.log(`✅ [BI] KPI-uri calculate cu succes pentru ${startDate} - ${endDate}`);
        return kpiResult;

    } catch (error) {
        console.error('❌ [BI] Eroare la calculul KPI-urilor:', error);
        throw error;
    }
}

/**
 * Calculează NPS (Net Promoter Score) din rating mediu
 * @param {number} avgRating - Rating mediu (1-5 scale)
 * @returns {number} - NPS score (-100 to +100)
 */
function calculateNPS(avgRating) {
    // Conversie rating 1-5 → NPS scale (-100 to +100)
    // Promoters (5 stars) = +100
    // Passives (4 stars) = +50
    // Neutral (3.5 stars) = 0
    // Detractors (1-3 stars) = negative
    if (avgRating >= 4.5) return 100;
    if (avgRating >= 4.0) return 50;
    if (avgRating >= 3.5) return 0;
    if (avgRating >= 3.0) return -50;
    return -100;
}

/**
 * Verifică praguri KPI și generează alerte dacă sunt depășite
 * @param {Object} db - Database connection
 * @param {Object} kpis - Obiect KPI calculat
 * @param {string} date - Data pentru care se verifică
 */
async function checkKPIThresholds(db, kpis, date) {
    try {
        console.log(`🔍 [BI] Verific praguri KPI pentru ${date}`);

        // Obține toate pragurile active
        const thresholds = await db.all(`
            SELECT * FROM bi_kpi_thresholds WHERE alert_enabled = 1
        `);

        for (const threshold of thresholds) {
            const kpiValue = getKPIValue(kpis, threshold.kpi_name);
            
            if (kpiValue === null) continue;

            let severity = null;
            let breached = false;

            // Verifică praguri în funcție de operator
            if (threshold.comparison_operator === '>') {
                if (kpiValue >= threshold.critical_threshold) {
                    severity = 'critical';
                    breached = true;
                } else if (kpiValue >= threshold.warning_threshold) {
                    severity = 'high';
                    breached = true;
                }
            } else if (threshold.comparison_operator === '<') {
                if (kpiValue <= threshold.critical_threshold) {
                    severity = 'critical';
                    breached = true;
                } else if (kpiValue <= threshold.warning_threshold) {
                    severity = 'high';
                    breached = true;
                }
            }

            // Generează alertă dacă prag depășit
            if (breached) {
                const existingAlert = await db.get(`
                    SELECT * FROM bi_alerts 
                    WHERE metric_name = ? 
                        AND DATE(created_at) = ? 
                        AND status = 'active'
                `, [threshold.kpi_name, date]);

                if (!existingAlert) {
                    await db.run(`
                        INSERT INTO bi_alerts (
                            alert_type, severity, title, message, 
                            metric_name, metric_value, threshold_value, 
                            affected_entity
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        'threshold',
                        severity,
                        `⚠️ ${threshold.description}`,
                        `KPI ${threshold.kpi_name} a atins ${kpiValue.toFixed(2)} (prag: ${threshold[severity === 'critical' ? 'critical_threshold' : 'warning_threshold']})`,
                        threshold.kpi_name,
                        kpiValue,
                        threshold[severity === 'critical' ? 'critical_threshold' : 'warning_threshold'],
                        date
                    ]);

                    console.log(`🚨 [BI] Alertă generată: ${threshold.kpi_name} = ${kpiValue.toFixed(2)} (${severity})`);
                }
            }
        }

        console.log(`✅ [BI] Verificare praguri completă`);
    } catch (error) {
        console.error('❌ [BI] Eroare la verificarea pragurilor:', error);
    }
}

/**
 * Extrage valoarea unui KPI din obiectul kpis
 * @param {Object} kpis - Obiect KPI calculat
 * @param {string} kpiName - Numele KPI-ului
 * @returns {number|null} - Valoarea KPI sau null dacă nu există
 */
function getKPIValue(kpis, kpiName) {
    const kpiMap = {
        'food_cost_pct': kpis.kpis.food_cost_pct,
        'labor_cost_pct': kpis.kpis.labor_cost_pct,
        'prime_cost_pct': kpis.kpis.prime_cost_pct,
        'net_margin_pct': kpis.profit.net_margin_pct,
        'avg_fulfillment_time_minutes': kpis.operational.avg_fulfillment_time_minutes,
        'cancellation_rate': kpis.operational.cancellation_rate,
        'avg_rating': kpis.customer.avg_rating
    };

    return kpiMap[kpiName] !== undefined ? kpiMap[kpiName] : null;
}

/**
 * Formatează valoare monetară în RON
 * @param {number} value - Valoare numerică
 * @returns {string} - String formatat (ex: "1,234.56 RON")
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('ro-RO', {
        style: 'currency',
        currency: 'RON',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

/**
 * Generează previziune simplă pentru următoarele zile (Linear Regression)
 * @param {Object} db - Database connection
 * @param {string} targetDate - Data țintă (YYYY-MM-DD)
 * @param {number} days - Număr zile pentru forecast
 * @returns {Object} - Obiect cu previziuni
 */
async function generateForecast(db, targetDate, days = 7) {
    try {
        console.log(`🔮 [BI] Generez forecast pentru ${targetDate} (+${days} zile)`);

        // Obține istoric (ultimele 90 zile)
        const historical = await db.all(`
            SELECT 
                snapshot_date as date,
                total_revenue as revenue,
                total_orders as orders,
                CAST(strftime('%w', snapshot_date) AS INTEGER) as day_of_week
            FROM bi_sales_summary
            WHERE snapshot_date >= date('now', '-90 days')
            ORDER BY snapshot_date
        `);

        if (historical.length < 7) {
            return {
                error: 'Istoric insuficient (minim 7 zile necesare)',
                forecast: []
            };
        }

        // Calculează medie pe zile săptămână
        const avgByDayOfWeek = {};
        for (let i = 0; i < 7; i++) {
            const dayData = historical.filter(h => h.day_of_week === i);
            avgByDayOfWeek[i] = {
                avgRevenue: dayData.reduce((sum, d) => sum + (d.revenue || 0), 0) / dayData.length || 0,
                avgOrders: dayData.reduce((sum, d) => sum + (d.orders || 0), 0) / dayData.length || 0
            };
        }

        // Simple Linear Regression pentru trend
        const n = historical.length;
        const sumX = historical.reduce((sum, _, i) => sum + i, 0);
        const sumY = historical.reduce((sum, h) => sum + (h.revenue || 0), 0);
        const sumXY = historical.reduce((sum, h, i) => sum + (i * (h.revenue || 0)), 0);
        const sumX2 = historical.reduce((sum, _, i) => sum + (i * i), 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        const trend = slope > 0 ? 'growing' : 'declining';

        // Generează forecast pentru următoarele zile
        const forecast = [];
        const startDate = new Date(targetDate);

        for (let i = 0; i < days; i++) {
            const forecastDate = new Date(startDate);
            forecastDate.setDate(forecastDate.getDate() + i);
            const dateStr = forecastDate.toISOString().split('T')[0];
            const dayOfWeek = forecastDate.getDay();

            // Verifică evenimente
            const event = await db.get(`
                SELECT * FROM events_calendar WHERE event_date = ?
            `, [dateStr]);

            let estimatedRevenue = avgByDayOfWeek[dayOfWeek].avgRevenue;
            let estimatedOrders = avgByDayOfWeek[dayOfWeek].avgOrders;

            // Aplică impact eveniment
            if (event && event.expected_traffic_increase) {
                estimatedRevenue *= event.expected_traffic_increase;
                estimatedOrders *= event.expected_traffic_increase;
            }

            // Aplică trend (simple adjustment)
            const trendAdjustment = 1 + (slope / sumY * 7); // 7 days trend
            estimatedRevenue *= trendAdjustment;

            forecast.push({
                date: dateStr,
                estimated_revenue: parseFloat(estimatedRevenue.toFixed(2)),
                estimated_orders: Math.round(estimatedOrders),
                confidence: event ? 0.65 : 0.75,
                event: event ? event.event_name : null,
                day_of_week: dayOfWeek
            });
        }

        console.log(`✅ [BI] Forecast generat pentru ${days} zile (trend: ${trend})`);

        return {
            success: true,
            targetDate,
            trend,
            forecast,
            historical_avg: avgByDayOfWeek
        };

    } catch (error) {
        console.error('❌ [BI] Eroare la generare forecast:', error);
        return {
            error: error.message,
            forecast: []
        };
    }
}

module.exports = {
    calculateKPIs,
    calculateNPS,
    checkKPIThresholds,
    formatCurrency,
    generateForecast,
    getKPIValue
};

