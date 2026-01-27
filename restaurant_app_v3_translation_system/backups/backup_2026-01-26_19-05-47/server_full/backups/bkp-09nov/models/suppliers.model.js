// Suppliers Model
// Purpose: Supplier management
// Created: 21 Oct 2025, 21:35
// Part of: BATCH #8 - Suppliers Module

const BaseModel = require('./base.model');

class SuppliersModel extends BaseModel {
    constructor() {
        super('suppliers');
    }

    async findActive() {
        return await this.findAll({ is_active: 1 }, { orderBy: 'name' });
    }

    async findByName(name) {
        return await this.findOne({ name });
    }

    async findByCUI(cui) {
        return await this.findOne({ cui });
    }

    async nameExists(name, excludeId = null) {
        const existing = await this.findByName(name);
        if (!existing) return false;
        if (excludeId && existing.id === excludeId) return false;
        return true;
    }

    async cuiExists(cui, excludeId = null) {
        if (!cui) return false;
        const existing = await this.findByCUI(cui);
        if (!existing) return false;
        if (excludeId && existing.id === excludeId) return false;
        return true;
    }

    async createSupplier(data) {
        if (await this.nameExists(data.name)) {
            throw new Error(`Supplier with name "${data.name}" already exists`);
        }

        if (data.cui && await this.cuiExists(data.cui)) {
            throw new Error(`Supplier with CUI "${data.cui}" already exists`);
        }

        const supplierData = {
            name: data.name,
            cui: data.cui || null,
            reg_number: data.reg_number || null,
            address: data.address || null,
            phone: data.phone || null,
            email: data.email || null,
            contact_person: data.contact_person || null,
            payment_terms: data.payment_terms || 30,
            is_active: data.is_active !== undefined ? data.is_active : 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        return await this.create(supplierData);
    }

    async updateSupplier(id, data) {
        const existing = await this.findById(id);
        if (!existing) {
            throw new Error(`Supplier with ID ${id} not found`);
        }

        if (data.name && data.name !== existing.name) {
            if (await this.nameExists(data.name, id)) {
                throw new Error(`Supplier with name "${data.name}" already exists`);
            }
        }

        if (data.cui && data.cui !== existing.cui) {
            if (await this.cuiExists(data.cui, id)) {
                throw new Error(`Supplier with CUI "${data.cui}" already exists`);
            }
        }

        data.updated_at = new Date().toISOString();
        return await this.update(id, data);
    }

    async getStatistics() {
        const all = await this.findAll();
        const active = all.filter(s => s.is_active === 1);
        
        return {
            total: all.length,
            active: active.length,
            inactive: all.length - active.length
        };
    }

    async getWithIngredientCounts() {
        const db = require('../config/database');
        return await db.all(`
            SELECT 
                s.*,
                COUNT(i.id) as ingredient_count
            FROM suppliers s
            LEFT JOIN ingredients i ON i.supplier_id = s.id AND i.is_active = 1
            WHERE s.is_active = 1
            GROUP BY s.id
            ORDER BY s.name
        `);
    }

    async getWithNIRStats() {
        const db = require('../config/database');
        return await db.all(`
            SELECT 
                s.*,
                COUNT(DISTINCT n.id) as nir_count,
                COALESCE(SUM(n.total_value), 0) as total_purchases,
                COALESCE(SUM(n.remaining_value), 0) as total_outstanding
            FROM suppliers s
            LEFT JOIN nir_documents n ON n.supplier_id = s.id
            WHERE s.is_active = 1
            GROUP BY s.id
            ORDER BY s.name
        `);
    }
}

module.exports = new SuppliersModel();

