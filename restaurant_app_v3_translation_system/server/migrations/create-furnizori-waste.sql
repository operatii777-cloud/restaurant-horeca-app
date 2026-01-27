-- ============================================================
-- ETAPA 2: FURNIZORI + COMENZI FURNIZORI + WASTE MANAGEMENT
-- Data: 03 Noiembrie 2025
-- Versiune: v3.0.4
-- ============================================================

-- ============================================================
-- 1. FURNIZORI (Suppliers)
-- ============================================================

CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Date firmă
    company_name TEXT NOT NULL,
    cui TEXT UNIQUE,                    -- Cod Unic Identificare (ex: RO12345678)
    reg_com TEXT,                       -- Nr. Registrul Comerțului
    
    -- Adresă
    address_street TEXT,
    address_number TEXT,
    address_city TEXT,
    address_county TEXT,
    address_postal_code TEXT,
    address_country TEXT DEFAULT 'România',
    
    -- Contact
    phone TEXT,
    email TEXT,
    website TEXT,
    contact_person_name TEXT,
    contact_person_phone TEXT,
    contact_person_email TEXT,
    
    -- Financiar
    iban TEXT,
    bank_name TEXT,
    payment_terms INTEGER DEFAULT 30,  -- Zile plată (30, 60, 90)
    
    -- Categorii & Status
    categories TEXT DEFAULT '[]',       -- JSON array: ["alimente", "bauturi", "consumabile"]
    is_active INTEGER DEFAULT 1,
    is_preferred INTEGER DEFAULT 0,     -- Furnizor preferențial
    
    -- Rating & Evaluare
    rating_quality REAL DEFAULT 0,      -- 0-5 stele
    rating_delivery REAL DEFAULT 0,     -- 0-5 stele
    rating_price REAL DEFAULT 0,        -- 0-5 stele
    rating_service REAL DEFAULT 0,      -- 0-5 stele
    rating_avg REAL DEFAULT 0,          -- Medie
    total_reviews INTEGER DEFAULT 0,    -- Nr. evaluări
    
    -- Statistici
    total_orders INTEGER DEFAULT 0,     -- Total comenzi
    total_spent REAL DEFAULT 0,         -- Total cheltuieli (RON)
    last_order_date TEXT,               -- Data ultimei comenzi
    
    -- Metadata
    notes TEXT,                         -- Note interne
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers(is_active);
CREATE INDEX IF NOT EXISTS idx_suppliers_cui ON suppliers(cui);
CREATE INDEX IF NOT EXISTS idx_suppliers_preferred ON suppliers(is_preferred);

-- ============================================================
-- 2. COMENZI FURNIZORI (Supplier Orders)
-- ============================================================

