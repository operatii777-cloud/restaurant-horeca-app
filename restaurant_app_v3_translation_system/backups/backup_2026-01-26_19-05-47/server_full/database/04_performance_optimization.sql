-- =====================================================
-- SCRIPT OPTIMIZARE PERFORMANȚĂ - SISTEM FISCAL
-- Restaurant App - Versiunea 1.0
-- =====================================================

USE restaurant_fiscal;

-- =====================================================
-- 1. INDEXURI SUPLIMENTARE PENTRU PERFORMANȚĂ
-- =====================================================

-- Indexuri compuse pentru tranzactii_comenzi
-- Acestea vor îmbunătăți semnificativ performanța interogărilor complexe

-- Index pentru rapoarte X (tranzacții curente fără raport Z)
CREATE INDEX IF NOT EXISTS idx_tranzactii_curente_raport_x 
ON tranzactii_comenzi (data_comanda, id_raport_z, status_tranzactie);

-- Index pentru rapoarte Z (tranzacții cu raport Z atribuit)
CREATE INDEX IF NOT EXISTS idx_tranzactii_raport_z 
ON tranzactii_comenzi (id_raport_z, data_comanda, status_tranzactie);

-- Index pentru istoric comenzi cu filtrare operator
CREATE INDEX IF NOT EXISTS idx_tranzactii_operator_data 
ON tranzactii_comenzi (operator_id, data_comanda, status_tranzactie);

-- Index pentru încasări pe metode de plată
CREATE INDEX IF NOT EXISTS idx_tranzactii_incasari 
ON tranzactii_comenzi (data_comanda, incasare_cash, incasare_card, incasare_voucher);

-- Index pentru totaluri TVA
CREATE INDEX IF NOT EXISTS idx_tranzactii_tva 
ON tranzactii_comenzi (data_comanda, baza_11, tva_11, baza_21, tva_21, baza_0, tva_0);

-- Indexuri pentru rapoarte_z_arhiva
-- Index pentru căutare după perioadă și status transmitere
CREATE INDEX IF NOT EXISTS idx_raport_z_perioada_status 
ON rapoarte_z_arhiva (data_inchidere, status_transmitere, numar_raport);

-- Index pentru rapoarte ne transmise la ANAF
CREATE INDEX IF NOT EXISTS idx_raport_z_ne_transmise 
ON rapoarte_z_arhiva (status_transmitere, data_inchidere) 
WHERE status_transmitere = 'Neinitializata';

-- Indexuri pentru rapoarte_lunare_arhiva
-- Index pentru căutare după an și lună
CREATE INDEX IF NOT EXISTS idx_raport_lunar_an_luna 
ON rapoarte_lunare_arhiva (an, luna_an, status_transmitere);

-- Indexuri pentru registru_casa_miscari
-- Index pentru rapoarte pe perioade
CREATE INDEX IF NOT EXISTS idx_registru_casa_perioada 
ON registru_casa_miscari (data_miscare, tip_miscare, suma);

-- Indexuri pentru loguri_sistem
-- Index pentru căutare erori recente
CREATE INDEX IF NOT EXISTS idx_loguri_erori_recente 
ON loguri_sistem (nivel, created_at) 
WHERE nivel IN ('ERROR', 'FATAL');

-- Index pentru căutare după categorie și perioadă
CREATE INDEX IF NOT EXISTS idx_loguri_categorie_perioada 
ON loguri_sistem (categorie, created_at, nivel);

-- Indexuri pentru operatori_sistem
-- Index pentru operatori activi
CREATE INDEX IF NOT EXISTS idx_operatori_activi 
ON operatori_sistem (activ, rol, username);

-- =====================================================
-- 2. PARTIȚIONARE PENTRU TABELE MARI
-- =====================================================

-- Partiționare tranzactii_comenzi după lună (pentru tabele foarte mari)
-- Această partiționare va îmbunătăți semnificativ performanța pentru date istorice

-- Verifică dacă partiționarea este suportată și necesară
-- (Dezactivează dacă nu aveți nevoie de partiționare sau dacă aveți constrângeri)

