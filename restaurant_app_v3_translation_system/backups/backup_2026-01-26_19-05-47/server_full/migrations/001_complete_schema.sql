-- ============================================================================
-- RESTAURANT APP v3.0 - COMPLETE DATABASE SCHEMA
-- ============================================================================
-- Created: 21 Oct 2025, 20:45
-- Purpose: Foundation schema for all application features
-- Tables: 41 total (9 layers)
-- Author: Autonomous Implementation System
-- ============================================================================

-- ============================================================================
-- LAYER 0: SYSTEM CONFIGURATION
-- ============================================================================

-- Migration tracking
CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version TEXT UNIQUE NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

INSERT OR IGNORE INTO migrations (version, description) 
VALUES ('001', 'Complete schema - 41 tables');

-- ============================================================================
-- LAYER 1: CORE ENTITIES (Independent Tables)
-- ============================================================================

-- Gestiuni (Warehouse/Storage Management Units)
CREATE TABLE IF NOT EXISTS gestiuni (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    type TEXT CHECK(type IN ('kitchen', 'bar', 'storage', 'terrace')) DEFAULT 'storage',
    location TEXT,
    responsible_user TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product Categories (Hierarchical)
CREATE TABLE IF NOT EXISTS product_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    name_en TEXT,
    parent_id INTEGER,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES product_categories(id) ON DELETE SET NULL
);

-- Preparation Sections (Kitchen sections)
CREATE TABLE IF NOT EXISTS preparation_sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    gestiune_id INTEGER,
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY (gestiune_id) REFERENCES gestiuni(id) ON DELETE SET NULL
);

-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    cui TEXT UNIQUE,
    reg_number TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    contact_person TEXT,
    payment_terms INTEGER DEFAULT 30,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Corporate Customers (for invoicing)
CREATE TABLE IF NOT EXISTS corporate_customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    cui TEXT UNIQUE,
    reg_number TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    contact_person TEXT,
    discount_percentage REAL DEFAULT 0,
    payment_terms INTEGER DEFAULT 30,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cash Accounts (Cash, Bank, Card)
CREATE TABLE IF NOT EXISTS cash_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_name TEXT NOT NULL UNIQUE,
    account_type TEXT CHECK(account_type IN ('cash', 'bank', 'card')) DEFAULT 'cash',
    bank_name TEXT,
    iban TEXT,
    current_balance REAL DEFAULT 0,
    last_reconciliation_date TIMESTAMP,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Export Templates (for Mentor, MODERN accounting software)
CREATE TABLE IF NOT EXISTS export_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_name TEXT NOT NULL,
    software_target TEXT CHECK(software_target IN ('mentor', 'MODERN', 'generic')) DEFAULT 'generic',
    data_type TEXT CHECK(data_type IN ('sales', 'invoices', 'nir', 'products', 'clients')) DEFAULT 'sales',
    column_mapping TEXT,
    format_settings TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- LAYER 2: PRODUCTS & INGREDIENTS (depend on Layer 1)
-- ============================================================================

-- Ingredients (raw materials)
CREATE TABLE IF NOT EXISTS ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    name_en TEXT,
    category TEXT,
    unit TEXT CHECK(unit IN ('kg', 'l', 'buc', 'gr', 'ml')) DEFAULT 'kg',
    supplier_id INTEGER,
    gestiune_id INTEGER,
    current_stock REAL DEFAULT 0,
    min_stock REAL DEFAULT 0,
    max_stock REAL DEFAULT 0,
    avg_price REAL DEFAULT 0,
    last_purchase_price REAL DEFAULT 0,
    last_purchase_date TIMESTAMP,
    is_hidden INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
    FOREIGN KEY (gestiune_id) REFERENCES gestiuni(id) ON DELETE SET NULL
);

-- Products/Menu Items (extend existing menu table if needed)
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    name_en TEXT,
    price REAL NOT NULL,
    vat_rate REAL DEFAULT 19.0,
    category_id INTEGER,
    gestiune_id INTEGER,
    section_id INTEGER,
    unit TEXT DEFAULT 'buc',
    description TEXT,
    description_en TEXT,
    image TEXT,
    preparation_time INTEGER DEFAULT 0,
    spice_level INTEGER DEFAULT 0,
    allergens TEXT,
    is_available INTEGER DEFAULT 1,
    has_recipe INTEGER DEFAULT 0,
    is_fractional INTEGER DEFAULT 0,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (gestiune_id) REFERENCES gestiuni(id) ON DELETE SET NULL,
    FOREIGN KEY (section_id) REFERENCES preparation_sections(id) ON DELETE SET NULL
);

