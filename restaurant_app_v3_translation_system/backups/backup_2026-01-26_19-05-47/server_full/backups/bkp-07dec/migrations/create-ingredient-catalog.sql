-- 🏛️ CATALOG INGREDIENTE INTERNE - Conformitate Ordin 201/2022
-- Data: 04 Noiembrie 2025
-- Scop: Bază de date internă ingrediente cu aditivi, alergeni, nutriționale

-- ============================================================================
-- TABEL PRINCIPAL: CATALOG INGREDIENTE
-- ============================================================================

CREATE TABLE IF NOT EXISTS ingredient_catalog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- IDENTIFICARE
    name TEXT NOT NULL UNIQUE,
    name_en TEXT,
    name_scientific TEXT,       -- Denumire științifică (ex: "Lactuca sativa" pentru salată)
    
    -- CATEGORII
    category TEXT NOT NULL,     -- 'Carne', 'Legume', 'Lactate', 'Cereale', etc.
    subcategory TEXT,           -- 'Carne bovină', 'Legume verzi', 'Brânzeturi', etc.
    food_group TEXT,            -- Conform piramida alimentară
    
    -- UNITATE & MĂSURARE
    standard_unit TEXT NOT NULL, -- 'kg', 'l', 'g', 'ml', 'buc'
    standard_package_size DECIMAL(10,3), -- Ex: 1 (kg), 0.5 (l), 6 (buc ouă)
    package_type TEXT,          -- 'Pungă', 'Sticlă', 'Cutie', 'Vrac'
    
    -- ALERGENI (conform Ordin 201/2022 - 14 alergeni majori)
    allergens TEXT,             -- JSON: ["Gluten", "Lapte", "Ouă"]
    allergen_traces TEXT,       -- JSON: ["Nuci", "Susan"] - "poate conține urme"
    allergen_free_certified BOOLEAN DEFAULT 0, -- Certificat fără alergeni
    
    -- ADITIVI ALIMENTARI (E-uri)
    additives TEXT,             -- JSON: [{"code":"E100","name":"Curcumină","function":"colorant"}]
    preservatives TEXT,         -- JSON: Conservanți specifici
    
    -- VALORI NUTRIȚIONALE (per 100g sau 100ml)
    -- Conform Regulament UE 1169/2011
    energy_kcal DECIMAL(10,2),  -- Energie kcal/100g
    energy_kj DECIMAL(10,2),    -- Energie kJ/100g
    fat DECIMAL(10,2),          -- Grăsimi (g/100g)
    saturated_fat DECIMAL(10,2), -- Acizi grași saturați (g/100g)
    monounsaturated_fat DECIMAL(10,2), -- Mononesaturați
    polyunsaturated_fat DECIMAL(10,2), -- Polinesaturați
    trans_fat DECIMAL(10,2),    -- Grăsimi trans
    carbs DECIMAL(10,2),        -- Glucide (g/100g)
    sugars DECIMAL(10,2),       -- Zaharuri (g/100g)
    polyols DECIMAL(10,2),      -- Polialcooli (zaharuri alcoolice)
    starch DECIMAL(10,2),       -- Amidon
    fiber DECIMAL(10,2),        -- Fibre (g/100g)
    protein DECIMAL(10,2),      -- Proteine (g/100g)
    salt DECIMAL(10,2),         -- Sare (g/100g)
    sodium DECIMAL(10,2),       -- Sodiu (mg/100g)
    
    -- VITAMINE (opțional, pentru info completă)
    vitamin_a DECIMAL(10,2),    -- µg/100g
    vitamin_c DECIMAL(10,2),    -- mg/100g
    vitamin_d DECIMAL(10,2),    -- µg/100g
    vitamin_e DECIMAL(10,2),    -- mg/100g
    
    -- MINERALE (opțional)
    calcium DECIMAL(10,2),      -- mg/100g
    iron DECIMAL(10,2),         -- mg/100g
    potassium DECIMAL(10,2),    -- mg/100g
    magnesium DECIMAL(10,2),    -- mg/100g
    
    -- PROCESARE & WASTE
    processing_loss_percentage DECIMAL(5,2) DEFAULT 0, -- % pierdere la curățare/gătire
    processing_notes TEXT,      -- "Se curăță coji și capete", "Se taie tulpini"
    
    -- COST (orientativ - pentru calcule)
    estimated_cost_per_kg DECIMAL(10,2), -- Cost mediu piață (RON/kg)
    cost_range_min DECIMAL(10,2),
    cost_range_max DECIMAL(10,2),
    
    -- ORIGINE & CONFORMITATE
    origin_country TEXT,        -- 'România', 'Italia', 'Import UE'
    origin_region TEXT,         -- 'Ardeal', 'Moldova', etc.
    organic_certified BOOLEAN DEFAULT 0, -- BIO certificat
    quality_standard TEXT,      -- 'Clasa I', 'Extra', 'Standard'
    
    -- LEGISLAȚIE
    compliant_ordin_201 BOOLEAN DEFAULT 1,
    compliant_reg_1169 BOOLEAN DEFAULT 1,  -- Regulament UE 1169/2011
    haccp_notes TEXT,           -- Note HACCP (temperatură, manipulare)
    
    -- METADATA
    source TEXT,                -- 'ANSVSA', 'USDA FoodData', 'Manual'
    source_url TEXT,            -- Link către sursă date
    verified_date DATE,         -- Ultima verificare
    last_updated DATE DEFAULT (DATE('now')),
    
    -- ETICHETARE
    mandatory_label_info TEXT,  -- Info obligatorie pe etichetă
    warning_labels TEXT,        -- JSON: Avertismente ("Conține gluten", etc.)
    
    -- FLAG-URI UTILE
    is_active BOOLEAN DEFAULT 1,
    is_common BOOLEAN DEFAULT 0, -- În template standard
    is_seasonal BOOLEAN DEFAULT 0, -- Sezonier (ex: căpșuni)
    season_months TEXT,         -- JSON: [5,6,7,8] - Mai-August
    
    -- DESCRIERE
    description TEXT,           -- Descriere ingredient
    usage_tips TEXT,            -- "Ideal pentru pizza, paste, salate"
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABEL AUXILIAR: ALERGENI (14 alergeni majori Ordin 201/2022)
-- ============================================================================

