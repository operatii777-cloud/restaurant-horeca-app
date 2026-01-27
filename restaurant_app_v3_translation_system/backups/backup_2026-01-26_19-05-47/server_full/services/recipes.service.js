// Recipes Service
// Purpose: Business logic for recipe operations
// Created: 21 Oct 2025, 22:25

const recipesModel = require('../models/recipes.model');
const productsModel = require('../models/products.model');
const ingredientsModel = require('../models/ingredients.model');
const { AppError } = require('../middleware/errorHandler');

class RecipesService {
    async getAll() {
        return await recipesModel.findAll({});
    }

    async getById(id) {
        const recipe = await recipesModel.findById(id);
        if (!recipe) {
            throw new AppError(`Recipe with ID ${id} not found`, 404);
        }
        return recipe;
    }

    async getByProduct(productId) {
        // Verify product exists
        await this._verifyProduct(productId);
        return await recipesModel.findByProduct(productId);
    }

    async getProductRecipeWithDetails(productId) {
        await this._verifyProduct(productId);
        
        const recipe = await recipesModel.getProductRecipeWithDetails(productId);
        if (!recipe) {
            throw new AppError(`No recipe found for product ID ${productId}`, 404);
        }
        
        return recipe;
    }

    async getByIngredient(ingredientId) {
        // Verify ingredient exists
        await this._verifyIngredient(ingredientId);
        return await recipesModel.findByIngredient(ingredientId);
    }

    async getIngredientUsage(ingredientId) {
        await this._verifyIngredient(ingredientId);
        return await recipesModel.getIngredientUsage(ingredientId);
    }

    async create(data) {
        if (!data.product_id || !data.ingredient_id) {
            throw new AppError('Product ID and Ingredient ID are required', 400);
        }

        if (!data.quantity || data.quantity <= 0) {
            throw new AppError('Valid quantity is required', 400);
        }

        if (!data.unit) {
            throw new AppError('Unit is required', 400);
        }

        // Verify product and ingredient exist
        await this._verifyProduct(data.product_id);
        await this._verifyIngredient(data.ingredient_id);

        try {
            const id = await recipesModel.createRecipe(data);
            return await recipesModel.findById(id);
        } catch (err) {
            if (err.message.includes('already exists')) {
                throw new AppError(err.message, 409);
            }
            throw err;
        }
    }

    async update(id, data) {
        // Verify product and ingredient if provided
        if (data.product_id) {
            await this._verifyProduct(data.product_id);
        }
        if (data.ingredient_id) {
            await this._verifyIngredient(data.ingredient_id);
        }

        try {
            const updated = await recipesModel.updateRecipe(id, data);
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
        const recipe = await recipesModel.findById(id);
        if (!recipe) {
            throw new AppError(`Recipe with ID ${id} not found`, 404);
        }

        return await recipesModel.delete(id);
    }

    async bulkCreateForProduct(productId, ingredients) {
        if (!Array.isArray(ingredients) || ingredients.length === 0) {
            throw new AppError('Ingredients array is required and must not be empty', 400);
        }

        // Verify product exists
        await this._verifyProduct(productId);

        // Verify all ingredients exist
        for (const ing of ingredients) {
            if (!ing.ingredient_id || !ing.quantity || !ing.unit) {
                throw new AppError('Each ingredient must have ingredient_id, quantity, and unit', 400);
            }
            await this._verifyIngredient(ing.ingredient_id);
        }

        const ids = await recipesModel.bulkCreateForProduct(productId, ingredients);
        
        return {
            product_id: productId,
            ingredients_count: ids.length,
            recipe_ids: ids
        };
    }

    async deleteProductRecipe(productId) {
        await this._verifyProduct(productId);
        
        const existing = await recipesModel.findByProduct(productId);
        if (existing.length === 0) {
            throw new AppError(`No recipe found for product ID ${productId}`, 404);
        }

        await recipesModel.deleteProductRecipe(productId);
        
        return {
            product_id: productId,
            deleted_count: existing.length
        };
    }

    async getStatistics() {
        return await recipesModel.getStatistics();
    }

    async validateRecipe(productId) {
        await this._verifyProduct(productId);
        return await recipesModel.validateRecipe(productId);
    }

    // Helper methods
    async _verifyProduct(productId) {
        const product = await productsModel.findById(productId);
        if (!product) {
            throw new AppError(`Product with ID ${productId} not found`, 404);
        }
        return product;
    }

    async _verifyIngredient(ingredientId) {
        const ingredient = await ingredientsModel.findById(ingredientId);
        if (!ingredient) {
            throw new AppError(`Ingredient with ID ${ingredientId} not found`, 404);
        }
        return ingredient;
    }
}

module.exports = new RecipesService();

