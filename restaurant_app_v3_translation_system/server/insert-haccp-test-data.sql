-- ============================================================================
-- SQL pentru inserare date test HACCP
-- ============================================================================

-- 1. Procese HACCP
INSERT OR IGNORE INTO haccp_processes (id, name, description, category) VALUES 
(1, 'Recepție Mărfuri', 'Verificarea temperaturii și calității la primirea mărfurilor', 'receiving'),
(2, 'Stocare Rece', 'Menținerea temperaturii optime în frigider/congelator', 'storage'),
(3, 'Gătire', 'Asigurarea temperaturii interne corecte la gătit', 'cooking');

-- 2. Puncte Critice de Control
INSERT OR IGNORE INTO haccp_ccp (id, process_id, ccp_number, hazard_type, hazard_description, control_measure) VALUES 
(1, 1, 'CCP-1', 'biological', 'Contaminare bacteriană prin temperatură incorectă transport', 'Verificare temperatură la recepție - reject dacă > 4°C pentru produse refrigerate'),
(2, 2, 'CCP-2', 'biological', 'Multiplicare bacteriană prin stocare incorectă', 'Menținere temperatură frigider între 0-4°C'),
(3, 3, 'CCP-3', 'biological', 'Supraviețuire bacterii patogene (E.coli, Salmonella)', 'Temperatură internă minimum 75°C pentru carne');

-- 3. Limite Critice
INSERT OR IGNORE INTO haccp_limits (id, ccp_id, parameter_name, min_value, max_value, unit, target_value, monitoring_frequency) VALUES 
(1, 1, 'temperature', -2, 4, '°C', 2, 'every_batch'),
(2, 2, 'temperature', 0, 4, '°C', 2, 'hourly'),
(3, 3, 'temperature', 75, 95, '°C', 80, 'every_batch');

