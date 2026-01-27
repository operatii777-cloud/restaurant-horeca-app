-- ============================================================
-- ETAPA 2: FURNIZORI + COMENZI FURNIZORI + WASTE MANAGEMENT (v2 - Fixed)
-- Data: 03 Noiembrie 2025
-- Versiune: v3.0.4
-- ============================================================

-- ============================================================
-- 1. FURNIZORI (Suppliers) - DROP & RECREATE
-- ============================================================

DROP TABLE IF EXISTS suppliers;

CREATE TABLE suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    cui TEXT UNIQUE,
    reg_com TEXT,
    address_street TEXT,
    address_number TEXT,
    address_city TEXT,
    address_county TEXT,
    address_postal_code TEXT,
    address_country TEXT DEFAULT 'România',
    phone TEXT,
    email TEXT,
    website TEXT,
    contact_person_name TEXT,
    contact_person_phone TEXT,
    contact_person_email TEXT,
    iban TEXT,
    bank_name TEXT,
    payment_terms INTEGER DEFAULT 30,
    categories TEXT DEFAULT '[]',
    is_active INTEGER DEFAULT 1,
    is_preferred INTEGER DEFAULT 0,
    rating_quality REAL DEFAULT 0,
    rating_delivery REAL DEFAULT 0,
    rating_price REAL DEFAULT 0,
    rating_service REAL DEFAULT 0,
    rating_avg REAL DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_spent REAL DEFAULT 0,
    last_order_date TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX idx_suppliers_active ON suppliers(is_active);
CREATE INDEX idx_suppliers_cui ON suppliers(cui);
CREATE INDEX idx_suppliers_preferred ON suppliers(is_preferred);

-- ============================================================
-- 2. COMENZI FURNIZORI
-- ============================================================

CREATE TABLE IF NOT EXISTS supplier_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT UNIQUE,
    supplier_id INTEGER NOT NULL,
    order_date TEXT NOT NULL,
    expected_delivery_date TEXT,
    actual_delivery_date TEXT,
    delivery_address TEXT,
    subtotal REAL DEFAULT 0,
    vat_amount REAL DEFAULT 0,
    total_amount REAL DEFAULT 0,
    payment_terms INTEGER DEFAULT 30,
    payment_due_date TEXT,
    payment_status TEXT DEFAULT 'unpaid',
    payment_date TEXT,
    status TEXT DEFAULT 'draft',
    invoice_number TEXT,
    invoice_received INTEGER DEFAULT 0,
    nir_id INTEGER,
    nir_generated INTEGER DEFAULT 0,
    has_discrepancies INTEGER DEFAULT 0,
    discrepancy_notes TEXT,
    created_by TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT
);

CREATE INDEX idx_supplier_orders_supplier ON supplier_orders(supplier_id);
CREATE INDEX idx_supplier_orders_status ON supplier_orders(status);
CREATE INDEX idx_supplier_orders_date ON supplier_orders(order_date);

-- ============================================================
-- 3. ITEMS COMANDĂ FURNIZOR
-- ============================================================

CREATE TABLE IF NOT EXISTS supplier_order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_order_id INTEGER NOT NULL,
    ingredient_id INTEGER NOT NULL,
    quantity_ordered REAL NOT NULL,
    unit_of_measure TEXT NOT NULL,
    quantity_delivered REAL DEFAULT 0,
    quantity_missing REAL DEFAULT 0,
    quantity_damaged REAL DEFAULT 0,
    unit_price REAL NOT NULL,
    vat_rate REAL DEFAULT 11,
    total_price REAL NOT NULL,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (supplier_order_id) REFERENCES supplier_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE RESTRICT
);

CREATE INDEX idx_supplier_order_items_order ON supplier_order_items(supplier_order_id);
CREATE INDEX idx_supplier_order_items_ingredient ON supplier_order_items(ingredient_id);

-- ============================================================
-- 4. ASOCIERE FURNIZORI ↔ INGREDIENTE
-- ============================================================

