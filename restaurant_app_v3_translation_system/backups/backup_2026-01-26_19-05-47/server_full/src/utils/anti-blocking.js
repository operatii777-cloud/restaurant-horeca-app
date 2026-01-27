/**
 * ANTI-BLOCKING SYSTEM
 * 
 * Sistem complet de protecție împotriva blocărilor:
 * - Timeout automat pentru toate operațiunile
 * - Retry cu exponential backoff
 * - Circuit breaker pattern
 * - Health check automat
 * - Queue system pentru operațiuni critice
 * 
 * PHASE: E9.8 - Enterprise Protection System
 */

const { logger } = require('./logger');
const systemLogger = logger.child('ANTI-BLOCKING');

// ========================================
// CONFIGURARE
// ========================================
const CONFIG = {
  // Timeout-uri (ms)
  DB_TIMEOUT: 5000,              // Timeout pentru conexiune DB
  QUERY_TIMEOUT: 10000,          // Timeout pentru query-uri normale
  LONG_QUERY_TIMEOUT: 30000,     // Timeout pentru query-uri lungi (reports)
  API_TIMEOUT: 15000,            // Timeout pentru rute API
  
  // Retry
  MAX_RETRIES: 3,                // Număr maxim de retry-uri
  RETRY_DELAY_BASE: 100,         // Delay inițial (ms)
  RETRY_DELAY_MAX: 5000,         // Delay maxim (ms)
  
  // Circuit Breaker
  CIRCUIT_BREAKER_THRESHOLD: 5,  // Număr de erori înainte de deschidere
  CIRCUIT_BREAKER_TIMEOUT: 30000, // Timp până la încercare de închidere (ms)
  
  // Health Check
  HEALTH_CHECK_INTERVAL: 10000,  // Interval verificare sănătate (ms)
  HEALTH_CHECK_TIMEOUT: 2000,    // Timeout pentru health check (ms)
};

// ========================================
// CIRCUIT BREAKER
// ========================================
class CircuitBreaker {
  constructor(name, options = {}) {
    this.name = name;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.threshold = options.threshold || CONFIG.CIRCUIT_BREAKER_THRESHOLD;
    this.timeout = options.timeout || CONFIG.CIRCUIT_BREAKER_TIMEOUT;
    this.onStateChange = options.onStateChange || (() => {});
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      // Verifică dacă trebuie să treacă în HALF_OPEN
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
        this.onStateChange(this.name, 'HALF_OPEN');
        systemLogger.info(`[CircuitBreaker] ${this.name} → HALF_OPEN (testing)`);
      } else {
        throw new Error(`Circuit breaker ${this.name} is OPEN`);
      }
    }

    try {
      const result = await fn();
      // Succes - resetează circuit breaker
      if (this.state === 'HALF_OPEN') {
        this.state = 'CLOSED';
        this.failureCount = 0;
        this.onStateChange(this.name, 'CLOSED');
        systemLogger.info(`[CircuitBreaker] ${this.name} → CLOSED (recovered)`);
      } else {
        this.failureCount = 0;
      }
      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      if (this.failureCount >= this.threshold) {
        this.state = 'OPEN';
        this.onStateChange(this.name, 'OPEN');
        systemLogger.error(`[CircuitBreaker] ${this.name} → OPEN (${this.failureCount} failures)`);
      }

      throw error;
    }
  }

  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.onStateChange(this.name, 'CLOSED');
    systemLogger.info(`[CircuitBreaker] ${this.name} → RESET`);
  }
}

// Circuit breakers globale
const circuitBreakers = {
  database: new CircuitBreaker('database', {
    threshold: CONFIG.CIRCUIT_BREAKER_THRESHOLD,
    timeout: CONFIG.CIRCUIT_BREAKER_TIMEOUT,
    onStateChange: (name, state) => {
      systemLogger.warn(`[CircuitBreaker] ${name} state changed to ${state}`);
    }
  }),
  api: new CircuitBreaker('api', {
    threshold: CONFIG.CIRCUIT_BREAKER_THRESHOLD,
    timeout: CONFIG.CIRCUIT_BREAKER_TIMEOUT
  })
};

// ========================================
// RETRY CU EXPONENTIAL BACKOFF
// ========================================
async function withRetry(fn, options = {}) {
  const maxRetries = options.maxRetries || CONFIG.MAX_RETRIES;
  const baseDelay = options.baseDelay || CONFIG.RETRY_DELAY_BASE;
  const maxDelay = options.maxDelay || CONFIG.RETRY_DELAY_MAX;
  const shouldRetry = options.shouldRetry || ((error) => {
    // Retry pentru erori de conexiune sau timeout
    return error.message.includes('timeout') ||
           error.message.includes('ECONNREFUSED') ||
           error.message.includes('ETIMEDOUT') ||
           error.message.includes('SQLITE_BUSY') ||
           error.message.includes('database is locked');
  });

  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Nu retry dacă nu este o eroare retry-able
      if (!shouldRetry(error)) {
        throw error;
      }

      // Nu retry dacă am atins limita
      if (attempt >= maxRetries) {
        break;
      }

      // Calculează delay cu exponential backoff
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      const jitter = Math.random() * 100; // Jitter pentru a evita thundering herd
      const totalDelay = delay + jitter;

      systemLogger.warn(`[Retry] Attempt ${attempt + 1}/${maxRetries + 1} failed, retrying in ${Math.round(totalDelay)}ms`, {
        error: error.message,
        attempt: attempt + 1
      });

      await new Promise(resolve => setTimeout(resolve, totalDelay));
    }
  }

  throw lastError;
}

