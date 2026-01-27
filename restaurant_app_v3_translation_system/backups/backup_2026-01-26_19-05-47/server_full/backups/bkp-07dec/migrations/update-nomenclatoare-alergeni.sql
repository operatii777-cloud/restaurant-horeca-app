-- ============================================================
-- ACTUALIZARE: NOMENCLATOARE & ALERGENI (Schema Existentă)
-- Data: 03 Noiembrie 2025
-- Versiune: v3.0.4
-- ============================================================

-- ============================================================
-- 1. ACTUALIZARE COTE TVA EXISTENTE (19% → 21%, 9% → 11%)
-- ============================================================

-- Actualizare TVA Standard: 19% → 21%
UPDATE vat_rates SET rate_percentage = 21.0 WHERE rate_code = 'S' AND rate_name = 'TVA Standard';

-- Actualizare TVA Redus: 9% → 11%
UPDATE vat_rates SET rate_percentage = 11.0 WHERE rate_code = 'R' AND rate_name = 'TVA Redus';

-- Dezactivare TVA Redus Special (5%) - nu mai e folosit în RO
UPDATE vat_rates SET is_active = 0 WHERE rate_code = 'RS' AND rate_percentage = 5;

-- ============================================================
-- 2. POPULARE UNITĂȚI DE MĂSURĂ (tabelul există, dar e gol)
-- ============================================================

INSERT OR IGNORE INTO units_of_measure (name, symbol, category, base_unit, conversion_factor, sort_order) VALUES
-- MASĂ (Mass/Weight)
('gram', 'g', 'mass', NULL, 1.0, 1),
('kilogram', 'kg', 'mass', 'g', 1000.0, 2),
('tonă', 't', 'mass', 'kg', 1000.0, 3),

-- VOLUM (Volume)
('mililitru', 'ml', 'volume', NULL, 1.0, 10),
('centilitru', 'cl', 'volume', 'ml', 10.0, 11),
('decilitru', 'dl', 'volume', 'ml', 100.0, 12),
('litru', 'l', 'volume', 'ml', 1000.0, 13),

-- BUCĂȚI (Count/Pieces)
('bucată', 'buc', 'count', NULL, 1.0, 20),
('pachet', 'pach', 'count', NULL, 1.0, 21),
('cutie', 'cutie', 'count', NULL, 1.0, 22),
('sticlă', 'sticlă', 'count', NULL, 1.0, 23),
('doză', 'doză', 'count', NULL, 1.0, 24),
('borcan', 'borcan', 'count', NULL, 1.0, 25),

-- HoReCa SPECIFIC
('porție', 'porție', 'horeca', NULL, 1.0, 30),
('farfurie', 'farfurie', 'horeca', NULL, 1.0, 31),
('ceașcă', 'ceașcă', 'horeca', NULL, 1.0, 32),
('pahar', 'pahar', 'horeca', NULL, 1.0, 33),
('lingură', 'lingură', 'horeca', NULL, 1.0, 34),
('linguriță', 'linguriță', 'horeca', NULL, 1.0, 35);

-- ============================================================
-- 3. CREARE TABEL ALERGENI (14 Alergeni Majori UE)
-- ============================================================

CREATE TABLE IF NOT EXISTS allergens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_ro TEXT NOT NULL,
    name_en TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    icon TEXT,
    icon_url TEXT,
    description_ro TEXT,
    description_en TEXT,
    color_hex TEXT DEFAULT '#FF9800',
    regulation_reference TEXT,
    severity TEXT DEFAULT 'medium',
    is_active INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_allergens_active ON allergens(is_active);
CREATE INDEX IF NOT EXISTS idx_allergens_code ON allergens(code);

-- ============================================================
-- 4. CREARE TABEL ASOCIERE INGREDIENTE ↔ ALERGENI
-- ============================================================

CREATE TABLE IF NOT EXISTS ingredient_allergens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ingredient_id INTEGER NOT NULL,
    allergen_id INTEGER NOT NULL,
    quantity_indicator TEXT DEFAULT 'contains',
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
    FOREIGN KEY (allergen_id) REFERENCES allergens(id) ON DELETE CASCADE,
    
    UNIQUE(ingredient_id, allergen_id)
);

