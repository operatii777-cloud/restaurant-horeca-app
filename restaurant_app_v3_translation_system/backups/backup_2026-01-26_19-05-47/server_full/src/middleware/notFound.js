/**
 * ENTERPRISE MODULE
 * Phase: E4 - 404 Handler
 * DO NOT DELETE – Replaces 404 handler in server.js
 * 
 * Purpose: 404 Not Found handler
 * Created in PHASE E4
 * 
 * TODO PHASE E5: Implement 404 JSON response from server.js
 */

function registerNotFoundHandler(app) {
  // TODO PHASE E5: Move 404 handler from server.js
  app.use((req, res) => {
    return res.status(404).json({ error: 'Route not found' });
  });
  
  return app;
}

module.exports = { registerNotFoundHandler };

