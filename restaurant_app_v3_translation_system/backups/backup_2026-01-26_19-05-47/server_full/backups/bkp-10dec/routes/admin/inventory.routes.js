// Inventory Routes
const express = require('express');
const router = express.Router();
const inventoryService = require('../../services/inventory.service');
const { asyncHandler } = require('../../middleware/errorHandler');
const { validateBody, validateParams } = require('../../middleware/validator');

// GET all inventories
router.get('/', asyncHandler(async (req, res) => {
    const filters = {
        location: req.query.location,
        start_date: req.query.start_date,
        end_date: req.query.end_date
    };
    const inventories = await inventoryService.getAll(filters);
    res.json({ success: true, data: inventories, count: inventories.length });
}));

// GET statistics
router.get('/statistics', asyncHandler(async (req, res) => {
    const stats = await inventoryService.getStatistics();
    res.json({ success: true, data: stats });
}));

// GET inventory by ID
router.get('/:id', validateParams({ id: { required: true, type: 'number' } }), asyncHandler(async (req, res) => {
    const inventory = await inventoryService.getById(req.params.id);
    res.json({ success: true, data: inventory });
}));

// GET inventory with items
router.get('/:id/with-items', validateParams({ id: { required: true, type: 'number' } }), asyncHandler(async (req, res) => {
    const inventory = await inventoryService.getWithItems(req.params.id);
    res.json({ success: true, data: inventory });
}));

// POST create inventory
router.post('/', validateBody({
    document_number: { required: false, type: 'string' },
    document_date: { required: false, type: 'string' },
    location: { required: false, type: 'string' },
    responsible: { required: false, type: 'string' },
    notes: { required: false, type: 'string' },
    lines: { required: true, type: 'array' },
    created_by: { required: false, type: 'string' }
}), asyncHandler(async (req, res) => {
    const inventory = await inventoryService.create(req.body);
    res.status(201).json({ success: true, data: inventory, message: 'Inventory created successfully' });
}));

// PUT update inventory
router.put('/:id', validateParams({ id: { required: true, type: 'number' } }), asyncHandler(async (req, res) => {
    const inventory = await inventoryService.update(req.params.id, req.body);
    res.json({ success: true, data: inventory, message: 'Inventory updated successfully' });
}));

// DELETE inventory
router.delete('/:id', validateParams({ id: { required: true, type: 'number' } }), asyncHandler(async (req, res) => {
    const result = await inventoryService.delete(req.params.id);
    res.json({ success: true, data: result, message: 'Inventory deleted successfully' });
}));

// POST finalize inventory (CRUCIAL - ajustează stocurile!)
router.post('/:id/finalize', validateParams({ id: { required: true, type: 'number' } }), validateBody({
    finalized_by: { required: true, type: 'string' }
}), asyncHandler(async (req, res) => {
    const inventory = await inventoryService.finalize(req.params.id, req.body.finalized_by);
    res.json({ success: true, data: inventory, message: 'Inventory finalized and stock adjusted successfully' });
}));

module.exports = router;

