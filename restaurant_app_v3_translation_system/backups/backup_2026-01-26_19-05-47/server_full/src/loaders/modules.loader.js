/**
 * PHASE E9.7 - Modules Loader
 * 
 * Autoloads all enterprise modules from registry.
 */

const { mountAllModules } = require('../modules/modules.registry');
const { dbPromise } = require('../../database');

// Get invalidateMenuCache if available
let invalidateMenuCache = null;
try {
  const menuCache = require('../../utils/menuCache');
  invalidateMenuCache = menuCache.invalidateMenuCache;
} catch (err) {
  // menuCache not available, skip
}

async function loadModules(app) {
  // Wait for database to be ready
  const db = await dbPromise;
  
  // Mount all modules with dependencies
  mountAllModules(app, {
    db,
    invalidateMenuCache
  });
  
  // Only log in non-test mode
  if (process.env.NODE_ENV !== 'test') {
    console.log('✅ All enterprise modules loaded from registry');
  }
}

module.exports = { loadModules };

