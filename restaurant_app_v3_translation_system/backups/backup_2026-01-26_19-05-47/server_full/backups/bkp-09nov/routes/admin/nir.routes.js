// NIR Routes
const express = require('express');
const router = express.Router();
const nirService = require('../../services/nir.service');
const { asyncHandler } = require('../../middleware/errorHandler');
const { validateBody, validateParams } = require('../../middleware/validator');

router.get('/', asyncHandler(async (req, res) => {
    const filters = {
        status: req.query.status,
        supplier_id: req.query.supplier_id,
        unpaid: req.query.unpaid,
        start_date: req.query.start_date,
        end_date: req.query.end_date
    };
    const nirs = await nirService.getAll(filters);
    res.json({ success: true, data: nirs, count: nirs.length });
}));

router.get('/statistics', asyncHandler(async (req, res) => {
    const stats = await nirService.getStatistics();
    res.json({ success: true, data: stats });
}));

router.get('/:id', validateParams({ id: { required: true, type: 'number' } }), asyncHandler(async (req, res) => {
    const nir = await nirService.getById(req.params.id);
    res.json({ success: true, data: nir });
}));

router.get('/:id/with-items', validateParams({ id: { required: true, type: 'number' } }), asyncHandler(async (req, res) => {
    const nir = await nirService.getWithItems(req.params.id);
    res.json({ success: true, data: nir });
}));

router.get('/:id/payments', validateParams({ id: { required: true, type: 'number' } }), asyncHandler(async (req, res) => {
    const payments = await nirService.getPayments(req.params.id);
    res.json({ success: true, data: payments });
}));

router.post('/', validateBody({
    nir_number: { required: false, type: 'string' },
    nir_date: { required: false, type: 'string' },
    supplier_id: { required: true, type: 'number' },
    gestiune_id: { required: false, type: 'number' },
    total_value: { required: false, type: 'number' },
    vat_value: { required: false, type: 'number' },
    paid_value: { required: false, type: 'number' },
    status: { required: false, type: 'string', enum: ['draft', 'validated', 'partial_paid', 'paid'] },
    notes: { required: false, type: 'string' },
    created_by: { required: false, type: 'string' }
}), asyncHandler(async (req, res) => {
    const nir = await nirService.create(req.body);
    res.status(201).json({ success: true, data: nir, message: 'NIR created successfully' });
}));

router.put('/:id', validateParams({ id: { required: true, type: 'number' } }), asyncHandler(async (req, res) => {
    const nir = await nirService.update(req.params.id, req.body);
    res.json({ success: true, data: nir, message: 'NIR updated successfully' });
}));

router.delete('/:id', validateParams({ id: { required: true, type: 'number' } }), asyncHandler(async (req, res) => {
    const result = await nirService.delete(req.params.id);
    res.json({ success: true, data: result, message: 'NIR deleted successfully' });
}));

router.post('/:id/validate', validateParams({ id: { required: true, type: 'number' } }), validateBody({
    validated_by: { required: true, type: 'string' }
}), asyncHandler(async (req, res) => {
    const nir = await nirService.validate(req.params.id, req.body.validated_by);
    res.json({ success: true, data: nir, message: 'NIR validated successfully' });
}));

router.post('/:id/payments', validateParams({ id: { required: true, type: 'number' } }), validateBody({
    amount: { required: true, type: 'number', min: 0.01 },
    payment_method: { required: false, type: 'string', enum: ['cash', 'card', 'transfer'] },
    account_id: { required: false, type: 'number' },
    paid_by: { required: false, type: 'string' },
    notes: { required: false, type: 'string' }
}), asyncHandler(async (req, res) => {
    const nir = await nirService.addPayment(req.params.id, req.body);
    res.json({ success: true, data: nir, message: 'Payment added successfully' });
}));

module.exports = router;