CREATE TABLE IF NOT EXISTS supplier_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Referință
    order_number TEXT UNIQUE,           -- Ex: "OF-2025-001"
    supplier_id INTEGER NOT NULL,
    
    -- Detalii comandă
    order_date TEXT NOT NULL,           -- Data plasării comenzii
    expected_delivery_date TEXT,        -- Data livrare estimată
    actual_delivery_date TEXT,          -- Data livrare reală
    delivery_address TEXT,              -- Adresă livrare (restaurant/depozit)
    
    -- Financiar
    subtotal REAL DEFAULT 0,            -- Subtotal (fără TVA)
    vat_amount REAL DEFAULT 0,          -- TVA total
    total_amount REAL DEFAULT 0,        -- Total cu TVA
    payment_terms INTEGER DEFAULT 30,   -- Zile plată
    payment_due_date TEXT,              -- Scadență plată
    payment_status TEXT DEFAULT 'unpaid', -- 'unpaid', 'partial', 'paid'
    payment_date TEXT,                  -- Data plății
    
    -- Status & Tracking
    status TEXT DEFAULT 'draft',        -- 'draft', 'sent', 'confirmed', 'in_transit', 'delivered', 'cancelled'
    invoice_number TEXT,                -- Nr. factură furnizor (când se primește)
    invoice_received INTEGER DEFAULT 0, -- 1 = factură primită
    
    -- NIR Integration
    nir_id INTEGER,                     -- ID NIR generat automat la livrare
    nir_generated INTEGER DEFAULT 0,    -- 1 = NIR generat
    
    -- Discrepanțe
    has_discrepancies INTEGER DEFAULT 0, -- 1 = există diferențe livrare vs. comandă
    discrepancy_notes TEXT,             -- Note despre diferențe
    
    -- Metadata
    created_by TEXT,                    -- User care a creat comanda
    notes TEXT,                         -- Observații
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime')),
    
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT,
    FOREIGN KEY (nir_id) REFERENCES nir_documents(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_supplier_orders_supplier ON supplier_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_orders_status ON supplier_orders(status);
CREATE INDEX IF NOT EXISTS idx_supplier_orders_date ON supplier_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_supplier_orders_payment_status ON supplier_orders(payment_status);

-- ============================================================
-- 3. ITEMS COMANDĂ FURNIZOR (Supplier Order Items)
-- ============================================================

CREATE TABLE IF NOT EXISTS supplier_order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    supplier_order_id INTEGER NOT NULL,
    ingredient_id INTEGER NOT NULL,
    
    -- Cantități comandate
    quantity_ordered REAL NOT NULL,
    unit_of_measure TEXT NOT NULL,      -- Ex: "kg", "l", "buc"
    
    -- Cantități livrate (poate diferi de comandate)
    quantity_delivered REAL DEFAULT 0,
    quantity_missing REAL DEFAULT 0,    -- Lipsă
    quantity_damaged REAL DEFAULT 0,    -- Deteriorate
    
    -- Prețuri
    unit_price REAL NOT NULL,           -- Preț unitar (fără TVA)
    vat_rate REAL DEFAULT 11,           -- Cota TVA (11%, 21%, 0%)
    total_price REAL NOT NULL,          -- Total item (cu TVA)
    
    -- Metadata
    notes TEXT,                         -- Note per item
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    
    FOREIGN KEY (supplier_order_id) REFERENCES supplier_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_supplier_order_items_order ON supplier_order_items(supplier_order_id);
CREATE INDEX IF NOT EXISTS idx_supplier_order_items_ingredient ON supplier_order_items(ingredient_id);

-- ============================================================
-- 4. ASOCIERE FURNIZORI ↔ INGREDIENTE (pentru prețuri)
-- ============================================================

CREATE TABLE IF NOT EXISTS supplier_ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    supplier_id INTEGER NOT NULL,
    ingredient_id INTEGER NOT NULL,
    
    -- Prețuri & Condiții
    unit_price REAL NOT NULL,           -- Preț unitar actual
    unit_of_measure TEXT NOT NULL,      -- Unitatea (kg, l, buc)
    vat_rate REAL DEFAULT 11,           -- Cota TVA
    
    -- Condiții comenzi
    moq REAL,                           -- Minimum Order Quantity
    lead_time_days INTEGER,             -- Timp livrare (zile)
    
    -- Status
    is_preferred INTEGER DEFAULT 0,     -- 1 = furnizor preferențial pentru acest ingredient
    is_active INTEGER DEFAULT 1,
    
    -- Metadata
    last_price_update TEXT DEFAULT (datetime('now', 'localtime')),
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime')),
    
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
    
    UNIQUE(supplier_id, ingredient_id)
);

