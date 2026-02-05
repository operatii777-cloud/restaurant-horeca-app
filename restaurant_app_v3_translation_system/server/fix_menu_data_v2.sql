
-- 1. Fix Categories (Drinks in Pizza -> Correct Categories)
-- Move Gins to ID 32 (Băuturi și Coctailuri) or better ID 1 (Băuturi Alcoolice) creates less mess? 
-- User listing has "Violette Gin" in "Băuturi și Coctailuri" (ID 32). So let's use ID 32 for cocktails/mixed drinks.
-- "Tanqueray" is Gin. "Strawberry Caipiroska" is Cocktail. All seem to fit ID 32 "Băuturi și Coctailuri".

UPDATE products SET category_id = 32, allergens = NULL WHERE category_id = 3 AND (name LIKE '%Tanqueray%' OR name LIKE '%Caipiroska%' OR name LIKE '%Strawberry%');

-- 2. Cleanup Allergens (Strip en: prefixes and standardize)
-- Using simple REPLACE for common allergens provided in user's list
UPDATE products SET allergens = REPLACE(allergens, 'en:milk', 'Lapte') WHERE allergens LIKE '%en:milk%';
UPDATE products SET allergens = REPLACE(allergens, 'en:gluten', 'Gluten') WHERE allergens LIKE '%en:gluten%';
UPDATE products SET allergens = REPLACE(allergens, 'en:eggs', 'Ouă') WHERE allergens LIKE '%en:eggs%';
UPDATE products SET allergens = REPLACE(allergens, 'en:fish', 'Pește') WHERE allergens LIKE '%en:fish%';
UPDATE products SET allergens = REPLACE(allergens, 'en:nuts', 'Fructe cu coajă') WHERE allergens LIKE '%en:nuts%';
UPDATE products SET allergens = REPLACE(allergens, 'en:soybeans', 'Soia') WHERE allergens LIKE '%en:soybeans%';
UPDATE products SET allergens = REPLACE(allergens, 'en:crustaceans', 'Crustacee') WHERE allergens LIKE '%en:crustaceans%';
UPDATE products SET allergens = REPLACE(allergens, 'en:sulphur-dioxide-and-sulphites', 'Sulfiți') WHERE allergens LIKE '%en:sulphur%';
UPDATE products SET allergens = REPLACE(allergens, 'en:mustard', 'Muștar') WHERE allergens LIKE '%en:mustard%';
UPDATE products SET allergens = REPLACE(allergens, 'en:sesame-seeds', 'Semințe de susan') WHERE allergens LIKE '%en:sesame%';
UPDATE products SET allergens = REPLACE(allergens, 'en:celery', 'Țelină') WHERE allergens LIKE '%en:celery%';

-- 3. Cleanup specific wrong allergens (Fish in drinks)
UPDATE products SET allergens = NULL WHERE category_id = 32 AND allergens LIKE '%Pește%';
