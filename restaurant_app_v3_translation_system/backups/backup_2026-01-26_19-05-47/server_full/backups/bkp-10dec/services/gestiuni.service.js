// Gestiuni Service
// Purpose: Business logic for gestiuni operations
// Created: 21 Oct 2025, 21:30
// Part of: BATCH #6 - Service Layer

const gestiuniModel = require('../models/gestiuni.model');
const { AppError } = require('../middleware/errorHandler');

/**
 * Gestiuni Service
 * Contains business logic separated from routes
 */
class GestiuniService {
    /**
     * Get all gestiuni
     * @param {Object} filters - Optional filters
     * @returns {Promise<Array>}
     */
    async getAll(filters = {}) {
        if (filters.active_only) {
            return await gestiuniModel.findActive();
        }
        
        if (filters.type) {
            return await gestiuniModel.findByType(filters.type);
        }

        return await gestiuniModel.findAll({}, { orderBy: 'name' });
    }

    /**
     * Get gestiune by ID
     * @param {number} id - Gestiune ID
     * @returns {Promise<Object>}
     */
    async getById(id) {
        const gestiune = await gestiuniModel.findById(id);
        if (!gestiune) {
            throw new AppError(`Gestiune with ID ${id} not found`, 404);
        }
        return gestiune;
    }

    /**
     * Create new gestiune
     * @param {Object} data - Gestiune data
     * @returns {Promise<Object>}
     */
    async create(data) {
        // Validate required fields
        if (!data.name || data.name.trim() === '') {
            throw new AppError('Gestiune name is required', 400);
        }

        try {
            const id = await gestiuniModel.createGestiune(data);
            return await gestiuniModel.findById(id);
        } catch (err) {
            if (err.message.includes('already exists')) {
                throw new AppError(err.message, 409); // Conflict
            }
            throw err;
        }
    }

    /**
     * Update gestiune
     * @param {number} id - Gestiune ID
     * @param {Object} data - Updated data
     * @returns {Promise<Object>}
     */
    async update(id, data) {
        try {
            const updated = await gestiuniModel.updateGestiune(id, data);
            return updated;
        } catch (err) {
            if (err.message.includes('not found')) {
                throw new AppError(err.message, 404);
            }
            if (err.message.includes('already exists')) {
                throw new AppError(err.message, 409);
            }
            throw err;
        }
    }

    /**
     * Delete gestiune (soft delete)
     * @param {number} id - Gestiune ID
     * @returns {Promise<Object>}
     */
    async delete(id) {
        const gestiune = await gestiuniModel.findById(id);
        if (!gestiune) {
            throw new AppError(`Gestiune with ID ${id} not found`, 404);
        }

        // Check if gestiune is in use
        const db = require('../config/database');
        const ingredientsCount = await db.get(
            'SELECT COUNT(*) as count FROM ingredients WHERE gestiune_id = ?',
            [id]
        );

        if (ingredientsCount.count > 0) {
            throw new AppError(
                `Cannot delete gestiune. ${ingredientsCount.count} ingredient(s) are assigned to it.`,
                400
            );
        }

        // Soft delete
        return await gestiuniModel.softDelete(id);
    }

    /**
     * Restore soft deleted gestiune
     * @param {number} id - Gestiune ID
     * @returns {Promise<Object>}
     */
    async restore(id) {
        const gestiune = await gestiuniModel.findById(id);
        if (!gestiune) {
            throw new AppError(`Gestiune with ID ${id} not found`, 404);
        }

        if (gestiune.is_active === 1) {
            throw new AppError('Gestiune is already active', 400);
        }

        return await gestiuniModel.restore(id);
    }

    /**
     * Get gestiuni statistics
     * @returns {Promise<Object>}
     */
    async getStatistics() {
        return await gestiuniModel.getStatistics();
    }

    /**
     * Get gestiuni with related data
     * @returns {Promise<Array>}
     */
    async getWithRelatedData() {
        return await gestiuniModel.getWithIngredientCounts();
    }

    /**
     * Bulk operations
     */
    async bulkCreate(gestiuniArray) {
        const results = [];
        for (const gestiuneData of gestiuniArray) {
            try {
                const gestiune = await this.create(gestiuneData);
                results.push({ success: true, data: gestiune });
            } catch (err) {
                results.push({ success: false, error: err.message, data: gestiuneData });
            }
        }
        return results;
    }

    async bulkUpdate(updates) {
        const results = [];
        for (const { id, data } of updates) {
            try {
                const gestiune = await this.update(id, data);
                results.push({ success: true, data: gestiune });
            } catch (err) {
                results.push({ success: false, error: err.message, id });
            }
        }
        return results;
    }

    async bulkDelete(ids) {
        const results = [];
        for (const id of ids) {
            try {
                const gestiune = await this.delete(id);
                results.push({ success: true, data: gestiune });
            } catch (err) {
                results.push({ success: false, error: err.message, id });
            }
        }
        return results;
    }
}

module.exports = new GestiuniService();

// Example usage:
// const gestiuniService = require('./services/gestiuni.service');
// const all = await gestiuniService.getAll();
// const newGestiune = await gestiuniService.create({ name: 'New Storage', type: 'storage' });
// const stats = await gestiuniService.getStatistics();