/*
-- Exemplu de partiționare după lună pentru tranzactii_comenzi
ALTER TABLE tranzactii_comenzi 
PARTITION BY RANGE (YEAR(data_comanda) * 100 + MONTH(data_comanda)) (
    PARTITION p202401 VALUES LESS THAN (202402),
    PARTITION p202402 VALUES LESS THAN (202403),
    PARTITION p202403 VALUES LESS THAN (202404),
    PARTITION p202404 VALUES LESS THAN (202405),
    PARTITION p202405 VALUES LESS THAN (202406),
    PARTITION p202406 VALUES LESS THAN (202407),
    PARTITION p202407 VALUES LESS THAN (202408),
    PARTITION p202408 VALUES LESS THAN (202409),
    PARTITION p202409 VALUES LESS THAN (202410),
    PARTITION p202410 VALUES LESS THAN (202411),
    PARTITION p202411 VALUES LESS THAN (202412),
    PARTITION p202412 VALUES LESS THAN (202501),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);
*/

-- =====================================================
-- 3. PROCEDURI STOCATE OPTIMIZATE
-- =====================================================

DELIMITER //

-- Procedură optimizată pentru raport X
CREATE PROCEDURE sp_raport_x_optimizat(IN p_data_raport DATE)
BEGIN
    DECLARE v_start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    
    -- Folosește indexurile create pentru performanță optimă
    SELECT 
        p_data_raport as data_raport,
        COUNT(*) as numar_bonuri,
        COALESCE(SUM(total_brut), 0) as total_brut,
        COALESCE(SUM(total_tva), 0) as total_tva,
        COALESCE(SUM(baza_11), 0) as baza_11,
        COALESCE(SUM(tva_11), 0) as tva_11,
        COALESCE(SUM(baza_21), 0) as baza_21,
        COALESCE(SUM(tva_21), 0) as tva_21,
        COALESCE(SUM(baza_0), 0) as baza_0,
        COALESCE(SUM(tva_0), 0) as tva_0,
        COALESCE(SUM(incasare_cash), 0) as incasare_cash,
        COALESCE(SUM(incasare_card), 0) as incasare_card,
        COALESCE(SUM(incasare_voucher), 0) as incasare_voucher,
        SUM(CASE WHEN status_tranzactie = 'Anulata' THEN 1 ELSE 0 END) as numar_anulari,
        SUM(CASE WHEN status_tranzactie = 'Anulata' THEN total_brut ELSE 0 END) as suma_anulata,
        TIMESTAMPDIFF(MODERNECOND, v_start_time, CURRENT_TIMESTAMP) / 1000 as execution_time_ms
    FROM tranzactii_comenzi 
    WHERE DATE(data_comanda) = p_data_raport 
      AND id_raport_z IS NULL 
      AND status_tranzactie IN ('Finalizata', 'Anulata');
END //

-- Procedură optimizată pentru istoric comenzi
CREATE PROCEDURE sp_istoric_comenzi_optimizat(
    IN p_data_start DATE,
    IN p_data_stop DATE,
    IN p_operator_id INT,
    IN p_limit INT
)
BEGIN
    DECLARE v_start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    
    -- Folosește indexurile pentru performanță optimă
    SELECT 
        tc.id,
        tc.data_comanda,
        tc.numar_bon,
        tc.operator_nume,
        tc.total_brut,
        tc.incasare_cash,
        tc.incasare_card,
        tc.incasare_voucher,
        tc.status_tranzactie,
        CASE 
            WHEN tc.incasare_cash > 0 AND tc.incasare_card > 0 THEN 'Mixt'
            WHEN tc.incasare_cash > 0 THEN 'Cash'
            WHEN tc.incasare_card > 0 THEN 'Card'
            WHEN tc.incasare_voucher > 0 THEN 'Voucher'
            ELSE 'Necunoscut'
        END as metoda_plata,
        TIMESTAMPDIFF(MODERNECOND, v_start_time, CURRENT_TIMESTAMP) / 1000 as execution_time_ms
    FROM tranzactii_comenzi tc
    WHERE DATE(tc.data_comanda) BETWEEN p_data_start AND p_data_stop
      AND (p_operator_id IS NULL OR tc.operator_id = p_operator_id)
      AND tc.status_tranzactie IN ('Finalizata', 'Anulata')
    ORDER BY tc.data_comanda DESC
    LIMIT p_limit;
END //

