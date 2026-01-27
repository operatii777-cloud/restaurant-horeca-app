// Database Connection Manager
// Purpose: Centralized database connection and query management
// Created: 21 Oct 2025, 21:00
// Part of: BATCH #2 - Backend Architecture

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

/**
 * Database Connection Manager
 * Singleton pattern for database connections
 * Provides promisified methods for all DB operations
 */
class Database {
    constructor() {
        this.db = null;
        this.isConnected = false;
    }

    /**
     * Connect to database
     * @returns {Promise<void>}
     */
    async connect() {
        if (this.isConnected) {
            console.log('⚠️  Database already connected');
            return;
        }

        return new Promise((resolve, reject) => {
            // Use the MAIN app database (restaurant.db, not database.db!)
            const dbPath = path.join(__dirname, '../../../server/restaurant.db');
            console.log('🔍 Attempting to connect to:', dbPath);
            
            this.db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('❌ Database connection failed:', err.message);
                    reject(err);
                } else {
                    this.isConnected = true;
                    console.log('✅ Database connected:', dbPath);
                    
                    // Enable foreign keys
                    this.db.run('PRAGMA foreign_keys = ON');
                    
                    resolve();
                }
            });
        });
    }

    /**
     * Run a SQL command (INSERT, UPDATE, DELETE)
     * @param {string} sql - SQL query
     * @param {Array} params - Query parameters
     * @returns {Promise<{id: number, changes: number}>}
     */
    async run(sql, params = []) {
        if (!this.isConnected) {
            throw new Error('Database not connected. Call connect() first.');
        }

        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    console.error('❌ Query failed:', sql);
                    console.error('   Error:', err.message);
                    reject(err);
                } else {
                    resolve({
                        id: this.lastID,
                        changes: this.changes
                    });
                }
            });
        });
    }

    /**
     * Get a single row
     * @param {string} sql - SQL query
     * @param {Array} params - Query parameters
     * @returns {Promise<Object|undefined>}
     */
    async get(sql, params = []) {
        if (!this.isConnected) {
            throw new Error('Database not connected. Call connect() first.');
        }

        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    console.error('❌ Query failed:', sql);
                    console.error('   Error:', err.message);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    /**
     * Get multiple rows
     * @param {string} sql - SQL query
     * @param {Array} params - Query parameters
     * @returns {Promise<Array>}
     */
    async all(sql, params = []) {
        if (!this.isConnected) {
            throw new Error('Database not connected. Call connect() first.');
        }

        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    console.error('❌ Query failed:', sql);
                    console.error('   Error:', err.message);
                    reject(err);
                } else {
                    resolve(rows || []);
                }
            });
        });
    }

    /**
     * Execute multiple SQL statements (for migrations)
     * @param {string} sql - SQL statements
     * @returns {Promise<void>}
     */
    async exec(sql) {
        if (!this.isConnected) {
            throw new Error('Database not connected. Call connect() first.');
        }

        return new Promise((resolve, reject) => {
            this.db.exec(sql, (err) => {
                if (err) {
                    console.error('❌ Exec failed');
                    console.error('   Error:', err.message);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Run multiple queries in a transaction
     * @param {Function} callback - Async function containing queries
     * @returns {Promise<void>}
     */
    async transaction(callback) {
        if (!this.isConnected) {
            throw new Error('Database not connected. Call connect() first.');
        }

        try {
            await this.run('BEGIN TRANSACTION');
            await callback(this);
            await this.run('COMMIT');
        } catch (err) {
            await this.run('ROLLBACK');
            throw err;
        }
    }

    /**
     * Close database connection
     * @returns {Promise<void>}
     */
    async close() {
        if (!this.isConnected) {
            return;
        }

        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    console.error('❌ Error closing database:', err.message);
                    reject(err);
                } else {
                    this.isConnected = false;
                    console.log('✅ Database connection closed');
                    resolve();
                }
            });
        });
    }

    /**
     * Get database statistics
     * @returns {Promise<Object>}
     */
    async getStats() {
        const tables = await this.all(`
            SELECT name 
            FROM sqlite_master 
            WHERE type='table' AND name NOT LIKE 'sqlite_%'
            ORDER BY name
        `);

        const stats = {
            tables_count: tables.length,
            tables: []
        };

        for (const table of tables) {
            const count = await this.get(`SELECT COUNT(*) as count FROM ${table.name}`);
            stats.tables.push({
                name: table.name,
                rows: count.count
            });
        }

        return stats;
    }

    /**
     * Check if database is connected
     * @returns {boolean}
     */
    isReady() {
        return this.isConnected;
    }
}

// Export singleton instance
const dbInstance = new Database();

module.exports = dbInstance;

// Example usage:
// const db = require('./config/database');
// await db.connect();
// const users = await db.all('SELECT * FROM users WHERE active = ?', [1]);
// await db.close();

