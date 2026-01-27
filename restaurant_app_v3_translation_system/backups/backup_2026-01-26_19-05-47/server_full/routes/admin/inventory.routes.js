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

// GET filtered inventory items (for stock management)
router.get('/filtered', asyncHandler(async (req, res) => {
    const { dbPromise } = require('../../database');
    const db = await dbPromise;
    
    const {
        category,
        supplier,
        stock_status,
        sort_by = 'name',
        min_stock,
        max_stock
    } = req.query;
    
    try {
        let query = `
            SELECT 
                i.id,
                i.name,
                i.category,
                i.unit,
                i.supplier,
                i.min_stock,
                i.cost_per_unit,
                COALESCE(SUM(CASE WHEN sm.type = 'IN' THEN sm.quantity ELSE 0 END), 0) - 
                COALESCE(SUM(CASE WHEN sm.type = 'OUT' OR sm.type = 'CONSUME' THEN sm.quantity ELSE 0 END), 0) as current_stock
            FROM ingredients i
            LEFT JOIN stock_moves sm ON i.id = sm.ingredient_id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (category) {
            query += ' AND i.category = ?';
            params.push(category);
        }
        
        if (supplier) {
            query += ' AND i.supplier = ?';
            params.push(supplier);
        }
        
        if (min_stock && min_stock !== '' && !isNaN(parseFloat(min_stock))) {
            query += ' AND i.min_stock >= ?';
            params.push(parseFloat(min_stock));
        }
        
        if (max_stock && max_stock !== '' && !isNaN(parseFloat(max_stock))) {
            query += ' AND i.min_stock <= ?';
            params.push(parseFloat(max_stock));
        }
        
        query += ' GROUP BY i.id, i.name, i.category, i.unit, i.supplier, i.min_stock, i.cost_per_unit';
        
        // Aplică filtrul de stoc după GROUP BY
        if (stock_status === 'low_stock') {
            query += ' HAVING current_stock < i.min_stock';
        } else if (stock_status === 'out_of_stock') {
            query += ' HAVING current_stock <= 0';
        } else if (stock_status === 'in_stock') {
            query += ' HAVING current_stock >= i.min_stock';
        }
        
        // Sortare - suportă formatul "name:1" sau "name:asc" (compatibilitate admin-advanced.html)
        let sortField = 'name';
        let sortDirection = 'ASC';
        
        if (sort_by) {
            // Parsează formatul "field:direction" sau "field:1/-1"
            const sortParts = sort_by.split(':');
            if (sortParts.length === 2) {
                sortField = sortParts[0];
                const direction = sortParts[1].toLowerCase();
                if (direction === '1' || direction === 'asc') {
                    sortDirection = 'ASC';
                } else if (direction === '-1' || direction === 'desc') {
                    sortDirection = 'DESC';
                }
            } else {
                sortField = sort_by;
            }
        }
        
        // Mapează câmpurile de sortare
        if (sortField === 'name') {
            query += ` ORDER BY i.name ${sortDirection}`;
        } else if (sortField === 'stock' || sortField === 'current_stock') {
            query += ` ORDER BY current_stock ${sortDirection}`;
        } else if (sortField === 'category') {
            query += ` ORDER BY i.category ${sortDirection}, i.name ASC`;
        } else {
            query += ` ORDER BY i.name ${sortDirection}`;
        }
        
        const items = await new Promise((resolve, reject) => {
            db.all(query, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        // Calculează sumar
        const summary = {
            total: items.length,
            low_stock: items.filter(item => item.current_stock < item.min_stock).length,
            out_of_stock: items.filter(item => item.current_stock <= 0).length,
            total_value: items.reduce((sum, item) => sum + (item.current_stock * (item.cost_per_unit || 0)), 0)
        };
        
        res.json({
            success: true,
            data: items,
            summary: summary
        });
    } catch (error) {
        console.error('❌ Error in /api/admin/inventory/filtered:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Eroare la filtrarea inventarului'
        });
    }
}));

module.exports = router;

