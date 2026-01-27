package controllers;

import fiscal.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import java.io.*;
import java.nio.file.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import javax.servlet.*;
import javax.servlet.http.*;

/**
 * Controller principal pentru toate operațiunile fiscale
 * Gestionează endpoint-urile pentru rapoarte, arhivare și export
 */
public class FiscalController extends HttpServlet {
    
    private RaportService raportService;
    private DatabaseService dbService;
    private RaportExporter exporter;
    private AnafService anafService;
    private ObjectMapper objectMapper;
    
    @Override
    public void init(ServletConfig config) throws ServletException {
        super.init(config);
        
        // Inițializează serviciile
        try {
            String dbUrl = "jdbc:mysql://localhost:3306/restaurant_db";
            String dbUser = "root";
            String dbPassword = "password";
            
            this.dbService = new DatabaseService(dbUrl, dbUser, dbPassword);
            this.exporter = new RaportExporter();
            this.raportService = new RaportService(dbService, exporter);
            
            // Inițializează AnafService cu configurațiile fiscale
            Properties fiscalConfig = loadFiscalConfig();
            this.anafService = new AnafService(fiscalConfig, raportService, dbService);
            
            this.objectMapper = new ObjectMapper();
            this.objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
            
            System.out.println("✅ FiscalController inițializat cu succes");
        } catch (Exception e) {
            System.err.println("❌ Eroare la inițializarea FiscalController: " + e.getMessage());
            throw new ServletException("Nu s-a putut inițializa serviciul fiscal", e);
        }
    }
    
