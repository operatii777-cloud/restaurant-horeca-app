// Inventory Service
const inventoryModel = require('../models/inventory.model');
const { AppError } = require('../middleware/errorHandler');

class InventoryService {
    async getAll(filters = {}) {
        if (filters.location) return await inventoryModel.findByLocation(filters.location);
        if (filters.start_date && filters.end_date) {
            return await inventoryModel.findByDateRange(filters.start_date, filters.end_date);
        }
        return await inventoryModel.findAll({}, { orderBy: 'document_date DESC' });
    }

    async getById(id) {
        const inventory = await inventoryModel.findById(id);
        if (!inventory) throw new AppError(`Inventory with ID ${id} not found`, 404);
        return inventory;
    }

    async getWithItems(id) {
        try {
            return await inventoryModel.getWithItems(id);
        } catch (err) {
            if (err.message.includes('not found')) throw new AppError(err.message, 404);
            throw err;
        }
    }

    async create(data) {
        if (!data.document_date) throw new AppError('Document date is required', 400);
        if (!data.lines || !Array.isArray(data.lines) || data.lines.length === 0) {
            throw new AppError('At least one inventory line is required', 400);
        }

        const inventory = await inventoryModel.createInventory(data);
        return inventory;
    }

    async update(id, data) {
        try {
            return await inventoryModel.updateInventory(id, data);
        } catch (err) {
            if (err.message.includes('not found')) throw new AppError(err.message, 404);
            throw err;
        }
    }

    async delete(id) {
        const inventory = await inventoryModel.findById(id);
        if (!inventory) throw new AppError(`Inventory with ID ${id} not found`, 404);
        return await inventoryModel.delete(id);
    }

    async finalize(id, finalizedBy) {
        try {
            return await inventoryModel.finalize(id, finalizedBy);
        } catch (err) {
            if (err.message.includes('not found')) throw new AppError(err.message, 404);
            throw err;
        }
    }

    async getStatistics() {
        return await inventoryModel.getStatistics();
    }
}

module.exports = new InventoryService();

