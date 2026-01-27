-- ============================================================
-- MIGRARE: NOMENCLATOARE & ALERGENI
-- Data: 03 Noiembrie 2025
-- Versiune: v3.0.4
-- ============================================================

-- ============================================================
-- 1. UNITĂȚI DE MĂSURĂ (Units of Measure)
-- ============================================================

CREATE TABLE IF NOT EXISTS units_of_measure (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,          -- Ex: "kilogram", "litru", "bucată"
    symbol TEXT NOT NULL UNIQUE,        -- Ex: "kg", "l", "buc"
    category TEXT NOT NULL,             -- "mass", "volume", "count", "horeca"
    base_unit TEXT,                     -- Unitatea de bază pentru conversii (ex: "g" pentru "kg")
    conversion_factor REAL DEFAULT 1.0, -- Factor de conversie (ex: 1 kg = 1000 g)
    is_active INTEGER DEFAULT 1,        -- 1 = activ, 0 = inactiv
    sort_order INTEGER DEFAULT 0,       -- Pentru sortare în UI
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- Index pentru performanță
CREATE INDEX IF NOT EXISTS idx_units_category ON units_of_measure(category);
CREATE INDEX IF NOT EXISTS idx_units_active ON units_of_measure(is_active);

-- ============================================================
-- 2. COTE TVA (VAT Rates)
-- ============================================================

CREATE TABLE IF NOT EXISTS vat_rates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,                 -- Ex: "TVA Standard", "TVA Redus"
    rate REAL NOT NULL,                 -- Ex: 21, 11, 0
    description TEXT,                   -- Ex: "Cota standard pentru majoritatea produselor"
    applicable_to TEXT,                 -- Ex: "Băuturi alcoolice, servicii generale"
    is_default INTEGER DEFAULT 0,       -- 1 = cota implicită
    is_active INTEGER DEFAULT 1,        -- 1 = activ, 0 = inactiv
    country_code TEXT DEFAULT 'RO',     -- Cod țară (pentru multi-țări în viitor)
    valid_from TEXT,                    -- Data de la care e validă
    valid_until TEXT,                   -- Data până când e validă (NULL = indefinit)
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- Index pentru performanță
CREATE INDEX IF NOT EXISTS idx_vat_active ON vat_rates(is_active);
CREATE INDEX IF NOT EXISTS idx_vat_default ON vat_rates(is_default);
CREATE INDEX IF NOT EXISTS idx_vat_country ON vat_rates(country_code);

-- ============================================================
-- 3. ALERGENI (Allergens) - 14 Alergeni Majori UE
-- ============================================================

CREATE TABLE IF NOT EXISTS allergens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_ro TEXT NOT NULL,              -- Nume în română
    name_en TEXT NOT NULL,              -- Nume în engleză
    code TEXT NOT NULL UNIQUE,          -- Cod unic (ex: "GLUTEN", "EGGS", "MILK")
    icon TEXT,                          -- Emoji sau unicode icon (ex: "🌾", "🥚", "🥛")
    icon_url TEXT,                      -- URL imagine icon (opțional)
    description_ro TEXT,                -- Descriere în română
    description_en TEXT,                -- Descriere în engleză
    color_hex TEXT DEFAULT '#FF9800',   -- Culoare pentru UI (hex)
    regulation_reference TEXT,          -- Referință legislație (ex: "Regulamentul UE 1169/2011")
    severity TEXT DEFAULT 'medium',     -- "low", "medium", "high", "critical"
    is_active INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- Index pentru performanță
CREATE INDEX IF NOT EXISTS idx_allergens_active ON allergens(is_active);
CREATE INDEX IF NOT EXISTS idx_allergens_code ON allergens(code);

-- ============================================================
-- 4. ASOCIERE INGREDIENTE ↔ ALERGENI
-- ============================================================

CREATE TABLE IF NOT EXISTS ingredient_allergens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ingredient_id INTEGER NOT NULL,
    allergen_id INTEGER NOT NULL,
    quantity_indicator TEXT,            -- "contains", "may_contain", "traces"
    notes TEXT,                         -- Note suplimentare
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
    FOREIGN KEY (allergen_id) REFERENCES allergens(id) ON DELETE CASCADE,
    
    UNIQUE(ingredient_id, allergen_id)  -- Un ingredient nu poate avea același alergen de 2 ori
);

