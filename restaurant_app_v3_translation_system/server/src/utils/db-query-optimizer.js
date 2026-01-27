/**
 * DATABASE QUERY OPTIMIZER
 * Optimizări pentru query-uri SQLite:
 * - Prepared statements caching
 * - Query result caching
 * - Connection pooling simulation
 */

const { dbPromise } = require('../../../database');

// Cache pentru prepared statements
const statementCache = new Map();

// Cache pentru rezultate query-uri (TTL-based)
const queryCache = new Map();
const CACHE_TTL = 30000; // 30 secunde

/**
 * Get or create prepared statement
 */
async function getStatement(sql) {
  if (statementCache.has(sql)) {
    return statementCache.get(sql);
  }

  const db = await dbPromise;
  const stmt = db.prepare(sql);
  statementCache.set(sql, stmt);
  return stmt;
}

/**
 * Execute query with caching
 */
async function query(sql, params = [], options = {}) {
  const { cache = false, cacheKey = null } = options;
  
  // Generate cache key
  const key = cacheKey || `${sql}:${JSON.stringify(params)}`;
  
  // Check cache
  if (cache && queryCache.has(key)) {
    const cached = queryCache.get(key);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    queryCache.delete(key);
  }

  // Execute query
  const db = await dbPromise;
  
  return new Promise((resolve, reject) => {
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Deep clone to avoid EventEmitter issues
          const result = JSON.parse(JSON.stringify(rows));
          
          // Cache result
          if (cache) {
            queryCache.set(key, {
              data: result,
              timestamp: Date.now(),
            });
          }
          
          resolve(result);
        }
      });
    } else {
      db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            lastID: this.lastID,
            changes: this.changes,
          });
        }
      });
    }
  });
}

/**
 * Execute single row query
 */
async function queryOne(sql, params = [], options = {}) {
  const { cache = false, cacheKey = null } = options;
  const key = cacheKey || `${sql}:${JSON.stringify(params)}:ONE`;
  
  if (cache && queryCache.has(key)) {
    const cached = queryCache.get(key);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    queryCache.delete(key);
  }

  const db = await dbPromise;
  
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        const result = row ? JSON.parse(JSON.stringify(row)) : null;
        
        if (cache && result) {
          queryCache.set(key, {
            data: result,
            timestamp: Date.now(),
          });
        }
        
        resolve(result);
      }
    });
  });
}

/**
 * Clear cache
 */
function clearCache(pattern = null) {
  if (pattern) {
    for (const key of queryCache.keys()) {
      if (key.includes(pattern)) {
        queryCache.delete(key);
      }
    }
  } else {
    queryCache.clear();
  }
}

/**
 * Get cache stats
 */
function getCacheStats() {
  return {
    size: queryCache.size,
    keys: Array.from(queryCache.keys()),
  };
}

module.exports = {
  query,
  queryOne,
  getStatement,
  clearCache,
  getCacheStats,
};

