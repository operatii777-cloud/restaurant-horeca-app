/**
 * PHASE E9.7 - Error Handler Loader
 * 
 * Configures global error handlers.
 */

// PHASE PRODUCTION-READY: Use centralized error handler
const { errorHandler } = require('../utils/error-handler');
const { logger } = require('../utils/logger');
const errorLogger = logger.child('ERROR_HANDLER');

// Fallback to enterprise logger if exists
let enterpriseLogger = null;
try {
  enterpriseLogger = require('../utils/logger.enterprise');
} catch (e) {
  // enterpriseLogger not available, use centralized logger
}

function loadErrorHandlers(app) {
  // Global error handler (must be last)
  app.use((err, req, res, next) => {
    // Log error
    if (enterpriseLogger) {
      enterpriseLogger.logError(err, req);
    } else {
      errorLogger.error('Request error', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        statusCode: err.statusCode
      });
    }
    
    // Use centralized error handler
    errorHandler(err, req, res, next);
  });
  
  // NOTE: 404 handler is loaded separately after modules are mounted
  // See server.js - loadErrorHandlersAfterModules()
  
  console.log('🛡️ Error handlers loaded (404 handler loaded after modules)');
}

// Load 404 handler after modules are mounted
function load404Handler(app) {
  // 🚀 OPTIMIZARE: 404 handler îmbunătățit pentru resurse statice și API
  app.use((req, res) => {
    // Pentru resurse statice (JS, CSS, imagini), returnează 404 fără JSON
    // pentru a evita erorile în consolă
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/i)) {
      return res.status(404).send('Resource not found');
    }
    
    // Pentru API routes, returnează JSON
    if (req.path.startsWith('/api/')) {
      // Pentru endpoint-uri API lipsă, returnează răspuns consistent
      // pentru a evita erorile în frontend
      return res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        code: 'NOT_FOUND',
        path: req.path,
        message: 'The requested API endpoint does not exist'
      });
    }
    
    // Pentru alte rute, returnează JSON standard
    res.status(404).json({
      success: false,
      error: 'Route not found',
      code: 'NOT_FOUND',
      path: req.path
    });
  });
  
  console.log('🛡️ 404 handler loaded');
}

module.exports = { loadErrorHandlers, load404Handler };

