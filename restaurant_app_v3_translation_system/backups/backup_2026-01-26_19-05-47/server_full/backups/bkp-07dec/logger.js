/**
 * Winston Logger Configuration
 * Professional logging system with rotation and levels
 */

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for console output (colored)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = '';
    if (Object.keys(meta).length > 0) {
      metaStr = '\n' + JSON.stringify(meta, null, 2);
    }
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

// Custom format for file output (JSON)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Transport: Console (development)
const consoleTransport = new winston.transports.Console({
  format: consoleFormat,
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
});

// Transport: Error logs (daily rotation)
const errorFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  format: fileFormat,
  maxSize: '20m', // Max 20MB per file
  maxFiles: '30d', // Keep 30 days
  zippedArchive: true // Compress old logs
});

// Transport: Combined logs (daily rotation)
const combinedFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  format: fileFormat,
  maxSize: '20m',
  maxFiles: '14d', // Keep 14 days
  zippedArchive: true
});

// Transport: HTTP logs (access logs)
const httpFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'http-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'http',
  format: fileFormat,
  maxSize: '20m',
  maxFiles: '7d', // Keep 7 days
  zippedArchive: true
});

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: fileFormat,
  defaultMeta: { service: 'restaurant-app' },
  transports: [
    consoleTransport,
    errorFileTransport,
    combinedFileTransport,
    httpFileTransport
  ],
  // Handle exceptions and rejections
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(logsDir, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      zippedArchive: true
    })
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(logsDir, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      zippedArchive: true
    })
  ]
});

// Log startup message
logger.info('🚀 Winston logger initialized successfully', {
  environment: process.env.NODE_ENV || 'development',
  logLevel: logger.level,
  logsDirectory: logsDir
});

// Export wrapper object instead of logger directly to prevent infinite loops
module.exports = {
  // Core Winston logger methods
  debug: (...args) => logger.debug(...args),
  info: (...args) => logger.info(...args),
  warn: (...args) => logger.warn(...args),
  error: (...args) => logger.error(...args),
  http: (...args) => logger.http(...args),
  
  // Properties
  level: logger.level,
  levels: logger.levels,
  
  // Helper: HTTP request logger middleware
  httpLogger: (req, res, next) => {
    const startTime = Date.now();
    
    // Log response when finished
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const logData = {
        method: req.method,
        url: req.originalUrl || req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent')
      };
      
      // Log level based on status code
      if (res.statusCode >= 500) {
        logger.error('HTTP Request', logData);
      } else if (res.statusCode >= 400) {
        logger.warn('HTTP Request', logData);
      } else {
        logger.http('HTTP Request', logData);
      }
    });
    
    next();
  },
  
  // Helper: Error logger middleware
  errorLogger: (err, req, res, next) => {
    logger.error('Application Error', {
      message: err.message,
      stack: err.stack,
      method: req.method,
      url: req.originalUrl || req.url,
      ip: req.ip,
      statusCode: err.statusCode || 500
    });
    
    next(err);
  },
  
  // Helper: Stream for Morgan (HTTP logger)
  stream: {
    write: (message) => {
      logger.http(message.trim());
    }
  }
};

