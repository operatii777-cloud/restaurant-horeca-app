package fiscal;

import java.io.*;
import java.nio.file.*;
import java.sql.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.*;

/**
 * Serviciu de monitorizare și alerte pentru sistemul fiscal
 * Monitorizează operațiuni critice și trimite alerte în caz de probleme
 */
public class MonitoringService {

    private final DatabaseService dbService;
    private final String dbUrl;
    private final String dbUser;
    private final String dbPassword;
    private final ScheduledExecutorService scheduler;
    private final Map<String, Object> alertConfig;
    
    // Configurare monitorizare
    private static final int CHECK_INTERVAL_MINUTES = 5;
    private static final int ALERT_COOLDOWN_MINUTES = 30;
    
    // Stocare ultimele alerte pentru evitarea spam-ului
    private final Map<String, LocalDateTime> lastAlerts = new ConcurrentHashMap<>();
    
    public MonitoringService(DatabaseService dbService, String dbUrl, String dbUser, String dbPassword) {
        this.dbService = dbService;
        this.dbUrl = dbUrl;
        this.dbUser = dbUser;
        this.dbPassword = dbPassword;
        this.scheduler = Executors.newScheduledThreadPool(2);
        
        // Configurare alerte
        this.alertConfig = loadAlertConfiguration();
        
        System.out.println("✅ MonitoringService inițializat cu succes");
    }
    
    /**
     * Pornește monitorizarea automată
     */
    public void startMonitoring() {
        System.out.println("🔍 Pornește monitorizarea automată...");
        
        // Monitorizare operațiuni critice (la fiecare 5 minute)
        scheduler.scheduleAtFixedRate(
            this::checkCriticalOperations,
            0,
            CHECK_INTERVAL_MINUTES,
            TimeUnit.MINUTES
        );
        
        // Monitorizare performanță (la fiecare 15 minute)
        scheduler.scheduleAtFixedRate(
            this::checkSystemPerformance,
            0,
            15,
            TimeUnit.MINUTES
        );
        
        // Monitorizare spațiu disk (la fiecare oră)
        scheduler.scheduleAtFixedRate(
            this::checkDiskSpace,
            0,
            60,
            TimeUnit.MINUTES
        );
        
        // Monitorizare backup (la fiecare 6 ore)
        scheduler.scheduleAtFixedRate(
            this::checkBackupStatus,
            0,
            360,
            TimeUnit.MINUTES
        );
        
        System.out.println("✅ Monitorizarea automată a fost pornită");
    }
    
    /**
     * Oprește monitorizarea
     */
    public void stopMonitoring() {
        System.out.println("🔴 Oprește monitorizarea...");
        scheduler.shutdown();
        try {
            if (!scheduler.awaitTermination(10, TimeUnit.SECONDS)) {
                scheduler.shutdownNow();
            }
        } catch (InterruptedException e) {
            scheduler.shutdownNow();
        }
        System.out.println("✅ Monitorizarea a fost oprită");
    }
    
    /**
     * Verifică operațiunile critice fiscale
     */
    private void checkCriticalOperations() {
        try {
            System.out.println("🔍 Verifică operațiuni critice fiscale...");
            
            // 1. Verifică dacă există erori în loguri
            checkErrorLogs();
            
            // 2. Verifică starea zilei fiscale
            checkFiscalDayStatus();
            
            // 3. Verifică operațiuni ANAF
            checkAnafOperations();
            
            // 4. Verifică integritatea datelor
            checkDataIntegrity();
            
        } catch (Exception e) {
            System.err.println("❌ Eroare la verificarea operațiunilor critice: " + e.getMessage());
            sendAlert("SYSTEM_ERROR", "Eroare la monitorizarea operațiunilor critice", e.getMessage());
        }
    }
    
    /**
     * Verifică performanța sistemului
     */
    private void checkSystemPerformance() {
        try {
            System.out.println("📊 Verifică performanța sistemului...");
            
            // 1. Verifică timpul de răspuns al bazei de date
            checkDatabasePerformance();
            
            // 2. Verifică utilizarea memoriei
            checkMemoryUsage();
            
            // 3. Verifică conexiunile active
            checkActiveConnections();
            
        } catch (Exception e) {
            System.err.println("❌ Eroare la verificarea performanței: " + e.getMessage());
        }
    }
    
