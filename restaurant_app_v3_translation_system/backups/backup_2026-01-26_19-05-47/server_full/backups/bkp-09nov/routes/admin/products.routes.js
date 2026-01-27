// Products Routes
// Purpose: API endpoints for product management
// Created: 21 Oct 2025, 22:20

const express = require('express');
const router = express.Router();
const productsService = require('../../services/products.service');
const { asyncHandler } = require('../../middleware/errorHandler');
const { validateBody, validateParams } = require('../../middleware/validator');

router.get('/', asyncHandler(async (req, res) => {
    const filters = {
        available_only: req.query.available_only === 'true',
        with_recipes: req.query.with_recipes,
        without_recipes: req.query.without_recipes,
        category_id: req.query.category_id,
        gestiune_id: req.query.gestiune_id,
        section_id: req.query.section_id
    };
    const products = await productsService.getAll(filters);
    res.json({ success: true, data: products, count: products.length });
}));

router.get('/statistics', asyncHandler(async (req, res) => {
    const stats = await productsService.getStatistics();
    res.json({ success: true, data: stats });
}));

router.get('/with-recipe-details', asyncHandler(async (req, res) => {
    const products = await productsService.getWithRecipeDetails();
    res.json({ success: true, data: products });
}));

router.get('/:id', 
    validateParams({ id: { required: true, type: 'number' } }),
    asyncHandler(async (req, res) => {
        const product = await productsService.getById(req.params.id);
        res.json({ success: true, data: product });
    })
);

router.get('/:id/cost-analysis', 
    validateParams({ id: { required: true, type: 'number' } }),
    asyncHandler(async (req, res) => {
        const analysis = await productsService.getCostAnalysis(req.params.id);
        res.json({ success: true, data: analysis });
    })
);

router.post('/',
    validateBody({
        name: { required: true, type: 'string', minLength: 2, maxLength: 200 },
        name_en: { required: false, type: 'string', maxLength: 200 },
        price: { required: true, type: 'number', min: 0.01 },
        vat_rate: { required: false, type: 'number', min: 0, max: 100 },
        category_id: { required: false, type: 'number' },
        gestiune_id: { required: false, type: 'number' },
        section_id: { required: false, type: 'number' },
        unit: { required: false, type: 'string', maxLength: 20 },
        description: { required: false, type: 'string', maxLength: 1000 },
        description_en: { required: false, type: 'string', maxLength: 1000 },
        image: { required: false, type: 'string', maxLength: 500 },
        preparation_time: { required: false, type: 'number', min: 0 },
        spice_level: { required: false, type: 'number', min: 0, max: 5 },
        allergens: { required: false, type: 'string', maxLength: 500 },
        is_available: { required: false, type: 'number', enum: [0, 1] },
        has_recipe: { required: false, type: 'number', enum: [0, 1] },
        is_fractional: { required: false, type: 'number', enum: [0, 1] },
        position: { required: false, type: 'number', min: 0 }
    }),
    asyncHandler(async (req, res) => {
        const product = await productsService.create(req.body);
        res.status(201).json({ success: true, data: product, message: 'Product created successfully' });
    })
);

router.put('/:id',
    validateParams({ id: { required: true, type: 'number' } }),
    validateBody({
        name: { required: false, type: 'string', minLength: 2, maxLength: 200 },
        name_en: { required: false, type: 'string', maxLength: 200 },
        price: { required: false, type: 'number', min: 0.01 },
        vat_rate: { required: false, type: 'number', min: 0, max: 100 },
        category_id: { required: false, type: 'number' },
        gestiune_id: { required: false, type: 'number' },
        section_id: { required: false, type: 'number' },
        unit: { required: false, type: 'string', maxLength: 20 },
        description: { required: false, type: 'string', maxLength: 1000 },
        description_en: { required: false, type: 'string', maxLength: 1000 },
        image: { required: false, type: 'string', maxLength: 500 },
        preparation_time: { required: false, type: 'number', min: 0 },
        spice_level: { required: false, type: 'number', min: 0, max: 5 },
        allergens: { required: false, type: 'string', maxLength: 500 },
        is_available: { required: false, type: 'number', enum: [0, 1] },
        has_recipe: { required: false, type: 'number', enum: [0, 1] },
        is_fractional: { required: false, type: 'number', enum: [0, 1] },
        position: { required: false, type: 'number', min: 0 }
    }),
    asyncHandler(async (req, res) => {
        const product = await productsService.update(req.params.id, req.body);
        res.json({ success: true, data: product, message: 'Product updated successfully' });
    })
);

router.delete('/:id',
    validateParams({ id: { required: true, type: 'number' } }),
    asyncHandler(async (req, res) => {
        const product = await productsService.delete(req.params.id);
        res.json({ success: true, data: product, message: 'Product deleted successfully' });
    })
);

router.post('/:id/restore',
    validateParams({ id: { required: true, type: 'number' } }),
    asyncHandler(async (req, res) => {
        const product = await productsService.restore(req.params.id);
        res.json({ success: true, data: product, message: 'Product restored successfully' });
    })
);

router.post('/:id/toggle-availability',
    validateParams({ id: { required: true, type: 'number' } }),
    asyncHandler(async (req, res) => {
        const product = await productsService.toggleAvailability(req.params.id);
        res.json({ success: true, data: product, message: 'Product availability toggled successfully' });
    })
);

router.post('/reorder', asyncHandler(async (req, res) => {
    if (!Array.isArray(req.body)) {
        return res.status(400).json({ success: false, error: 'Request body must be an array of product IDs' });
    }
    const result = await productsService.reorder(req.body);
    res.json({ success: true, data: result, message: 'Products reordered successfully' });
}));

router.post('/bulk/create', asyncHandler(async (req, res) => {
    if (!Array.isArray(req.body)) {
        return res.status(400).json({ success: false, error: 'Request body must be an array' });
    }
    const results = await productsService.bulkCreate(req.body);
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
    const results = await productsService.bulkUpdate(req.body);
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
    const results = await productsService.bulkDelete(req.body);
    const successCount = results.filter(r => r.success).length;
    res.json({
        success: true,
        data: results,
        summary: { total: results.length, success: successCount, failed: results.length - successCount }
    });
}));

router.post('/bulk/toggle-availability', asyncHandler(async (req, res) => {
    if (!Array.isArray(req.body)) {
        return res.status(400).json({ success: false, error: 'Request body must be an array of IDs' });
    }
    const results = await productsService.bulkToggleAvailability(req.body);
    const successCount = results.filter(r => r.success).length;
    res.json({
        success: true,
        data: results,
        summary: { total: results.length, success: successCount, failed: results.length - successCount }
    });
}));

module.exports = router;

