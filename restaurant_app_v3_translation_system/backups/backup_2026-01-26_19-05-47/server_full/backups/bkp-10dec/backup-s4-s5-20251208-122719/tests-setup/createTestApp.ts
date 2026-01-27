/**
 * PHASE S5.7 - Lightweight Test App Factory
 * Creates minimal Express app for testing (NO enterprise modules loaded)
 */

import express from 'express';
import bodyParser from 'body-parser';

/**
 * Create lightweight Express app for testing
 * IMPORTANT: Does NOT load mountAllModules or enterprise modules
 * Only loads essential middleware
 */
export function createTestApp() {
  const app = express();

  // Essential middleware only
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // Trust proxy
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  return app;
}