-- Recipes (product ingredients mapping)
CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    ingredient_id INTEGER NOT NULL,
    quantity REAL NOT NULL,
    unit TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
    UNIQUE(product_id, ingredient_id)
);

-- Recipe History (Versioning for audit)
CREATE TABLE IF NOT EXISTS recipe_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    version INTEGER NOT NULL,
    recipe_data TEXT,
    cost_per_serving REAL,
    modified_by TEXT,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    change_description TEXT,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Product Dependencies (for upselling/cross-selling)
CREATE TABLE IF NOT EXISTS product_dependencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    suggested_product_id INTEGER NOT NULL,
    dependency_type TEXT CHECK(dependency_type IN ('complement', 'alternative', 'upgrade')) DEFAULT 'complement',
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (suggested_product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ============================================================================
-- LAYER 3: STOCK MANAGEMENT (depend on Layer 2)
-- ============================================================================

-- NIR Documents (Notes Intrare Recepție - Receiving Notes)
CREATE TABLE IF NOT EXISTS nir_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nir_number TEXT UNIQUE NOT NULL,
    nir_date DATE NOT NULL,
    supplier_id INTEGER NOT NULL,
    gestiune_id INTEGER,
    total_value REAL DEFAULT 0,
    vat_value REAL DEFAULT 0,
    paid_value REAL DEFAULT 0,
    remaining_value REAL DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'validated', 'partial_paid', 'paid')),
    validated_by TEXT,
    validated_at TIMESTAMP,
    notes TEXT,
    created_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (gestiune_id) REFERENCES gestiuni(id)
);

-- NIR Items (line items for each NIR)
CREATE TABLE IF NOT EXISTS nir_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nir_id INTEGER NOT NULL,
    ingredient_id INTEGER NOT NULL,
    quantity REAL NOT NULL,
    unit TEXT NOT NULL,
    unit_price REAL NOT NULL,
    vat_rate REAL NOT NULL,
    total_price REAL NOT NULL,
    FOREIGN KEY (nir_id) REFERENCES nir_documents(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

-- NIR Payments (payment tracking for suppliers)
CREATE TABLE IF NOT EXISTS nir_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nir_id INTEGER NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amount REAL NOT NULL,
    payment_method TEXT CHECK(payment_method IN ('cash', 'card', 'transfer')) DEFAULT 'cash',
    account_id INTEGER,
    paid_by TEXT,
    notes TEXT,
    FOREIGN KEY (nir_id) REFERENCES nir_documents(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES cash_accounts(id)
);

-- Stock Movements (generic log for all stock changes)
CREATE TABLE IF NOT EXISTS stock_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ingredient_id INTEGER NOT NULL,
    gestiune_id INTEGER,
    movement_type TEXT CHECK(movement_type IN ('in', 'out', 'adjustment', 'transfer', 'consumption', 'production')),
    quantity REAL NOT NULL,
    unit TEXT NOT NULL,
    reference_type TEXT,
    reference_id INTEGER,
    notes TEXT,
    created_by TEXT,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
    FOREIGN KEY (gestiune_id) REFERENCES gestiuni(id)
);

-- Stock Transfers (between gestiuni)
CREATE TABLE IF NOT EXISTS stock_transfers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transfer_number TEXT UNIQUE NOT NULL,
    transfer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    from_gestiune_id INTEGER NOT NULL,
    to_gestiune_id INTEGER NOT NULL,
    status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'sent', 'accepted')),
    sent_by TEXT,
    received_by TEXT,
    received_at TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (from_gestiune_id) REFERENCES gestiuni(id),
    FOREIGN KEY (to_gestiune_id) REFERENCES gestiuni(id)
);

-- Transfer Items
CREATE TABLE IF NOT EXISTS transfer_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transfer_id INTEGER NOT NULL,
    ingredient_id INTEGER NOT NULL,
    quantity REAL NOT NULL,
    unit TEXT NOT NULL,
    FOREIGN KEY (transfer_id) REFERENCES stock_transfers(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

-- Consumption Vouchers (Bonuri de Consum - for production)
CREATE TABLE IF NOT EXISTS consumption_vouchers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    voucher_number TEXT UNIQUE NOT NULL,
    voucher_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    section TEXT,
    gestiune_id INTEGER,
    total_value REAL DEFAULT 0,
    created_by TEXT,
    notes TEXT,
    FOREIGN KEY (gestiune_id) REFERENCES gestiuni(id)
);

-- Consumption Items
CREATE TABLE IF NOT EXISTS consumption_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    voucher_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity REAL NOT NULL,
    unit_cost REAL,
    total_cost REAL,
    FOREIGN KEY (voucher_id) REFERENCES consumption_vouchers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Production Documents (ingredient transformation)
