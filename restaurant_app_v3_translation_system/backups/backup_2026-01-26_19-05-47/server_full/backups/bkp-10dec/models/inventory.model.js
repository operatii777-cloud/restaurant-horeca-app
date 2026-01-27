// Inventory Model (Inventar)
// Purpose: Inventory management - stock counting and adjustments
// Created: 3 Dec 2025

const BaseModel = require('./base.model');

class InventoryModel extends BaseModel {
    constructor() {
        super('inventory_headers');
    }

    async findByDateRange(startDate, endDate) {
        const db = require('../config/database');
        return await db.all(`
            SELECT * FROM inventory_headers 
            WHERE DATE(document_date) BETWEEN DATE(?) AND DATE(?)
            ORDER BY document_date DESC
        `, [startDate, endDate]);
    }

    async findByLocation(location) {
        return await this.findAll({ location }, { orderBy: 'document_date DESC' });
    }

    async generateInventoryNumber() {
        const db = require('../config/database');
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const prefix = `INV-${year}${month}-`;
        
        const lastInventory = await db.get(`
            SELECT document_number FROM inventory_headers 
            WHERE document_number LIKE ? 
            ORDER BY id DESC LIMIT 1
        `, [`${prefix}%`]);

        if (!lastInventory) {
            return `${prefix}0001`;
        }

        const lastNumber = parseInt(lastInventory.document_number.split('-')[2]);
        return `${prefix}${String(lastNumber + 1).padStart(4, '0')}`;
    }

    async createInventory(data) {
        const db = require('../config/database');
        
        if (!data.document_number) {
            data.document_number = await this.generateInventoryNumber();
        }

        // Salvează header
        const headerData = {
            document_number: data.document_number,
            document_date: data.document_date || new Date().toISOString().split('T')[0],
            location: data.location || 'Gestiune Principală',
            responsible: data.responsible || 'admin',
            notes: data.notes || null,
            created_by: data.created_by || null,
            created_at: new Date().toISOString()
        };

        const headerId = await this.create(headerData);

        // Salvează lines
        if (data.lines && Array.isArray(data.lines)) {
            for (const line of data.lines) {
                if (!line.ingredient_id) continue;

                await db.run(`
                    INSERT INTO inventory_lines (
                        inventory_id,
                        ingredient_id,
                        unit,
                        stock_system,
                        stock_counted,
                        diff_qty,
                        diff_value,
                        cost_unit,
                        created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    headerId,
                    line.ingredient_id,
                    line.unit || '',
                    line.stock_system || 0,
                    line.stock_counted || 0,
                    line.diff || 0,
                    (line.diff || 0) * (line.cost_unit || 0),
                    line.cost_unit || 0,
                    new Date().toISOString()
                ]);
            }
        }

        return await this.getWithItems(headerId);
    }

    async updateInventory(id, data) {
        const db = require('../config/database');
        
        const existing = await this.findById(id);
        if (!existing) {
            throw new Error(`Inventory with ID ${id} not found`);
        }

        // Actualizează header
        const headerData = {
            document_date: data.document_date,
            location: data.location,
            responsible: data.responsible,
            notes: data.notes,
            updated_at: new Date().toISOString()
        };

        await this.update(id, headerData);

        // Șterge lines vechi și inserează noi
        if (data.lines && Array.isArray(data.lines)) {
            await db.run(`DELETE FROM inventory_lines WHERE inventory_id = ?`, [id]);

            for (const line of data.lines) {
                if (!line.ingredient_id) continue;

                await db.run(`
                    INSERT INTO inventory_lines (
                        inventory_id,
                        ingredient_id,
                        unit,
                        stock_system,
                        stock_counted,
                        diff_qty,
                        diff_value,
                        cost_unit,
                        created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    id,
                    line.ingredient_id,
                    line.unit || '',
                    line.stock_system || 0,
                    line.stock_counted || 0,
                    line.diff || 0,
                    (line.diff || 0) * (line.cost_unit || 0),
                    line.cost_unit || 0,
                    new Date().toISOString()
                ]);
            }
        }

        return await this.getWithItems(id);
    }

    async getWithItems(id) {
        const db = require('../config/database');
        
        const header = await this.findById(id);
        if (!header) {
            throw new Error(`Inventory with ID ${id} not found`);
        }

        const lines = await db.all(`
            SELECT 
                il.*,
                i.name as ingredient_name,
                i.unit as ingredient_unit,
                i.cost_per_unit as ingredient_cost
            FROM inventory_lines il
            JOIN ingredients i ON i.id = il.ingredient_id
            WHERE il.inventory_id = ?
            ORDER BY i.name
        `, [id]);

        return {
            ...header,
            lines: lines
        };
    }

