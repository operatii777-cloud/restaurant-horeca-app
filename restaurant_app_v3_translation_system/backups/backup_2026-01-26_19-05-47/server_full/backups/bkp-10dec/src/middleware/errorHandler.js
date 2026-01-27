/**
 * ENTERPRISE MODULE
 * Phase: E4 - Global Error Handler
 * DO NOT DELETE – Replaces error handling logic in server.js
 * 
 * Purpose: Global error handlers (unhandledRejection, uncaughtException)
 * Created in PHASE E4
 * 
 * TODO PHASE E5: Move the error-handling logic from server.js
 */

function registerErrorHandler(app) {
  // TODO PHASE E5: Move process.on('unhandledRejection') from server.js
  // TODO PHASE E5: Move process.on('uncaughtException') from server.js
  // TODO PHASE E5: Move process.on('warning') from server.js
  
  // Global error handler for Express routes
  app.use((err, req, res, next) => {
    // TODO PHASE E5: Move error handler logic from server.js
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    
    res.status(status).json({
      error: message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  });
  
  return app;
}

module.exports = { registerErrorHandler };