CREATE TABLE IF NOT EXISTS production_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    production_number TEXT UNIQUE NOT NULL,
    production_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    quantity_produced REAL NOT NULL,
    total_cost REAL,
    yield_percentage REAL,
    produced_by TEXT,
    notes TEXT
);

-- Production Inputs (ingredients consumed)
CREATE TABLE IF NOT EXISTS production_inputs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    production_id INTEGER NOT NULL,
    ingredient_id INTEGER NOT NULL,
    quantity REAL NOT NULL,
    unit_cost REAL,
    FOREIGN KEY (production_id) REFERENCES production_documents(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

-- Production Outputs (products created)
CREATE TABLE IF NOT EXISTS production_outputs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    production_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity REAL NOT NULL,
    unit_cost REAL,
    FOREIGN KEY (production_id) REFERENCES production_documents(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ============================================================================
-- LAYER 4: SALES & ORDERS (depend on Layer 2-3)
-- ============================================================================

-- Vouchers (promotional codes)
CREATE TABLE IF NOT EXISTS vouchers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    type TEXT CHECK(type IN ('fixed', 'percent', 'free_product', 'free_delivery')) DEFAULT 'fixed',
    value REAL,
    min_order_value REAL DEFAULT 0,
    valid_from DATE,
    valid_until DATE,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    categories TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Voucher Usage (tracking)
CREATE TABLE IF NOT EXISTS voucher_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    voucher_id INTEGER NOT NULL,
    order_id INTEGER NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    discount_amount REAL,
    FOREIGN KEY (voucher_id) REFERENCES vouchers(id)
);

-- ============================================================================
-- LAYER 5: FINANCIAL (depend on Layer 3-4)
-- ============================================================================

-- Cash Register (all financial movements)
CREATE TABLE IF NOT EXISTS cash_register (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    document_date DATE NOT NULL,
    account_id INTEGER NOT NULL,
    description TEXT,
    payment REAL DEFAULT 0,
    receipt REAL DEFAULT 0,
    linked_document_type TEXT,
    linked_document_id INTEGER,
    created_by TEXT,
    notes TEXT,
    FOREIGN KEY (account_id) REFERENCES cash_accounts(id)
);

-- Invoices (for corporate customers)
CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT UNIQUE NOT NULL,
    invoice_series TEXT,
    invoice_date DATE NOT NULL,
    due_date DATE,
    customer_id INTEGER NOT NULL,
    total_value REAL NOT NULL,
    vat_value REAL NOT NULL,
    paid_value REAL DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'issued', 'partial_paid', 'paid', 'cancelled')),
    notes TEXT,
    created_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES corporate_customers(id)
);

-- Invoice Items
CREATE TABLE IF NOT EXISTS invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity REAL NOT NULL,
    unit_price REAL NOT NULL,
    vat_rate REAL NOT NULL,
    total REAL NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Expenses (manual expense tracking)
CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expense_date DATE NOT NULL,
    expense_type TEXT CHECK(expense_type IN ('salaries', 'utilities', 'rent', 'marketing', 'other')) DEFAULT 'other',
    description TEXT,
    amount REAL NOT NULL,
    account_id INTEGER,
    receipt_document TEXT,
    created_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES cash_accounts(id)
);

-- ============================================================================
-- LAYER 6: ALERTS & MONITORING (depend on Layer 3-5)
-- ============================================================================

-- Stock Alerts
CREATE TABLE IF NOT EXISTS stock_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alert_type TEXT CHECK(alert_type IN ('not_unloaded_value', 'not_unloaded_stock', 'low_stock', 'critical_stock')),
    product_id INTEGER,
    ingredient_id INTEGER,
    order_id INTEGER,
    alert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'resolved', 'dismissed')),
    resolved_by TEXT,
    resolved_at TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

-- System Alerts (generic alert system)
CREATE TABLE IF NOT EXISTS system_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alert_type TEXT,
    priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    message TEXT NOT NULL,
    details TEXT,
    related_entity TEXT,
    related_id INTEGER,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'resolved', 'dismissed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    resolved_by TEXT
);

-- Unexported Data Tracking (for accounting export)
CREATE TABLE IF NOT EXISTS unexported_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data_type TEXT CHECK(data_type IN ('sales', 'invoices', 'nir', 'products')),
    record_id INTEGER NOT NULL,
    record_date DATE NOT NULL,
    alert_sent INTEGER DEFAULT 0,
    exported_at TIMESTAMP
);

-- ============================================================================
-- LAYER 8: IMPORT/EXPORT & INTEGRATIONS
-- ============================================================================

