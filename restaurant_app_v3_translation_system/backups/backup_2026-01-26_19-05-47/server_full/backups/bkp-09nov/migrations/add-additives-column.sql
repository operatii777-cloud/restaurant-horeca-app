-- ================================================
-- MIGRATION: Add Additives Column to Menu Table
-- Data: 05 Noiembrie 2025
-- Descriere: Adaugă coloana additives pentru conformitate legală (Ordin 201/2022)
-- ================================================

-- Adaugă coloana additives în tabela menu
ALTER TABLE menu ADD COLUMN additives TEXT DEFAULT NULL;

-- Adaugă coloana additives_en (traducere EN) în tabela menu
ALTER TABLE menu ADD COLUMN additives_en TEXT DEFAULT NULL;

-- ================================================
-- EXEMPLE DE FORMAT:
-- ================================================
-- additives: "E621 (Glutamat monosodic), E250 (Nitrit de sodiu)"
-- additives_en: "E621 (Monosodium glutamate), E250 (Sodium nitrite)"
-- 
-- SAU format JSON pentru integrare mai ușoară:
-- additives: '["E621", "E250", "E300"]'
-- ================================================

