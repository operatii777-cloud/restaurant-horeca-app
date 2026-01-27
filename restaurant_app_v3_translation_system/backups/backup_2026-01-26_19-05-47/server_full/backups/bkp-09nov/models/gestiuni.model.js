// Gestiuni Model
// Purpose: Management units (Kitchen, Bar, Storage, etc.)
// Created: 21 Oct 2025, 21:25
// Part of: BATCH #5 - First Specific Model

const BaseModel = require('./base.model');

/**
 * Gestiuni Model
 * Represents warehouse/storage management units
 */
class GestiuniModel extends BaseModel {
    constructor() {
        super('gestiuni');
    }

    /**
     * Find all active gestiuni
     * @returns {Promise<Array>}
     */
    async findActive() {
        return await this.findAll({ is_active: 1 }, { orderBy: 'name' });
    }

    /**
     * Find gestiuni by type
     * @param {string} type - Type (kitchen, bar, storage, terrace)
     * @returns {Promise<Array>}
     */
    async findByType(type) {
        return await this.findAll({ type, is_active: 1 }, { orderBy: 'name' });
    }

    /**
     * Find gestiune by name
     * @param {string} name - Gestiune name
     * @returns {Promise<Object|undefined>}
     */
    async findByName(name) {
        return await this.findOne({ name });
    }

    /**
     * Check if gestiune name already exists
     * @param {string} name - Gestiune name
     * @param {number} excludeId - ID to exclude (for updates)
     * @returns {Promise<boolean>}
     */
    async nameExists(name, excludeId = null) {
        const filters = { name };
        const existing = await this.findOne(filters);
        
        if (!existing) return false;
        if (excludeId && existing.id === excludeId) return false;
        
        return true;
    }

    /**
     * Create new gestiune with validation
     * @param {Object} data - Gestiune data
     * @returns {Promise<number>} New gestiune ID
     */
    async createGestiune(data) {
        // Check if name already exists
        const exists = await this.nameExists(data.name);
        if (exists) {
            throw new Error(`Gestiune with name "${data.name}" already exists`);
        }

        // Validate type
        const validTypes = ['kitchen', 'bar', 'storage', 'terrace'];
        if (data.type && !validTypes.includes(data.type)) {
            throw new Error(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
        }

        // Set defaults
        const gestiuneData = {
            name: data.name,
            type: data.type || 'storage',
            location: data.location || null,
            responsible_user: data.responsible_user || null,
            is_active: data.is_active !== undefined ? data.is_active : 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        return await this.create(gestiuneData);
    }

    /**
     * Update gestiune with validation
     * @param {number} id - Gestiune ID
     * @param {Object} data - Updated data
     * @returns {Promise<Object>} Updated gestiune
     */
    async updateGestiune(id, data) {
        // Check if gestiune exists
        const existing = await this.findById(id);
        if (!existing) {
            throw new Error(`Gestiune with ID ${id} not found`);
        }

        // Check name uniqueness if name is being changed
        if (data.name && data.name !== existing.name) {
            const nameExists = await this.nameExists(data.name, id);
            if (nameExists) {
                throw new Error(`Gestiune with name "${data.name}" already exists`);
            }
        }

        // Validate type if provided
        if (data.type) {
            const validTypes = ['kitchen', 'bar', 'storage', 'terrace'];
            if (!validTypes.includes(data.type)) {
                throw new Error(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
            }
        }

        // Add updated timestamp
        data.updated_at = new Date().toISOString();

        return await this.update(id, data);
    }

    /**
     * Get gestiuni statistics
     * @returns {Promise<Object>}
     */
    async getStatistics() {
        const all = await this.findAll();
        const active = all.filter(g => g.is_active === 1);
        
        const byType = {
            kitchen: all.filter(g => g.type === 'kitchen').length,
            bar: all.filter(g => g.type === 'bar').length,
            storage: all.filter(g => g.type === 'storage').length,
            terrace: all.filter(g => g.type === 'terrace').length
        };

        return {
            total: all.length,
            active: active.length,
            inactive: all.length - active.length,
            by_type: byType
        };
    }

    /**
     * Get gestiuni with ingredient counts
     * @returns {Promise<Array>}
     */
    async getWithIngredientCounts() {
        const db = require('../config/database');
        const sql = `
            SELECT 
                g.*,
                COUNT(i.id) as ingredient_count
            FROM gestiuni g
            LEFT JOIN ingredients i ON i.gestiune_id = g.id AND i.is_active = 1
            WHERE g.is_active = 1
            GROUP BY g.id
            ORDER BY g.name
        `;
        
        return await db.all(sql);
    }
}

module.exports = new GestiuniModel();

// Example usage:
// const gestiuniModel = require('./models/gestiuni.model');
// const active = await gestiuniModel.findActive();
// const newId = await gestiuniModel.createGestiune({ name: 'New Storage', type: 'storage' });
// const stats = await gestiuniModel.getStatistics();

