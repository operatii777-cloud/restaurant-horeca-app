// Recipes Model
// Purpose: Product-Ingredient recipe management
// Created: 21 Oct 2025, 22:25
// Part of: FAZA 2 - Products & Ingredients

const BaseModel = require('./base.model');

class RecipesModel extends BaseModel {
    constructor() {
        super('recipes');
    }

    async findByProduct(productId) {
        return await this.findAll({ product_id: productId });
    }

    async findByIngredient(ingredientId) {
        return await this.findAll({ ingredient_id: ingredientId });
    }

    async recipeExists(productId, ingredientId) {
        const existing = await this.findOne({ product_id: productId, ingredient_id: ingredientId });
        return !!existing;
    }

    async createRecipe(data) {
        if (await this.recipeExists(data.product_id, data.ingredient_id)) {
            throw new Error(`Recipe already exists for this product-ingredient combination`);
        }

        const recipeData = {
            product_id: data.product_id,
            ingredient_id: data.ingredient_id,
            quantity: data.quantity,
            unit: data.unit,
            created_at: new Date().toISOString()
        };

        return await this.create(recipeData);
    }

    async updateRecipe(id, data) {
        const existing = await this.findById(id);
        if (!existing) {
            throw new Error(`Recipe with ID ${id} not found`);
        }

        // If changing product or ingredient, check for duplicates
        if ((data.product_id && data.product_id !== existing.product_id) ||
            (data.ingredient_id && data.ingredient_id !== existing.ingredient_id)) {
            
            const newProductId = data.product_id || existing.product_id;
            const newIngredientId = data.ingredient_id || existing.ingredient_id;
            
            const duplicate = await this.findOne({
                product_id: newProductId,
                ingredient_id: newIngredientId
            });

            if (duplicate && duplicate.id !== id) {
                throw new Error(`Recipe already exists for this product-ingredient combination`);
            }
        }

        return await this.update(id, data);
    }

    async getProductRecipeWithDetails(productId) {
        const db = require('../config/database');
        
        const recipe = await db.all(`
            SELECT 
                r.*,
                i.name as ingredient_name,
                i.name_en as ingredient_name_en,
                i.category as ingredient_category,
                i.unit as ingredient_unit,
                i.current_stock as ingredient_current_stock,
                i.avg_price as ingredient_avg_price,
                (r.quantity * i.avg_price) as line_cost
            FROM recipes r
            JOIN ingredients i ON i.id = r.ingredient_id
            WHERE r.product_id = ?
            ORDER BY i.name
        `, [productId]);

        if (recipe.length === 0) {
            return null;
        }

        const totalCost = recipe.reduce((sum, item) => sum + parseFloat(item.line_cost || 0), 0);

        return {
            product_id: productId,
            ingredients: recipe,
            ingredient_count: recipe.length,
            total_cost: totalCost
        };
    }

    async getIngredientUsage(ingredientId) {
        const db = require('../config/database');
        
        return await db.all(`
            SELECT 
                r.*,
                p.name as product_name,
                p.name_en as product_name_en,
                p.price as product_price,
                p.is_available as product_is_available
            FROM recipes r
            JOIN products p ON p.id = r.product_id
            WHERE r.ingredient_id = ?
            ORDER BY p.name
        `, [ingredientId]);
    }

    async bulkCreateForProduct(productId, ingredients) {
        const db = require('../config/database');
        
        // Delete existing recipes for this product
        await db.run('DELETE FROM recipes WHERE product_id = ?', [productId]);
        
        // Insert new recipes
        const ids = [];
        for (const ing of ingredients) {
            const id = await this.create({
                product_id: productId,
                ingredient_id: ing.ingredient_id,
                quantity: ing.quantity,
                unit: ing.unit
            });
            ids.push(id);
        }

        // Update product has_recipe flag
        await db.run('UPDATE products SET has_recipe = 1, updated_at = ? WHERE id = ?', 
            [new Date().toISOString(), productId]);

        return ids;
    }

    async deleteProductRecipe(productId) {
        const db = require('../config/database');
        
        const result = await db.run('DELETE FROM recipes WHERE product_id = ?', [productId]);
        
        // Update product has_recipe flag
        await db.run('UPDATE products SET has_recipe = 0, updated_at = ? WHERE id = ?', 
            [new Date().toISOString(), productId]);

        return result;
    }

    async getStatistics() {
        const db = require('../config/database');
        
        const totalRecipes = await this.count();
        
        const productsWithRecipes = await db.get(`
            SELECT COUNT(DISTINCT product_id) as count 
            FROM recipes
        `);

        const ingredientsUsed = await db.get(`
            SELECT COUNT(DISTINCT ingredient_id) as count 
            FROM recipes
        `);

        const avgIngredientsPerProduct = await db.get(`
            SELECT AVG(ingredient_count) as avg
            FROM (
                SELECT product_id, COUNT(*) as ingredient_count
                FROM recipes
                GROUP BY product_id
            )
        `);

        return {
            total_recipe_lines: totalRecipes,
            products_with_recipes: productsWithRecipes.count || 0,
            ingredients_used: ingredientsUsed.count || 0,
            avg_ingredients_per_product: parseFloat(avgIngredientsPerProduct.avg || 0).toFixed(2)
        };
    }

    async validateRecipe(productId) {
        const db = require('../config/database');
        
        const recipe = await db.all(`
            SELECT 
                r.*,
                i.name as ingredient_name,
                i.current_stock as ingredient_current_stock,
                i.is_active as ingredient_is_active,
                i.is_hidden as ingredient_is_hidden
            FROM recipes r
            JOIN ingredients i ON i.id = r.ingredient_id
            WHERE r.product_id = ?
        `, [productId]);

        const issues = [];

        recipe.forEach(item => {
            if (item.ingredient_is_active === 0) {
                issues.push({
                    type: 'inactive_ingredient',
                    ingredient_id: item.ingredient_id,
                    ingredient_name: item.ingredient_name,
                    message: `Ingredient "${item.ingredient_name}" is inactive`
                });
            }

            if (item.ingredient_is_hidden === 1) {
                issues.push({
                    type: 'hidden_ingredient',
                    ingredient_id: item.ingredient_id,
                    ingredient_name: item.ingredient_name,
                    message: `Ingredient "${item.ingredient_name}" is hidden`
                });
            }

            if (parseFloat(item.ingredient_current_stock) < parseFloat(item.quantity)) {
                issues.push({
                    type: 'insufficient_stock',
                    ingredient_id: item.ingredient_id,
                    ingredient_name: item.ingredient_name,
                    required: parseFloat(item.quantity),
                    available: parseFloat(item.ingredient_current_stock),
                    message: `Insufficient stock for "${item.ingredient_name}". Required: ${item.quantity}, Available: ${item.ingredient_current_stock}`
                });
            }
        });

        return {
            product_id: productId,
            is_valid: issues.length === 0,
            issues: issues
        };
    }
}

module.exports = new RecipesModel();

