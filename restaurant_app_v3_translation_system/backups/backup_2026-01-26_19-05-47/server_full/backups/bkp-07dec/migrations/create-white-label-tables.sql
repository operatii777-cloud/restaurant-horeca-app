-- ==================== MIGRARE TABELE WHITE LABEL ====================
-- Data: 02 Noiembrie 2025
-- Descriere: Creează toate tabelele necesare pentru modulele WHITE LABEL

-- ==================== CASH SESSIONS ====================
CREATE TABLE IF NOT EXISTS cash_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    initial_fund REAL NOT NULL DEFAULT 0,
    final_cash REAL DEFAULT 0,
    difference REAL DEFAULT 0,
    operator_name TEXT NOT NULL,
    notes TEXT,
    difference_notes TEXT,
    opened_at DATETIME NOT NULL,
    closed_at DATETIME,
    status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'closed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index pentru performanță
CREATE INDEX IF NOT EXISTS idx_cash_sessions_status ON cash_sessions(status);
CREATE INDEX IF NOT EXISTS idx_cash_sessions_opened_at ON cash_sessions(opened_at);

-- ==================== SUPPLIER ORDERS ====================
CREATE TABLE IF NOT EXISTS supplier_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT NOT NULL UNIQUE,
    supplier_id INTEGER NOT NULL,
    delivery_date DATE,
    total_value REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'pending', 'approved', 'ordered', 'delivered', 'cancelled')),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS supplier_order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit TEXT NOT NULL,
    price REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES supplier_orders(id) ON DELETE CASCADE
);

-- Index pentru performanță
CREATE INDEX IF NOT EXISTS idx_supplier_orders_status ON supplier_orders(status);
CREATE INDEX IF NOT EXISTS idx_supplier_orders_supplier ON supplier_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_order_items_order ON supplier_order_items(order_id);

-- ==================== VOUCHERS ====================
CREATE TABLE IF NOT EXISTS vouchers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK(type IN ('percentage', 'fixed', 'gift')),
    value REAL NOT NULL,
    start_date DATE,
    expiry_date DATE NOT NULL,
    max_uses INTEGER NOT NULL DEFAULT 1,
    used_count INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'used', 'expired', 'cancelled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index pentru performanță
CREATE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers(code);
CREATE INDEX IF NOT EXISTS idx_vouchers_status ON vouchers(status);
CREATE INDEX IF NOT EXISTS idx_vouchers_expiry ON vouchers(expiry_date);

-- ==================== VOUCHER USAGE LOG ====================
CREATE TABLE IF NOT EXISTS voucher_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    voucher_id INTEGER NOT NULL,
    order_id INTEGER,
    used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    discount_amount REAL,
    FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_voucher_usage_voucher ON voucher_usage(voucher_id);
CREATE INDEX IF NOT EXISTS idx_voucher_usage_order ON voucher_usage(order_id);

-- ==================== VERIFICARE TABELE SUPPLIERS ====================
-- Asigură-te că tabela suppliers există (ar trebui să existe deja)
CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    cui TEXT,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    category TEXT,
    payment_terms TEXT,
    rating INTEGER DEFAULT 0 CHECK(rating >= 0 AND rating <= 5),
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index pentru performanță
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_category ON suppliers(category);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);

-- ==================== VERIFICARE TABELE PRODUCTS ====================
-- Asigură-te că tabela products are coloana barcode
-- Această comandă va eșua dacă coloana există deja, dar e OK
-- SQLite nu suportă IF NOT EXISTS pentru ADD COLUMN
-- Vom verifica în cod dacă coloana există

-- ==================== INSERARE DATE DEMO (OPȚIONAL) ====================

-- Inserare furnizori demo dacă nu există
INSERT OR IGNORE INTO suppliers (name, cui, contact_person, phone, email, address, category, rating, status, notes) VALUES
('Mega Fresh SRL', 'RO12345678', 'Ion Popescu', '0722123456', 'contact@megafresh.ro', 'Str. Exemplu 1, București', 'Legume & Fructe', 5, 'active', 'Furnizor principal pentru produse proaspete.'),
('Carne Premium SA', 'RO87654321', 'Elena Georgescu', '0733987654', 'sales@carnepremium.ro', 'Bd. Industriei 10, Ilfov', 'Carne', 4, 'active', 'Calitate excelentă, livrare rapidă.'),
('Lactate Naturale SRL', 'RO11223344', 'Andrei Vasilescu', '0744112233', 'office@lactatenaturale.ro', 'Calea Lactatelor 5, Brașov', 'Lactate', 5, 'active', 'Produse bio, prețuri bune.'),
('Pâinea Bunicii', 'RO55667788', 'Maria Ionescu', '0755445566', 'comenzi@paineabunicii.ro', 'Str. Morii 20, Ploiești', 'Panificație', 3, 'active', 'Furnizor local, produse tradiționale.'),
('Băuturi Răcoritoare SRL', 'RO99887766', 'George Dumitrescu', '0766778899', 'contact@bauturi.ro', 'Șos. Principală 15, Constanța', 'Băuturi', 4, 'active', 'Gamă variată de băuturi, discount la volum.'),
('Ambalaje Eco SA', 'RO44332211', 'Cristina Popa', '0777112233', 'info@ambalajeeco.ro', 'Str. Reciclării 3, Cluj-Napoca', 'Ambalaje', 5, 'active', 'Ambalaje biodegradabile, partener de încredere.');

-- Inserare vouchere demo
INSERT OR IGNORE INTO vouchers (code, type, value, start_date, expiry_date, max_uses, used_count, description, status) VALUES
('SUMMER2025', 'percentage', 20, '2025-06-01', '2025-08-31', 100, 0, 'Reducere 20% pentru sezonul de vară', 'active'),
('WELCOME10', 'percentage', 10, '2025-01-01', '2025-12-31', 500, 0, 'Reducere 10% pentru clienți noi', 'active'),
('GIFT50', 'fixed', 50, NULL, '2025-12-31', 1, 0, 'Bon cadou 50 RON', 'active'),
('BLACKFRIDAY', 'percentage', 30, '2025-11-20', '2025-11-30', 200, 0, 'Black Friday - 30% reducere', 'active');

-- ==================== TRIGGER-E PENTRU UPDATED_AT ====================

-- Trigger pentru cash_sessions
CREATE TRIGGER IF NOT EXISTS update_cash_sessions_timestamp 
AFTER UPDATE ON cash_sessions
BEGIN
    UPDATE cash_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger pentru supplier_orders
CREATE TRIGGER IF NOT EXISTS update_supplier_orders_timestamp 
AFTER UPDATE ON supplier_orders
BEGIN
    UPDATE supplier_orders SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger pentru vouchers
CREATE TRIGGER IF NOT EXISTS update_vouchers_timestamp 
AFTER UPDATE ON vouchers
BEGIN
    UPDATE vouchers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger pentru suppliers
CREATE TRIGGER IF NOT EXISTS update_suppliers_timestamp 
AFTER UPDATE ON suppliers
BEGIN
    UPDATE suppliers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ==================== VERIFICARE AUTO-EXPIRARE VOUCHERE ====================
-- Trigger pentru a marca automat voucherele expirate
CREATE TRIGGER IF NOT EXISTS auto_expire_vouchers
AFTER INSERT ON vouchers
BEGIN
    UPDATE vouchers 
    SET status = 'expired' 
    WHERE DATE(expiry_date) < DATE('now') 
    AND status = 'active';
END;

-- ==================== FINALIZARE ====================
-- Migrare completă!
SELECT 'Migrare WHITE LABEL completă! Toate tabelele au fost create.' as message;

