-- Ingredient Normalization SQL Script
-- Generated: 2026-02-13T04:49:27.674Z
-- Purpose: Standardize and unify ingredient names
-- 
-- ⚠️  IMPORTANT: Backup your database before running this script!
--

BEGIN TRANSACTION;

-- ==========================================
-- STEP 1: Update recipe references
-- ==========================================
-- Replace duplicate ingredient references in recipes with canonical ingredient IDs

-- 1. Merge "Ardei roșu" → "Ardei gras"
UPDATE recipes SET ingredient_id = undefined WHERE ingredient_id = undefined;
-- Update stock transfers
UPDATE stock_movements SET ingredient_id = undefined WHERE ingredient_id = undefined;

-- 2. Merge "Ardei galben" → "Ardei gras"
UPDATE recipes SET ingredient_id = undefined WHERE ingredient_id = undefined;
-- Update stock transfers
UPDATE stock_movements SET ingredient_id = undefined WHERE ingredient_id = undefined;

-- 3. Merge "Ardei verde" → "Ardei gras"
UPDATE recipes SET ingredient_id = undefined WHERE ingredient_id = undefined;
-- Update stock transfers
UPDATE stock_movements SET ingredient_id = undefined WHERE ingredient_id = undefined;


-- ==========================================
-- STEP 2: Mark duplicate ingredients as hidden
-- ==========================================
-- Keep duplicates in database but mark as hidden to preserve data integrity

-- 1. Hide "Ardei roșu"
UPDATE ingredients SET is_hidden = 1, is_active = 0, notes = 'Merged into: Ardei gras' WHERE id = undefined;

-- 2. Hide "Ardei galben"
UPDATE ingredients SET is_hidden = 1, is_active = 0, notes = 'Merged into: Ardei gras' WHERE id = undefined;

-- 3. Hide "Ardei verde"
UPDATE ingredients SET is_hidden = 1, is_active = 0, notes = 'Merged into: Ardei gras' WHERE id = undefined;


-- ==========================================
-- STEP 3: Normalize ingredient names
-- ==========================================
-- Apply standard naming conventions to remaining active ingredients

-- Normalize diacritics: ceapa → ceapă
UPDATE ingredients 
SET name = REPLACE(name, 'ceapa', 'ceapă') 
WHERE name LIKE '%ceapa%' AND is_active = 1;

-- Normalize diacritics: paine → pâine
UPDATE ingredients 
SET name = REPLACE(name, 'paine', 'pâine') 
WHERE name LIKE '%paine%' AND is_active = 1;

-- Normalize diacritics: faina → făină
UPDATE ingredients 
SET name = REPLACE(name, 'faina', 'făină') 
WHERE name LIKE '%faina%' AND is_active = 1;

-- Normalize diacritics: muschi → mușchi
UPDATE ingredients 
SET name = REPLACE(name, 'muschi', 'mușchi') 
WHERE name LIKE '%muschi%' AND is_active = 1;

-- Normalize diacritics: ceafa → ceafă
UPDATE ingredients 
SET name = REPLACE(name, 'ceafa', 'ceafă') 
WHERE name LIKE '%ceafa%' AND is_active = 1;

-- Normalize diacritics: pulpa → pulpă
UPDATE ingredients 
SET name = REPLACE(name, 'pulpa', 'pulpă') 
WHERE name LIKE '%pulpa%' AND is_active = 1;


-- ==========================================
-- STEP 4: Verify integrity
-- ==========================================
-- Check for orphaned recipe entries (should return 0 rows)

SELECT r.id, r.product_id, r.ingredient_id 
FROM recipes r 
LEFT JOIN ingredients i ON r.ingredient_id = i.id 
WHERE i.id IS NULL;

-- ==========================================
-- STEP 5: Generate summary
-- ==========================================

SELECT 
    'Active Ingredients' as category,
    COUNT(*) as count
FROM ingredients 
WHERE is_active = 1 AND is_hidden = 0
UNION ALL
SELECT 
    'Hidden/Merged Ingredients' as category,
    COUNT(*) as count
FROM ingredients 
WHERE is_hidden = 1 OR is_active = 0;

-- ==========================================
-- End of normalization
-- ==========================================

COMMIT;

-- ✅ Normalization complete!
-- 
-- POST-EXECUTION CHECKLIST:
-- [ ] Verify recipe integrity
-- [ ] Check stock movement history
-- [ ] Update product costs if needed
-- [ ] Clear application caches
-- [ ] Test recipe calculations
