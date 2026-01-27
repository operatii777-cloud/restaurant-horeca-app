package fiscal;

import java.sql.*;
import java.time.LocalDate;
import java.util.*;

/**
 * Serviciu pentru gestionarea interogărilor către baza de date
 * Conține toate interogările SQL necesare pentru rapoartele fiscale
 */
public class DatabaseService {

    private final String connectionString;
    private final String username;
    private final String password;

    public DatabaseService(String connectionString, String username, String password) {
        this.connectionString = connectionString;
        this.username = username;
        this.password = password;
    }

    /**
     * Preia totalurile TVA pentru o anumită zi
     */
    public Map<String, Object> getTotaluriTVA(LocalDate dataRaport) {
        Map<String, Object> result = new HashMap<>();
        
        try (Connection conn = getConnection()) {
            String sql = """
                SELECT 
                    COALESCE(SUM(baza_11), 0) as baza_11,
                    COALESCE(SUM(tva_11), 0) as tva_11,
                    COALESCE(SUM(baza_11 + tva_11), 0) as total_11,
                    COALESCE(SUM(baza_21), 0) as baza_21,
                    COALESCE(SUM(tva_21), 0) as tva_21,
                    COALESCE(SUM(baza_21 + tva_21), 0) as total_21,
                    COALESCE(SUM(baza_0), 0) as baza_0,
                    COALESCE(SUM(tva_0), 0) as tva_0,
                    COALESCE(SUM(baza_0 + tva_0), 0) as total_0,
                    COALESCE(SUM(total_brut), 0) as total_brut
                FROM tranzactii_comenzi 
                WHERE DATE(data_comanda) = ? 
                  AND (id_raport_z IS NULL OR ? = true)
                  AND status_tranzactie = 'Finalizata'
                """;
            
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setDate(1, Date.valueOf(dataRaport));
                stmt.setBoolean(2, false); // false pentru Raport X (doar tranzacții curente)
                ResultSet rs = stmt.executeQuery();
                
                if (rs.next()) {
                    result.put("baza_11", rs.getDouble("baza_11"));
                    result.put("tva_11", rs.getDouble("tva_11"));
                    result.put("total_11", rs.getDouble("total_11"));
                    result.put("baza_21", rs.getDouble("baza_21"));
                    result.put("tva_21", rs.getDouble("tva_21"));
                    result.put("total_21", rs.getDouble("total_21"));
                    result.put("baza_0", rs.getDouble("baza_0"));
                    result.put("tva_0", rs.getDouble("tva_0"));
                    result.put("total_0", rs.getDouble("total_0"));
                    result.put("total_brut", rs.getDouble("total_brut"));
                }
            }
            
        } catch (SQLException e) {
            System.err.println("Eroare la preluarea totalurilor TVA: " + e.getMessage());
            // Returnează valori zero în caz de eroare
            result.put("baza_11", 0.0);
            result.put("tva_11", 0.0);
            result.put("total_11", 0.0);
            result.put("baza_21", 0.0);
            result.put("tva_21", 0.0);
            result.put("total_21", 0.0);
            result.put("baza_0", 0.0);
            result.put("tva_0", 0.0);
            result.put("total_0", 0.0);
            result.put("total_brut", 0.0);
        }
        
