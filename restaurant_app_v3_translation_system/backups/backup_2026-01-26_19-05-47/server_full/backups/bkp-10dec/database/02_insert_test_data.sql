-- =====================================================
-- SCRIPT DATE DE TEST - SISTEM FISCAL
-- Restaurant App - Versiunea 1.0
-- =====================================================

USE restaurant_fiscal;

-- =====================================================
-- 1. POPULARE OPERATORI SISTEM
-- =====================================================
INSERT INTO operatori_sistem (id, nume, prenume, username, email, rol, activ) VALUES
(101, 'Popescu', 'Ion', 'ion.popescu', 'ion.popescu@trattoria.ro', 'operator', TRUE),
(102, 'Ionescu', 'Maria', 'maria.ionescu', 'maria.ionescu@trattoria.ro', 'operator', TRUE),
(103, 'Dumitrescu', 'Alexandru', 'alex.dumitrescu', 'alex.dumitrescu@trattoria.ro', 'manager', TRUE),
(104, 'Admin', 'Sistem', 'admin', 'admin@trattoria.ro', 'admin', TRUE);

-- =====================================================
-- 2. POPULARE CONFIGURĂRI SISTEM
-- =====================================================
INSERT INTO configurari_sistem (cheie, valoare, descriere, tip, modificabil) VALUES
('fiscal.company.name', 'SC RESTAURANT TRATTORIA SRL', 'Denumirea companiei', 'string', TRUE),
('fiscal.company.cui', 'RO12345678', 'CUI-ul companiei', 'string', TRUE),
('fiscal.company.address', 'Strada Principală 123, Sector 1, București', 'Adresa companiei', 'string', TRUE),
('fiscal.company.phone', '+40 21 123 4567', 'Telefon companie', 'string', TRUE),
('fiscal.company.email', 'contact@trattoria.ro', 'Email companie', 'string', TRUE),
('fiscal.device.number', 'FISCAL001', 'Numărul aparatului fiscal', 'string', TRUE),
('fiscal.device.series', 'A', 'Seria aparatului fiscal', 'string', TRUE),
('fiscal.archive.retention.days', '2555', 'Numărul de zile pentru păstrarea arhivei', 'number', TRUE),
('fiscal.backup.enabled', 'true', 'Backup automat activat', 'boolean', TRUE),
('fiscal.anaf.test.mode', 'true', 'Mod test pentru ANAF', 'boolean', TRUE);

-- =====================================================
-- 3. POPULARE TRANZACȚII COMENZI - ZIUA 1: 2024-12-05 (Zi închisă)
-- =====================================================
INSERT INTO tranzactii_comenzi (
    data_comanda, numar_bon, operator_id, operator_nume,
    total_brut, total_tva, total_fara_tva,
    baza_11, tva_11, baza_21, tva_21, baza_0, tva_0,
    incasare_cash, incasare_card, incasare_voucher,
    status_tranzactie, id_raport_z
) VALUES
-- Bonuri cu TVA 11% (HoReCa)
('2024-12-05 10:30:00', 1001, 101, 'Ion Popescu', 122.10, 12.10, 110.00, 110.00, 12.10, 0.00, 0.00, 0.00, 0.00, 50.00, 72.10, 0.00, 'Finalizata', 1),
('2024-12-05 11:45:00', 1002, 102, 'Maria Ionescu', 89.10, 8.90, 80.20, 80.20, 8.90, 0.00, 0.00, 0.00, 0.00, 89.10, 0.00, 0.00, 'Finalizata', 1),
('2024-12-05 13:00:00', 1003, 101, 'Ion Popescu', 55.50, 5.50, 50.00, 50.00, 5.50, 0.00, 0.00, 0.00, 0.00, 0.00, 55.50, 0.00, 'Finalizata', 1),
('2024-12-05 15:00:00', 1004, 103, 'Alexandru Dumitrescu', 222.00, 22.00, 200.00, 200.00, 22.00, 0.00, 0.00, 0.00, 0.00, 150.00, 72.00, 0.00, 'Finalizata', 1),
('2024-12-05 16:30:00', 1005, 102, 'Maria Ionescu', 33.30, 3.30, 30.00, 30.00, 3.30, 0.00, 0.00, 0.00, 0.00, 33.30, 0.00, 0.00, 'Finalizata', 1),

