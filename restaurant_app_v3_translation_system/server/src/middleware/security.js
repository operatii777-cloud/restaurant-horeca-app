/**
 * ENTERPRISE MODULE
 * Phase: E4 - Security Middleware Extraction
 * DO NOT DELETE – Replaces security middleware in server.js
 * 
 * Purpose: Responsible for helmet, compression, cors
 * Created in PHASE E4
 * 
 * TODO PHASE E5: Copy actual logic from server.js
 */

const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const config = require('../config');

function registerSecurityMiddleware(app) {
  // TODO PHASE E5: Move actual helmet configs from server.js
  // Helmet config with CSP, CORS policies, etc.
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net", "https://unpkg.com"],
        scriptSrcAttr: ["'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com", "data:"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "https://api.openai.com", "https://cdn.jsdelivr.net"],
        frameSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  // TODO PHASE E5: Move actual compression configs from server.js
  app.use(compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    level: config.constants.COMPRESSION_LEVEL
  }));

  // TODO PHASE E5: Move actual CORS config (allowedOrigins, credentials) from server.js
  app.use(cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      
      const isAllowed = config.env.ALLOWED_ORIGINS.some(allowed => {
        if (allowed.includes('*')) {
          const pattern = '^' + allowed.replace(/\*/g, '.*') + '$';
          return new RegExp(pattern).test(origin);
        }
        return allowed === origin;
      });
      
      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));

  return app;
}

module.exports = { registerSecurityMiddleware };

