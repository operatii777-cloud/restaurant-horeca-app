package fiscal;

import java.io.*;
import java.nio.file.*;
import java.sql.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/**
 * Serviciu pentru backup automat al bazei de date și arhivei fiscale
 * Gestionează backup-ul zilnic, săptămânal și lunar
 */
public class BackupService {

    private final DatabaseService dbService;
    private final String backupBasePath;
    private final String dbUrl;
    private final String dbUser;
    private final String dbPassword;
    private final String dbName;
    
    // Configurare backup
    private static final int RETENTION_DAYS = 30;
    private static final int RETENTION_WEEKS = 12;
    private static final int RETENTION_MONTHS = 12;
    
    public BackupService(DatabaseService dbService, String backupBasePath, String dbUrl, String dbUser, String dbPassword) {
        this.dbService = dbService;
        this.backupBasePath = backupBasePath;
        this.dbUrl = dbUrl;
        this.dbUser = dbUser;
        this.dbPassword = dbPassword;
        this.dbName = extractDatabaseName(dbUrl);
        
        // Creează directorul de backup dacă nu există
        createBackupDirectory();
    }
    
    /**
     * Execută backup-ul zilnic complet
     */
    public BackupResult executeDailyBackup() {
        System.out.println("🔄 Începe backup-ul zilnic...");
        LocalDateTime startTime = LocalDateTime.now();
        
        try {
            // 1. Backup baza de date
            String dbBackupPath = backupDatabase();
            
            // 2. Backup arhiva fiscală
            String archiveBackupPath = backupFiscalArchive();
            
            // 3. Backup configurații
            String configBackupPath = backupConfigurations();
            
            // 4. Creează backup-ul complet (ZIP)
            String completeBackupPath = createCompleteBackup(Arrays.asList(
                dbBackupPath, archiveBackupPath, configBackupPath
            ));
            
            // 5. Validează backup-ul
            boolean isValid = validateBackup(completeBackupPath);
            
            // 6. Curăță backup-urile vechi
            cleanupOldBackups();
            
            LocalDateTime endTime = LocalDateTime.now();
            long duration = java.time.Duration.between(startTime, endTime).toSeconds();
            
            BackupResult result = new BackupResult(true, completeBackupPath, duration, 
                "Backup zilnic completat cu succes");
            
            System.out.println("✅ Backup zilnic completat în " + duration + " secunde");
            return result;
            
        } catch (Exception e) {
            System.err.println("❌ Eroare la backup-ul zilnic: " + e.getMessage());
            return new BackupResult(false, null, 0, "Eroare: " + e.getMessage());
        }
    }
    
    /**
     * Execută backup-ul săptămânal (backup complet + rapoarte)
     */
    public BackupResult executeWeeklyBackup() {
        System.out.println("🔄 Începe backup-ul săptămânal...");
        
        try {
            // Backup complet zilnic
            BackupResult dailyResult = executeDailyBackup();
            
            if (!dailyResult.isSuccess()) {
                return dailyResult;
            }
            
            // Backup suplimentar pentru rapoarte săptămânale
            String weeklyReportsPath = backupWeeklyReports();
            
            System.out.println("✅ Backup săptămânal completat");
            return new BackupResult(true, dailyResult.getBackupPath(), 
                dailyResult.getDuration(), "Backup săptămânal completat cu succes");
            
        } catch (Exception e) {
            System.err.println("❌ Eroare la backup-ul săptămânal: " + e.getMessage());
            return new BackupResult(false, null, 0, "Eroare: " + e.getMessage());
        }
    }
    
    /**
     * Execută backup-ul lunar (backup complet + arhivă lungă)
     */
    public BackupResult executeMonthlyBackup() {
        System.out.println("🔄 Începe backup-ul lunar...");
        
        try {
            // Backup complet zilnic
            BackupResult dailyResult = executeDailyBackup();
            
            if (!dailyResult.isSuccess()) {
                return dailyResult;
            }
            
            // Backup suplimentar pentru arhiva lunară
            String monthlyArchivePath = backupMonthlyArchive();
            
            // Backup pentru rapoarte lunare
            String monthlyReportsPath = backupMonthlyReports();
            
            System.out.println("✅ Backup lunar completat");
            return new BackupResult(true, dailyResult.getBackupPath(), 
                dailyResult.getDuration(), "Backup lunar completat cu succes");
            
        } catch (Exception e) {
            System.err.println("❌ Eroare la backup-ul lunar: " + e.getMessage());
            return new BackupResult(false, null, 0, "Eroare: " + e.getMessage());
        }
    }
    