CREATE TABLE IF NOT EXISTS allergens_catalog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,  -- 'GLU', 'LAC', 'EGG', etc.
    name_ro TEXT NOT NULL,
    name_en TEXT NOT NULL,
    icon TEXT,                  -- Emoji sau icon class
    color TEXT,                 -- Hex color pentru UI
    description_ro TEXT,
    description_en TEXT,
    eu_regulation TEXT,         -- 'Anexa II Regulament UE 1169/2011'
    display_order INTEGER,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Populare alergeni majori (14)
INSERT OR IGNORE INTO allergens_catalog (code, name_ro, name_en, icon, display_order) VALUES
('GLU', 'Cereale care conțin gluten', 'Cereals containing gluten', '🌾', 1),
('CRU', 'Crustacee', 'Crustaceans', '🦐', 2),
('EGG', 'Ouă', 'Eggs', '🥚', 3),
('FSH', 'Pește', 'Fish', '🐟', 4),
('PNT', 'Arahide', 'Peanuts', '🥜', 5),
('SOY', 'Soia', 'Soybeans', '🫘', 6),
('MLK', 'Lapte (lactate)', 'Milk', '🥛', 7),
('NUT', 'Fructe cu coajă lemnoasă', 'Nuts', '🌰', 8),
('CEL', 'Țelină', 'Celery', '🌿', 9),
('MUS', 'Muștar', 'Mustard', '🌭', 10),
('SES', 'Susan', 'Sesame seeds', '🫘', 11),
('SUL', 'Dioxid de sulf și sulfiți', 'Sulphur dioxide and sulphites', '🧪', 12),
('LUP', 'Lupin', 'Lupin', '🫘', 13),
('MOL', 'Moluște', 'Molluscs', '🐚', 14);

-- ============================================================================
-- TABEL AUXILIAR: ADITIVI ALIMENTARI (E-uri comune)
-- ============================================================================