-- Bonuri cu TVA 21% (Standard)
('2024-12-05 12:15:00', 1006, 101, 'Ion Popescu', 121.00, 21.00, 100.00, 0.00, 0.00, 100.00, 21.00, 0.00, 0.00, 0.00, 121.00, 0.00, 'Finalizata', 1),
('2024-12-05 14:30:00', 1007, 103, 'Alexandru Dumitrescu', 242.00, 42.00, 200.00, 0.00, 0.00, 200.00, 42.00, 0.00, 0.00, 242.00, 0.00, 0.00, 'Finalizata', 1),

-- Bonuri cu TVA 0% (Scutiri)
('2024-12-05 17:00:00', 1008, 102, 'Maria Ionescu', 50.00, 0.00, 50.00, 0.00, 0.00, 0.00, 0.00, 50.00, 0.00, 50.00, 0.00, 0.00, 'Finalizata', 1),

-- Bon anulat (pentru testare)
('2024-12-05 17:30:00', 1009, 101, 'Ion Popescu', 25.00, 2.50, 22.50, 22.50, 2.50, 0.00, 0.00, 0.00, 0.00, 25.00, 0.00, 0.00, 'Anulata', 1);

-- =====================================================
-- 4. POPULARE TRANZACȚII COMENZI - ZIUA 2: 2024-12-06 (Zi curentă)
-- =====================================================
INSERT INTO tranzactii_comenzi (
    data_comanda, numar_bon, operator_id, operator_nume,
    total_brut, total_tva, total_fara_tva,
    baza_11, tva_11, baza_21, tva_21, baza_0, tva_0,
    incasare_cash, incasare_card, incasare_voucher,
    status_tranzactie, id_raport_z
) VALUES
-- Bonuri cu TVA 11% (HoReCa)
('2024-12-06 09:00:00', 2001, 101, 'Ion Popescu', 111.10, 11.10, 100.00, 100.00, 11.10, 0.00, 0.00, 0.00, 0.00, 0.00, 111.10, 0.00, 'Finalizata', NULL),
('2024-12-06 10:15:00', 2002, 102, 'Maria Ionescu', 66.60, 6.60, 60.00, 60.00, 6.60, 0.00, 0.00, 0.00, 0.00, 66.60, 0.00, 0.00, 'Finalizata', NULL),
('2024-12-06 11:30:00', 2003, 101, 'Ion Popescu', 44.40, 4.40, 40.00, 40.00, 4.40, 0.00, 0.00, 0.00, 0.00, 44.40, 0.00, 0.00, 'Finalizata', NULL),
('2024-12-06 12:45:00', 2004, 103, 'Alexandru Dumitrescu', 88.80, 8.80, 80.00, 80.00, 8.80, 0.00, 0.00, 0.00, 0.00, 88.80, 0.00, 0.00, 'Finalizata', NULL),
('2024-12-06 14:00:00', 2005, 102, 'Maria Ionescu', 133.20, 13.20, 120.00, 120.00, 13.20, 0.00, 0.00, 0.00, 0.00, 0.00, 133.20, 0.00, 'Finalizata', NULL),

-- Bonuri cu TVA 21% (Standard)
('2024-12-06 15:30:00', 2006, 101, 'Ion Popescu', 121.00, 21.00, 100.00, 0.00, 0.00, 100.00, 21.00, 0.00, 0.00, 121.00, 0.00, 0.00, 'Finalizata', NULL),
('2024-12-06 16:45:00', 2007, 103, 'Alexandru Dumitrescu', 242.00, 42.00, 200.00, 0.00, 0.00, 200.00, 42.00, 0.00, 0.00, 0.00, 242.00, 0.00, 'Finalizata', NULL),

-- Bonuri cu TVA 0% (Scutiri)
('2024-12-06 17:30:00', 2008, 102, 'Maria Ionescu', 75.00, 0.00, 75.00, 0.00, 0.00, 0.00, 0.00, 75.00, 0.00, 75.00, 0.00, 0.00, 'Finalizata', NULL),

