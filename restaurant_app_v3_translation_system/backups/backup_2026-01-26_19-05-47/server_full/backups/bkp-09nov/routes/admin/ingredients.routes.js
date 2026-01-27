// Ingredients Routes
// Purpose: API endpoints for ingredient management
// Created: 21 Oct 2025, 22:05

const express = require('express');
const router = express.Router();
const ingredientsService = require('../../services/ingredients.service');
const { asyncHandler } = require('../../middleware/errorHandler');
const { validateBody, validateParams } = require('../../middleware/validator');

router.get('/', asyncHandler(async (req, res) => {
    const filters = {
        active_only: req.query.active_only === 'true',
        hidden_only: req.query.hidden_only === 'true',
        low_stock: req.query.low_stock === 'true',
        critical_stock: req.query.critical_stock === 'true',
        category: req.query.category,
        gestiune_id: req.query.gestiune_id,
        supplier_id: req.query.supplier_id
    };
    const ingredients = await ingredientsService.getAll(filters);
    res.json({ success: true, data: ingredients, count: ingredients.length });
}));

router.get('/statistics', asyncHandler(async (req, res) => {
    const stats = await ingredientsService.getStatistics();
    res.json({ success: true, data: stats });
}));

router.get('/with-recipes', asyncHandler(async (req, res) => {
    const ingredients = await ingredientsService.getWithRecipes();
    res.json({ success: true, data: ingredients });
}));

router.get('/categories', asyncHandler(async (req, res) => {
    const categories = await ingredientsService.getCategories();
    res.json({ success: true, data: categories });
}));

router.get('/:id', 
    validateParams({ id: { required: true, type: 'number' } }),
    asyncHandler(async (req, res) => {
        const ingredient = await ingredientsService.getById(req.params.id);
        res.json({ success: true, data: ingredient });
    })
);

router.get('/:id/usage-history', 
    validateParams({ id: { required: true, type: 'number' } }),
    asyncHandler(async (req, res) => {
        const days = parseInt(req.query.days) || 30;
        const history = await ingredientsService.getUsageHistory(req.params.id, days);
        res.json({ success: true, data: history });
    })
);

router.post('/',
    validateBody({
        name: { required: true, type: 'string', minLength: 2, maxLength: 200 },
        name_en: { required: false, type: 'string', maxLength: 200 },
        category: { required: false, type: 'string', maxLength: 100 },
        unit: { required: false, type: 'string', enum: ['kg', 'l', 'buc', 'gr', 'ml'] },
        supplier_id: { required: false, type: 'number' },
        gestiune_id: { required: false, type: 'number' },
        current_stock: { required: false, type: 'number', min: 0 },
        min_stock: { required: false, type: 'number', min: 0 },
        max_stock: { required: false, type: 'number', min: 0 },
        avg_price: { required: false, type: 'number', min: 0 },
        last_purchase_price: { required: false, type: 'number', min: 0 },
        is_hidden: { required: false, type: 'number', enum: [0, 1] },
        is_active: { required: false, type: 'number', enum: [0, 1] },
        // Câmpuri nutriționale noi
        description: { required: false, type: 'string', maxLength: 1000 },
        energy_kcal: { required: false, type: 'number', min: 0 },
        fat: { required: false, type: 'number', min: 0 },
        saturated_fat: { required: false, type: 'number', min: 0 },
        carbs: { required: false, type: 'number', min: 0 },
        sugars: { required: false, type: 'number', min: 0 },
        protein: { required: false, type: 'number', min: 0 },
        salt: { required: false, type: 'number', min: 0 },
        fiber: { required: false, type: 'number', min: 0 },
        additives: { required: false, type: 'string', maxLength: 5000 }, // JSON string
        allergens: { required: false, type: 'string', maxLength: 1000 }, // JSON string
        potential_allergens: { required: false, type: 'string', maxLength: 1000 } // JSON string
    }),
    asyncHandler(async (req, res) => {
        const ingredient = await ingredientsService.create(req.body);
        res.status(201).json({ success: true, data: ingredient, message: 'Ingredient created successfully' });
    })
);

