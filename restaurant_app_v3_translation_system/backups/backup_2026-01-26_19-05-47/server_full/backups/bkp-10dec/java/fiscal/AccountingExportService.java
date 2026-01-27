package fiscal;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.dataformat.csv.CsvSchema;
import java.io.*;
import java.nio.file.*;
import java.sql.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Serviciu pentru exportul datelor fiscale către sistemele de contabilitate
 * Suportă formate: CSV, XML, Excel pentru integrarea cu MODERN, Ciel, etc.
 */
public class AccountingExportService {

    private final DatabaseService dbService;
    private final String exportBasePath;
    private final ObjectMapper objectMapper;
    private final CsvMapper csvMapper;
    
    // Configurare export
    private static final String EXPORT_ENCODING = "UTF-8";
    private static final String DATE_FORMAT = "yyyy-MM-dd";
    private static final String DATETIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
    
    public AccountingExportService(DatabaseService dbService, String exportBasePath) {
        this.dbService = dbService;
        this.exportBasePath = exportBasePath;
        this.objectMapper = new ObjectMapper();
        this.csvMapper = new CsvMapper();
        
        // Creează directorul de export
        createExportDirectory();
        
        System.out.println("✅ AccountingExportService inițializat cu succes");
    }
    
    /**
     * Exportă datele pentru o lună în format CSV (compatibil cu majoritatea sistemelor de contabilitate)
     */
    public ExportResult exportMonthlyDataCSV(int an, int luna) throws Exception {
        System.out.println("📊 Export date lunare CSV pentru " + an + "-" + String.format("%02d", luna));
        
        String fileName = String.format("fiscal_lunar_%d_%02d.csv", an, luna);
        String filePath = Paths.get(exportBasePath, "monthly", fileName).toString();
        
        // Creează directorul lunar
        Paths.get(exportBasePath, "monthly").toFile().mkdirs();
        
        try (PrintWriter writer = new PrintWriter(new FileWriter(filePath, java.nio.charset.StandardCharsets.UTF_8))) {
            // Header CSV
            writer.println("Data;Numar_Bon;Operator;Total_Brut;Total_TVA;Baza_11;TVA_11;Baza_21;TVA_21;Baza_0;TVA_0;Cash;Card;Voucher;Status");
            
            // Preluare date din baza de date
            List<Map<String, Object>> tranzactii = getTranzactiiForMonth(an, luna);
            
            for (Map<String, Object> tranzactie : tranzactii) {
                writer.printf("%s;%d;%s;%.2f;%.2f;%.2f;%.2f;%.2f;%.2f;%.2f;%.2f;%.2f;%.2f;%.2f;%s%n",
                    tranzactie.get("data_comanda"),
                    tranzactie.get("numar_bon"),
                    tranzactie.get("operator_nume"),
                    tranzactie.get("total_brut"),
                    tranzactie.get("total_tva"),
                    tranzactie.get("baza_11"),
                    tranzactie.get("tva_11"),
                    tranzactie.get("baza_21"),
                    tranzactie.get("tva_21"),
                    tranzactie.get("baza_0"),
                    tranzactie.get("tva_0"),
                    tranzactie.get("incasare_cash"),
                    tranzactie.get("incasare_card"),
                    tranzactie.get("incasare_voucher"),
                    tranzactie.get("status_tranzactie")
                );
            }
        }
        
        // Generează și fișierul de totaluri
        String totalsFileName = String.format("fiscal_totaluri_%d_%02d.csv", an, luna);
        String totalsFilePath = Paths.get(exportBasePath, "monthly", totalsFileName).toString();
        generateMonthlyTotalsCSV(totalsFilePath, an, luna);
        
        return new ExportResult(true, filePath, tranzactii.size(), 
            "Export CSV completat cu succes");
    }
    
