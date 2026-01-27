/**
 * PHASE E9.7 - Master Loader
 * 
 * Exports all loaders for easy import.
 */

const { loadExpress } = require('./express.loader');
const { loadSecurity } = require('./security.loader');
const { loadBodyParser } = require('./bodyParser.loader');
const { loadCompression } = require('./compression.loader');
const { loadRateLimiting } = require('./rateLimit.loader');
const { loadLogging } = require('./logging.loader');
const { loadErrorHandlers } = require('./errorHandler.loader');
const { loadStaticFiles } = require('./staticFiles.loader');
const { loadModules } = require('./modules.loader');
const { loadTenantMiddleware } = require('./tenant.loader');

/**
 * Load all middleware and configurations
 */
function loadAll(app) {
  // Core Express setup
  loadExpress(app);
  
  // Security
  loadSecurity(app);
  
  // Body parsing
  loadBodyParser(app);
  
  // Compression
  loadCompression(app);
  
  // Rate limiting
  loadRateLimiting(app);
  
  // Logging
  loadLogging(app);
  
  // Tenant middleware (MUST be after bodyParser, before routes)
  loadTenantMiddleware(app);
  
  // Static files
  loadStaticFiles(app);
  
  // Modules (async - must be called separately)
  // loadModules(app) - called separately in server.js after dbPromise resolves
}

const { load404Handler } = require('./errorHandler.loader');

module.exports = {
  loadExpress,
  loadSecurity,
  loadBodyParser,
  loadCompression,
  loadRateLimiting,
  loadLogging,
  loadErrorHandlers,
  load404Handler,
  loadStaticFiles,
  loadModules,
  loadTenantMiddleware,
  loadAll
};
