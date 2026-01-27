-- ═══════════════════════════════════════════════════════════════════════════════
-- ⛔ ATENȚIE: SCRIPT ÎNVECHIT ȘI PERICULOS! NU RULA!
-- ═══════════════════════════════════════════════════════════════════════════════
-- 
-- ACEST SCRIPT A FOST GENERAT ÎNAINTE DE CLARIFICĂRI IMPORTANTE!
-- 
-- PROBLEMA: Șterge automat "duplicate" care de fapt sunt PRODUSE DIFERITE:
--   - Cartofi proaspeți vs Cartofi congelați
--   - Orez clasic vs Orez basmati vs Orez sălbatic
--   - Lapte lichid vs Lapte condensat
--   - Pătrunjel proaspăt vs Pătrunjel uscat
--   - Etc.
--
-- ❌ NU RULA ACEST SCRIPT!
-- ✅ Folosește LISTA-DUPLICATE-VERIFICARE.md pentru verificare manuală
-- ✅ Așteaptă scriptul NOU generat după verificare
--
-- ═══════════════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────────────
-- FAZA 0: VERIFICARE ÎNAINTE DE START
-- ───────────────────────────────────────────────────────────────────────────────

SELECT '=== STATISTICI ÎNAINTE DE CURĂȚENIE ===' as Section;

SELECT 
  'Total ingrediente' as metric,
  COUNT(*) as valoare
FROM ingredients
UNION ALL
SELECT 
  'Ingrediente cu stoc NULL',
  COUNT(*) 
FROM ingredients 
WHERE current_stock IS NULL
UNION ALL
SELECT 
  'Ingrediente cu stoc negativ',
  COUNT(*) 
FROM ingredients 
WHERE current_stock < 0
UNION ALL
SELECT 
  'Rețete orfane (ingredient lipsă)',
  COUNT(*) 
FROM recipes r
LEFT JOIN ingredients i ON r.ingredient_id = i.id
WHERE i.id IS NULL;

-- ───────────────────────────────────────────────────────────────────────────────
-- FAZA 1: FIX VALORI INVALIDE (URGENT)
-- ───────────────────────────────────────────────────────────────────────────────

BEGIN TRANSACTION;

SELECT '=== FAZA 1: FIX VALORI INVALIDE ===' as Section;

-- 1.1 Corectare valori NEGATIVE → 0
UPDATE ingredients 
SET current_stock = 0 
WHERE current_stock < 0;

SELECT '✅ Corectat ' || changes() || ' valori negative → 0' as result;

-- 1.2 Șterge duplicate NULL (lowercase, valori invalide)
DELETE FROM ingredients 
WHERE id IN (1, 2, 3);  -- ouă, șuncă, mozzarella (lowercase cu NULL)

SELECT '✅ Șters ' || changes() || ' duplicate NULL' as result;

-- 1.3 Fix ENCODING
UPDATE ingredients SET name = 'Brânză Mozzarella' WHERE id = 146;
UPDATE ingredients SET name = 'Pâine' WHERE id = 148;
UPDATE ingredients SET name = 'Smântână' WHERE id = 147;

SELECT '✅ Corectat encoding pentru 3 articole' as result;

COMMIT;

-- ───────────────────────────────────────────────────────────────────────────────
-- FAZA 2: STANDARDIZARE UNITĂȚI
-- ───────────────────────────────────────────────────────────────────────────────

BEGIN TRANSACTION;

SELECT '=== FAZA 2: STANDARDIZARE UNITĂȚI ===' as Section;

-- 2.1 Standardizare litri (L vs l)
UPDATE ingredients 
SET unit = 'L' 
WHERE LOWER(unit) IN ('l', 'litri', 'litru');

SELECT '✅ Standardizat ' || changes() || ' unități litri → L' as result;

-- 2.2 Standardizare kilograme (kg vs KG vs Kg)
UPDATE ingredients 
SET unit = 'kg' 
WHERE LOWER(unit) IN ('kg', 'kilograme', 'kilogram');

SELECT '✅ Standardizat ' || changes() || ' unități kg' as result;

