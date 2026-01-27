// Stock Transfers Routes
const express = require('express');
const router = express.Router();
const stockTransfersService = require('../../services/stockTransfers.service');
const { asyncHandler } = require('../../middleware/errorHandler');
const { validateBody, validateParams } = require('../../middleware/validator');

router.get('/', asyncHandler(async (req, res) => {
    const filters = {
        status: req.query.status,
        gestiune_id: req.query.gestiune_id,
        direction: req.query.direction
    };
    const transfers = await stockTransfersService.getAll(filters);
    res.json({ success: true, data: transfers, count: transfers.length });
}));

router.get('/statistics', asyncHandler(async (req, res) => {
    const stats = await stockTransfersService.getStatistics();
    res.json({ success: true, data: stats });
}));

router.get('/:id', validateParams({ id: { required: true, type: 'number' } }), asyncHandler(async (req, res) => {
    const transfer = await stockTransfersService.getById(req.params.id);
    res.json({ success: true, data: transfer });
}));

router.get('/:id/with-items', validateParams({ id: { required: true, type: 'number' } }), asyncHandler(async (req, res) => {
    const transfer = await stockTransfersService.getWithItems(req.params.id);
    res.json({ success: true, data: transfer });
}));

router.post('/', validateBody({
    transfer_number: { required: false, type: 'string' },
    from_gestiune_id: { required: true, type: 'number' },
    to_gestiune_id: { required: true, type: 'number' },
    notes: { required: false, type: 'string' }
}), asyncHandler(async (req, res) => {
    const transfer = await stockTransfersService.create(req.body);
    res.status(201).json({ success: true, data: transfer, message: 'Transfer created successfully' });
}));

router.put('/:id', validateParams({ id: { required: true, type: 'number' } }), asyncHandler(async (req, res) => {
    const transfer = await stockTransfersService.update(req.params.id, req.body);
    res.json({ success: true, data: transfer, message: 'Transfer updated successfully' });
}));

router.delete('/:id', validateParams({ id: { required: true, type: 'number' } }), asyncHandler(async (req, res) => {
    const result = await stockTransfersService.delete(req.params.id);
    res.json({ success: true, data: result, message: 'Transfer deleted successfully' });
}));

router.post('/:id/send', validateParams({ id: { required: true, type: 'number' } }), validateBody({
    sent_by: { required: true, type: 'string' }
}), asyncHandler(async (req, res) => {
    const transfer = await stockTransfersService.send(req.params.id, req.body.sent_by);
    res.json({ success: true, data: transfer, message: 'Transfer sent successfully' });
}));

router.post('/:id/accept', validateParams({ id: { required: true, type: 'number' } }), validateBody({
    received_by: { required: true, type: 'string' }
}), asyncHandler(async (req, res) => {
    const transfer = await stockTransfersService.accept(req.params.id, req.body.received_by);
    res.json({ success: true, data: transfer, message: 'Transfer accepted successfully' });
}));

module.exports = router;