    async finalize(id, finalizedBy) {
        const db = require('../config/database');
        
        const inventory = await this.getWithItems(id);
        if (!inventory) {
            throw new Error(`Inventory with ID ${id} not found`);
        }

        console.log(`🔥 INVENTAR #${id}: Început finalizare cu ${inventory.lines.length} ingrediente`);

        // 🔥 LOGICĂ CRITICĂ: Ajustare stocuri bazat pe diferențe
        for (const line of inventory.lines) {
            const diff = parseFloat(line.diff_qty) || 0;
            
            if (diff === 0) {
                console.log(`  ⚪ Ingredient ${line.ingredient_id} (${line.ingredient_name}): Fără diferențe`);
                continue; // Skip dacă nu e diferență
            }

            // Obține stocul curent din ingredient_batches
            const batches = await db.all(`
                SELECT * FROM ingredient_batches 
                WHERE ingredient_id = ? AND remaining_quantity > 0
                ORDER BY purchase_date ASC, id ASC
            `, [line.ingredient_id]);

            const totalInBatches = batches.reduce((sum, b) => sum + parseFloat(b.remaining_quantity || 0), 0);

            console.log(`  📊 Ingredient ${line.ingredient_id} (${line.ingredient_name}):`);
            console.log(`     Scriptic: ${line.stock_system}, Faptic: ${line.stock_counted}, Diferență: ${diff}`);
            console.log(`     Stoc în loturi: ${totalInBatches}`);

            if (diff > 0) {
                // 🔥 PLUS - Crește stocul (găsit mai mult decât era în sistem)
                // Soluție: Adaugă un lot nou cu diferența
                const batchNumber = `INV-ADJUST-${inventory.document_number}-${line.ingredient_id}`;
                
                await db.run(`
                    INSERT INTO ingredient_batches (
                        ingredient_id,
                        batch_number,
                        barcode,
                        quantity,
                        remaining_quantity,
                        purchase_date,
                        supplier,
                        invoice_number,
                        unit_cost,
                        location_id,
                        created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    line.ingredient_id,
                    batchNumber,
                    null,
                    Math.abs(diff),
                    Math.abs(diff),
                    inventory.document_date,
                    `Ajustare Inventar +`,
                    inventory.document_number,
                    line.cost_unit || 0,
                    1,
                    new Date().toISOString()
                ]);

                console.log(`     ✅ PLUS: Creat lot ${batchNumber} cu +${Math.abs(diff)} ${line.unit}`);

            } else if (diff < 0) {
                // 🔥 MINUS - Scade stocul (lipsă în inventar)
                // Soluție: Scade din loturi existente (FIFO)
                let remainingToDeduct = Math.abs(diff);

                for (const batch of batches) {
                    if (remainingToDeduct <= 0) break;

                    const batchQty = parseFloat(batch.remaining_quantity) || 0;
                    const deductFromThisBatch = Math.min(remainingToDeduct, batchQty);

                    await db.run(`
                        UPDATE ingredient_batches 
                        SET remaining_quantity = remaining_quantity - ?
                        WHERE id = ?
                    `, [deductFromThisBatch, batch.id]);

                    remainingToDeduct -= deductFromThisBatch;

                    console.log(`     ✅ MINUS: Scăzut ${deductFromThisBatch} din lot ${batch.batch_number} (rămân: ${batchQty - deductFromThisBatch})`);
                }

                if (remainingToDeduct > 0) {
                    console.warn(`     ⚠️ ATENȚIE: Nu s-au putut scădea ${remainingToDeduct} ${line.unit} - stoc insuficient în loturi!`);
                }
            }

            // Înregistrează mișcarea în stock_moves (audit trail)
            await db.run(`
                INSERT INTO stock_moves (
                    ingredient_id,
                    quantity,
                    move_type,
                    reference,
                    notes,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?)
            `, [
                line.ingredient_id,
                diff,
                diff > 0 ? 'INVENTORY_ADJUST_PLUS' : 'INVENTORY_ADJUST_MINUS',
                inventory.document_number,
                `Inventar: ${line.stock_system} → ${line.stock_counted}`,
                new Date().toISOString()
            ]);
        }

        // Trigger-ul va actualiza automat cost_per_unit pentru ingredientele cu loturi noi!
        console.log(`✅ INVENTAR #${id}: Finalizare completă! Toate ajustările aplicate.`);

        // Actualizează statusul inventory (adaugă coloană status dacă nu există)
        return await this.update(id, {
            finalized_by: finalizedBy,
            finalized_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
    }

    async getStatistics() {
        const db = require('../config/database');
        
        const all = await this.findAll({});
        
        const totalInventories = all.length;
        
        const thisMonth = new Date();
        thisMonth.setDate(1);
        const thisMonthInventories = all.filter(i => new Date(i.document_date) >= thisMonth);

        // Calculează diferențe totale
        const allLines = await db.all(`
            SELECT SUM(ABS(diff_qty)) as total_diff
            FROM inventory_lines
        `);

        return {
            total: totalInventories,
            this_month: thisMonthInventories.length,
            total_differences: allLines[0]?.total_diff || 0
        };
    }
}

module.exports = new InventoryModel();

