-- ============================================================================
-- TECHNICAL SHEETS (FIȘE TEHNICE) - Separate de RECIPES
-- Data: 03 Decembrie 2025
-- Conformitate: Ordin ANSVSA 201/2022 + UE 1169/2011
-- ============================================================================

-- ============================================================================
-- TABEL PRINCIPAL: TECHNICAL_SHEETS
-- ============================================================================

CREATE TABLE IF NOT EXISTS technical_sheets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- LEGĂTURI
    product_id INTEGER NOT NULL UNIQUE, -- 1 produs = 1 fișă tehnică
    recipe_id INTEGER, -- Link către rețetă (opțional)
    
    -- BASIC INFO
    name_ro TEXT NOT NULL,
    name_en TEXT,
    category TEXT NOT NULL,
    description_ro TEXT,
    description_en TEXT,
    
    -- INGREDIENTS (calculate automat din recipe, ordonate descrescător)
    ingredients_ordered TEXT NOT NULL, -- JSON: [{"name":"Făină","qty":300,"unit":"g","is_allergen":true}]
    
    -- ALLERGENS (extract automat din ingredient_catalog)
    allergens TEXT NOT NULL, -- JSON: ["Gluten","Lapte","Ouă"]
    allergens_traces TEXT, -- JSON: ["Nuci","Susan"] - cross-contamination
    allergens_visual_markup TEXT, -- JSON: [{"ingredient":"Făină","allergen":"Gluten","bold":true}]
    allergen_free_certified BOOLEAN DEFAULT 0,
    
    -- ADDITIVES (extract automat din ingredient_catalog)
    additives TEXT, -- JSON: [{"code":"E100","name":"Curcumină","function":"colorant"}]
    
    -- NUTRITIONAL VALUES (calculate automat per 100g)
    portion_size_grams REAL NOT NULL, -- Gramaj NET servit (ex: 350g pentru pizza M)
    energy_kcal REAL,
    energy_kj REAL,
    fat REAL,
    saturated_fat REAL,
    monounsaturated_fat REAL,
    polyunsaturated_fat REAL,
    carbs REAL,
    sugars REAL,
    protein REAL,
    salt REAL,
    fiber REAL,
    sodium REAL,
    cholesterol REAL,
    
    -- VITAMINS & MINERALS (opțional - pentru meniuri premium)
    vitamin_a REAL,
    vitamin_c REAL,
    vitamin_d REAL,
    calcium REAL,
    iron REAL,
    
    -- COST (calculate din FIFO batches)
    cost_per_portion REAL, -- Cost ingrediente actual (FIFO)
    cost_per_portion_min REAL, -- Cost minim posibil (cele mai ieftine loturi)
    cost_per_portion_max REAL, -- Cost maxim posibil (cele mai scumpe loturi)
    cost_calculation_method TEXT DEFAULT 'FIFO' CHECK (cost_calculation_method IN ('FIFO','LIFO','Average','Weighted')),
    last_cost_update DATETIME,
    
    -- PRICING (pentru analiza profitabilității)
    suggested_price REAL, -- Preț sugerat (cost × markup)
    current_price REAL, -- Preț actual în meniu
    margin_percentage REAL, -- % marjă calculate
    markup_factor REAL, -- Factor markup (ex: 3.0 = 200% marjă)
    
    -- COMPLIANCE (conform Ordin 201/2022)
    serving_temperature TEXT, -- "65-70°C"
    serving_temperature_min INTEGER,
    serving_temperature_max INTEGER,
    storage_conditions TEXT, -- "Frigider 2-4°C"
    storage_temperature_min INTEGER,
    storage_temperature_max INTEGER,
    shelf_life TEXT, -- "24 ore", "Consum imediat"
    shelf_life_hours INTEGER,
    
    -- PREPARATION (info pentru HACCP)
    preparation_time_minutes INTEGER,
    cooking_temperature INTEGER,
    cooking_time_minutes INTEGER,
    reheating_allowed BOOLEAN DEFAULT 0,
    reheating_instructions TEXT,
    
    -- WORKFLOW APROBARE (Chef → Manager → Lock)
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft','approved','locked','archived')),
    
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    approved_by_chef TEXT,
    approved_by_chef_at DATETIME,
    chef_notes TEXT,
    
    approved_by_manager TEXT,
    approved_by_manager_at DATETIME,
    manager_notes TEXT,
    
    locked_at DATETIME,
    locked_by TEXT,
    locked_reason TEXT, -- "Aprobat final - nu se mai modifică"
    
    archived_at DATETIME,
    archived_by TEXT,
    archived_reason TEXT,
    
    -- VERSION CONTROL
    version INTEGER DEFAULT 1,
    previous_version_id INTEGER,
    change_log TEXT, -- JSON: [{"date":"...","user":"...","changes":"..."}]
    
    -- OUTPUT GENERATION
    pdf_path TEXT, -- Cale către PDF generat
    pdf_generated_at DATETIME,
    qr_code TEXT, -- QR code pentru meniu digital
    qr_code_url TEXT, -- URL către fișa tehnică online
    
    -- ANALYTICS
    view_count INTEGER DEFAULT 0,
    last_viewed_at DATETIME,
    print_count INTEGER DEFAULT 0,
    last_printed_at DATETIME,
    
    -- TAGS (pentru căutare)
    tags TEXT, -- JSON: ["vegetarian","gluten-free","low-carb"]
    
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE SET NULL,
    FOREIGN KEY (previous_version_id) REFERENCES technical_sheets(id)
);

