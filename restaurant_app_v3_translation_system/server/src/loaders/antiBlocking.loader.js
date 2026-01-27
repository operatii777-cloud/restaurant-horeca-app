/**
 * ANTI-BLOCKING LOADER
 * 
 * Inițializează sistemul de protecție anti-blocare:
 * - Health checks
 * - Circuit breakers
 * - Queue system
 * 
 * PHASE: E9.8 - Enterprise Protection System
 */

const { 
  healthChecker, 
  circuitBreakers,
  CONFIG 
} = require('../utils/anti-blocking');
const { dbPromise } = require('../../database');
const { logger } = require('../utils/logger');
const systemLogger = logger.child('ANTI-BLOCKING-LOADER');

/**
 * Register health checks
 */
function registerHealthChecks() {
  // Database health check
  healthChecker.register('database', async () => {
    try {
      const db = await dbPromise;
      return new Promise((resolve, reject) => {
        db.get('SELECT 1 as health', (err) => {
          if (err) {
            reject(err);
          } else {
            resolve({ message: 'Database connection healthy' });
          }
        });
      });
    } catch (error) {
      throw new Error(`Database health check failed: ${error.message}`);
    }
  });

  // API health check (basic)
  healthChecker.register('api', async () => {
    return { message: 'API endpoints available' };
  });

  systemLogger.info('Health checks registered');
}

/**
 * Initialize anti-blocking system
 */
function initializeAntiBlocking() {
  // Register health checks
  registerHealthChecks();

  // Start health checker
  healthChecker.start(CONFIG.HEALTH_CHECK_INTERVAL);

  // Setup circuit breaker state change handlers
  circuitBreakers.database.onStateChange = (name, state) => {
    systemLogger.warn(`[CircuitBreaker] ${name} state changed to ${state}`);
    
    // Dacă circuit breaker se deschide, încercăm să-l resetăm după un timp
    if (state === 'OPEN') {
      setTimeout(() => {
        systemLogger.info(`[CircuitBreaker] Attempting to reset ${name}`);
        circuitBreakers[name].reset();
      }, CONFIG.CIRCUIT_BREAKER_TIMEOUT * 2);
    }
  };

  systemLogger.info('Anti-blocking system initialized', {
    dbTimeout: CONFIG.DB_TIMEOUT,
    queryTimeout: CONFIG.QUERY_TIMEOUT,
    apiTimeout: CONFIG.API_TIMEOUT,
    maxRetries: CONFIG.MAX_RETRIES,
    healthCheckInterval: CONFIG.HEALTH_CHECK_INTERVAL
  });
}

/**
 * Get system status
 */
function getSystemStatus() {
  return {
    health: healthChecker.getStatus(),
    circuitBreakers: {
      database: {
        state: circuitBreakers.database.state,
        failureCount: circuitBreakers.database.failureCount
      },
      api: {
        state: circuitBreakers.api.state,
        failureCount: circuitBreakers.api.failureCount
      }
    },
    config: CONFIG
  };
}

module.exports = {
  initializeAntiBlocking,
  getSystemStatus,
  healthChecker,
  circuitBreakers
};