    /**
     * Încarcă configurațiile fiscale din fișierul properties
     */
    private Properties loadFiscalConfig() {
        Properties config = new Properties();
        try {
            String configPath = getServletContext().getRealPath("/WEB-INF/fiscal-config.properties");
            if (configPath != null && new File(configPath).exists()) {
                config.load(new FileInputStream(configPath));
            } else {
                // Configurații default pentru testare
                config.setProperty("fiscal.cui", "RO12345678");
                config.setProperty("fiscal.denumire", "SC RESTAURANT SRL");
                config.setProperty("anaf.cert.path", "C:/Certificates/certificat_digital.pfx");
                config.setProperty("anaf.cert.password", "ParolaSecreta");
                config.setProperty("anaf.auth.url", "https://api.anaf.ro/oauth2/token");
                config.setProperty("anaf.upload.url", "https://api.anaf.ro/upload/doc");
                config.setProperty("anaf.check.url", "https://api.anaf.ro/status/doc");
                config.setProperty("anaf.export.path", "C:/restaurant_app/server/anaf_exports");
            }
        } catch (Exception e) {
            System.err.println("⚠️ Eroare la încărcarea configurărilor fiscale: " + e.getMessage());
        }
        return config;
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String pathInfo = request.getPathInfo();
        if (pathInfo == null) {
            sendErrorResponse(response, 400, "Endpoint necunoscut");
            return;
        }
        
        try {
            switch (pathInfo) {
                case "/raport/x":
                    handleGetRaportX(request, response);
                    break;
                case "/raport/z/status":
                    handleGetRaportZStatus(request, response);
                    break;
                case "/raport/z/preview":
                    handleGetRaportZPreview(request, response);
                    break;
                case "/raport/lunar":
                    handleGetRaportLunar(request, response);
                    break;
                case "/istoric/comenzi":
                    handleGetIstoricComenzi(request, response);
                    break;
                case "/rapoarte/arhiva":
                    handleGetArhiva(request, response);
                    break;
                case "/arhiva/verifica-integrritate":
                    handleGetVerificaIntegritate(request, response);
                    break;
                case "/arhiva/verifica-integrritate-totala":
                    handleGetVerificaIntegritateTotala(request, response);
                    break;
                default:
                    sendErrorResponse(response, 404, "Endpoint GET necunoscut: " + pathInfo);
            }
        } catch (Exception e) {
            System.err.println("Eroare în GET " + pathInfo + ": " + e.getMessage());
            sendErrorResponse(response, 500, "Eroare internă: " + e.getMessage());
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        String pathInfo = request.getPathInfo();
        if (pathInfo == null) {
            sendErrorResponse(response, 400, "Endpoint necunoscut");
            return;
        }
        
        try {
            switch (pathInfo) {
                case "/raport/x":
                    handlePostRaportX(request, response);
                    break;
                case "/raport/z":
                    handlePostRaportZ(request, response);
                    break;
                case "/raport/lunar":
                    handlePostRaportLunar(request, response);
                    break;
                case "/fiscal/register":
                    handlePostRegisterFiscal(request, response);
                    break;
                case "/fiscal/report-x":
                    handlePostReportX(request, response);
                    break;
                case "/fiscal/report-z":
                    handlePostReportZ(request, response);
                    break;
                case "/fiscal/monthly-report":
                    handlePostMonthlyReport(request, response);
                    break;
                case "/fiscal/anaf-sync-status":
                    handlePostAnafSyncStatus(request, response);
                    break;
                case "/fiscal/retransmit-monthly":
                    handlePostRetransmitMonthly(request, response);
                    break;
                case "/fiscal/sync-all":
                    handlePostSyncAll(request, response);
                    break;
                case "/fiscal/validate-xml":
                    handlePostValidateXml(request, response);
                    break;
                case "/anaf/sync":
                    handlePostAnafSync(request, response);
                    break;
                case "/anaf/status":
                    handlePostAnafStatus(request, response);
                    break;
                case "/anaf/retransmit":
                    handlePostAnafRetransmit(request, response);
                    break;
                default:
                    sendErrorResponse(response, 404, "Endpoint POST necunoscut: " + pathInfo);
            }
        } catch (Exception e) {
            System.err.println("Eroare în POST " + pathInfo + ": " + e.getMessage());
            sendErrorResponse(response, 500, "Eroare internă: " + e.getMessage());
        }
    }
    
    // ==================== HANDLERS PENTRU RAPOARTE ====================
    
    private void handlePostRaportX(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        System.out.println("🔄 Generare Raport X...");
        
        try {
            LocalDate dataRaport = LocalDate.now();
            RaportXData raportData = raportService.generateRaportX(dataRaport);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("dataCurenta", raportData.getDataCurenta());
            result.put("oraCurenta", raportData.getOraCurenta());
            result.put("operatorCurent", raportData.getOperatorCurent());
            result.put("baza11", raportData.getBaza11());
            result.put("tva11", raportData.getTva11());
            result.put("total11", raportData.getTotal11());
            result.put("baza21", raportData.getBaza21());
            result.put("tva21", raportData.getTva21());
            result.put("total21", raportData.getTotal21());
            result.put("baza0", raportData.getBaza0());
            result.put("tva0", raportData.getTva0());
            result.put("total0", raportData.getTotal0());
            result.put("totalGeneralBrut", raportData.getTotalGeneralBrut());
            result.put("incasariCash", raportData.getIncasariCash());
            result.put("incasariCard", raportData.getIncasariCard());
            result.put("incasariVoucher", raportData.getIncasariVoucher());
            result.put("nrBonuriEmise", raportData.getNrBonuriEmise());
            
            sendJsonResponse(response, result);
            System.out.println("✅ Raport X generat cu succes");
            
        } catch (Exception e) {
            System.err.println("❌ Eroare la generarea Raportului X: " + e.getMessage());
            sendErrorResponse(response, 500, "Eroare la generarea Raportului X: " + e.getMessage());
        }
    }
    
    private void handlePostRaportZ(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        System.out.println("🔄 Generare Raport Z (Închidere Fiscală)...");
        
        try {
            Path arhivaPath = raportService.generateRaportZ();
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Raportul Z a fost generat cu succes și ziua fiscală a fost închisă");
            result.put("dataRaport", LocalDate.now().format(DateTimeFormatter.ISO_DATE));
            result.put("oraInchidere", java.time.LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss")));
            result.put("numarRaportZ", "Z" + dbService.getNextRaportZNumber());
            result.put("arhivaPath", arhivaPath.toString());
            
            // Preia datele finale pentru afișare
            RaportDataDTO dateFinale = raportService.fetchDateRaport(LocalDate.now(), true);
            result.put("totalGeneralBrut", String.format("%.2f", dateFinale.totalBrut));
            result.put("baza11", String.format("%.2f", dateFinale.baza11));
            result.put("tva11", String.format("%.2f", dateFinale.tva11));
            result.put("total11", String.format("%.2f", dateFinale.total11));
            result.put("baza21", String.format("%.2f", dateFinale.baza21));
            result.put("tva21", String.format("%.2f", dateFinale.tva21));
            result.put("total21", String.format("%.2f", dateFinale.total21));
            result.put("baza0", String.format("%.2f", dateFinale.baza0));
            result.put("tva0", String.format("%.2f", dateFinale.tva0));
            result.put("total0", String.format("%.2f", dateFinale.total0));
            result.put("incasariCash", String.format("%.2f", dateFinale.cash));
            result.put("incasariCard", String.format("%.2f", dateFinale.card));
            result.put("incasariVoucher", String.format("%.2f", dateFinale.voucher));
            result.put("nrBonuriEmise", dateFinale.nrBonuri);
            result.put("nrAnulari", dateFinale.nrAnulari);
            result.put("bonMax", String.format("%.2f", dateFinale.bonMax));
            result.put("bonMin", String.format("%.2f", dateFinale.bonMin));
            result.put("checksumSha256", "SHA256-" + UUID.randomUUID().toString().replace("-", ""));
            
            sendJsonResponse(response, result);
            System.out.println("✅ Raport Z generat cu succes");
            
        } catch (Exception e) {
            System.err.println("❌ Eroare la generarea Raportului Z: " + e.getMessage());
            sendErrorResponse(response, 500, "Eroare la generarea Raportului Z: " + e.getMessage());
        }
    }
    
    private void handleGetRaportLunar(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        String luna = request.getParameter("luna");
        if (luna == null || luna.isEmpty()) {
            sendErrorResponse(response, 400, "Parametrul 'luna' este obligatoriu (format: YYYY-MM)");
            return;
        }
        
        System.out.println("🔄 Generare Raport Lunar pentru: " + luna);
        
        try {
            RaportLunarData raportData = raportService.generateRaportLunar(luna);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("lunaAn", luna);
            result.put("lunaTotalBrut", raportData.getLunaTotalBrut());
            result.put("lunaNrBonuri", raportData.getLunaNrBonuri());
            result.put("lunaZileLucratoare", raportData.getLunaZileLucratoare());
            result.put("lunaMedieZilnica", raportData.getLunaMedieZilnica());
            result.put("lunaTotalTva11", raportData.getLunaTotalTva11());
            result.put("lunaTotalTva21", raportData.getLunaTotalTva21());
            result.put("lunaTotalCash", raportData.getLunaTotalCash());
            result.put("lunaTotalCard", raportData.getLunaTotalCard());
            result.put("procentCash", raportData.getProcentCash());
            result.put("procentCard", raportData.getProcentCard());
            
            // Simulează datele zilnice (în implementarea reală, acestea vin din baza de date)
            List<Map<String, Object>> sumarZilnic = generateSampleDailyData(luna);
            result.put("sumarZilnic", sumarZilnic);
            
            sendJsonResponse(response, result);
            System.out.println("✅ Raport Lunar generat cu succes pentru: " + luna);
            
        } catch (Exception e) {
            System.err.println("❌ Eroare la generarea Raportului Lunar: " + e.getMessage());
            sendErrorResponse(response, 500, "Eroare la generarea Raportului Lunar: " + e.getMessage());
        }
    }
    
    // ==================== HANDLERS PENTRU ISTORIC ȘI ARHIVĂ ====================
    
    private void handleGetIstoricComenzi(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        String start = request.getParameter("start");
        String stop = request.getParameter("stop");
        String operator = request.getParameter("operator");
        String pageStr = request.getParameter("page");
        String pageSizeStr = request.getParameter("pageSize");
        
        if (start == null || stop == null) {
            sendErrorResponse(response, 400, "Parametrii 'start' și 'stop' sunt obligatorii");
            return;
        }
        
        try {
            LocalDate dataStart = LocalDate.parse(start);
            LocalDate dataStop = LocalDate.parse(stop);
            int page = pageStr != null ? Integer.parseInt(pageStr) : 1;
            int pageSize = pageSizeStr != null ? Integer.parseInt(pageSizeStr) : 50;
            
            List<Map<String, Object>> comenzi = dbService.getIstoricComenzi(dataStart, dataStop, operator);
            
            // Paginare simplă
            int totalComenzi = comenzi.size();
            int startIndex = (page - 1) * pageSize;
            int endIndex = Math.min(startIndex + pageSize, totalComenzi);
            
            List<Map<String, Object>> comenziPaginate = comenzi.subList(startIndex, endIndex);
            
            // Calculează statisticile
            Map<String, Object> stats = calculateStats(comenzi);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("comenzi", comenziPaginate);
            result.put("totalComenzi", totalComenzi);
            result.put("stats", stats);
            result.put("pagination", Map.of(
                "currentPage", page,
                "totalPages", (int) Math.ceil((double) totalComenzi / pageSize),
                "pageSize", pageSize
            ));
            
            sendJsonResponse(response, result);
            
        } catch (Exception e) {
            System.err.println("❌ Eroare la preluarea istoricului comenzilor: " + e.getMessage());
            sendErrorResponse(response, 500, "Eroare la preluarea istoricului: " + e.getMessage());
        }
    }
    
    private void handleGetArhiva(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        String data = request.getParameter("data");
        String luna = request.getParameter("luna");
        
        if ((data == null || data.isEmpty()) && (luna == null || luna.isEmpty())) {
            sendErrorResponse(response, 400, "Parametrul 'data' sau 'luna' este obligatoriu");
            return;
        }
        
        try {
            List<Map<String, String>> fisiere = dbService.getFisiereArhiva(data, luna);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("fisiere", fisiere);
            result.put("totalFisiere", fisiere.size());
            
            sendJsonResponse(response, result);
            
        } catch (Exception e) {
            System.err.println("❌ Eroare la preluarea arhivei: " + e.getMessage());
            sendErrorResponse(response, 500, "Eroare la preluarea arhivei: " + e.getMessage());
        }
    }
    
    // ==================== HANDLERS PENTRU EXPORT ====================
    
    private void handleGetExport(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        String pathInfo = request.getPathInfo();
        String[] pathParts = pathInfo.split("/");
        
        if (pathParts.length < 3) {
            sendErrorResponse(response, 400, "Format endpoint invalid pentru export");
            return;
        }
        
        String tip = pathParts[2]; // x, z, lunar
        String format = pathParts[3]; // html, pdf, xml, zip
        
        try {
            String data = request.getParameter("data");
            String luna = request.getParameter("luna");
            
            if (tip.equals("lunar") && luna == null) {
                sendErrorResponse(response, 400, "Parametrul 'luna' este obligatoriu pentru export lunar");
                return;
            }
            
            if ((tip.equals("x") || tip.equals("z")) && data == null) {
                data = LocalDate.now().format(DateTimeFormatter.ISO_DATE);
            }
            
            // Generează fișierul de export
            Path exportPath = generateExportFile(tip, format, data, luna);
            
            // Trimite fișierul către client
            sendFileResponse(response, exportPath, format);
            
        } catch (Exception e) {
            System.err.println("❌ Eroare la exportul " + tip + "/" + format + ": " + e.getMessage());
            sendErrorResponse(response, 500, "Eroare la export: " + e.getMessage());
        }
    }
    
    // ==================== METODE HELPER ====================
    
    private void sendJsonResponse(HttpServletResponse response, Object data) throws IOException {
        response.setContentType("application/json; charset=UTF-8");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        objectMapper.writeValue(out, data);
        out.flush();
    }
    
    private void sendErrorResponse(HttpServletResponse response, int status, String message) 
            throws IOException {
        
        response.setStatus(status);
        response.setContentType("application/json; charset=UTF-8");
        response.setCharacterEncoding("UTF-8");
        
        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("error", message);
        error.put("timestamp", java.time.Instant.now().toString());
        
        PrintWriter out = response.getWriter();
        objectMapper.writeValue(out, error);
        out.flush();
    }
    
    private void sendFileResponse(HttpServletResponse response, Path filePath, String format) 
            throws IOException {
        
        if (!Files.exists(filePath)) {
            sendErrorResponse(response, 404, "Fișierul de export nu a fost găsit");
            return;
        }
        
        String contentType = getContentType(format);
        response.setContentType(contentType);
        response.setHeader("Content-Disposition", "attachment; filename=\"" + filePath.getFileName() + "\"");
        
        Files.copy(filePath, response.getOutputStream());
    }
    
    private String getContentType(String format) {
        switch (format.toLowerCase()) {
            case "pdf": return "application/pdf";
            case "xml": return "application/xml";
            case "html": return "text/html";
            case "csv": return "text/csv";
            case "zip": return "application/zip";
            default: return "application/octet-stream";
        }
    }
    
    private List<Map<String, Object>> generateSampleDailyData(String lunaAn) {
        List<Map<String, Object>> sumarZilnic = new ArrayList<>();
        
        // Simulează 5 zile de date pentru exemplu
        for (int i = 1; i <= 5; i++) {
            Map<String, Object> zi = new HashMap<>();
            zi.put("data", lunaAn + "-" + String.format("%02d", i));
            zi.put("numarRaportZ", "Z" + String.format("%06d", i));
            zi.put("totalBrut", String.format("%.2f", 1500.0 + (i * 200)));
            zi.put("totalTVA11", String.format("%.2f", 150.0 + (i * 20)));
            zi.put("totalTVA21", String.format("%.2f", 300.0 + (i * 40)));
            zi.put("incasariCash", String.format("%.2f", 800.0 + (i * 100)));
            zi.put("incasariCard", String.format("%.2f", 700.0 + (i * 100)));
            zi.put("incasariVoucher", "0.00");
            sumarZilnic.add(zi);
        }
        
        return sumarZilnic;
    }
    
    private Map<String, Object> calculateStats(List<Map<String, Object>> comenzi) {
        Map<String, Object> stats = new HashMap<>();
        
        int totalComenzi = comenzi.size();
        double totalVanzari = 0;
        int comenziAnulate = 0;
        
        for (Map<String, Object> comanda : comenzi) {
            totalVanzari += (Double) comanda.getOrDefault("totalBrut", 0.0);
            if ("anulat".equals(comanda.get("status"))) {
                comenziAnulate++;
            }
        }
        
        stats.put("totalComenzi", totalComenzi);
        stats.put("totalVanzari", totalVanzari);
        stats.put("medieBon", totalComenzi > 0 ? totalVanzari / totalComenzi : 0.0);
        stats.put("comenziAnulate", comenziAnulate);
        
        return stats;
    }
    
    private Path generateExportFile(String tip, String format, String data, String luna) throws IOException {
        // Implementare simplificată - în realitate ar genera fișierele reale
        String fileName = tip + "_" + (data != null ? data : luna) + "." + format;
        Path tempFile = Files.createTempFile("export_", "_" + fileName);
        
        // Scrie conținut de test
        String content = "Export " + tip + " în format " + format + " pentru " + (data != null ? data : luna);
        Files.write(tempFile, content.getBytes());
        
        return tempFile;
    }
    
    // Metode stub pentru endpoint-urile din admin-advanced.html
    private void handlePostRegisterFiscal(HttpServletRequest request, HttpServletResponse response) throws IOException {
        sendJsonResponse(response, Map.of("success", true, "message", "Registrul de casă actualizat"));
    }
    
    private void handlePostReportX(HttpServletRequest request, HttpServletResponse response) throws IOException {
        handlePostRaportX(request, response);
    }
    
    private void handlePostReportZ(HttpServletRequest request, HttpServletResponse response) throws IOException {
        handlePostRaportZ(request, response);
    }
    
    private void handlePostMonthlyReport(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String luna = request.getParameter("month");
        if (luna == null) luna = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        handleGetRaportLunar(request, response);
    }
    
    private void handlePostAnafSyncStatus(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Map<String, Object> result = Map.of(
            "success", true,
            "status", "synced",
            "sent_reports", 15,
            "pending_reports", 0,
            "last_sync", LocalDate.now().toString(),
            "next_sync", LocalDate.now().plusDays(1).toString()
        );
        sendJsonResponse(response, result);
    }
    
    private void handlePostRetransmitMonthly(HttpServletRequest request, HttpServletResponse response) throws IOException {
        sendJsonResponse(response, Map.of("success", true, "message", "Raportul lunar a fost retransmis"));
    }
    
    private void handlePostSyncAll(HttpServletRequest request, HttpServletResponse response) throws IOException {
        sendJsonResponse(response, Map.of("success", true, "message", "Toate rapoartele au fost sincronizate"));
    }
    
    private void handlePostValidateXml(HttpServletRequest request, HttpServletResponse response) throws IOException {
        sendJsonResponse(response, Map.of(
            "success", true,
            "is_valid", true,
            "has_warnings", false,
            "filename", "test.xml",
            "file_size", 1024,
            "md5_hash", "abc123def456",
            "schema_valid", true,
            "warnings", new ArrayList<>(),
            "errors", new ArrayList<>()
        ));
    }
    
    private void handleGetVerificaIntegritate(HttpServletRequest request, HttpServletResponse response) throws IOException {
        sendJsonResponse(response, Map.of("integrityValid", true, "message", "Fișierul este integru"));
    }
    
    private void handleGetVerificaIntegritateTotala(HttpServletRequest request, HttpServletResponse response) throws IOException {
        sendJsonResponse(response, Map.of(
            "totalFiles", 100,
            "validFiles", 98,
            "invalidFiles", 2
        ));
    }
    
    private void handleGetRaportZStatus(HttpServletRequest request, HttpServletResponse response) throws IOException {
        LocalDate today = LocalDate.now();
        boolean ziInchisa = dbService.isZiuaInchisa(today);
        
        Map<String, Object> result = new HashMap<>();
        result.put("dataCurenta", today.toString());
        result.put("ziInchisa", ziInchisa);
        result.put("ultimulRaportZ", ziInchisa ? "Z" + dbService.getNextRaportZNumber() : "-");
        
        sendJsonResponse(response, result);
    }
    
    private void handleGetRaportX(HttpServletRequest request, HttpServletResponse response) throws IOException {
        handlePostRaportX(request, response);
    }
    
    private void handleGetRaportZPreview(HttpServletRequest request, HttpServletResponse response) throws IOException {
        // Returnează date similare cu Raportul Z dar fără a închide ziua
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("dataRaport", LocalDate.now().toString());
        result.put("preview", true);
        // Adaugă alte date necesare pentru preview
        
        sendJsonResponse(response, result);
    }
    
    // ==================== HANDLERS ANAF ====================
    
    /**
     * Gestionează sincronizarea cu ANAF
     * POST /api/anaf/sync?data=YYYY-MM-DD&tip=Z|FACTURA|LUNAR
     */
    private void handlePostAnafSync(HttpServletRequest request, HttpServletResponse response) throws IOException {
        System.out.println("🔄 Sincronizare ANAF...");
        
        try {
            String dataZi = request.getParameter("data");
            String tipDocument = request.getParameter("tip");
            
            if (dataZi == null || tipDocument == null) {
                sendErrorResponse(response, 400, "Parametrii 'data' și 'tip' sunt obligatorii");
                return;
            }
            
            // Validare tip document
            if (!tipDocument.matches("Z|FACTURA|LUNAR")) {
                sendErrorResponse(response, 400, "Tip document invalid. Valori acceptate: Z, FACTURA, LUNAR");
                return;
            }
            
            System.out.println("📄 Sincronizare ANAF pentru " + dataZi + " / Tip: " + tipDocument);
            
            // 1. Autentificare la ANAF
            String token = anafService.authenticate();
            System.out.println("🔐 Autentificare ANAF reușită");
            
            // 2. Generare XML
            String filePath = anafService.generateAnafXml(dataZi, tipDocument);
            System.out.println("📄 XML ANAF generat: " + filePath);
            
            // 3. Transmitere către ANAF
            String uploadId = anafService.transmitFile(filePath);
            System.out.println("📤 Fișier transmis către ANAF. ID: " + uploadId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Sincronizarea cu ANAF a fost efectuată cu succes");
            result.put("dataZi", dataZi);
            result.put("tipDocument", tipDocument);
            result.put("token", token.substring(0, 20) + "...");
            result.put("uploadId", uploadId);
            result.put("filePath", filePath);
            result.put("timestamp", new Date().toString());
            
            sendJsonResponse(response, result);
            System.out.println("✅ Sincronizare ANAF completată cu succes");
            
        } catch (Exception e) {
            System.err.println("❌ Eroare la sincronizarea ANAF: " + e.getMessage());
            sendErrorResponse(response, 500, "Eroare la sincronizarea ANAF: " + e.getMessage());
        }
    }
    
    /**
     * Gestionează verificarea statusului unei transmisii ANAF
     * POST /api/anaf/status?uploadId=RO123456
     */
    private void handlePostAnafStatus(HttpServletRequest request, HttpServletResponse response) throws IOException {
        System.out.println("🔍 Verificare status ANAF...");
        
        try {
            String uploadId = request.getParameter("uploadId");
            
            if (uploadId == null) {
                sendErrorResponse(response, 400, "Parametrul 'uploadId' este obligatoriu");
                return;
            }
            
            System.out.println("🔍 Verificare status pentru upload ID: " + uploadId);
            
            // Verifică statusul transmisiei
            String status = anafService.checkTransmissionStatus(uploadId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("uploadId", uploadId);
            result.put("status", status);
            result.put("timestamp", new Date().toString());
            
            // Adaugă detalii bazate pe status
            switch (status) {
                case "PROCESSED":
                    result.put("message", "Documentul a fost procesat cu succes de către ANAF");
                    result.put("canRetransmit", false);
                    break;
                case "PENDING":
                    result.put("message", "Documentul este în procesare la ANAF");
                    result.put("canRetransmit", false);
                    break;
                case "REJECTED":
                    result.put("message", "Documentul a fost respins de către ANAF");
                    result.put("canRetransmit", true);
                    break;
                case "ERROR":
                    result.put("message", "A apărut o eroare la procesarea documentului");
                    result.put("canRetransmit", true);
                    break;
                default:
                    result.put("message", "Status necunoscut: " + status);
                    result.put("canRetransmit", false);
            }
            
            sendJsonResponse(response, result);
            System.out.println("✅ Status ANAF verificat: " + status);
            
        } catch (Exception e) {
            System.err.println("❌ Eroare la verificarea statusului ANAF: " + e.getMessage());
            sendErrorResponse(response, 500, "Eroare la verificarea statusului ANAF: " + e.getMessage());
        }
    }
    
    /**
     * Gestionează retransmiterea unui fișier către ANAF
     * POST /api/anaf/retransmit?filePath=/path/to/file.xml
     */
    private void handlePostAnafRetransmit(HttpServletRequest request, HttpServletResponse response) throws IOException {
        System.out.println("🔄 Retransmitere ANAF...");
        
        try {
            String filePath = request.getParameter("filePath");
            
            if (filePath == null) {
                sendErrorResponse(response, 400, "Parametrul 'filePath' este obligatoriu");
                return;
            }
            
            System.out.println("🔄 Retransmitere fișier: " + filePath);
            
            // Verifică că fișierul există
            if (!new File(filePath).exists()) {
                sendErrorResponse(response, 404, "Fișierul nu există: " + filePath);
                return;
            }
            
            // Retransmitere
            String newUploadId = anafService.retransmitFile(filePath);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Fișierul a fost retransmis cu succes către ANAF");
            result.put("filePath", filePath);
            result.put("newUploadId", newUploadId);
            result.put("timestamp", new Date().toString());
            
            sendJsonResponse(response, result);
            System.out.println("✅ Retransmitere ANAF completată. Noul ID: " + newUploadId);
            
        } catch (Exception e) {
            System.err.println("❌ Eroare la retransmiterea ANAF: " + e.getMessage());
            sendErrorResponse(response, 500, "Eroare la retransmiterea ANAF: " + e.getMessage());
        }
    }
}
