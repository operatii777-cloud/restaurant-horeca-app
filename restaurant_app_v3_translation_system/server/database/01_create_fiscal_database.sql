-- =====================================================
-- SCRIPT CONFIGURARE BAZĂ DE DATE - SISTEM FISCAL
-- Restaurant App - Versiunea 1.0
-- =====================================================

-- Creare baza de date (optional, daca nu exista deja)
CREATE DATABASE IF NOT EXISTS restaurant_fiscal 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE restaurant_fiscal;

-- =====================================================
-- 1. TABELA PRINCIPALA: tranzactii_comenzi
-- Sursa de date pentru Rapoartele X, Z și Istoric Comenzi
-- =====================================================
CREATE TABLE IF NOT EXISTS tranzactii_comenzi (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    data_comanda DATETIME NOT NULL,
    numar_bon INT UNIQUE NOT NULL, 
    operator_id INT NOT NULL,
    operator_nume VARCHAR(100) NOT NULL,
    
    -- Totaluri generale
    total_brut DECIMAL(10, 2) NOT NULL,
    total_tva DECIMAL(10, 2) NOT NULL,
    total_fara_tva DECIMAL(10, 2) NOT NULL,
    
    -- Detalierea pe cote TVA
    baza_11 DECIMAL(10, 2) DEFAULT 0.00,
    tva_11 DECIMAL(10, 2) DEFAULT 0.00,
    baza_21 DECIMAL(10, 2) DEFAULT 0.00,
    tva_21 DECIMAL(10, 2) DEFAULT 0.00,
    baza_0 DECIMAL(10, 2) DEFAULT 0.00,
    tva_0 DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Detalierea pe metode de plată
    incasare_cash DECIMAL(10, 2) DEFAULT 0.00,
    incasare_card DECIMAL(10, 2) DEFAULT 0.00,
    incasare_voucher DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Status și referințe
    status_tranzactie VARCHAR(50) NOT NULL DEFAULT 'Finalizata', -- 'Finalizata', 'Anulata', 'Storno'
    id_raport_z INT NULL, -- Cheia externă către raportul Z căruia i-a fost alocat bonul
    
    -- Metadate
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexuri pentru performanță
    INDEX idx_data_bon (data_comanda),
    INDEX idx_raport_z (id_raport_z),
    INDEX idx_status (status_tranzactie),
    INDEX idx_operator (operator_id),
    INDEX idx_numar_bon (numar_bon)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. ARHIVA: rapoarte_z_arhiva
-- Stocarea Rapoartelor Z generate, inclusiv checksum-ul de integritate
-- =====================================================
CREATE TABLE IF NOT EXISTS rapoarte_z_arhiva (
    id INT PRIMARY KEY AUTO_INCREMENT,
    numar_raport VARCHAR(50) UNIQUE NOT NULL,
    data_inchidere DATE UNIQUE NOT NULL,
    ora_inchidere TIME NOT NULL,
    
    -- Totaluri zilnice
    total_brut_zi DECIMAL(10, 2) NOT NULL,
    total_tva_zi DECIMAL(10, 2) NOT NULL,
    total_fara_tva_zi DECIMAL(10, 2) NOT NULL,
    numar_bonuri_zi INT NOT NULL,
    numar_anulari_zi INT DEFAULT 0,
    
    -- Detalii TVA zilnice
    baza_11_zi DECIMAL(10, 2) DEFAULT 0.00,
    tva_11_zi DECIMAL(10, 2) DEFAULT 0.00,
    baza_21_zi DECIMAL(10, 2) DEFAULT 0.00,
    tva_21_zi DECIMAL(10, 2) DEFAULT 0.00,
    baza_0_zi DECIMAL(10, 2) DEFAULT 0.00,
    tva_0_zi DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Încasări zilnice
    incasare_cash_zi DECIMAL(10, 2) DEFAULT 0.00,
    incasare_card_zi DECIMAL(10, 2) DEFAULT 0.00,
    incasare_voucher_zi DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Fișiere și arhivare
    cale_fisier_zip VARCHAR(255) NOT NULL,
    cale_fisier_xml VARCHAR(255) NOT NULL,
    cale_fisier_html VARCHAR(255) NOT NULL,
    cale_fisier_pdf VARCHAR(255) NULL,
    
    -- Checksum SHA-256 pentru validarea integrității fișierului arhivat
    checksum_sha256 VARCHAR(64) UNIQUE NOT NULL,
    checksum_xml VARCHAR(64) NOT NULL,
    
    -- Status și transmitere
    status_transmitere VARCHAR(50) DEFAULT 'Neinitializata', -- 'Neinitializata', 'Transmis', 'Eroare'
    data_transmitere DATETIME NULL,
    eroare_transmitere TEXT NULL,
    
    -- Metadate
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexuri
    INDEX idx_data_inchidere (data_inchidere),
    INDEX idx_numar_raport (numar_raport),
    INDEX idx_status_transmitere (status_transmitere),
    INDEX idx_checksum (checksum_sha256)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. REGISTRU: registru_casa_miscari
-- Stocarea tuturor încasărilor/plăților în numerar (Registrul de Casă)
-- =====================================================
CREATE TABLE IF NOT EXISTS registru_casa_miscari (
    id INT PRIMARY KEY AUTO_INCREMENT,
    data_miscare DATE NOT NULL,
    ora_miscare TIME NOT NULL,
    tip_miscare ENUM('Intrare', 'Ieșire') NOT NULL,
    suma DECIMAL(10, 2) NOT NULL,
    document_justificativ VARCHAR(100) NOT NULL,
    explicatie TEXT,
    operator_id INT NOT NULL,
    operator_nume VARCHAR(100) NOT NULL,
    
    -- Metadate
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexuri
    INDEX idx_data_miscare (data_miscare),
    INDEX idx_tip_miscare (tip_miscare),
    INDEX idx_operator (operator_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. OPERATORI: operatori_sistem
-- Tabela pentru operatorii care lucrează cu sistemul
-- =====================================================
CREATE TABLE IF NOT EXISTS operatori_sistem (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nume VARCHAR(100) NOT NULL,
    prenume VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    rol ENUM('admin', 'manager', 'operator', 'casier') NOT NULL DEFAULT 'operator',
    activ BOOLEAN DEFAULT TRUE,
    
    -- Metadate
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    
    -- Indexuri
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_rol (rol),
    INDEX idx_activ (activ)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. RAPOARTE LUNARE: rapoarte_lunare_arhiva
-- Stocarea rapoartelor lunare generate
-- =====================================================
CREATE TABLE IF NOT EXISTS rapoarte_lunare_arhiva (
    id INT PRIMARY KEY AUTO_INCREMENT,
    luna_an VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    luna_nume VARCHAR(20) NOT NULL,
    an INT NOT NULL,
    
    -- Totaluri lunare
    total_brut_luna DECIMAL(12, 2) NOT NULL,
    total_tva_luna DECIMAL(12, 2) NOT NULL,
    total_fara_tva_luna DECIMAL(12, 2) NOT NULL,
    numar_bonuri_luna INT NOT NULL,
    zile_lucratoare_luna INT NOT NULL,
    
    -- Detalii TVA lunare
    baza_11_luna DECIMAL(12, 2) DEFAULT 0.00,
    tva_11_luna DECIMAL(12, 2) DEFAULT 0.00,
    baza_21_luna DECIMAL(12, 2) DEFAULT 0.00,
    tva_21_luna DECIMAL(12, 2) DEFAULT 0.00,
    baza_0_luna DECIMAL(12, 2) DEFAULT 0.00,
    tva_0_luna DECIMAL(12, 2) DEFAULT 0.00,
    
    -- Încasări lunare
    incasare_cash_luna DECIMAL(12, 2) DEFAULT 0.00,
    incasare_card_luna DECIMAL(12, 2) DEFAULT 0.00,
    incasare_voucher_luna DECIMAL(12, 2) DEFAULT 0.00,
    
    -- Fișiere și arhivare
    cale_fisier_zip VARCHAR(255) NOT NULL,
    cale_fisier_xml VARCHAR(255) NOT NULL,
    cale_fisier_html VARCHAR(255) NOT NULL,
    cale_fisier_pdf VARCHAR(255) NULL,
    
    -- Checksum
    checksum_sha256 VARCHAR(64) UNIQUE NOT NULL,
    
    -- Status
    status_transmitere VARCHAR(50) DEFAULT 'Neinitializata',
    data_transmitere DATETIME NULL,
    
    -- Metadate
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexuri
    UNIQUE KEY unique_luna_an (luna_an),
    INDEX idx_luna_an (luna_an),
    INDEX idx_an (an),
    INDEX idx_status_transmitere (status_transmitere)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. CONFIGURARI: configurari_sistem
-- Configurări pentru sistemul fiscal
-- =====================================================
CREATE TABLE IF NOT EXISTS configurari_sistem (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cheie VARCHAR(100) UNIQUE NOT NULL,
    valoare TEXT NOT NULL,
    descriere TEXT,
    tip ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    modificabil BOOLEAN DEFAULT TRUE,
    
    -- Metadate
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT NULL,
    
    -- Indexuri
    INDEX idx_cheie (cheie),
    INDEX idx_modificabil (modificabil)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 7. LOGURI: loguri_sistem
-- Loguri pentru audit și debugging
-- =====================================================
CREATE TABLE IF NOT EXISTS loguri_sistem (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nivel ENUM('DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL') NOT NULL,
    categorie VARCHAR(50) NOT NULL,
    mesaj TEXT NOT NULL,
    detalii JSON NULL,
    user_id INT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    
    -- Metadate
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexuri
    INDEX idx_nivel (nivel),
    INDEX idx_categorie (categorie),
    INDEX idx_created_at (created_at),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- CONSTRÂNGERI EXTERNE (Foreign Keys)
-- =====================================================

-- Adaugă foreign key pentru tranzactii_comenzi -> rapoarte_z_arhiva
ALTER TABLE tranzactii_comenzi 
ADD CONSTRAINT fk_tranzactii_raport_z 
FOREIGN KEY (id_raport_z) REFERENCES rapoarte_z_arhiva(id) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- Adaugă foreign key pentru registru_casa_miscari -> operatori_sistem
ALTER TABLE registru_casa_miscari 
ADD CONSTRAINT fk_registru_operator 
FOREIGN KEY (operator_id) REFERENCES operatori_sistem(id) 
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Adaugă foreign key pentru configurari_sistem -> operatori_sistem
ALTER TABLE configurari_sistem 
ADD CONSTRAINT fk_configurari_operator 
FOREIGN KEY (updated_by) REFERENCES operatori_sistem(id) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- Adaugă foreign key pentru loguri_sistem -> operatori_sistem
ALTER TABLE loguri_sistem 
ADD CONSTRAINT fk_loguri_operator 
FOREIGN KEY (user_id) REFERENCES operatori_sistem(id) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- =====================================================
-- VIEW-URI PENTRU RAPOARTE
-- =====================================================

-- View pentru raportul X (tranzacții curente)
CREATE VIEW v_raport_x AS
SELECT 
    DATE(data_comanda) as data_raport,
    COUNT(*) as numar_bonuri,
    SUM(total_brut) as total_brut,
    SUM(total_tva) as total_tva,
    SUM(baza_11) as baza_11,
    SUM(tva_11) as tva_11,
    SUM(baza_21) as baza_21,
    SUM(tva_21) as tva_21,
    SUM(baza_0) as baza_0,
    SUM(tva_0) as tva_0,
    SUM(incasare_cash) as incasare_cash,
    SUM(incasare_card) as incasare_card,
    SUM(incasare_voucher) as incasare_voucher,
    SUM(CASE WHEN status_tranzactie = 'Anulata' THEN 1 ELSE 0 END) as numar_anulari,
    SUM(CASE WHEN status_tranzactie = 'Anulata' THEN total_brut ELSE 0 END) as suma_anulata
FROM tranzactii_comenzi 
WHERE id_raport_z IS NULL 
  AND status_tranzactie IN ('Finalizata', 'Anulata')
GROUP BY DATE(data_comanda);

-- View pentru istoricul comenzilor
CREATE VIEW v_istoric_comenzi AS
SELECT 
    tc.*,
    CONCAT(os.nume, ' ', os.prenume) as operator_nume_complet,
    os.rol as operator_rol
FROM tranzactii_comenzi tc
LEFT JOIN operatori_sistem os ON tc.operator_id = os.id
ORDER BY tc.data_comanda DESC;

-- =====================================================
-- PROCEDURI STOCATE PENTRU OPERAȚIUNI FRECVENTE
-- =====================================================

DELIMITER //

-- Procedură pentru generarea raportului X
CREATE PROCEDURE sp_generare_raport_x(IN p_data_raport DATE)
BEGIN
    SELECT * FROM v_raport_x WHERE data_raport = p_data_raport;
END //

-- Procedură pentru închiderea zilei fiscale (Raport Z)
CREATE PROCEDURE sp_inchidere_zi_fiscala(
    IN p_data_inchidere DATE,
    IN p_ora_inchidere TIME,
    IN p_numar_raport VARCHAR(50)
)
BEGIN
    DECLARE v_total_brut DECIMAL(10,2);
    DECLARE v_total_tva DECIMAL(10,2);
    DECLARE v_numar_bonuri INT;
    DECLARE v_raport_z_id INT;
    
    -- Calculează totalurile pentru ziua respectivă
    SELECT 
        COALESCE(SUM(total_brut), 0),
        COALESCE(SUM(total_tva), 0),
        COUNT(*)
    INTO v_total_brut, v_total_tva, v_numar_bonuri
    FROM tranzactii_comenzi 
    WHERE DATE(data_comanda) = p_data_inchidere 
      AND id_raport_z IS NULL 
      AND status_tranzactie = 'Finalizata';
    
    -- Inserează raportul Z
    INSERT INTO rapoarte_z_arhiva (
        numar_raport, data_inchidere, ora_inchidere,
        total_brut_zi, total_tva_zi, numar_bonuri_zi,
        cale_fisier_zip, checksum_sha256
    ) VALUES (
        p_numar_raport, p_data_inchidere, p_ora_inchidere,
        v_total_brut, v_total_tva, v_numar_bonuri,
        CONCAT('arhiva_rapoarte/', YEAR(p_data_inchidere), '/', LPAD(MONTH(p_data_inchidere), 2, '0'), '/', p_data_inchidere, '/raportZ_', p_data_inchidere, '.zip'),
        SHA2(CONCAT(p_numar_raport, p_data_inchidere, NOW()), 256)
    );
    
    -- Obține ID-ul raportului Z creat
    SET v_raport_z_id = LAST_INSERT_ID();
    
    -- Actualizează tranzacțiile cu ID-ul raportului Z
    UPDATE tranzactii_comenzi 
    SET id_raport_z = v_raport_z_id
    WHERE DATE(data_comanda) = p_data_inchidere 
      AND id_raport_z IS NULL 
      AND status_tranzactie = 'Finalizata';
    
    -- Returnează ID-ul raportului Z
    SELECT v_raport_z_id as raport_z_id;
END //

DELIMITER ;

-- =====================================================
-- TRIGGER-URI PENTRU AUDIT ȘI VALIDARE
-- =====================================================

-- Trigger pentru audit tranzacții
DELIMITER //
CREATE TRIGGER tr_tranzactii_audit_insert
AFTER INSERT ON tranzactii_comenzi
FOR EACH ROW
BEGIN
    INSERT INTO loguri_sistem (nivel, categorie, mesaj, detalii)
    VALUES (
        'INFO',
        'TRANZACTIE',
        CONCAT('Tranzacție nouă creată: Bon #', NEW.numar_bon),
        JSON_OBJECT(
            'tranzactie_id', NEW.id,
            'numar_bon', NEW.numar_bon,
            'operator_id', NEW.operator_id,
            'total_brut', NEW.total_brut,
            'status', NEW.status_tranzactie
        )
    );
END //

-- Trigger pentru audit rapoarte Z
CREATE TRIGGER tr_raport_z_audit_insert
AFTER INSERT ON rapoarte_z_arhiva
FOR EACH ROW
BEGIN
    INSERT INTO loguri_sistem (nivel, categorie, mesaj, detalii)
    VALUES (
        'INFO',
        'RAPORT_Z',
        CONCAT('Raport Z generat: ', NEW.numar_raport, ' pentru data ', NEW.data_inchidere),
        JSON_OBJECT(
            'raport_id', NEW.id,
            'numar_raport', NEW.numar_raport,
            'data_inchidere', NEW.data_inchidere,
            'total_brut', NEW.total_brut_zi,
            'numar_bonuri', NEW.numar_bonuri_zi
        )
    );
END //

DELIMITER ;

-- =====================================================
-- INDEXURI SUPLIMENTARE PENTRU PERFORMANȚĂ
-- =====================================================

-- Indexuri compuse pentru performanță optimă
CREATE INDEX idx_tranzactii_data_status ON tranzactii_comenzi(data_comanda, status_tranzactie);
CREATE INDEX idx_tranzactii_data_raport ON tranzactii_comenzi(data_comanda, id_raport_z);
CREATE INDEX idx_raport_z_data_status ON rapoarte_z_arhiva(data_inchidere, status_transmitere);
CREATE INDEX idx_loguri_nivel_data ON loguri_sistem(nivel, created_at);

-- =====================================================
-- VERIFICARE FINALĂ
-- =====================================================

-- Verifică că toate tabelele au fost create
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    CREATE_TIME
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'restaurant_fiscal'
ORDER BY TABLE_NAME;

-- Verifică că toate indexurile au fost create
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = 'restaurant_fiscal'
ORDER BY TABLE_NAME, INDEX_NAME;

-- =====================================================
-- MESAJ FINAL
-- =====================================================
SELECT 'Baza de date restaurant_fiscal a fost creată cu succes!' as STATUS;
