-- ============================================================================
-- CATALOG REȚETE TEMPLATE - White Label System
-- Data: 05 Noiembrie 2025
-- Scop: Catalog rețete pre-definite pentru restaurante noi
-- ============================================================================

-- TABEL PRINCIPAL: RECIPE TEMPLATES (catalog rețete)
-- Fiecare template = un produs (Pizza, Burger, Paste, etc.)
CREATE TABLE IF NOT EXISTS recipe_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- IDENTIFICARE PRODUS
    name TEXT NOT NULL,                     -- "Pizza Margherita"
    name_en TEXT,                           -- "Margherita Pizza"
    category TEXT NOT NULL,                 -- "Pizza"
    category_en TEXT,
    
    -- DESCRIERE
    description TEXT,
    description_en TEXT,
    
    -- CARACTERISTICI
    is_vegetarian BOOLEAN DEFAULT 0,
    is_vegan BOOLEAN DEFAULT 0,
    is_spicy BOOLEAN DEFAULT 0,
    spice_level INTEGER DEFAULT 0,          -- 0-3
    
    -- ALERGENI & ADITIVI (calculate automat din ingrediente)
    allergens TEXT,                         -- JSON: ["Gluten", "Lapte"]
    allergens_en TEXT,
    additives TEXT,                         -- JSON: [{"code":"E100","name":"Curcumină"}]
    additives_en TEXT,
    
    -- VALORI NUTRIȚIONALE (calculate automat din ingrediente)
    calories DECIMAL(10,2),                 -- kcal per porție
    protein DECIMAL(10,2),                  -- g per porție
    carbs DECIMAL(10,2),                    -- g per porție
    fat DECIMAL(10,2),                      -- g per porție
    fiber DECIMAL(10,2),                    -- g per porție
    salt DECIMAL(10,2),                     -- g per porție
    
    -- COST ESTIMAT (calculate din ingrediente)
    estimated_cost DECIMAL(10,2),           -- RON per porție (cost ingrediente)
    suggested_price DECIMAL(10,2),          -- RON (preț sugerat, markup 200-300%)
    
    -- TIMP PREPARARE
    prep_time INTEGER,                      -- minute
    
    -- METADATA
    template_category TEXT,                 -- "Popular", "Signature", "Sezonier"
    difficulty_level TEXT,                  -- "Ușor", "Mediu", "Avansat"
    cuisine_type TEXT,                      -- "Italiană", "Românească", "Internațională"
    serving_size TEXT,                      -- "250g", "1 porție", "500ml"
    
    -- FLAGS
    is_active BOOLEAN DEFAULT 1,
    is_popular BOOLEAN DEFAULT 0,           -- Rețete populare (afișate primul)
    is_seasonal BOOLEAN DEFAULT 0,
    season_months TEXT,                     -- JSON: [5,6,7,8] - Mai-August
    
    -- IMAGINE
    image_url TEXT,                         -- URL imagine template
    
    -- AUDIT
    source TEXT DEFAULT 'Restaurant original', -- "Restaurant original", "Manual", "Import"
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- INDEX pentru căutare rapidă
    UNIQUE(name, category)
);

-- ============================================================================
-- TABEL AUXILIAR: RECIPE TEMPLATE INGREDIENTS (ingredientele rețetei)
-- ============================================================================

CREATE TABLE IF NOT EXISTS recipe_template_ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- REFERINȚE
    recipe_template_id INTEGER NOT NULL,
    catalog_ingredient_id INTEGER NOT NULL,  -- ID din ingredient_catalog
    
    -- CANTITATE
    quantity_needed DECIMAL(10,3) NOT NULL,
    unit TEXT NOT NULL,                      -- "kg", "g", "l", "ml", "buc"
    
    -- PROCESARE
    waste_percentage DECIMAL(5,2) DEFAULT 0, -- % pierdere la curățare/gătire
    variable_consumption TEXT,               -- JSON: {"small": 0.8, "medium": 1.0, "large": 1.2}
    item_type TEXT DEFAULT 'ingredient',     -- "ingredient", "packaging_restaurant", "packaging_delivery"
    
    -- METADATA
    is_optional BOOLEAN DEFAULT 0,           -- Ingredient opțional
    preparation_notes TEXT,                  -- "Se taie cubulețe", "Se mărunțește fin"
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (recipe_template_id) REFERENCES recipe_templates(id) ON DELETE CASCADE,
    FOREIGN KEY (catalog_ingredient_id) REFERENCES ingredient_catalog(id)
);

-- ============================================================================
-- INDEX-URI pentru performanță
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_recipe_templates_name ON recipe_templates(name);
CREATE INDEX IF NOT EXISTS idx_recipe_templates_category ON recipe_templates(category);
CREATE INDEX IF NOT EXISTS idx_recipe_templates_popular ON recipe_templates(is_popular);
CREATE INDEX IF NOT EXISTS idx_recipe_templates_active ON recipe_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_recipe_template_ingredients_recipe ON recipe_template_ingredients(recipe_template_id);
CREATE INDEX IF NOT EXISTS idx_recipe_template_ingredients_ingredient ON recipe_template_ingredients(catalog_ingredient_id);

-- ============================================================================
-- VIEW: Rețete cu ingrediente expanded
-- ============================================================================

CREATE VIEW IF NOT EXISTS recipe_templates_with_ingredients AS
SELECT 
    rt.*,
    COUNT(DISTINCT rti.catalog_ingredient_id) as ingredient_count,
    SUM(rti.quantity_needed * ic.estimated_cost_per_kg) as calculated_cost
FROM recipe_templates rt
LEFT JOIN recipe_template_ingredients rti ON rt.id = rti.recipe_template_id
LEFT JOIN ingredient_catalog ic ON rti.catalog_ingredient_id = ic.id
GROUP BY rt.id;

-- ============================================================================
-- COMENTARII DOCUMENTARE
-- ============================================================================

-- recipe_templates = CATALOG de rețete (template pentru restaurante noi)
-- recipe_template_ingredients = Ingrediente pentru fiecare template rețetă

-- FLOW WHITE LABEL:
-- 1. Restaurant nou deschide admin-catalog-retete.html
-- 2. Vede lista de rețete template (Pizza Margherita, Burger Clasic, etc.)
-- 3. Click pe rețetă → vezi ingrediente, cantități, cost estimat
-- 4. Click "Adaugă în Meniu" → se copiază în tabela menu + recipes
-- 5. Restaurant setează: preț final, poză, descriere personalizată
-- 6. Produsul apare în comanda.html (interfața client)

-- RELAȚIA:
-- recipe_templates (catalog) → menu (produse restaurantului)
-- recipe_template_ingredients (catalog) → recipes (rețete restaurantului)

