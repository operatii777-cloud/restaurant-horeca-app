-- ================================================
-- MIGRATION: Create Suppliers Table
-- Data: 02 Noiembrie 2025
-- Descriere: Tabel pentru gestionarea furnizorilor
-- ================================================

-- Tabel principal furnizori
CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    cui TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    category TEXT NOT NULL CHECK(category IN ('legume', 'carne', 'lactate', 'bauturi', 'condimente', 'panificatie', 'altele')),
    payment_terms TEXT DEFAULT 'net30' CHECK(payment_terms IN ('cash', 'net15', 'net30', 'net60')),
    rating REAL DEFAULT 5.0 CHECK(rating >= 1.0 AND rating <= 5.0),
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index pentru căutări rapide
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_cui ON suppliers(cui);
CREATE INDEX IF NOT EXISTS idx_suppliers_category ON suppliers(category);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);

-- Trigger pentru actualizare automată updated_at
CREATE TRIGGER IF NOT EXISTS update_suppliers_timestamp 
AFTER UPDATE ON suppliers
BEGIN
    UPDATE suppliers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ================================================
-- Date de test (opțional)
-- ================================================

INSERT OR IGNORE INTO suppliers (name, cui, phone, email, address, category, payment_terms, rating, status, notes) VALUES
('Legume Fresh SRL', 'RO12345678', '0721234567', 'contact@legumefresh.ro', 'Str. Pieței nr. 10, București', 'legume', 'net30', 4.5, 'active', 'Furnizor principal legume și fructe proaspete'),
('Carmangerie Deluxe', 'RO23456789', '0732345678', 'comenzi@carmangerie.ro', 'Str. Abatorului nr. 5, Ilfov', 'carne', 'net15', 5.0, 'active', 'Carne de calitate superioară, livrări zilnice'),
('Lactate Premium', 'RO34567890', '0743456789', 'sales@lactatepremium.ro', 'Str. Fermierului nr. 20, Brașov', 'lactate', 'net30', 4.8, 'active', 'Produse lactate de la ferme locale'),
('Vinuri & Băuturi SA', 'RO45678901', '0754567890', 'office@vinuri-bauturi.ro', 'Bd. Vinului nr. 15, Cluj', 'bauturi', 'net60', 4.2, 'active', 'Distribuitor autorizat vinuri și băuturi'),
('Condimente Aromat', 'RO56789012', '0765678901', 'info@condimente-aromat.ro', 'Str. Mirodenii nr. 8, Timișoara', 'condimente', 'cash', 4.0, 'active', 'Condimente și mirodenii din import'),
('Brutăria Gustoasă', 'RO67890123', '0776789012', 'comenzi@brutaria-gustoasa.ro', 'Str. Pâinii nr. 3, București', 'panificatie', 'net15', 4.7, 'active', 'Produse de panificație proaspete zilnic');

-- ================================================
-- Verificare date inserate
-- ================================================

SELECT 'Suppliers table created successfully. Total suppliers: ' || COUNT(*) as status FROM suppliers;