// ========================================
// TIMEOUT WRAPPER
// ========================================
function withTimeout(promise, timeoutMs, operationName = 'operation') {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Timeout: ${operationName} exceeded ${timeoutMs}ms`));
      }, timeoutMs);
    })
  ]);
}

// ========================================
// DATABASE OPERATIONS PROTECTION
// ========================================
async function safeDbOperation(operation, options = {}) {
  const timeout = options.timeout || CONFIG.QUERY_TIMEOUT;
  const operationName = options.operationName || 'database operation';
  const useCircuitBreaker = options.useCircuitBreaker !== false;

  const executeOperation = async () => {
    try {
      return await withTimeout(
        operation(),
        timeout,
        operationName
      );
    } catch (error) {
      systemLogger.error(`[SafeDB] ${operationName} failed`, {
        error: error.message,
        timeout
      });
      throw error;
    }
  };

  if (useCircuitBreaker) {
    return circuitBreakers.database.execute(executeOperation);
  } else {
    return executeOperation();
  }
}

// ========================================
// API ROUTE PROTECTION
// ========================================
function asyncHandler(fn) {
  return async (req, res, next) => {
    try {
      // Timeout pentru întreaga rută
      await withTimeout(
        Promise.resolve(fn(req, res, next)),
        CONFIG.API_TIMEOUT,
        `API route ${req.method} ${req.path}`
      );
    } catch (error) {
      // Nu trimite răspuns dacă deja a fost trimis
      if (res.headersSent) {
        systemLogger.error(`[AsyncHandler] Response already sent for ${req.method} ${req.path}`, {
          error: error.message
        });
        return;
      }

      systemLogger.error(`[AsyncHandler] Error in ${req.method} ${req.path}`, {
        error: error.message,
        stack: error.stack
      });

      // Trimite răspuns de eroare
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Internal server error';

      res.status(statusCode).json({
        success: false,
        error: {
          message,
          code: error.code || 'INTERNAL_ERROR',
          ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        }
      });
    }
  };
}

// ========================================
// HEALTH CHECK SYSTEM
// ========================================
class HealthChecker {
  constructor() {
    this.checks = new Map();
    this.interval = null;
    this.status = {
      database: 'unknown',
      api: 'unknown',
      lastCheck: null
    };
  }

  register(name, checkFn) {
    this.checks.set(name, checkFn);
  }

  async check(name) {
    const checkFn = this.checks.get(name);
    if (!checkFn) {
      return { status: 'unknown', error: 'Check not registered' };
    }

    try {
      const result = await withTimeout(
        Promise.resolve(checkFn()),
        CONFIG.HEALTH_CHECK_TIMEOUT,
        `Health check ${name}`
      );
      return { status: 'healthy', ...result };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  async checkAll() {
    const results = {};
    for (const [name] of this.checks) {
      results[name] = await this.check(name);
    }
    this.status = { ...results, lastCheck: new Date().toISOString() };
    return this.status;
  }

  start(interval = CONFIG.HEALTH_CHECK_INTERVAL) {
    if (this.interval) {
      this.stop();
    }

    this.interval = setInterval(async () => {
      try {
        await this.checkAll();
        systemLogger.debug('[HealthCheck] All systems operational');
      } catch (error) {
        systemLogger.error('[HealthCheck] Health check failed', { error: error.message });
      }
    }, interval);

    systemLogger.info(`[HealthCheck] Started with interval ${interval}ms`);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      systemLogger.info('[HealthCheck] Stopped');
    }
  }

  getStatus() {
    return this.status;
  }
}

const healthChecker = new HealthChecker();

// ========================================
// QUEUE SYSTEM PENTRU OPERAȚIUNI CRITICE
// ========================================
class OperationQueue {
  constructor(options = {}) {
    this.queue = [];
    this.processing = false;
    this.maxConcurrency = options.maxConcurrency || 1;
    this.activeOperations = 0;
  }

  async add(operation, priority = 0) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        operation,
        priority,
        resolve,
        reject,
        addedAt: Date.now()
      });

      // Sortează după prioritate (mai mare = mai prioritar)
      this.queue.sort((a, b) => b.priority - a.priority);

      this.process();
    });
  }

  async process() {
    if (this.processing || this.activeOperations >= this.maxConcurrency) {
      return;
    }

    if (this.queue.length === 0) {
      return;
    }

    this.processing = true;
    const item = this.queue.shift();
    this.activeOperations++;

    try {
      const result = await item.operation();
      item.resolve(result);
    } catch (error) {
      item.reject(error);
    } finally {
      this.activeOperations--;
      this.processing = false;
      // Continuă procesarea
      setImmediate(() => this.process());
    }
  }

  getStats() {
    return {
      queueLength: this.queue.length,
      activeOperations: this.activeOperations,
      maxConcurrency: this.maxConcurrency
    };
  }
}

const operationQueue = new OperationQueue({ maxConcurrency: 3 });

// ========================================
// EXPORTS
// ========================================
module.exports = {
  // Config
  CONFIG,
  
  // Core functions
  withRetry,
  withTimeout,
  safeDbOperation,
  asyncHandler,
  
  // Circuit Breaker
  CircuitBreaker,
  circuitBreakers,
  
  // Health Check
  healthChecker,
  
  // Queue
  operationQueue,
  
  // Utilities
  createSafeOperation: (operation, options) => {
    return async (...args) => {
      return safeDbOperation(
        () => operation(...args),
        options
      );
    };
  }
};

