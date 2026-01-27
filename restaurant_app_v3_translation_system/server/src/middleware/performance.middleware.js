/**
 * PERFORMANCE MIDDLEWARE
 * Măsoară timpul de răspuns pentru endpoint-uri
 * Windows-style: clean, minimal, eficient
 */

const { logger } = require('../utils/logger');

function performanceMiddleware(req, res, next) {
  const startTime = Date.now();
  const log = logger.child('PERF');

  // Override res.end pentru a măsura timpul
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - startTime;
    
    // Log doar pentru request-uri lente (>500ms) sau în development
    if (duration > 500 || process.env.NODE_ENV !== 'production') {
      log.debug(`${req.method} ${req.path}`, {
        duration: `${duration}ms`,
        status: res.statusCode,
      });
    }
    
    // Log erori lente
    if (res.statusCode >= 400 && duration > 1000) {
      log.warn(`Slow error response: ${req.method} ${req.path}`, {
        duration: `${duration}ms`,
        status: res.statusCode,
      });
    }
    
    originalEnd.apply(res, args);
  };

  next();
}

module.exports = performanceMiddleware;