-- Index pentru performanță (queries frecvente)
CREATE INDEX IF NOT EXISTS idx_ingredient_allergens_ingredient ON ingredient_allergens(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_ingredient_allergens_allergen ON ingredient_allergens(allergen_id);

-- ============================================================
-- 5. SEED DATA - UNITĂȚI DE MĂSURĂ STANDARD HoReCa
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
-- 6. SEED DATA - COTE TVA ROMÂNIA
-- ============================================================

INSERT OR IGNORE INTO vat_rates (name, rate, description, applicable_to, is_default, is_active, country_code, valid_from, sort_order) VALUES
('TVA Standard', 21.0, 'Cota TVA standard pentru majoritatea produselor și serviciilor', 'Băuturi alcoolice, băuturi răcoritoare, cafea, ceai, produse non-alimentare, servicii generale', 0, 1, 'RO', '2017-01-01', 1),
('TVA Redus', 11.0, 'Cota TVA redusă pentru alimente și servicii de restaurant', 'Alimente de bază, preparate culinare, restaurante (servire la masă), catering, take-away, deserturi, cazare hotelieră, medicamente', 1, 1, 'RO', '2017-01-01', 2),
('TVA Exceptat', 0.0, 'Scutit de TVA', 'Export (livrări în afara UE), servicii intracomunitar B2B, servicii financiare/asigurări specifice, servicii educaționale/medicale autorizate', 0, 1, 'RO', '2017-01-01', 3);

-- ============================================================
-- 7. SEED DATA - 14 ALERGENI MAJORI UE (Regulamentul 1169/2011)
-- ============================================================

INSERT OR IGNORE INTO allergens (name_ro, name_en, code, icon, description_ro, description_en, color_hex, regulation_reference, severity, sort_order) VALUES
('Cereale care conțin gluten', 'Cereals containing gluten', 'GLUTEN', '🌾', 'Grâu, secară, orz, ovăz, spelt, kamut sau soiurile lor hibridizate', 'Wheat, rye, barley, oats, spelt, kamut or their hybridised strains', '#FFA726', 'Regulamentul UE 1169/2011, Anexa II', 'high', 1),
('Crustacee', 'Crustaceans', 'CRUSTACEANS', '🦐', 'Creveți, raci, crabi, homari și produse derivate', 'Shrimps, prawns, crabs, lobsters and products thereof', '#FF7043', 'Regulamentul UE 1169/2011, Anexa II', 'high', 2),
('Ouă', 'Eggs', 'EGGS', '🥚', 'Ouă și produse pe bază de ouă', 'Eggs and egg products', '#FDD835', 'Regulamentul UE 1169/2011, Anexa II', 'high', 3),
('Pește', 'Fish', 'FISH', '🐟', 'Pește și produse pe bază de pește', 'Fish and fish products', '#42A5F5', 'Regulamentul UE 1169/2011, Anexa II', 'high', 4),
('Arahide', 'Peanuts', 'PEANUTS', '🥜', 'Arahide și produse pe bază de arahide', 'Peanuts and peanut products', '#D4A574', 'Regulamentul UE 1169/2011, Anexa II', 'critical', 5),
('Soia', 'Soybeans', 'SOYBEANS', '🌱', 'Soia și produse pe bază de soia', 'Soybeans and soy products', '#8BC34A', 'Regulamentul UE 1169/2011, Anexa II', 'medium', 6),
('Lapte', 'Milk', 'MILK', '🥛', 'Lapte și produse lactate (inclusiv lactoză)', 'Milk and dairy products (including lactose)', '#E3F2FD', 'Regulamentul UE 1169/2011, Anexa II', 'high', 7),
('Fructe cu coajă lemnoasă', 'Nuts', 'NUTS', '🌰', 'Migdale, alune, nuci, nuci de caju, nuci pecan, nuci Brazil, fistic, nuci macadamia, nuci Queensland', 'Almonds, hazelnuts, walnuts, cashews, pecans, Brazil nuts, pistachios, macadamia nuts, Queensland nuts', '#A1887F', 'Regulamentul UE 1169/2011, Anexa II', 'critical', 8),
('Țelină', 'Celery', 'CELERY', '🥬', 'Țelină și produse pe bază de țelină', 'Celery and celery products', '#AED581', 'Regulamentul UE 1169/2011, Anexa II', 'medium', 9),
('Muștar', 'Mustard', 'MUSTARD', '🌭', 'Muștar și produse pe bază de muștar', 'Mustard and mustard products', '#FFE082', 'Regulamentul UE 1169/2011, Anexa II', 'medium', 10),
('Semințe de susan', 'Sesame seeds', 'SESAME', '🌰', 'Semințe de susan și produse pe bază de semințe de susan', 'Sesame seeds and sesame products', '#FFAB91', 'Regulamentul UE 1169/2011, Anexa II', 'high', 11),
('Dioxid de sulf și sulfiți', 'Sulphur dioxide and sulphites', 'SULPHITES', '💨', 'În concentrații de peste 10 mg/kg sau 10 mg/litru', 'In concentrations of more than 10 mg/kg or 10 mg/litre', '#B0BEC5', 'Regulamentul UE 1169/2011, Anexa II', 'medium', 12),
('Lupin', 'Lupin', 'LUPIN', '🌼', 'Lupin și produse pe bază de lupin', 'Lupin and lupin products', '#CE93D8', 'Regulamentul UE 1169/2011, Anexa II', 'medium', 13),
('Moluște', 'Molluscs', 'MOLLUSCS', '🦑', 'Scoici, midii, stridii, melci, calmar și produse derivate', 'Mussels, oysters, snails, squid and products thereof', '#80DEEA', 'Regulamentul UE 1169/2011, Anexa II', 'high', 14);

-- ============================================================
-- 8. MODIFICARE TABEL PRODUSE - Adaugă coloană pentru alergeni
-- ============================================================

-- Adaugă coloană pentru stocarea alergenilor calculați automat din rețete (JSON array)
-- Exemplu: '["GLUTEN","EGGS","MILK"]'
ALTER TABLE menu ADD COLUMN allergens_computed TEXT DEFAULT '[]';

-- ============================================================
-- 9. COMENTARII & INFORMAȚII
-- ============================================================

-- NOTĂ 1: Coloana vat_5 din fiscal_receipts rămâne pentru backward compatibility
--         dar nu mai e folosită activ (toate referințele au fost eliminate din cod)

-- NOTĂ 2: Alergeniicomputed în tabelul menu se actualizează automat când:
--         - Se modifică o rețetă
--         - Se modifică asocierea ingredient → alergen
--         - Se adaugă/șterge un ingredient dintr-o rețetă

-- NOTĂ 3: Pentru conversii între unități de măsură:
--         Exemplu: 1 kg = 1000 g (conversion_factor = 1000)
--         Formula: value_in_base_unit = value * conversion_factor

-- NOTĂ 4: severity pentru alergeni:
--         - critical: Reacții severe, potențial fatale (ex: arahide, fructe cu coajă)
--         - high: Reacții grave (ex: gluten, ouă, lapte)
--         - medium: Reacții moderate (ex: țelină, muștar, sulfiți)
--         - low: Reacții ușoare

-- ============================================================
-- MIGRARE COMPLETATĂ ✅
-- ============================================================

