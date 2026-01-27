// NIR Model (Notes Intrare Recepție - Receiving Notes)
// Purpose: Purchase order and stock receipt management
// Created: 21 Oct 2025, 22:45

const BaseModel = require('./base.model');

class NIRModel extends BaseModel {
    constructor() {
        super('nir_documents');
    }

    async findByStatus(status) {
        return await this.findAll({ status }, { orderBy: 'nir_date DESC' });
    }

    async findBySupplier(supplierId) {
        return await this.findAll({ supplier_id: supplierId }, { orderBy: 'nir_date DESC' });
    }

    async findUnpaid() {
        const db = require('../config/database');
        return await db.all(`
            SELECT * FROM nir_documents 
            WHERE remaining_value > 0 
            ORDER BY nir_date DESC
        `);
    }

    async findByDateRange(startDate, endDate) {
        const db = require('../config/database');
        return await db.all(`
            SELECT * FROM nir_documents 
            WHERE DATE(nir_date) BETWEEN DATE(?) AND DATE(?)
            ORDER BY nir_date DESC
        `, [startDate, endDate]);
    }

    async generateNIRNumber() {
        const db = require('../config/database');
        const year = new Date().getFullYear();
        const prefix = `NIR-${year}-`;
        
        const lastNIR = await db.get(`
            SELECT nir_number FROM nir_documents 
            WHERE nir_number LIKE ? 
            ORDER BY id DESC LIMIT 1
        `, [`${prefix}%`]);

        if (!lastNIR) {
            return `${prefix}0001`;
        }

        const lastNumber = parseInt(lastNIR.nir_number.split('-')[2]);
        return `${prefix}${String(lastNumber + 1).padStart(4, '0')}`;
    }

    async createNIR(data) {
        if (!data.nir_number) {
            data.nir_number = await this.generateNIRNumber();
        }

        const nirData = {
            nir_number: data.nir_number,
            nir_date: data.nir_date || new Date().toISOString().split('T')[0],
            supplier_id: data.supplier_id,
            gestiune_id: data.gestiune_id || null,
            total_value: data.total_value || 0,
            vat_value: data.vat_value || 0,
            paid_value: data.paid_value || 0,
            remaining_value: (data.total_value || 0) - (data.paid_value || 0),
            status: data.status || 'draft',
            validated_by: data.validated_by || null,
            validated_at: data.validated_at || null,
            notes: data.notes || null,
            created_by: data.created_by || null,
            created_at: new Date().toISOString()
        };

        return await this.create(nirData);
    }

    async updateNIR(id, data) {
        const existing = await this.findById(id);
        if (!existing) {
            throw new Error(`NIR with ID ${id} not found`);
        }

        if (existing.status === 'validated' && data.status !== 'validated') {
            throw new Error('Cannot modify validated NIR');
        }

        if (data.total_value !== undefined || data.paid_value !== undefined) {
            const totalValue = data.total_value !== undefined ? data.total_value : existing.total_value;
            const paidValue = data.paid_value !== undefined ? data.paid_value : existing.paid_value;
            data.remaining_value = totalValue - paidValue;
        }

        return await this.update(id, data);
    }

