/**
 * PHASE E9.4 - Rate Limiting v2 (Uniform)
 * 
 * Enterprise-grade rate limiting per route category.
 * Different limits for different endpoint types.
 */

const rateLimit = require('express-rate-limit');

/**
 * Rate limit configurations per category
 */
const rateLimitConfigs = {
  // Strict - Auth endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
  },

  // Strict - Admin endpoints - MĂRIT pentru admin-vite (multe request-uri la încărcare)
  admin: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5000, // 5000 requests per window (mărit de la 100)
    message: 'Too many admin requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
  },

  // Strict - Stocks endpoints
  stocks: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 requests per window
    message: 'Too many stock requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
  },

  // Semi-strict - Kiosk endpoints - MĂRIT pentru development
  kiosk: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 300, // 300 requests per minute (mărit de la 60)
    message: 'Too many kiosk requests, please slow down.',
    standardHeaders: true,
    legacyHeaders: false
  },

  // Medium - Orders endpoints - MĂRIT pentru development
  orders: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 200, // 200 orders per minute (mărit de la 30)
    message: 'Too many order requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
  },

  // Default - Other endpoints - MĂRIT pentru development
  default: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10000, // 10000 requests per window (mărit de la 1000)
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
  }
};

/**
 * Create rate limiter for specific category
 */
function createRateLimiter(category = 'default') {
  const config = rateLimitConfigs[category] || rateLimitConfigs.default;
  return rateLimit(config);
}

/**
 * Route-specific rate limiters
 */
const rateLimiters = {
  auth: createRateLimiter('auth'),
  admin: createRateLimiter('admin'),
  stocks: createRateLimiter('stocks'),
  kiosk: createRateLimiter('kiosk'),
  orders: createRateLimiter('orders'),
  default: createRateLimiter('default')
};

/**
 * Get rate limiter for route
 */
function getRateLimiter(route) {
  if (route.startsWith('/api/auth')) {
    return rateLimiters.auth;
  }
  if (route.startsWith('/api/admin')) {
    return rateLimiters.admin;
  }
  if (route.startsWith('/api/stocks')) {
    return rateLimiters.stocks;
  }
  if (route.startsWith('/api/kiosk') || route.startsWith('/api/pos')) {
    return rateLimiters.kiosk;
  }
  if (route.startsWith('/api/orders')) {
    return rateLimiters.orders;
  }
  return rateLimiters.default;
}

module.exports = {
  rateLimiters,
  getRateLimiter,
  createRateLimiter
};

