// Stock Movements Model
const BaseModel = require('./base.model');

class StockMovementsModel extends BaseModel {
    constructor() {
        super('stock_movements');
    }

    async findByIngredient(ingredientId) {
        return await this.findAll({ ingredient_id: ingredientId }, { orderBy: 'movement_date DESC' });
    }

    async findByGestiune(gestiuneId) {
        return await this.findAll({ gestiune_id: gestiuneId }, { orderBy: 'movement_date DESC' });
    }

    async findByType(movementType) {
        return await this.findAll({ movement_type: movementType }, { orderBy: 'movement_date DESC' });
    }

    async findByDateRange(startDate, endDate) {
        const db = require('../config/database');
        return await db.all(`
            SELECT sm.*, i.name as ingredient_name, i.unit as ingredient_unit
            FROM stock_movements sm
            LEFT JOIN ingredients i ON i.id = sm.ingredient_id
            WHERE DATE(sm.movement_date) BETWEEN DATE(?) AND DATE(?)
            ORDER BY sm.movement_date DESC
        `, [startDate, endDate]);
    }

    async createMovement(data) {
        const movementData = {
            movement_date: data.movement_date || new Date().toISOString(),
            ingredient_id: data.ingredient_id,
            gestiune_id: data.gestiune_id || null,
            movement_type: data.movement_type,
            quantity: data.quantity,
            unit: data.unit,
            reference_type: data.reference_type || null,
            reference_id: data.reference_id || null,
            notes: data.notes || null,
            created_by: data.created_by || null
        };

        const id = await this.create(movementData);

        // Update ingredient stock
        if (data.update_stock !== false) {
            const ingredientsModel = require('./ingredients.model');
            const operation = ['in', 'production'].includes(data.movement_type) ? 'increase' : 'decrease';
            await ingredientsModel.updateStock(data.ingredient_id, data.quantity, operation);
        }

        return id;
    }

    async getStatistics() {
        const db = require('../config/database');
        
        const byType = await db.all(`
            SELECT 
                movement_type,
                COUNT(*) as count,
                SUM(quantity) as total_quantity
            FROM stock_movements
            GROUP BY movement_type
        `);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayMovements = await db.get(`
            SELECT COUNT(*) as count
            FROM stock_movements
            WHERE DATE(movement_date) = DATE('now')
        `);

        const thisMonthMovements = await db.get(`
            SELECT COUNT(*) as count
            FROM stock_movements
            WHERE strftime('%Y-%m', movement_date) = strftime('%Y-%m', 'now')
        `);

        return {
            by_type: byType,
            today_count: todayMovements.count,
            this_month_count: thisMonthMovements.count
        };
    }

    async getIngredientMovementHistory(ingredientId, days = 30) {
        const db = require('../config/database');
        const since = new Date();
        since.setDate(since.getDate() - days);

        return await db.all(`
            SELECT *
            FROM stock_movements
            WHERE ingredient_id = ?
              AND DATE(movement_date) >= DATE(?)
            ORDER BY movement_date DESC
        `, [ingredientId, since.toISOString().split('T')[0]]);
    }
}

module.exports = new StockMovementsModel();

