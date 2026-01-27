/**
 * PHASE E9.7 - Express Loader
 * 
 * Configures Express app with basic settings.
 */

const performanceMiddleware = require('../middleware/performance.middleware');

function loadExpress(app) {
  // Performance monitoring (doar în development sau pentru request-uri lente)
  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_PERF_MONITORING === 'true') {
    app.use(performanceMiddleware);
  }
  
  // Trust proxy (for Railway, Heroku, etc.)
  app.set('trust proxy', 1);
  
  // Disable x-powered-by header
  app.disable('x-powered-by');
  
  // UTF-8 middleware DOAR pentru răspunsuri JSON (NU pentru toate răspunsurile)
  app.use((req, res, next) => {
    // Salvează metoda originală setHeader
    const originalSetHeader = res.setHeader;
    res.setHeader = function(name, value) {
      // Dacă header-ul Content-Type este deja setat, nu-l suprascrie
      if (name === 'Content-Type' && this.getHeader('Content-Type')) {
        return this;
      }
      // Pentru răspunsuri JSON, adaugă charset=utf-8
      if (name === 'Content-Type' && value === 'application/json') {
        value = 'application/json; charset=utf-8';
      }
      return originalSetHeader.call(this, name, value);
    };
    next();
  });
  
  console.log('✅ Express configured with UTF-8 support');
}

module.exports = { loadExpress };