-- 2.3 Standardizare bucăți
UPDATE ingredients 
SET unit = 'buc' 
WHERE LOWER(unit) IN ('buc', 'bucăți', 'bucati', 'bucată');

SELECT '✅ Standardizat ' || changes() || ' unități bucăți → buc' as result;

-- 2.4 CONVERSIE ALCOOL: g → L (densitate alcool ~0.94 g/mL)
-- Formula: grame / 940 = litri (pentru alcool ~40% ABV)

UPDATE ingredients 
SET 
  current_stock = ROUND(current_stock / 940.0, 2),
  unit = 'L'
WHERE (
  name LIKE '%Whiskey%' 
  OR name LIKE '%Vodka%' OR name LIKE '%Vodcă%'
  OR name LIKE '%Gin%'
  OR name LIKE '%Rom%'
  OR name LIKE '%Tequila%'
  OR name LIKE '%Cognac%'
  OR name LIKE '%Brandy%'
  OR name LIKE '%Baileys%' OR name LIKE '%Bailey%'
  OR name LIKE '%Jägermeister%'
  OR name LIKE '%Campari%'
  OR name LIKE '%Martini%'
  OR name LIKE '%Aperol%'
)
AND unit = 'g';

SELECT '✅ Convertit ' || changes() || ' alcooluri din g → L' as result;

-- 2.5 Convertește g → kg pentru produse grele (> 5000g)
UPDATE ingredients 
SET 
  current_stock = ROUND(current_stock / 1000.0, 2),
  unit = 'kg'
WHERE unit = 'g' 
  AND current_stock > 5000
  AND name NOT LIKE '%Shaorma%';  -- Păstrăm Shaorma așa cum e

SELECT '✅ Convertit ' || changes() || ' articole grele din g → kg' as result;

COMMIT;

-- ───────────────────────────────────────────────────────────────────────────────
-- FAZA 3: MERGE DUPLICATE (CRITICE)
-- ───────────────────────────────────────────────────────────────────────────────

BEGIN TRANSACTION;

SELECT '=== FAZA 3: MERGE DUPLICATE ===' as Section;

-- 3.1 LAPTE (ID 53, 123, 145 → Master: 123)
UPDATE ingredients 
SET current_stock = (
  SELECT SUM(CASE 
    WHEN LOWER(unit) = 'l' THEN current_stock
    ELSE 0 
  END)
  FROM ingredients 
  WHERE LOWER(TRIM(name)) = 'lapte'
),
unit = 'L'
WHERE id = 123;

UPDATE recipes SET ingredient_id = 123 WHERE ingredient_id IN (53, 145);
DELETE FROM ingredients WHERE id IN (53, 145);

SELECT '✅ Merge LAPTE complet (3 → 1)' as result;

-- 3.2 USTUROI (ID 25, 95, 133 → Master: 95)
-- Convertim g → kg pentru ID 133
UPDATE ingredients 
SET current_stock = (
  SELECT 
    SUM(CASE 
      WHEN unit = 'g' THEN current_stock / 1000.0
      ELSE current_stock 
    END)
  FROM ingredients 
  WHERE LOWER(TRIM(name)) = 'usturoi'
),
unit = 'kg'
WHERE id = 95;

UPDATE recipes SET ingredient_id = 95 WHERE ingredient_id IN (25, 133);
DELETE FROM ingredients WHERE id IN (25, 133);

SELECT '✅ Merge USTUROI complet (3 → 1)' as result;

-- 3.3 CARTOFI (ID 32, 85, 139 → Master: 85)
UPDATE ingredients 
SET current_stock = (
  SELECT SUM(current_stock)
  FROM ingredients 
  WHERE LOWER(TRIM(name)) = 'cartofi'
),
unit = 'kg'
WHERE id = 85;

UPDATE recipes SET ingredient_id = 85 WHERE ingredient_id IN (32, 139);
DELETE FROM ingredients WHERE id IN (32, 139);

SELECT '✅ Merge CARTOFI complet (3 → 1)' as result;