    /**
     * Verifică spațiul pe disk
     */
    private void checkDiskSpace() {
        try {
            System.out.println("💾 Verifică spațiul pe disk...");
            
            // Verifică spațiul pentru directorul arhivei
            Path archivePath = Paths.get("arhiva_rapoarte");
            if (Files.exists(archivePath)) {
                File archiveDir = archivePath.toFile();
                long totalSpace = archiveDir.getTotalSpace();
                long freeSpace = archiveDir.getFreeSpace();
                double freeSpacePercent = (double) freeSpace / totalSpace * 100;
                
                if (freeSpacePercent < 10.0) {
                    sendAlert("DISK_SPACE", "Spațiu disk critic", 
                        String.format("Spațiu liber: %.1f%% (%d MB)", freeSpacePercent, freeSpace / 1024 / 1024));
                } else if (freeSpacePercent < 20.0) {
                    sendAlert("DISK_SPACE_WARNING", "Spațiu disk scăzut", 
                        String.format("Spațiu liber: %.1f%% (%d MB)", freeSpacePercent, freeSpace / 1024 / 1024));
                }
            }
            
            // Verifică spațiul pentru directorul de backup
            Path backupPath = Paths.get("C:\\backup_fiscal");
            if (Files.exists(backupPath)) {
                File backupDir = backupPath.toFile();
                long totalSpace = backupDir.getTotalSpace();
                long freeSpace = backupDir.getFreeSpace();
                double freeSpacePercent = (double) freeSpace / totalSpace * 100;
                
                if (freeSpacePercent < 15.0) {
                    sendAlert("BACKUP_DISK_SPACE", "Spațiu disk backup critic", 
                        String.format("Spațiu liber backup: %.1f%% (%d MB)", freeSpacePercent, freeSpace / 1024 / 1024));
                }
            }
            
        } catch (Exception e) {
            System.err.println("❌ Eroare la verificarea spațiului disk: " + e.getMessage());
        }
    }
    
    /**
     * Verifică statusul backup-urilor
     */
    private void checkBackupStatus() {
        try {
            System.out.println("🛡️ Verifică statusul backup-urilor...");
            
            // Verifică dacă backup-ul zilnic a fost executat
            Path dailyBackupDir = Paths.get("C:\\backup_fiscal\\daily");
            if (Files.exists(dailyBackupDir)) {
                Optional<Path> latestBackup = Files.list(dailyBackupDir)
                    .filter(Files::isRegularFile)
                    .filter(path -> path.toString().endsWith(".zip"))
                    .max(Comparator.comparing(path -> {
                        try {
                            return Files.getLastModifiedTime(path).toInstant();
                        } catch (IOException e) {
                            return java.time.Instant.MIN;
                        }
                    }));
                
                if (latestBackup.isPresent()) {
                    LocalDateTime lastBackupTime = LocalDateTime.ofInstant(
                        Files.getLastModifiedTime(latestBackup.get()).toInstant(),
                        java.time.ZoneId.systemDefault()
                    );
                    
                    LocalDateTime now = LocalDateTime.now();
                    long hoursSinceLastBackup = java.time.Duration.between(lastBackupTime, now).toHours();
                    
                    if (hoursSinceLastBackup > 25) {
                        sendAlert("BACKUP_MISSING", "Backup zilnic lipsă", 
                            String.format("Ultimul backup: %s (acum %d ore)", 
                                lastBackupTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")), 
                                hoursSinceLastBackup));
                    }
                } else {
                    sendAlert("BACKUP_MISSING", "Nu există backup-uri", "Nu s-a găsit niciun backup în directorul zilnic");
                }
            } else {
                sendAlert("BACKUP_DIRECTORY_MISSING", "Director backup lipsă", "Directorul de backup nu există");
            }
            
        } catch (Exception e) {
            System.err.println("❌ Eroare la verificarea backup-urilor: " + e.getMessage());
        }
    }
    