        return result;
    }

    /**
     * Preia încasările pe metode de plată pentru o anumită zi
     */
    public Map<String, Object> getIncasariPeMetode(LocalDate dataRaport) {
        Map<String, Object> result = new HashMap<>();
        
        try (Connection conn = getConnection()) {
            String sql = """
                SELECT 
                    COALESCE(SUM(incasare_cash), 0) as cash,
                    COALESCE(SUM(incasare_card), 0) as card,
                    COALESCE(SUM(incasare_voucher), 0) as voucher
                FROM tranzactii_comenzi 
                WHERE DATE(data_comanda) = ? 
                  AND (id_raport_z IS NULL OR ? = true)
                  AND status_tranzactie = 'Finalizata'
                """;
            
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setDate(1, Date.valueOf(dataRaport));
                stmt.setBoolean(2, false); // false pentru Raport X
                ResultSet rs = stmt.executeQuery();
                
                if (rs.next()) {
                    result.put("cash", rs.getDouble("cash"));
                    result.put("card", rs.getDouble("card"));
                    result.put("voucher", rs.getDouble("voucher"));
                }
            }
            
        } catch (SQLException e) {
            System.err.println("Eroare la preluarea încasărilor: " + e.getMessage());
            result.put("cash", 0.0);
            result.put("card", 0.0);
            result.put("voucher", 0.0);
        }
        
        return result;
    }

    /**
     * Preia indicatorii pentru o anumită zi
     */
    public Map<String, Object> getIndicatoriZi(LocalDate dataRaport) {
        Map<String, Object> result = new HashMap<>();
        
        try (Connection conn = getConnection()) {
            String sql = """
                SELECT 
                    COUNT(*) as nr_bonuri,
                    SUM(CASE WHEN status_tranzactie = 'Anulata' THEN 1 ELSE 0 END) as nr_anulari,
                    SUM(CASE WHEN status_tranzactie = 'Anulata' THEN total_brut ELSE 0 END) as suma_anulata,
                    COALESCE(MAX(total_brut), 0) as bon_max,
                    COALESCE(MIN(total_brut), 0) as bon_min
                FROM tranzactii_comenzi 
                WHERE DATE(data_comanda) = ? 
                  AND (id_raport_z IS NULL OR ? = true)
                  AND status_tranzactie IN ('Finalizata', 'Anulata')
                """;
            
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setDate(1, Date.valueOf(dataRaport));
                stmt.setBoolean(2, false); // false pentru Raport X
                ResultSet rs = stmt.executeQuery();
                
                if (rs.next()) {
                    result.put("nr_bonuri", rs.getInt("nr_bonuri"));
                    result.put("nr_anulari", rs.getInt("nr_anulari"));
                    result.put("suma_anulata", rs.getDouble("suma_anulata"));
                    result.put("bon_max", rs.getDouble("bon_max"));
                    result.put("bon_min", rs.getDouble("bon_min"));
                }
            }
            
        } catch (SQLException e) {
            System.err.println("Eroare la preluarea indicatorilor: " + e.getMessage());
            result.put("nr_bonuri", 0);
            result.put("nr_anulari", 0);
            result.put("suma_anulata", 0.0);
            result.put("bon_max", 0.0);
            result.put("bon_min", 0.0);
        }
        
        return result;
    }

    /**
     * Preia toate rapoartele Z dintr-o lună pentru agregarea raportului lunar
     */
    public List<RaportDataDTO> getRapoarteZDinLuna(int an, int luna) {
        List<RaportDataDTO> rapoarte = new ArrayList<>();
        
        try (Connection conn = getConnection()) {
            String sql = """
                SELECT 
                    DATE(data_creare) as data_raport,
                    SUM(CASE WHEN cota_tva = 11 THEN valoare_fara_tva ELSE 0 END) as baza_11,
                    SUM(CASE WHEN cota_tva = 11 THEN valoare_tva ELSE 0 END) as tva_11,
                    SUM(CASE WHEN cota_tva = 11 THEN valoare_cu_tva ELSE 0 END) as total_11,
                    SUM(CASE WHEN cota_tva = 21 THEN valoare_fara_tva ELSE 0 END) as baza_21,
                    SUM(CASE WHEN cota_tva = 21 THEN valoare_tva ELSE 0 END) as tva_21,
                    SUM(CASE WHEN cota_tva = 21 THEN valoare_cu_tva ELSE 0 END) as total_21,
                    SUM(CASE WHEN cota_tva = 0 THEN valoare_fara_tva ELSE 0 END) as baza_0,
                    SUM(CASE WHEN cota_tva = 0 THEN valoare_tva ELSE 0 END) as tva_0,
                    SUM(CASE WHEN cota_tva = 0 THEN valoare_cu_tva ELSE 0 END) as total_0,
                    SUM(valoare_cu_tva) as total_brut,
                    COUNT(*) as nr_bonuri,
                    SUM(CASE WHEN status = 'anulat' THEN 1 ELSE 0 END) as nr_anulari,
                    SUM(CASE WHEN status = 'anulat' THEN valoare_cu_tva ELSE 0 END) as suma_anulata,
                    MAX(valoare_cu_tva) as bon_max,
                    MIN(valoare_cu_tva) as bon_min,
                    SUM(CASE WHEN metoda_plata = 'cash' THEN valoare_cu_tva ELSE 0 END) as cash,
                    SUM(CASE WHEN metoda_plata = 'card' THEN valoare_cu_tva ELSE 0 END) as card,
                    SUM(CASE WHEN metoda_plata = 'voucher' THEN valoare_cu_tva ELSE 0 END) as voucher
                FROM bonuri_fiscale 
                WHERE YEAR(data_creare) = ? AND MONTH(data_creare) = ? AND status = 'emis'
                GROUP BY DATE(data_creare)
                ORDER BY DATE(data_creare)
                """;
            
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setInt(1, an);
                stmt.setInt(2, luna);
                ResultSet rs = stmt.executeQuery();
                
                while (rs.next()) {
                    RaportDataDTO raport = new RaportDataDTO(
                        rs.getDouble("baza_11"),
                        rs.getDouble("tva_11"),
                        rs.getDouble("total_11"),
                        rs.getDouble("baza_21"),
                        rs.getDouble("tva_21"),
                        rs.getDouble("total_21"),
                        rs.getDouble("baza_0"),
                        rs.getDouble("tva_0"),
                        rs.getDouble("total_0"),
                        rs.getDouble("total_brut"),
                        rs.getInt("nr_bonuri"),
                        rs.getInt("nr_anulari"),
                        rs.getDouble("suma_anulata"),
                        rs.getDouble("bon_max"),
                        rs.getDouble("bon_min"),
                        rs.getDouble("cash"),
                        rs.getDouble("card"),
                        rs.getDouble("voucher")
                    );
                    rapoarte.add(raport);
                }
            }
            
        } catch (SQLException e) {
            System.err.println("Eroare la preluarea rapoartelor Z din lună: " + e.getMessage());
        }
        
        return rapoarte;
    }

    /**
     * Verifică dacă o zi este deja închisă fiscal
     */
    public boolean isZiuaInchisa(LocalDate dataRaport) {
        try (Connection conn = getConnection()) {
            String sql = "SELECT COUNT(*) FROM rapoarte_z_arhiva WHERE data_inchidere = ?";
            
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setDate(1, Date.valueOf(dataRaport));
                ResultSet rs = stmt.executeQuery();
                
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }
            
        } catch (SQLException e) {
            System.err.println("Eroare la verificarea stării zilei: " + e.getMessage());
        }
        
        return false;
    }

    /**
     * Marchează o zi ca fiind închisă fiscal
     */
    public void marcheazaZiuaCaInchisa(LocalDate dataRaport, String numarRaport) {
        try (Connection conn = getConnection()) {
            // Această metodă este acum gestionată de RaportService.generateRaportZ()
            // care inserează direct în rapoarte_z_arhiva și actualizează tranzactii_comenzi
            System.out.println("Ziua " + dataRaport + " a fost marcată ca închisă cu raportul " + numarRaport);
        } catch (Exception e) {
            System.err.println("Eroare la marcarea zilei ca închisă: " + e.getMessage());
        }
    }

    /**
     * Obține următorul număr de raport Z
     */
    public int getNextRaportZNumber() {
        try (Connection conn = getConnection()) {
            String sql = "SELECT COALESCE(MAX(CAST(SUBSTRING(numar_raport, 2) AS UNSIGNED)), 0) + 1 FROM rapoarte_z_arhiva";
            
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                ResultSet rs = stmt.executeQuery();
                
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
            
        } catch (SQLException e) {
            System.err.println("Eroare la obținerea numărului următor de raport Z: " + e.getMessage());
        }
        
        return 1; // Valoare implicită
    }

    /**
     * Încarcă șablonul HTML pentru un tip de raport
     */
    public String loadHtmlTemplate(String tipRaport) {
        try {
            // Încarcă șablonul din fișierul corespunzător
            String templatePath = "public/templates/fiscal/" + tipRaport + ".html";
            return new String(java.nio.file.Files.readAllBytes(java.nio.file.Paths.get(templatePath)));
        } catch (Exception e) {
            System.err.println("Eroare la încărcarea șablonului " + tipRaport + ": " + e.getMessage());
            return "<html><body><h1>Șablon indisponibil</h1></body></html>";
        }
    }

    /**
     * Preia istoricul comenzilor pentru raportul de gestionare comenzi
     */
    public List<Map<String, Object>> getIstoricComenzi(LocalDate dataStart, LocalDate dataStop, String operator) {
        List<Map<String, Object>> comenzi = new ArrayList<>();
        
        try (Connection conn = getConnection()) {
            StringBuilder sql = new StringBuilder("""
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
                    END as metoda_plata
                FROM tranzactii_comenzi tc
                WHERE DATE(tc.data_comanda) BETWEEN ? AND ?
                """);
            
            List<Object> params = new ArrayList<>();
            params.add(Date.valueOf(dataStart));
            params.add(Date.valueOf(dataStop));
            
            if (operator != null && !operator.isEmpty()) {
                sql.append(" AND tc.operator_nume LIKE ?");
                params.add("%" + operator + "%");
            }
            
            sql.append(" ORDER BY tc.data_comanda DESC");
            
            try (PreparedStatement stmt = conn.prepareStatement(sql.toString())) {
                for (int i = 0; i < params.size(); i++) {
                    stmt.setObject(i + 1, params.get(i));
                }
                
                ResultSet rs = stmt.executeQuery();
                
                while (rs.next()) {
                    Map<String, Object> comanda = new HashMap<>();
                    comanda.put("id", rs.getLong("id"));
                    comanda.put("numarBon", rs.getInt("numar_bon"));
                    comanda.put("dataOra", rs.getTimestamp("data_comanda").toString());
                    comanda.put("ospatar", rs.getString("operator_nume"));
                    comanda.put("totalBrut", rs.getDouble("total_brut"));
                    comanda.put("metodaPlata", rs.getString("metoda_plata"));
                    comanda.put("status", rs.getString("status_tranzactie"));
                    comenzi.add(comanda);
                }
            }
            
        } catch (SQLException e) {
            System.err.println("Eroare la preluarea istoricului comenzilor: " + e.getMessage());
        }
        
        return comenzi;
    }

    /**
     * Preia lista fișierelor din arhivă
     */
    public List<Map<String, String>> getFisiereArhiva(String data, String luna) {
        List<Map<String, String>> fisiere = new ArrayList<>();
        
        try (Connection conn = getConnection()) {
            if (data != null && !data.isEmpty()) {
                // Căutare după dată specifică (Raport Z)
                String sql = """
                    SELECT 
                        numar_raport,
                        data_inchidere,
                        cale_fisier_zip,
                        cale_fisier_xml,
                        cale_fisier_html,
                        checksum_sha256,
                        status_transmitere
                    FROM rapoarte_z_arhiva 
                    WHERE data_inchidere = ?
                    ORDER BY data_inchidere DESC
                    """;
                
                try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                    stmt.setDate(1, Date.valueOf(data));
                    ResultSet rs = stmt.executeQuery();
                    
                    while (rs.next()) {
                        Map<String, String> fisier = new HashMap<>();
                        fisier.put("nume", "Raport Z " + rs.getString("numar_raport") + " - " + rs.getDate("data_inchidere"));
                        fisier.put("tip", "Z");
                        fisier.put("dataCreare", rs.getDate("data_inchidere").toString());
                        fisier.put("linkDescarcare", "/api/download/" + rs.getString("cale_fisier_zip"));
                        fisier.put("checksum", rs.getString("checksum_sha256"));
                        fisier.put("status", rs.getString("status_transmitere"));
                        fisiere.add(fisier);
                    }
                }
                
            } else if (luna != null && !luna.isEmpty()) {
                // Căutare după lună (Raport Lunar)
                String sql = """
                    SELECT 
                        luna_an,
                        luna_nume,
                        an,
                        cale_fisier_zip,
                        checksum_sha256,
                        status_transmitere
                    FROM rapoarte_lunare_arhiva 
                    WHERE luna_an = ?
                    ORDER BY an DESC, luna_an DESC
                    """;
                
                try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                    stmt.setString(1, luna);
                    ResultSet rs = stmt.executeQuery();
                    
                    while (rs.next()) {
                        Map<String, String> fisier = new HashMap<>();
                        fisier.put("nume", "Raport Lunar " + rs.getString("luna_nume") + " " + rs.getInt("an"));
                        fisier.put("tip", "Lunar");
                        fisier.put("dataCreare", rs.getString("luna_an"));
                        fisier.put("linkDescarcare", "/api/download/" + rs.getString("cale_fisier_zip"));
                        fisier.put("checksum", rs.getString("checksum_sha256"));
                        fisier.put("status", rs.getString("status_transmitere"));
                        fisiere.add(fisier);
                    }
                }
            }
            
        } catch (Exception e) {
            System.err.println("Eroare la preluarea fișierelor din arhivă: " + e.getMessage());
        }
        
        return fisiere;
    }

    /**
     * Creează conexiunea la baza de date
     */
    public Connection getConnection() throws SQLException {
        return DriverManager.getConnection(connectionString, username, password);
    }
    
    /**
     * Testează conexiunea la baza de date
     */
    public boolean testConnection() {
        try (Connection conn = getConnection()) {
            return conn != null && !conn.isClosed();
        } catch (SQLException e) {
            System.err.println("Eroare la testarea conexiunii: " + e.getMessage());
            return false;
        }
    }
}
