// Stock Transfers Model
const BaseModel = require('./base.model');

class StockTransfersModel extends BaseModel {
    constructor() {
        super('stock_transfers');
    }

    async findByStatus(status) {
        return await this.findAll({ status }, { orderBy: 'transfer_date DESC' });
    }

    async findByGestiune(gestiuneId, direction = 'both') {
        const db = require('../config/database');
        let query;
        
        if (direction === 'from') {
            query = 'SELECT * FROM stock_transfers WHERE from_gestiune_id = ? ORDER BY transfer_date DESC';
        } else if (direction === 'to') {
            query = 'SELECT * FROM stock_transfers WHERE to_gestiune_id = ? ORDER BY transfer_date DESC';
        } else {
            query = 'SELECT * FROM stock_transfers WHERE from_gestiune_id = ? OR to_gestiune_id = ? ORDER BY transfer_date DESC';
            return await db.all(query, [gestiuneId, gestiuneId]);
        }
        
        return await db.all(query, [gestiuneId]);
    }

    async generateTransferNumber() {
        const db = require('../config/database');
        const year = new Date().getFullYear();
        const prefix = `TRAN-${year}-`;
        
        const lastTransfer = await db.get(`
            SELECT transfer_number FROM stock_transfers 
            WHERE transfer_number LIKE ? 
            ORDER BY id DESC LIMIT 1
        `, [`${prefix}%`]);

        if (!lastTransfer) {
            return `${prefix}0001`;
        }

        const lastNumber = parseInt(lastTransfer.transfer_number.split('-')[2]);
        return `${prefix}${String(lastNumber + 1).padStart(4, '0')}`;
    }

    async createTransfer(data) {
        if (!data.transfer_number) {
            data.transfer_number = await this.generateTransferNumber();
        }

        const transferData = {
            transfer_number: data.transfer_number,
            transfer_date: data.transfer_date || new Date().toISOString(),
            from_gestiune_id: data.from_gestiune_id,
            to_gestiune_id: data.to_gestiune_id,
            status: data.status || 'draft',
            sent_by: data.sent_by || null,
            received_by: data.received_by || null,
            received_at: data.received_at || null,
            notes: data.notes || null
        };

        return await this.create(transferData);
    }

    async updateTransfer(id, data) {
        const existing = await this.findById(id);
        if (!existing) {
            throw new Error(`Transfer with ID ${id} not found`);
        }

        if (existing.status === 'accepted' && data.status !== 'accepted') {
            throw new Error('Cannot modify accepted transfer');
        }

        return await this.update(id, data);
    }

    async send(id, sentBy) {
        const transfer = await this.findById(id);
        if (!transfer) {
            throw new Error(`Transfer with ID ${id} not found`);
        }

        if (transfer.status !== 'draft') {
            throw new Error('Only draft transfers can be sent');
        }

        return await this.update(id, {
            status: 'sent',
            sent_by: sentBy
        });
    }

    async accept(id, receivedBy) {
        const transfer = await this.findById(id);
        if (!transfer) {
            throw new Error(`Transfer with ID ${id} not found`);
        }

        if (transfer.status !== 'sent') {
            throw new Error('Only sent transfers can be accepted');
        }

        return await this.update(id, {
            status: 'accepted',
            received_by: receivedBy,
            received_at: new Date().toISOString()
        });
    }

    async getWithItems(id) {
        const db = require('../config/database');
        
        const transfer = await this.findById(id);
        if (!transfer) {
            throw new Error(`Transfer with ID ${id} not found`);
        }

        const items = await db.all(`
            SELECT 
                ti.*,
                i.name as ingredient_name,
                i.unit as ingredient_unit
            FROM transfer_items ti
            JOIN ingredients i ON i.id = ti.ingredient_id
            WHERE ti.transfer_id = ?
            ORDER BY i.name
        `, [id]);

        const fromGestiune = await db.get('SELECT name FROM gestiuni WHERE id = ?', [transfer.from_gestiune_id]);
        const toGestiune = await db.get('SELECT name FROM gestiuni WHERE id = ?', [transfer.to_gestiune_id]);

        return {
            ...transfer,
            from_gestiune_name: fromGestiune?.name,
            to_gestiune_name: toGestiune?.name,
            items: items
        };
    }

    async getStatistics() {
        const all = await this.findAll({});
        const draft = all.filter(t => t.status === 'draft');
        const sent = all.filter(t => t.status === 'sent');
        const accepted = all.filter(t => t.status === 'accepted');

        const thisMonth = new Date();
        thisMonth.setDate(1);
        const thisMonthTransfers = all.filter(t => new Date(t.transfer_date) >= thisMonth);

        return {
            total: all.length,
            draft: draft.length,
            sent: sent.length,
            accepted: accepted.length,
            this_month_count: thisMonthTransfers.length
        };
    }
}

module.exports = new StockTransfersModel();

