// Cash Accounts Model
// Purpose: Cash, bank, and card account management
// Created: 21 Oct 2025, 21:35
// Part of: BATCH #10 - Cash Accounts Module

const BaseModel = require('./base.model');

class CashAccountsModel extends BaseModel {
    constructor() {
        super('cash_accounts');
    }

    async findActive() {
        return await this.findAll({ is_active: 1 }, { orderBy: 'account_name' });
    }

    async findByName(accountName) {
        return await this.findOne({ account_name: accountName });
    }

    async findByType(accountType) {
        return await this.findAll({ account_type: accountType, is_active: 1 }, { orderBy: 'account_name' });
    }

    async nameExists(accountName, excludeId = null) {
        const existing = await this.findByName(accountName);
        if (!existing) return false;
        if (excludeId && existing.id === excludeId) return false;
        return true;
    }

    async createAccount(data) {
        if (await this.nameExists(data.account_name)) {
            throw new Error(`Account with name "${data.account_name}" already exists`);
        }

        const validTypes = ['cash', 'bank', 'card'];
        if (data.account_type && !validTypes.includes(data.account_type)) {
            throw new Error(`Invalid account type. Must be one of: ${validTypes.join(', ')}`);
        }

        const accountData = {
            account_name: data.account_name,
            account_type: data.account_type || 'cash',
            bank_name: data.bank_name || null,
            iban: data.iban || null,
            current_balance: data.current_balance || 0,
            last_reconciliation_date: data.last_reconciliation_date || null,
            is_active: data.is_active !== undefined ? data.is_active : 1,
            created_at: new Date().toISOString()
        };

        return await this.create(accountData);
    }

    async updateAccount(id, data) {
        const existing = await this.findById(id);
        if (!existing) {
            throw new Error(`Account with ID ${id} not found`);
        }

        if (data.account_name && data.account_name !== existing.account_name) {
            if (await this.nameExists(data.account_name, id)) {
                throw new Error(`Account with name "${data.account_name}" already exists`);
            }
        }

        if (data.account_type) {
            const validTypes = ['cash', 'bank', 'card'];
            if (!validTypes.includes(data.account_type)) {
                throw new Error(`Invalid account type. Must be one of: ${validTypes.join(', ')}`);
            }
        }

        return await this.update(id, data);
    }

    async updateBalance(id, amount, isIncrease = true) {
        const account = await this.findById(id);
        if (!account) {
            throw new Error(`Account with ID ${id} not found`);
        }

        const newBalance = isIncrease 
            ? parseFloat(account.current_balance) + parseFloat(amount)
            : parseFloat(account.current_balance) - parseFloat(amount);

        if (newBalance < 0) {
            throw new Error(`Insufficient balance. Current: ${account.current_balance}, Attempted: ${amount}`);
        }

        return await this.update(id, { current_balance: newBalance });
    }

    async reconcile(id) {
        return await this.update(id, {
            last_reconciliation_date: new Date().toISOString()
        });
    }

    async getStatistics() {
        const all = await this.findAll();
        const active = all.filter(a => a.is_active === 1);
        
        const totalBalance = all.reduce((sum, a) => sum + parseFloat(a.current_balance || 0), 0);
        
        const byType = {
            cash: {
                count: all.filter(a => a.account_type === 'cash').length,
                balance: all
                    .filter(a => a.account_type === 'cash')
                    .reduce((sum, a) => sum + parseFloat(a.current_balance || 0), 0)
            },
            bank: {
                count: all.filter(a => a.account_type === 'bank').length,
                balance: all
                    .filter(a => a.account_type === 'bank')
                    .reduce((sum, a) => sum + parseFloat(a.current_balance || 0), 0)
            },
            card: {
                count: all.filter(a => a.account_type === 'card').length,
                balance: all
                    .filter(a => a.account_type === 'card')
                    .reduce((sum, a) => sum + parseFloat(a.current_balance || 0), 0)
            }
        };

        return {
            total: all.length,
            active: active.length,
            inactive: all.length - active.length,
            total_balance: totalBalance,
            by_type: byType
        };
    }

    async getWithMovements(days = 30) {
        const db = require('../config/database');
        const since = new Date();
        since.setDate(since.getDate() - days);

        return await db.all(`
            SELECT 
                ca.*,
                COUNT(DISTINCT cr.id) as movement_count,
                COALESCE(SUM(cr.payment), 0) as total_payments,
                COALESCE(SUM(cr.receipt), 0) as total_receipts
            FROM cash_accounts ca
            LEFT JOIN cash_register cr ON cr.account_id = ca.id 
                AND DATE(cr.entry_date) >= DATE(?)
            WHERE ca.is_active = 1
            GROUP BY ca.id
            ORDER BY ca.account_name
        `, [since.toISOString().split('T')[0]]);
    }
}

module.exports = new CashAccountsModel();

