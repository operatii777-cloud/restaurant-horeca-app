-- ==================== WHITE-LABEL BI PLATFORM - MULTI-TENANT SCHEMA ====================
-- Transformare din single-tenant BI → Multi-tenant White-Label Platform
-- Data: 27 Octombrie 2025
-- Autor: Florin (Vibe Coding) + Claude Sonnet 4.5

-- ==================== CORE TENANT MANAGEMENT ====================

-- Tabela principală pentru tenants (restaurante, hoteluri, baruri, etc.)
CREATE TABLE IF NOT EXISTS tenants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_code TEXT UNIQUE NOT NULL,        -- ex: "bistro-123", "hotel-alpha"
    tenant_name TEXT NOT NULL,               -- ex: "Bistro Restaurant App"
    industry TEXT NOT NULL CHECK (industry IN ('restaurant', 'hotel', 'bar', 'fast_food', 'catering', 'cafe', 'club', 'spa')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial', 'cancelled')),
    subscription_plan TEXT DEFAULT 'starter' CHECK (subscription_plan IN ('starter', 'professional', 'enterprise', 'custom')),
    
    -- Contact & Billing
    owner_name TEXT,
    owner_email TEXT,
    owner_phone TEXT,
    billing_address TEXT,
    tax_id TEXT,                             -- CUI/CIF pentru România
    
    -- Settings
    currency TEXT DEFAULT 'RON',
    locale TEXT DEFAULT 'ro-RO',
    timezone TEXT DEFAULT 'Europe/Bucharest',
    
    -- Subscription dates
    trial_ends_at DATE,
    subscription_started_at DATE,
    subscription_expires_at DATE,
    
    -- Audit
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    last_login_at DATETIME
);

-- Index pentru performanță
CREATE INDEX IF NOT EXISTS idx_tenants_code ON tenants(tenant_code);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);

-- ==================== TENANT CONFIGURATION ====================

-- Configurare module și features per tenant
CREATE TABLE IF NOT EXISTS tenant_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER NOT NULL,
    
    -- Modules activation (JSONB-like TEXT pentru SQLite)
    modules TEXT NOT NULL,                   -- JSON: {"inventory":true,"delivery":false,"hr":true,"reservations":false}
    
    -- Features flags
    features TEXT NOT NULL,                  -- JSON: {"ai_insights":true,"forecasting":true,"multi_location":false}
    
    -- Industry-specific settings
    industry_settings TEXT,                  -- JSON: {"table_count":50,"room_count":0,"delivery_radius_km":10}
    
    -- Operational settings
    business_hours TEXT,                     -- JSON: {"open":"08:00","close":"03:00","days":[1,2,3,4,5,6,7]}
    fiscal_year_start TEXT DEFAULT '01-01', -- MM-DD format
    
    -- Audit
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
    UNIQUE(tenant_id)
);

-- ==================== TENANT KPI CONFIGURATION ====================

-- Configurare KPI-uri active per tenant (fabrică de metrice)
CREATE TABLE IF NOT EXISTS tenant_kpi_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER NOT NULL,
    kpi_key TEXT NOT NULL,                   -- ex: "gross_revenue", "labor_cost_pct", "prime_cost"
    
    -- Status & Display
    is_enabled BOOLEAN DEFAULT 1,
    display_order INTEGER DEFAULT 0,
    display_label TEXT,                      -- Custom label per tenant (ex: "Venituri Totale" vs "Total Sales")
    
    -- Thresholds (tenant-specific)
    target_value REAL,
    warning_threshold REAL,
    critical_threshold REAL,
    comparison_operator TEXT CHECK (comparison_operator IN ('>', '<', '>=', '<=', '=')),
    
    -- Visualization settings
    chart_type TEXT CHECK (chart_type IN ('line', 'bar', 'pie', 'gauge', 'number', 'trend')),
    color_scheme TEXT,                       -- ex: "#667eea,#764ba2" (gradient)
    
    -- Audit
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
    UNIQUE(tenant_id, kpi_key)
);

CREATE INDEX IF NOT EXISTS idx_tenant_kpi_config ON tenant_kpi_config(tenant_id, is_enabled);

-- ==================== TENANT BRANDING ====================

