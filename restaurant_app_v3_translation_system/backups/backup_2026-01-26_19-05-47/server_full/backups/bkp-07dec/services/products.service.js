// Products Service
// Purpose: Business logic for product operations
// Created: 21 Oct 2025, 22:20

const productsModel = require('../models/products.model');
const { AppError } = require('../middleware/errorHandler');

class ProductsService {
    async getAll(filters = {}) {
        if (filters.available_only) {
            return await productsModel.findAvailable();
        }
        if (filters.category_id) {
            return await productsModel.findByCategory(parseInt(filters.category_id));
        }
        if (filters.gestiune_id) {
            return await productsModel.findByGestiune(parseInt(filters.gestiune_id));
        }
        if (filters.section_id) {
            return await productsModel.findBySection(parseInt(filters.section_id));
        }
        if (filters.with_recipes === 'true') {
            return await productsModel.findWithRecipes();
        }
        if (filters.without_recipes === 'true') {
            return await productsModel.findWithoutRecipes();
        }
        return await productsModel.findAll({}, { orderBy: 'position' });
    }

    async getById(id) {
        const product = await productsModel.findById(id);
        if (!product) {
            throw new AppError(`Product with ID ${id} not found`, 404);
        }
        return product;
    }

    async create(data) {
        if (!data.name || data.name.trim() === '') {
            throw new AppError('Product name is required', 400);
        }

        if (!data.price || data.price <= 0) {
            throw new AppError('Valid price is required', 400);
        }

        try {
            const id = await productsModel.createProduct(data);
            return await productsModel.findById(id);
        } catch (err) {
            if (err.message.includes('already exists')) {
                throw new AppError(err.message, 409);
            }
            throw err;
        }
    }

    async update(id, data) {
        try {
            const updated = await productsModel.updateProduct(id, data);
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
        const product = await productsModel.findById(id);
        if (!product) {
            throw new AppError(`Product with ID ${id} not found`, 404);
        }

        // Check if used in orders (future implementation)
        // For now, just soft delete
        return await productsModel.softDelete(id);
    }

    async restore(id) {
        const product = await productsModel.findById(id);
        if (!product) {
            throw new AppError(`Product with ID ${id} not found`, 404);
        }

        if (product.is_available === 1) {
            throw new AppError('Product is already available', 400);
        }

        return await productsModel.restore(id);
    }

    async toggleAvailability(id) {
        const product = await productsModel.findById(id);
        if (!product) {
            throw new AppError(`Product with ID ${id} not found`, 404);
        }

        return await productsModel.toggleAvailability(id);
    }

    async reorder(productIds) {
        if (!Array.isArray(productIds) || productIds.length === 0) {
            throw new AppError('Product IDs array is required', 400);
        }

        await productsModel.reorder(productIds);
        return { success: true, count: productIds.length };
    }

    async getStatistics() {
        return await productsModel.getStatistics();
    }

    async getWithRecipeDetails() {
        return await productsModel.getWithRecipeDetails();
    }

    async getCostAnalysis(id) {
        try {
            return await productsModel.getCostAnalysis(id);
        } catch (err) {
            if (err.message.includes('not found')) {
                throw new AppError(err.message, 404);
            }
            throw err;
        }
    }

    async bulkCreate(productsArray) {
        const results = [];
        for (const productData of productsArray) {
            try {
                const product = await this.create(productData);
                results.push({ success: true, data: product });
            } catch (err) {
                results.push({ success: false, error: err.message, data: productData });
            }
        }
        return results;
    }

    async bulkUpdate(updates) {
        const results = [];
        for (const { id, data } of updates) {
            try {
                const product = await this.update(id, data);
                results.push({ success: true, data: product });
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
                const product = await this.delete(id);
                results.push({ success: true, data: product });
            } catch (err) {
                results.push({ success: false, error: err.message, id });
            }
        }
        return results;
    }

    async bulkToggleAvailability(ids) {
        const results = [];
        for (const id of ids) {
            try {
                const product = await this.toggleAvailability(id);
                results.push({ success: true, data: product });
            } catch (err) {
                results.push({ success: false, error: err.message, id });
            }
        }
        return results;
    }
}

module.exports = new ProductsService();

