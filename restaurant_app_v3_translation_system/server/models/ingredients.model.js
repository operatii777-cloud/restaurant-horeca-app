// Ingredients Model
// Purpose: Ingredient and stock management
// Created: 21 Oct 2025, 22:00
// Part of: FAZA 1 - Products & Ingredients

const BaseModel = require('./base.model');

class IngredientsModel extends BaseModel {
    constructor() {
        super('ingredients');
    }

    async findActive() {
        return await this.findAll({ is_active: 1, is_hidden: 0 }, { orderBy: 'name' });
    }

    async findByName(name) {
        return await this.findOne({ name });
    }

    async findByCategory(category) {
        return await this.findAll({ category, is_active: 1 }, { orderBy: 'name' });
    }

    async findByGestiune(gestiuneId) {
        return await this.findAll({ gestiune_id: gestiuneId, is_active: 1 }, { orderBy: 'name' });
    }

    async findBySupplier(supplierId) {
        return await this.findAll({ supplier_id: supplierId, is_active: 1 }, { orderBy: 'name' });
    }

    async findLowStock() {
        const db = require('../config/database');
        return await db.all(`
            SELECT * FROM ingredients
            WHERE is_available = 1
              AND is_stock_item = 1
              AND current_stock < min_stock
              AND min_stock > 0
            ORDER BY (current_stock / NULLIF(min_stock, 0)) ASC
        `);
    }

    async findCriticalStock() {
        const db = require('../config/database');
        return await db.all(`
            SELECT * FROM ingredients
            WHERE is_available = 1
              AND is_stock_item = 1
              AND current_stock <= (min_stock * 0.2)
              AND min_stock > 0
            ORDER BY current_stock ASC
        `);
    }

    async findHidden() {
        return await this.findAll({ is_hidden: 1 }, { orderBy: 'name' });
    }

    async nameExists(name, excludeId = null) {
        const existing = await this.findByName(name);
        if (!existing) return false;
        if (excludeId && existing.id === excludeId) return false;
        return true;
    }

