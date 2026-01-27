// Categories Service
// Purpose: Business logic for category operations
// Created: 21 Oct 2025, 21:40

const categoriesModel = require('../models/categories.model');
const { AppError } = require('../middleware/errorHandler');

class CategoriesService {
    async getAll(filters = {}) {
        if (filters.active_only) {
            return await categoriesModel.findActive();
        }
        if (filters.root_only) {
            return await categoriesModel.findRootCategories();
        }
        return await categoriesModel.findAll({}, { orderBy: 'sort_order' });
    }

    async getById(id) {
        const category = await categoriesModel.findById(id);
        if (!category) {
            throw new AppError(`Category with ID ${id} not found`, 404);
        }
        return category;
    }

    async getChildren(parentId) {
        const parent = await this.getById(parentId);
        return await categoriesModel.findChildren(parentId);
    }

    async getTree() {
        return await categoriesModel.getTree();
    }

    async create(data) {
        if (!data.name || data.name.trim() === '') {
            throw new AppError('Category name is required', 400);
        }

        try {
            const id = await categoriesModel.createCategory(data);
            return await categoriesModel.findById(id);
        } catch (err) {
            if (err.message.includes('already exists')) {
                throw new AppError(err.message, 409);
            }
            if (err.message.includes('not found')) {
                throw new AppError(err.message, 404);
            }
            throw err;
        }
    }

    async update(id, data) {
        try {
            const updated = await categoriesModel.updateCategory(id, data);
            return updated;
        } catch (err) {
            if (err.message.includes('not found')) {
                throw new AppError(err.message, 404);
            }
            if (err.message.includes('already exists')) {
                throw new AppError(err.message, 409);
            }
            if (err.message.includes('circular reference')) {
                throw new AppError(err.message, 400);
            }
            if (err.message.includes('own parent')) {
                throw new AppError(err.message, 400);
            }
            throw err;
        }
    }

    async delete(id) {
        const category = await categoriesModel.findById(id);
        if (!category) {
            throw new AppError(`Category with ID ${id} not found`, 404);
        }

        // Check for children
        const children = await categoriesModel.findChildren(id);
        if (children.length > 0) {
            throw new AppError(
                `Cannot delete category. It has ${children.length} sub-category(ies).`,
                400
            );
        }

        // Check for products
        const db = require('../config/database');
        const productsCount = await db.get(
            'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
            [id]
        );

        if (productsCount.count > 0) {
            throw new AppError(
                `Cannot delete category. ${productsCount.count} product(s) are assigned to it.`,
                400
            );
        }

        return await categoriesModel.softDelete(id);
    }

    async restore(id) {
        const category = await categoriesModel.findById(id);
        if (!category) {
            throw new AppError(`Category with ID ${id} not found`, 404);
        }

        if (category.is_active === 1) {
            throw new AppError('Category is already active', 400);
        }

        return await categoriesModel.restore(id);
    }

    async reorder(updates) {
        const results = [];
        for (const { id, sort_order } of updates) {
            try {
                const category = await categoriesModel.update(id, { sort_order });
                results.push({ success: true, data: category });
            } catch (err) {
                results.push({ success: false, error: err.message, id });
            }
        }
        return results;
    }

    async getStatistics() {
        return await categoriesModel.getStatistics();
    }

    async getWithProductCounts() {
        return await categoriesModel.getWithProductCounts();
    }

    async bulkCreate(categoriesArray) {
        const results = [];
        for (const categoryData of categoriesArray) {
            try {
                const category = await this.create(categoryData);
                results.push({ success: true, data: category });
            } catch (err) {
                results.push({ success: false, error: err.message, data: categoryData });
            }
        }
        return results;
    }

    async bulkUpdate(updates) {
        const results = [];
        for (const { id, data } of updates) {
            try {
                const category = await this.update(id, data);
                results.push({ success: true, data: category });
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
                const category = await this.delete(id);
                results.push({ success: true, data: category });
            } catch (err) {
                results.push({ success: false, error: err.message, id });
            }
        }
        return results;
    }
}

module.exports = new CategoriesService();

