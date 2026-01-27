// Gestiuni Routes
// Purpose: API endpoints for gestiuni management
// Created: 21 Oct 2025, 21:30
// Part of: BATCH #7 - Routes Layer

const express = require('express');
const router = express.Router();
const gestiuniService = require('../../services/gestiuni.service');
const { asyncHandler } = require('../../middleware/errorHandler');
const { validateBody, validateParams, validators } = require('../../middleware/validator');

/**
 * GET /api/admin/gestiuni
 * Get all gestiuni
 * Query params: type, active_only
 */
router.get('/', asyncHandler(async (req, res) => {
    const filters = {
        type: req.query.type,
        active_only: req.query.active_only === 'true'
    };

    const gestiuni = await gestiuniService.getAll(filters);

    res.json({
        success: true,
        data: gestiuni,
        count: gestiuni.length
    });
}));

/**
 * GET /api/admin/gestiuni/statistics
 * Get gestiuni statistics
 */
router.get('/statistics', asyncHandler(async (req, res) => {
    const stats = await gestiuniService.getStatistics();

    res.json({
        success: true,
        data: stats
    });
}));

/**
 * GET /api/admin/gestiuni/with-ingredients
 * Get gestiuni with ingredient counts
 */
router.get('/with-ingredients', asyncHandler(async (req, res) => {
    const gestiuni = await gestiuniService.getWithRelatedData();

    res.json({
        success: true,
        data: gestiuni
    });
}));

/**
 * GET /api/admin/gestiuni/:id
 * Get gestiune by ID
 */
router.get('/:id', 
    validateParams({
        id: { required: true, type: 'number' }
    }),
    asyncHandler(async (req, res) => {
        const gestiune = await gestiuniService.getById(req.params.id);

        res.json({
            success: true,
            data: gestiune
        });
    })
);

/**
 * POST /api/admin/gestiuni
 * Create new gestiune
 * Body: { name, type, location, responsible_user }
 */
router.post('/',
    validateBody({
        name: {
            required: true,
            type: 'string',
            minLength: 2,
            maxLength: 100
        },
        type: {
            required: false,
            type: 'string',
            enum: ['kitchen', 'bar', 'storage', 'terrace']
        },
        location: {
            required: false,
            type: 'string',
            maxLength: 200
        },
        responsible_user: {
            required: false,
            type: 'string',
            maxLength: 100
        },
        is_active: {
            required: false,
            type: 'number',
            enum: [0, 1]
        }
    }),
    asyncHandler(async (req, res) => {
        const gestiune = await gestiuniService.create(req.body);

        res.status(201).json({
            success: true,
            data: gestiune,
            message: 'Gestiune created successfully'
        });
    })
);

/**
 * PUT /api/admin/gestiuni/:id
 * Update gestiune
 * Body: { name, type, location, responsible_user, is_active }
 */
router.put('/:id',
    validateParams({
        id: { required: true, type: 'number' }
    }),
    validateBody({
        name: {
            required: false,
            type: 'string',
            minLength: 2,
            maxLength: 100
        },
        type: {
            required: false,
            type: 'string',
            enum: ['kitchen', 'bar', 'storage', 'terrace']
        },
        location: {
            required: false,
            type: 'string',
            maxLength: 200
        },
        responsible_user: {
            required: false,
            type: 'string',
            maxLength: 100
        },
        is_active: {
            required: false,
            type: 'number',
            enum: [0, 1]
        }
    }),
    asyncHandler(async (req, res) => {
        const gestiune = await gestiuniService.update(req.params.id, req.body);

        res.json({
            success: true,
            data: gestiune,
            message: 'Gestiune updated successfully'
        });
    })
);

/**
 * DELETE /api/admin/gestiuni/:id
 * Soft delete gestiune
 */
router.delete('/:id',
    validateParams({
        id: { required: true, type: 'number' }
    }),
    asyncHandler(async (req, res) => {
        const gestiune = await gestiuniService.delete(req.params.id);

        res.json({
            success: true,
            data: gestiune,
            message: 'Gestiune deleted successfully'
        });
    })
);

/**
 * POST /api/admin/gestiuni/:id/restore
 * Restore soft deleted gestiune
 */
router.post('/:id/restore',
    validateParams({
        id: { required: true, type: 'number' }
    }),
    asyncHandler(async (req, res) => {
        const gestiune = await gestiuniService.restore(req.params.id);

        res.json({
            success: true,
            data: gestiune,
            message: 'Gestiune restored successfully'
        });
    })
);

/**
 * POST /api/admin/gestiuni/bulk
 * Bulk create gestiuni
 * Body: [{ name, type, ... }, ...]
 */
router.post('/bulk/create', asyncHandler(async (req, res) => {
    if (!Array.isArray(req.body)) {
        return res.status(400).json({
            success: false,
            error: 'Request body must be an array'
        });
    }

    const results = await gestiuniService.bulkCreate(req.body);
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    res.json({
        success: true,
        data: results,
        summary: {
            total: results.length,
            success: successCount,
            failed: failureCount
        }
    });
}));

/**
 * PUT /api/admin/gestiuni/bulk
 * Bulk update gestiuni
 * Body: [{ id, data: {...} }, ...]
 */
router.put('/bulk/update', asyncHandler(async (req, res) => {
    if (!Array.isArray(req.body)) {
        return res.status(400).json({
            success: false,
            error: 'Request body must be an array'
        });
    }

    const results = await gestiuniService.bulkUpdate(req.body);
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    res.json({
        success: true,
        data: results,
        summary: {
            total: results.length,
            success: successCount,
            failed: failureCount
        }
    });
}));

/**
 * DELETE /api/admin/gestiuni/bulk
 * Bulk delete gestiuni
 * Body: [1, 2, 3, ...]
 */
router.delete('/bulk/delete', asyncHandler(async (req, res) => {
    if (!Array.isArray(req.body)) {
        return res.status(400).json({
            success: false,
            error: 'Request body must be an array of IDs'
        });
    }

    const results = await gestiuniService.bulkDelete(req.body);
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    res.json({
        success: true,
        data: results,
        summary: {
            total: results.length,
            success: successCount,
            failed: failureCount
        }
    });
}));

module.exports = router;

// Example requests:
// GET    /api/admin/gestiuni
// GET    /api/admin/gestiuni?type=kitchen&active_only=true
// GET    /api/admin/gestiuni/statistics
// GET    /api/admin/gestiuni/1
// POST   /api/admin/gestiuni { name: "New Storage", type: "storage" }
// PUT    /api/admin/gestiuni/1 { name: "Updated Name" }
// DELETE /api/admin/gestiuni/1
// POST   /api/admin/gestiuni/1/restore

