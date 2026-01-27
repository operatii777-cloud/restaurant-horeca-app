/**
 * PHASE E9.7 - Error Handler Loader
 * 
 * Configures global error handlers.
 */

const { errorHandler } = require('../utils/errors');
const enterpriseLogger = require('../utils/logger.enterprise');

function loadErrorHandlers(app) {
  // Global error handler (must be last)
  app.use((err, req, res, next) => {
    // Log error
    enterpriseLogger.logError(err, req);
    
    // Use enterprise error handler
    errorHandler(err, req, res, next);
  });
  
  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: 'Route not found',
      code: 'NOT_FOUND',
      path: req.path
    });
  });
  
  console.log('🛡️ Error handlers loaded');
}

module.exports = { loadErrorHandlers };