    async createIngredient(data) {
        if (await this.nameExists(data.name)) {
            throw new Error(`Ingredient with name "${data.name}" already exists`);
        }

        const validUnits = ['kg', 'l', 'buc', 'gr', 'ml'];
        if (data.unit && !validUnits.includes(data.unit)) {
            throw new Error(`Invalid unit. Must be one of: ${validUnits.join(', ')}`);
        }

        const ingredientData = {
            name: data.name,
            name_en: data.name_en || null,
            category: data.category || 'Diverse',
            unit: data.unit || 'kg',
            supplier_id: data.supplier_id || null,
            gestiune_id: data.gestiune_id || null,
            current_stock: data.current_stock || 0,
            min_stock: data.min_stock || 0,
            max_stock: data.max_stock || 0,
            avg_price: data.avg_price || 0,
            last_purchase_price: data.last_purchase_price || 0,
            last_purchase_date: data.last_purchase_date || null,
            is_hidden: data.is_hidden || 0,
            is_active: data.is_active !== undefined ? data.is_active : 1,
            is_stock_item: data.is_stock_item !== undefined ? data.is_stock_item : 1,
            // 📊 CÂMPURI NUTRIȚIONALE NOI
            description: data.description || null,
            energy_kcal: data.energy_kcal || 0,
            fat: data.fat || 0,
            saturated_fat: data.saturated_fat || 0,
            carbs: data.carbs || 0,
            sugars: data.sugars || 0,
            protein: data.protein || 0,
            salt: data.salt || 0,
            fiber: data.fiber || 0,
            additives: data.additives || null,
            allergens: data.allergens || null,
            potential_allergens: data.potential_allergens || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        return await this.create(ingredientData);
    }

    async updateIngredient(id, data) {
        const existing = await this.findById(id);
        if (!existing) {
            throw new Error(`Ingredient with ID ${id} not found`);
        }

        if (data.name && data.name !== existing.name) {
            if (await this.nameExists(data.name, id)) {
                throw new Error(`Ingredient with name "${data.name}" already exists`);
            }
        }

        if (data.unit) {
            const validUnits = ['kg', 'l', 'buc', 'gr', 'ml'];
            if (!validUnits.includes(data.unit)) {
                throw new Error(`Invalid unit. Must be one of: ${validUnits.join(', ')}`);
            }
        }

        data.updated_at = new Date().toISOString();
        // Ensure boolean conversion if passed
        if (data.is_stock_item !== undefined) {
            data.is_stock_item = data.is_stock_item ? 1 : 0;
        }
        return await this.update(id, data);
    }

    async updateStock(id, quantity, operation = 'set') {
        const ingredient = await this.findById(id);
        if (!ingredient) {
            throw new Error(`Ingredient with ID ${id} not found`);
        }

        let newStock;
        switch (operation) {
            case 'increase':
                newStock = parseFloat(ingredient.current_stock) + parseFloat(quantity);
                break;
            case 'decrease':
                newStock = parseFloat(ingredient.current_stock) - parseFloat(quantity);
                if (newStock < 0) {
                    throw new Error(`Insufficient stock. Current: ${ingredient.current_stock}, Requested: ${quantity}`);
                }
                break;
            case 'set':
                newStock = parseFloat(quantity);
                break;
            default:
                throw new Error(`Invalid operation. Must be: increase, decrease, or set`);
        }

        return await this.update(id, {
            current_stock: newStock,
            updated_at: new Date().toISOString()
        });
    }

    async hide(id) {
        return await this.update(id, { is_hidden: 1 });
    }

    async unhide(id) {
        return await this.update(id, { is_hidden: 0 });
    }

    async getStatistics() {
        const all = await this.findAll();
        const active = all.filter(i => i.is_active === 1);
        const hidden = all.filter(i => i.is_hidden === 1);
        const lowStock = await this.findLowStock();
        const criticalStock = await this.findCriticalStock();

        const totalValue = all.reduce((sum, i) => {
            return sum + (parseFloat(i.current_stock) * parseFloat(i.avg_price || 0));
        }, 0);

        const categoryBreakdown = {};
        all.forEach(i => {
            if (!categoryBreakdown[i.category]) {
                categoryBreakdown[i.category] = { count: 0, value: 0 };
            }
            categoryBreakdown[i.category].count++;
            categoryBreakdown[i.category].value += parseFloat(i.current_stock) * parseFloat(i.avg_price || 0);
        });

        return {
            total: all.length,
            active: active.length,
            inactive: all.length - active.length,
            hidden: hidden.length,
            low_stock: lowStock.length,
            critical_stock: criticalStock.length,
            total_value: totalValue,
            category_breakdown: categoryBreakdown
        };
    }

    async getWithRecipes() {
        const db = require('../config/database');
        return await db.all(`
            SELECT 
                i.*,
                COUNT(DISTINCT r.product_id) as used_in_recipes
            FROM ingredients i
            LEFT JOIN recipes r ON r.ingredient_id = i.id
            WHERE i.is_active = 1
            GROUP BY i.id
            ORDER BY i.name
        `);
    }

    async getUsageHistory(ingredientId, days = 30) {
        const db = require('../config/database');
        const since = new Date();
        since.setDate(since.getDate() - days);

        return await db.all(`
            SELECT 
                DATE(movement_date) as date,
                SUM(CASE WHEN movement_type IN ('out', 'consumption') THEN quantity ELSE 0 END) as consumed,
                SUM(CASE WHEN movement_type = 'in' THEN quantity ELSE 0 END) as received,
                SUM(CASE WHEN movement_type = 'adjustment' THEN quantity ELSE 0 END) as adjusted
            FROM stock_movements
            WHERE ingredient_id = ?
              AND DATE(movement_date) >= DATE(?)
            GROUP BY DATE(movement_date)
            ORDER BY date DESC
        `, [ingredientId, since.toISOString().split('T')[0]]);
    }

    async getBatches(ingredientId) {
        const db = require('../config/database');
        // Note: This requires ingredient_batches table from future implementation
        // For now, return empty array
        return [];
    }

    async getCategories() {
        const db = require('../config/database');
        const result = await db.all(`
            SELECT DISTINCT category 
            FROM ingredients 
            WHERE is_active = 1 
            ORDER BY category
        `);
        return result.map(r => r.category);
    }
}

module.exports = new IngredientsModel();

