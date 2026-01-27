// kpi-registry.js - WHITE-LABEL KPI REGISTRY (Fabrică de Metrice Configurabilă)
// Sistem modular pentru calcul dinamic de KPI-uri bazat pe configurare tenant

const { dbPromise } = require('./database.js');

/**
 * KPI REGISTRY - Mapare între kpi_key și funcții de calcul
 * Fiecare KPI e o funcție pură care primește (db, tenantId, startDate, endDate)
 */
const KPI_FUNCTIONS = {
    // ==================== FINANCIAL KPIs ====================
    
    /**
     * Gross Revenue - Venituri totale brute
     */
    gross_revenue: async (db, tenantId, startDate, endDate) => {
        const result = await db.get(`
            SELECT COALESCE(SUM(total), 0) as value
            FROM orders
            WHERE tenant_id = ?
              AND DATE(timestamp) BETWEEN ? AND ?
              AND status = 'completed'
              AND is_paid = 1
        `, [tenantId, startDate, endDate]);
        
        return {
            value: parseFloat(result.value.toFixed(2)),
            unit: 'RON',
            formatted: formatCurrency(result.value)
        };
    },

    /**
     * Net Revenue - Venituri nete (după reduceri și retur)
     */
    net_revenue: async (db, tenantId, startDate, endDate) => {
        // Placeholder - va fi implementat când adăugăm discounts și refunds
        return KPI_FUNCTIONS.gross_revenue(db, tenantId, startDate, endDate);
    },

    /**
     * COGS (Cost of Goods Sold) - Cost materii prime
     */
    cogs: async (db, tenantId, startDate, endDate) => {
        const materialCosts = await db.get(`
            SELECT COALESCE(SUM(
                oi.quantity * r.quantity_needed * i.cost_per_unit
            ), 0) as value
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN recipes r ON oi.product_id = r.product_id
            JOIN ingredients i ON r.ingredient_id = i.id
            WHERE o.tenant_id = ?
              AND DATE(o.timestamp) BETWEEN ? AND ?
              AND o.status = 'completed'
        `, [tenantId, startDate, endDate]);
        
        const wasteCosts = await db.get(`
            SELECT COALESCE(SUM(cost), 0) as value
            FROM waste_tracking
            WHERE tenant_id = ?
              AND date BETWEEN ? AND ?
        `, [tenantId, startDate, endDate]);
        
        const totalCOGS = (materialCosts.value || 0) + (wasteCosts.value || 0);
        
        return {
            value: parseFloat(totalCOGS.toFixed(2)),
            unit: 'RON',
            formatted: formatCurrency(totalCOGS)
        };
    },

    /**
     * Labor Cost - Cost personal
     */
    labor_cost: async (db, tenantId, startDate, endDate) => {
        const result = await db.get(`
            SELECT COALESCE(SUM(amount), 0) as value
            FROM expenses
            WHERE tenant_id = ?
              AND expense_type = 'labor'
              AND expense_date BETWEEN ? AND ?
        `, [tenantId, startDate, endDate]);
        
        return {
            value: parseFloat(result.value.toFixed(2)),
            unit: 'RON',
            formatted: formatCurrency(result.value)
        };
    },

    /**
     * Prime Cost - COGS + Labor
     */
    prime_cost: async (db, tenantId, startDate, endDate) => {
        const cogs = await KPI_FUNCTIONS.cogs(db, tenantId, startDate, endDate);
        const labor = await KPI_FUNCTIONS.labor_cost(db, tenantId, startDate, endDate);
        
        const primeCost = cogs.value + labor.value;
        
        return {
            value: parseFloat(primeCost.toFixed(2)),
            unit: 'RON',
            formatted: formatCurrency(primeCost),
            breakdown: {
                cogs: cogs.value,
                labor: labor.value
            }
        };
    },

    /**
     * Gross Profit - Revenue - COGS
     */
    gross_profit: async (db, tenantId, startDate, endDate) => {
        const revenue = await KPI_FUNCTIONS.gross_revenue(db, tenantId, startDate, endDate);
        const cogs = await KPI_FUNCTIONS.cogs(db, tenantId, startDate, endDate);
        
        const grossProfit = revenue.value - cogs.value;
        
        return {
            value: parseFloat(grossProfit.toFixed(2)),
            unit: 'RON',
            formatted: formatCurrency(grossProfit)
        };
    },

    /**
     * Net Profit - Revenue - Total Costs
     */
    net_profit: async (db, tenantId, startDate, endDate) => {
        const revenue = await KPI_FUNCTIONS.gross_revenue(db, tenantId, startDate, endDate);
        const cogs = await KPI_FUNCTIONS.cogs(db, tenantId, startDate, endDate);
        const labor = await KPI_FUNCTIONS.labor_cost(db, tenantId, startDate, endDate);
        
        // Operating expenses (rent, utilities, etc.)
        const operating = await db.get(`
            SELECT COALESCE(SUM(amount), 0) as value
            FROM expenses
            WHERE tenant_id = ?
              AND expense_type NOT IN ('labor')
              AND expense_date BETWEEN ? AND ?
        `, [tenantId, startDate, endDate]);
        
        const totalCosts = cogs.value + labor.value + (operating.value || 0);
        const netProfit = revenue.value - totalCosts;
        
        return {
            value: parseFloat(netProfit.toFixed(2)),
            unit: 'RON',
            formatted: formatCurrency(netProfit),
            breakdown: {
                revenue: revenue.value,
                cogs: cogs.value,
                labor: labor.value,
                operating: operating.value || 0
            }
        };
    },

    /**
     * Food Cost % - (COGS / Revenue) × 100
     */
    food_cost_pct: async (db, tenantId, startDate, endDate) => {
        const revenue = await KPI_FUNCTIONS.gross_revenue(db, tenantId, startDate, endDate);
        const cogs = await KPI_FUNCTIONS.cogs(db, tenantId, startDate, endDate);
        
        const percentage = revenue.value > 0 ? (cogs.value / revenue.value * 100) : 0;
        
        return {
            value: parseFloat(percentage.toFixed(2)),
            unit: '%',
            formatted: `${percentage.toFixed(2)}%`,
            status: getThresholdStatus(percentage, 35, 40, '>')
        };
    },

    /**
     * Labor Cost % - (Labor / Revenue) × 100
     */
    labor_cost_pct: async (db, tenantId, startDate, endDate) => {
        const revenue = await KPI_FUNCTIONS.gross_revenue(db, tenantId, startDate, endDate);
        const labor = await KPI_FUNCTIONS.labor_cost(db, tenantId, startDate, endDate);
        
        const percentage = revenue.value > 0 ? (labor.value / revenue.value * 100) : 0;
        
        return {
            value: parseFloat(percentage.toFixed(2)),
            unit: '%',
            formatted: `${percentage.toFixed(2)}%`,
            status: getThresholdStatus(percentage, 35, 40, '>')
        };
    },

    /**
     * Prime Cost % - (Prime Cost / Revenue) × 100
     */
    prime_cost_pct: async (db, tenantId, startDate, endDate) => {
        const revenue = await KPI_FUNCTIONS.gross_revenue(db, tenantId, startDate, endDate);
        const primeCost = await KPI_FUNCTIONS.prime_cost(db, tenantId, startDate, endDate);
        
        const percentage = revenue.value > 0 ? (primeCost.value / revenue.value * 100) : 0;
        
        return {
            value: parseFloat(percentage.toFixed(2)),
            unit: '%',
            formatted: `${percentage.toFixed(2)}%`,
            status: getThresholdStatus(percentage, 65, 70, '>')
        };
    },

    /**
     * Gross Margin % - (Gross Profit / Revenue) × 100
     */
    gross_margin_pct: async (db, tenantId, startDate, endDate) => {
        const revenue = await KPI_FUNCTIONS.gross_revenue(db, tenantId, startDate, endDate);
        const grossProfit = await KPI_FUNCTIONS.gross_profit(db, tenantId, startDate, endDate);
        
        const percentage = revenue.value > 0 ? (grossProfit.value / revenue.value * 100) : 0;
        
        return {
            value: parseFloat(percentage.toFixed(2)),
            unit: '%',
            formatted: `${percentage.toFixed(2)}%`
        };
    },

    /**
     * Net Margin % - (Net Profit / Revenue) × 100
     */
    net_margin_pct: async (db, tenantId, startDate, endDate) => {
        const revenue = await KPI_FUNCTIONS.gross_revenue(db, tenantId, startDate, endDate);
        const netProfit = await KPI_FUNCTIONS.net_profit(db, tenantId, startDate, endDate);
        
        const percentage = revenue.value > 0 ? (netProfit.value / revenue.value * 100) : 0;
        
        return {
            value: parseFloat(percentage.toFixed(2)),
            unit: '%',
            formatted: `${percentage.toFixed(2)}%`,
            status: getThresholdStatus(percentage, 10, 5, '<')
        };
    },

    /**
     * Break-Even Revenue - Fixed Costs / (1 - (Prime Cost / Revenue))
     */
    break_even_revenue: async (db, tenantId, startDate, endDate) => {
        const revenue = await KPI_FUNCTIONS.gross_revenue(db, tenantId, startDate, endDate);
        const primeCost = await KPI_FUNCTIONS.prime_cost(db, tenantId, startDate, endDate);
        
        const fixedCosts = await db.get(`
            SELECT COALESCE(SUM(amount), 0) as value
            FROM expenses
            WHERE tenant_id = ?
              AND category = 'fixed'
              AND expense_date BETWEEN ? AND ?
        `, [tenantId, startDate, endDate]);
        
        const contribution = revenue.value > 0 ? (1 - (primeCost.value / revenue.value)) : 0;
        const breakEven = contribution > 0 ? (fixedCosts.value / contribution) : 0;
        
        return {
            value: parseFloat(breakEven.toFixed(2)),
            unit: 'RON',
            formatted: formatCurrency(breakEven)
        };
    },

    // ==================== OPERATIONAL KPIs ====================
    
    /**
     * Average Order Value - Revenue / Orders
     */
    avg_order_value: async (db, tenantId, startDate, endDate) => {
        const result = await db.get(`
            SELECT 
                COUNT(*) as orders,
                COALESCE(SUM(total), 0) as revenue
            FROM orders
            WHERE tenant_id = ?
              AND DATE(timestamp) BETWEEN ? AND ?
              AND status = 'completed'
              AND is_paid = 1
        `, [tenantId, startDate, endDate]);
        
        const avgValue = result.orders > 0 ? (result.revenue / result.orders) : 0;
        
        return {
            value: parseFloat(avgValue.toFixed(2)),
            unit: 'RON',
            formatted: formatCurrency(avgValue)
        };
    },

    /**
     * Total Orders Count
     */
    orders_count: async (db, tenantId, startDate, endDate) => {
        const result = await db.get(`
            SELECT COUNT(*) as value
            FROM orders
            WHERE tenant_id = ?
              AND DATE(timestamp) BETWEEN ? AND ?
              AND status = 'completed'
        `, [tenantId, startDate, endDate]);
        
        return {
            value: parseInt(result.value),
            unit: '',
            formatted: result.value.toString()
        };
    },

    /**
     * Average Fulfillment Time (minutes)
     */
    avg_fulfillment_time: async (db, tenantId, startDate, endDate) => {
        const result = await db.get(`
            SELECT AVG((julianday(served_at) - julianday(timestamp)) * 24 * 60) as value
            FROM orders
            WHERE tenant_id = ?
              AND DATE(timestamp) BETWEEN ? AND ?
              AND status = 'completed'
              AND served_at IS NOT NULL
        `, [tenantId, startDate, endDate]);
        
        return {
            value: parseFloat((result.value || 0).toFixed(2)),
            unit: 'minutes',
            formatted: `${(result.value || 0).toFixed(1)} min`,
            status: getThresholdStatus(result.value || 0, 30, 40, '>')
        };
    },

    /**
     * Cancellation Rate %
     */
    cancellation_rate: async (db, tenantId, startDate, endDate) => {
        const result = await db.get(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
            FROM orders
            WHERE tenant_id = ?
              AND DATE(timestamp) BETWEEN ? AND ?
        `, [tenantId, startDate, endDate]);
        
        const percentage = result.total > 0 ? (result.cancelled / result.total * 100) : 0;
        
        return {
            value: parseFloat(percentage.toFixed(2)),
            unit: '%',
            formatted: `${percentage.toFixed(2)}%`,
            status: getThresholdStatus(percentage, 5, 10, '>')
        };
    },

    // ==================== CUSTOMER KPIs ====================
    
    /**
     * Unique Customers
     */
    unique_customers: async (db, tenantId, startDate, endDate) => {
        const result = await db.get(`
            SELECT COUNT(DISTINCT client_identifier) as value
            FROM orders
            WHERE tenant_id = ?
              AND DATE(timestamp) BETWEEN ? AND ?
              AND status = 'completed'
              AND client_identifier IS NOT NULL
        `, [tenantId, startDate, endDate]);
        
        return {
            value: parseInt(result.value || 0),
            unit: '',
            formatted: (result.value || 0).toString()
        };
    },

    /**
     * Average Rating
     */
    avg_rating: async (db, tenantId, startDate, endDate) => {
        const result = await db.get(`
            SELECT AVG(f.rating) as value
            FROM feedback f
            JOIN orders o ON f.order_id = o.id
            WHERE o.tenant_id = ?
              AND DATE(f.timestamp) BETWEEN ? AND ?
        `, [tenantId, startDate, endDate]);
        
        return {
            value: parseFloat((result.value || 0).toFixed(2)),
            unit: '',
            formatted: `${(result.value || 0).toFixed(1)} ⭐`,
            status: getThresholdStatus(result.value || 0, 4.0, 3.5, '<')
        };
    },

    /**
     * NPS Score - Net Promoter Score (-100 to +100)
     */
    nps_score: async (db, tenantId, startDate, endDate) => {
        const avgRating = await KPI_FUNCTIONS.avg_rating(db, tenantId, startDate, endDate);
        
        // Conversie simplă rating 1-5 → NPS
        let nps = 0;
        if (avgRating.value >= 4.5) nps = 100;
        else if (avgRating.value >= 4.0) nps = 50;
        else if (avgRating.value >= 3.5) nps = 0;
        else if (avgRating.value >= 3.0) nps = -50;
        else nps = -100;
        
        return {
            value: nps,
            unit: '',
            formatted: nps.toString()
        };
    }

    // TODO: Adaugă mai multe KPI-uri după nevoie
    // - customer_retention_rate
    // - revenue_per_employee
    // - sales_per_labor_hour
    // - inventory_turnover
    // - waste_percentage
};

/**
 * Calculează un singur KPI pentru un tenant
 * @param {string} kpiKey - Key-ul KPI-ului (ex: "gross_revenue")
 * @param {number} tenantId - ID-ul tenant-ului
 * @param {string} startDate - Data început (YYYY-MM-DD)
 * @param {string} endDate - Data sfârșit (YYYY-MM-DD)
 * @returns {Promise<Object>} - Rezultatul KPI
 */
async function calculateKPI(kpiKey, tenantId, startDate, endDate) {
    const db = await dbPromise;
    
    const calculationFn = KPI_FUNCTIONS[kpiKey];
    
    if (!calculationFn) {
        throw new Error(`KPI "${kpiKey}" nu există în registry`);
    }
    
    try {
        const result = await calculationFn(db, tenantId, startDate, endDate);
        return {
            kpi_key: kpiKey,
            tenant_id: tenantId,
            period: { startDate, endDate },
            ...result,
            calculated_at: new Date().toISOString()
        };
    } catch (error) {
        console.error(`❌ Eroare la calculul KPI "${kpiKey}":`, error);
        throw error;
    }
}

/**
 * Calculează TOATE KPI-urile active pentru un tenant
 * @param {number} tenantId - ID-ul tenant-ului
 * @param {string} startDate - Data început
 * @param {string} endDate - Data sfârșit
 * @returns {Promise<Array>} - Array cu toate KPI-urile calculate
 */
async function calculateAllKPIs(tenantId, startDate, endDate) {
    const db = await dbPromise;
    
    // Obține lista de KPI-uri active pentru tenant
    const activeKPIs = await db.all(`
        SELECT kpi_key, display_label, chart_type
        FROM tenant_kpi_config
        WHERE tenant_id = ? AND is_enabled = 1
        ORDER BY display_order
    `, [tenantId]);
    
    // Calculează fiecare KPI în paralel
    const results = await Promise.all(
        activeKPIs.map(async (kpiConfig) => {
            try {
                const kpiResult = await calculateKPI(kpiConfig.kpi_key, tenantId, startDate, endDate);
                return {
                    ...kpiResult,
                    display_label: kpiConfig.display_label,
                    chart_type: kpiConfig.chart_type
                };
            } catch (error) {
                console.error(`⚠️ Skip KPI "${kpiConfig.kpi_key}":`, error.message);
                return null;
            }
        })
    );
    
    // Filtrează null-urile (KPI-uri care au dat eroare)
    return results.filter(r => r !== null);
}

/**
 * Determină statusul unui KPI bazat pe praguri
 * @param {number} value - Valoarea curentă
 * @param {number} warning - Prag warning
 * @param {number} critical - Prag critical
 * @param {string} operator - Operator de comparație ('>' sau '<')
 * @returns {string} - 'ok', 'warning', sau 'critical'
 */
function getThresholdStatus(value, warning, critical, operator) {
    if (operator === '>') {
        if (value >= critical) return 'critical';
        if (value >= warning) return 'warning';
        return 'ok';
    } else if (operator === '<') {
        if (value <= critical) return 'critical';
        if (value <= warning) return 'warning';
        return 'ok';
    }
    return 'ok';
}

/**
 * Formatare valoare monetară
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

module.exports = {
    calculateKPI,
    calculateAllKPIs,
    KPI_FUNCTIONS,
    formatCurrency
};