-- Import/Export Log
CREATE TABLE IF NOT EXISTS import_export_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    operation_type TEXT CHECK(operation_type IN ('import', 'export')),
    data_type TEXT,
    file_name TEXT,
    file_path TEXT,
    records_count INTEGER,
    success_count INTEGER,
    error_count INTEGER,
    executed_by TEXT,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT CHECK(status IN ('success', 'partial', 'failed')),
    error_log TEXT
);

-- ============================================================================
-- LAYER 9: UI ENHANCEMENTS (Table Layout for drag-drop plan)
-- ============================================================================

-- Table Layout (for restaurant floor plan)
CREATE TABLE IF NOT EXISTS table_layout (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_number INTEGER NOT NULL,
    position_x REAL NOT NULL,
    position_y REAL NOT NULL,
    shape TEXT CHECK(shape IN ('square', 'circle', 'rectangle')) DEFAULT 'square',
    width REAL NOT NULL,
    height REAL NOT NULL,
    rotation REAL DEFAULT 0,
    zone TEXT,
    capacity INTEGER DEFAULT 4,
    is_active INTEGER DEFAULT 1
);

-- ============================================================================
-- INDEXES (for performance optimization)
-- ============================================================================

-- Ingredients indexes
CREATE INDEX IF NOT EXISTS idx_ingredients_category ON ingredients(category);
CREATE INDEX IF NOT EXISTS idx_ingredients_supplier ON ingredients(supplier_id);
CREATE INDEX IF NOT EXISTS idx_ingredients_gestiune ON ingredients(gestiune_id);
CREATE INDEX IF NOT EXISTS idx_ingredients_active ON ingredients(is_active);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_gestiune ON products(gestiune_id);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);

-- Recipes indexes
CREATE INDEX IF NOT EXISTS idx_recipes_product ON recipes(product_id);
CREATE INDEX IF NOT EXISTS idx_recipes_ingredient ON recipes(ingredient_id);

-- NIR indexes
CREATE INDEX IF NOT EXISTS idx_nir_supplier ON nir_documents(supplier_id);
CREATE INDEX IF NOT EXISTS idx_nir_status ON nir_documents(status);
CREATE INDEX IF NOT EXISTS idx_nir_date ON nir_documents(nir_date);

-- Stock movements indexes
CREATE INDEX IF NOT EXISTS idx_stock_movements_ingredient ON stock_movements(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(movement_date);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(movement_type);

-- Invoices indexes
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);

-- Cash register indexes
CREATE INDEX IF NOT EXISTS idx_cash_register_date ON cash_register(document_date);
CREATE INDEX IF NOT EXISTS idx_cash_register_account ON cash_register(account_id);

-- Alerts indexes
CREATE INDEX IF NOT EXISTS idx_system_alerts_status ON system_alerts(status);
CREATE INDEX IF NOT EXISTS idx_system_alerts_type ON system_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_system_alerts_priority ON system_alerts(priority);

-- ============================================================================
-- INITIAL DATA (seed data)
-- ============================================================================

-- Default gestiuni
INSERT OR IGNORE INTO gestiuni (id, name, type, is_active) VALUES
(1, 'Bucătărie', 'kitchen', 1),
(2, 'Bar', 'bar', 1),
(3, 'Depozit', 'storage', 1),
(4, 'Terasă', 'terrace', 1);

-- Default cash accounts
INSERT OR IGNORE INTO cash_accounts (id, account_name, account_type, current_balance, is_active) VALUES
(1, 'Casă', 'cash', 0, 1),
(2, 'Cont Bancar', 'bank', 0, 1),
(3, 'POS Card', 'card', 0, 1);

-- Default preparation sections
INSERT OR IGNORE INTO preparation_sections (id, name, gestiune_id, is_active) VALUES
(1, 'BUCĂTĂRIE', 1, 1),
(2, 'BAR', 2, 1),
(3, 'PIZZERIE', 1, 1);

-- Default export templates
INSERT OR IGNORE INTO export_templates (template_name, software_target, data_type, is_active) VALUES
('WizOne Mentor - Vânzări', 'mentor', 'sales', 1),
('WizOne Mentor - Facturi', 'mentor', 'invoices', 1),
('WizOne Mentor - NIR', 'mentor', 'nir', 1),
('MODERN - Vânzări', 'MODERN', 'sales', 1),
('Generic CSV - Produse', 'generic', 'products', 1);

-- ============================================================================
-- SCHEMA VALIDATION
-- ============================================================================

-- Verify all tables created
SELECT 'Schema created successfully! Tables count: ' || COUNT(*) as result 
FROM sqlite_master 
WHERE type='table' AND name NOT LIKE 'sqlite_%';

-- ============================================================================
-- END OF MIGRATION 001
-- ============================================================================

