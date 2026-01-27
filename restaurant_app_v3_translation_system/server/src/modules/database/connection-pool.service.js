/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DATABASE CONNECTION POOL SERVICE
 * 
 * Connection pooling și optimizări pentru 200+ clienți simultan
 * - WAL mode pentru SQLite (concurrent reads)
 * - Prepared statements cache
 * - Query batching
 * - Connection management
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { dbPromise } = require('../../../database');

class ConnectionPoolService {
  constructor() {
    this.preparedStatements = new Map();
    this.queryCache = new Map();
    this.maxCacheSize = 1000;
    this.cacheTTL = 60000; // 1 minut
  }

  /**
   * Optimizează database pentru high concurrency
   */
  async optimizeForHighConcurrency(db) {
    return new Promise((resolve, reject) => {
      // WAL mode pentru concurrent reads
      db.run('PRAGMA journal_mode = WAL', (err) => {
        if (err) {
          console.error('❌ Error setting WAL mode:', err);
          reject(err);
          return;
        }
        console.log('✅ WAL mode enabled for concurrent access');
      });

      // Synchronous mode - NORMAL pentru WAL (mai rapid decât FULL)
      db.run('PRAGMA synchronous = NORMAL', (err) => {
        if (err) {
          console.warn('⚠️ Error setting synchronous mode:', err);
        } else {
          console.log('✅ Synchronous mode set to NORMAL');
        }
      });

      // Cache size pentru performance
      db.run('PRAGMA cache_size = -64000', (err) => { // 64MB cache
        if (err) {
          console.warn('⚠️ Error setting cache size:', err);
        } else {
          console.log('✅ Cache size set to 64MB');
        }
      });

      // Temp store în memorie (mai rapid)
      db.run('PRAGMA temp_store = MEMORY', (err) => {
        if (err) {
          console.warn('⚠️ Error setting temp_store:', err);
        } else {
          console.log('✅ Temp store set to MEMORY');
        }
      });

      // Busy timeout mai mare pentru high concurrency
      db.configure('busyTimeout', 10000); // 10 secunde

      // Optimizează pentru high concurrency
      db.run('PRAGMA optimize', (err) => {
        if (err) {
          console.warn('⚠️ Error running PRAGMA optimize:', err);
        }
        resolve();
      });
    });
  }

  /**
   * Batch execute queries (pentru performance)
   */
  async batchExecute(db, queries) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        const results = [];
        let completed = 0;

        queries.forEach((query, index) => {
          db.run(query.sql, query.params || [], function(err) {
            if (err) {
              reject(err);
              return;
            }

            results[index] = {
              lastID: this.lastID,
              changes: this.changes,
            };

            completed++;
            if (completed === queries.length) {
              resolve(results);
            }
          });
        });
      });
    });
  }

  /**
   * Prepared statement cache
   */
  getPreparedStatement(key) {
    return this.preparedStatements.get(key);
  }

  setPreparedStatement(key, statement) {
    if (this.preparedStatements.size >= 100) {
      // Evict oldest
      const firstKey = this.preparedStatements.keys().next().value;
      this.preparedStatements.delete(firstKey);
    }
    this.preparedStatements.set(key, statement);
  }

  /**
   * Query cache cu TTL
   */
  getCachedQuery(key) {
    const cached = this.queryCache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.cacheTTL) {
      this.queryCache.delete(key);
      return null;
    }

    return cached.data;
  }

  setCachedQuery(key, data) {
    if (this.queryCache.size >= this.maxCacheSize) {
      // Evict oldest
      const oldestKey = Array.from(this.queryCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      this.queryCache.delete(oldestKey);
    }

    this.queryCache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.queryCache.clear();
    console.log('✅ Query cache cleared');
  }
}

// Singleton
const connectionPoolService = new ConnectionPoolService();

module.exports = connectionPoolService;
