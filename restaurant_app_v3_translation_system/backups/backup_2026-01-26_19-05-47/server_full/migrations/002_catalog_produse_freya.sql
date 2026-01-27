-- ============================================================================
-- MIGRATION 002: CATALOG PRODUSE - MODERN STYLE ENHANCEMENTS
-- ============================================================================
-- Created: 23 Oct 2025
-- Purpose: Add missing columns to menu table for MODERN-style catalog
-- ============================================================================

-- Add missing columns to menu table
ALTER TABLE menu ADD COLUMN unit TEXT DEFAULT 'buc';
ALTER TABLE menu ADD COLUMN stock_management TEXT DEFAULT 'Bar';
ALTER TABLE menu ADD COLUMN preparation_section TEXT DEFAULT 'BAR';
ALTER TABLE menu ADD COLUMN is_fraction INTEGER DEFAULT 0;
ALTER TABLE menu ADD COLUMN has_recipe INTEGER DEFAULT 0;
ALTER TABLE menu ADD COLUMN display_order INTEGER DEFAULT 0;
ALTER TABLE menu ADD COLUMN is_active INTEGER DEFAULT 1;

-- Create categories table with hierarchical support
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    name_en TEXT,
    parent_id INTEGER,
    icon TEXT,
    display_order INTEGER DEFAULT 0,
    is_expanded INTEGER DEFAULT 1,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Create price history table for audit trail
CREATE TABLE IF NOT EXISTS product_price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    old_price REAL,
    new_price REAL,
    old_vat_rate REAL,
    new_vat_rate REAL,
    changed_by TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (product_id) REFERENCES menu(id) ON DELETE CASCADE
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_menu_category ON menu(category);
CREATE INDEX IF NOT EXISTS idx_menu_stock_management ON menu(stock_management);
CREATE INDEX IF NOT EXISTS idx_menu_is_sellable ON menu(is_sellable);
CREATE INDEX IF NOT EXISTS idx_menu_is_active ON menu(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);

-- Insert default categories hierarchy
INSERT INTO categories (id, name, name_en, parent_id, icon, display_order, is_expanded) VALUES
-- Root categories
(1, 'Băuturi Alcoolice', 'Alcoholic Beverages', NULL, '🍺', 1, 1),
(2, 'Băuturi Răcoritoare', 'Soft Drinks', NULL, '🧃', 2, 1),
(3, 'Pizza', 'Pizza', NULL, '🍕', 3, 1),
(4, 'Burgeri', 'Burgers', NULL, '🍔', 4, 1),
(5, 'Paste', 'Pasta', NULL, '🍝', 5, 1),
(6, 'Salate', 'Salads', NULL, '🥗', 6, 1),
(7, 'Deserturi', 'Desserts', NULL, '🍰', 7, 1),
(8, 'Ciorbe', 'Soups', NULL, '🍲', 8, 1),
(9, 'Aperitive', 'Appetizers', NULL, '🥙', 9, 1),
(10, 'Fel Principal', 'Main Course', NULL, '🥩', 10, 1),

-- Sub-categories for Băuturi Alcoolice
(11, 'Bere', 'Beer', 1, '🍺', 1, 1),
(12, 'Vin', 'Wine', 1, '🍷', 2, 1),
(13, 'Vodcă', 'Vodka', 1, '🥃', 3, 1),
(14, 'Whisky', 'Whisky', 1, '🥃', 4, 1),
(15, 'Șampanie', 'Champagne', 1, '🍾', 5, 1),
(16, 'Cocktailuri', 'Cocktails', 1, '🍹', 6, 1),

-- Sub-categories for Băuturi Răcoritoare
(17, 'Cafea', 'Coffee', 2, '☕', 1, 1),
(18, 'Ceai', 'Tea', 2, '🍵', 2, 1),
(19, 'Sucuri', 'Juices', 2, '🥤', 3, 1),
(20, 'Apă', 'Water', 2, '💧', 4, 1),
(21, 'Băuturi Carbogazoase', 'Carbonated Drinks', 2, '🥤', 5, 1)
ON CONFLICT(id) DO NOTHING;

-- Update existing menu items with default values for new columns
UPDATE menu SET 
    unit = CASE 
        WHEN category IN ('Beverages', 'Băuturi și Coctailuri', 'Coffee/Ciocolată/Tea', 'Răcoritoare') THEN 'buc'
        WHEN category IN ('Ciorbe', 'Paste Fresca', 'Penne Al Forno') THEN 'porție'
        WHEN category IN ('Pizza') THEN 'buc'
        ELSE 'buc'
    END,
    stock_management = CASE
        WHEN category IN ('Beverages', 'Băuturi și Coctailuri', 'Coffee/Ciocolată/Tea', 'Răcoritoare') THEN 'Bar'
        ELSE 'Bucătărie'
    END,
    preparation_section = CASE
        WHEN category IN ('Beverages', 'Băuturi și Coctailuri', 'Coffee/Ciocolată/Tea', 'Răcoritoare') THEN 'BAR'
        WHEN category IN ('Pizza') THEN 'PIZZERIE'
        WHEN category IN ('Desserts', 'Deserturi') THEN 'PATISERIE'
        ELSE 'BUCĂTĂRIE'
    END,
    is_active = is_sellable,
    display_order = id
WHERE unit IS NULL OR stock_management IS NULL;

-- Mark products with recipes
UPDATE menu SET has_recipe = 1 WHERE id IN (SELECT DISTINCT product_id FROM recipes);

-- Record migration
INSERT OR IGNORE INTO migrations (version, description) 
VALUES ('002', 'Catalog Produse - MODERN Style Enhancements');

-- ============================================================================
-- END OF MIGRATION 002
-- ============================================================================