-- Bon anulat (pentru testare)
('2024-12-06 18:00:00', 2009, 101, 'Ion Popescu', 30.00, 3.00, 27.00, 27.00, 3.00, 0.00, 0.00, 0.00, 0.00, 30.00, 0.00, 0.00, 'Anulata', NULL),

-- Bon cu voucher (pentru testare)
('2024-12-06 18:30:00', 2010, 103, 'Alexandru Dumitrescu', 50.00, 5.00, 45.00, 45.00, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 50.00, 'Finalizata', NULL);

-- =====================================================
-- 5. POPULARE RAPOARTE Z ARHIVA (Raport Z pentru ziua 2024-12-05)
-- =====================================================
INSERT INTO rapoarte_z_arhiva (
    numar_raport, data_inchidere, ora_inchidere,
    total_brut_zi, total_tva_zi, total_fara_tva_zi, numar_bonuri_zi, numar_anulari_zi,
    baza_11_zi, tva_11_zi, baza_21_zi, tva_21_zi, baza_0_zi, tva_0_zi,
    incasare_cash_zi, incasare_card_zi, incasare_voucher_zi,
    cale_fisier_zip, cale_fisier_xml, cale_fisier_html,
    checksum_sha256, checksum_xml,
    status_transmitere
) VALUES (
    'Z000001', '2024-12-05', '18:30:00',
    919.00, 79.70, 839.30, 8, 1,
    490.20, 54.50, 300.00, 63.00, 50.00, 0.00,
    639.30, 279.70, 0.00,
    'arhiva_rapoarte/2024/12/2024-12-05/raportZ_2024-12-05.zip',
    'arhiva_rapoarte/2024/12/2024-12-05/raportZ_2024-12-05.xml',
    'arhiva_rapoarte/2024/12/2024-12-05/raportZ_2024-12-05.html',
    'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    'f1e2d3c4b5a6978012345678901234567890fedcba1234567890fedcba123456',
    'Neinitializata'
);

-- =====================================================
-- 6. POPULARE REGISTRU CASA MISCAȚI
-- =====================================================
INSERT INTO registru_casa_miscari (
    data_miscare, ora_miscare, tip_miscare, suma, document_justificativ, explicatie, operator_id, operator_nume
) VALUES
-- Intrări în numerar
('2024-12-05', '08:00:00', 'Intrare', 1000.00, 'Deschidere casă', 'Deschiderea casei cu numerar de bază', 103, 'Alexandru Dumitrescu'),
('2024-12-05', '18:30:00', 'Intrare', 639.30, 'Raport Z Z000001', 'Încasări numerar din tranzacții', 103, 'Alexandru Dumitrescu'),

-- Ieșiri din numerar
('2024-12-05', '12:00:00', 'Ieșire', 50.00, 'Bon fiscal 001', 'Plată furnizor pentru ingrediente', 103, 'Alexandru Dumitrescu'),
('2024-12-05', '16:00:00', 'Ieșire', 100.00, 'Bon fiscal 002', 'Plată utilități', 103, 'Alexandru Dumitrescu'),
('2024-12-05', '19:00:00', 'Ieșire', 1489.30, 'Închidere casă', 'Închiderea casei - transfer bancar', 103, 'Alexandru Dumitrescu'),

-- Ziua următoare
('2024-12-06', '08:00:00', 'Intrare', 1000.00, 'Deschidere casă', 'Deschiderea casei cu numerar de bază', 103, 'Alexandru Dumitrescu'),
('2024-12-06', '12:00:00', 'Ieșire', 75.00, 'Bon fiscal 003', 'Plată furnizor pentru ingrediente', 103, 'Alexandru Dumitrescu');

