// NIR Service
const nirModel = require('../models/nir.model');
const { AppError } = require('../middleware/errorHandler');

class NIRService {
    async getAll(filters = {}) {
        if (filters.status) return await nirModel.findByStatus(filters.status);
        if (filters.supplier_id) return await nirModel.findBySupplier(parseInt(filters.supplier_id));
        if (filters.unpaid === 'true') return await nirModel.findUnpaid();
        if (filters.start_date && filters.end_date) {
            return await nirModel.findByDateRange(filters.start_date, filters.end_date);
        }
        return await nirModel.findAll({}, { orderBy: 'nir_date DESC' });
    }

    async getById(id) {
        const nir = await nirModel.findById(id);
        if (!nir) throw new AppError(`NIR with ID ${id} not found`, 404);
        return nir;
    }

    async getWithItems(id) {
        try {
            return await nirModel.getWithItems(id);
        } catch (err) {
            if (err.message.includes('not found')) throw new AppError(err.message, 404);
            throw err;
        }
    }

    async create(data) {
        if (!data.supplier_id) throw new AppError('Supplier ID is required', 400);
        const id = await nirModel.createNIR(data);
        return await nirModel.findById(id);
    }

    async update(id, data) {
        try {
            return await nirModel.updateNIR(id, data);
        } catch (err) {
            if (err.message.includes('not found')) throw new AppError(err.message, 404);
            if (err.message.includes('validated')) throw new AppError(err.message, 400);
            throw err;
        }
    }

    async delete(id) {
        const nir = await nirModel.findById(id);
        if (!nir) throw new AppError(`NIR with ID ${id} not found`, 404);
        if (nir.status === 'validated') throw new AppError('Cannot delete validated NIR', 400);
        return await nirModel.delete(id);
    }

    async validate(id, validatedBy) {
        try {
            return await nirModel.validate(id, validatedBy);
        } catch (err) {
            if (err.message.includes('not found')) throw new AppError(err.message, 404);
            if (err.message.includes('already validated')) throw new AppError(err.message, 400);
            throw err;
        }
    }

    async addPayment(id, paymentData) {
        if (!paymentData.amount || paymentData.amount <= 0) {
            throw new AppError('Valid payment amount is required', 400);
        }
        try {
            return await nirModel.addPayment(id, paymentData);
        } catch (err) {
            if (err.message.includes('not found')) throw new AppError(err.message, 404);
            if (err.message.includes('exceeds')) throw new AppError(err.message, 400);
            throw err;
        }
    }

    async getPayments(id) {
        await this.getById(id);
        return await nirModel.getPayments(id);
    }

    async getStatistics() {
        return await nirModel.getStatistics();
    }
}

module.exports = new NIRService();

