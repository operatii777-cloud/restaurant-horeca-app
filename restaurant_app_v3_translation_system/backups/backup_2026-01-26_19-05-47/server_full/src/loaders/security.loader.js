/**
 * PHASE E9.7 - Security Loader
 * 
 * Configures Helmet, CORS, and other security middleware.
 */

const helmet = require('helmet');
const cors = require('cors');
const { sqlInjectionProtection } = require('../middleware/sql-injection.middleware');

function loadSecurity(app) {
  // Helmet - Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "cdn.jsdelivr.net", "unpkg.com"],
        scriptSrcAttr: ["'unsafe-inline'", "'unsafe-hashes'"], // Permite inline event handlers (onclick, etc.)
        styleSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "fonts.googleapis.com"],
        fontSrc: ["'self'", "fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "api.openai.com"],
        frameSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));
  
  // CORS - Security: Environment-based origin configuration
  const corsOptions = {
    origin: (origin, callback) => {
      // Permite request-uri fără origin (same-origin, file://, etc.)
      if (!origin) {
        return callback(null, true);
      }
      
      // Permite toate origin-urile în development
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      
      // Lista de origini permise în producție
      const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) || [
        'https://yourdomain.com',
        'https://www.yourdomain.com'
      ];
      
      // Permite localhost pentru development local chiar și în production mode
      const localhostPatterns = [
        'http://localhost',
        'http://127.0.0.1',
        'http://0.0.0.0'
      ];
      
      const isLocalhost = localhostPatterns.some(pattern => origin.startsWith(pattern));
      if (isLocalhost) {
        return callback(null, true);
      }
      
      // Verifică dacă origin-ul este în lista de origini permise
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`🚫 CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-location-id'],
    optionsSuccessStatus: 200
  };
  
  app.use(cors(corsOptions));
  
  // SQL Injection Protection - validates and sanitizes all inputs
  app.use(sqlInjectionProtection({
    logAttempts: true,
    blockOnDetection: true,
    sanitizeInputs: false, // Don't auto-sanitize to preserve JSON data
  }));
  
  console.log('🛡️ Security middleware loaded (Helmet + CORS + SQL Injection Protection)');
}

module.exports = { loadSecurity };

