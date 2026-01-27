/**
 * ENTERPRISE MODULE
 * Phase: E9.2 - Routes Loader (Module Registry Autoloader)
 * DO NOT DELETE – Replaces route mounting in server.js
 * 
 * Purpose: Attaches all enterprise modules to the Express app via registry
 * Created in PHASE E3, Updated in PHASE E7, Refactored in PHASE E9.2
 */

const { mountAllModules } = require('../modules/modules.registry');

/**
 * Attach all enterprise routes to Express app via registry
 * @param {Express} app - Express application instance
 * @param {Object} deps - Dependencies (e.g., invalidateMenuCache, db)
 */
function attachRoutes(app, deps = {}) {
  // PHASE E9.2: All modules mounted automatically from registry
  mountAllModules(app, deps);
  
  return app;
}

module.exports = { attachRoutes };