-- Branding & White-Label UI settings per tenant
CREATE TABLE IF NOT EXISTS tenant_branding (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id INTEGER NOT NULL,
    
    -- Brand Identity
    brand_name TEXT,
    logo_url TEXT,
    favicon_url TEXT,
    
    -- Color Scheme (JSON)
    colors TEXT NOT NULL,                    -- JSON: {"primary":"#667eea","secondary":"#764ba2","accent":"#f59e0b"}
    
    -- Typography
    font_family TEXT DEFAULT 'Inter, sans-serif',
    font_size_base TEXT DEFAULT '16px',
    
    -- Dashboard Layout
    layout_type TEXT DEFAULT 'default' CHECK (layout_type IN ('default', 'compact', 'executive', 'operational')),
    dashboard_modules TEXT,                  -- JSON: ordine module dashboard
    
    -- Custom CSS (optional)
    custom_css TEXT,
    
    -- Audit
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
    UNIQUE(tenant_id)
);

-- ==================== MIGRAȚIE TABELE BI EXISTENTE → MULTI-TENANT ====================

-- Adăugare tenant_id la TOATE tabelele BI existente
-- NOTE: SQLite doesn't support IF NOT EXISTS for ALTER TABLE, so indexes are created with IF NOT EXISTS

-- Indexes pentru tenant_id (idempotent - se creează doar dacă nu există)
CREATE INDEX IF NOT EXISTS idx_expenses_tenant ON expenses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bi_sales_summary_tenant ON bi_sales_summary(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bi_category_performance_tenant ON bi_category_performance(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bi_staff_performance_tenant ON bi_staff_performance(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bi_inventory_trends_tenant ON bi_inventory_trends(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bi_alerts_tenant ON bi_alerts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_staff_attendance_tenant ON staff_attendance(tenant_id);
CREATE INDEX IF NOT EXISTS idx_events_calendar_tenant ON events_calendar(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_tenant ON orders(tenant_id);

-- NOTE: Coloanele tenant_id sunt adăugate în database.js la inițializarea tabelelor
-- Dacă tabelele există deja fără tenant_id, rulează manual:
-- ALTER TABLE [table_name] ADD COLUMN tenant_id INTEGER DEFAULT 1 REFERENCES tenants(id);

-- ==================== KPI REGISTRY (Metrice Generice) ====================

-- Tabelă pentru registrul central de KPI-uri disponibile (global, nu per tenant)
CREATE TABLE IF NOT EXISTS kpi_registry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kpi_key TEXT UNIQUE NOT NULL,            -- ex: "gross_revenue", "prime_cost_pct"
    kpi_name TEXT NOT NULL,                  -- ex: "Gross Revenue", "Prime Cost %"
    kpi_category TEXT NOT NULL CHECK (kpi_category IN ('financial', 'operational', 'customer', 'hr', 'inventory')),
    
    -- Description & Calculation
    description TEXT,
    formula TEXT,                            -- ex: "SUM(orders.total) WHERE status='completed'"
    calculation_function TEXT,               -- ex: "calcGrossRevenue" (nume funcție din kpi-registry.js)
    
    -- Industry applicability
    industries TEXT NOT NULL,                -- JSON: ["restaurant","hotel","bar","cafe"]
    
    -- Dependencies (pentru KPI-uri calculate din alte KPI-uri)
    depends_on TEXT,                         -- JSON: ["gross_revenue","labor_cost"] (pentru prime_cost)
    
    -- Default settings
    default_target REAL,
    default_chart_type TEXT,
    unit TEXT DEFAULT '',                    -- ex: "RON", "%", "minutes", ""
    
    -- Audit
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Populare KPI Registry cu metrice standard
INSERT OR IGNORE INTO kpi_registry (kpi_key, kpi_name, kpi_category, description, calculation_function, industries, unit) VALUES
-- Financial KPIs
('gross_revenue', 'Gross Revenue', 'financial', 'Total revenue from sales', 'calcGrossRevenue', '["restaurant","hotel","bar","cafe","fast_food","catering"]', 'RON'),
('net_revenue', 'Net Revenue', 'financial', 'Revenue after discounts and refunds', 'calcNetRevenue', '["restaurant","hotel","bar","cafe","fast_food","catering"]', 'RON'),
('cogs', 'Cost of Goods Sold', 'financial', 'Direct cost of materials/ingredients', 'calcCOGS', '["restaurant","hotel","bar","cafe","fast_food","catering"]', 'RON'),
('labor_cost', 'Labor Cost', 'financial', 'Total employee wages and benefits', 'calcLaborCost', '["restaurant","hotel","bar","cafe","fast_food","catering","spa"]', 'RON'),
('prime_cost', 'Prime Cost', 'financial', 'COGS + Labor Cost', 'calcPrimeCost', '["restaurant","hotel","bar","cafe","fast_food","catering"]', 'RON'),
('gross_profit', 'Gross Profit', 'financial', 'Revenue - COGS', 'calcGrossProfit', '["restaurant","hotel","bar","cafe","fast_food","catering"]', 'RON'),
('net_profit', 'Net Profit', 'financial', 'Revenue - Total Costs', 'calcNetProfit', '["restaurant","hotel","bar","cafe","fast_food","catering","spa","club"]', 'RON'),
('food_cost_pct', 'Food Cost %', 'financial', 'COGS / Revenue × 100', 'calcFoodCostPct', '["restaurant","bar","cafe","fast_food","catering"]', '%'),
('labor_cost_pct', 'Labor Cost %', 'financial', 'Labor Cost / Revenue × 100', 'calcLaborCostPct', '["restaurant","hotel","bar","cafe","fast_food","catering","spa","club"]', '%'),
('prime_cost_pct', 'Prime Cost %', 'financial', 'Prime Cost / Revenue × 100', 'calcPrimeCostPct', '["restaurant","bar","cafe","fast_food","catering"]', '%'),
('gross_margin_pct', 'Gross Margin %', 'financial', 'Gross Profit / Revenue × 100', 'calcGrossMarginPct', '["restaurant","hotel","bar","cafe","fast_food","catering","spa","club"]', '%'),
('net_margin_pct', 'Net Margin %', 'financial', 'Net Profit / Revenue × 100', 'calcNetMarginPct', '["restaurant","hotel","bar","cafe","fast_food","catering","spa","club"]', '%'),
('break_even_revenue', 'Break-Even Revenue', 'financial', 'Revenue needed for zero profit', 'calcBreakEvenRevenue', '["restaurant","hotel","bar","cafe","fast_food","catering","spa","club"]', 'RON'),

-- Operational KPIs
('avg_order_value', 'Average Order Value', 'operational', 'Average revenue per transaction', 'calcAvgOrderValue', '["restaurant","bar","cafe","fast_food","catering"]', 'RON'),
('orders_count', 'Total Orders', 'operational', 'Number of completed orders', 'calcOrdersCount', '["restaurant","bar","cafe","fast_food","catering"]', ''),
('avg_fulfillment_time', 'Avg Fulfillment Time', 'operational', 'Average time from order to delivery', 'calcAvgFulfillmentTime', '["restaurant","bar","cafe","fast_food","catering"]', 'minutes'),
('cancellation_rate', 'Cancellation Rate', 'operational', 'Percentage of cancelled orders', 'calcCancellationRate', '["restaurant","bar","cafe","fast_food","catering"]', '%'),
('table_turnover_rate', 'Table Turnover Rate', 'operational', 'Average tables served per hour', 'calcTableTurnoverRate', '["restaurant","bar","cafe"]', 'per hour'),

-- Customer KPIs
('unique_customers', 'Unique Customers', 'customer', 'Number of unique clients', 'calcUniqueCustomers', '["restaurant","hotel","bar","cafe","fast_food","catering","spa","club"]', ''),
('customer_retention_rate', 'Customer Retention Rate', 'customer', 'Percentage of returning customers', 'calcCustomerRetentionRate', '["restaurant","hotel","bar","cafe","fast_food","catering","spa","club"]', '%'),
('avg_rating', 'Average Rating', 'customer', 'Average customer satisfaction score', 'calcAvgRating', '["restaurant","hotel","bar","cafe","fast_food","catering","spa","club"]', ''),
('nps_score', 'Net Promoter Score', 'customer', 'Customer loyalty metric (-100 to +100)', 'calcNPSScore', '["restaurant","hotel","bar","cafe","fast_food","catering","spa","club"]', ''),

-- HR KPIs
('revenue_per_employee', 'Revenue per Employee', 'hr', 'Total revenue / number of employees', 'calcRevenuePerEmployee', '["restaurant","hotel","bar","cafe","fast_food","catering","spa","club"]', 'RON'),
('sales_per_labor_hour', 'Sales per Labor Hour', 'hr', 'Revenue / total labor hours', 'calcSalesPerLaborHour', '["restaurant","bar","cafe","fast_food","catering"]', 'RON'),

-- Inventory KPIs
('inventory_turnover', 'Inventory Turnover', 'inventory', 'COGS / Average Inventory', 'calcInventoryTurnover', '["restaurant","bar","cafe","fast_food","catering"]', 'times'),
('waste_percentage', 'Waste Percentage', 'inventory', 'Waste cost / Total food cost × 100', 'calcWastePercentage', '["restaurant","bar","cafe","fast_food","catering"]', '%');

-- ==================== TENANT DATA SAMPLE (Pentru testing) ====================

-- Creează primul tenant (Restaurant App - restaurantul actual)
INSERT OR IGNORE INTO tenants (
    tenant_code, tenant_name, industry, status, subscription_plan,
    owner_name, owner_email, currency, locale, timezone,
    subscription_started_at, created_at
) VALUES (
    'trattoria-al-forno',
    'Restaurant App',
    'restaurant',
    'active',
    'enterprise',
    'Florin',
    'contact@trattoria.ro',
    'RON',
    'ro-RO',
    'Europe/Bucharest',
    '2025-01-01',
    datetime('now')
);

-- Configurare module pentru Trattoria
INSERT OR IGNORE INTO tenant_config (tenant_id, modules, features, industry_settings, business_hours) VALUES (
    1,
    '{"inventory":true,"delivery":true,"hr":true,"reservations":true,"fiscal":true,"loyalty":true}',
    '{"ai_insights":true,"forecasting":true,"multi_location":false,"white_label":true}',
    '{"table_count":200,"room_count":0,"delivery_radius_km":10,"kitchen_stations":3}',
    '{"open":"08:00","close":"03:00","days":[1,2,3,4,5,6,7]}'
);

-- Configurare KPI-uri pentru Trattoria (activează metricile esențiale)
INSERT OR IGNORE INTO tenant_kpi_config (tenant_id, kpi_key, is_enabled, display_order, target_value, warning_threshold, critical_threshold, comparison_operator, chart_type) VALUES
(1, 'gross_revenue', 1, 1, 50000, NULL, NULL, '>', 'line'),
(1, 'net_profit', 1, 2, 7500, 5000, 2500, '<', 'line'),
(1, 'food_cost_pct', 1, 3, 32, 35, 40, '>', 'gauge'),
(1, 'labor_cost_pct', 1, 4, 30, 35, 40, '>', 'gauge'),
(1, 'prime_cost_pct', 1, 5, 60, 65, 70, '>', 'gauge'),
(1, 'net_margin_pct', 1, 6, 12, 10, 5, '<', 'gauge'),
(1, 'avg_order_value', 1, 7, 120, NULL, NULL, '>', 'trend'),
(1, 'avg_rating', 1, 8, 4.5, 4.0, 3.5, '<', 'number'),
(1, 'customer_retention_rate', 1, 9, 65, 50, 30, '<', 'trend');

-- Branding pentru Trattoria
INSERT OR IGNORE INTO tenant_branding (tenant_id, brand_name, colors, layout_type) VALUES (
    1,
    'Restaurant App',
    '{"primary":"#667eea","secondary":"#764ba2","accent":"#f59e0b","success":"#10b981","warning":"#f59e0b","danger":"#ef4444"}',
    'executive'
);

-- ==================== VERIFICARE INTEGRITATE ====================
-- După executare, rulează:
-- SELECT COUNT(*) FROM tenants; -- Trebuie să fie >= 1
-- SELECT COUNT(*) FROM tenant_config; -- Trebuie să fie >= 1
-- SELECT COUNT(*) FROM tenant_kpi_config; -- Trebuie să fie >= 9
-- SELECT COUNT(*) FROM kpi_registry; -- Trebuie să fie >= 23