CREATE INDEX IF NOT EXISTS idx_tech_sheets_product ON technical_sheets(product_id);
CREATE INDEX IF NOT EXISTS idx_tech_sheets_status ON technical_sheets(status);
CREATE INDEX IF NOT EXISTS idx_tech_sheets_recipe ON technical_sheets(recipe_id);
CREATE INDEX IF NOT EXISTS idx_tech_sheets_approved ON technical_sheets(status, approved_by_manager_at);

-- ============================================================================
-- TABEL ISTORIC MODIFICĂRI FIȘE TEHNICE
-- ============================================================================

CREATE TABLE IF NOT EXISTS technical_sheet_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    technical_sheet_id INTEGER NOT NULL,
    
    -- SNAPSHOT (copie completă înainte de modificare)
    snapshot_data TEXT NOT NULL, -- JSON: întreg obiect technical_sheet
    
    -- CHANGE INFO
    changed_by TEXT NOT NULL,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    change_type TEXT NOT NULL, -- 'create', 'update', 'approve', 'lock', 'archive'
    change_description TEXT,
    fields_changed TEXT, -- JSON: ["allergens","cost_per_portion"]
    
    -- OLD vs NEW VALUES
    old_values TEXT, -- JSON: {"allergens":["Gluten"],"cost":7.25}
    new_values TEXT, -- JSON: {"allergens":["Gluten","Lapte"],"cost":7.50}
    
    FOREIGN KEY (technical_sheet_id) REFERENCES technical_sheets(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tech_sheet_history_sheet ON technical_sheet_history(technical_sheet_id);
CREATE INDEX IF NOT EXISTS idx_tech_sheet_history_date ON technical_sheet_history(changed_at);

-- ============================================================================
-- TABEL CROSS-CONTAMINATION (Risc alergeni)
-- ============================================================================

CREATE TABLE IF NOT EXISTS allergen_cross_contamination (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- LOCAȚIE (în ce gestiune/bucătărie)
    location_id INTEGER NOT NULL,
    location_name TEXT,
    
    -- ALLERGEN
    allergen TEXT NOT NULL, -- Ex: "Nuci", "Gluten", "Fructe de mare"
    allergen_en TEXT,
    
    -- RISK ASSESSMENT
    risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low','medium','high')),
    risk_description TEXT, -- "Echipament comun pentru produse cu nuci"
    
    -- MITIGATION (măsuri de prevenție)
    mitigation_steps TEXT, -- "Curățare riguroasă echipament după fiecare utilizare"
    mitigation_frequency TEXT, -- "După fiecare preparat cu nuci"
    responsible_person TEXT,
    
    -- TRAINING
    last_training_date DATE,
    next_training_due DATE,
    training_participants TEXT, -- JSON: ["Chef Ion","Bucătar Maria"]
    
    -- STATUS
    is_active BOOLEAN DEFAULT 1,
    notes TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (location_id) REFERENCES management_locations(id)
);

CREATE INDEX IF NOT EXISTS idx_cross_contam_location ON allergen_cross_contamination(location_id);
CREATE INDEX IF NOT EXISTS idx_cross_contam_allergen ON allergen_cross_contamination(allergen);
CREATE INDEX IF NOT EXISTS idx_cross_contam_risk ON allergen_cross_contamination(risk_level);

-- ============================================================================
-- TABEL PRODUCT PORTIONS (Pentru S/M/L)
-- ============================================================================

CREATE TABLE IF NOT EXISTS product_portions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    
    -- SIZE INFO
    size_code TEXT NOT NULL, -- 'S', 'M', 'L', 'XL'
    size_name TEXT NOT NULL, -- 'Mică', 'Medie', 'Mare', 'Extra Mare'
    size_name_en TEXT,
    size_description TEXT, -- '25cm diametru', '350g porție'
    
    -- SCALING (VITAL pentru cost și stoc)
    portion_multiplier REAL NOT NULL, -- 0.75 pentru S, 1.0 pentru M, 1.5 pentru L
    portion_grams REAL NOT NULL, -- Gramaj exact (ex: 250g, 350g, 500g)
    
    -- PRICING
    price REAL NOT NULL,
    cost_per_portion REAL, -- Calculate automat din recipe × multiplier
    margin_percentage REAL, -- ((price - cost) / price) × 100
    markup_factor REAL, -- price / cost
    
    -- METADATA
    is_default BOOLEAN DEFAULT 0, -- Porția "standard" (M de obicei)
    is_available BOOLEAN DEFAULT 1,
    sort_order INTEGER,
    
    -- POPULARITY (analytics)
    order_count INTEGER DEFAULT 0,
    last_ordered_at DATETIME,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE (product_id, size_code)
);

