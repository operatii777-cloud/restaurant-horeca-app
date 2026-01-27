// Stock Transfers Service
const stockTransfersModel = require('../models/stockTransfers.model');
const gestiuniModel = require('../models/gestiuni.model');
const { AppError } = require('../middleware/errorHandler');

class StockTransfersService {
    async getAll(filters = {}) {
        if (filters.status) return await stockTransfersModel.findByStatus(filters.status);
        if (filters.gestiune_id) {
            return await stockTransfersModel.findByGestiune(parseInt(filters.gestiune_id), filters.direction || 'both');
        }
        return await stockTransfersModel.findAll({}, { orderBy: 'transfer_date DESC' });
    }

    async getById(id) {
        const transfer = await stockTransfersModel.findById(id);
        if (!transfer) throw new AppError(`Transfer with ID ${id} not found`, 404);
        return transfer;
    }

    async getWithItems(id) {
        try {
            return await stockTransfersModel.getWithItems(id);
        } catch (err) {
            if (err.message.includes('not found')) throw new AppError(err.message, 404);
            throw err;
        }
    }

    async create(data) {
        if (!data.from_gestiune_id) throw new AppError('From gestiune ID is required', 400);
        if (!data.to_gestiune_id) throw new AppError('To gestiune ID is required', 400);
        
        if (data.from_gestiune_id === data.to_gestiune_id) {
            throw new AppError('Source and destination gestiuni must be different', 400);
        }

        const fromGestiune = await gestiuniModel.findById(data.from_gestiune_id);
        if (!fromGestiune) throw new AppError(`From gestiune with ID ${data.from_gestiune_id} not found`, 404);
        
        const toGestiune = await gestiuniModel.findById(data.to_gestiune_id);
        if (!toGestiune) throw new AppError(`To gestiune with ID ${data.to_gestiune_id} not found`, 404);

        const id = await stockTransfersModel.createTransfer(data);
        return await stockTransfersModel.findById(id);
    }

    async update(id, data) {
        try {
            return await stockTransfersModel.updateTransfer(id, data);
        } catch (err) {
            if (err.message.includes('not found')) throw new AppError(err.message, 404);
            if (err.message.includes('accepted')) throw new AppError(err.message, 400);
            throw err;
        }
    }

    async delete(id) {
        const transfer = await stockTransfersModel.findById(id);
        if (!transfer) throw new AppError(`Transfer with ID ${id} not found`, 404);
        if (transfer.status === 'accepted') throw new AppError('Cannot delete accepted transfer', 400);
        return await stockTransfersModel.delete(id);
    }

    async send(id, sentBy) {
        try {
            return await stockTransfersModel.send(id, sentBy);
        } catch (err) {
            if (err.message.includes('not found')) throw new AppError(err.message, 404);
            if (err.message.includes('draft')) throw new AppError(err.message, 400);
            throw err;
        }
    }

    async accept(id, receivedBy) {
        try {
            return await stockTransfersModel.accept(id, receivedBy);
        } catch (err) {
            if (err.message.includes('not found')) throw new AppError(err.message, 404);
            if (err.message.includes('sent')) throw new AppError(err.message, 400);
            throw err;
        }
    }

    async getStatistics() {
        return await stockTransfersModel.getStatistics();
    }
}

module.exports = new StockTransfersService();

