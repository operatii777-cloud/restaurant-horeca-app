// Stock Movements Routes
const express = require('express');
const router = express.Router();
const stockMovementsService = require('../../services/stockMovements.service');
const { asyncHandler } = require('../../middleware/errorHandler');
const { validateBody, validateParams } = require('../../middleware/validator');

router.get('/', asyncHandler(async (req, res) => {
    const filters = {
        ingredient_id: req.query.ingredient_id,
        gestiune_id: req.query.gestiune_id,
        movement_type: req.query.movement_type,
        start_date: req.query.start_date,
        end_date: req.query.end_date
    };
    const movements = await stockMovementsService.getAll(filters);
    res.json({ success: true, data: movements, count: movements.length });
}));

router.get('/statistics', asyncHandler(async (req, res) => {
    const stats = await stockMovementsService.getStatistics();
    res.json({ success: true, data: stats });
}));

router.get('/ingredient/:ingredientId/history', validateParams({ ingredientId: { required: true, type: 'number' } }), asyncHandler(async (req, res) => {
    const days = parseInt(req.query.days) || 30;
    const history = await stockMovementsService.getIngredientHistory(req.params.ingredientId, days);
    res.json({ success: true, data: history });
}));

router.get('/:id', validateParams({ id: { required: true, type: 'number' } }), asyncHandler(async (req, res) => {
    const movement = await stockMovementsService.getById(req.params.id);
    res.json({ success: true, data: movement });
}));

router.post('/', validateBody({
    ingredient_id: { required: true, type: 'number' },
    gestiune_id: { required: false, type: 'number' },
    movement_type: { required: true, type: 'string', enum: ['in', 'out', 'adjustment', 'transfer', 'consumption', 'production'] },
    quantity: { required: true, type: 'number', min: 0.001 },
    unit: { required: true, type: 'string' },
    reference_type: { required: false, type: 'string' },
    reference_id: { required: false, type: 'number' },
    notes: { required: false, type: 'string' },
    created_by: { required: false, type: 'string' }
}), asyncHandler(async (req, res) => {
    const movement = await stockMovementsService.create(req.body);
    res.status(201).json({ success: true, data: movement, message: 'Stock movement created successfully' });
}));

module.exports = router;

