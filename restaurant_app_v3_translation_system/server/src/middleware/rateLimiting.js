/**
 * ENTERPRISE MODULE
 * Phase: E4 - Rate Limiting Middleware
 * DO NOT DELETE – Replaces rate limiting middleware in server.js
 * 
 * Purpose: Rate limiting middleware (global + order-specific)
 * Created in PHASE E4
 * 
 * TODO PHASE E5: Move globalLimiter and orderLimiter from server.js
 */

const rateLimit = require('express-rate-limit');
const config = require('../config');

function registerRateLimiting(app) {
  // TODO PHASE E5: Move global rate limiting configs & mounts from server.js
  const globalLimiter = rateLimit({
    windowMs: config.constants.RATE_LIMIT_GLOBAL_WINDOW_MS,
    max: config.constants.RATE_LIMIT_GLOBAL_MAX,
    message: { error: 'Prea multe request-uri. Încercați din nou în 15 minute.' },
    standardHeaders: true,
    legacyHeaders: false
  });
  
  app.use(globalLimiter);

  // TODO PHASE E5: Move order-specific rate limiting from server.js
  const orderLimiter = rateLimit({
    windowMs: config.constants.RATE_LIMIT_ORDER_WINDOW_MS,
    max: config.constants.RATE_LIMIT_ORDER_MAX,
    message: { 
      error: 'Prea multe comenzi. Maxim 60 per minut.',
      retryAfter: 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      if (req.path.includes('/cancel')) {
        return true;
      }
      const ip = req.ip || '';
      return ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1';
    }
  });
  
  app.use('/api/orders', orderLimiter);
  
  return app;
}

module.exports = { registerRateLimiting };