CREATE INDEX IF NOT EXISTS idx_portions_product ON product_portions(product_id);
CREATE INDEX IF NOT EXISTS idx_portions_default ON product_portions(is_default);

-- ============================================================================
-- MODIFICĂRI TABEL RECIPES (adaugă gramaj BRUT vs NET)
-- ============================================================================

-- Verifică dacă coloana quantity_gross există
-- Dacă nu, o adăugăm

-- NOTĂ: SQLite nu suportă ALTER TABLE ADD COLUMN IF NOT EXISTS
-- Deci folosim approach diferit: creăm tabel nou și migrăm datele

-- Backup tabel vechi (dacă există)
DROP TABLE IF EXISTS recipe_ingredients_old;
CREATE TABLE IF NOT EXISTS recipe_ingredients_old AS SELECT * FROM recipe_ingredients;

-- Recreează tabel cu coloane noi
DROP TABLE IF EXISTS recipe_ingredients;
CREATE TABLE recipe_ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER NOT NULL,
    ingredient_id INTEGER NOT NULL,
    
    -- CANTITĂȚI (AMBELE OBLIGATORII!)
    quantity_gross REAL NOT NULL, -- Cantitate BRUTĂ (cu pierderi, cumpărată)
    quantity_net REAL NOT NULL, -- Cantitate NETĂ (în produs finit, servită)
    waste_percentage REAL DEFAULT 0, -- % pierdere (auto-calculate)
    
    -- UNIT
    unit TEXT NOT NULL,
    
    -- PREPARATION
    preparation_method TEXT, -- "Curățat, tăiat cuburi"
    preparation_time_minutes INTEGER,
    preparation_notes TEXT,
    is_optional BOOLEAN DEFAULT 0,
    
    -- SUBSTITUTIONS (ingredient alternativ)
    can_be_substituted BOOLEAN DEFAULT 0,
    substitution_ingredient_id INTEGER,
    substitution_notes TEXT, -- "Poate fi înlocuit cu spanac"
    
    -- COSTING
    cost_method TEXT DEFAULT 'FIFO' CHECK (cost_method IN ('FIFO','LIFO','Average')),
    
    -- METADATA
    sort_order INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
    FOREIGN KEY (substitution_ingredient_id) REFERENCES ingredients(id)
);

CREATE INDEX IF NOT EXISTS idx_recipe_ing_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ing_ingredient ON recipe_ingredients(ingredient_id);

