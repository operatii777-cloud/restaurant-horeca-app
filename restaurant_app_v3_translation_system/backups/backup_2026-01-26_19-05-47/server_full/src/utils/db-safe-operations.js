/**
 * DATABASE SAFE OPERATIONS
 * 
 * Wrapper-uri protejate pentru operațiunile DB cu:
 * - Timeout automat
 * - Retry cu exponential backoff
 * - Circuit breaker protection
 * 
 * PHASE: E9.8 - Enterprise Protection System
 */

const { safeDbOperation, withRetry, withTimeout, CONFIG } = require('./anti-blocking');
const { dbPromise } = require('../../database');
const { logger } = require('./logger');
const dbLogger = logger.child('DB-SAFE-OPS');

/**
 * Get database connection with timeout
 */
async function getDbSafe(timeout = CONFIG.DB_TIMEOUT) {
  return withTimeout(
    dbPromise,
    timeout,
    'Database connection'
  );
}

/**
 * Safe db.get() with timeout and retry
 */
async function dbGetSafe(query, params = [], options = {}) {
  const operationName = options.operationName || `db.get: ${query.substring(0, 50)}`;
  
  return safeDbOperation(async () => {
    const db = await getDbSafe();
    
    return new Promise((resolve, reject) => {
      db.get(query, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }, {
    timeout: options.timeout || CONFIG.QUERY_TIMEOUT,
    operationName,
    useCircuitBreaker: options.useCircuitBreaker !== false
  });
}

/**
 * Safe db.all() with timeout and retry
 */
async function dbAllSafe(query, params = [], options = {}) {
  const operationName = options.operationName || `db.all: ${query.substring(0, 50)}`;
  
  return safeDbOperation(async () => {
    const db = await getDbSafe();
    
    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(Array.isArray(rows) ? rows : []);
        }
      });
    });
  }, {
    timeout: options.timeout || CONFIG.QUERY_TIMEOUT,
    operationName,
    useCircuitBreaker: options.useCircuitBreaker !== false
  });
}

/**
 * Safe db.run() with timeout and retry
 */
async function dbRunSafe(query, params = [], options = {}) {
  const operationName = options.operationName || `db.run: ${query.substring(0, 50)}`;
  
  return safeDbOperation(async () => {
    const db = await getDbSafe();
    
    return new Promise((resolve, reject) => {
      db.run(query, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            lastID: this.lastID,
            changes: this.changes
          });
        }
      });
    });
  }, {
    timeout: options.timeout || CONFIG.QUERY_TIMEOUT,
    operationName,
    useCircuitBreaker: options.useCircuitBreaker !== false
  });
}

/**
 * Safe transaction with automatic rollback on error
 */
async function dbTransactionSafe(operations, options = {}) {
  const operationName = options.operationName || 'db.transaction';
  const timeout = options.timeout || CONFIG.LONG_QUERY_TIMEOUT;
  
  return safeDbOperation(async () => {
    const db = await getDbSafe();
    
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN IMMEDIATE TRANSACTION', (err) => {
          if (err) {
            reject(err);
            return;
          }
          
          // Execute all operations
          let completed = 0;
          const results = [];
          let hasError = false;
          
          operations.forEach((operation, index) => {
            if (hasError) return;
            
            const { query, params } = operation;
            
            if (query.toUpperCase().trim().startsWith('SELECT')) {
              // SELECT operations
              db.all(query, params, (err, rows) => {
                if (err) {
                  hasError = true;
                  db.run('ROLLBACK', () => {
                    reject(err);
                  });
                } else {
                  results[index] = rows;
                  completed++;
                  if (completed === operations.length) {
                    db.run('COMMIT', (commitErr) => {
                      if (commitErr) {
                        reject(commitErr);
                      } else {
                        resolve(results);
                      }
                    });
                  }
                }
              });
            } else {
              // INSERT/UPDATE/DELETE operations
              db.run(query, params, function(err) {
                if (err) {
                  hasError = true;
                  db.run('ROLLBACK', () => {
                    reject(err);
                  });
                } else {
                  results[index] = {
                    lastID: this.lastID,
                    changes: this.changes
                  };
                  completed++;
                  if (completed === operations.length) {
                    db.run('COMMIT', (commitErr) => {
                      if (commitErr) {
                        reject(commitErr);
                      } else {
                        resolve(results);
                      }
                    });
                  }
                }
              });
            }
          });
        });
      });
    });
  }, {
    timeout,
    operationName,
    useCircuitBreaker: options.useCircuitBreaker !== false
  });
}

/**
 * Safe batch operations (multiple queries in sequence)
 */
async function dbBatchSafe(queries, options = {}) {
  const operationName = options.operationName || 'db.batch';
  const timeout = options.timeout || CONFIG.LONG_QUERY_TIMEOUT;
  
  return safeDbOperation(async () => {
    const db = await getDbSafe();
    
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        const results = [];
        let index = 0;
        
        function executeNext() {
          if (index >= queries.length) {
            resolve(results);
            return;
          }
          
          const { query, params = [] } = queries[index];
          
          if (query.toUpperCase().trim().startsWith('SELECT')) {
            db.all(query, params, (err, rows) => {
              if (err) {
                reject(err);
              } else {
                results.push(rows);
                index++;
                executeNext();
              }
            });
          } else {
            db.run(query, params, function(err) {
              if (err) {
                reject(err);
              } else {
                results.push({
                  lastID: this.lastID,
                  changes: this.changes
                });
                index++;
                executeNext();
              }
            });
          }
        }
        
        executeNext();
      });
    });
  }, {
    timeout,
    operationName,
    useCircuitBreaker: options.useCircuitBreaker !== false
  });
}

module.exports = {
  getDbSafe,
  dbGetSafe,
  dbAllSafe,
  dbRunSafe,
  dbTransactionSafe,
  dbBatchSafe
};

