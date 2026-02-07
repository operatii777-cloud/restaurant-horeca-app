-- SQL Script to fix product station assignments
-- Run this with: sqlite3 restaurant.db < fix_stations.sql

-- Set all drinks/beverages to BAR
UPDATE menu SET preparation_section = 'BAR' 
WHERE category = 'Răcoritoare';

UPDATE menu SET preparation_section = 'BAR' 
WHERE category = 'Băuturi Spirtoase';

UPDATE menu SET preparation_section = 'BAR' 
WHERE category = 'Băuturi și Coctailuri';

UPDATE menu SET preparation_section = 'BAR' 
WHERE category = 'Cafea/Ciocolată/Ceai';

UPDATE menu SET preparation_section = 'BAR' 
WHERE category = 'Coctailuri Non-Alcoolice';

UPDATE menu SET preparation_section = 'BAR' 
WHERE category = 'Vinuri';

-- Verify changes
SELECT category, preparation_section, COUNT(*) as count 
FROM menu 
GROUP BY category, preparation_section 
ORDER BY category;
