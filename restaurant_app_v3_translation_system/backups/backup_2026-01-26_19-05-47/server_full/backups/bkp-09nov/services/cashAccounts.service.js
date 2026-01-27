// Cash Accounts Service
// Purpose: Business logic for cash account operations
// Created: 21 Oct 2025, 21:40

const cashAccountsModel = require('../models/cashAccounts.model');
const { AppError } = require('../middleware/errorHandler');

class CashAccountsService {
    async getAll(filters = {}) {
        if (filters.active_only) {
            return await cashAccountsModel.findActive();
        }
        if (filters.type) {
            return await cashAccountsModel.findByType(filters.type);
        }
        return await cashAccountsModel.findAll({}, { orderBy: 'account_name' });
    }

    async getById(id) {
        const account = await cashAccountsModel.findById(id);
        if (!account) {
            throw new AppError(`Cash account with ID ${id} not found`, 404);
        }
        return account;
    }

    async create(data) {
        if (!data.account_name || data.account_name.trim() === '') {
            throw new AppError('Account name is required', 400);
        }

        try {
            const id = await cashAccountsModel.createAccount(data);
            return await cashAccountsModel.findById(id);
        } catch (err) {
            if (err.message.includes('already exists')) {
                throw new AppError(err.message, 409);
            }
            if (err.message.includes('Invalid account type')) {
                throw new AppError(err.message, 400);
            }
            throw err;
        }
    }

    async update(id, data) {
        try {
            const updated = await cashAccountsModel.updateAccount(id, data);
            return updated;
        } catch (err) {
            if (err.message.includes('not found')) {
                throw new AppError(err.message, 404);
            }
            if (err.message.includes('already exists')) {
                throw new AppError(err.message, 409);
            }
            if (err.message.includes('Invalid account type')) {
                throw new AppError(err.message, 400);
            }
            throw err;
        }
    }

    async delete(id) {
        const account = await cashAccountsModel.findById(id);
        if (!account) {
            throw new AppError(`Cash account with ID ${id} not found`, 404);
        }

        // Check if account is in use
        const db = require('../config/database');
        const movementsCount = await db.get(
            'SELECT COUNT(*) as count FROM cash_register WHERE account_id = ?',
            [id]
        );

        if (movementsCount.count > 0) {
            throw new AppError(
                `Cannot delete account. It has ${movementsCount.count} movement(s).`,
                400
            );
        }

        return await cashAccountsModel.softDelete(id);
    }

    async restore(id) {
        const account = await cashAccountsModel.findById(id);
        if (!account) {
            throw new AppError(`Cash account with ID ${id} not found`, 404);
        }

        if (account.is_active === 1) {
            throw new AppError('Account is already active', 400);
        }

        return await cashAccountsModel.restore(id);
    }

    async adjustBalance(id, amount, isIncrease = true) {
        if (typeof amount !== 'number' || amount <= 0) {
            throw new AppError('Amount must be a positive number', 400);
        }

        try {
            const updated = await cashAccountsModel.updateBalance(id, amount, isIncrease);
            return updated;
        } catch (err) {
            if (err.message.includes('not found')) {
                throw new AppError(err.message, 404);
            }
            if (err.message.includes('Insufficient balance')) {
                throw new AppError(err.message, 400);
            }
            throw err;
        }
    }

    async reconcile(id) {
        const account = await cashAccountsModel.findById(id);
        if (!account) {
            throw new AppError(`Cash account with ID ${id} not found`, 404);
        }

        return await cashAccountsModel.reconcile(id);
    }

    async getStatistics() {
        return await cashAccountsModel.getStatistics();
    }

    async getWithMovements(days = 30) {
        if (typeof days !== 'number' || days < 1) {
            throw new AppError('Days must be a positive number', 400);
        }
        return await cashAccountsModel.getWithMovements(days);
    }

    async bulkCreate(accountsArray) {
        const results = [];
        for (const accountData of accountsArray) {
            try {
                const account = await this.create(accountData);
                results.push({ success: true, data: account });
            } catch (err) {
                results.push({ success: false, error: err.message, data: accountData });
            }
        }
        return results;
    }

    async bulkUpdate(updates) {
        const results = [];
        for (const { id, data } of updates) {
            try {
                const account = await this.update(id, data);
                results.push({ success: true, data: account });
            } catch (err) {
                results.push({ success: false, error: err.message, id });
            }
        }
        return results;
    }

    async bulkDelete(ids) {
        const results = [];
        for (const id of ids) {
            try {
                const account = await this.delete(id);
                results.push({ success: true, data: account });
            } catch (err) {
                results.push({ success: false, error: err.message, id });
            }
        }
        return results;
    }
}

module.exports = new CashAccountsService();

