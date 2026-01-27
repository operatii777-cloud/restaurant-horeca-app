// Suppliers Routes
// Purpose: API endpoints for supplier management
// Created: 21 Oct 2025, 21:45

const express = require('express');
const router = express.Router();
const suppliersService = require('../../services/suppliers.service');
const { asyncHandler } = require('../../middleware/errorHandler');
const { validateBody, validateParams } = require('../../middleware/validator');

router.get('/', asyncHandler(async (req, res) => {
    const filters = {
        active_only: req.query.active_only === 'true'
    };
    const suppliers = await suppliersService.getAll(filters);
    res.json({ success: true, data: suppliers, count: suppliers.length });
}));

router.get('/statistics', asyncHandler(async (req, res) => {
    const stats = await suppliersService.getStatistics();
    res.json({ success: true, data: stats });
}));

router.get('/with-ingredients', asyncHandler(async (req, res) => {
    const suppliers = await suppliersService.getWithIngredientCounts();
    res.json({ success: true, data: suppliers });
}));

router.get('/with-nir', asyncHandler(async (req, res) => {
    const suppliers = await suppliersService.getWithNIRStats();
    res.json({ success: true, data: suppliers });
}));

router.get('/:id', 
    validateParams({ id: { required: true, type: 'number' } }),
    asyncHandler(async (req, res) => {
        const supplier = await suppliersService.getById(req.params.id);
        res.json({ success: true, data: supplier });
    })
);

router.post('/',
    validateBody({
        name: { required: true, type: 'string', minLength: 2, maxLength: 200 },
        cui: { required: false, type: 'string', maxLength: 20 },
        reg_number: { required: false, type: 'string', maxLength: 50 },
        address: { required: false, type: 'string', maxLength: 500 },
        phone: { required: false, type: 'string', maxLength: 50 },
        email: { required: false, type: 'string', maxLength: 100 },
        contact_person: { required: false, type: 'string', maxLength: 100 },
        payment_terms: { required: false, type: 'number', min: 0, max: 365 },
        is_active: { required: false, type: 'number', enum: [0, 1] }
    }),
    asyncHandler(async (req, res) => {
        const supplier = await suppliersService.create(req.body);
        res.status(201).json({ success: true, data: supplier, message: 'Supplier created successfully' });
    })
);

router.put('/:id',
    validateParams({ id: { required: true, type: 'number' } }),
    validateBody({
        name: { required: false, type: 'string', minLength: 2, maxLength: 200 },
        cui: { required: false, type: 'string', maxLength: 20 },
        reg_number: { required: false, type: 'string', maxLength: 50 },
        address: { required: false, type: 'string', maxLength: 500 },
        phone: { required: false, type: 'string', maxLength: 50 },
        email: { required: false, type: 'string', maxLength: 100 },
        contact_person: { required: false, type: 'string', maxLength: 100 },
        payment_terms: { required: false, type: 'number', min: 0, max: 365 },
        is_active: { required: false, type: 'number', enum: [0, 1] }
    }),
    asyncHandler(async (req, res) => {
        const supplier = await suppliersService.update(req.params.id, req.body);
        res.json({ success: true, data: supplier, message: 'Supplier updated successfully' });
    })
);

router.delete('/:id',
    validateParams({ id: { required: true, type: 'number' } }),
    asyncHandler(async (req, res) => {
        const supplier = await suppliersService.delete(req.params.id);
        res.json({ success: true, data: supplier, message: 'Supplier deleted successfully' });
    })
);

router.post('/:id/restore',
    validateParams({ id: { required: true, type: 'number' } }),
    asyncHandler(async (req, res) => {
        const supplier = await suppliersService.restore(req.params.id);
        res.json({ success: true, data: supplier, message: 'Supplier restored successfully' });
    })
);

router.post('/bulk/create', asyncHandler(async (req, res) => {
    if (!Array.isArray(req.body)) {
        return res.status(400).json({ success: false, error: 'Request body must be an array' });
    }
    const results = await suppliersService.bulkCreate(req.body);
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
    const results = await suppliersService.bulkUpdate(req.body);
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
    const results = await suppliersService.bulkDelete(req.body);
    const successCount = results.filter(r => r.success).length;
    res.json({
        success: true,
        data: results,
        summary: { total: results.length, success: successCount, failed: results.length - successCount }
    });
}));

module.exports = router;

