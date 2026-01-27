/**
 * PHASE S5.7 - Test App Factory (LIGHTWEIGHT)
 * Creates Express app instance for testing with ONLY the module being tested
 */

const express = require('express');
const path = require('path');

// Import loaders
const { loadErrorHandlers } = require('../../src/loaders');

/**
 * Create lightweight Express app for testing
 * IMPORTANT: Does NOT load mountAllModules - only loads the specific module being tested
 */
async function createTestApp() {
  // Suppress console logs during test app initialization
  const originalLog = console.log;
  const originalWarn = console.warn;
  
  if (process.env.NODE_ENV === 'test') {
    console.log = () => {};
    console.warn = () => {};
  }

  const app = express();

  try {
    // Essential middleware only (NO loadAll - that loads everything)
    app.set('trust proxy', 1);
    app.disable('x-powered-by');
    app.use(require('express').json());
    app.use(require('express').urlencoded({ extended: true }));

    // Wait for database to be ready (DB is initialized by jest.setup.js)
    // We just need to ensure dbPromise is resolved
    const { dbPromise } = require('../../database');
    try {
      await dbPromise;
    } catch (err) {
      // If DB fails, continue anyway (tests might use mocks)
      console.warn('⚠️ DB not ready, continuing with tests:', err.message);
    }

    // IMPORTANT: DO NOT call loadModules() or mountAllModules()
    // Instead, mount ONLY the module being tested in the test file itself

    // Load error handlers (must be last)
    loadErrorHandlers(app);

    // Restore console for test output
    if (process.env.NODE_ENV === 'test') {
      console.log = originalLog;
      console.warn = originalWarn;
    }

    return app;
  } catch (error) {
    // Restore console before error
    if (process.env.NODE_ENV === 'test') {
      console.log = originalLog;
      console.warn = originalWarn;
    }
    console.error('❌ Error initializing test app:', error);
    throw error;
  }
}

module.exports = { createTestApp };
