// Ingredients Service
// Purpose: Business logic for ingredient operations
// Created: 21 Oct 2025, 22:05

const ingredientsModel = require('../models/ingredients.model');
const { AppError } = require('../middleware/errorHandler');

class IngredientsService {
    async getAll(filters = {}) {
        if (filters.active_only) {
            return await ingredientsModel.findActive();
        }
        if (filters.hidden_only) {
            return await ingredientsModel.findHidden();
        }
        if (filters.low_stock) {
            return await ingredientsModel.findLowStock();
        }
        if (filters.critical_stock) {
            return await ingredientsModel.findCriticalStock();
        }
        if (filters.category) {
            return await ingredientsModel.findByCategory(filters.category);
        }
        if (filters.gestiune_id) {
            return await ingredientsModel.findByGestiune(parseInt(filters.gestiune_id));
        }
        if (filters.supplier_id) {
            return await ingredientsModel.findBySupplier(parseInt(filters.supplier_id));
        }
        return await ingredientsModel.findAll({}, { orderBy: 'name' });
    }

    async getById(id) {
        const ingredient = await ingredientsModel.findById(id);
        if (!ingredient) {
            throw new AppError(`Ingredient with ID ${id} not found`, 404);
        }
        return ingredient;
    }

    async create(data) {
        if (!data.name || data.name.trim() === '') {
            throw new AppError('Ingredient name is required', 400);
        }

        try {
            const id = await ingredientsModel.createIngredient(data);
            return await ingredientsModel.findById(id);
        } catch (err) {
            if (err.message.includes('already exists')) {
                throw new AppError(err.message, 409);
            }
            if (err.message.includes('Invalid unit')) {
                throw new AppError(err.message, 400);
            }
            throw err;
        }
    }

    async update(id, data) {
        try {
            const updated = await ingredientsModel.updateIngredient(id, data);
            return updated;
        } catch (err) {
            if (err.message.includes('not found')) {
                throw new AppError(err.message, 404);
            }
            if (err.message.includes('already exists')) {
                throw new AppError(err.message, 409);
            }
            if (err.message.includes('Invalid unit')) {
                throw new AppError(err.message, 400);
            }
            throw err;
        }
    }

    async delete(id) {
        const ingredient = await ingredientsModel.findById(id);
        if (!ingredient) {
            throw new AppError(`Ingredient with ID ${id} not found`, 404);
        }

        // Check if used in recipes
        const db = require('../config/database');
        const recipesCount = await db.get(
            'SELECT COUNT(*) as count FROM recipes WHERE ingredient_id = ?',
            [id]
        );

        if (recipesCount.count > 0) {
            throw new AppError(
                `Cannot delete ingredient. It is used in ${recipesCount.count} recipe(s). Consider hiding it instead.`,
                400
            );
        }

        return await ingredientsModel.softDelete(id);
    }

    async restore(id) {
        const ingredient = await ingredientsModel.findById(id);
        if (!ingredient) {
            throw new AppError(`Ingredient with ID ${id} not found`, 404);
        }

        if (ingredient.is_active === 1) {
            throw new AppError('Ingredient is already active', 400);
        }

        return await ingredientsModel.restore(id);
    }

    async hide(id) {
        const ingredient = await ingredientsModel.findById(id);
        if (!ingredient) {
            throw new AppError(`Ingredient with ID ${id} not found`, 404);
        }
        return await ingredientsModel.hide(id);
    }

    async unhide(id) {
        const ingredient = await ingredientsModel.findById(id);
        if (!ingredient) {
            throw new AppError(`Ingredient with ID ${id} not found`, 404);
        }
        return await ingredientsModel.unhide(id);
    }

    async updateStock(id, quantity, operation = 'set') {
        if (typeof quantity !== 'number' || quantity < 0) {
            throw new AppError('Quantity must be a non-negative number', 400);
        }

        const validOperations = ['set', 'increase', 'decrease'];
        if (!validOperations.includes(operation)) {
            throw new AppError(`Invalid operation. Must be: ${validOperations.join(', ')}`, 400);
        }

        try {
            return await ingredientsModel.updateStock(id, quantity, operation);
        } catch (err) {
            if (err.message.includes('not found')) {
                throw new AppError(err.message, 404);
            }
            if (err.message.includes('Insufficient stock')) {
                throw new AppError(err.message, 400);
            }
            throw err;
        }
    }

    async getStatistics() {
        return await ingredientsModel.getStatistics();
    }

    async getWithRecipes() {
        return await ingredientsModel.getWithRecipes();
    }

    async getUsageHistory(id, days = 30) {
        const ingredient = await this.getById(id);
        return await ingredientsModel.getUsageHistory(id, days);
    }

    async getCategories() {
        return await ingredientsModel.getCategories();
    }

    async bulkCreate(ingredientsArray) {
        const results = [];
        for (const ingredientData of ingredientsArray) {
            try {
                const ingredient = await this.create(ingredientData);
                results.push({ success: true, data: ingredient });
            } catch (err) {
                results.push({ success: false, error: err.message, data: ingredientData });
            }
        }
        return results;
    }

    async bulkUpdate(updates) {
        const results = [];
        for (const { id, data } of updates) {
            try {
                const ingredient = await this.update(id, data);
                results.push({ success: true, data: ingredient });
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
                const ingredient = await this.delete(id);
                results.push({ success: true, data: ingredient });
            } catch (err) {
                results.push({ success: false, error: err.message, id });
            }
        }
        return results;
    }

    async bulkUpdateStock(updates) {
        const results = [];
        for (const { id, quantity, operation } of updates) {
            try {
                const ingredient = await this.updateStock(id, quantity, operation);
                results.push({ success: true, data: ingredient });
            } catch (err) {
                results.push({ success: false, error: err.message, id });
            }
        }
        return results;
    }
}

module.exports = new IngredientsService();

