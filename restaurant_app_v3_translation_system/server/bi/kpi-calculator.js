// bi/kpi-calculator.js
// FAZA 2B - Săptămâna 3: KPI Calculator cu dependency resolver

/**
 * KPI Calculator - Calculează KPI-uri cu rezolvare automată de dependencies
 * 
 * Features:
 * - Dependency resolver: calculează KPI-urile în ordinea corectă
 * - Cache: evită recalculări
 * - Error handling: skip KPI-uri cu erori, continuă cu restul
 * - Circular dependency detection
 * 
 * Data: 27 Octombrie 2025
 * Versiune: 1.0.0
 */

const { KPI_REGISTRY, getKPI, getAvailableKPIs } = require('./kpi-registry');

class KPICalculator {
    constructor(db) {
        this.db = db;
        this.cache = new Map();
        this.calculating = new Set(); // Pentru detectare circular dependencies
    }
    
    /**
     * Calculează un singur KPI
     */
    async calculateKPI(kpiId, ctx) {
        // Verifică cache
        if (this.cache.has(kpiId)) {
            return this.cache.get(kpiId);
        }
        
        // Detectare circular dependency
        if (this.calculating.has(kpiId)) {
            throw new Error(`Circular dependency detected: ${kpiId}`);
        }
        
        const kpi = getKPI(kpiId);
        if (!kpi) {
            throw new Error(`KPI not found: ${kpiId}`);
        }
        
        this.calculating.add(kpiId);
        
        try {
            // Dacă are dependencies, calculează-le mai întâi
            const calculatedDeps = {};
            if (kpi.dependencies && kpi.dependencies.length > 0) {
                for (const depId of kpi.dependencies) {
                    calculatedDeps[depId] = await this.calculateKPI(depId, ctx);
                }
            }
            
            // Calculează KPI-ul curent
            const value = await kpi.calculate(
                { ...ctx, db: this.db },
                calculatedDeps
            );
            
            // Salvează în cache
            this.cache.set(kpiId, value);
            this.calculating.delete(kpiId);
            
            return value;
            
        } catch (error) {
            this.calculating.delete(kpiId);
            throw error;
        }
    }
    
    /**
     * Calculează multiple KPI-uri (cu dependencies rezolvate automat)
     */
    async calculateMultiple(kpiIds, ctx) {
        const results = {};
        const errors = {};
        
        for (const kpiId of kpiIds) {
            try {
                results[kpiId] = await this.calculateKPI(kpiId, ctx);
            } catch (error) {
                console.error(`[KPI Calculator] Error calculating ${kpiId}:`, error.message);
                errors[kpiId] = error.message;
                results[kpiId] = null;
            }
        }
        
        return { results, errors };
    }
    
