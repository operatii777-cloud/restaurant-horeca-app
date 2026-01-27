// Stock Movements Service
const stockMovementsModel = require('../models/stockMovements.model');
const ingredientsModel = require('../models/ingredients.model');
const { AppError } = require('../middleware/errorHandler');

class StockMovementsService {
    async getAll(filters = {}) {
        if (filters.ingredient_id) return await stockMovementsModel.findByIngredient(parseInt(filters.ingredient_id));
        if (filters.gestiune_id) return await stockMovementsModel.findByGestiune(parseInt(filters.gestiune_id));
        if (filters.movement_type) return await stockMovementsModel.findByType(filters.movement_type);
        if (filters.start_date && filters.end_date) {
            return await stockMovementsModel.findByDateRange(filters.start_date, filters.end_date);
        }
        return await stockMovementsModel.findAll({}, { orderBy: 'movement_date DESC' });
    }

    async getById(id) {
        const movement = await stockMovementsModel.findById(id);
        if (!movement) throw new AppError(`Stock movement with ID ${id} not found`, 404);
        return movement;
    }

    async create(data) {
        if (!data.ingredient_id) throw new AppError('Ingredient ID is required', 400);
        if (!data.movement_type) throw new AppError('Movement type is required', 400);
        if (!data.quantity || data.quantity <= 0) throw new AppError('Valid quantity is required', 400);
        if (!data.unit) throw new AppError('Unit is required', 400);

        const validTypes = ['in', 'out', 'adjustment', 'transfer', 'consumption', 'production'];
        if (!validTypes.includes(data.movement_type)) {
            throw new AppError(`Invalid movement type. Must be one of: ${validTypes.join(', ')}`, 400);
        }

        const ingredient = await ingredientsModel.findById(data.ingredient_id);
        if (!ingredient) throw new AppError(`Ingredient with ID ${data.ingredient_id} not found`, 404);

        const id = await stockMovementsModel.createMovement(data);
        return await stockMovementsModel.findById(id);
    }

    async getStatistics() {
        return await stockMovementsModel.getStatistics();
    }

    async getIngredientHistory(ingredientId, days = 30) {
        const ingredient = await ingredientsModel.findById(ingredientId);
        if (!ingredient) throw new AppError(`Ingredient with ID ${ingredientId} not found`, 404);
        return await stockMovementsModel.getIngredientMovementHistory(ingredientId, days);
    }
}

module.exports = new StockMovementsService();

