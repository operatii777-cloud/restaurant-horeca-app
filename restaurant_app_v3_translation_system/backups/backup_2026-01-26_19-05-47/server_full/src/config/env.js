/**
 * ENTERPRISE MODULE
 * Phase: E2 - Environment Config Extraction
 * DO NOT DELETE – Replaces legacy config inside server.js
 * 
 * Purpose: Environment variables configuration
 * Extracted from server.js in PHASE E2
 */

module.exports = {
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'production',
  TZ: process.env.TZ || 'Europe/Bucharest',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [
    'http://localhost:3001',
    'http://localhost:5173',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:5173',
    'https://localhost:3001',
    'https://127.0.0.1:3001'
  ],
  DATABASE_PATH: process.env.DATABASE_PATH,
  ADMIN_VITE_DIST: process.env.ADMIN_VITE_DIST
};

