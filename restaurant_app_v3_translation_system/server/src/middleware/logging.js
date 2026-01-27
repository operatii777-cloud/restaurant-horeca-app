/**
 * ENTERPRISE MODULE
 * Phase: E4 - Logging Middleware
 * DO NOT DELETE – Replaces logging middleware in server.js
 * 
 * Purpose: Logging middleware (morgan, winston)
 * Created in PHASE E4
 * 
 * TODO PHASE E5: Move morgan + winston middleware from server.js into this file
 */

const morgan = require('morgan');
const logger = require('../utils/logger'); // TODO: Confirm path after logger extraction

function registerLogging(app) {
  // TODO PHASE E5: Add morgan('combined', ...) from server.js
  app.use(morgan('combined', { stream: logger.stream }));
  
  // TODO PHASE E5: Add winston errorLogger from server.js
  app.use(logger.errorLogger);
  
  return app;
}

module.exports = { registerLogging };

