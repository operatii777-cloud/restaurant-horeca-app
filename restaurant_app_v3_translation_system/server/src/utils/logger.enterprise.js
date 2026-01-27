/**
 * PHASE E9.6 - Enterprise Logging System
 * 
 * Structured logging for:
 * - Console output
 * - File logging
 * - Structured logs for BI
 */

const fs = require('fs');
const path = require('path');

const LOGS_DIR = path.join(__dirname, '../../logs');
const ENTERPRISE_LOGS_DIR = path.join(LOGS_DIR, 'enterprise');

// Ensure logs directory exists
if (!fs.existsSync(ENTERPRISE_LOGS_DIR)) {
  fs.mkdirSync(ENTERPRISE_LOGS_DIR, { recursive: true });
}

/**
 * Log levels
 */
const LogLevel = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

/**
 * Enterprise Logger
 */
class EnterpriseLogger {
  constructor() {
    this.logFile = path.join(ENTERPRISE_LOGS_DIR, `app-${new Date().toISOString().split('T')[0]}.log`);
    this.errorFile = path.join(ENTERPRISE_LOGS_DIR, `errors-${new Date().toISOString().split('T')[0]}.log`);
  }

  /**
   * Write log to file
   */
  writeToFile(file, message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    
    try {
      fs.appendFileSync(file, logEntry, 'utf8');
    } catch (err) {
      console.error('Failed to write log file:', err.message);
    }
  }

  /**
   * Format structured log
   */
  formatStructuredLog(level, message, metadata = {}) {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...metadata
    };
  }

  /**
   * Log error
   */
  error(message, metadata = {}) {
    const log = this.formatStructuredLog(LogLevel.ERROR, message, metadata);
    console.error(`❌ [${LogLevel.ERROR}]`, message, metadata);
    this.writeToFile(this.errorFile, JSON.stringify(log));
  }

  /**
   * Log warning
   */
  warn(message, metadata = {}) {
    const log = this.formatStructuredLog(LogLevel.WARN, message, metadata);
    console.warn(`⚠️  [${LogLevel.WARN}]`, message, metadata);
    this.writeToFile(this.logFile, JSON.stringify(log));
  }

  /**
   * Log info
   */
  info(message, metadata = {}) {
    const log = this.formatStructuredLog(LogLevel.INFO, message, metadata);
    console.log(`ℹ️  [${LogLevel.INFO}]`, message, metadata);
    this.writeToFile(this.logFile, JSON.stringify(log));
  }

  /**
   * Log debug
   */
  debug(message, metadata = {}) {
    if (process.env.NODE_ENV === 'development') {
      const log = this.formatStructuredLog(LogLevel.DEBUG, message, metadata);
      console.debug(`🔍 [${LogLevel.DEBUG}]`, message, metadata);
      this.writeToFile(this.logFile, JSON.stringify(log));
    }
  }

  /**
   * Log API request
   */
  logRequest(req, res, responseTime) {
    const log = this.formatStructuredLog(LogLevel.INFO, 'API Request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
    
    this.writeToFile(this.logFile, JSON.stringify(log));
  }

  /**
   * Log API error
   */
  logError(error, req) {
    const log = this.formatStructuredLog(LogLevel.ERROR, 'API Error', {
      code: error.code || 'UNKNOWN',
      message: error.message,
      path: req.path,
      method: req.method,
      stack: error.stack
    });
    
    this.writeToFile(this.errorFile, JSON.stringify(log));
  }
}

// Export singleton instance
const logger = new EnterpriseLogger();
module.exports = logger;