    /**
     * Verifică erorile din loguri
     */
    private void checkErrorLogs() throws SQLException {
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            String sql = """
                SELECT COUNT(*) as error_count 
                FROM loguri_sistem 
                WHERE nivel = 'ERROR' 
                  AND created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
                """;
            
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                ResultSet rs = stmt.executeQuery();
                if (rs.next()) {
                    int errorCount = rs.getInt("error_count");
                    if (errorCount > 10) {
                        sendAlert("ERROR_LOG_HIGH", "Număr mare de erori în loguri", 
                            String.format("%d erori în ultima oră", errorCount));
                    }
                }
            }
        }
    }
    
    /**
     * Verifică starea zilei fiscale
     */
    private void checkFiscalDayStatus() throws SQLException {
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            LocalDate today = LocalDate.now();
            
            // Verifică dacă ziua este închisă
            String sql = "SELECT COUNT(*) FROM rapoarte_z_arhiva WHERE data_inchidere = ?";
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setDate(1, Date.valueOf(today));
                ResultSet rs = stmt.executeQuery();
                
                if (rs.next() && rs.getInt(1) == 0) {
                    // Ziua nu este închisă, verifică ora
                    LocalDateTime now = LocalDateTime.now();
                    if (now.getHour() >= 22) { // După ora 22:00
                        sendAlert("FISCAL_DAY_NOT_CLOSED", "Zi fiscală neînchisă", 
                            String.format("Ziua %s nu a fost închisă fiscal (ora curentă: %s)", 
                                today, now.format(DateTimeFormatter.ofPattern("HH:mm:ss"))));
                    }
                }
            }
        }
    }
    
    /**
     * Verifică operațiunile ANAF
     */
    private void checkAnafOperations() throws SQLException {
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            // Verifică rapoartele ne transmise
            String sql = """
                SELECT COUNT(*) as pending_count 
                FROM rapoarte_z_arhiva 
                WHERE status_transmitere = 'Neinitializata' 
                  AND data_inchidere < DATE_SUB(CURDATE(), INTERVAL 1 DAY)
                """;
            
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                ResultSet rs = stmt.executeQuery();
                if (rs.next()) {
                    int pendingCount = rs.getInt("pending_count");
                    if (pendingCount > 0) {
                        sendAlert("ANAF_PENDING_REPORTS", "Rapoarte ANAF în așteptare", 
                            String.format("%d rapoarte Z ne transmise la ANAF", pendingCount));
                    }
                }
            }
        }
    }
    
    /**
     * Verifică integritatea datelor
     */
    private void checkDataIntegrity() throws SQLException {
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            // Verifică tranzacțiile orfane (fără operator valid)
            String sql = """
                SELECT COUNT(*) as orphan_count 
                FROM tranzactii_comenzi tc 
                LEFT JOIN operatori_sistem os ON tc.operator_id = os.id 
                WHERE os.id IS NULL
                """;
            
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                ResultSet rs = stmt.executeQuery();
                if (rs.next()) {
                    int orphanCount = rs.getInt("orphan_count");
                    if (orphanCount > 0) {
                        sendAlert("DATA_INTEGRITY", "Tranzacții orfane detectate", 
                            String.format("%d tranzacții cu operatori invalizi", orphanCount));
                    }
                }
            }
        }
    }
    
    /**
     * Verifică performanța bazei de date
     */
    private void checkDatabasePerformance() throws SQLException {
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            long startTime = System.currentTimeMillis();
            
            // Execută o interogare de test
            String sql = "SELECT COUNT(*) FROM tranzactii_comenzi WHERE data_comanda >= DATE_SUB(NOW(), INTERVAL 1 DAY)";
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.executeQuery();
            }
            
            long endTime = System.currentTimeMillis();
            long responseTime = endTime - startTime;
            
            if (responseTime > 5000) { // Mai mult de 5 secunde
                sendAlert("DATABASE_SLOW", "Performanță bază de date scăzută", 
                    String.format("Timp răspuns: %d ms", responseTime));
            }
        }
    }
    
    /**
     * Verifică utilizarea memoriei
     */
    private void checkMemoryUsage() {
        Runtime runtime = Runtime.getRuntime();
        long maxMemory = runtime.maxMemory();
        long totalMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        long usedMemory = totalMemory - freeMemory;
        
        double memoryUsagePercent = (double) usedMemory / maxMemory * 100;
        
        if (memoryUsagePercent > 90.0) {
            sendAlert("MEMORY_HIGH", "Utilizare memorie critică", 
                String.format("Memorie folosită: %.1f%% (%d MB / %d MB)", 
                    memoryUsagePercent, usedMemory / 1024 / 1024, maxMemory / 1024 / 1024));
        }
    }
    
    /**
     * Verifică conexiunile active
     */
    private void checkActiveConnections() throws SQLException {
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            String sql = "SHOW STATUS LIKE 'Threads_connected'";
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                ResultSet rs = stmt.executeQuery();
                if (rs.next()) {
                    int activeConnections = rs.getInt("Value");
                    if (activeConnections > 50) {
                        sendAlert("DB_CONNECTIONS_HIGH", "Număr mare de conexiuni DB", 
                            String.format("%d conexiuni active la baza de date", activeConnections));
                    }
                }
            }
        }
    }
    
    /**
     * Trimite o alertă (metodă publică pentru testare)
     */
    public void sendAlert(String alertType, String title, String message) {
        String alertKey = alertType + "_" + LocalDate.now().toString();
        LocalDateTime now = LocalDateTime.now();
        
        // Verifică cooldown-ul pentru a evita spam-ul
        if (lastAlerts.containsKey(alertKey)) {
            LocalDateTime lastAlert = lastAlerts.get(alertKey);
            if (java.time.Duration.between(lastAlert, now).toMinutes() < ALERT_COOLDOWN_MINUTES) {
                return; // Skip alerta dacă a fost trimisă recent
            }
        }
        
        // Trimite alerta
        try {
            // 1. Log alerta în baza de date
            logAlert(alertType, title, message);
            
            // 2. Trimite email (dacă este configurat)
            sendEmailAlert(alertType, title, message);
            
            // 3. Salvează în fișier de alertă
            saveAlertToFile(alertType, title, message);
            
            // Actualizează timestamp-ul ultimei alerte
            lastAlerts.put(alertKey, now);
            
            System.out.println("🚨 ALERTĂ TRIMISĂ: " + title + " - " + message);
            
        } catch (Exception e) {
            System.err.println("❌ Eroare la trimiterea alertei: " + e.getMessage());
        }
    }
    
    /**
     * Log alerta în baza de date
     */
    private void logAlert(String alertType, String title, String message) throws SQLException {
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            String sql = """
                INSERT INTO loguri_sistem (nivel, categorie, mesaj, detalii, created_at) 
                VALUES ('ERROR', ?, ?, ?, NOW())
                """;
            
            String details = String.format("{\"alert_type\":\"%s\",\"title\":\"%s\",\"message\":\"%s\"}", 
                alertType, title, message);
            
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, "ALERT");
                stmt.setString(2, title);
                stmt.setString(3, details);
                stmt.executeUpdate();
            }
        }
    }
    
    /**
     * Trimite email cu alerta
     */
    private void sendEmailAlert(String alertType, String title, String message) {
        // Implementare simplă pentru trimiterea email-ului
        try {
            String emailContent = String.format("""
                ALERTĂ SISTEM FISCAL
                ===================
                
                Tip: %s
                Titlu: %s
                Mesaj: %s
                
                Data/Ora: %s
                
                Acțiuni recomandate:
                - Verificați logurile sistemului
                - Contactați administratorul tehnic
                - Verificați statusul sistemului
                
                --
                Sistem Fiscal Restaurant
                """, alertType, title, message, LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            
            // Salvează email-ul într-un fișier pentru a fi trimis mai târziu
            String emailFile = String.format("alerts/email_%s_%s.txt", alertType, 
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")));
            Files.write(Paths.get(emailFile), emailContent.getBytes());
            
        } catch (Exception e) {
            System.err.println("❌ Eroare la trimiterea email-ului: " + e.getMessage());
        }
    }
    
    /**
     * Salvează alerta în fișier
     */
    private void saveAlertToFile(String alertType, String title, String message) throws IOException {
        Path alertsDir = Paths.get("alerts");
        if (!Files.exists(alertsDir)) {
            Files.createDirectories(alertsDir);
        }
        
        String alertFile = String.format("alert_%s_%s.log", alertType, 
            LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")));
        
        String alertContent = String.format("[%s] %s - %s: %s%n", 
            LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")),
            alertType, title, message);
        
        Files.write(Paths.get(alertsDir.toString(), alertFile), alertContent.getBytes(), 
            StandardOpenOption.CREATE, StandardOpenOption.APPEND);
    }
    
    /**
     * Încarcă configurația alertei
     */
    private Map<String, Object> loadAlertConfiguration() {
        Map<String, Object> config = new HashMap<>();
        
        // Configurare implicită
        config.put("email_enabled", true);
        config.put("email_recipients", Arrays.asList("admin@trattoria.ro", "tech@trattoria.ro"));
        config.put("check_interval_minutes", CHECK_INTERVAL_MINUTES);
        config.put("alert_cooldown_minutes", ALERT_COOLDOWN_MINUTES);
        
        return config;
    }
    
    /**
     * Obține statistici despre monitorizare
     */
    public Map<String, Object> getMonitoringStats() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("monitoring_active", !scheduler.isShutdown());
        stats.put("check_interval_minutes", CHECK_INTERVAL_MINUTES);
        stats.put("alert_cooldown_minutes", ALERT_COOLDOWN_MINUTES);
        stats.put("last_alerts_count", lastAlerts.size());
        stats.put("last_check_time", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        
        return stats;
    }
}
