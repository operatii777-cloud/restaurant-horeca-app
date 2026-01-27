-- ============================================================================
-- MIGRATION: ADAPTIVE WEIGHT SYSTEM FOR PDF LAYOUT
-- ============================================================================
-- Data: 02 Noiembrie 2025
-- Scop: Sistem adaptiv de împachetare bazat pe greutate pentru layout PDF
-- Funcționalități:
--   - Configurare greutăți globale (max pagină, min ultima pagină)
--   - Greutăți personalizate per produs
--   - Control automat vs manual pentru page breaks
--   - Forțare categorie pe pagină nouă
-- ============================================================================

-- ============================================================================
-- TABEL 1: CONFIGURARE GLOBALĂ GREUTĂȚI PDF
-- ============================================================================
CREATE TABLE IF NOT EXISTS menu_pdf_weight_config (
  id INTEGER PRIMARY KEY CHECK (id = 1), -- Doar 1 rând de configurare globală
  
  -- GREUTĂȚI MAXIME/MINIME
  max_page_weight REAL DEFAULT 8.5,      -- Greutate maximă per pagină (echivalent 8-9 produse simple)
  min_last_page_weight REAL DEFAULT 4.0, -- Greutate minimă pe ultima pagină (echivalent 4 produse)
  
  -- GREUTĂȚI STANDARD
  base_product_weight REAL DEFAULT 1.0,  -- Greutate bază produs (Nume + Preț)
  
  -- BONUSURI DESCRIERE
  medium_description_bonus REAL DEFAULT 0.5,  -- +0.5 pentru descriere 50-100 caractere
  medium_description_threshold INTEGER DEFAULT 50,
  long_description_bonus REAL DEFAULT 1.0,    -- +1.0 pentru descriere >100 caractere
  long_description_threshold INTEGER DEFAULT 100,
  
  -- BONUSURI ALERGENI
  allergens_bonus REAL DEFAULT 0.3,      -- +0.3 dacă are alergeni declarați
  
  -- BONUSURI IMAGINE
  product_image_bonus REAL DEFAULT 1.5,  -- +1.5 dacă are imagine produs (DEZACTIVAT momentan)
  
  -- BONUSURI SPECIALE
  special_badge_bonus REAL DEFAULT 0.2,  -- +0.2 pentru badge-uri (Nou, Vegan, Promoție, etc.)
  
  -- CONTROL LAYOUT
  force_category_new_page INTEGER DEFAULT 0,  -- 1 = Fiecare categorie începe pe pagină nouă
  use_adaptive_weight INTEGER DEFAULT 1,      -- 1 = Folosește greutăți, 0 = Folosește număr fix (8 produse)
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Populare configurare implicită
INSERT OR IGNORE INTO menu_pdf_weight_config (id) VALUES (1);

-- ============================================================================
-- TABEL 2: EXTINDERE menu_pdf_products CU GREUTĂȚI PERSONALIZATE
-- ============================================================================

-- Adaugă coloane noi la tabelul existent
ALTER TABLE menu_pdf_products ADD COLUMN custom_weight REAL DEFAULT NULL;
-- NULL = folosește calculul automat, valoare numerică = override manual

ALTER TABLE menu_pdf_products ADD COLUMN force_page_break_after INTEGER DEFAULT 0;
-- 1 = forțează page break după acest produs (control manual total)

ALTER TABLE menu_pdf_products ADD COLUMN special_badges TEXT DEFAULT NULL;
-- JSON array cu badge-uri: ["new", "vegan", "promo", "spicy", "chef_special"]
-- Exemplu: '["new", "vegan"]'

-- ============================================================================
-- TABEL 3: EXTINDERE menu_pdf_categories CU CONTROL AVANSAT
-- ============================================================================

ALTER TABLE menu_pdf_categories ADD COLUMN force_new_page_start INTEGER DEFAULT 0;
-- 1 = Categoria începe ÎNTOTDEAUNA pe pagină nouă (override global setting)

ALTER TABLE menu_pdf_categories ADD COLUMN max_products_per_page INTEGER DEFAULT NULL;
-- NULL = folosește logica adaptivă, valoare numerică = override manual pentru această categorie

-- ============================================================================
-- VIEW: Calculul Automat al Greutăților pentru Produse
-- ============================================================================
CREATE VIEW IF NOT EXISTS menu_pdf_product_weights AS
SELECT 
  m.id AS product_id,
  m.name,
  m.description,
  m.allergens,
  m.image_url,
  pdfp.custom_weight,
  pdfp.special_badges,
  pdfp.force_page_break_after,
  cfg.base_product_weight,
  
  -- CALCULUL GREUTĂȚII AUTOMATE
  CASE 
    WHEN pdfp.custom_weight IS NOT NULL THEN pdfp.custom_weight
    ELSE (
      cfg.base_product_weight +
      
      -- Bonus descriere medie (50-100 caractere)
      CASE 
        WHEN LENGTH(COALESCE(m.description, '')) >= cfg.medium_description_threshold 
         AND LENGTH(COALESCE(m.description, '')) < cfg.long_description_threshold 
        THEN cfg.medium_description_bonus
        ELSE 0
      END +
      
      -- Bonus descriere lungă (>100 caractere)
      CASE 
        WHEN LENGTH(COALESCE(m.description, '')) >= cfg.long_description_threshold 
        THEN cfg.long_description_bonus
        ELSE 0
      END +
      
      -- Bonus alergeni
      CASE 
        WHEN m.allergens IS NOT NULL AND m.allergens != '[]' AND m.allergens != '' 
        THEN cfg.allergens_bonus
        ELSE 0
      END +
      
      -- Bonus imagine produs (DEZACTIVAT - image_url întotdeauna NULL în PDF)
      -- CASE 
      --   WHEN m.image_url IS NOT NULL AND m.image_url != '' 
      --   THEN cfg.product_image_bonus
      --   ELSE 0
      -- END +
      
      -- Bonus badge-uri speciale
      CASE 
        WHEN pdfp.special_badges IS NOT NULL AND pdfp.special_badges != '[]' 
        THEN cfg.special_badge_bonus * (
          -- Numără badge-urile (aproximativ)
          (LENGTH(pdfp.special_badges) - LENGTH(REPLACE(pdfp.special_badges, ',', '')) + 1)
        )
        ELSE 0
      END
    )
  END AS calculated_weight,
  
  -- Metadata pentru debugging
  LENGTH(COALESCE(m.description, '')) AS description_length,
  CASE WHEN m.allergens IS NOT NULL AND m.allergens != '[]' THEN 1 ELSE 0 END AS has_allergens,
  CASE WHEN pdfp.special_badges IS NOT NULL AND pdfp.special_badges != '[]' THEN 1 ELSE 0 END AS has_badges
  
FROM menu m
LEFT JOIN menu_pdf_products pdfp ON m.id = pdfp.product_id
CROSS JOIN menu_pdf_weight_config cfg
WHERE m.is_sellable = 1
  AND (pdfp.display_in_pdf IS NULL OR pdfp.display_in_pdf = 1);

-- ============================================================================
-- TRIGGER: Update timestamp pe modificare configurare
-- ============================================================================
CREATE TRIGGER IF NOT EXISTS update_weight_config_timestamp
AFTER UPDATE ON menu_pdf_weight_config
FOR EACH ROW
BEGIN
  UPDATE menu_pdf_weight_config 
  SET updated_at = CURRENT_TIMESTAMP 
  WHERE id = 1;
END;

-- ============================================================================
-- FUNCȚII HELPER (Implementate în Node.js, documentate aici)
-- ============================================================================

-- getAdaptivePageBreaks(categoryName, lang)
--   Input: Nume categorie, limba
--   Output: Array de poziții unde trebuie page break
--   Algoritm:
--     1. Obține produse ordonate pentru categorie
--     2. Obține greutăți calculate din VIEW
--     3. Iterează prin produse:
--        - currentPageWeight = 0
--        - Pentru fiecare produs:
--          - Dacă force_page_break_after = 1 → adaugă break
--          - Altfel dacă currentPageWeight + productWeight > max_page_weight:
--            → adaugă break ÎNAINTE de produs
--            → currentPageWeight = productWeight
--          - Altfel:
--            → currentPageWeight += productWeight
--     4. Validare ultima pagină:
--        - Dacă lastPageWeight < min_last_page_weight:
--          → Redistribuie (mută ultimul produs de pe penultima pagină)
--     5. Return array pozițiilor de break

-- ============================================================================
-- EXEMPLE DE CONFIGURARE
-- ============================================================================

-- Exemplu 1: Configurare conservatoare (mai multe produse pe pagină)
-- UPDATE menu_pdf_weight_config SET 
--   max_page_weight = 10.0,
--   min_last_page_weight = 5.0,
--   medium_description_bonus = 0.3,
--   long_description_bonus = 0.7;

-- Exemplu 2: Configurare strictă (mai puține produse pe pagină, mai mult spațiu)
-- UPDATE menu_pdf_weight_config SET 
--   max_page_weight = 7.0,
--   min_last_page_weight = 3.5,
--   medium_description_bonus = 0.7,
--   long_description_bonus = 1.5;

-- Exemplu 3: Forțare categorie pe pagină nouă (toate categoriile)
-- UPDATE menu_pdf_weight_config SET force_category_new_page = 1;

-- Exemplu 4: Forțare categorie specifică pe pagină nouă
-- UPDATE menu_pdf_categories 
-- SET force_new_page_start = 1 
-- WHERE category_name = 'Deserturi';

-- Exemplu 5: Greutate personalizată pentru un produs complex
-- UPDATE menu_pdf_products 
-- SET custom_weight = 2.5 
-- WHERE product_id = (SELECT id FROM menu WHERE name = 'Platou Mixt Deluxe');

-- Exemplu 6: Forțare page break manual după un produs
-- UPDATE menu_pdf_products 
-- SET force_page_break_after = 1 
-- WHERE product_id = (SELECT id FROM menu WHERE name = 'Pizza Quattro Stagioni');

-- Exemplu 7: Adăugare badge-uri speciale
-- UPDATE menu_pdf_products 
-- SET special_badges = '["new", "chef_special", "spicy"]'
-- WHERE product_id = (SELECT id FROM menu WHERE name = 'Burger Infernal');

-- ============================================================================
-- VERIFICARE MIGRATION
-- ============================================================================
SELECT 'Adaptive Weight System Migration completed!' AS status;
SELECT * FROM menu_pdf_weight_config;
SELECT COUNT(*) AS products_with_calculated_weights FROM menu_pdf_product_weights;

-- Afișează primele 10 produse cu greutățile calculate
SELECT 
  product_id,
  name,
  description_length,
  has_allergens,
  has_badges,
  calculated_weight,
  custom_weight
FROM menu_pdf_product_weights
LIMIT 10;