router.put('/:id',
    validateParams({ id: { required: true, type: 'number' } }),
    validateBody({
        name: { required: false, type: 'string', minLength: 2, maxLength: 200 },
        name_en: { required: false, type: 'string', maxLength: 200 },
        category: { required: false, type: 'string', maxLength: 100 },
        unit: { required: false, type: 'string', enum: ['kg', 'l', 'buc', 'gr', 'ml'] },
        supplier_id: { required: false, type: 'number' },
        gestiune_id: { required: false, type: 'number' },
        current_stock: { required: false, type: 'number', min: 0 },
        min_stock: { required: false, type: 'number', min: 0 },
        max_stock: { required: false, type: 'number', min: 0 },
        avg_price: { required: false, type: 'number', min: 0 },
        last_purchase_price: { required: false, type: 'number', min: 0 },
        is_hidden: { required: false, type: 'number', enum: [0, 1] },
        is_active: { required: false, type: 'number', enum: [0, 1] },
        // Câmpuri nutriționale noi
        description: { required: false, type: 'string', maxLength: 1000 },
        energy_kcal: { required: false, type: 'number', min: 0 },
        fat: { required: false, type: 'number', min: 0 },
        saturated_fat: { required: false, type: 'number', min: 0 },
        carbs: { required: false, type: 'number', min: 0 },
        sugars: { required: false, type: 'number', min: 0 },
        protein: { required: false, type: 'number', min: 0 },
        salt: { required: false, type: 'number', min: 0 },
        fiber: { required: false, type: 'number', min: 0 },
        additives: { required: false, type: 'string', maxLength: 5000 }, // JSON string
        allergens: { required: false, type: 'string', maxLength: 1000 }, // JSON string
        potential_allergens: { required: false, type: 'string', maxLength: 1000 } // JSON string
    }),
    asyncHandler(async (req, res) => {
        const ingredient = await ingredientsService.update(req.params.id, req.body);
        res.json({ success: true, data: ingredient, message: 'Ingredient updated successfully' });
    })
);

router.delete('/:id',
    validateParams({ id: { required: true, type: 'number' } }),
    asyncHandler(async (req, res) => {
        const ingredient = await ingredientsService.delete(req.params.id);
        res.json({ success: true, data: ingredient, message: 'Ingredient deleted successfully' });
    })
);

router.post('/:id/restore',
    validateParams({ id: { required: true, type: 'number' } }),
    asyncHandler(async (req, res) => {
        const ingredient = await ingredientsService.restore(req.params.id);
        res.json({ success: true, data: ingredient, message: 'Ingredient restored successfully' });
    })
);

router.post('/:id/hide',
    validateParams({ id: { required: true, type: 'number' } }),
    asyncHandler(async (req, res) => {
        const ingredient = await ingredientsService.hide(req.params.id);
        res.json({ success: true, data: ingredient, message: 'Ingredient hidden successfully' });
    })
);

router.post('/:id/unhide',
    validateParams({ id: { required: true, type: 'number' } }),
    asyncHandler(async (req, res) => {
        const ingredient = await ingredientsService.unhide(req.params.id);
        res.json({ success: true, data: ingredient, message: 'Ingredient unhidden successfully' });
    })
);

router.post('/:id/update-stock',
    validateParams({ id: { required: true, type: 'number' } }),
    validateBody({
        quantity: { required: true, type: 'number', min: 0 },
        operation: { required: false, type: 'string', enum: ['set', 'increase', 'decrease'] }
    }),
    asyncHandler(async (req, res) => {
        const ingredient = await ingredientsService.updateStock(
            req.params.id,
            req.body.quantity,
            req.body.operation || 'set'
        );
        res.json({ success: true, data: ingredient, message: 'Stock updated successfully' });
    })
);

router.post('/bulk/create', asyncHandler(async (req, res) => {
    if (!Array.isArray(req.body)) {
        return res.status(400).json({ success: false, error: 'Request body must be an array' });
    }
    const results = await ingredientsService.bulkCreate(req.body);
    const successCount = results.filter(r => r.success).length;
    res.json({
        success: true,
        data: results,
        summary: { total: results.length, success: successCount, failed: results.length - successCount }
    });
}));

router.put('/bulk/update', asyncHandler(async (req, res) => {
    if (!Array.isArray(req.body)) {
        return res.status(400).json({ success: false, error: 'Request body must be an array' });
    }
    const results = await ingredientsService.bulkUpdate(req.body);
    const successCount = results.filter(r => r.success).length;
    res.json({
        success: true,
        data: results,
        summary: { total: results.length, success: successCount, failed: results.length - successCount }
    });
}));

router.delete('/bulk/delete', asyncHandler(async (req, res) => {
    if (!Array.isArray(req.body)) {
        return res.status(400).json({ success: false, error: 'Request body must be an array of IDs' });
    }
    const results = await ingredientsService.bulkDelete(req.body);
    const successCount = results.filter(r => r.success).length;
    res.json({
        success: true,
        data: results,
        summary: { total: results.length, success: successCount, failed: results.length - successCount }
    });
}));

router.post('/bulk/update-stock', asyncHandler(async (req, res) => {
    if (!Array.isArray(req.body)) {
        return res.status(400).json({ success: false, error: 'Request body must be an array of {id, quantity, operation}' });
    }
    const results = await ingredientsService.bulkUpdateStock(req.body);
    const successCount = results.filter(r => r.success).length;
    res.json({
        success: true,
        data: results,
        summary: { total: results.length, success: successCount, failed: results.length - successCount }
    });
}));

module.exports = router;