-- 3.4 ROȘII (ID 6, 75 → Master: 75)
UPDATE ingredients 
SET current_stock = (
  SELECT SUM(current_stock)
  FROM ingredients 
  WHERE LOWER(TRIM(name)) = 'roșii'
    AND name NOT LIKE '%Shaorma%'  -- Excludem Roșii Shaorma (rămâne separat)
    AND name NOT LIKE '%cherry%'   -- Excludem cherry (tip diferit)
),
unit = 'kg'
WHERE id = 75;

UPDATE recipes SET ingredient_id = 75 WHERE ingredient_id IN (6);
DELETE FROM ingredients WHERE id IN (6);

SELECT '✅ Merge ROȘII complet (2 → 1)' as result;

-- 3.5 SARE (ID 28, 134, 142 → Master: 28)
UPDATE ingredients 
SET current_stock = (
  SELECT 
    SUM(CASE 
      WHEN unit = 'g' THEN current_stock / 1000.0
      ELSE current_stock 
    END)
  FROM ingredients 
  WHERE LOWER(TRIM(name)) = 'sare'
),
unit = 'kg'
WHERE id = 28;

UPDATE recipes SET ingredient_id = 28 WHERE ingredient_id IN (134, 142);
DELETE FROM ingredients WHERE id IN (134, 142);

SELECT '✅ Merge SARE complet (3 → 1)' as result;

-- 3.6 OȚET (ID 51, 107, 132 → Master: 107)
UPDATE ingredients 
SET current_stock = (
  SELECT 
    SUM(CASE 
      WHEN unit = 'ml' THEN current_stock / 1000.0
      ELSE current_stock 
    END)
  FROM ingredients 
  WHERE LOWER(TRIM(name)) = 'oțet'
),
unit = 'L'
WHERE id = 107;

UPDATE recipes SET ingredient_id = 107 WHERE ingredient_id IN (51, 132);
DELETE FROM ingredients WHERE id IN (51, 132);

SELECT '✅ Merge OȚET complet (3 → 1)' as result;

-- 3.7 CEAPĂ (ID 15, 128 → Master: 128) - DOAR generică, NU Shaorma
UPDATE ingredients 
SET current_stock = (
  SELECT 
    SUM(CASE 
      WHEN unit = 'g' THEN current_stock / 1000.0
      ELSE current_stock 
    END)
  FROM ingredients 
  WHERE LOWER(TRIM(name)) = 'ceapă'
    AND name NOT LIKE '%Shaorma%'
    AND name NOT LIKE '%roșie%'  -- Ceapă roșie rămâne separată
    AND name NOT LIKE '%albă%'   -- Ceapă albă rămâne separată
),
unit = 'kg'
WHERE id = 128;

UPDATE recipes SET ingredient_id = 128 WHERE ingredient_id IN (15);
DELETE FROM ingredients WHERE id IN (15);

SELECT '✅ Merge CEAPĂ complet (2 → 1)' as result;

-- 3.8 PIPER NEGRU (ID 117, 135, 341 → Master: 117)
UPDATE ingredients 
SET current_stock = (
  SELECT 
    SUM(CASE 
      WHEN unit = 'g' THEN current_stock / 1000.0
      ELSE current_stock 
    END)
  FROM ingredients 
  WHERE LOWER(TRIM(name)) = 'piper negru'
),
unit = 'kg'
WHERE id = 117;

UPDATE recipes SET ingredient_id = 117 WHERE ingredient_id IN (135, 341);
DELETE FROM ingredients WHERE id IN (135, 341);

SELECT '✅ Merge PIPER NEGRU complet (3 → 1)' as result;

-- 3.9 OUĂ (ID 84) - ID 1 deja șters în FAZA 1
-- Doar actualizăm referințele dacă mai există
UPDATE recipes SET ingredient_id = 84 WHERE ingredient_id = 1;

SELECT '✅ Re-mapare OUĂ → ID corect (84)' as result;

-- 3.10 MOZZARELLA (ID 94) - ID 3 deja șters în FAZA 1
UPDATE recipes SET ingredient_id = 94 WHERE ingredient_id = 3;

SELECT '✅ Re-mapare MOZZARELLA → ID corect (94)' as result;

COMMIT;