-- Migrează date vechi (dacă există)
INSERT INTO recipe_ingredients (
    recipe_id, ingredient_id, 
    quantity_gross, quantity_net, waste_percentage,
    unit, sort_order
)
SELECT 
    recipe_id, ingredient_id,
    quantity, quantity * 0.95, 5.0, -- Presupunem 5% pierdere default
    unit, id
FROM recipe_ingredients_old
WHERE EXISTS (SELECT 1 FROM recipe_ingredients_old);

-- ============================================================================
-- TABEL RECIPE VERSION CONTROL
-- ============================================================================

CREATE TABLE IF NOT EXISTS recipe_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER NOT NULL,
    version_number INTEGER NOT NULL,
    
    -- SNAPSHOT (copie completă rețetă la acel moment)
    recipe_snapshot TEXT NOT NULL, -- JSON: întreg obiect recipe + ingredients
    
    -- CHANGE INFO
    changed_by TEXT NOT NULL,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    change_description TEXT,
    change_reason TEXT, -- "Îmbunătățire cost", "Feedback clienți", "Schimbare furnizor"
    
    -- COST TRACKING
    cost_before REAL,
    cost_after REAL,
    cost_difference_percentage REAL,
    
    -- STATUS
    is_active BOOLEAN DEFAULT 0, -- Doar versiunea curentă e active
    
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    UNIQUE (recipe_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_recipe_versions_recipe ON recipe_versions(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_versions_active ON recipe_versions(is_active);

-- ============================================================================
-- TABEL RECALL MANAGEMENT (pentru siguranță alimentară)
-- ============================================================================

CREATE TABLE IF NOT EXISTS product_recalls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- RECALL INFO
    recall_number TEXT UNIQUE NOT NULL, -- "RCL-2025-001234"
    recall_date DATE NOT NULL,
    recall_type TEXT NOT NULL CHECK (recall_type IN ('ingredient','product','supplier','batch')),
    
    -- CE se retrage
    ingredient_id INTEGER, -- Dacă e ingredient
    product_id INTEGER, -- Dacă e produs finit
    supplier_id INTEGER, -- Dacă e de la furnizor
    batch_numbers TEXT, -- JSON: ["LOT-123","LOT-456"] - loturi afectate
    
    -- SEVERITATE
    severity TEXT NOT NULL CHECK (severity IN ('low','medium','high','critical')),
    health_risk TEXT, -- "Risc intoxicație", "Risc alergic", "Risc contaminare"
    
    -- REASON
    reason TEXT NOT NULL,
    description TEXT,
    
    -- AFECTATE (calculate automat)
    affected_products_count INTEGER DEFAULT 0,
    affected_orders_count INTEGER DEFAULT 0,
    affected_customers_count INTEGER DEFAULT 0,
    affected_products_list TEXT, -- JSON: [{"product_id":1,"product_name":"Pizza"}]
    affected_orders_list TEXT, -- JSON: [{"order_id":123,"date":"...","customer":"..."}]
    
    -- ACȚIUNI
    action_taken TEXT NOT NULL, -- "Retragere imediată din stoc și meniu"
    notification_sent BOOLEAN DEFAULT 0,
    notification_sent_at DATETIME,
    notification_method TEXT, -- "Email, SMS, Push"
    
    -- AUTORITĂȚI
    ansvsa_notified BOOLEAN DEFAULT 0,
    ansvsa_notification_date DATE,
    ansvsa_case_number TEXT,
    
    -- RESOLUTION
    resolved BOOLEAN DEFAULT 0,
    resolved_at DATETIME,
    resolved_by TEXT,
    resolution_notes TEXT,
    
    -- COST IMPACT
    financial_loss REAL, -- Pierdere financiară estimată
    
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

CREATE INDEX IF NOT EXISTS idx_recalls_date ON product_recalls(recall_date);
CREATE INDEX IF NOT EXISTS idx_recalls_severity ON product_recalls(severity);
CREATE INDEX IF NOT EXISTS idx_recalls_resolved ON product_recalls(resolved);

-- ============================================================================
-- TABEL EXPIRY TRACKING & ALERTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS expiry_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- BATCH INFO
    batch_id INTEGER NOT NULL,
    ingredient_id INTEGER NOT NULL,
    ingredient_name TEXT NOT NULL,
    batch_number TEXT NOT NULL,
    
    -- EXPIRY
    expiry_date DATE NOT NULL,
    days_until_expiry INTEGER NOT NULL,
    
    -- ALERT LEVEL
    alert_level TEXT NOT NULL CHECK (alert_level IN ('green','yellow','orange','red')),
    -- green: 7+ zile, yellow: 3-7 zile, orange: 1-3 zile, red: < 1 zi
    
    -- QUANTITY
    remaining_quantity REAL NOT NULL,
    unit TEXT,
    value_at_risk REAL, -- Valoare financiară (qty × cost)
    
    -- LOCATION
    location_id INTEGER NOT NULL,
    location_name TEXT,
    
    -- ACTIONS
    action_recommended TEXT, -- "Folosește URGENT", "Pregătește pentru discount", "Retrage din stoc"
    action_taken TEXT,
    action_taken_by TEXT,
    action_taken_at DATETIME,
    
    -- NOTIFICATION
    notified BOOLEAN DEFAULT 0,
    notified_at DATETIME,
    notified_to TEXT, -- "Chef, Manager"
    
    -- RESOLUTION
    resolved BOOLEAN DEFAULT 0,
    resolved_at DATETIME,
    resolution_type TEXT, -- 'used', 'transferred', 'discarded', 'expired'
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (batch_id) REFERENCES ingredient_batches(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
    FOREIGN KEY (location_id) REFERENCES management_locations(id)
);

CREATE INDEX IF NOT EXISTS idx_expiry_alerts_level ON expiry_alerts(alert_level);
CREATE INDEX IF NOT EXISTS idx_expiry_alerts_date ON expiry_alerts(expiry_date);
CREATE INDEX IF NOT EXISTS idx_expiry_alerts_resolved ON expiry_alerts(resolved);

-- ============================================================================
-- TABEL VARIANCE TRACKING (Theoretical vs Actual)
-- ============================================================================

CREATE TABLE IF NOT EXISTS stock_variance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- PERIOD
    variance_date DATE NOT NULL,
    location_id INTEGER NOT NULL,
    
    -- INGREDIENT
    ingredient_id INTEGER NOT NULL,
    ingredient_name TEXT NOT NULL,
    
    -- THEORETICAL (ce ar trebui să fie)
    theoretical_usage REAL NOT NULL, -- Din recipes × orders
    theoretical_cost REAL NOT NULL,
    
    -- ACTUAL (ce a fost consumat efectiv)
    actual_usage REAL NOT NULL, -- Din stock movements
    actual_cost REAL NOT NULL,
    
    -- VARIANCE
    variance_quantity REAL NOT NULL, -- actual - theoretical
    variance_percentage REAL NOT NULL, -- (variance / theoretical) × 100
    variance_cost REAL NOT NULL, -- actual_cost - theoretical_cost
    
    -- CLASSIFICATION
    variance_type TEXT, -- 'positive' (surplus), 'negative' (shortage), 'acceptable'
    acceptable_threshold REAL DEFAULT 5.0, -- % toleranță (±5%)
    requires_investigation BOOLEAN DEFAULT 0,
    
    -- INVESTIGATION
    investigated BOOLEAN DEFAULT 0,
    investigated_by TEXT,
    investigated_at DATETIME,
    investigation_findings TEXT,
    investigation_action TEXT,
    
    -- CAUSES (posibile cauze)
    possible_causes TEXT, -- JSON: ["Waste","Theft","Recipe error","Portioning inconsistent"]
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
    FOREIGN KEY (location_id) REFERENCES management_locations(id)
);

CREATE INDEX IF NOT EXISTS idx_variance_date ON stock_variance(variance_date);
CREATE INDEX IF NOT EXISTS idx_variance_location ON stock_variance(location_id);
CREATE INDEX IF NOT EXISTS idx_variance_requires_inv ON stock_variance(requires_investigation);

-- ============================================================================
-- MIGRARE COMPLETATĂ ✅
-- ============================================================================

-- Log migrare
INSERT INTO migration_log (migration_file, executed_at, status) VALUES
('011_technical_sheets.sql', CURRENT_TIMESTAMP, 'completed');

