/**
 * PHASE E9.7 - Express Loader
 * 
 * Configures Express app with basic settings.
 */

function loadExpress(app) {
  // Trust proxy (for Railway, Heroku, etc.)
  app.set('trust proxy', 1);
  
  // Disable x-powered-by header
  app.disable('x-powered-by');
  
  console.log('✅ Express configured');
}

module.exports = { loadExpress };