CREATE INDEX IF NOT EXISTS idx_ingredient_allergens_ingredient ON ingredient_allergens(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_ingredient_allergens_allergen ON ingredient_allergens(allergen_id);

-- ============================================================
-- 5. SEED DATA - 14 ALERGENI MAJORI UE
-- ============================================================

INSERT OR IGNORE INTO allergens (name_ro, name_en, code, icon, description_ro, description_en, color_hex, regulation_reference, severity, sort_order) VALUES
('Cereale care conțin gluten', 'Cereals containing gluten', 'GLUTEN', '🌾', 'Grâu, secară, orz, ovăz, spelt, kamut sau soiurile lor hibridizate', 'Wheat, rye, barley, oats, spelt, kamut or their hybridised strains', '#FFA726', 'Regulamentul UE 1169/2011, Anexa II', 'high', 1),
('Crustacee', 'Crustaceans', 'CRUSTACEANS', '🦐', 'Creveți, raci, crabi, homari și produse derivate', 'Shrimps, prawns, crabs, lobsters and products thereof', '#FF7043', 'Regulamentul UE 1169/2011, Anexa II', 'high', 2),
('Ouă', 'Eggs', 'EGGS', '🥚', 'Ouă și produse pe bază de ouă', 'Eggs and egg products', '#FDD835', 'Regulamentul UE 1169/2011, Anexa II', 'high', 3),
('Pește', 'Fish', 'FISH', '🐟', 'Pește și produse pe bază de pește', 'Fish and fish products', '#42A5F5', 'Regulamentul UE 1169/2011, Anexa II', 'high', 4),
('Arahide', 'Peanuts', 'PEANUTS', '🥜', 'Arahide și produse pe bază de arahide', 'Peanuts and peanut products', '#D4A574', 'Regulamentul UE 1169/2011, Anexa II', 'critical', 5),
('Soia', 'Soybeans', 'SOYBEANS', '🌱', 'Soia și produse pe bază de soia', 'Soybeans and soy products', '#8BC34A', 'Regulamentul UE 1169/2011, Anexa II', 'medium', 6),
('Lapte', 'Milk', 'MILK', '🥛', 'Lapte și produse lactate (inclusiv lactoză)', 'Milk and dairy products (including lactose)', '#BBDEFB', 'Regulamentul UE 1169/2011, Anexa II', 'high', 7),
('Fructe cu coajă lemnoasă', 'Nuts', 'NUTS', '🌰', 'Migdale, alune, nuci, nuci de caju, nuci pecan, nuci Brazil, fistic, nuci macadamia', 'Almonds, hazelnuts, walnuts, cashews, pecans, Brazil nuts, pistachios, macadamia nuts', '#A1887F', 'Regulamentul UE 1169/2011, Anexa II', 'critical', 8),
('Țelină', 'Celery', 'CELERY', '🥬', 'Țelină și produse pe bază de țelină', 'Celery and celery products', '#AED581', 'Regulamentul UE 1169/2011, Anexa II', 'medium', 9),
('Muștar', 'Mustard', 'MUSTARD', '🌭', 'Muștar și produse pe bază de muștar', 'Mustard and mustard products', '#FFE082', 'Regulamentul UE 1169/2011, Anexa II', 'medium', 10),
('Semințe de susan', 'Sesame seeds', 'SESAME', '🌰', 'Semințe de susan și produse pe bază de semințe de susan', 'Sesame seeds and sesame products', '#FFAB91', 'Regulamentul UE 1169/2011, Anexa II', 'high', 11),
('Dioxid de sulf și sulfiți', 'Sulphur dioxide and sulphites', 'SULPHITES', '💨', 'În concentrații de peste 10 mg/kg sau 10 mg/litru', 'In concentrations of more than 10 mg/kg or 10 mg/litre', '#B0BEC5', 'Regulamentul UE 1169/2011, Anexa II', 'medium', 12),
('Lupin', 'Lupin', 'LUPIN', '🌼', 'Lupin și produse pe bază de lupin', 'Lupin and lupin products', '#CE93D8', 'Regulamentul UE 1169/2011, Anexa II', 'medium', 13),
('Moluște', 'Molluscs', 'MOLLUSCS', '🦑', 'Scoici, midii, stridii, melci, calmar și produse derivate', 'Mussels, oysters, snails, squid and products thereof', '#80DEEA', 'Regulamentul UE 1169/2011, Anexa II', 'high', 14);

-- ============================================================
-- 6. MODIFICARE TABEL MENU - Adaugă coloană allergens_computed
-- ============================================================

ALTER TABLE menu ADD COLUMN allergens_computed TEXT DEFAULT '[]';

-- ============================================================
-- MIGRARE COMPLETATĂ ✅
-- ============================================================