CREATE TABLE IF NOT EXISTS additives_catalog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    e_code TEXT UNIQUE NOT NULL,    -- 'E100', 'E202', etc.
    name_ro TEXT NOT NULL,
    name_en TEXT,
    function_ro TEXT,               -- 'Colorant', 'Conservant', 'Antioxidant'
    function_en TEXT,
    adr_mg_per_kg DECIMAL(10,2),   -- ADR (Aport Zilnic Admisibil) mg/kg corp
    safety_level TEXT,              -- 'Sigur', 'Atenție', 'Restricționat'
    usage_restrictions TEXT,        -- Restricții de utilizare
    natural_source BOOLEAN,         -- Proveniență naturală
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Aditivi comuni în restaurante
INSERT OR IGNORE INTO additives_catalog (e_code, name_ro, name_en, function_ro, safety_level, natural_source) VALUES
('E100', 'Curcumină', 'Curcumin', 'Colorant galben', 'Sigur', 1),
('E101', 'Riboflavină (Vitamina B2)', 'Riboflavin', 'Colorant galben-portocaliu', 'Sigur', 1),
('E160a', 'Carotene', 'Carotenes', 'Colorant portocaliu', 'Sigur', 1),
('E200', 'Acid sorbic', 'Sorbic acid', 'Conservant', 'Sigur', 0),
('E202', 'Sorbat de potasiu', 'Potassium sorbate', 'Conservant', 'Sigur', 0),
('E211', 'Benzoat de sodiu', 'Sodium benzoate', 'Conservant', 'Atenție', 0),
('E300', 'Acid ascorbic (Vitamina C)', 'Ascorbic acid', 'Antioxidant', 'Sigur', 1),
('E330', 'Acid citric', 'Citric acid', 'Regulator aciditate', 'Sigur', 1),
('E415', 'Gumă xantan', 'Xanthan gum', 'Stabilizator', 'Sigur', 0),
('E420', 'Sorbitol', 'Sorbitol', 'Îndulcitor', 'Sigur', 0),
('E500', 'Carbonați de sodiu', 'Sodium carbonates', 'Regulator aciditate', 'Sigur', 0),
('E535', 'Ferrocianură de sodiu', 'Sodium ferrocyanide', 'Agent antiaglomerant', 'Sigur', 0),
('E621', 'Glutamat monosodic', 'Monosodium glutamate', 'Intensificator gust', 'Atenție', 0),
('E1442', 'Fosfat de diamidon', 'Hydroxypropyl distarch phosphate', 'Stabilizator', 'Sigur', 0);

-- ============================================================================
-- VIEW: Ingrediente cu alergeni expanded
-- ============================================================================

CREATE VIEW IF NOT EXISTS ingredient_catalog_with_allergens AS
SELECT 
    ic.*,
    GROUP_CONCAT(DISTINCT ac.name_ro, ', ') as allergens_display_ro,
    GROUP_CONCAT(DISTINCT ac.name_en, ', ') as allergens_display_en
FROM ingredient_catalog ic
LEFT JOIN json_each(ic.allergens) ja ON 1=1
LEFT JOIN allergens_catalog ac ON ac.name_ro = ja.value OR ac.name_en = ja.value
GROUP BY ic.id;

-- ============================================================================
-- INDEX-URI pentru performanță
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_catalog_name ON ingredient_catalog(name);
CREATE INDEX IF NOT EXISTS idx_catalog_name_en ON ingredient_catalog(name_en);
CREATE INDEX IF NOT EXISTS idx_catalog_category ON ingredient_catalog(category);
CREATE INDEX IF NOT EXISTS idx_catalog_subcategory ON ingredient_catalog(subcategory);
CREATE INDEX IF NOT EXISTS idx_catalog_common ON ingredient_catalog(is_common);
CREATE INDEX IF NOT EXISTS idx_catalog_active ON ingredient_catalog(is_active);

-- ============================================================================
-- COMENTARII DOCUMENTARE
-- ============================================================================

-- Tabelul ingredient_catalog = Catalogul INTERN de ingrediente
-- Separat de tabelul ingredients (stocurile restaurantului)

-- RELAȚIA:
-- ingredient_catalog = TEMPLATE (biblioteca globală de ingrediente)
-- ingredients = INGREDIENTE REALE din stocul restaurantului

-- FLOW:
-- 1. Restaurant vede ingredient_catalog
-- 2. Selectează ingrediente necesare
-- 3. Click "Import" → se creează în tabel ingredients
-- 4. Se copiază: alergeni, aditivi, nutriționale, waste%
-- 5. Restaurant setează: stoc curent, stoc minim, furnizor, preț

