// Suppliers Service
// Purpose: Business logic for supplier operations
// Created: 21 Oct 2025, 21:40

const suppliersModel = require('../models/suppliers.model');
const { AppError } = require('../middleware/errorHandler');

class SuppliersService {
    async getAll(filters = {}) {
        if (filters.active_only) {
            return await suppliersModel.findActive();
        }
        return await suppliersModel.findAll({}, { orderBy: 'name' });
    }

    async getById(id) {
        const supplier = await suppliersModel.findById(id);
        if (!supplier) {
            throw new AppError(`Supplier with ID ${id} not found`, 404);
        }
        return supplier;
    }

    async create(data) {
        if (!data.name || data.name.trim() === '') {
            throw new AppError('Supplier name is required', 400);
        }

        try {
            const id = await suppliersModel.createSupplier(data);
            return await suppliersModel.findById(id);
        } catch (err) {
            if (err.message.includes('already exists')) {
                throw new AppError(err.message, 409);
            }
            throw err;
        }
    }

    async update(id, data) {
        try {
            const updated = await suppliersModel.updateSupplier(id, data);
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

    async delete(id) {
        const supplier = await suppliersModel.findById(id);
        if (!supplier) {
            throw new AppError(`Supplier with ID ${id} not found`, 404);
        }

        const db = require('../config/database');
        const ingredientsCount = await db.get(
            'SELECT COUNT(*) as count FROM ingredients WHERE supplier_id = ?',
            [id]
        );

        if (ingredientsCount.count > 0) {
            throw new AppError(
                `Cannot delete supplier. ${ingredientsCount.count} ingredient(s) are assigned to it.`,
                400
            );
        }

        return await suppliersModel.softDelete(id);
    }

    async restore(id) {
        const supplier = await suppliersModel.findById(id);
        if (!supplier) {
            throw new AppError(`Supplier with ID ${id} not found`, 404);
        }

        if (supplier.is_active === 1) {
            throw new AppError('Supplier is already active', 400);
        }

        return await suppliersModel.restore(id);
    }

    async getStatistics() {
        return await suppliersModel.getStatistics();
    }

    async getWithIngredientCounts() {
        return await suppliersModel.getWithIngredientCounts();
    }

    async getWithNIRStats() {
        return await suppliersModel.getWithNIRStats();
    }

    async bulkCreate(suppliersArray) {
        const results = [];
        for (const supplierData of suppliersArray) {
            try {
                const supplier = await this.create(supplierData);
                results.push({ success: true, data: supplier });
            } catch (err) {
                results.push({ success: false, error: err.message, data: supplierData });
            }
        }
        return results;
    }

    async bulkUpdate(updates) {
        const results = [];
        for (const { id, data } of updates) {
            try {
                const supplier = await this.update(id, data);
                results.push({ success: true, data: supplier });
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
                const supplier = await this.delete(id);
                results.push({ success: true, data: supplier });
            } catch (err) {
                results.push({ success: false, error: err.message, id });
            }
        }
        return results;
    }
}

module.exports = new SuppliersService();

