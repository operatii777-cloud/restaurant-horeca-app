/**
 * ENTERPRISE MODULE
 * Phase: E2 - Database Config Extraction
 * DO NOT DELETE – Replaces legacy config inside server.js
 * 
 * Purpose: Database configuration and connection setup
 * Extracted from server.js in PHASE E2
 * 
 * TODO E3: Move actual database initialization logic here
 */

const path = require('path');
const env = require('./env');
const constants = require('./constants');

module.exports = {
  // Database file path
  DATABASE_PATH: env.DATABASE_PATH || path.join(__dirname, '..', '..', 'db.sqlite'),
  
  // Database connection options
  // TODO E3: Extract sqlite3.Database.OPEN_* flags and options
  // TODO E3: Extract retry logic and fallback mechanisms
  
  // Default tenant
  DEFAULT_TENANT_ID: constants.DEFAULT_TENANT_ID
};

