/**
 * ENTERPRISE MODULE
 * Phase: E4 - Middleware Aggregator
 * DO NOT DELETE – Main middleware entry point
 * 
 * Purpose: Middleware aggregator - exports all middleware functions
 * Created in PHASE E4
 */

module.exports = {
  registerSecurityMiddleware: require('./security').registerSecurityMiddleware,
  registerBodyParsers: require('./bodyParser').registerBodyParsers,
  registerRateLimiting: require('./rateLimiting').registerRateLimiting,
  registerLogging: require('./logging').registerLogging,
  registerErrorHandler: require('./errorHandler').registerErrorHandler,
  registerNotFoundHandler: require('./notFound').registerNotFoundHandler
};

