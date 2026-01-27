/**
 * ENTERPRISE MODULE
 * Phase: E3 - Express Loader
 * DO NOT DELETE – Replaces Express initialization in server.js
 * 
 * Purpose: Creates and configures an Express instance
 * Created in PHASE E3
 * 
 * TODO PHASE E4: Move middleware from server.js into this loader
 * TODO PHASE E5+: Attach routes via attachRoutes(app)
 */

const express = require('express');

function createExpressApp() {
  const app = express();
  
  // TODO PHASE E4: security middleware (helmet, cors, compression)
  // TODO PHASE E4: body parsers (express.json, express.urlencoded)
  // TODO PHASE E4: rate limiting (global + order-specific)
  // TODO PHASE E4: logging middleware (morgan + winston)
  // TODO PHASE E4: static file serving
  // TODO PHASE E5+: attachRoutes(app)
  
  return app;
}

module.exports = { createExpressApp };

