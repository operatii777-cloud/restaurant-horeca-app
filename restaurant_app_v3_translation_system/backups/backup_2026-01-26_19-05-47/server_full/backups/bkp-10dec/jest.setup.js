/**
 * PHASE S5.7 - Jest Setup
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.TZ = 'Europe/Bucharest';
process.env.DISABLE_PDF = '1'; // Disable PDF engine in tests

// Use in-memory database for faster tests
process.env.DB_PATH = process.env.DB_PATH || ':memory:';

// Increase timeout for async operations (DB initialization can take time)
jest.setTimeout(60000);