-- =====================================================
-- 7. POPULARE LOGURI SISTEM (Pentru testare monitorizare)
-- =====================================================
INSERT INTO loguri_sistem (nivel, categorie, mesaj, detalii, user_id, ip_address, user_agent) VALUES
('INFO', 'SYSTEM', 'Sistemul fiscal a fost inițializat', JSON_OBJECT('version', '1.0', 'database', 'restaurant_fiscal'), 104, '127.0.0.1', 'Mozilla/5.0'),
('INFO', 'TRANZACTIE', 'Tranzacție nouă creată: Bon #1001', JSON_OBJECT('tranzactie_id', 1, 'operator', 'Ion Popescu', 'suma', 122.10), 101, '192.168.1.100', 'Mozilla/5.0'),
('WARN', 'BACKUP', 'Backup-ul zilnic a fost întârziat', JSON_OBJECT('expected_time', '02:00', 'actual_time', '02:15'), NULL, '127.0.0.1', 'BackupService'),
('ERROR', 'ANAF', 'Eroare la transmiterea raportului Z', JSON_OBJECT('raport_id', 1, 'error_code', 'TIMEOUT'), 103, '192.168.1.101', 'Mozilla/5.0'),
('INFO', 'RAPORT_Z', 'Raport Z generat cu succes: Z000001', JSON_OBJECT('data_inchidere', '2024-12-05', 'total_bonuri', 8), 103, '192.168.1.101', 'Mozilla/5.0');

-- =====================================================
-- 8. VERIFICARE DATE INSERATE
-- =====================================================

-- Verifică numărul de tranzacții
SELECT 
    'Tranzacții totale' as Tip,
    COUNT(*) as Numar
FROM tranzactii_comenzi
UNION ALL
SELECT 
    'Tranzacții finalizate',
    COUNT(*)
FROM tranzactii_comenzi 
WHERE status_tranzactie = 'Finalizata'
UNION ALL
SELECT 
    'Tranzacții anulate',
    COUNT(*)
FROM tranzactii_comenzi 
WHERE status_tranzactie = 'Anulata'
UNION ALL
SELECT 
    'Tranzacții cu Raport Z',
    COUNT(*)
FROM tranzactii_comenzi 
WHERE id_raport_z IS NOT NULL
UNION ALL
SELECT 
    'Tranzacții curente (fără Raport Z)',
    COUNT(*)
FROM tranzactii_comenzi 
WHERE id_raport_z IS NULL;

-- Verifică totalurile pentru Raport X (ziua curentă)
SELECT 
    'Raport X - 2024-12-06' as Raport,
    COUNT(*) as Numar_Bonuri,
    SUM(total_brut) as Total_Brut,
    SUM(total_tva) as Total_TVA,
    SUM(baza_11) as Baza_11,
    SUM(tva_11) as TVA_11,
    SUM(baza_21) as Baza_21,
    SUM(tva_21) as TVA_21,
    SUM(baza_0) as Baza_0,
    SUM(tva_0) as TVA_0,
    SUM(incasare_cash) as Cash,
    SUM(incasare_card) as Card,
    SUM(incasare_voucher) as Voucher
FROM tranzactii_comenzi 
WHERE DATE(data_comanda) = '2024-12-06' 
  AND id_raport_z IS NULL 
  AND status_tranzactie = 'Finalizata';

-- Verifică totalurile pentru Raport Z (ziua închisă)
SELECT 
    'Raport Z - 2024-12-05' as Raport,
    COUNT(*) as Numar_Bonuri,
    SUM(total_brut) as Total_Brut,
    SUM(total_tva) as Total_TVA,
    SUM(baza_11) as Baza_11,
    SUM(tva_11) as TVA_11,
    SUM(baza_21) as Baza_21,
    SUM(tva_21) as TVA_21,
    SUM(baza_0) as Baza_0,
    SUM(tva_0) as TVA_0,
    SUM(incasare_cash) as Cash,
    SUM(incasare_card) as Card,
    SUM(incasare_voucher) as Voucher
FROM tranzactii_comenzi 
WHERE DATE(data_comanda) = '2024-12-05' 
  AND id_raport_z = 1 
  AND status_tranzactie = 'Finalizata';

-- Verifică operatorii
SELECT 
    id, nume, prenume, username, rol, activ,
    CONCAT(nume, ' ', prenume) as nume_complet
FROM operatori_sistem 
ORDER BY rol, nume;

-- Verifică configurațiile
SELECT cheie, valoare, descriere, tip 
FROM configurari_sistem 
ORDER BY cheie;

-- Verifică logurile
SELECT 
    nivel, categorie, mesaj, created_at
FROM loguri_sistem 
ORDER BY created_at DESC 
LIMIT 10;

-- =====================================================
-- MESAJ FINAL
-- =====================================================
SELECT 'Datele de test au fost inserate cu succes în baza de date restaurant_fiscal!' as STATUS;