CREATE INDEX IF NOT EXISTS idx_supplier_ingredients_supplier ON supplier_ingredients(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_ingredients_ingredient ON supplier_ingredients(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_supplier_ingredients_preferred ON supplier_ingredients(is_preferred);

-- ============================================================
-- 5. WASTE MANAGEMENT (Pierderi & Waste)
-- ============================================================

CREATE TABLE IF NOT EXISTS waste_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Referință
    waste_type TEXT NOT NULL,           -- 'food', 'beverage', 'operational'
    waste_reason TEXT NOT NULL,         -- 'expired', 'damaged', 'theft', 'burnt', 'returned', 'sample', 'other'
    
    -- Item afectat
    item_type TEXT NOT NULL,            -- 'ingredient', 'product', 'other'
    item_id INTEGER,                    -- ID ingredient sau produs (NULL pentru 'other')
    item_name TEXT NOT NULL,            -- Nume (pentru rapoarte)
    
    -- Cantități
    quantity REAL NOT NULL,
    unit_of_measure TEXT NOT NULL,
    
    -- Costuri
    unit_cost REAL,                     -- Cost unitar (din NIR sau prețuri)
    total_cost REAL,                    -- Cost total = quantity × unit_cost
    
    -- Locație
    location_id INTEGER,                -- Gestiune/Locație (Bucătărie, Bar, etc.)
    
    -- Responsabil & Detalii
    reported_by TEXT,                   -- User care raportează
    responsible_person TEXT,            -- Responsabil (dacă e cazul)
    description TEXT,                   -- Descriere detaliată
    
    -- Dovezi
    photo_url TEXT,                     -- URL foto (opțional)
    
    -- Timestamp
    waste_date TEXT NOT NULL,           -- Data când a avut loc pierderea
    reported_at TEXT DEFAULT (datetime('now', 'localtime')),
    
    FOREIGN KEY (location_id) REFERENCES management_locations(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_waste_logs_type ON waste_logs(waste_type);
CREATE INDEX IF NOT EXISTS idx_waste_logs_reason ON waste_logs(waste_reason);
CREATE INDEX IF NOT EXISTS idx_waste_logs_date ON waste_logs(waste_date);
CREATE INDEX IF NOT EXISTS idx_waste_logs_location ON waste_logs(location_id);

-- ============================================================
-- 6. ISTORIC PREȚURI INGREDIENTE (pentru tracking)
-- ============================================================

CREATE TABLE IF NOT EXISTS ingredient_price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    ingredient_id INTEGER NOT NULL,
    supplier_id INTEGER,                -- NULL dacă e preț generic
    
    unit_price REAL NOT NULL,
    unit_of_measure TEXT NOT NULL,
    vat_rate REAL DEFAULT 11,
    
    source TEXT,                        -- 'nir', 'supplier_order', 'manual'
    source_id INTEGER,                  -- ID NIR sau comandă
    
    valid_from TEXT NOT NULL,
    valid_until TEXT,                   -- NULL = încă valid
    
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_price_history_ingredient ON ingredient_price_history(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_price_history_supplier ON ingredient_price_history(supplier_id);
CREATE INDEX IF NOT EXISTS idx_price_history_valid FROM ingredient_price_history(valid_from);

-- ============================================================
-- SEED DATA - FURNIZORI EXEMPLU
-- ============================================================

INSERT OR IGNORE INTO suppliers (company_name, cui, phone, email, categories, is_active, is_preferred, payment_terms, notes) VALUES
('Metro Cash & Carry', 'RO1234567', '0212345678', 'comenzi@metro.ro', '["alimente","bauturi","consumabile"]', 1, 1, 30, 'Furnizor principal pentru aprovizionare în masă'),
('Selgros Cash & Carry', 'RO2345678', '0313456789', 'contact@selgros.ro', '["alimente","bauturi"]', 1, 1, 30, 'Furnizor secundar, prețuri competitive'),
('Distribuitorul Local de Carne', 'RO3456789', '0723456789', 'comenzi@carneprost.ro', '["alimente"]', 1, 0, 14, 'Furnizor local carne proaspătă'),
('Brutăria Artizanală', 'RO4567890', '0734567890', 'contact@brutaria.ro', '["alimente"]', 1, 0, 7, 'Pâine și patiserie proaspătă zilnic'),
('Pepsi Romania', 'RO5678901', '0215678901', 'horeca@pepsi.ro', '["bauturi"]', 1, 0, 60, 'Distribui tor oficial Pepsi, Mirinda, 7UP');

-- ============================================================
-- SEED DATA - WASTE REASONS (pentru dropdown în UI)
-- ============================================================

-- Notă: Motivele de waste sunt în cod (enum), nu în DB separat
-- Motivele standard sunt:
-- 'expired' = Expirat/Alterat
-- 'damaged' = Deteriorat/Spart
-- 'theft' = Furt
-- 'burnt' = Ars/Pregătit greșit
-- 'returned' = Returnat de client
-- 'sample' = Probă/Degustare staff
-- 'inventory_discrepancy' = Diferență inventar
-- 'other' = Altele (cu descriere)

-- ============================================================
-- MIGRARE COMPLETATĂ ✅
-- ============================================================