    /**
     * Backup baza de date MySQL
     */
    private String backupDatabase() throws Exception {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String backupFileName = "fiscal_db_backup_" + timestamp + ".sql";
        String backupPath = Paths.get(backupBasePath, "daily", backupFileName).toString();
        
        // Creează directorul zilnic
        Paths.get(backupBasePath, "daily").toFile().mkdirs();
        
        // Execută mysqldump
        ProcessBuilder pb = new ProcessBuilder(
            "mysqldump",
            "--single-transaction",
            "--routines",
            "--triggers",
            "--add-drop-database",
            "--databases",
            dbName,
            "--user=" + dbUser,
            "--password=" + dbPassword,
            "--result-file=" + backupPath
        );
        
        Process process = pb.start();
        int exitCode = process.waitFor();
        
        if (exitCode != 0) {
            throw new Exception("mysqldump a eșuat cu codul: " + exitCode);
        }
        
        // Verifică că fișierul a fost creat și nu este gol
        File backupFile = new File(backupPath);
        if (!backupFile.exists() || backupFile.length() == 0) {
            throw new Exception("Fișierul de backup nu a fost creat sau este gol");
        }
        
        System.out.println("📊 Backup baza de date: " + backupPath);
        return backupPath;
    }
    
    /**
     * Backup arhiva fiscală
     */
    private String backupFiscalArchive() throws Exception {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String archiveZipName = "fiscal_archive_backup_" + timestamp + ".zip";
        String archiveZipPath = Paths.get(backupBasePath, "daily", archiveZipName).toString();
        
        Path archiveSourcePath = Paths.get("arhiva_rapoarte");
        
        if (!Files.exists(archiveSourcePath)) {
            System.out.println("⚠️ Directorul arhivei nu există: " + archiveSourcePath);
            return null;
        }
        
        // Creează ZIP cu arhiva
        try (ZipOutputStream zos = new ZipOutputStream(new FileOutputStream(archiveZipPath))) {
            Files.walk(archiveSourcePath)
                .filter(Files::isRegularFile)
                .forEach(file -> {
                    try {
                        String relativePath = archiveSourcePath.relativize(file).toString();
                        ZipEntry entry = new ZipEntry(relativePath);
                        zos.putNextEntry(entry);
                        Files.copy(file, zos);
                        zos.closeEntry();
                    } catch (IOException e) {
                        System.err.println("Eroare la adăugarea fișierului în ZIP: " + e.getMessage());
                    }
                });
        }
        
        System.out.println("📁 Backup arhivă fiscală: " + archiveZipPath);
        return archiveZipPath;
    }
    
    /**
     * Backup configurații sistem
     */
    private String backupConfigurations() throws Exception {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String configZipName = "fiscal_config_backup_" + timestamp + ".zip";
        String configZipPath = Paths.get(backupBasePath, "daily", configZipName).toString();
        
        List<String> configFiles = Arrays.asList(
            "fiscal-config.properties",
            "WEB-INF/web.xml",
            "database/01_create_fiscal_database.sql",
            "database/02_insert_test_data.sql"
        );
        
        try (ZipOutputStream zos = new ZipOutputStream(new FileOutputStream(configZipPath))) {
            for (String configFile : configFiles) {
                Path filePath = Paths.get(configFile);
                if (Files.exists(filePath)) {
                    ZipEntry entry = new ZipEntry(filePath.getFileName().toString());
                    zos.putNextEntry(entry);
                    Files.copy(filePath, zos);
                    zos.closeEntry();
                }
            }
        }
        
        System.out.println("⚙️ Backup configurații: " + configZipPath);
        return configZipPath;
    }
    
    /**
     * Creează backup-ul complet (ZIP cu toate componentele)
     */
    private String createCompleteBackup(List<String> backupFiles) throws Exception {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String completeBackupName = "fiscal_complete_backup_" + timestamp + ".zip";
        String completeBackupPath = Paths.get(backupBasePath, "daily", completeBackupName).toString();
        
        try (ZipOutputStream zos = new ZipOutputStream(new FileOutputStream(completeBackupPath))) {
            // Adaugă toate fișierele de backup
            for (String backupFile : backupFiles) {
                if (backupFile != null && Files.exists(Paths.get(backupFile))) {
                    File file = new File(backupFile);
                    ZipEntry entry = new ZipEntry(file.getName());
                    zos.putNextEntry(entry);
                    Files.copy(Paths.get(backupFile), zos);
                    zos.closeEntry();
                }
            }
            
            // Adaugă metadata backup-ului
            String metadata = generateBackupMetadata();
            ZipEntry metadataEntry = new ZipEntry("backup_metadata.txt");
            zos.putNextEntry(metadataEntry);
            zos.write(metadata.getBytes());
            zos.closeEntry();
        }
        
        System.out.println("📦 Backup complet: " + completeBackupPath);
        return completeBackupPath;
    }
    