    /**
     * Calculează toate KPI-urile active pentru un tenant
     */
    async calculateAll(tenantId, startDate, endDate) {
        // Obține configurația tenant-ului
        const tenantConfig = await new Promise((resolve, reject) => {
            this.db.get(`
                SELECT 
                    t.industry,
                    t.subscription_plan,
                    t.currency,
                    t.locale,
                    tc.modules
                FROM tenants t
                LEFT JOIN tenant_config tc ON t.id = tc.tenant_id
                WHERE t.id = ?
            `, [tenantId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (!tenantConfig) {
            throw new Error(`Tenant not found for tenant_id: ${tenantId}`);
        }
        
        // SANDBOX: tenant_kpi_config has DIFFERENT structure (row-per-KPI, not JSON blob)
        // Adapt to read from row-based structure and convert to JSON-style
        let enabledKPIs = [];
        let kpiCustomization = {};
        
        try {
            const kpiRows = await new Promise((resolve, reject) => {
                this.db.all(`
                    SELECT kpi_key, is_enabled, display_label, target_value, 
                           warning_threshold, critical_threshold, chart_type, color_scheme
                    FROM tenant_kpi_config
                    WHERE tenant_id = ? AND is_enabled = 1
                    ORDER BY display_order
                `, [tenantId], (err, rows) => {
                    if (err) {
                        // If table doesn't exist or wrong structure, return empty
                        if (err.message.includes('no such table') || err.message.includes('no such column')) {
                            resolve([]);
                        } else {
                            reject(err);
                        }
                    } else {
                        resolve(rows || []);
                    }
                });
            });
            
            // Convert row-based structure to JSON-style
            if (kpiRows && kpiRows.length > 0) {
                enabledKPIs = kpiRows.map(row => row.kpi_key);
                kpiCustomization = kpiRows.reduce((acc, row) => {
                    acc[row.kpi_key] = {
                        label_ro: row.display_label || undefined,
                        target: row.target_value || undefined,
                        thresholds: {
                            warning: row.warning_threshold || undefined,
                            critical: row.critical_threshold || undefined
                        },
                        chartType: row.chart_type || undefined,
                        color: row.color_scheme || undefined
                    };
                    return acc;
                }, {});
            }
        } catch (error) {
            console.warn('[KPI Calculator] ⚠️  Could not read tenant_kpi_config, using all available KPIs');
            enabledKPIs = [];
            kpiCustomization = {};
        }
        
        // Dacă nu sunt KPI-uri configurate, folosește toate KPI-urile disponibile pentru industrie
        const kpiIds = enabledKPIs.length > 0 
            ? enabledKPIs 
            : getAvailableKPIs(tenantConfig.industry, tenantConfig.subscription_plan).map(k => k.id);
        
        // Context pentru calcule
        const ctx = {
            tenant_id: tenantId,
            start_date: startDate,
            end_date: endDate,
            industry: tenantConfig.industry,
            modules: JSON.parse(tenantConfig.modules || '{}')
        };
        
        // Calculează toate KPI-urile
        const { results, errors } = await this.calculateMultiple(kpiIds, ctx);
        
        // Construiește răspunsul cu metadata
        const metrics = [];
        
        for (const kpiId of kpiIds) {
            const kpiDef = getKPI(kpiId);
            if (!kpiDef) continue;
            
            const value = results[kpiId];
            const customization = kpiCustomization[kpiId] || {};
            
            metrics.push({
                kpi: kpiId,
                category: kpiDef.category,
                label: {
                    ro: customization.label_ro || kpiDef.label.ro,
                    en: customization.label_en || kpiDef.label.en
                },
                value: value,
                formatted: value !== null ? kpiDef.format(value, tenantConfig.locale || 'ro-RO', tenantConfig.currency || 'RON') : 'N/A',
                unit: kpiDef.unit,
                chartType: customization.chart_type || kpiDef.chartType,
                color: customization.color || kpiDef.defaultColor,
                icon: customization.icon || kpiDef.icon,
                thresholds: customization.thresholds || kpiDef.thresholds || null,
                status: this._getKPIStatus(value, customization.thresholds || kpiDef.thresholds),
                is_visible: customization.is_visible !== false, // default true
                error: errors[kpiId] || null
            });
        }
        
        return {
            tenant_id: tenantId,
            industry: tenantConfig.industry,
            period: {
                start: startDate,
                end: endDate
            },
            metrics,
            summary: {
                total: metrics.length,
                successful: metrics.filter(m => m.value !== null).length,
                failed: metrics.filter(m => m.value === null).length
            }
        };
    }
    
    /**
     * Determină status-ul unui KPI bazat pe thresholds
     */
    _getKPIStatus(value, thresholds) {
        if (!thresholds || value === null) return 'neutral';
        
        const { good, warning, critical } = thresholds;
        
        // Logică inversă pentru cost metrics (mai mic = mai bun)
        const isInverse = thresholds.inverse === true;
        
        if (isInverse) {
            if (value <= good) return 'good';
            if (value <= warning) return 'warning';
            return 'critical';
        } else {
            if (value >= good) return 'good';
            if (value >= warning) return 'warning';
            return 'critical';
        }
    }
    
    /**
     * Salvează rezultatele în bi_daily_metrics
     * ADAPTED FOR SANDBOX: Safe fallback if table doesn't exist (template deployment)
     * IMPORTANT: bi_daily_metrics are structură cu coloane fixe, nu generică
     */
    async saveToDailyMetrics(tenantId, date, metrics) {
        // SANDBOX: Tabelul bi_daily_metrics poate să nu existe (template deployment)
        // Încercăm să salvăm, dar dacă tabelul lipsește, nu dăm throw
        try {
            // Coloane disponibile în bi_daily_metrics (hardcoded, din migration)
            const availableColumns = [
                'tenant_id', 'date',
                'gross_revenue', 'net_revenue', 'cogs', 'labor_cost', 'overhead_cost',
                'prime_cost', 'gross_profit', 'net_profit', 'profit_margin',
                'total_orders', 'avg_order_value', 'completed_orders', 'cancelled_orders',
                'cancellation_rate', 'unique_customers', 'returning_customers',
                'customer_retention_rate', 'avg_order_time', 'table_turnover',
                'avg_rating', 'nps_score'
            ];
            
            // Construiește un obiect cu valorile pentru coloanele disponibile
            const values = {
                tenant_id: tenantId,
                date: date
            };
            
            for (const metric of metrics) {
                if (metric.value !== null && availableColumns.includes(metric.kpi)) {
                    values[metric.kpi] = metric.value;
                }
            }
            
            // Dacă nu avem nicio valoare de salvat (doar tenant_id și date), skip
            if (Object.keys(values).length <= 2) {
                console.log('[KPI Calculator] No valid columns to save in bi_daily_metrics');
                return;
            }
            
            // Construiește INSERT dinamic
            const columns = Object.keys(values);
            const placeholders = columns.map(() => '?').join(', ');
            const columnNames = columns.join(', ');
            const updateClauses = columns
                .filter(c => c !== 'tenant_id' && c !== 'date')
                .map(c => `${c} = excluded.${c}`)
                .join(', ');
            
            return new Promise((resolve, reject) => {
                this.db.run(`
                    INSERT INTO bi_daily_metrics (${columnNames})
                    VALUES (${placeholders})
                    ON CONFLICT(tenant_id, date) DO UPDATE SET
                        ${updateClauses},
                        computed_at = CURRENT_TIMESTAMP
                `, Object.values(values), (err) => {
                    if (err) {
                        // SAFE: Dacă tabelul nu există, loghează warning dar nu da throw
                        if (err.message.includes('no such table')) {
                            console.warn('[KPI Calculator] ⚠️  bi_daily_metrics table not found (OK for template deployment)');
                            resolve(); // Continue fără eroare
                        } else {
                            console.error('[KPI Calculator] Error saving to bi_daily_metrics:', err.message);
                            reject(err);
                        }
                    } else {
                        resolve();
                    }
                });
            });
        } catch (error) {
            // SAFE: Orice altă eroare, loghează dar nu oprește execuția
            console.warn('[KPI Calculator] ⚠️  Could not save to bi_daily_metrics:', error.message);
            return; // Continue
        }
    }
    
    /**
     * Salvează rezultatele în bi_monthly_metrics
     * ADAPTED FOR SANDBOX: Safe fallback if table doesn't exist (template deployment)
     * IMPORTANT: bi_monthly_metrics are structură cu coloane fixe, nu generică
     */
    async saveToMonthlyMetrics(tenantId, month, metrics) {
        // SANDBOX: Tabelul bi_monthly_metrics poate să nu existe (template deployment)
        // Încercăm să salvăm, dar dacă tabelul lipsește, nu dăm throw
        try {
            // Coloane disponibile în bi_monthly_metrics (aceleași ca daily)
            const availableColumns = [
                'tenant_id', 'month',
                'gross_revenue', 'net_revenue', 'cogs', 'labor_cost', 'overhead_cost',
                'prime_cost', 'gross_profit', 'net_profit', 'profit_margin',
                'total_orders', 'avg_order_value', 'completed_orders', 'cancelled_orders',
                'cancellation_rate', 'unique_customers', 'returning_customers',
                'customer_retention_rate', 'avg_order_time', 'table_turnover',
                'avg_rating', 'nps_score'
            ];
            
            // Construiește un obiect cu valorile pentru coloanele disponibile
            const values = {
                tenant_id: tenantId,
                month: month
            };
            
            for (const metric of metrics) {
                if (metric.value !== null && availableColumns.includes(metric.kpi)) {
                    values[metric.kpi] = metric.value;
                }
            }
            
            // Dacă nu avem nicio valoare de salvat, skip
            if (Object.keys(values).length <= 2) {
                console.log('[KPI Calculator] No valid columns to save in bi_monthly_metrics');
                return;
            }
            
            // Construiește INSERT dinamic
            const columns = Object.keys(values);
            const placeholders = columns.map(() => '?').join(', ');
            const columnNames = columns.join(', ');
            const updateClauses = columns
                .filter(c => c !== 'tenant_id' && c !== 'month')
                .map(c => `${c} = excluded.${c}`)
                .join(', ');
            
            return new Promise((resolve, reject) => {
                this.db.run(`
                    INSERT INTO bi_monthly_metrics (${columnNames})
                    VALUES (${placeholders})
                    ON CONFLICT(tenant_id, month) DO UPDATE SET
                        ${updateClauses},
                        computed_at = CURRENT_TIMESTAMP
                `, Object.values(values), (err) => {
                    if (err) {
                        // SAFE: Dacă tabelul nu există, loghează warning dar nu da throw
                        if (err.message.includes('no such table')) {
                            console.warn('[KPI Calculator] ⚠️  bi_monthly_metrics table not found (OK for template deployment)');
                            resolve(); // Continue fără eroare
                        } else {
                            console.error('[KPI Calculator] Error saving to bi_monthly_metrics:', err.message);
                            reject(err);
                        }
                    } else {
                        resolve();
                    }
                });
            });
        } catch (error) {
            // SAFE: Orice altă eroare, loghează dar nu oprește execuția
            console.warn('[KPI Calculator] ⚠️  Could not save to bi_monthly_metrics:', error.message);
            return; // Continue
        }
    }
    
    /**
     * Clearuiește cache-ul
     */
    clearCache() {
        this.cache.clear();
        this.calculating.clear();
    }
}

/**
 * Factory function pentru a crea o instanță de calculator
 */
function createKPICalculator(db) {
    return new KPICalculator(db);
}

module.exports = {
    KPICalculator,
    createKPICalculator
};

