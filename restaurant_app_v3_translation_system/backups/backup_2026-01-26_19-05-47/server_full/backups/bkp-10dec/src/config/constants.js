/**
 * ENTERPRISE MODULE
 * Phase: E2 - Constants Extraction
 * DO NOT DELETE – Replaces legacy constants inside server.js
 * 
 * Purpose: Application constants and hardcoded values
 * Extracted from server.js in PHASE E2
 */

module.exports = {
  // PIN Rotation constants
  PIN_ROTATION_INTERVAL_DAYS: 30,
  PIN_ROTATION_WARNING_DAYS: 5,
  DAY_IN_MS: 24 * 60 * 60 * 1000,
  
  // Cache constants
  CACHE_LIFETIME: 300000, // 5 minutes in milliseconds
  
  // Connection limits
  MAX_CONNECTIONS: 60, // Maximum simultaneous connections
  
  // Rate limiting defaults
  RATE_LIMIT_GLOBAL_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_GLOBAL_MAX: 1000, // Max 1000 requests per 15 min per IP
  RATE_LIMIT_ORDER_WINDOW_MS: 60 * 1000, // 1 minute
  RATE_LIMIT_ORDER_MAX: 60, // Max 60 orders per minute per client
  
  // Body parser limits
  BODY_PARSER_LIMIT: '10mb',
  
  // Compression level
  COMPRESSION_LEVEL: 6, // 0-9, 6 = default balanced
  
  // Default tenant
  DEFAULT_TENANT_ID: 1,
  
  // Queue settings
  QUEUE_MAX_RETRIES: 3,
  QUEUE_PROCESS_INTERVAL: 50, // Process every 50ms
  QUEUE_MAX_SIZE: 1000,
  
  // Cache control
  CACHE_CONTROL_STATIC: 'public, max-age=86400', // 24 hours
  CACHE_CONTROL_DYNAMIC: 'no-cache'
};

