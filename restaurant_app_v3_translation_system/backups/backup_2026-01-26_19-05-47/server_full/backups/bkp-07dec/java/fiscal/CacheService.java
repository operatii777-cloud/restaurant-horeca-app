package fiscal;

import java.util.*;
import java.util.concurrent.*;
import java.time.LocalDateTime;
import java.time.Duration;

/**
 * Serviciu de cache pentru optimizarea performanței sistemului fiscal
 * Implementează cache-ul pentru rapoarte frecvent accesate și date agregate
 */
public class CacheService {

    private final ConcurrentHashMap<String, CacheEntry> cache;
    private final ScheduledExecutorService cleanupScheduler;
    
    // Configurare cache
    private static final int DEFAULT_TTL_MINUTES = 30;
    private static final int MAX_CACHE_SIZE = 1000;
    private static final int CLEANUP_INTERVAL_MINUTES = 5;
    
    // Chei cache pentru diferite tipuri de date
    public static final String CACHE_KEY_RAPORT_X = "raport_x_";
    public static final String CACHE_KEY_RAPORT_Z = "raport_z_";
    public static final String CACHE_KEY_RAPORT_LUNAR = "raport_lunar_";
    public static final String CACHE_KEY_ISTORIC_COMENZI = "istoric_comenzi_";
    public static final String CACHE_KEY_ARCHIVE = "archive_";
    public static final String CACHE_KEY_OPERATORI = "operatori_list";
    public static final String CACHE_KEY_CONFIG = "config_";
    
    public CacheService() {
        this.cache = new ConcurrentHashMap<>();
        this.cleanupScheduler = Executors.newScheduledThreadPool(1);
        
        // Pornește cleanup-ul automat
        startCleanupScheduler();
        
        System.out.println("✅ CacheService inițializat cu succes");
    }
    
    /**
     * Pornește scheduler-ul pentru cleanup automat
     */
    private void startCleanupScheduler() {
        cleanupScheduler.scheduleAtFixedRate(
            this::cleanupExpiredEntries,
            CLEANUP_INTERVAL_MINUTES,
            CLEANUP_INTERVAL_MINUTES,
            TimeUnit.MINUTES
        );
    }
    
    /**
     * Stochează o valoare în cache
     */
    public void put(String key, Object value) {
        put(key, value, DEFAULT_TTL_MINUTES);
    }
    
    /**
     * Stochează o valoare în cache cu TTL personalizat
     */
    public void put(String key, Object value, int ttlMinutes) {
        // Verifică dimensiunea cache-ului
        if (cache.size() >= MAX_CACHE_SIZE) {
            cleanupExpiredEntries();
            
            // Dacă încă este plin, șterge cele mai vechi intrări
            if (cache.size() >= MAX_CACHE_SIZE) {
                removeOldestEntries();
            }
        }
        
        LocalDateTime expirationTime = LocalDateTime.now().plusMinutes(ttlMinutes);
        CacheEntry entry = new CacheEntry(value, expirationTime);
        
        cache.put(key, entry);
        
        System.out.println("📦 Cache PUT: " + key + " (TTL: " + ttlMinutes + " min)");
    }
    
    /**
     * Obține o valoare din cache
     */
    public Object get(String key) {
        CacheEntry entry = cache.get(key);
        
        if (entry == null) {
            System.out.println("❌ Cache MISS: " + key);
            return null;
        }
        
        // Verifică dacă intrarea a expirat
        if (entry.isExpired()) {
            cache.remove(key);
            System.out.println("⏰ Cache EXPIRED: " + key);
            return null;
        }
        
        System.out.println("✅ Cache HIT: " + key);
        return entry.getValue();
    }
    
    /**
     * Verifică dacă o cheie există în cache și nu a expirat
     */
    public boolean contains(String key) {
        CacheEntry entry = cache.get(key);
        
        if (entry == null) {
            return false;
        }
        
        if (entry.isExpired()) {
            cache.remove(key);
            return false;
        }
        
        return true;
    }
    
    /**
     * Șterge o intrare din cache
     */
    public void remove(String key) {
        CacheEntry removed = cache.remove(key);
        if (removed != null) {
            System.out.println("🗑️ Cache REMOVED: " + key);
        }
    }
    
    /**
     * Șterge toate intrările din cache
     */
    public void clear() {
        int size = cache.size();
        cache.clear();
        System.out.println("🧹 Cache CLEARED: " + size + " intrări șterse");
    }
    
    /**
     * Obține statistici despre cache
     */
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        
        int totalEntries = cache.size();
        int expiredEntries = 0;
        int activeEntries = 0;
        
        LocalDateTime now = LocalDateTime.now();
        for (CacheEntry entry : cache.values()) {
            if (entry.isExpired(now)) {
                expiredEntries++;
            } else {
                activeEntries++;
            }
        }
        
        stats.put("total_entries", totalEntries);
        stats.put("active_entries", activeEntries);
        stats.put("expired_entries", expiredEntries);
        stats.put("max_size", MAX_CACHE_SIZE);
        stats.put("utilization_percent", (double) totalEntries / MAX_CACHE_SIZE * 100);
        stats.put("cleanup_interval_minutes", CLEANUP_INTERVAL_MINUTES);
        
