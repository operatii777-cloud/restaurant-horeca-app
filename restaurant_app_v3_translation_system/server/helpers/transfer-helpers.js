// server/helpers/transfer-helpers.js
// Funcții helper pentru Transferuri Între Gestiuni (ETAPA 2)

const { dbPromise } = require('../database');

/**
 * ==================== TRANSFERS ====================
 */

/**
 * Generează număr unic de transfer
 * Format: TRF-YYYYMMDD-XXXXX
 */
function generateTransferNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 99999)).padStart(5, '0');
  return `TRF-${year}${month}${day}-${random}`;
}

/**
 * Obține toate transferurile cu filtre opționale
 * @param {Object} filters - Filtre (status, from_location, to_location, date_from, date_to)
 * @returns {Promise<Array>} Lista transferuri
 */
async function getAllTransfers(filters = {}) {
  const db = await dbPromise;
  let query = `
    SELECT 
      st.*,
      fl.name as from_location_name,
      tl.name as to_location_name
    FROM stock_transfers st
    LEFT JOIN management_locations fl ON st.from_location_id = fl.id
    LEFT JOIN management_locations tl ON st.to_location_id = tl.id
    WHERE 1=1
  `;
  const params = [];

  if (filters.status) {
    query += ' AND st.status = ?';
    params.push(filters.status);
  }

  if (filters.from_location_id) {
    query += ' AND st.from_location_id = ?';
    params.push(filters.from_location_id);
  }

  if (filters.to_location_id) {
    query += ' AND st.to_location_id = ?';
    params.push(filters.to_location_id);
  }

  if (filters.date_from) {
    query += ' AND st.transfer_date >= ?';
    params.push(filters.date_from);
  }

  if (filters.date_to) {
    query += ' AND st.transfer_date <= ?';
    params.push(filters.date_to);
  }

  query += ' ORDER BY st.created_at DESC';

  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('❌ Eroare la obținere transferuri:', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

/**
 * Obține un transfer după ID
 * @param {number} transferId - ID-ul transferului
 * @returns {Promise<Object>} Transfer cu detalii complete
 */
async function getTransferById(transferId) {
  const db = await dbPromise;
  
  // Obține header-ul transferului
  const transfer = await new Promise((resolve, reject) => {
    db.get(`
      SELECT 
        st.*,
        fl.name as from_location_name,
        tl.name as to_location_name
      FROM stock_transfers st
      LEFT JOIN management_locations fl ON st.from_location_id = fl.id
      LEFT JOIN management_locations tl ON st.to_location_id = tl.id
      WHERE st.id = ?
    `, [transferId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

  if (!transfer) {
    return null;
  }

  // Obține items-urile transferului
  const items = await new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        ti.*,
        i.name as ingredient_name,
        i.unit as ingredient_unit
      FROM transfer_items ti
      LEFT JOIN ingredients i ON ti.ingredient_id = i.id
      WHERE ti.transfer_id = ?
      ORDER BY i.name
    `, [transferId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  return {
    ...transfer,
    items: items
  };
}

/**
 * Verifică stoc disponibil pentru transfer
 * @param {number} ingredientId - ID ingredient
 * @param {number} locationId - ID locație sursă
 * @param {number} quantityNeeded - Cantitate necesară
 * @returns {Promise<Object>} {available: boolean, current_stock: number}
 */
async function checkStockAvailability(ingredientId, locationId, quantityNeeded) {
  const db = await dbPromise;
  
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT 
        i.id,
        i.name,
        i.unit,
        COALESCE(i.current_stock, 0) as current_stock
      FROM ingredients i
      WHERE i.id = ? AND i.location_id = ?
    `, [ingredientId, locationId], (err, row) => {
      if (err) {
        reject(err);
      } else {
        const available = row && row.current_stock >= quantityNeeded;
        resolve({
          available,
          current_stock: row ? row.current_stock : 0,
          ingredient_name: row ? row.name : null,
          quantity_needed: quantityNeeded
        });
      }
    });
  });
}

/**
 * Creează un transfer nou
 * @param {Object} transferData - Datele transferului
 * @param {Array} items - Lista de ingrediente pentru transfer
 * @returns {Promise<number>} ID-ul transferului creat
 */
async function createTransfer(transferData, items) {
  const db = await dbPromise;
  
  const {
    from_location_id,
    to_location_id,
    transfer_date,
    requested_by,
    notes = ''
  } = transferData;

  // Validare locații diferite
  if (from_location_id === to_location_id) {
    throw new Error('Locația sursă și destinație trebuie să fie diferite');
  }

  // Validare items
  if (!items || items.length === 0) {
    throw new Error('Transferul trebuie să conțină cel puțin un ingredient');
  }

  // Verifică stoc disponibil pentru toate items
  for (const item of items) {
    const availability = await checkStockAvailability(
      item.ingredient_id,
      from_location_id,
      item.quantity
    );
    
    if (!availability.available) {
      throw new Error(
        `Stoc insuficient pentru ${availability.ingredient_name}. ` +
        `Disponibil: ${availability.current_stock} ${item.unit}, ` +
        `Necesar: ${item.quantity} ${item.unit}`
      );
    }
  }

  // Generează număr transfer
  const transferNumber = generateTransferNumber();

  // Calculează total value
  const totalValue = items.reduce((sum, item) => sum + (item.quantity * (item.unit_cost || 0)), 0);
  const totalItems = items.length;

  // Creează transferul
  const transferId = await new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO stock_transfers (
        transfer_number,
        from_location_id,
        to_location_id,
        transfer_date,
        requested_by,
        status,
        notes,
        total_items,
        total_value,
        created_at
      ) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, CURRENT_TIMESTAMP)
    `, [
      transferNumber,
      from_location_id,
      to_location_id,
      transfer_date,
      requested_by,
      notes,
      totalItems,
      totalValue
    ], function(err) {
      if (err) {
        console.error('❌ Eroare la creare transfer:', err);
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });

  // Adaugă items
  for (const item of items) {
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO transfer_items (
          transfer_id,
          ingredient_id,
          quantity,
          unit,
          unit_cost,
          total_cost,
          batch_number,
          expiry_date,
          notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        transferId,
        item.ingredient_id,
        item.quantity,
        item.unit,
        item.unit_cost || 0,
        item.quantity * (item.unit_cost || 0),
        item.batch_number || null,
        item.expiry_date || null,
        item.notes || null
      ], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  console.log(`✅ Transfer ${transferNumber} creat cu succes (ID: ${transferId})`);
  return transferId;
}

/**
 * Actualizează statusul unui transfer
 * @param {number} transferId - ID transfer
 * @param {string} newStatus - Noul status
 * @param {string} approvedBy - Utilizatorul care aprobă
 * @returns {Promise<boolean>} Success status
 */
async function updateTransferStatus(transferId, newStatus, approvedBy = null) {
  const db = await dbPromise;
  
  const validStatuses = ['pending', 'approved', 'rejected', 'completed', 'cancelled'];
  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Status invalid: ${newStatus}`);
  }

  let additionalFields = '';
  const params = [newStatus];

  if (newStatus === 'approved' && approvedBy) {
    additionalFields = ', approved_by = ?, approved_at = CURRENT_TIMESTAMP';
    params.push(approvedBy);
  }

  if (newStatus === 'completed') {
    additionalFields = ', completed_at = CURRENT_TIMESTAMP';
  }

  params.push(transferId);

  return new Promise((resolve, reject) => {
    db.run(`
      UPDATE stock_transfers 
      SET status = ?${additionalFields}
      WHERE id = ?
    `, params, function(err) {
      if (err) {
        console.error('❌ Eroare la actualizare status transfer:', err);
        reject(err);
      } else {
        console.log(`✅ Transfer ${transferId} status actualizat la: ${newStatus}`);
        resolve(this.changes > 0);
      }
    });
  });
}

