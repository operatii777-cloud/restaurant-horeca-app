// Products Model
// Purpose: Menu product management
// Created: 21 Oct 2025, 22:10
// Part of: FAZA 2 - Products & Ingredients

const BaseModel = require('./base.model');

class ProductsModel extends BaseModel {
    constructor() {
        super('products');
    }

    async findAvailable() {
        return await this.findAll({ is_available: 1 }, { orderBy: 'position' });
    }

    async findByName(name) {
        return await this.findOne({ name });
    }

    async findByCategory(categoryId) {
        return await this.findAll({ category_id: categoryId, is_available: 1 }, { orderBy: 'position' });
    }

    async findByGestiune(gestiuneId) {
        return await this.findAll({ gestiune_id: gestiuneId, is_available: 1 }, { orderBy: 'name' });
    }

    async findBySection(sectionId) {
        return await this.findAll({ section_id: sectionId, is_available: 1 }, { orderBy: 'name' });
    }

    async findWithRecipes() {
        return await this.findAll({ has_recipe: 1, is_available: 1 }, { orderBy: 'name' });
    }

    async findWithoutRecipes() {
        return await this.findAll({ has_recipe: 0, is_available: 1 }, { orderBy: 'name' });
    }

    async nameExists(name, excludeId = null) {
        const existing = await this.findByName(name);
        if (!existing) return false;
        if (excludeId && existing.id === excludeId) return false;
        return true;
    }

    async createProduct(data) {
        if (await this.nameExists(data.name)) {
            throw new Error(`Product with name "${data.name}" already exists`);
        }

        const productData = {
            name: data.name,
            name_en: data.name_en || null,
            price: data.price,
            vat_rate: data.vat_rate || 19.0,
            category_id: data.category_id || null,
            gestiune_id: data.gestiune_id || null,
            section_id: data.section_id || null,
            unit: data.unit || 'buc',
            description: data.description || null,
            description_en: data.description_en || null,
            image: data.image || null,
            preparation_time: data.preparation_time || 0,
            spice_level: data.spice_level || 0,
            allergens: data.allergens || null,
            is_available: data.is_available !== undefined ? data.is_available : 1,
            has_recipe: data.has_recipe || 0,
            is_fractional: data.is_fractional || 0,
            position: data.position || 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        return await this.create(productData);
    }

    async updateProduct(id, data) {
        const existing = await this.findById(id);
        if (!existing) {
            throw new Error(`Product with ID ${id} not found`);
        }

        if (data.name && data.name !== existing.name) {
            if (await this.nameExists(data.name, id)) {
                throw new Error(`Product with name "${data.name}" already exists`);
            }
        }

        data.updated_at = new Date().toISOString();
        return await this.update(id, data);
    }

    async toggleAvailability(id) {
        const product = await this.findById(id);
        if (!product) {
            throw new Error(`Product with ID ${id} not found`);
        }

        return await this.update(id, {
            is_available: product.is_available === 1 ? 0 : 1,
            updated_at: new Date().toISOString()
        });
    }

    async getStatistics() {
        const all = await this.findAll();
        const available = all.filter(p => p.is_available === 1);
        const withRecipes = all.filter(p => p.has_recipe === 1);

        const categoryBreakdown = {};
        all.forEach(p => {
            const catId = p.category_id || 'uncategorized';
            if (!categoryBreakdown[catId]) {
                categoryBreakdown[catId] = { count: 0, avgPrice: 0, totalPrice: 0 };
            }
            categoryBreakdown[catId].count++;
            categoryBreakdown[catId].totalPrice += parseFloat(p.price || 0);
        });

        Object.keys(categoryBreakdown).forEach(catId => {
            categoryBreakdown[catId].avgPrice = 
                categoryBreakdown[catId].totalPrice / categoryBreakdown[catId].count;
        });

        return {
            total: all.length,
            available: available.length,
            unavailable: all.length - available.length,
            with_recipes: withRecipes.length,
            without_recipes: all.length - withRecipes.length,
            category_breakdown: categoryBreakdown,
            avg_price: all.reduce((sum, p) => sum + parseFloat(p.price || 0), 0) / all.length || 0
        };
    }

    async getWithRecipeDetails() {
        const db = require('../config/database');
        return await db.all(`
            SELECT 
                p.*,
                COUNT(r.id) as ingredient_count,
                SUM(i.avg_price * r.quantity) as estimated_cost
            FROM products p
            LEFT JOIN recipes r ON r.product_id = p.id
            LEFT JOIN ingredients i ON i.id = r.ingredient_id
            WHERE p.is_available = 1
            GROUP BY p.id
            ORDER BY p.name
        `);
    }

    async getTopSellers(limit = 10, days = 30) {
        const db = require('../config/database');
        const since = new Date();
        since.setDate(since.getDate() - days);

        // This will work when orders integration is ready
        return [];
    }

    async reorder(productIds) {
        const db = require('../config/database');
        
        await db.transaction(async (db) => {
            for (let i = 0; i < productIds.length; i++) {
                await db.run(
                    'UPDATE products SET position = ?, updated_at = ? WHERE id = ?',
                    [i, new Date().toISOString(), productIds[i]]
                );
            }
        });

        return true;
    }

    async getCostAnalysis(productId) {
        const db = require('../config/database');
        
        const product = await this.findById(productId);
        if (!product) {
            throw new Error(`Product with ID ${productId} not found`);
        }

        const recipes = await db.all(`
            SELECT 
                r.*,
                i.name as ingredient_name,
                i.unit as ingredient_unit,
                i.avg_price as ingredient_avg_price,
                (r.quantity * i.avg_price) as line_cost
            FROM recipes r
            JOIN ingredients i ON i.id = r.ingredient_id
            WHERE r.product_id = ?
        `, [productId]);

        const totalCost = recipes.reduce((sum, r) => sum + parseFloat(r.line_cost || 0), 0);
        const profitMargin = parseFloat(product.price) - totalCost;
        const profitPercentage = (profitMargin / parseFloat(product.price)) * 100;

        return {
            product_id: productId,
            product_name: product.name,
            selling_price: parseFloat(product.price),
            total_cost: totalCost,
            profit_margin: profitMargin,
            profit_percentage: profitPercentage,
            ingredients: recipes
        };
    }
}

module.exports = new ProductsModel();