    async validate(id, validatedBy) {
        const db = require('../config/database');
        
        const nir = await this.findById(id);
        if (!nir) {
            throw new Error(`NIR with ID ${id} not found`);
        }

        if (nir.status === 'validated') {
            throw new Error('NIR is already validated');
        }

        // 🔥 FIX CRITIC: Obține items-urile NIR-ului
        const items = await db.all(`
            SELECT * FROM nir_items 
            WHERE nir_id = ? AND product_type = 'ingredient'
        `, [id]);

        console.log(`✅ NIR #${id}: Validare cu ${items.length} ingrediente`);

        // 🔥 FIX CRITIC: Pentru fiecare ingredient, inserează în ingredient_batches
        for (const item of items) {
            const batchNumber = `NIR-${nir.nir_number}-${item.product_id}`;
            
            await db.run(`
                INSERT INTO ingredient_batches (
                    ingredient_id,
                    batch_number,
                    barcode,
                    quantity,
                    remaining_quantity,
                    purchase_date,
                    expiry_date,
                    supplier,
                    invoice_number,
                    unit_cost,
                    location_id,
                    supplier_id,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                item.product_id,                        // ingredient_id
                batchNumber,                            // batch_number
                null,                                   // barcode
                item.quantity,                          // quantity
                item.quantity,                          // remaining_quantity (inițial = quantity)
                nir.nir_date,                          // purchase_date
                null,                                   // expiry_date (opțional)
                nir.supplier_name || null,             // supplier (nume)
                nir.nir_number,                        // invoice_number
                item.purchase_price_unit,              // unit_cost
                nir.gestiune_id || 1,                  // location_id
                nir.supplier_id,                       // supplier_id
                new Date().toISOString()               // created_at
            ]);

            console.log(`  ✅ Lot creat: ${batchNumber}, ingredient ${item.product_id}, qty: ${item.quantity}, cost: ${item.purchase_price_unit} RON`);
        }

        // Trigger-ul `update_average_cost_on_nir` va actualiza automat:
        // - ingredients.cost_per_unit (cost mediu ponderat)
        // - ingredients.last_updated

        console.log(`✅ NIR #${id}: Validare completă! Trigger-ul a actualizat automat costurile medii.`);

        // Actualizează statusul NIR-ului
        return await this.update(id, {
            status: 'validated',
            validated_by: validatedBy,
            validated_at: new Date().toISOString()
        });
    }

    async getWithItems(id) {
        const db = require('../config/database');
        
        const nir = await this.findById(id);
        if (!nir) {
            throw new Error(`NIR with ID ${id} not found`);
        }

        const items = await db.all(`
            SELECT 
                ni.*,
                i.name as ingredient_name,
                i.unit as ingredient_unit
            FROM nir_items ni
            JOIN ingredients i ON i.id = ni.ingredient_id
            WHERE ni.nir_id = ?
            ORDER BY i.name
        `, [id]);

        return {
            ...nir,
            items: items
        };
    }

    async getPayments(id) {
        const db = require('../config/database');
        return await db.all(`
            SELECT * FROM nir_payments 
            WHERE nir_id = ? 
            ORDER BY payment_date DESC
        `, [id]);
    }

    async addPayment(nirId, paymentData) {
        const db = require('../config/database');
        const nir = await this.findById(nirId);
        
        if (!nir) {
            throw new Error(`NIR with ID ${nirId} not found`);
        }

        if (paymentData.amount > nir.remaining_value) {
            throw new Error(`Payment amount (${paymentData.amount}) exceeds remaining value (${nir.remaining_value})`);
        }

        await db.run(`
            INSERT INTO nir_payments (nir_id, payment_date, amount, payment_method, account_id, paid_by, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            nirId,
            paymentData.payment_date || new Date().toISOString(),
            paymentData.amount,
            paymentData.payment_method || 'cash',
            paymentData.account_id || null,
            paymentData.paid_by || null,
            paymentData.notes || null
        ]);

        const newPaidValue = parseFloat(nir.paid_value) + parseFloat(paymentData.amount);
        const newStatus = newPaidValue >= parseFloat(nir.total_value) ? 'paid' : 'partial_paid';

        await this.update(nirId, {
            paid_value: newPaidValue,
            remaining_value: parseFloat(nir.total_value) - newPaidValue,
            status: newStatus
        });

        return await this.findById(nirId);
    }

    async getStatistics() {
        const db = require('../config/database');
        
        const all = await this.findAll({});
        const draft = all.filter(n => n.status === 'draft');
        const validated = all.filter(n => n.status === 'validated');
        const unpaid = all.filter(n => n.remaining_value > 0);
        
        const totalValue = all.reduce((sum, n) => sum + parseFloat(n.total_value || 0), 0);
        const totalUnpaid = all.reduce((sum, n) => sum + parseFloat(n.remaining_value || 0), 0);

        const thisMonth = new Date();
        thisMonth.setDate(1);
        const thisMonthNIRs = all.filter(n => new Date(n.nir_date) >= thisMonth);
        const thisMonthValue = thisMonthNIRs.reduce((sum, n) => sum + parseFloat(n.total_value || 0), 0);

        return {
            total: all.length,
            draft: draft.length,
            validated: validated.length,
            unpaid: unpaid.length,
            total_value: totalValue,
            total_unpaid: totalUnpaid,
            this_month_count: thisMonthNIRs.length,
            this_month_value: thisMonthValue
        };
    }
}

module.exports = new NIRModel();