/**
 * Procesează un transfer aprobat (mută stocul efectiv)
 * @param {number} transferId - ID transfer
 * @returns {Promise<Object>} Rezultat procesare
 */
async function processTransfer(transferId) {
  const db = await dbPromise;
  
  // Obține transferul
  const transfer = await getTransferById(transferId);
  
  if (!transfer) {
    throw new Error('Transfer negăsit');
  }

  if (transfer.status !== 'approved') {
    throw new Error(`Transferul trebuie să fie aprobat. Status actual: ${transfer.status}`);
  }

  const processedItems = [];
  const errors = [];

  // Pentru fiecare item din transfer
  for (const item of transfer.items) {
    try {
      // 1. Verifică stoc disponibil din nou
      const availability = await checkStockAvailability(
        item.ingredient_id,
        transfer.from_location_id,
        item.quantity
      );

      if (!availability.available) {
        errors.push({
          ingredient_id: item.ingredient_id,
          ingredient_name: item.ingredient_name,
          error: `Stoc insuficient. Disponibil: ${availability.current_stock}, Necesar: ${item.quantity}`
        });
        continue;
      }

      // 2. Scade din locația sursă (FIFO)
      await decreaseStockFromLocation(
        item.ingredient_id,
        transfer.from_location_id,
        item.quantity,
        `Transfer ${transfer.transfer_number}`
      );

      // 3. Adaugă în locația destinație
      await increaseStockToLocation(
        item.ingredient_id,
        transfer.to_location_id,
        item.quantity,
        item.unit_cost || 0,
        item.batch_number || `TRF-${transfer.transfer_number}`,
        item.expiry_date,
        `Transfer din ${transfer.from_location_name}`
      );

      // 4. Înregistrează în stock_movements (folosim 'manual_adjustment' pentru transferuri)
      await recordStockMovement(
        item.ingredient_id,
        -item.quantity,
        'manual_adjustment',
        transfer.id,
        transfer.from_location_id,
        `Transfer către ${transfer.to_location_name}`
      );

      await recordStockMovement(
        item.ingredient_id,
        item.quantity,
        'manual_adjustment',
        transfer.id,
        transfer.to_location_id,
        `Transfer de la ${transfer.from_location_name}`
      );

      processedItems.push({
        ingredient_id: item.ingredient_id,
        ingredient_name: item.ingredient_name,
        quantity: item.quantity,
        unit: item.unit
      });

    } catch (error) {
      console.error(`❌ Eroare la procesare item ${item.ingredient_name}:`, error);
      errors.push({
        ingredient_id: item.ingredient_id,
        ingredient_name: item.ingredient_name,
        error: error.message
      });
    }
  }

  // Actualizează statusul transferului
  if (errors.length === 0) {
    await updateTransferStatus(transferId, 'completed');
  } else if (processedItems.length === 0) {
    // Toate items au eșuat
    throw new Error(`Transferul a eșuat complet: ${errors.map(e => e.error).join(', ')}`);
  } else {
    // Parțial reușit
    console.warn(`⚠️ Transfer ${transferId} procesat parțial: ${processedItems.length}/${transfer.items.length} items`);
  }

  return {
    success: errors.length === 0,
    processed_items: processedItems,
    failed_items: errors,
    transfer_number: transfer.transfer_number
  };
}