-- Procedură pentru statistici performanță
CREATE PROCEDURE sp_statistici_performanta()
BEGIN
    SELECT 
        'tranzactii_comenzi' as tabela,
        COUNT(*) as numar_inregistrari,
        COUNT(DISTINCT DATE(data_comanda)) as zile_diferite,
        MIN(data_comanda) as prima_tranzactie,
        MAX(data_comanda) as ultima_tranzactie,
        AVG(total_brut) as valoare_medie_bon,
        SUM(total_brut) as total_general
    FROM tranzactii_comenzi
    UNION ALL
    SELECT 
        'rapoarte_z_arhiva' as tabela,
        COUNT(*) as numar_inregistrari,
        COUNT(DISTINCT data_inchidere) as zile_diferite,
        MIN(data_inchidere) as prima_tranzactie,
        MAX(data_inchidere) as ultima_tranzactie,
        AVG(total_brut_zi) as valoare_medie_bon,
        SUM(total_brut_zi) as total_general
    FROM rapoarte_z_arhiva;
END //

DELIMITER ;

-- =====================================================
-- 4. CONFIGURARE OPTIMIZĂRI MYSQL
-- =====================================================

-- Setări recomandate pentru performanță (rulează în MySQL)
-- Acestea trebuie adăugate în my.cnf sau my.ini

/*
[mysqld]
# Optimizări pentru sistemul fiscal

# Buffer pool size (ajustez conform RAM-ului disponibil)
innodb_buffer_pool_size = 1G

# Log file size pentru performanță
innodb_log_file_size = 256M
innodb_log_buffer_size = 16M

# Optimizări pentru interogări
query_cache_size = 128M
query_cache_type = 1
query_cache_limit = 4M

# Optimizări pentru conexiuni
max_connections = 200
thread_cache_size = 16

# Optimizări pentru sort și group
sort_buffer_size = 2M
group_concat_max_len = 32768

# Optimizări pentru temporary tables
tmp_table_size = 64M
max_heap_table_size = 64M

# Optimizări pentru joins
join_buffer_size = 2M

# Optimizări pentru index
key_buffer_size = 256M

# Optimizări pentru InnoDB
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT
innodb_io_capacity = 2000
innodb_read_io_threads = 8
innodb_write_io_threads = 8
*/

-- =====================================================
-- 5. ANALIZĂ PERFORMANȚĂ ȘI OPTIMIZĂRI
-- =====================================================

-- Procedură pentru analiza performanței interogărilor
DELIMITER //

CREATE PROCEDURE sp_analiza_performanta()
BEGIN
    -- Analizează interogările lente
    SELECT 
        'Interogari lente' as tip_analiza,
        COUNT(*) as numar_interogari,
        AVG(query_time) as timp_mediu,
        MAX(query_time) as timp_maxim
    FROM mysql.slow_log 
    WHERE start_time >= DATE_SUB(NOW(), INTERVAL 1 DAY);
    
    -- Analizează utilizarea indexurilor
    SELECT 
        TABLE_NAME,
        INDEX_NAME,
        CARDINALITY,
        SUB_PART,
        NULLABLE
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = 'restaurant_fiscal'
    ORDER BY TABLE_NAME, SEQ_IN_INDEX;
    
    -- Analizează dimensiunea tabelelor
    SELECT 
        TABLE_NAME,
        ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS 'Size (MB)',
        TABLE_ROWS
    FROM information_schema.TABLES 
    WHERE TABLE_SCHEMA = 'restaurant_fiscal'
    ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC;
    
END //

DELIMITER ;

-- =====================================================
-- 6. INDEXURI PENTRU QUERY-URI SPECIFICE
-- =====================================================

-- Index pentru căutarea tranzacțiilor din ultimele 30 de zile
CREATE INDEX IF NOT EXISTS idx_tranzactii_ultimele_30_zile 
ON tranzactii_comenzi (data_comanda DESC, status_tranzactie)
WHERE data_comanda >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);

-- Index pentru rapoarte Z din ultimele 6 luni
CREATE INDEX IF NOT EXISTS idx_raport_z_ultimele_6_luni 
ON rapoarte_z_arhiva (data_inchidere DESC, status_transmitere)
WHERE data_inchidere >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH);

-- Index pentru operatori activi cu ultima activitate
CREATE INDEX IF NOT EXISTS idx_operatori_activitate 
ON operatori_sistem (activ, last_login DESC, rol);

