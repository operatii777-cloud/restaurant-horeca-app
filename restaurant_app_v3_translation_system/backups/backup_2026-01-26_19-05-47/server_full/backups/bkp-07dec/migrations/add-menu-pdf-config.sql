-- ============================================================================
-- MIGRATION: ADD MENU PDF CONFIGURATION TABLES
-- ============================================================================
-- Data: 30 Octombrie 2025
-- Scop: Configurare avansată pentru generare PDF meniuri
-- Funcționalități:
--   - Toggle categorii ON/OFF în PDF
--   - Reordonare categorii (drag & drop)
--   - Upload imagini header pentru categorii
--   - Toggle produse individuale ON/OFF
--   - Page breaks manuale după categorii
-- ============================================================================

-- ============================================================================
-- TABEL 1: CONFIGURARE CATEGORII PDF
-- ============================================================================
CREATE TABLE IF NOT EXISTS menu_pdf_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_name TEXT NOT NULL,           -- Numele categoriei (ex: "Platouri Reci")
  category_type TEXT NOT NULL,           -- 'food' sau 'drinks'
  display_in_pdf INTEGER DEFAULT 1,      -- 0 = ascuns, 1 = vizibil
  order_index INTEGER DEFAULT 0,         -- Ordinea de afișare (0, 1, 2, ...)
  header_image TEXT,                     -- Path la imagine header (ex: /images/menu/categories/platouri.jpg)
  page_break_after INTEGER DEFAULT 0,    -- 1 = forțează pagină nouă după această categorie
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index pentru căutare rapidă
CREATE INDEX IF NOT EXISTS idx_menu_pdf_categories_type ON menu_pdf_categories(category_type);
CREATE INDEX IF NOT EXISTS idx_menu_pdf_categories_order ON menu_pdf_categories(order_index);

-- ============================================================================
-- TABEL 2: CONFIGURARE PRODUSE PDF
-- ============================================================================
CREATE TABLE IF NOT EXISTS menu_pdf_products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,           -- ID produs din tabelul menu
  display_in_pdf INTEGER DEFAULT 1,      -- 0 = ascuns, 1 = vizibil
  custom_image TEXT,                     -- Override imagine produs (opțional)
  custom_order INTEGER,                  -- Ordine custom în categorie (NULL = ordine normală)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES menu(id) ON DELETE CASCADE
);

-- Index pentru căutare rapidă
CREATE INDEX IF NOT EXISTS idx_menu_pdf_products_product_id ON menu_pdf_products(product_id);

-- ============================================================================
-- TABEL 3: LOG REGENERĂRI PDF (pentru audit)
-- ============================================================================
CREATE TABLE IF NOT EXISTS menu_pdf_regeneration_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pdf_type TEXT NOT NULL,                -- 'food_ro', 'food_en', 'drinks_ro', 'drinks_en', 'all'
  triggered_by TEXT,                     -- 'manual', 'auto', 'admin_user'
  success INTEGER DEFAULT 1,             -- 1 = success, 0 = error
  error_message TEXT,
  generation_time_ms INTEGER,            -- Timp de generare în milisecunde
  file_size_kb INTEGER,                  -- Dimensiune fișier generat
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- POPULARE INIȚIALĂ: Toate categoriile existente ACTIVE by default
-- ============================================================================

-- Identificăm toate categoriile unice din tabelul menu pentru FOOD
INSERT OR IGNORE INTO menu_pdf_categories (category_name, category_type, display_in_pdf, order_index)
SELECT DISTINCT 
  category,
  'food',
  1,
  ROW_NUMBER() OVER (ORDER BY category) - 1
FROM menu
WHERE category NOT IN ('Bauturi Racoritoare', 'Vinuri', 'Bauturi Calde', 'Bauturi Alcoolice')
ORDER BY category;

-- Identificăm toate categoriile unice din tabelul menu pentru DRINKS
INSERT OR IGNORE INTO menu_pdf_categories (category_name, category_type, display_in_pdf, order_index)
SELECT DISTINCT 
  category,
  'drinks',
  1,
  ROW_NUMBER() OVER (ORDER BY category) - 1
FROM menu
WHERE category IN ('Bauturi Racoritoare', 'Vinuri', 'Bauturi Calde', 'Bauturi Alcoolice')
ORDER BY category;

-- ============================================================================
-- POPULARE INIȚIALĂ: Toate produsele ACTIVE by default
-- ============================================================================
INSERT OR IGNORE INTO menu_pdf_products (product_id, display_in_pdf)
SELECT id, 1
FROM menu
WHERE is_active = 1;

-- ============================================================================
-- TRIGGER: Sincronizare automată când se adaugă produse noi
-- ============================================================================
CREATE TRIGGER IF NOT EXISTS sync_new_products_to_pdf_config
AFTER INSERT ON menu
FOR EACH ROW
BEGIN
  -- Adaugă produsul nou în configurația PDF (activ by default)
  INSERT OR IGNORE INTO menu_pdf_products (product_id, display_in_pdf)
  VALUES (NEW.id, 1);
  
  -- Adaugă categoria nouă dacă nu există
  INSERT OR IGNORE INTO menu_pdf_categories (category_name, category_type, display_in_pdf, order_index)
  VALUES (
    NEW.category,
    CASE 
      WHEN NEW.category IN ('Bauturi Racoritoare', 'Vinuri', 'Bauturi Calde', 'Bauturi Alcoolice') THEN 'drinks'
      ELSE 'food'
    END,
    1,
    (SELECT COALESCE(MAX(order_index), -1) + 1 FROM menu_pdf_categories)
  );
END;

-- ============================================================================
-- VERIFICARE MIGRATION
-- ============================================================================
SELECT 'Migration completed successfully!' AS status;
SELECT COUNT(*) AS total_pdf_categories FROM menu_pdf_categories;
SELECT COUNT(*) AS total_pdf_products FROM menu_pdf_products;

