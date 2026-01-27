// Base Model Class
// Purpose: Reusable CRUD operations for all models
// Created: 21 Oct 2025, 21:10
// Part of: BATCH #3 - Backend Architecture

const db = require('../config/database');

/**
 * Base Model Class
 * Provides standard CRUD operations for all database tables
 * All specific models should extend this class
 */
class BaseModel {
    /**
     * Constructor
     * @param {string} tableName - Name of the database table
     */
    constructor(tableName) {
        if (!tableName) {
            throw new Error('Table name is required for BaseModel');
        }
        this.tableName = tableName;
    }

    /**
     * Find all records with optional filters and options
     * @param {Object} filters - WHERE clause conditions {column: value}
     * @param {Object} options - Query options {orderBy, orderDir, limit, offset}
     * @returns {Promise<Array>}
     */
    async findAll(filters = {}, options = {}) {
        let sql = `SELECT * FROM ${this.tableName}`;
        const params = [];

        // WHERE clause
        const filterKeys = Object.keys(filters);
        if (filterKeys.length > 0) {
            const conditions = filterKeys.map(key => `${key} = ?`);
            sql += ` WHERE ${conditions.join(' AND ')}`;
            params.push(...Object.values(filters));
        }

        // ORDER BY
        if (options.orderBy) {
            sql += ` ORDER BY ${options.orderBy}`;
            if (options.orderDir) {
                sql += ` ${options.orderDir.toUpperCase()}`;
            }
        }

        // LIMIT & OFFSET
        if (options.limit) {
            sql += ` LIMIT ?`;
            params.push(options.limit);
            
            if (options.offset) {
                sql += ` OFFSET ?`;
                params.push(options.offset);
            }
        }

        return await db.all(sql, params);
    }

    /**
     * Find a single record by ID
     * @param {number} id - Record ID
     * @returns {Promise<Object|undefined>}
     */
    async findById(id) {
        const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
        return await db.get(sql, [id]);
    }

    /**
     * Find a single record by custom filter
     * @param {Object} filters - WHERE clause conditions
     * @returns {Promise<Object|undefined>}
     */
    async findOne(filters = {}) {
        let sql = `SELECT * FROM ${this.tableName}`;
        const params = [];

        const filterKeys = Object.keys(filters);
        if (filterKeys.length > 0) {
            const conditions = filterKeys.map(key => `${key} = ?`);
            sql += ` WHERE ${conditions.join(' AND ')}`;
            params.push(...Object.values(filters));
        }

        sql += ` LIMIT 1`;

        return await db.get(sql, params);
    }

    /**
     * Create a new record
     * @param {Object} data - Record data {column: value}
     * @returns {Promise<number>} - New record ID
     */
    async create(data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map(() => '?').join(', ');

        const sql = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
        const result = await db.run(sql, values);
        
        return result.id;
    }

    /**
     * Update a record by ID
     * @param {number} id - Record ID
     * @param {Object} data - Updated data {column: value}
     * @returns {Promise<Object|undefined>} - Updated record
     */
    async update(id, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const setClause = keys.map(key => `${key} = ?`).join(', ');

        const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
        await db.run(sql, [...values, id]);
        
        return await this.findById(id);
    }

    /**
     * Delete a record by ID
     * @param {number} id - Record ID
     * @returns {Promise<{success: boolean, id: number, changes: number}>}
     */
    async delete(id) {
        const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
        const result = await db.run(sql, [id]);
        
        return {
            success: result.changes > 0,
            id: id,
            changes: result.changes
        };
    }

    /**
     * Soft delete (set is_active = 0)
     * @param {number} id - Record ID
     * @returns {Promise<Object|undefined>} - Updated record
     */
    async softDelete(id) {
        return await this.update(id, { is_active: 0 });
    }

    /**
     * Restore soft deleted record
     * @param {number} id - Record ID
     * @returns {Promise<Object|undefined>} - Updated record
     */
    async restore(id) {
        return await this.update(id, { is_active: 1 });
    }