-- =====================================================
-- 7. PROCEDURI PENTRU MAINTENANCE
-- =====================================================

DELIMITER //

-- Procedură pentru optimizarea tabelelor
CREATE PROCEDURE sp_optimizeaza_tabele()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE table_name VARCHAR(255);
    DECLARE cur CURSOR FOR 
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = 'restaurant_fiscal' 
          AND TABLE_TYPE = 'BASE TABLE';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO table_name;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        SET @sql = CONCAT('OPTIMIZE TABLE ', table_name);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
    END LOOP;
    
    CLOSE cur;
    
    SELECT 'Optimizarea tabelelor completată' as rezultat;
END //

-- Procedură pentru curățarea logurilor vechi
CREATE PROCEDURE sp_curata_loguri_vechi(IN p_zile_retentie INT)
BEGIN
    DECLARE v_count INT;
    
    DELETE FROM loguri_sistem 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL p_zile_retentie DAY);
    
    SET v_count = ROW_COUNT();
    
    SELECT CONCAT('Șterse ', v_count, ' loguri mai vechi de ', p_zile_retentie, ' zile') as rezultat;
END //

DELIMITER ;

-- =====================================================
-- 8. VERIFICARE PERFORMANȚĂ
-- =====================================================

-- Testează performanța indexurilor create
EXPLAIN SELECT * FROM tranzactii_comenzi 
WHERE DATE(data_comanda) = '2024-12-06' 
  AND id_raport_z IS NULL 
  AND status_tranzactie = 'Finalizata';

-- Testează performanța pentru istoric comenzi
EXPLAIN SELECT * FROM tranzactii_comenzi 
WHERE DATE(data_comanda) BETWEEN '2024-12-01' AND '2024-12-06'
  AND operator_id = 101
  AND status_tranzactie IN ('Finalizata', 'Anulata')
ORDER BY data_comanda DESC;

-- Testează performanța pentru rapoarte Z
EXPLAIN SELECT * FROM rapoarte_z_arhiva 
WHERE data_inchidere BETWEEN '2024-11-01' AND '2024-12-31'
  AND status_transmitere = 'Neinitializata';

-- =====================================================
-- 9. MONITORIZARE PERFORMANȚĂ
-- =====================================================

-- Creează view pentru monitorizarea performanței
CREATE VIEW v_monitorizare_performanta AS
SELECT 
    'Index Utilization' as metric,
    COUNT(*) as valoare,
    'Total indexuri create' as descriere
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = 'restaurant_fiscal'
UNION ALL
SELECT 
    'Table Size (MB)' as metric,
    ROUND(SUM((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) as valoare,
    'Dimensiunea totală a bazei de date' as descriere
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'restaurant_fiscal'
UNION ALL
SELECT 
    'Active Connections' as metric,
    (SELECT VARIABLE_VALUE FROM information_schema.GLOBAL_STATUS WHERE VARIABLE_NAME = 'Threads_connected') as valoare,
    'Conexiuni active la baza de date' as descriere;

-- =====================================================
-- 10. SCRIPT DE VERIFICARE FINALĂ
-- =====================================================

-- Verifică că toate indexurile au fost create
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    CARDINALITY
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = 'restaurant_fiscal'
  AND INDEX_NAME LIKE 'idx_%'
ORDER BY TABLE_NAME, INDEX_NAME;

-- Verifică procedurile create
SELECT 
    ROUTINE_NAME,
    ROUTINE_TYPE,
    CREATED
FROM information_schema.ROUTINES 
WHERE ROUTINE_SCHEMA = 'restaurant_fiscal'
  AND ROUTINE_NAME LIKE 'sp_%'
ORDER BY ROUTINE_NAME;

-- Verifică view-urile create
SELECT 
    TABLE_NAME,
    VIEW_DEFINITION
FROM information_schema.VIEWS 
WHERE TABLE_SCHEMA = 'restaurant_fiscal';

-- =====================================================
-- MESAJ FINAL
-- =====================================================
SELECT 'Optimizările de performanță au fost aplicate cu succes!' as STATUS;
SELECT 'Rulează sp_analiza_performanta() pentru a vedea statisticile!' as NEXT_STEP;
