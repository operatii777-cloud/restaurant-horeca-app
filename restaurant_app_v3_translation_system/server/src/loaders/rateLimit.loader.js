/**
 * PHASE E9.7 - Rate Limiting Loader
 * 
 * Configures global and route-specific rate limiting.
 */

const rateLimit = require('express-rate-limit');
const { getRateLimiter } = require('../middleware/rateLimiting.v2');

function loadRateLimiting(app) {
  // Global rate limiter - MĂRIT pentru development și production
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10000, // 10000 requests per window (mărit de la 1000)
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
  });
  
  app.use(globalLimiter);
  
  // Route-specific rate limiters will be applied in routes
  // using getRateLimiter() from rateLimiting.v2.js
  
  console.log('🚦 Rate limiting activated');
}

module.exports = { loadRateLimiting };