        return stats;
    }
    
    /**
     * Curăță intrările expirate
     */
    private void cleanupExpiredEntries() {
        LocalDateTime now = LocalDateTime.now();
        int removedCount = 0;
        
        Iterator<Map.Entry<String, CacheEntry>> iterator = cache.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry<String, CacheEntry> entry = iterator.next();
            if (entry.getValue().isExpired(now)) {
                iterator.remove();
                removedCount++;
            }
        }
        
        if (removedCount > 0) {
            System.out.println("🧹 Cache cleanup: " + removedCount + " intrări expirate șterse");
        }
    }
    
    /**
     * Șterge cele mai vechi intrări când cache-ul este plin
     */
    private void removeOldestEntries() {
        // Sortează intrările după timpul de creare și șterge cele mai vechi
        List<Map.Entry<String, CacheEntry>> sortedEntries = new ArrayList<>(cache.entrySet());
        sortedEntries.sort(Comparator.comparing(entry -> entry.getValue().getCreatedAt()));
        
        int toRemove = cache.size() - (int) (MAX_CACHE_SIZE * 0.8); // Șterge 20% din cache
        for (int i = 0; i < toRemove && i < sortedEntries.size(); i++) {
            cache.remove(sortedEntries.get(i).getKey());
        }
        
        System.out.println("🗑️ Cache LRU cleanup: " + toRemove + " intrări vechi șterse");
    }
    
    /**
     * Generează cheia cache pentru raport X
     */
    public static String generateRaportXKey(String data) {
        return CACHE_KEY_RAPORT_X + data;
    }
    
    /**
     * Generează cheia cache pentru raport Z
     */
    public static String generateRaportZKey(String data) {
        return CACHE_KEY_RAPORT_Z + data;
    }
    
    /**
     * Generează cheia cache pentru raport lunar
     */
    public static String generateRaportLunarKey(String lunaAn) {
        return CACHE_KEY_RAPORT_LUNAR + lunaAn;
    }
    
    /**
     * Generează cheia cache pentru istoric comenzi
     */
    public static String generateIstoricComenziKey(String dataStart, String dataStop, String operator) {
        return CACHE_KEY_ISTORIC_COMENZI + dataStart + "_" + dataStop + "_" + (operator != null ? operator : "all");
    }
    
    /**
     * Generează cheia cache pentru arhivă
     */
    public static String generateArchiveKey(String data, String luna) {
        if (data != null) {
            return CACHE_KEY_ARCHIVE + "date_" + data;
        } else if (luna != null) {
            return CACHE_KEY_ARCHIVE + "luna_" + luna;
        }
        return CACHE_KEY_ARCHIVE + "all";
    }
    
    /**
     * Generează cheia cache pentru configurație
     */
    public static String generateConfigKey(String configKey) {
        return CACHE_KEY_CONFIG + configKey;
    }
    
    /**
     * Invalidează cache-ul pentru o anumită dată (când se adaugă tranzacții noi)
     */
    public void invalidateForDate(String data) {
        List<String> keysToRemove = new ArrayList<>();
        
        for (String key : cache.keySet()) {
            if (key.contains(data)) {
                keysToRemove.add(key);
            }
        }
        
        for (String key : keysToRemove) {
            cache.remove(key);
        }
        
        if (!keysToRemove.isEmpty()) {
            System.out.println("🔄 Cache invalidated for date " + data + ": " + keysToRemove.size() + " keys removed");
        }
    }
    
    /**
     * Invalidează toate intrările de tip raport
     */
    public void invalidateAllReports() {
        List<String> keysToRemove = new ArrayList<>();
        
        for (String key : cache.keySet()) {
            if (key.startsWith(CACHE_KEY_RAPORT_X) || 
                key.startsWith(CACHE_KEY_RAPORT_Z) || 
                key.startsWith(CACHE_KEY_RAPORT_LUNAR)) {
                keysToRemove.add(key);
            }
        }
        
        for (String key : keysToRemove) {
            cache.remove(key);
        }
        
        if (!keysToRemove.isEmpty()) {
            System.out.println("🔄 All reports cache invalidated: " + keysToRemove.size() + " keys removed");
        }
    }
    
    /**
     * Oprește serviciul de cache
     */
    public void shutdown() {
        cleanupScheduler.shutdown();
        try {
            if (!cleanupScheduler.awaitTermination(5, TimeUnit.SECONDS)) {
                cleanupScheduler.shutdownNow();
            }
        } catch (InterruptedException e) {
            cleanupScheduler.shutdownNow();
        }
        
        cache.clear();
        System.out.println("✅ CacheService oprit");
    }
    
    /**
     * Clasa pentru o intrare în cache
     */
    private static class CacheEntry {
        private final Object value;
        private final LocalDateTime expirationTime;
        private final LocalDateTime createdAt;
        
        public CacheEntry(Object value, LocalDateTime expirationTime) {
            this.value = value;
            this.expirationTime = expirationTime;
            this.createdAt = LocalDateTime.now();
        }
        
        public Object getValue() {
            return value;
        }
        
        public boolean isExpired() {
            return isExpired(LocalDateTime.now());
        }
        
        public boolean isExpired(LocalDateTime now) {
            return now.isAfter(expirationTime);
        }
        
        public LocalDateTime getCreatedAt() {
            return createdAt;
        }
        
        @Override
        public String toString() {
            return String.format("CacheEntry{value=%s, expires=%s, created=%s}", 
                value.getClass().getSimpleName(), expirationTime, createdAt);
        }
    }
}