CREATE TABLE IF NOT EXISTS supplier_ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_id INTEGER NOT NULL,
    ingredient_id INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    unit_of_measure TEXT NOT NULL,
    vat_rate REAL DEFAULT 11,
    moq REAL,
    lead_time_days INTEGER,
    is_preferred INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    last_price_update TEXT DEFAULT (datetime('now', 'localtime')),
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
    UNIQUE(supplier_id, ingredient_id)
);

CREATE INDEX idx_supplier_ingredients_supplier ON supplier_ingredients(supplier_id);
CREATE INDEX idx_supplier_ingredients_ingredient ON supplier_ingredients(ingredient_id);
CREATE INDEX idx_supplier_ingredients_preferred ON supplier_ingredients(is_preferred);

-- ============================================================
-- 5. WASTE MANAGEMENT
-- ============================================================

CREATE TABLE IF NOT EXISTS waste_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    waste_type TEXT NOT NULL,
    waste_reason TEXT NOT NULL,
    item_type TEXT NOT NULL,
    item_id INTEGER,
    item_name TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit_of_measure TEXT NOT NULL,
    unit_cost REAL,
    total_cost REAL,
    location_id INTEGER,
    reported_by TEXT,
    responsible_person TEXT,
    description TEXT,
    photo_url TEXT,
    waste_date TEXT NOT NULL,
    reported_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (location_id) REFERENCES management_locations(id) ON DELETE SET NULL
);

CREATE INDEX idx_waste_logs_type ON waste_logs(waste_type);
CREATE INDEX idx_waste_logs_reason ON waste_logs(waste_reason);
CREATE INDEX idx_waste_logs_date ON waste_logs(waste_date);
CREATE INDEX idx_waste_logs_location ON waste_logs(location_id);

-- ============================================================
-- 6. ISTORIC PREȚURI INGREDIENTE
-- ============================================================

CREATE TABLE IF NOT EXISTS ingredient_price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ingredient_id INTEGER NOT NULL,
    supplier_id INTEGER,
    unit_price REAL NOT NULL,
    unit_of_measure TEXT NOT NULL,
    vat_rate REAL DEFAULT 11,
    source TEXT,
    source_id INTEGER,
    valid_from TEXT NOT NULL,
    valid_until TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

CREATE INDEX idx_price_history_ingredient ON ingredient_price_history(ingredient_id);
CREATE INDEX idx_price_history_supplier ON ingredient_price_history(supplier_id);
CREATE INDEX idx_price_history_date ON ingredient_price_history(valid_from);

-- ============================================================
-- SEED DATA - FURNIZORI EXEMPLU
-- ============================================================

INSERT INTO suppliers (company_name, cui, phone, email, categories, is_active, is_preferred, payment_terms, notes) VALUES
('Metro Cash & Carry', 'RO1234567', '0212345678', 'comenzi@metro.ro', '["alimente","bauturi","consumabile"]', 1, 1, 30, 'Furnizor principal pentru aprovizionare în masă'),
('Selgros Cash & Carry', 'RO2345678', '0313456789', 'contact@selgros.ro', '["alimente","bauturi"]', 1, 1, 30, 'Furnizor secundar, prețuri competitive'),
('Distribuitorul Local de Carne', 'RO3456789', '0723456789', 'comenzi@carneprost.ro', '["alimente"]', 1, 0, 14, 'Furnizor local carne proaspătă'),
('Brutăria Artizanală', 'RO4567890', '0734567890', 'contact@brutaria.ro', '["alimente"]', 1, 0, 7, 'Pâine și patiserie proaspătă zilnic'),
('Pepsi Romania', 'RO5678901', '0215678901', 'horeca@pepsi.ro', '["bauturi"]', 1, 0, 60, 'Distribuitor oficial Pepsi, Mirinda, 7UP');

-- ============================================================
-- MIGRARE ETAPA 2 COMPLETATĂ ✅
-- ============================================================