    /**
     * Exportă datele pentru contabilitate în format XML (compatibil cu sistemele moderne)
     */
    public ExportResult exportAccountingXML(int an, int luna) throws Exception {
        System.out.println("📊 Export date contabilitate XML pentru " + an + "-" + String.format("%02d", luna));
        
        String fileName = String.format("contabilitate_%d_%02d.xml", an, luna);
        String filePath = Paths.get(exportBasePath, "accounting", fileName).toString();
        
        // Creează directorul pentru contabilitate
        Paths.get(exportBasePath, "accounting").toFile().mkdirs();
        
        // Creează structura XML
        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<ContabilitateExport>\n");
        xml.append("  <Header>\n");
        xml.append("    <ExportDate>").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern(DATETIME_FORMAT))).append("</ExportDate>\n");
        xml.append("    <Period>").append(an).append("-").append(String.format("%02d", luna)).append("</Period>\n");
        xml.append("    <Company>SC RESTAURANT TRATTORIA SRL</Company>\n");
        xml.append("    <CUI>RO12345678</CUI>\n");
        xml.append("  </Header>\n");
        xml.append("  <Tranzactii>\n");
        
        // Adaugă tranzacțiile
        List<Map<String, Object>> tranzactii = getTranzactiiForMonth(an, luna);
        for (Map<String, Object> tranzactie : tranzactii) {
            xml.append("    <Tranzactie>\n");
            xml.append("      <Data>").append(tranzactie.get("data_comanda")).append("</Data>\n");
            xml.append("      <NumarBon>").append(tranzactie.get("numar_bon")).append("</NumarBon>\n");
            xml.append("      <Operator>").append(tranzactie.get("operator_nume")).append("</Operator>\n");
            xml.append("      <TotalBrut>").append(String.format("%.2f", tranzactie.get("total_brut"))).append("</TotalBrut>\n");
            xml.append("      <TotalTVA>").append(String.format("%.2f", tranzactie.get("total_tva"))).append("</TotalTVA>\n");
            xml.append("      <DetaliiTVA>\n");
            xml.append("        <Baza11>").append(String.format("%.2f", tranzactie.get("baza_11"))).append("</Baza11>\n");
            xml.append("        <TVA11>").append(String.format("%.2f", tranzactie.get("tva_11"))).append("</TVA11>\n");
            xml.append("        <Baza21>").append(String.format("%.2f", tranzactie.get("baza_21"))).append("</Baza21>\n");
            xml.append("        <TVA21>").append(String.format("%.2f", tranzactie.get("tva_21"))).append("</TVA21>\n");
            xml.append("        <Baza0>").append(String.format("%.2f", tranzactie.get("baza_0"))).append("</Baza0>\n");
            xml.append("        <TVA0>").append(String.format("%.2f", tranzactie.get("tva_0"))).append("</TVA0>\n");
            xml.append("      </DetaliiTVA>\n");
            xml.append("      <Incasari>\n");
            xml.append("        <Cash>").append(String.format("%.2f", tranzactie.get("incasare_cash"))).append("</Cash>\n");
            xml.append("        <Card>").append(String.format("%.2f", tranzactie.get("incasare_card"))).append("</Card>\n");
            xml.append("        <Voucher>").append(String.format("%.2f", tranzactie.get("incasare_voucher"))).append("</Voucher>\n");
            xml.append("      </Incasari>\n");
            xml.append("      <Status>").append(tranzactie.get("status_tranzactie")).append("</Status>\n");
            xml.append("    </Tranzactie>\n");
        }
        
        xml.append("  </Tranzactii>\n");
        
        // Adaugă totalurile
        Map<String, Object> totals = getMonthlyTotals(an, luna);
        xml.append("  <Totaluri>\n");
        xml.append("    <TotalBrut>").append(String.format("%.2f", totals.get("total_brut"))).append("</TotalBrut>\n");
        xml.append("    <TotalTVA>").append(String.format("%.2f", totals.get("total_tva"))).append("</TotalTVA>\n");
        xml.append("    <NumarBonuri>").append(totals.get("numar_bonuri")).append("</NumarBonuri>\n");
        xml.append("    <TotalCash>").append(String.format("%.2f", totals.get("total_cash"))).append("</TotalCash>\n");
        xml.append("    <TotalCard>").append(String.format("%.2f", totals.get("total_card"))).append("</TotalCard>\n");
        xml.append("    <TotalVoucher>").append(String.format("%.2f", totals.get("total_voucher"))).append("</TotalVoucher>\n");
        xml.append("  </Totaluri>\n");
        xml.append("</ContabilitateExport>\n");
        
        // Scrie fișierul XML
        Files.write(Paths.get(filePath), xml.toString().getBytes(EXPORT_ENCODING));
        
        return new ExportResult(true, filePath, tranzactii.size(), 
            "Export XML completat cu succes");
    }
    
    /**
     * Exportă datele în format Excel (XLSX) pentru contabilitate
     */
    public ExportResult exportAccountingExcel(int an, int luna) throws Exception {
        System.out.println("📊 Export date contabilitate Excel pentru " + an + "-" + String.format("%02d", luna));
        
        String fileName = String.format("contabilitate_%d_%02d.xlsx", an, luna);
        String filePath = Paths.get(exportBasePath, "excel", fileName).toString();
        
        // Creează directorul pentru Excel
        Paths.get(exportBasePath, "excel").toFile().mkdirs();
        
        // Pentru simplitate, vom crea un CSV care poate fi deschis în Excel
        // În implementarea reală, s-ar folosi Apache POI pentru XLSX
        String csvFileName = fileName.replace(".xlsx", ".csv");
        String csvFilePath = Paths.get(exportBasePath, "excel", csvFileName).toString();
        
        try (PrintWriter writer = new PrintWriter(new FileWriter(csvFilePath, java.nio.charset.StandardCharsets.UTF_8))) {
            // Header cu BOM pentru Excel
            writer.print('\uFEFF');
            writer.println("Data,Numar Bon,Operator,Total Brut,Total TVA,Baza 11%,TVA 11%,Baza 21%,TVA 21%,Baza 0%,TVA 0%,Cash,Card,Voucher,Status");
            
            List<Map<String, Object>> tranzactii = getTranzactiiForMonth(an, luna);
            
            for (Map<String, Object> tranzactie : tranzactii) {
                writer.printf("%s,%d,%s,%.2f,%.2f,%.2f,%.2f,%.2f,%.2f,%.2f,%.2f,%.2f,%.2f,%.2f,%s%n",
                    tranzactie.get("data_comanda"),
                    tranzactie.get("numar_bon"),
                    tranzactie.get("operator_nume"),
                    tranzactie.get("total_brut"),
                    tranzactie.get("total_tva"),
                    tranzactie.get("baza_11"),
                    tranzactie.get("tva_11"),
                    tranzactie.get("baza_21"),
                    tranzactie.get("tva_21"),
                    tranzactie.get("baza_0"),
                    tranzactie.get("tva_0"),
                    tranzactie.get("incasare_cash"),
                    tranzactie.get("incasare_card"),
                    tranzactie.get("incasare_voucher"),
                    tranzactie.get("status_tranzactie")
                );
            }
        }
        
        return new ExportResult(true, csvFilePath, 0, 
            "Export Excel (CSV) completat cu succes");
    }
    
    /**
     * Exportă datele pentru MODERN (format specific)
     */
    public ExportResult exportForMODERN(int an, int luna) throws Exception {
        System.out.println("📊 Export pentru MODERN pentru " + an + "-" + String.format("%02d", luna));
        
        String fileName = String.format("MODERN_import_%d_%02d.txt", an, luna);
        String filePath = Paths.get(exportBasePath, "MODERN", fileName).toString();
        
        // Creează directorul pentru MODERN
        Paths.get(exportBasePath, "MODERN").toFile().mkdirs();
        
        try (PrintWriter writer = new PrintWriter(new FileWriter(filePath, java.nio.charset.StandardCharsets.UTF_8))) {
            // Header pentru MODERN
            writer.println("MODERN IMPORT - Sistem Fiscal Restaurant");
            writer.println("Perioada: " + an + "-" + String.format("%02d", luna));
            writer.println("Data export: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern(DATETIME_FORMAT)));
            writer.println("Companie: SC RESTAURANT TRATTORIA SRL");
            writer.println("CUI: RO12345678");
            writer.println();
            
            // Format specific MODERN pentru tranzacții
            List<Map<String, Object>> tranzactii = getTranzactiiForMonth(an, luna);
            
            for (Map<String, Object> tranzactie : tranzactii) {
                // Format: Data|Bon|Operator|Total|TVA|Cash|Card|Status
                writer.printf("%s|%d|%s|%.2f|%.2f|%.2f|%.2f|%s%n",
                    tranzactie.get("data_comanda"),
                    tranzactie.get("numar_bon"),
                    tranzactie.get("operator_nume"),
                    tranzactie.get("total_brut"),
                    tranzactie.get("total_tva"),
                    tranzactie.get("incasare_cash"),
                    tranzactie.get("incasare_card"),
                    tranzactie.get("status_tranzactie")
                );
            }
            
            writer.println();
            writer.println("END OF FILE");
        }
        
        return new ExportResult(true, filePath, 0, 
            "Export MODERN completat cu succes");
    }
    
    /**
     * Exportă datele pentru Ciel (format specific)
     */
    public ExportResult exportForCiel(int an, int luna) throws Exception {
        System.out.println("📊 Export pentru Ciel pentru " + an + "-" + String.format("%02d", luna));
        
        String fileName = String.format("ciel_import_%d_%02d.csv", an, luna);
        String filePath = Paths.get(exportBasePath, "ciel", fileName).toString();
        
        // Creează directorul pentru Ciel
        Paths.get(exportBasePath, "ciel").toFile().mkdirs();
        
        try (PrintWriter writer = new PrintWriter(new FileWriter(filePath, java.nio.charset.StandardCharsets.UTF_8))) {
            // Header specific Ciel
            writer.println("# CIEL IMPORT - Sistem Fiscal Restaurant");
            writer.println("# Perioada: " + an + "-" + String.format("%02d", luna));
            writer.println("# Data export: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern(DATETIME_FORMAT)));
            writer.println("#");
            writer.println("Data,Document,Operator,Valoare,TVA,Cont_Casa,Cont_Client");
            
            List<Map<String, Object>> tranzactii = getTranzactiiForMonth(an, luna);
            
            for (Map<String, Object> tranzactie : tranzactii) {
                // Format specific Ciel
                writer.printf("%s,%d,%s,%.2f,%.2f,%.2f,%.2f%n",
                    tranzactie.get("data_comanda"),
                    tranzactie.get("numar_bon"),
                    tranzactie.get("operator_nume"),
                    tranzactie.get("total_brut"),
                    tranzactie.get("total_tva"),
                    tranzactie.get("incasare_cash"),
                    tranzactie.get("incasare_card")
                );
            }
        }
        
        return new ExportResult(true, filePath, 0, 
            "Export Ciel completat cu succes");
    }
    
    /**
     * Generează fișierul de totaluri pentru o lună
     */
    private void generateMonthlyTotalsCSV(String filePath, int an, int luna) throws Exception {
        Map<String, Object> totals = getMonthlyTotals(an, luna);
        
        try (PrintWriter writer = new PrintWriter(new FileWriter(filePath, java.nio.charset.StandardCharsets.UTF_8))) {
            writer.println("Totaluri Lunare - " + an + "-" + String.format("%02d", luna));
            writer.println("Data generare: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern(DATETIME_FORMAT)));
            writer.println();
            writer.println("Total Brut: " + String.format("%.2f", totals.get("total_brut")));
            writer.println("Total TVA: " + String.format("%.2f", totals.get("total_tva")));
            writer.println("Numar Bonuri: " + totals.get("numar_bonuri"));
            writer.println();
            writer.println("Detalii TVA:");
            writer.println("Baza 11%: " + String.format("%.2f", totals.get("baza_11")));
            writer.println("TVA 11%: " + String.format("%.2f", totals.get("tva_11")));
            writer.println("Baza 21%: " + String.format("%.2f", totals.get("baza_21")));
            writer.println("TVA 21%: " + String.format("%.2f", totals.get("tva_21")));
            writer.println("Baza 0%: " + String.format("%.2f", totals.get("baza_0")));
            writer.println("TVA 0%: " + String.format("%.2f", totals.get("tva_0")));
            writer.println();
            writer.println("Incasari:");
            writer.println("Cash: " + String.format("%.2f", totals.get("total_cash")));
            writer.println("Card: " + String.format("%.2f", totals.get("total_card")));
            writer.println("Voucher: " + String.format("%.2f", totals.get("total_voucher")));
        }
    }
    
    /**
     * Obține tranzacțiile pentru o lună specifică
     */
    private List<Map<String, Object>> getTranzactiiForMonth(int an, int luna) throws SQLException {
        List<Map<String, Object>> tranzactii = new ArrayList<>();
        
        String sql = """
            SELECT 
                tc.data_comanda,
                tc.numar_bon,
                tc.operator_nume,
                tc.total_brut,
                tc.total_tva,
                tc.baza_11,
                tc.tva_11,
                tc.baza_21,
                tc.tva_21,
                tc.baza_0,
                tc.tva_0,
                tc.incasare_cash,
                tc.incasare_card,
                tc.incasare_voucher,
                tc.status_tranzactie
            FROM tranzactii_comenzi tc
            WHERE YEAR(tc.data_comanda) = ? 
              AND MONTH(tc.data_comanda) = ?
              AND tc.status_tranzactie IN ('Finalizata', 'Anulata')
            ORDER BY tc.data_comanda, tc.numar_bon
            """;
        
        try (Connection conn = dbService.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, an);
            stmt.setInt(2, luna);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> tranzactie = new HashMap<>();
                    tranzactie.put("data_comanda", rs.getTimestamp("data_comanda").toLocalDateTime()
                        .format(DateTimeFormatter.ofPattern(DATETIME_FORMAT)));
                    tranzactie.put("numar_bon", rs.getInt("numar_bon"));
                    tranzactie.put("operator_nume", rs.getString("operator_nume"));
                    tranzactie.put("total_brut", rs.getDouble("total_brut"));
                    tranzactie.put("total_tva", rs.getDouble("total_tva"));
                    tranzactie.put("baza_11", rs.getDouble("baza_11"));
                    tranzactie.put("tva_11", rs.getDouble("tva_11"));
                    tranzactie.put("baza_21", rs.getDouble("baza_21"));
                    tranzactie.put("tva_21", rs.getDouble("tva_21"));
                    tranzactie.put("baza_0", rs.getDouble("baza_0"));
                    tranzactie.put("tva_0", rs.getDouble("tva_0"));
                    tranzactie.put("incasare_cash", rs.getDouble("incasare_cash"));
                    tranzactie.put("incasare_card", rs.getDouble("incasare_card"));
                    tranzactie.put("incasare_voucher", rs.getDouble("incasare_voucher"));
                    tranzactie.put("status_tranzactie", rs.getString("status_tranzactie"));
                    
                    tranzactii.add(tranzactie);
                }
            }
        }
        
        return tranzactii;
    }
    
    /**
     * Obține totalurile pentru o lună specifică
     */
    private Map<String, Object> getMonthlyTotals(int an, int luna) throws SQLException {
        Map<String, Object> totals = new HashMap<>();
        
        String sql = """
            SELECT 
                COUNT(*) as numar_bonuri,
                COALESCE(SUM(total_brut), 0) as total_brut,
                COALESCE(SUM(total_tva), 0) as total_tva,
                COALESCE(SUM(baza_11), 0) as baza_11,
                COALESCE(SUM(tva_11), 0) as tva_11,
                COALESCE(SUM(baza_21), 0) as baza_21,
                COALESCE(SUM(tva_21), 0) as tva_21,
                COALESCE(SUM(baza_0), 0) as baza_0,
                COALESCE(SUM(tva_0), 0) as tva_0,
                COALESCE(SUM(incasare_cash), 0) as total_cash,
                COALESCE(SUM(incasare_card), 0) as total_card,
                COALESCE(SUM(incasare_voucher), 0) as total_voucher
            FROM tranzactii_comenzi
            WHERE YEAR(data_comanda) = ? 
              AND MONTH(data_comanda) = ?
              AND status_tranzactie = 'Finalizata'
            """;
        
        try (Connection conn = dbService.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, an);
            stmt.setInt(2, luna);
            
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    totals.put("numar_bonuri", rs.getInt("numar_bonuri"));
                    totals.put("total_brut", rs.getDouble("total_brut"));
                    totals.put("total_tva", rs.getDouble("total_tva"));
                    totals.put("baza_11", rs.getDouble("baza_11"));
                    totals.put("tva_11", rs.getDouble("tva_11"));
                    totals.put("baza_21", rs.getDouble("baza_21"));
                    totals.put("tva_21", rs.getDouble("tva_21"));
                    totals.put("baza_0", rs.getDouble("baza_0"));
                    totals.put("tva_0", rs.getDouble("tva_0"));
                    totals.put("total_cash", rs.getDouble("total_cash"));
                    totals.put("total_card", rs.getDouble("total_card"));
                    totals.put("total_voucher", rs.getDouble("total_voucher"));
                }
            }
        }
        
        return totals;
    }
    
    /**
     * Creează directorul de export
     */
    private void createExportDirectory() {
        try {
            Paths.get(exportBasePath).toFile().mkdirs();
            Paths.get(exportBasePath, "monthly").toFile().mkdirs();
            Paths.get(exportBasePath, "accounting").toFile().mkdirs();
            Paths.get(exportBasePath, "excel").toFile().mkdirs();
            Paths.get(exportBasePath, "MODERN").toFile().mkdirs();
            Paths.get(exportBasePath, "ciel").toFile().mkdirs();
        } catch (Exception e) {
            System.err.println("❌ Eroare la crearea directorului de export: " + e.getMessage());
        }
    }
    
    /**
     * Clasa pentru rezultatul exportului
     */
    public static class ExportResult {
        private final boolean success;
        private final String filePath;
        private final int recordCount;
        private final String message;
        
        public ExportResult(boolean success, String filePath, int recordCount, String message) {
            this.success = success;
            this.filePath = filePath;
            this.recordCount = recordCount;
            this.message = message;
        }
        
        public boolean isSuccess() { return success; }
        public String getFilePath() { return filePath; }
        public int getRecordCount() { return recordCount; }
        public String getMessage() { return message; }
        
        @Override
        public String toString() {
            return String.format("ExportResult{success=%s, path='%s', records=%d, message='%s'}", 
                success, filePath, recordCount, message);
        }
    }
}
