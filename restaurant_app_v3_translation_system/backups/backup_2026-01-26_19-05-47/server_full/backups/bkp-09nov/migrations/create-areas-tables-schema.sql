-- ================================================
-- MIGRATION: Areas, Tables & Enhanced Locations
-- Data: 03 Noiembrie 2025
-- Descriere: Schema completă pentru zone, mese și gestiuni
-- ================================================

-- ==================== AREAS (Zone Restaurant) ====================
CREATE TABLE IF NOT EXISTS areas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,                    -- Ex: "Interior", "Terasă", "Nefumători"
    name_en TEXT,                          -- Traducere EN
    type TEXT NOT NULL DEFAULT 'indoor',   -- 'indoor', 'outdoor', 'terrace', 'garden', 'smoking', 'non_smoking'
    description TEXT,
    is_active INTEGER DEFAULT 1,           -- 1 = activ, 0 = inactiv
    display_order INTEGER DEFAULT 0,       -- Pentru sortare în UI
    
    -- Link către gestiuni (opțional - pentru mapare automată viitoare)
    default_bar_location_id INTEGER,       -- Gestiunea bar default pentru zona asta
    default_kitchen_location_id INTEGER,   -- Gestiunea bucătărie default
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (default_bar_location_id) REFERENCES management_locations(id) ON DELETE SET NULL,
    FOREIGN KEY (default_kitchen_location_id) REFERENCES management_locations(id) ON DELETE SET NULL
);

-- Index pentru performanță
CREATE INDEX IF NOT EXISTS idx_areas_active ON areas(is_active);
CREATE INDEX IF NOT EXISTS idx_areas_type ON areas(type);
CREATE INDEX IF NOT EXISTS idx_areas_display_order ON areas(display_order);

-- Trigger pentru actualizare automată updated_at
CREATE TRIGGER IF NOT EXISTS update_areas_timestamp 
AFTER UPDATE ON areas
BEGIN
    UPDATE areas SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ==================== TABLES (Mese) ====================
CREATE TABLE IF NOT EXISTS tables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_number INTEGER UNIQUE NOT NULL,  -- 1-200
    area_id INTEGER,                       -- Link către areas (NULL = neasociat)
    
    -- Detalii masă
    seats INTEGER DEFAULT 4,               -- Câte locuri
    shape TEXT DEFAULT 'square',           -- 'square', 'round', 'rectangular', 'oval'
    
    -- Status și opțiuni
    is_active INTEGER DEFAULT 1,           -- Masă activă sau dezactivată
    is_smoking INTEGER DEFAULT 0,          -- Zonă fumători
    
    -- Poziție pentru plan vizual (Canvas)
    position_x INTEGER,                    -- Coordonată X (pixel)
    position_y INTEGER,                    -- Coordonată Y (pixel)
    rotation INTEGER DEFAULT 0,            -- Rotație (0-360 grade)
    
    -- Informații suplimentare
    notes TEXT,                            -- "Lângă fereastră", "VIP", etc.
    qr_code_url TEXT,                      -- URL către QR code generat
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL
);

-- Index pentru performanță
CREATE INDEX IF NOT EXISTS idx_tables_number ON tables(table_number);
CREATE INDEX IF NOT EXISTS idx_tables_area ON tables(area_id);
CREATE INDEX IF NOT EXISTS idx_tables_active ON tables(is_active);

-- Trigger pentru actualizare automată updated_at
CREATE TRIGGER IF NOT EXISTS update_tables_timestamp 
AFTER UPDATE ON tables
BEGIN
    UPDATE tables SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ==================== ENHANCE MANAGEMENT_LOCATIONS ====================

-- Adaugă coloane noi în management_locations (dacă nu există)
-- serves_area_id: NULL = servește toate zonele, altfel doar zona specifică

-- Coloană pentru zonă deservită (NULL = toate, altfel specific)
-- Exemplu: Bar Terasă (serves_area_id = 2) servește doar Terasă
ALTER TABLE management_locations ADD COLUMN serves_area_id INTEGER;

-- Coloană pentru zone multiple (JSON array: [1,2,3])
-- Exemplu: Pizzerie poate servi [1,2] = Interior + Terasă
ALTER TABLE management_locations ADD COLUMN serves_areas TEXT;

-- Coloană pentru iconiță UI
ALTER TABLE management_locations ADD COLUMN icon TEXT DEFAULT '📦';

-- ==================== SEED DATA DEFAULT ====================

