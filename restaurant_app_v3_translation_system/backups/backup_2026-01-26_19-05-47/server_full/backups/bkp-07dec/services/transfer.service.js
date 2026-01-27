/**
 * TRANSFER SERVICE - Workflow 4 steps pentru transferuri
 * Data: 03 Decembrie 2025
 * Steps: Request → Approve → Execute → Confirm
 */

const db = require('../config/database');

class TransferService {
  
  /**
   * STEP 1: Creare cerere transfer
   */
  async createRequest(fromLocationId, toLocationId, items, requestedBy, notes) {
    const transferNumber = await this.generateTransferNumber();
    
    const transfer = await this.create({
      transfer_number: transferNumber,
      from_location_id: fromLocationId,
      to_location_id: toLocationId,
      transfer_date: new Date().toISOString().split('T')[0],
      status: 'pending',
      requested_by: requestedBy,
      notes,
      total_items: items.length
    });
    
    // Adaugă items
    for (const item of items) {
      await this.addItem(transfer.id, item);
    }
    
    console.log(`✅ Transfer request created: ${transferNumber}`);
    
    return transfer;
  }
  
  /**
   * STEP 2: Aprobare transfer (de către manager)
   */
  async approve(transferId, approvedBy) {
    const transfer = await this.getById(transferId);
    
    if (transfer.status !== 'pending') {
      throw new Error(`Transfer must be pending. Current status: ${transfer.status}`);
    }
    
    // Verifică stoc disponibil
    const items = await this.getItems(transferId);
    
    for (const item of items) {
      const available = await this.checkStock(item.ingredient_id, transfer.from_location_id);
      
      if (available < item.quantity) {
        throw new Error(`Insufficient stock for ${item.ingredient_name}: available ${available}, needed ${item.quantity}`);
      }
    }
    
    await this.update(transferId, {
      status: 'approved',
      approved_by: approvedBy,
      approved_at: new Date().toISOString()
    });
    
    console.log(`✅ Transfer ${transfer.transfer_number} approved by ${approvedBy}`);
    
    return this.getById(transferId);
  }
  
  /**
   * STEP 3: Execuție transfer (mută stocul efectiv)
   */
  async execute(transferId) {
    const transfer = await this.getById(transferId);
    
    if (transfer.status !== 'approved') {
      throw new Error(`Transfer must be approved. Current status: ${transfer.status}`);
    }
    
    const items = await this.getItems(transferId);
    
    for (const item of items) {
      // Scade FIFO din FROM location
      const batchesUsed = await this.decreaseStockFIFO(
        item.ingredient_id,
        transfer.from_location_id,
        item.quantity
      );
      
      // Adaugă batch NOU în TO location
      for (const batch of batchesUsed) {
        await this.createBatchInDestination(
          item.ingredient_id,
          transfer.to_location_id,
          batch.quantity_used,
          batch.unit_cost,
          `TRF-${batch.batch_number}`,
          batch.expiry_date
        );
      }
    }
    
    await this.update(transferId, {
      status: 'in_transit',
      executed_at: new Date().toISOString()
    });
    
    console.log(`✅ Transfer ${transfer.transfer_number} executed`);
    
    return this.getById(transferId);
  }
  
  /**
   * STEP 4: Confirmare recepție (de către destinație)
   */
  async confirm(transferId, confirmedBy, actualQuantities = null) {
    const transfer = await this.getById(transferId);
    
    if (transfer.status !== 'in_transit') {
      throw new Error(`Transfer must be in transit. Current status: ${transfer.status}`);
    }
    
    // Dacă sunt diferențe în cantități, le înregistrează
    if (actualQuantities) {
      await this.recordQuantityDifferences(transferId, actualQuantities);
    }
    
    await this.update(transferId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      confirmed_by: confirmedBy
    });
    
    console.log(`✅ Transfer ${transfer.transfer_number} confirmed by ${confirmedBy}`);
    
    return this.getById(transferId);
  }
  
  // CRUD & Helpers
  async create(data) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);
      
      db.run(`INSERT INTO stock_transfers (${fields}) VALUES (${placeholders})`, values, function(err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, ...data });
      });
    });
  }
  
  async getById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM stock_transfers WHERE id = ?', [id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }
  
  async update(id, updates) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(updates), id];
      
      db.run(`UPDATE stock_transfers SET ${fields} WHERE id = ?`, values, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
  
  async addItem(transferId, itemData) {
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO transfer_items (
          transfer_id, ingredient_id, quantity, unit, unit_cost
        ) VALUES (?, ?, ?, ?, ?)
      `, [transferId, itemData.ingredient_id, itemData.quantity, itemData.unit, itemData.unit_cost], function(err) {
        if (err) return reject(err);
        resolve({ id: this.lastID });
      });
    });
  }
  
  async getItems(transferId) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT ti.*, i.name as ingredient_name
        FROM transfer_items ti
        JOIN ingredients i ON i.id = ti.ingredient_id
        WHERE ti.transfer_id = ?
      `, [transferId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }
  
  async generateTransferNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `TRF-${year}${month}${day}-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;
  }
  
  async checkStock(ingredientId, locationId) {
    // TODO: Implement
    return 1000;
  }
  
  async decreaseStockFIFO(ingredientId, locationId, quantity) {
    // TODO: Implement
    return [];
  }
  
  async createBatchInDestination(ingredientId, locationId, quantity, unitCost, batchNumber, expiryDate) {
    // TODO: Implement
    return true;
  }
  
  async recordQuantityDifferences(transferId, actualQuantities) {
    // TODO: Implement
    return true;
  }
}

module.exports = new TransferService();

