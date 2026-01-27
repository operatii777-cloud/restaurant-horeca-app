// bi/kpi-registry.js
// FAZA 2B - Săptămâna 3: KPI Registry cu toate KPI-urile

/**
 * KPI Registry - Definește toate KPI-urile disponibile în platformă
 * 
 * Fiecare KPI are:
 * - id: Identificator unic
 * - category: Grupare (revenue, cost, profit, customer, efficiency)
 * - label: Nume afișat (RO/EN)
 * - description: Descriere (RO/EN)
 * - calculate: Funcție de calcul
 * - dependencies: Alte KPI-uri necesare
 * - metadata: Unit, format, chartType, color, icon, thresholds
 * - industries: Industrii relevante
 * - minPlan: Plan minim necesar
 * 
 * Data: 27 Octombrie 2025
 * Versiune: 1.0.0
 */

const KPI_REGISTRY = {
    
    // ==================== REVENUE METRICS ====================
    
    gross_revenue: {
        id: 'gross_revenue',
        category: 'revenue',
        label: {
            ro: 'Venituri Brute',
            en: 'Gross Revenue'
        },
        description: {
            ro: 'Total venituri din vânzări (înainte de reduceri și TVA)',
            en: 'Total sales revenue (before discounts and VAT)'
        },
        unit: 'currency',
        chartType: 'line',
        defaultColor: '#28a745',
        icon: '💰',
        
        /**
         * Calculează venitul brut total
         */
        calculate: async (ctx) => {
            const { tenant_id, start_date, end_date, db } = ctx;
            
            const result = await new Promise((resolve, reject) => {
                db.get(`
                    SELECT SUM(total) as revenue
                    FROM orders
                    WHERE tenant_id = ?
                      AND timestamp >= ?
                      AND timestamp <= ?
                      AND is_paid = 1
                `, [tenant_id, start_date, end_date], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            
            return result?.revenue || 0;
        },
        
        format: (value, locale, currency) => {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency
            }).format(value);
        },
        
        industries: ['restaurant', 'hotel', 'bar', 'fast_food', 'catering', 'event_venue'],
        minPlan: 'starter'
    },
    
    net_revenue: {
        id: 'net_revenue',
        category: 'revenue',
        label: {
            ro: 'Venituri Nete',
            en: 'Net Revenue'
        },
        description: {
            ro: 'Venituri după deducerea reducerilor (temporar = gross revenue, discount_amount nu există)',
            en: 'Revenue after discounts (temp = gross revenue, discount_amount column missing)'
        },
        unit: 'currency',
        chartType: 'line',
        defaultColor: '#20c997',
        icon: '💵',
        
        dependencies: ['gross_revenue'],
        
        calculate: async (ctx, calculatedKPIs) => {
            // Temporar, net_revenue = gross_revenue (coloana discount_amount nu există în orders)
            // TODO: Când se adaugă discount_amount, actualizează să fie: gross - discounts
            return calculatedKPIs.gross_revenue || 0;
        },
        
        format: (value, locale, currency) => {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency
            }).format(value);
        },
        
        industries: ['restaurant', 'hotel', 'bar', 'fast_food', 'catering', 'event_venue'],
        minPlan: 'starter',
        hidden: true // Ascuns deocamdată până la implementarea discount_amount
    },
    
    // ==================== COST METRICS ====================
    
    cogs: {
        id: 'cogs',
        category: 'cost',
        label: {
            ro: 'Cost Mărfuri (COGS)',
            en: 'Cost of Goods Sold'
        },
        description: {
            ro: 'Costul total al ingredientelor/materialelor folosite',
            en: 'Total cost of ingredients/materials used'
        },
        unit: 'currency',
        chartType: 'bar',
        defaultColor: '#dc3545',
        icon: '📦',
        
        calculate: async (ctx) => {
            const { tenant_id, start_date, end_date, db } = ctx;
            
            // SANDBOX: stock_movements doesn't have tenant_id column (template deployment = single tenant)
            const result = await new Promise((resolve, reject) => {
                db.get(`
                    SELECT SUM(ABS(sm.quantity_change) * i.cost_per_unit) as cogs
                    FROM stock_movements sm
                    JOIN ingredients i ON sm.ingredient_id = i.id
                    WHERE sm.created_at >= ?
                      AND sm.created_at <= ?
                      AND sm.quantity_change < 0
                      AND sm.movement_type IN ('order', 'production', 'waste')
                `, [start_date, end_date], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            
            return result?.cogs || 0;
        },
        
        format: (value, locale, currency) => {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency
            }).format(value);
        },
        
        industries: ['restaurant', 'bar', 'fast_food', 'catering'],
        minPlan: 'professional'
    },
    
    labor_cost: {
        id: 'labor_cost',
        category: 'cost',
        label: {
            ro: 'Cost Personal',
            en: 'Labor Cost'
        },
        description: {
            ro: 'Costul total cu personalul (salarii + taxe)',
            en: 'Total labor cost (salaries + taxes)'
        },
        unit: 'currency',
        chartType: 'bar',
        defaultColor: '#fd7e14',
        icon: '👥',
        
        calculate: async (ctx) => {
            const { tenant_id, start_date, end_date, db } = ctx;
            
            // SANDBOX: waiters doesn't have tenant_id column (template deployment = single tenant)
            const waiters = await new Promise((resolve, reject) => {
                db.get(`
                    SELECT COUNT(*) as count
                    FROM waiters
                    WHERE active = 1
                `, [], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            
            // Estimare: 3000 RON/lună per angajat activ
            const daysInPeriod = Math.ceil((new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24));
            const monthlyEquivalent = daysInPeriod / 30;
            return (waiters?.count || 0) * 3000 * monthlyEquivalent;
        },
        
        format: (value, locale, currency) => {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency
            }).format(value);
        },
        
        industries: ['restaurant', 'hotel', 'bar', 'fast_food', 'catering', 'event_venue'],
        minPlan: 'professional'
    },
    
    overhead_cost: {
        id: 'overhead_cost',
        category: 'cost',
        label: {
            ro: 'Costuri Generale',
            en: 'Overhead Costs'
        },
        description: {
            ro: 'Costuri cu utilități, chirie, mentenanță',
            en: 'Utilities, rent, maintenance costs'
        },
        unit: 'currency',
        chartType: 'bar',
        defaultColor: '#6c757d',
        icon: '🏢',
        
        calculate: async (ctx, calculatedKPIs) => {
            // Estimare: 10% din revenue (tabela expenses nu există încă)
            // Când expenses va fi implementată, se va actualiza să citească din acolo
            const revenue = calculatedKPIs?.gross_revenue || 0;
            return revenue * 0.10; // 10% overhead estimate
        },
        
        dependencies: ['gross_revenue'],
        
        format: (value, locale, currency) => {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency
            }).format(value);
        },
        
        industries: ['restaurant', 'hotel', 'bar', 'fast_food', 'catering', 'event_venue'],
        minPlan: 'professional',
        hidden: true // Nu se afișează direct în dashboard
    },
    
    prime_cost: {
        id: 'prime_cost',
        category: 'cost',
        label: {
            ro: 'Cost Prim',
            en: 'Prime Cost'
        },
        description: {
            ro: 'COGS + Cost Personal (cei mai importanți 2 costuri)',
            en: 'COGS + Labor Cost (the two most important costs)'
        },
        unit: 'currency',
        chartType: 'bar',
        defaultColor: '#e83e8c',
        icon: '💼',
        
        dependencies: ['cogs', 'labor_cost'],
        
        calculate: async (ctx, calculatedKPIs) => {
            const cogs = calculatedKPIs.cogs || 0;
            const labor = calculatedKPIs.labor_cost || 0;
            return cogs + labor;
        },
        
        format: (value, locale, currency) => {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency
            }).format(value);
        },
        
        industries: ['restaurant', 'hotel', 'bar', 'fast_food', 'catering'],
        minPlan: 'professional'
    },
    
    // ==================== PROFIT METRICS ====================
    
    gross_profit: {
        id: 'gross_profit',
        category: 'profit',
        label: {
            ro: 'Profit Brut',
            en: 'Gross Profit'
        },
        description: {
            ro: 'Venituri - COGS',
            en: 'Revenue - COGS'
        },
        unit: 'currency',
        chartType: 'line',
        defaultColor: '#17a2b8',
        icon: '📈',
        
        dependencies: ['gross_revenue', 'cogs'],
        
        calculate: async (ctx, calculatedKPIs) => {
            const revenue = calculatedKPIs.gross_revenue || 0;
            const cogs = calculatedKPIs.cogs || 0;
            return revenue - cogs;
        },
        
        format: (value, locale, currency) => {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency
            }).format(value);
        },
        
        industries: ['restaurant', 'hotel', 'bar', 'fast_food', 'catering', 'event_venue'],
        minPlan: 'professional'
    },
    
    net_profit: {
        id: 'net_profit',
        category: 'profit',
        label: {
            ro: 'Profit Net',
            en: 'Net Profit'
        },
        description: {
            ro: 'Venituri - COGS - Personal - Overhead',
            en: 'Revenue - COGS - Labor - Overhead'
        },
        unit: 'currency',
        chartType: 'line',
        defaultColor: '#6610f2',
        icon: '💎',
        
        dependencies: ['gross_revenue', 'cogs', 'labor_cost', 'overhead_cost'],
        
        calculate: async (ctx, calculatedKPIs) => {
            const revenue = calculatedKPIs.gross_revenue || 0;
            const cogs = calculatedKPIs.cogs || 0;
            const labor = calculatedKPIs.labor_cost || 0;
            const overhead = calculatedKPIs.overhead_cost || 0;
            
            return revenue - cogs - labor - overhead;
        },
        
        format: (value, locale, currency) => {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency
            }).format(value);
        },
        
        industries: ['restaurant', 'hotel', 'bar', 'fast_food', 'catering', 'event_venue'],
        minPlan: 'professional'
    },
    
    profit_margin: {
        id: 'profit_margin',
        category: 'profit',
        label: {
            ro: 'Marjă Profit (%)',
            en: 'Profit Margin (%)'
        },
        description: {
            ro: '(Profit Net / Venituri Brute) × 100',
            en: '(Net Profit / Gross Revenue) × 100'
        },
        unit: 'percentage',
        chartType: 'gauge',
        defaultColor: '#6f42c1',
        icon: '📊',
        
        dependencies: ['net_profit', 'gross_revenue'],
        
        calculate: async (ctx, calculatedKPIs) => {
            const profit = calculatedKPIs.net_profit || 0;
            const revenue = calculatedKPIs.gross_revenue || 0;
            
            if (revenue === 0) return 0;
            return (profit / revenue) * 100;
        },
        
        format: (value) => {
            return `${value.toFixed(2)}%`;
        },
        
        thresholds: {
            good: 20,       // > 20% = green
            warning: 10,    // 10-20% = yellow
            critical: 0     // < 10% = red
        },
        
        industries: ['restaurant', 'hotel', 'bar', 'fast_food', 'catering', 'event_venue'],
        minPlan: 'professional'
    },
    
    // ==================== PERCENTAGE METRICS ====================
    
    food_cost_percent: {
        id: 'food_cost_percent',
        category: 'efficiency',
        label: {
            ro: '% Cost Alimente',
            en: 'Food Cost %'
        },
        description: {
            ro: '(COGS / Venituri Brute) × 100',
            en: '(COGS / Gross Revenue) × 100'
        },
        unit: 'percentage',
        chartType: 'gauge',
        defaultColor: '#ffc107',
        icon: '🍽️',
        
        dependencies: ['cogs', 'gross_revenue'],
        
        calculate: async (ctx, calculatedKPIs) => {
            const cogs = calculatedKPIs.cogs || 0;
            const revenue = calculatedKPIs.gross_revenue || 0;
            
            if (revenue === 0) return 0;
            return (cogs / revenue) * 100;
        },
        
        format: (value) => `${value.toFixed(2)}%`,
        
        thresholds: {
            good: 30,       // < 30% = green
            warning: 35,    // 30-35% = yellow
            critical: 40    // > 35% = red
        },
        
        industries: ['restaurant', 'bar', 'fast_food', 'catering'],
        minPlan: 'professional'
    },
    
    labor_cost_percent: {
        id: 'labor_cost_percent',
        category: 'efficiency',
        label: {
            ro: '% Cost Personal',
            en: 'Labor Cost %'
        },
        description: {
            ro: '(Cost Personal / Venituri Brute) × 100',
            en: '(Labor Cost / Gross Revenue) × 100'
        },
        unit: 'percentage',
        chartType: 'gauge',
        defaultColor: '#fd7e14',
        icon: '👔',
        
        dependencies: ['labor_cost', 'gross_revenue'],
        
        calculate: async (ctx, calculatedKPIs) => {
            const labor = calculatedKPIs.labor_cost || 0;
            const revenue = calculatedKPIs.gross_revenue || 0;
            
            if (revenue === 0) return 0;
            return (labor / revenue) * 100;
        },
        
        format: (value) => `${value.toFixed(2)}%`,
        
        thresholds: {
            good: 30,
            warning: 35,
            critical: 40
        },
        
        industries: ['restaurant', 'hotel', 'bar', 'fast_food', 'catering', 'event_venue'],
        minPlan: 'professional'
    },
    
    // ==================== CUSTOMER METRICS ====================
    
    avg_order_value: {
        id: 'avg_order_value',
        category: 'customer',
        label: {
            ro: 'Valoare Medie Comandă',
            en: 'Average Order Value'
        },
        description: {
            ro: 'Media valorii comenzilor plătite',
            en: 'Average value of paid orders'
        },
        unit: 'currency',
        chartType: 'bar',
        defaultColor: '#17a2b8',
        icon: '🛒',
        
        calculate: async (ctx) => {
            const { tenant_id, start_date, end_date, db } = ctx;
            
            const result = await new Promise((resolve, reject) => {
                db.get(`
                    SELECT 
                        AVG(total) as avg_value,
                        COUNT(*) as count
                    FROM orders
                    WHERE tenant_id = ?
                      AND timestamp >= ?
                      AND timestamp <= ?
                      AND is_paid = 1
                `, [tenant_id, start_date, end_date], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            
            return result?.avg_value || 0;
        },
        
        format: (value, locale, currency) => {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency
            }).format(value);
        },
        
        industries: ['restaurant', 'hotel', 'bar', 'fast_food', 'catering', 'event_venue'],
        minPlan: 'starter'
    },
    
    customer_retention: {
        id: 'customer_retention',
        category: 'customer',
        label: {
            ro: 'Rată Retenție Clienți',
            en: 'Customer Retention Rate'
        },
        description: {
            ro: '% clienți care revin în perioada curentă',
            en: '% customers returning in current period'
        },
        unit: 'percentage',
        chartType: 'line',
        defaultColor: '#20c997',
        icon: '🤝',
        
        calculate: async (ctx) => {
            const { tenant_id, start_date, end_date, db } = ctx;
            
            // Clienți care au revenit în perioada curentă
            const returning = await new Promise((resolve, reject) => {
                db.get(`
                    SELECT COUNT(DISTINCT client_identifier) as count
                    FROM orders
                    WHERE tenant_id = ?
                      AND timestamp >= ?
                      AND timestamp <= ?
                      AND client_identifier IN (
                          SELECT client_identifier
                          FROM orders
                          WHERE tenant_id = ?
                            AND timestamp < ?
                      )
                `, [tenant_id, start_date, end_date, tenant_id, start_date], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            
            // Total clienți unici în perioada anterioară
            const total = await new Promise((resolve, reject) => {
                db.get(`
                    SELECT COUNT(DISTINCT client_identifier) as count
                    FROM orders
                    WHERE tenant_id = ?
                      AND timestamp < ?
                `, [tenant_id, start_date], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            
            if (!total?.count || total.count === 0) return 0;
            return (returning.count / total.count) * 100;
        },
        
        format: (value) => `${value.toFixed(1)}%`,
        
        thresholds: {
            good: 60,
            warning: 40,
            critical: 20
        },
        
        industries: ['restaurant', 'hotel', 'bar', 'fast_food', 'catering'],
        minPlan: 'professional'
    },
    
    satisfaction_score: {
        id: 'satisfaction_score',
        category: 'customer',
        label: {
            ro: 'Scor Satisfacție',
            en: 'Satisfaction Score'
        },
        description: {
            ro: 'Media rating-urilor clienților',
            en: 'Average customer rating'
        },
        unit: 'rating',
        chartType: 'gauge',
        defaultColor: '#ffc107',
        icon: '⭐',
        
        calculate: async (ctx) => {
            const { tenant_id, start_date, end_date, db } = ctx;
            
            // SANDBOX FIX: Check if tenant_id column exists in feedback table
            const checkColumn = await new Promise((resolve) => {
                db.get(`PRAGMA table_info(feedback)`, (err, row) => {
                    if (err) resolve(false);
                    else {
                        // Check all columns
                        db.all(`PRAGMA table_info(feedback)`, (err2, columns) => {
                            if (err2) resolve(false);
                            else {
                                const hasTenantId = columns.some(col => col.name === 'tenant_id');
                                resolve(hasTenantId);
                            }
                        });
                    }
                });
            });
            
            let query, params;
            
            if (checkColumn) {
                // Multi-tenant version: filter by tenant_id
                query = `
                    SELECT AVG(rating) as avg_rating
                    FROM feedback
                    WHERE tenant_id = ?
                      AND timestamp >= ?
                      AND timestamp <= ?
                `;
                params = [tenant_id, start_date, end_date];
            } else {
                // Sandbox version: no tenant_id, use OVERALL period (all feedback)
                // This matches the behavior of admin-advanced.html feedback section
                query = `
                    SELECT AVG(rating) as avg_rating
                    FROM feedback
                    WHERE timestamp >= ?
                      AND timestamp <= ?
                `;
                params = [start_date, end_date];
            }
            
            const result = await new Promise((resolve, reject) => {
                db.get(query, params, (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            
            return result?.avg_rating || 0;
        },
        
        format: (value) => `${value.toFixed(1)} ★`,
        
        thresholds: {
            good: 4.5,
            warning: 4.0,
            critical: 3.5
        },
        
        industries: ['restaurant', 'hotel', 'bar', 'fast_food', 'catering', 'event_venue'],
        minPlan: 'starter'
    },
    
    // ==================== EFFICIENCY METRICS ====================
    
    avg_order_time: {
        id: 'avg_order_time',
        category: 'efficiency',
        label: {
            ro: 'Timp Mediu Servire',
            en: 'Average Service Time'
        },
        description: {
            ro: 'Timpul mediu de la comandă la livrare',
            en: 'Average time from order to delivery'
        },
        unit: 'minutes',
        chartType: 'line',
        defaultColor: '#6610f2',
        icon: '⏱️',
        
        calculate: async (ctx) => {
            const { tenant_id, start_date, end_date, db } = ctx;
            
            const result = await new Promise((resolve, reject) => {
                db.get(`
                    SELECT AVG(
                        (julianday(completed_timestamp) - julianday(timestamp)) * 24 * 60
                    ) as avg_minutes
                    FROM orders
                    WHERE tenant_id = ?
                      AND timestamp >= ?
                      AND timestamp <= ?
                      AND completed_timestamp IS NOT NULL
                `, [tenant_id, start_date, end_date], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            
            return result?.avg_minutes || 0;
        },
        
        format: (value) => `${Math.round(value)} min`,
        
        thresholds: {
            good: 15,
            warning: 25,
            critical: 35
        },
        
        industries: ['restaurant', 'fast_food', 'catering'],
        minPlan: 'professional'
    },
    
    cancellation_rate: {
        id: 'cancellation_rate',
        category: 'efficiency',
        label: {
            ro: 'Rata Anulări',
            en: 'Cancellation Rate'
        },
        description: {
            ro: '% comenzi anulate din totalul comenzilor',
            en: '% cancelled orders out of total orders'
        },
        unit: 'percentage',
        chartType: 'line',
        defaultColor: '#dc3545',
        icon: '❌',
        
        calculate: async (ctx) => {
            const { tenant_id, start_date, end_date, db } = ctx;
            
            const cancelled = await new Promise((resolve, reject) => {
                db.get(`
                    SELECT COUNT(*) as count
                    FROM orders
                    WHERE tenant_id = ?
                      AND timestamp >= ?
                      AND timestamp <= ?
                      AND status = 'cancelled'
                `, [tenant_id, start_date, end_date], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            
            const total = await new Promise((resolve, reject) => {
                db.get(`
                    SELECT COUNT(*) as count
                    FROM orders
                    WHERE tenant_id = ?
                      AND timestamp >= ?
                      AND timestamp <= ?
                `, [tenant_id, start_date, end_date], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            
            if (!total?.count || total.count === 0) return 0;
            return (cancelled.count / total.count) * 100;
        },
        
        format: (value) => `${value.toFixed(2)}%`,
        
        thresholds: {
            good: 5,
            warning: 10,
            critical: 15
        },
        
        industries: ['restaurant', 'hotel', 'bar', 'fast_food', 'catering', 'event_venue'],
        minPlan: 'professional'
    },
    
    // ==================== HELPER/INTERNAL METRICS ====================
    
    total_discounts: {
        id: 'total_discounts',
        category: 'internal',
        label: {
            ro: 'Total Reduceri',
            en: 'Total Discounts'
        },
        unit: 'currency',
        
        calculate: async (ctx) => {
            const { tenant_id, start_date, end_date, db } = ctx;
            
            const result = await new Promise((resolve, reject) => {
                db.get(`
                    SELECT SUM(discount_amount) as discounts
                    FROM orders
                    WHERE tenant_id = ?
                      AND timestamp >= ?
                      AND timestamp <= ?
                `, [tenant_id, start_date, end_date], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            
            return result?.discounts || 0;
        },
        
        industries: ['restaurant', 'hotel', 'bar', 'fast_food', 'catering', 'event_venue'],
        minPlan: 'starter',
        hidden: true // Nu se afișează direct, e folosit doar pentru calcule
    },
    
    // ==================== TABLE EFFICIENCY METRICS ====================
    
    table_turnover: {
        id: 'table_turnover',
        category: 'efficiency',
        label: {
            ro: 'Rotație Mese',
            en: 'Table Turnover'
        },
        description: {
            ro: 'Număr mediu de grupuri servite per masă OCUPATĂ (nu toate mesele disponibile)',
            en: 'Average number of parties served per OCCUPIED table (not all available tables)'
        },
        unit: 'number',
        chartType: 'gauge',
        defaultColor: '#17a2b8',
        icon: '🔄',
        
        /**
         * Calculează rotația meselor: Total servings / Mese efectiv ocupate
         * 
         * IMPORTANT: Împarte la mese OCUPATE, nu la toate cele 200 disponibile!
         */
        calculate: async (ctx) => {
            const { tenant_id, start_date, end_date, db } = ctx;
            
            const result = await new Promise((resolve, reject) => {
                db.get(`
                    SELECT 
                        COUNT(*) as total_servings,
                        COUNT(DISTINCT table_id) as tables_actually_used
                    FROM table_sessions
                    WHERE tenant_id = ?
                      AND DATE(occupied_at) >= ?
                      AND DATE(occupied_at) <= ?
                      AND freed_at IS NOT NULL
                `, [tenant_id, start_date, end_date], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            
            // Împarte la mese EFECTIV OCUPATE, nu la toate 200!
            if (!result || result.tables_actually_used === 0) return 0;
            return result.total_servings / result.tables_actually_used;
        },
        
        format: (value, locale) => {
            return new Intl.NumberFormat(locale, {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1
            }).format(value);
        },
        
        thresholds: {
            low: 2.0,      // Rotație slabă (mese ocupate servesc puțin)
            medium: 3.0,   // Rotație OK
            target: 4.0,   // Rotație bună
            high: 5.0      // Rotație excelentă
        },
        
        insights: {
            low: {
                ro: 'Rotație scăzută. Mesele sunt ocupate prea mult timp. Verificați viteza serviciului.',
                en: 'Low turnover. Tables occupied too long. Check service speed.'
            },
            target: {
                ro: 'Rotație optimă! Echilibru bun între calitate și eficiență.',
                en: 'Optimal turnover! Good balance between quality and efficiency.'
            },
            high: {
                ro: 'Rotație foarte mare. Atenție: clienții pot fi grăbiți, verificați satisfacția.',
                en: 'Very high turnover. Caution: customers may be rushed, check satisfaction.'
            }
        },
        
        industries: ['restaurant', 'bar', 'fast_food'],
        minPlan: 'professional'
    },
    
    table_utilization: {
        id: 'table_utilization',
        category: 'efficiency',
        label: {
            ro: 'Utilizare Mese',
            en: 'Table Utilization'
        },
        description: {
            ro: 'Procent din mesele disponibile care au fost efectiv folosite (ex: 25 din 200 = 12.5%)',
            en: 'Percentage of available tables actually used (e.g. 25 of 200 = 12.5%)'
        },
        unit: 'percent',
        chartType: 'gauge',
        defaultColor: '#6610f2',
        icon: '📊',
        
        /**
         * Calculează utilizarea meselor: Mese folosite / Total mese disponibile (200)
         */
        calculate: async (ctx) => {
            const { tenant_id, start_date, end_date, db } = ctx;
            
            // Total mese disponibile (hardcodat 200, sau din config tenant)
            const total_available_tables = 200;
            
            const result = await new Promise((resolve, reject) => {
                db.get(`
                    SELECT COUNT(DISTINCT table_id) as tables_used
                    FROM table_sessions
                    WHERE tenant_id = ?
                      AND DATE(occupied_at) >= ?
                      AND DATE(occupied_at) <= ?
                      AND freed_at IS NOT NULL
                `, [tenant_id, start_date, end_date], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            
            if (!result || result.tables_used === 0) return 0;
            return (result.tables_used / total_available_tables) * 100;
        },
        
        format: (value, locale) => {
            return new Intl.NumberFormat(locale, {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1
            }).format(value) + '%';
        },
        
        thresholds: {
            low: 20,      // Folosești doar 20% din mese (multe goale)
            medium: 40,   // Folosești 40% din mese
            target: 60,   // Folosești 60% din mese (bună utilizare)
            high: 80      // Folosești 80% din mese (foarte bine!)
        },
        
        insights: {
            low: {
                ro: 'Utilizare scăzută a meselor. Mulțumesc multe mese rămân goale. Considerați marketing sau reducere spațiu.',
                en: 'Low table utilization. Many tables remain empty. Consider marketing or reducing space.'
            },
            target: {
                ro: 'Utilizare bună a capacității. Echilibru între disponibilitate și ocupare.',
                en: 'Good capacity utilization. Balance between availability and occupancy.'
            },
            high: {
                ro: 'Utilizare excelentă! Majoritatea meselor sunt folosite. Posibil să aveți cerere mai mare decât capacitate.',
                en: 'Excellent utilization! Most tables are used. You may have more demand than capacity.'
            }
        },
        
        industries: ['restaurant', 'bar', 'hotel'],
        minPlan: 'professional'
    },

    // ==========================================
    // ALIAS KPI-URI (pentru compatibilitate DB)
    // ==========================================

    /**
     * ALIAS: food_cost_pct → food_cost_percent
     */
    food_cost_pct: {
        id: 'food_cost_pct',
        label: {
            ro: 'Food Cost %',
            en: 'Food Cost %'
        },
        description: {
            ro: 'Procent cost alimente din venituri (alias pentru food_cost_percent)',
            en: 'Food cost percentage of revenue (alias for food_cost_percent)'
        },
        category: 'profit',
        unit: 'percent',
        icon: '🍽️',
        defaultColor: '#e67e22',
        industries: ['restaurant', 'hotel', 'bar', 'cafe'],
        minPlan: 'starter',
        calculate: async (ctx) => {
            // Redirect to food_cost_percent
            const foodCostPercent = KPI_REGISTRY['food_cost_percent'];
            if (foodCostPercent) {
                return foodCostPercent.calculate(ctx);
            }
            return 0;
        },
        format: (value) => `${value.toFixed(2)}%`,
        thresholds: {
            critical: 40,
            warning: 35,
            target: 30,
            good: 28
        }
    },

    /**
     * ALIAS: labor_cost_pct → labor_cost_percent
     */
    labor_cost_pct: {
        id: 'labor_cost_pct',
        label: {
            ro: 'Labor Cost %',
            en: 'Labor Cost %'
        },
        description: {
            ro: 'Procent cost forță de muncă din venituri (alias pentru labor_cost_percent)',
            en: 'Labor cost percentage of revenue (alias for labor_cost_percent)'
        },
        category: 'profit',
        unit: 'percent',
        icon: '👥',
        defaultColor: '#9b59b6',
        industries: ['restaurant', 'hotel', 'bar', 'cafe'],
        minPlan: 'starter',
        calculate: async (ctx) => {
            // Redirect to labor_cost_percent
            const laborCostPercent = KPI_REGISTRY['labor_cost_percent'];
            if (laborCostPercent) {
                return laborCostPercent.calculate(ctx);
            }
            return 0;
        },
        format: (value) => `${value.toFixed(2)}%`,
        thresholds: {
            critical: 35,
            warning: 32,
            target: 28,
            good: 25
        }
    },

    /**
     * KPI NOU: prime_cost_pct
     * Prime Cost % = (COGS + Labor Cost) / Revenue * 100
     */
    prime_cost_pct: {
        id: 'prime_cost_pct',
        label: {
            ro: 'Prime Cost %',
            en: 'Prime Cost %'
        },
        description: {
            ro: 'Procent cost prime (COGS + Labor) din venituri',
            en: 'Prime cost (COGS + Labor) percentage of revenue'
        },
        category: 'profit',
        unit: 'percent',
        icon: '📊',
        defaultColor: '#34495e',
        industries: ['restaurant', 'hotel', 'bar', 'cafe'],
        minPlan: 'professional',
        calculate: async (ctx) => {
            const { db, start_date, end_date } = ctx;
            
            // Get COGS
            const cogsKPI = KPI_REGISTRY['cogs'];
            const cogs = cogsKPI ? await cogsKPI.calculate(ctx) : 0;
            
            // Get Labor Cost
            const laborKPI = KPI_REGISTRY['labor_cost'];
            const laborCost = laborKPI ? await laborKPI.calculate(ctx) : 0;
            
            // Get Revenue
            const revenueKPI = KPI_REGISTRY['gross_revenue'];
            const revenue = revenueKPI ? await revenueKPI.calculate(ctx) : 0;
            
            if (revenue === 0) return 0;
            
            const primeCostPct = ((cogs + laborCost) / revenue) * 100;
            return Math.round(primeCostPct * 100) / 100;
        },
        format: (value) => `${value.toFixed(2)}%`,
        thresholds: {
            critical: 70,
            warning: 65,
            target: 60,
            good: 55
        }
    },

    /**
     * KPI NOU: net_margin_pct
     * Net Margin % = (Net Profit / Revenue) * 100
     */
    net_margin_pct: {
        id: 'net_margin_pct',
        label: {
            ro: 'Marjă Netă %',
            en: 'Net Margin %'
        },
        description: {
            ro: 'Procent profit net din venituri',
            en: 'Net profit percentage of revenue'
        },
        category: 'profit',
        unit: 'percent',
        icon: '💎',
        defaultColor: '#3498db',
        industries: ['restaurant', 'hotel', 'bar', 'cafe'],
        minPlan: 'professional',
        calculate: async (ctx) => {
            // Get Net Profit
            const netProfitKPI = KPI_REGISTRY['net_profit'];
            const netProfit = netProfitKPI ? await netProfitKPI.calculate(ctx) : 0;
            
            // Get Revenue
            const revenueKPI = KPI_REGISTRY['gross_revenue'];
            const revenue = revenueKPI ? await revenueKPI.calculate(ctx) : 0;
            
            if (revenue === 0) return 0;
            
            const netMarginPct = (netProfit / revenue) * 100;
            return Math.round(netMarginPct * 100) / 100;
        },
        format: (value) => `${value.toFixed(2)}%`,
        thresholds: {
            critical: 5,
            warning: 10,
            target: 15,
            good: 20
        }
    },

    /**
     * ALIAS: avg_rating → satisfaction_score
     */
    avg_rating: {
        id: 'avg_rating',
        label: {
            ro: 'Rating Mediu',
            en: 'Average Rating'
        },
        description: {
            ro: 'Scor mediu satisfacție clienți (alias pentru satisfaction_score)',
            en: 'Average customer satisfaction score (alias for satisfaction_score)'
        },
        category: 'customer',
        unit: 'score',
        icon: '⭐',
        defaultColor: '#f39c12',
        industries: ['restaurant', 'hotel', 'bar', 'cafe'],
        minPlan: 'starter',
        calculate: async (ctx) => {
            // Redirect to satisfaction_score
            const satisfactionKPI = KPI_REGISTRY['satisfaction_score'];
            if (satisfactionKPI) {
                return satisfactionKPI.calculate(ctx);
            }
            return 0;
        },
        format: (value) => `${value.toFixed(2)} / 5.00`,
        thresholds: {
            critical: 3.0,
            warning: 3.5,
            target: 4.0,
            good: 4.5
        }
    },

    /**
     * ALIAS: customer_retention_rate → customer_retention
     */
    customer_retention_rate: {
        id: 'customer_retention_rate',
        label: {
            ro: 'Rată Retenție Clienți',
            en: 'Customer Retention Rate'
        },
        description: {
            ro: 'Procent clienți care revin (alias pentru customer_retention)',
            en: 'Percentage of returning customers (alias for customer_retention)'
        },
        category: 'customer',
        unit: 'percent',
        icon: '🔄',
        defaultColor: '#16a085',
        industries: ['restaurant', 'hotel', 'bar', 'cafe'],
        minPlan: 'professional',
        calculate: async (ctx) => {
            // Redirect to customer_retention
            const retentionKPI = KPI_REGISTRY['customer_retention'];
            if (retentionKPI) {
                return retentionKPI.calculate(ctx);
            }
            return 0;
        },
        format: (value) => `${value.toFixed(2)}%`,
        thresholds: {
            critical: 20,
            warning: 30,
            target: 40,
            good: 50
        }
    }
};

/**
 * Returnează lista de KPI-uri disponibile pentru o industrie și plan
 */
function getAvailableKPIs(industry, plan) {
    const planLevels = { starter: 1, professional: 2, enterprise: 3 };
    const currentPlanLevel = planLevels[plan] || 0;
    
    return Object.values(KPI_REGISTRY).filter(kpi => {
        // Verifică industrie
        if (!kpi.industries.includes(industry)) return false;
        
        // Verifică plan
        const requiredLevel = planLevels[kpi.minPlan] || 0;
        if (currentPlanLevel < requiredLevel) return false;
        
        // Nu include KPI-urile hidden
        if (kpi.hidden) return false;
        
        return true;
    });
}

/**
 * Returnează un KPI după ID
 */
function getKPI(kpiId) {
    return KPI_REGISTRY[kpiId] || null;
}

/**
 * Returnează toate categoriile de KPI-uri
 */
function getKPICategories() {
    const categories = new Set();
    Object.values(KPI_REGISTRY).forEach(kpi => {
        if (!kpi.hidden) {
            categories.add(kpi.category);
        }
    });
    return Array.from(categories);
}

module.exports = {
    KPI_REGISTRY,
    getAvailableKPIs,
    getKPI,
    getKPICategories
};