-- Zone Default (3 zone standard)
INSERT OR IGNORE INTO areas (id, name, name_en, type, display_order) VALUES
(1, 'Interior', 'Indoor', 'indoor', 1),
(2, 'Terasă', 'Terrace', 'terrace', 2),
(3, 'Nefumători', 'Non-Smoking', 'non_smoking', 3);

-- Gestiuni Default (8 gestiuni pentru Restaurant Complet)
-- Toate INACTIVE la început - user-ul le activează manual

INSERT OR IGNORE INTO management_locations (id, name, type, description, is_active, can_receive_deliveries, can_transfer_out, can_transfer_in, can_consume, serves_areas, icon) VALUES

-- DEPOZITE (3)
(1, 'Depozit Alimente', 'warehouse', 'Stocuri alimente: legume, carne, lactate, paste', 0, 1, 1, 0, 0, NULL, '🏪'),
(2, 'Depozit Băuturi', 'warehouse', 'Stocuri băuturi: bere, vin, alcool, sifoane', 0, 1, 1, 0, 0, NULL, '🍺'),
(3, 'Depozit Consumabile', 'warehouse', 'Consumabile: farfurii, pahare, șervețele, cutii', 0, 1, 1, 0, 0, NULL, '🧹'),

-- INTERIOR (3)
(4, 'Bucătărie', 'operational', 'Bucătărie principală: paste, salate, grill', 0, 0, 0, 1, 1, '[1]', '🍳'),
(5, 'Pizzerie', 'operational', 'Pizzerie: pizza, calzone (servește toate zonele)', 0, 0, 0, 1, 1, '[1,2]', '🍕'),
(6, 'Bar', 'operational', 'Bar interior: băuturi, cocktailuri', 0, 0, 0, 1, 1, '[1]', '🍸'),

-- TERASĂ (2)
(7, 'Bucătărie Terasă', 'operational', 'Bucătărie terasă: salate, aperitive', 0, 0, 0, 1, 1, '[2]', '🌿'),
(8, 'Bar Terasă', 'operational', 'Bar terasă: băuturi pentru exterior', 0, 0, 0, 1, 1, '[2]', '☀️');

-- EXTRA (Inactive, user activează dacă are nevoie)
INSERT OR IGNORE INTO management_locations (id, name, type, description, is_active, can_receive_deliveries, can_transfer_out, can_transfer_in, can_consume, serves_areas, icon) VALUES
(9, 'Grill', 'operational', 'Secțiune grill: carne la grătar', 0, 0, 0, 1, 1, NULL, '🔥'),
(10, 'Patiserie', 'operational', 'Patiserie: deserturi, prăjituri', 0, 0, 0, 1, 1, NULL, '🎂'),
(11, 'Food Truck - Depozitare', 'warehouse', 'Spațiu depozitare food truck', 0, 1, 0, 0, 1, NULL, '🚚'),
(12, 'Bucătărie Food Truck', 'operational', 'Bucătărie food truck', 0, 0, 0, 0, 1, NULL, '🚚');

-- Mese Default (1-200, toate INACTIVE și neasociate la început)
-- User-ul le configurează manual (zonă, locuri, poziție)
-- Generăm doar structura, fără asociere la zone

-- Inserare mese 1-200 (toate inactive, fără zonă setată)
INSERT OR IGNORE INTO tables (table_number, area_id, seats, is_active, position_x, position_y) 
SELECT 
    num as table_number,
    NULL as area_id,       -- Neasociat - user setează manual
    4 as seats,            -- Default 4 locuri
    0 as is_active,        -- Inactive până când se configurează
    NULL as position_x,    -- Poziție nedefinită
    NULL as position_y     -- Poziție nedefinită
FROM (
    WITH RECURSIVE numbers(num) AS (
        SELECT 1
        UNION ALL
        SELECT num + 1 FROM numbers WHERE num < 200
    )
    SELECT num FROM numbers
);

-- ==================== VERIFICARE ====================
-- Afișează numărul de înregistrări create

SELECT 'AREAS created: ' || COUNT(*) FROM areas;
SELECT 'LOCATIONS created: ' || COUNT(*) FROM management_locations;
SELECT 'TABLES created: ' || COUNT(*) FROM tables;

-- ==================== FINAL ====================
-- Migrare completă!
-- User-ul poate acum:
-- 1. Activa gestiunile necesare (din 12 disponibile)
-- 2. Configura zone custom (sau folosi cele 3 default)
-- 3. Asocia mese 1-200 la zone (manual, per masă)
-- 4. Aranja mese vizual cu drag & drop (optional)

