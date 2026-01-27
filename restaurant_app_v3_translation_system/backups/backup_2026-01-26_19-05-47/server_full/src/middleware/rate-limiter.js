/**
 * RATE LIMITING MIDDLEWARE
 * Protejează API-ul împotriva abuzurilor
 * Windows-style: clean, minimal, eficient
 */

const rateLimit = require('express-rate-limit');

// Rate limiter general (moderat)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 100, // 100 requests per window
  message: {
    success: false,
    error: 'Prea multe cereri. Te rugăm să încerci din nou mai târziu.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip pentru health checks
    return req.path === '/api/health';
  },
});

// Rate limiter strict pentru login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 5, // 5 încercări de login
  message: {
    success: false,
    error: 'Prea multe încercări de autentificare. Te rugăm să încerci din nou în 15 minute.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Nu numără request-urile reușite
});

// Rate limiter pentru API-uri critice
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minut
  max: 60, // 60 requests per minute
  message: {
    success: false,
    error: 'Prea multe cereri. Te rugăm să reduci frecvența.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  loginLimiter,
  apiLimiter,
};