    /**
     * Count records with optional filters
     * @param {Object} filters - WHERE clause conditions
     * @returns {Promise<number>}
     */
    async count(filters = {}) {
        let sql = `SELECT COUNT(*) as count FROM ${this.tableName}`;
        const params = [];

        const filterKeys = Object.keys(filters);
        if (filterKeys.length > 0) {
            const conditions = filterKeys.map(key => `${key} = ?`);
            sql += ` WHERE ${conditions.join(' AND ')}`;
            params.push(...Object.values(filters));
        }

        const result = await db.get(sql, params);
        return result.count;
    }

    /**
     * Check if a record exists
     * @param {Object} filters - WHERE clause conditions
     * @returns {Promise<boolean>}
     */
    async exists(filters = {}) {
        const count = await this.count(filters);
        return count > 0;
    }

    /**
     * Bulk insert multiple records
     * @param {Array<Object>} records - Array of record data
     * @returns {Promise<Array<number>>} - Array of new record IDs
     */
    async bulkCreate(records) {
        if (!Array.isArray(records) || records.length === 0) {
            return [];
        }

        const ids = [];
        
        // Use transaction for bulk insert
        await db.transaction(async () => {
            for (const record of records) {
                const id = await this.create(record);
                ids.push(id);
            }
        });

        return ids;
    }

    /**
     * Bulk update multiple records
     * @param {Array<{id: number, data: Object}>} updates - Array of {id, data}
     * @returns {Promise<number>} - Number of updated records
     */
    async bulkUpdate(updates) {
        if (!Array.isArray(updates) || updates.length === 0) {
            return 0;
        }

        let count = 0;

        await db.transaction(async () => {
            for (const { id, data } of updates) {
                await this.update(id, data);
                count++;
            }
        });

        return count;
    }

    /**
     * Bulk delete multiple records
     * @param {Array<number>} ids - Array of record IDs
     * @returns {Promise<number>} - Number of deleted records
     */
    async bulkDelete(ids) {
        if (!Array.isArray(ids) || ids.length === 0) {
            return 0;
        }

        const placeholders = ids.map(() => '?').join(', ');
        const sql = `DELETE FROM ${this.tableName} WHERE id IN (${placeholders})`;
        const result = await db.run(sql, ids);

        return result.changes;
    }

    /**
     * Custom query (for complex queries)
     * @param {string} sql - SQL query
     * @param {Array} params - Query parameters
     * @returns {Promise<Array>}
     */
    async query(sql, params = []) {
        return await db.all(sql, params);
    }

    /**
     * Get table name
     * @returns {string}
     */
    getTableName() {
        return this.tableName;
    }

    /**
     * Paginate records
     * @param {number} page - Page number (1-based)
     * @param {number} perPage - Records per page
     * @param {Object} filters - WHERE clause conditions
     * @param {Object} options - Query options (orderBy, orderDir)
     * @returns {Promise<{data: Array, pagination: Object}>}
     */
    async paginate(page = 1, perPage = 20, filters = {}, options = {}) {
        const offset = (page - 1) * perPage;
        
        const total = await this.count(filters);
        const data = await this.findAll(filters, {
            ...options,
            limit: perPage,
            offset: offset
        });

        return {
            data: data,
            pagination: {
                page: page,
                perPage: perPage,
                total: total,
                totalPages: Math.ceil(total / perPage),
                hasMore: offset + data.length < total
            }
        };
    }
}

module.exports = BaseModel;

// Example usage:
// class UserModel extends BaseModel {
//     constructor() {
//         super('users');
//     }
//     
//     async findByEmail(email) {
//         return await this.findOne({ email });
//     }
// }
//
// const userModel = new UserModel();
// const users = await userModel.findAll({ is_active: 1 });
// const user = await userModel.findById(1);
// const newId = await userModel.create({ name: 'John', email: 'john@example.com' });

