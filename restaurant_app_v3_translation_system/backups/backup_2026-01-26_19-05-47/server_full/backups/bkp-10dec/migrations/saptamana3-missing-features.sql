-- ============================================================================
-- MIGRATION: SĂPTĂMÂNA 3 - Funcționalități Lipsă
-- Data: 2025-01-24
-- Scop: Adăugare doar ce lipsește, fără duplicate
-- ============================================================================

-- 1. EXTINDERE TABEL ALLERGENS (doar câmpurile lipsă)
-- Tabelul allergens există dar nu are toate câmpurile necesare

ALTER TABLE allergens ADD COLUMN code TEXT UNIQUE;
ALTER TABLE allergens ADD COLUMN sort_order INTEGER;
ALTER TABLE allergens ADD COLUMN description_ro TEXT;
ALTER TABLE allergens ADD COLUMN description_en TEXT;
ALTER TABLE allergens ADD COLUMN regulation_reference TEXT;
ALTER TABLE allergens ADD COLUMN severity TEXT DEFAULT 'high';

-- 2. TABEL INGREDIENT_ADDITIVES (nou - nu există)
CREATE TABLE IF NOT EXISTS ingredient_additives (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ingredient_id INTEGER NOT NULL,
  additive_id INTEGER NOT NULL,
  concentration TEXT,  -- 'traces', 'low', 'medium', 'high'
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients (id) ON DELETE CASCADE,
  FOREIGN KEY (additive_id) REFERENCES additives_catalog (id) ON DELETE CASCADE,
  UNIQUE (ingredient_id, additive_id)
);

CREATE INDEX IF NOT EXISTS idx_ingredient_additives_ingredient ON ingredient_additives(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_ingredient_additives_additive ON ingredient_additives(additive_id);

-- 3. TABEL PRODUCTS_86_LIST (nou - nu există)
CREATE TABLE IF NOT EXISTS products_86_list (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  reason TEXT NOT NULL,  -- 'out_of_stock', 'quality_issue', 'kitchen_issue', 'manual'
  added_by INTEGER,
  notes TEXT,
  auto_remove BOOLEAN DEFAULT 1,  -- Remove when stock available
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  removed_at DATETIME,
  FOREIGN KEY (product_id) REFERENCES menu (id),
  FOREIGN KEY (added_by) REFERENCES users (id)
);

CREATE INDEX IF NOT EXISTS idx_products_86_list_product ON products_86_list(product_id);
CREATE INDEX IF NOT EXISTS idx_products_86_list_active ON products_86_list(removed_at);

-- 4. TABEL CUSTOMER_ALLERGEN_PROFILES (nou - nu există)
CREATE TABLE IF NOT EXISTS customer_allergen_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER,
  customer_name TEXT,
  customer_phone TEXT,
  allergen_ids TEXT,  -- JSON array: ["1", "3", "7"]
  allergen_names TEXT,  -- "Gluten, Ouă, Lapte"
  severity TEXT DEFAULT 'moderate',  -- 'mild', 'moderate', 'severe', 'life_threatening'
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers (id)
);

CREATE INDEX IF NOT EXISTS idx_customer_allergen_profiles_customer ON customer_allergen_profiles(customer_id);

-- 5. EXTINDERE TABEL ORDERS (doar câmpurile lipsă)
ALTER TABLE orders ADD COLUMN cogs REAL DEFAULT 0;
ALTER TABLE orders ADD COLUMN gross_profit REAL DEFAULT 0;
ALTER TABLE orders ADD COLUMN food_cost_percentage REAL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_orders_cogs ON orders(cogs);
CREATE INDEX IF NOT EXISTS idx_orders_date_cogs ON orders(created_at, cogs);

-- 6. VERIFICARE additives_catalog (există în migrations dar trebuie integrat în database.js)
-- Tabelul există în create-ingredient-catalog.sql dar nu este în database.js
-- Va fi adăugat în database.js dacă nu există

