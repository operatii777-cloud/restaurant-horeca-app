package controllers;

import fiscal.MonitoringService;
import fiscal.DatabaseService;
import com.fasterxml.jackson.databind.ObjectMapper;

import javax.servlet.*;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.*;
import java.util.*;

/**
 * Controller pentru gestionarea monitorizării și alertelor sistemului fiscal
 */
@WebServlet("/api/monitoring/*")
public class MonitoringController extends HttpServlet {

    private MonitoringService monitoringService;
    private DatabaseService databaseService;
    private ObjectMapper objectMapper;

    @Override
    public void init() throws ServletException {
        super.init();
        
        try {
            // Inițializează serviciile
            this.databaseService = new DatabaseService(
                "jdbc:mysql://localhost:3306/restaurant_fiscal",
                "root", "password"
            );
            
            this.monitoringService = new MonitoringService(
                databaseService,
                "jdbc:mysql://localhost:3306/restaurant_fiscal",
                "root", "password"
            );
            
            this.objectMapper = new ObjectMapper();
            
            // Pornește monitorizarea automată
            monitoringService.startMonitoring();
            
            System.out.println("✅ MonitoringController inițializat cu succes");
            
        } catch (Exception e) {
            System.err.println("❌ Eroare la inițializarea MonitoringController: " + e.getMessage());
            throw new ServletException("Nu s-a putut inițializa MonitoringController", e);
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        String pathInfo = request.getPathInfo();
        
        try {
            switch (pathInfo) {
                case "/status":
                    handleGetStatus(response);
                    break;
                    
                case "/stats":
                    handleGetStats(response);
                    break;
                    
                case "/alerts":
                    handleGetAlerts(request, response);
                    break;
                    
                case "/logs":
                    handleGetLogs(request, response);
                    break;
                    
                case "/health":
                    handleHealthCheck(response);
                    break;
                    
                default:
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    response.getWriter().write("{\"error\":\"Endpoint not found\"}");
            }
            
        } catch (Exception e) {
            System.err.println("❌ Eroare în MonitoringController: " + e.getMessage());
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\":\"Internal server error: " + e.getMessage() + "\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        String pathInfo = request.getPathInfo();
        
        try {
            switch (pathInfo) {
                case "/start":
                    handleStartMonitoring(response);
                    break;
                    
                case "/stop":
                    handleStopMonitoring(response);
                    break;
                    
                case "/test-alert":
                    handleTestAlert(response);
                    break;
                    
                case "/config":
                    handleUpdateConfig(request, response);
                    break;
                    
                default:
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    response.getWriter().write("{\"error\":\"Endpoint not found\"}");
            }
            
        } catch (Exception e) {
            System.err.println("❌ Eroare în MonitoringController POST: " + e.getMessage());
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\":\"Internal server error: " + e.getMessage() + "\"}");
        }
    }

    /**
     * Gestionează cererea pentru statusul monitorizării
     */
    private void handleGetStatus(HttpServletResponse response) throws IOException {
        Map<String, Object> status = new HashMap<>();
        
        try {
            Map<String, Object> monitoringStats = monitoringService.getMonitoringStats();
            status.put("monitoring_active", monitoringStats.get("monitoring_active"));
            status.put("last_check_time", monitoringStats.get("last_check_time"));
            status.put("status", "OK");
            
            // Adaugă informații despre sistem
            status.put("system_time", new Date().toString());
            status.put("uptime", System.currentTimeMillis());
            
            response.setStatus(HttpServletResponse.SC_OK);
            
        } catch (Exception e) {
            status.put("status", "ERROR");
            status.put("error", e.getMessage());
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
        
        response.getWriter().write(objectMapper.writeValueAsString(status));
    }

    /**
     * Gestionează cererea pentru statistici
     */
    private void handleGetStats(HttpServletResponse response) throws IOException {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            // Statistici monitorizare
            Map<String, Object> monitoringStats = monitoringService.getMonitoringStats();
            stats.put("monitoring", monitoringStats);
            
            // Statistici sistem
            stats.put("system", getSystemStats());
            
            // Statistici baza de date
            stats.put("database", getDatabaseStats());
            
            response.setStatus(HttpServletResponse.SC_OK);
            
        } catch (Exception e) {
            stats.put("error", e.getMessage());
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
        
        response.getWriter().write(objectMapper.writeValueAsString(stats));
    }

    /**
     * Gestionează cererea pentru alerte
     */
    private void handleGetAlerts(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            String level = request.getParameter("level");
            String limitStr = request.getParameter("limit");
            int limit = limitStr != null ? Integer.parseInt(limitStr) : 50;
            
            List<Map<String, Object>> alerts = getAlertsFromDatabase(level, limit);
            
            result.put("alerts", alerts);
            result.put("count", alerts.size());
            result.put("status", "OK");
            
            response.setStatus(HttpServletResponse.SC_OK);
            
        } catch (Exception e) {
            result.put("error", e.getMessage());
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
        
        response.getWriter().write(objectMapper.writeValueAsString(result));
    }

    /**
     * Gestionează cererea pentru loguri
     */
    private void handleGetLogs(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            String level = request.getParameter("level");
            String category = request.getParameter("category");
            String limitStr = request.getParameter("limit");
            int limit = limitStr != null ? Integer.parseInt(limitStr) : 100;
            
            List<Map<String, Object>> logs = getLogsFromDatabase(level, category, limit);
            
            result.put("logs", logs);
            result.put("count", logs.size());
            result.put("status", "OK");
            
            response.setStatus(HttpServletResponse.SC_OK);
            
        } catch (Exception e) {
            result.put("error", e.getMessage());
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
        
        response.getWriter().write(objectMapper.writeValueAsString(result));
    }

    /**
     * Gestionează health check-ul
     */
    private void handleHealthCheck(HttpServletResponse response) throws IOException {
        Map<String, Object> health = new HashMap<>();
        
        try {
            // Verifică conexiunea la baza de date
            boolean dbHealthy = databaseService.testConnection();
            
            // Verifică monitorizarea
            Map<String, Object> monitoringStats = monitoringService.getMonitoringStats();
            boolean monitoringHealthy = (Boolean) monitoringStats.get("monitoring_active");
            
            // Verifică spațiul pe disk
            boolean diskHealthy = checkDiskSpace();
            
            health.put("database", dbHealthy ? "OK" : "ERROR");
            health.put("monitoring", monitoringHealthy ? "OK" : "ERROR");
            health.put("disk_space", diskHealthy ? "OK" : "WARNING");
            health.put("overall_status", (dbHealthy && monitoringHealthy) ? "HEALTHY" : "UNHEALTHY");
            health.put("timestamp", new Date().toString());
            
            response.setStatus(dbHealthy && monitoringHealthy ? 
                HttpServletResponse.SC_OK : HttpServletResponse.SC_SERVICE_UNAVAILABLE);
            
        } catch (Exception e) {
            health.put("overall_status", "ERROR");
            health.put("error", e.getMessage());
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
        
        response.getWriter().write(objectMapper.writeValueAsString(health));
    }

    /**
     * Gestionează pornirea monitorizării
     */
    private void handleStartMonitoring(HttpServletResponse response) throws IOException {
        Map<String, Object> result = new HashMap<>();
        
        try {
            monitoringService.startMonitoring();
            result.put("status", "OK");
            result.put("message", "Monitorizarea a fost pornită cu succes");
            
            response.setStatus(HttpServletResponse.SC_OK);
            
        } catch (Exception e) {
            result.put("status", "ERROR");
            result.put("error", e.getMessage());
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
        
        response.getWriter().write(objectMapper.writeValueAsString(result));
    }

    /**
     * Gestionează oprirea monitorizării
     */
    private void handleStopMonitoring(HttpServletResponse response) throws IOException {
        Map<String, Object> result = new HashMap<>();
        
        try {
            monitoringService.stopMonitoring();
            result.put("status", "OK");
            result.put("message", "Monitorizarea a fost oprită cu succes");
            
            response.setStatus(HttpServletResponse.SC_OK);
            
        } catch (Exception e) {
            result.put("status", "ERROR");
            result.put("error", e.getMessage());
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
        
        response.getWriter().write(objectMapper.writeValueAsString(result));
    }

    /**
     * Gestionează testarea alertei
     */
    private void handleTestAlert(HttpServletResponse response) throws IOException {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Trimite o alertă de test
            monitoringService.sendAlert("TEST_ALERT", "Test Alert", "Aceasta este o alertă de test");
            
            result.put("status", "OK");
            result.put("message", "Alertă de test trimisă cu succes");
            
            response.setStatus(HttpServletResponse.SC_OK);
            
        } catch (Exception e) {
            result.put("status", "ERROR");
            result.put("error", e.getMessage());
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
        
        response.getWriter().write(objectMapper.writeValueAsString(result));
    }

    /**
     * Gestionează actualizarea configurației
     */
    private void handleUpdateConfig(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Citește configurația din request body
            String requestBody = readRequestBody(request);
            Map<String, Object> config = objectMapper.readValue(requestBody, Map.class);
            
            // Actualizează configurația (implementare simplă)
            result.put("status", "OK");
            result.put("message", "Configurația a fost actualizată");
            result.put("config", config);
            
            response.setStatus(HttpServletResponse.SC_OK);
            
        } catch (Exception e) {
            result.put("status", "ERROR");
            result.put("error", e.getMessage());
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
        
        response.getWriter().write(objectMapper.writeValueAsString(result));
    }

    /**
     * Obține statistici despre sistem
     */
    private Map<String, Object> getSystemStats() {
        Map<String, Object> systemStats = new HashMap<>();
        
        Runtime runtime = Runtime.getRuntime();
        systemStats.put("memory_max", runtime.maxMemory());
        systemStats.put("memory_total", runtime.totalMemory());
        systemStats.put("memory_free", runtime.freeMemory());
        systemStats.put("memory_used", runtime.totalMemory() - runtime.freeMemory());
        systemStats.put("processors", runtime.availableProcessors());
        systemStats.put("uptime", System.currentTimeMillis());
        
        return systemStats;
    }

    /**
     * Obține statistici despre baza de date
     */
    private Map<String, Object> getDatabaseStats() throws Exception {
        Map<String, Object> dbStats = new HashMap<>();
        
        try {
            // Implementare simplă pentru statistici DB
            dbStats.put("connection_healthy", databaseService.testConnection());
            dbStats.put("last_check", new Date().toString());
            
        } catch (Exception e) {
            dbStats.put("connection_healthy", false);
            dbStats.put("error", e.getMessage());
        }
        
        return dbStats;
    }

    /**
     * Obține alertele din baza de date
     */
    private List<Map<String, Object>> getAlertsFromDatabase(String level, int limit) throws Exception {
        List<Map<String, Object>> alerts = new ArrayList<>();
        
        try {
            // Implementare simplă pentru preluarea alertelor
            // În implementarea reală, ar fi o interogare SQL
            
        } catch (Exception e) {
            System.err.println("Eroare la preluarea alertelor: " + e.getMessage());
        }
        
        return alerts;
    }

    /**
     * Obține logurile din baza de date
     */
    private List<Map<String, Object>> getLogsFromDatabase(String level, String category, int limit) throws Exception {
        List<Map<String, Object>> logs = new ArrayList<>();
        
        try {
            // Implementare simplă pentru preluarea logurilor
            // În implementarea reală, ar fi o interogare SQL
            
        } catch (Exception e) {
            System.err.println("Eroare la preluarea logurilor: " + e.getMessage());
        }
        
        return logs;
    }

    /**
     * Verifică spațiul pe disk
     */
    private boolean checkDiskSpace() {
        try {
            File archiveDir = new File("arhiva_rapoarte");
            if (archiveDir.exists()) {
                long freeSpace = archiveDir.getFreeSpace();
                long totalSpace = archiveDir.getTotalSpace();
                double freeSpacePercent = (double) freeSpace / totalSpace * 100;
                return freeSpacePercent > 10.0; // Cel puțin 10% spațiu liber
            }
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Citește request body-ul
     */
    private String readRequestBody(HttpServletRequest request) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = request.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        }
        return sb.toString();
    }

    @Override
    public void destroy() {
        super.destroy();
        if (monitoringService != null) {
            monitoringService.stopMonitoring();
        }
        System.out.println("✅ MonitoringController distrus");
    }
}