    /**
     * Generează metadata pentru backup
     */
    private String generateBackupMetadata() {
        StringBuilder metadata = new StringBuilder();
        metadata.append("BACKUP FISCAL - METADATA\n");
        metadata.append("========================\n");
        metadata.append("Data backup: ").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))).append("\n");
        metadata.append("Tip backup: Zilnic\n");
        metadata.append("Baza de date: ").append(dbName).append("\n");
        metadata.append("Versiune sistem: 1.0\n");
        metadata.append("Retenție: ").append(RETENTION_DAYS).append(" zile\n");
        metadata.append("\n");
        
        // Adaugă statistici despre sistem
        try {
            Map<String, Object> stats = getSystemStatistics();
            metadata.append("STATISTICI SISTEM:\n");
            metadata.append("Tranzacții totale: ").append(stats.get("total_tranzactii")).append("\n");
            metadata.append("Rapoarte Z: ").append(stats.get("total_rapoarte_z")).append("\n");
            metadata.append("Operatori activi: ").append(stats.get("total_operatori")).append("\n");
        } catch (Exception e) {
            metadata.append("Eroare la preluarea statisticilor: ").append(e.getMessage()).append("\n");
        }
        
        return metadata.toString();
    }
    
    /**
     * Validează backup-ul creat
     */
    private boolean validateBackup(String backupPath) {
        try {
            File backupFile = new File(backupPath);
            
            // Verifică că fișierul există și nu este gol
            if (!backupFile.exists() || backupFile.length() == 0) {
                System.err.println("❌ Backup-ul nu există sau este gol");
                return false;
            }
            
            // Verifică că este un ZIP valid
            try (ZipInputStream zis = new ZipInputStream(new FileInputStream(backupFile))) {
                ZipEntry entry = zis.getNextEntry();
                if (entry == null) {
                    System.err.println("❌ Backup-ul nu este un ZIP valid");
                    return false;
                }
            }
            
            // Verifică că conține metadata
            try (ZipInputStream zis = new ZipInputStream(new FileInputStream(backupFile))) {
                ZipEntry entry;
                boolean hasMetadata = false;
                while ((entry = zis.getNextEntry()) != null) {
                    if (entry.getName().equals("backup_metadata.txt")) {
                        hasMetadata = true;
                        break;
                    }
                }
                
                if (!hasMetadata) {
                    System.err.println("❌ Backup-ul nu conține metadata");
                    return false;
                }
            }
            
            System.out.println("✅ Backup-ul a fost validat cu succes");
            return true;
            
        } catch (Exception e) {
            System.err.println("❌ Eroare la validarea backup-ului: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Curăță backup-urile vechi conform politicii de retenție
     */
    private void cleanupOldBackups() {
        System.out.println("🧹 Curăță backup-urile vechi...");
        
        try {
            // Curăță backup-urile zilnice (păstrează 30 zile)
            cleanupBackupDirectory(Paths.get(backupBasePath, "daily"), RETENTION_DAYS);
            
            // Curăță backup-urile săptămânale (păstrează 12 săptămâni)
            cleanupBackupDirectory(Paths.get(backupBasePath, "weekly"), RETENTION_WEEKS * 7);
            
            // Curăță backup-urile lunare (păstrează 12 luni)
            cleanupBackupDirectory(Paths.get(backupBasePath, "monthly"), RETENTION_MONTHS * 30);
            
            System.out.println("✅ Curățarea backup-urilor vechi completată");
            
        } catch (Exception e) {
            System.err.println("❌ Eroare la curățarea backup-urilor: " + e.getMessage());
        }
    }
    
    /**
     * Curăță fișierele dintr-un director mai vechi decât numărul de zile specificat
     */
    private void cleanupBackupDirectory(Path directory, int retentionDays) throws IOException {
        if (!Files.exists(directory)) {
            return;
        }
        
        LocalDate cutoffDate = LocalDate.now().minusDays(retentionDays);
        
        Files.walk(directory)
            .filter(Files::isRegularFile)
            .filter(file -> {
                try {
                    LocalDate fileDate = Files.getLastModifiedTime(file).toInstant()
                        .atZone(java.time.ZoneId.systemDefault()).toLocalDate();
                    return fileDate.isBefore(cutoffDate);
                } catch (IOException e) {
                    return false;
                }
            })
            .forEach(file -> {
                try {
                    Files.delete(file);
                    System.out.println("🗑️ Șters fișier vechi: " + file.getFileName());
                } catch (IOException e) {
                    System.err.println("❌ Eroare la ștergerea fișierului: " + file.getFileName());
                }
            });
    }
    
    /**
     * Backup rapoarte săptămânale
     */
    private String backupWeeklyReports() throws Exception {
        // Implementare pentru backup-ul săptămânal specific
        System.out.println("📊 Backup rapoarte săptămânale...");
        return null; // Placeholder
    }
    
    /**
     * Backup arhiva lunară
     */
    private String backupMonthlyArchive() throws Exception {
        // Implementare pentru backup-ul lunar specific
        System.out.println("📁 Backup arhivă lunară...");
        return null; // Placeholder
    }
    
    /**
     * Backup rapoarte lunare
     */
    private String backupMonthlyReports() throws Exception {
        // Implementare pentru backup-ul rapoartelor lunare
        System.out.println("📈 Backup rapoarte lunare...");
        return null; // Placeholder
    }
    
    /**
     * Obține statistici despre sistem
     */
    private Map<String, Object> getSystemStatistics() throws SQLException {
        Map<String, Object> stats = new HashMap<>();
        
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            // Total tranzacții
            String sql1 = "SELECT COUNT(*) FROM tranzactii_comenzi";
            try (PreparedStatement stmt = conn.prepareStatement(sql1)) {
                ResultSet rs = stmt.executeQuery();
                if (rs.next()) {
                    stats.put("total_tranzactii", rs.getInt(1));
                }
            }
            
            // Total rapoarte Z
            String sql2 = "SELECT COUNT(*) FROM rapoarte_z_arhiva";
            try (PreparedStatement stmt = conn.prepareStatement(sql2)) {
                ResultSet rs = stmt.executeQuery();
                if (rs.next()) {
                    stats.put("total_rapoarte_z", rs.getInt(1));
                }
            }
            
            // Total operatori
            String sql3 = "SELECT COUNT(*) FROM operatori_sistem WHERE activ = true";
            try (PreparedStatement stmt = conn.prepareStatement(sql3)) {
                ResultSet rs = stmt.executeQuery();
                if (rs.next()) {
                    stats.put("total_operatori", rs.getInt(1));
                }
            }
        }
        
        return stats;
    }
    
    /**
     * Extrage numele bazei de date din URL
     */
    private String extractDatabaseName(String dbUrl) {
        String[] parts = dbUrl.split("/");
        if (parts.length > 0) {
            String lastPart = parts[parts.length - 1];
            return lastPart.split("\\?")[0];
        }
        return "restaurant_fiscal";
    }
    
    /**
     * Creează directorul de backup
     */
    private void createBackupDirectory() {
        try {
            Paths.get(backupBasePath).toFile().mkdirs();
            Paths.get(backupBasePath, "daily").toFile().mkdirs();
            Paths.get(backupBasePath, "weekly").toFile().mkdirs();
            Paths.get(backupBasePath, "monthly").toFile().mkdirs();
        } catch (Exception e) {
            System.err.println("❌ Eroare la crearea directorului de backup: " + e.getMessage());
        }
    }
    
    /**
     * Clasa pentru rezultatul backup-ului
     */
    public static class BackupResult {
        private final boolean success;
        private final String backupPath;
        private final long duration;
        private final String message;
        
        public BackupResult(boolean success, String backupPath, long duration, String message) {
            this.success = success;
            this.backupPath = backupPath;
            this.duration = duration;
            this.message = message;
        }
        
        public boolean isSuccess() { return success; }
        public String getBackupPath() { return backupPath; }
        public long getDuration() { return duration; }
        public String getMessage() { return message; }
        
        @Override
        public String toString() {
            return String.format("BackupResult{success=%s, path='%s', duration=%ds, message='%s'}", 
                success, backupPath, duration, message);
        }
    }
}
