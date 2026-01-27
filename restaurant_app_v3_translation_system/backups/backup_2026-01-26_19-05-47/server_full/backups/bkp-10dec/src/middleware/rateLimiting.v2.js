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

  // Strict - Admin endpoints
  admin: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
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

  // Semi-strict - Kiosk endpoints
  kiosk: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    message: 'Too many kiosk requests, please slow down.',
    standardHeaders: true,
    legacyHeaders: false
  },

  // Medium - Orders endpoints
  orders: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 orders per minute
    message: 'Too many order requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
  },

  // Default - Other endpoints
  default: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requests per window
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

