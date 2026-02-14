/**
 * Database Constants
 * 
 * Centralized database configuration to avoid hardcoded paths throughout the application.
 * This file provides a single source of truth for database-related constants.
 */

const path = require('path');

// Main database path - always relative to server directory
const DB_PATH = path.join(__dirname, '..', 'restaurant.db');

// Database file name (useful for logging and debugging)
const DB_FILE_NAME = 'restaurant.db';

// Connection timeout (milliseconds)
const DB_BUSY_TIMEOUT = 10000; // 10 seconds

// WAL mode configuration (Write-Ahead Logging for better concurrency)
const DB_JOURNAL_MODE = 'WAL';

// Cache size in KB (negative value means KB, positive means pages)
const DB_CACHE_SIZE = -64000; // 64MB

module.exports = {
  DB_PATH,
  DB_FILE_NAME,
  DB_BUSY_TIMEOUT,
  DB_JOURNAL_MODE,
  DB_CACHE_SIZE
};
