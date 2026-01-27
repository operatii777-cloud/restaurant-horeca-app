/**
 * PHASE E9.3 - Base Repository Pattern
 * 
 * Standard repository base class for all modules.
 * Provides common database operations.
 */

const { dbPromise } = require('../../database');

/**
 * Base Repository Class
 * All module repositories should extend this
 */
class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
  }

  /**
   * Get database instance
   */
  async getDb() {
    return await dbPromise;
  }

  /**
   * Execute query and return all rows
   */
  async findAll(query, params = []) {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  /**
   * Execute query and return single row
   */
  async findOne(query, params = []) {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      db.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  }

  /**
   * Execute INSERT/UPDATE/DELETE
   */
  async execute(query, params = []) {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      db.run(query, params, function(err) {
        if (err) reject(err);
        else resolve({
          id: this.lastID,
          changes: this.changes
        });
      });
    });
  }

  /**
   * Execute transaction
   */
  async transaction(callback) {
    const db = await this.getDb();
    try {
      await this.execute('BEGIN TRANSACTION');
      const result = await callback(db);
      await this.execute('COMMIT');
      return result;
    } catch (err) {
      await this.execute('ROLLBACK');
      throw err;
    }
  }

  /**
   * Find by ID
   */
  async findById(id) {
    return this.findOne(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
  }

  /**
   * Find all records
   */
  async getAll() {
    return this.findAll(`SELECT * FROM ${this.tableName}`);
  }

  /**
   * Create new record
   */
  async create(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const query = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
    
    const result = await this.execute(query, values);
    return this.findById(result.id);
  }

  /**
   * Update record by ID
   */
  async update(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    const query = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
    
    await this.execute(query, [...values, id]);
    return this.findById(id);
  }

  /**
   * Delete record by ID
   */
  async delete(id) {
    const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
    return this.execute(query, [id]);
  }
}

module.exports = { BaseRepository };

