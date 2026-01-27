// Cash Accounts Routes
// Purpose: API endpoints for cash account management
// Created: 21 Oct 2025, 21:45

const express = require('express');
const router = express.Router();
const cashAccountsService = require('../../services/cashAccounts.service');
const { asyncHandler } = require('../../middleware/errorHandler');
const { validateBody, validateParams } = require('../../middleware/validator');

router.get('/', asyncHandler(async (req, res) => {
    const filters = {
        active_only: req.query.active_only === 'true',
        type: req.query.type
    };
    const accounts = await cashAccountsService.getAll(filters);
    res.json({ success: true, data: accounts, count: accounts.length });
}));

router.get('/statistics', asyncHandler(async (req, res) => {
    const stats = await cashAccountsService.getStatistics();
    res.json({ success: true, data: stats });
}));

router.get('/with-movements', asyncHandler(async (req, res) => {
    const days = parseInt(req.query.days) || 30;
    const accounts = await cashAccountsService.getWithMovements(days);
    res.json({ success: true, data: accounts });
}));

router.get('/:id', 
    validateParams({ id: { required: true, type: 'number' } }),
    asyncHandler(async (req, res) => {
        const account = await cashAccountsService.getById(req.params.id);
        res.json({ success: true, data: account });
    })
);

router.post('/',
    validateBody({
        account_name: { required: true, type: 'string', minLength: 2, maxLength: 100 },
        account_type: { required: false, type: 'string', enum: ['cash', 'bank', 'card'] },
        bank_name: { required: false, type: 'string', maxLength: 100 },
        iban: { required: false, type: 'string', maxLength: 50 },
        current_balance: { required: false, type: 'number', min: 0 },
        last_reconciliation_date: { required: false, type: 'string' },
        is_active: { required: false, type: 'number', enum: [0, 1] }
    }),
    asyncHandler(async (req, res) => {
        const account = await cashAccountsService.create(req.body);
        res.status(201).json({ success: true, data: account, message: 'Cash account created successfully' });
    })
);

router.put('/:id',
    validateParams({ id: { required: true, type: 'number' } }),
    validateBody({
        account_name: { required: false, type: 'string', minLength: 2, maxLength: 100 },
        account_type: { required: false, type: 'string', enum: ['cash', 'bank', 'card'] },
        bank_name: { required: false, type: 'string', maxLength: 100 },
        iban: { required: false, type: 'string', maxLength: 50 },
        current_balance: { required: false, type: 'number' },
        last_reconciliation_date: { required: false, type: 'string' },
        is_active: { required: false, type: 'number', enum: [0, 1] }
    }),
    asyncHandler(async (req, res) => {
        const account = await cashAccountsService.update(req.params.id, req.body);
        res.json({ success: true, data: account, message: 'Cash account updated successfully' });
    })
);

router.delete('/:id',
    validateParams({ id: { required: true, type: 'number' } }),
    asyncHandler(async (req, res) => {
        const account = await cashAccountsService.delete(req.params.id);
        res.json({ success: true, data: account, message: 'Cash account deleted successfully' });
    })
);

router.post('/:id/restore',
    validateParams({ id: { required: true, type: 'number' } }),
    asyncHandler(async (req, res) => {
        const account = await cashAccountsService.restore(req.params.id);
        res.json({ success: true, data: account, message: 'Cash account restored successfully' });
    })
);

router.post('/:id/adjust-balance',
    validateParams({ id: { required: true, type: 'number' } }),
    validateBody({
        amount: { required: true, type: 'number', min: 0.01 },
        is_increase: { required: false, type: 'boolean' }
    }),
    asyncHandler(async (req, res) => {
        const account = await cashAccountsService.adjustBalance(
            req.params.id,
            req.body.amount,
            req.body.is_increase !== false
        );
        res.json({ success: true, data: account, message: 'Balance adjusted successfully' });
    })
);

router.post('/:id/reconcile',
    validateParams({ id: { required: true, type: 'number' } }),
    asyncHandler(async (req, res) => {
        const account = await cashAccountsService.reconcile(req.params.id);
        res.json({ success: true, data: account, message: 'Account reconciled successfully' });
    })
);

router.post('/bulk/create', asyncHandler(async (req, res) => {
    if (!Array.isArray(req.body)) {
        return res.status(400).json({ success: false, error: 'Request body must be an array' });
    }
    const results = await cashAccountsService.bulkCreate(req.body);
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
    const results = await cashAccountsService.bulkUpdate(req.body);
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
    const results = await cashAccountsService.bulkDelete(req.body);
    const successCount = results.filter(r => r.success).length;
    res.json({
        success: true,
        data: results,
        summary: { total: results.length, success: successCount, failed: results.length - successCount }
    });
}));

module.exports = router;

