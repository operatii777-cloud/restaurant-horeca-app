// Categories Routes
// Purpose: API endpoints for category management
// Created: 21 Oct 2025, 21:45

const express = require('express');
const router = express.Router();
const categoriesService = require('../../services/categories.service');
const { asyncHandler } = require('../../middleware/errorHandler');
const { validateBody, validateParams } = require('../../middleware/validator');

router.get('/', asyncHandler(async (req, res) => {
    const filters = {
        active_only: req.query.active_only === 'true',
        root_only: req.query.root_only === 'true'
    };
    const categories = await categoriesService.getAll(filters);
    res.json({ success: true, data: categories, count: categories.length });
}));

router.get('/tree', asyncHandler(async (req, res) => {
    const tree = await categoriesService.getTree();
    res.json({ success: true, data: tree });
}));

router.get('/statistics', asyncHandler(async (req, res) => {
    const stats = await categoriesService.getStatistics();
    res.json({ success: true, data: stats });
}));

router.get('/with-products', asyncHandler(async (req, res) => {
    const categories = await categoriesService.getWithProductCounts();
    res.json({ success: true, data: categories });
}));

router.get('/:id', 
    validateParams({ id: { required: true, type: 'number' } }),
    asyncHandler(async (req, res) => {
        const category = await categoriesService.getById(req.params.id);
        res.json({ success: true, data: category });
    })
);

router.get('/:id/children', 
    validateParams({ id: { required: true, type: 'number' } }),
    asyncHandler(async (req, res) => {
        const children = await categoriesService.getChildren(req.params.id);
        res.json({ success: true, data: children, count: children.length });
    })
);

router.post('/',
    validateBody({
        name: { required: true, type: 'string', minLength: 2, maxLength: 100 },
        name_en: { required: false, type: 'string', maxLength: 100 },
        parent_id: { required: false, type: 'number' },
        icon: { required: false, type: 'string', maxLength: 50 },
        sort_order: { required: false, type: 'number', min: 0 },
        is_active: { required: false, type: 'number', enum: [0, 1] }
    }),
    asyncHandler(async (req, res) => {
        const category = await categoriesService.create(req.body);
        res.status(201).json({ success: true, data: category, message: 'Category created successfully' });
    })
);

router.put('/:id',
    validateParams({ id: { required: true, type: 'number' } }),
    validateBody({
        name: { required: false, type: 'string', minLength: 2, maxLength: 100 },
        name_en: { required: false, type: 'string', maxLength: 100 },
        parent_id: { required: false, type: 'number' },
        icon: { required: false, type: 'string', maxLength: 50 },
        sort_order: { required: false, type: 'number', min: 0 },
        is_active: { required: false, type: 'number', enum: [0, 1] }
    }),
    asyncHandler(async (req, res) => {
        const category = await categoriesService.update(req.params.id, req.body);
        res.json({ success: true, data: category, message: 'Category updated successfully' });
    })
);

router.delete('/:id',
    validateParams({ id: { required: true, type: 'number' } }),
    asyncHandler(async (req, res) => {
        const category = await categoriesService.delete(req.params.id);
        res.json({ success: true, data: category, message: 'Category deleted successfully' });
    })
);

router.post('/:id/restore',
    validateParams({ id: { required: true, type: 'number' } }),
    asyncHandler(async (req, res) => {
        const category = await categoriesService.restore(req.params.id);
        res.json({ success: true, data: category, message: 'Category restored successfully' });
    })
);

router.post('/reorder', asyncHandler(async (req, res) => {
    if (!Array.isArray(req.body)) {
        return res.status(400).json({ success: false, error: 'Request body must be an array of {id, sort_order}' });
    }
    const results = await categoriesService.reorder(req.body);
    const successCount = results.filter(r => r.success).length;
    res.json({
        success: true,
        data: results,
        summary: { total: results.length, success: successCount, failed: results.length - successCount }
    });
}));

router.post('/bulk/create', asyncHandler(async (req, res) => {
    if (!Array.isArray(req.body)) {
        return res.status(400).json({ success: false, error: 'Request body must be an array' });
    }
    const results = await categoriesService.bulkCreate(req.body);
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
    const results = await categoriesService.bulkUpdate(req.body);
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
    const results = await categoriesService.bulkDelete(req.body);
    const successCount = results.filter(r => r.success).length;
    res.json({
        success: true,
        data: results,
        summary: { total: results.length, success: successCount, failed: results.length - successCount }
    });
}));

module.exports = router;