-- ───────────────────────────────────────────────────────────────────────────────
-- FAZA 4: ȘTERGE "STĂRI DE PREPARARE"
-- ───────────────────────────────────────────────────────────────────────────────

BEGIN TRANSACTION;

SELECT '=== FAZA 4: ȘTERGE STĂRI DE PREPARARE ===' as Section;

-- Șterge articole care sunt doar "stări" ale altor ingrediente
DELETE FROM ingredients
WHERE name LIKE '%micro-spumă%'
   OR name LIKE '%spumă)%'
   OR name LIKE '%încălzit)%'
   OR name LIKE '%fiert%' AND name NOT LIKE '%Ou fiert%'  -- Păstrăm "Ou fiert" dacă e produs finit
   OR name LIKE '%prăjit%' AND name NOT LIKE '%Cartofi prăjiți%'  -- Păstrăm dacă e produs finit
   OR name LIKE '%crocant%'
   OR name LIKE '%(ras)%'
   OR name LIKE '%(rasă)%'
   OR name LIKE '%(cuburi)%'
   OR name LIKE '%(cubulețe)%'
   OR name LIKE '%(felii)%'
   OR name LIKE '%(feliată)%'
   OR name LIKE '%(opțional)%'
   OR name LIKE '%(pentru%)%';

SELECT '✅ Șters ' || changes() || ' stări de preparare' as result;

COMMIT;

-- ───────────────────────────────────────────────────────────────────────────────
-- FAZA 5: CURĂȚARE REȚETE ORFANE
-- ───────────────────────────────────────────────────────────────────────────────

BEGIN TRANSACTION;

SELECT '=== FAZA 5: CURĂȚARE REȚETE ORFANE ===' as Section;

-- Șterge rețete cu ingrediente care NU mai există
DELETE FROM recipes 
WHERE ingredient_id NOT IN (SELECT id FROM ingredients);

SELECT '✅ Șters ' || changes() || ' rețete orfane' as result;

COMMIT;

-- ───────────────────────────────────────────────────────────────────────────────
-- FAZA 6: VALIDARE FINALĂ
-- ───────────────────────────────────────────────────────────────────────────────

SELECT '=== STATISTICI DUPĂ CURĂȚENIE ===' as Section;

SELECT 
  'Total ingrediente' as metric,
  COUNT(*) as valoare
FROM ingredients
UNION ALL
SELECT 
  'Ingrediente cu stoc NULL',
  COUNT(*) 
FROM ingredients 
WHERE current_stock IS NULL
UNION ALL
SELECT 
  'Ingrediente cu stoc negativ',
  COUNT(*) 
FROM ingredients 
WHERE current_stock < 0
UNION ALL
SELECT 
  'Rețete orfane (ingredient lipsă)',
  COUNT(*) 
FROM recipes r
LEFT JOIN ingredients i ON r.ingredient_id = i.id
WHERE i.id IS NULL
UNION ALL
SELECT 
  'Ingrediente Shaorma păstrate',
  COUNT(*)
FROM ingredients
WHERE name LIKE '%Shaorma%';

-- ───────────────────────────────────────────────────────────────────────────────
-- VERIFICARE DUPLICATE RĂMASE
-- ───────────────────────────────────────────────────────────────────────────────

SELECT '=== VERIFICARE DUPLICATE RĂMASE ===' as Section;

SELECT 
  LOWER(TRIM(name)) as nume_normalizat,
  COUNT(*) as nr_duplicate,
  GROUP_CONCAT(id) as ids,
  GROUP_CONCAT(current_stock || ' ' || unit) as stocuri
FROM ingredients
GROUP BY LOWER(TRIM(name))
HAVING COUNT(*) > 1
ORDER BY nr_duplicate DESC;

-- ───────────────────────────────────────────────────────────────────────────────
-- FINALIZARE
-- ───────────────────────────────────────────────────────────────────────────────

SELECT '✅ CURĂȚENIE COMPLETĂ FINALIZATĂ!' as result;
SELECT 'Verifică rezultatele de mai sus și rulează audit-stocuri.js pentru raport complet.' as next_step;