/**
 * Scade stoc din locație (actualizează direct current_stock în ingredients)
 */
async function decreaseStockFromLocation(ingredientId, locationId, quantity, notes) {
  const db = await dbPromise;
  
  return new Promise((resolve, reject) => {
    db.run(`
      UPDATE ingredients
      SET current_stock = current_stock - ?,
          last_updated = datetime('now', 'localtime')
      WHERE id = ? AND location_id = ?
    `, [quantity, ingredientId, locationId], function(err) {
      if (err) reject(err);
      else if (this.changes === 0) {
        reject(new Error('Ingredient nu există în locația specificată'));
      } else {
        resolve();
      }
    });
  });
}

/**
 * Adaugă stoc în locație (actualizează sau creează ingredient în locație)
 */
async function increaseStockToLocation(ingredientId, locationId, quantity, unitCost, batchNumber, expiryDate, notes) {
  const db = await dbPromise;
  
  // Mai întâi obține datele ingredientului sursă
  const sourceIngredient = await new Promise((resolve, reject) => {
    db.get(`SELECT * FROM ingredients WHERE id = ?`, [ingredientId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
  
  if (!sourceIngredient) {
    throw new Error('Ingredientul sursă nu există');
  }
  
  // Verifică dacă un ingredient cu același nume/categorie există deja în locația destinație
  const existing = await new Promise((resolve, reject) => {
    db.get(`
      SELECT * FROM ingredients 
      WHERE name = ? AND category = ? AND location_id = ?
    `, [sourceIngredient.name, sourceIngredient.category, locationId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
  
  if (existing) {
    // UPDATE: Ingredientul există în locația destinație, doar adaugă stoc
    return new Promise((resolve, reject) => {
      db.run(`
        UPDATE ingredients
        SET current_stock = current_stock + ?,
            cost_per_unit = ?,
            last_updated = datetime('now', 'localtime')
        WHERE id = ?
      `, [quantity, unitCost || existing.cost_per_unit, existing.id], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  } else {
    // INSERT: Creează ingredientul în locația destinație ca ingredient NOU
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO ingredients (
          name, unit, current_stock, min_stock, cost_per_unit,
          supplier, category, is_available, code, name_en, category_en,
          is_hidden, location_id, created_at, last_updated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'), datetime('now', 'localtime'))
      `, [
        sourceIngredient.name,
        sourceIngredient.unit,
        quantity, // current_stock
        sourceIngredient.min_stock || 0,
        unitCost || sourceIngredient.cost_per_unit || 0,
        sourceIngredient.supplier || '',
        sourceIngredient.category || '',
        1, // is_available
        sourceIngredient.code || '',
        sourceIngredient.name_en || '',
        sourceIngredient.category_en || '',
        sourceIngredient.is_hidden || 0,
        locationId
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }
}

/**
 * Înregistrează mișcare stoc
 */
async function recordStockMovement(ingredientId, quantityChange, movementType, referenceId, locationId, notes) {
  const db = await dbPromise;
  
  return new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO stock_movements (
        ingredient_id,
        quantity_change,
        movement_type,
        reference_id,
        location_id,
        notes,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [
      ingredientId,
      quantityChange,
      movementType,
      referenceId,
      locationId,
      notes
    ], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/**
 * Șterge un transfer (doar dacă status = pending)
 */
async function deleteTransfer(transferId) {
  const db = await dbPromise;
  
  // Verifică status
  const transfer = await getTransferById(transferId);
  if (!transfer) {
    throw new Error('Transfer negăsit');
  }

  if (transfer.status !== 'pending') {
    throw new Error(`Nu se poate șterge transferul cu status: ${transfer.status}`);
  }

  return new Promise((resolve, reject) => {
    db.run('DELETE FROM stock_transfers WHERE id = ?', [transferId], function(err) {
      if (err) {
        console.error('❌ Eroare la ștergere transfer:', err);
        reject(err);
      } else {
        console.log(`✅ Transfer ${transferId} șters cu succes`);
        resolve(this.changes > 0);
      }
    });
  });
}

/**
 * ==================== EXPORTS ====================
 */

module.exports = {
  getAllTransfers,
  getTransferById,
  checkStockAvailability,
  createTransfer,
  updateTransferStatus,
  processTransfer,
  deleteTransfer
};

