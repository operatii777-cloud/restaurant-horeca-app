// server/helpers/multi-location-helpers.js
// Funcții helper pentru sistemul Multi-Gestiune (ETAPA 1)

const { dbPromise } = require('../database');

/**
 * ==================== MANAGEMENT LOCATIONS ====================
 */

/**
 * Obține toate locațiile de management
 * @param {Object} filters - Filtre opționale (type, is_active)
 * @returns {Promise<Array>} Lista de locații
 */
async function getAllLocations(filters = {}) {
  const db = await dbPromise;
  let query = 'SELECT * FROM management_locations WHERE 1=1';
  const params = [];

  if (filters.type) {
    query += ' AND type = ?';
    params.push(filters.type);
  }

  if (filters.is_active !== undefined) {
    query += ' AND is_active = ?';
    params.push(filters.is_active ? 1 : 0);
  }

  query += ' ORDER BY type DESC, name ASC';

  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('❌ Eroare la obținere locații:', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

/**
 * Obține o locație specifică după ID
 * @param {number} id - ID-ul locației
 * @returns {Promise<Object>} Locația găsită
 */
async function getLocationById(id) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM management_locations WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error('❌ Eroare la obținere locație:', err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

/**
 * Creează o nouă locație de management
 * @param {Object} locationData - Datele locației
 * @returns {Promise<number>} ID-ul locației create
 */
async function createLocation(locationData) {
  const db = await dbPromise;
  const {
    name,
    type,
    description = '',
    is_active = 1,
    can_receive_deliveries = 0,
    can_transfer_out = 1,
    can_transfer_in = 1,
    can_consume = 0,
    manager_name = ''
  } = locationData;

  return new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO management_locations (
        name, type, description, is_active,
        can_receive_deliveries, can_transfer_out, can_transfer_in, can_consume,
        manager_name, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [name, type, description, is_active, can_receive_deliveries, can_transfer_out, can_transfer_in, can_consume, manager_name],
    function(err) {
      if (err) {
        console.error('❌ Eroare la creare locație:', err);
        reject(err);
      } else {
        console.log(`✅ Locație creată cu ID: ${this.lastID}`);
        resolve(this.lastID);
      }
    });
  });
}

/**
 * Actualizează o locație existentă
 * @param {number} id - ID-ul locației
 * @param {Object} locationData - Datele actualizate
 * @returns {Promise<boolean>} Success status
 */
async function updateLocation(id, locationData) {
  const db = await dbPromise;
  const {
    name,
    type,
    description,
    is_active,
    can_receive_deliveries,
    can_transfer_out,
    can_transfer_in,
    can_consume,
    manager_name
  } = locationData;

  return new Promise((resolve, reject) => {
    db.run(`
      UPDATE management_locations SET
        name = ?,
        type = ?,
        description = ?,
        is_active = ?,
        can_receive_deliveries = ?,
        can_transfer_out = ?,
        can_transfer_in = ?,
        can_consume = ?,
        manager_name = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, type, description, is_active, can_receive_deliveries, can_transfer_out, can_transfer_in, can_consume, manager_name, id],
    function(err) {
      if (err) {
        console.error('❌ Eroare la actualizare locație:', err);
        reject(err);
      } else {
        console.log(`✅ Locație ${id} actualizată cu succes`);
        resolve(this.changes > 0);
      }
    });
  });
}

/**
 * Șterge o locație (soft delete - setează is_active = 0)
 * @param {number} id - ID-ul locației
 * @returns {Promise<boolean>} Success status
 */
async function deleteLocation(id) {
  const db = await dbPromise;
  
  // Verifică dacă locația are stocuri asociate
  const hasStock = await new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM ingredients WHERE location_id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row.count > 0);
    });
  });

  if (hasStock) {
    throw new Error('Nu se poate șterge locația - există ingrediente asociate. Transferați sau ștergeți ingredientele mai întâi.');
  }

  return new Promise((resolve, reject) => {
    db.run('UPDATE management_locations SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id],
    function(err) {
      if (err) {
        console.error('❌ Eroare la ștergere locație:', err);
        reject(err);
      } else {
        console.log(`✅ Locație ${id} dezactivată cu succes`);
        resolve(this.changes > 0);
      }
    });
  });
}

/**
 * Obține statistici pentru o locație
 * @param {number} locationId - ID-ul locației
 * @returns {Promise<Object>} Statistici
 */
async function getLocationStatistics(locationId) {
  const db = await dbPromise;
  
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT 
        COUNT(DISTINCT i.id) as total_ingredients,
        SUM(i.current_stock * i.cost_per_unit) as total_stock_value,
        COUNT(CASE WHEN i.current_stock <= i.min_stock THEN 1 END) as low_stock_items
      FROM ingredients i
      WHERE i.location_id = ? AND i.is_available = 1
    `, [locationId], (err, stats) => {
      if (err) {
        console.error('❌ Eroare la obținere statistici locație:', err);
        reject(err);
      } else {
        resolve({
          total_ingredients: stats.total_ingredients || 0,
          total_stock_value: stats.total_stock_value || 0,
          low_stock_items: stats.low_stock_items || 0
        });
      }
    });
  });
}

/**
 * ==================== CONSUMABLES ====================
 */

/**
 * Obține toate consumabilele
 * @param {Object} filters - Filtre opționale
 * @returns {Promise<Array>} Lista de consumabile
 */
async function getAllConsumables(filters = {}) {
  const db = await dbPromise;
  let query = 'SELECT * FROM consumables WHERE 1=1';
  const params = [];

  if (filters.location_id) {
    query += ' AND location_id = ?';
    params.push(filters.location_id);
  }

  if (filters.is_available !== undefined) {
    query += ' AND is_available = ?';
    params.push(filters.is_available ? 1 : 0);
  }

  query += ' ORDER BY name ASC';

  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('❌ Eroare la obținere consumabile:', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

/**
 * Obține un consumabil specific
 * @param {number} id - ID-ul consumabilului
 * @returns {Promise<Object>} Consumabilul găsit
 */
async function getConsumableById(id) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM consumables WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error('❌ Eroare la obținere consumabil:', err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

/**
 * Creează un consumabil nou
 * @param {Object} consumableData - Datele consumabilului
 * @returns {Promise<number>} ID-ul consumabilului creat
 */
async function createConsumable(consumableData) {
  const db = await dbPromise;
  const {
    name,
    unit,
    current_stock = 0,
    min_stock = 5,
    cost_per_unit = 0,
    category = 'consumable',
    supplier = '',
    is_available = 1,
    auto_consume_per_order = 0,
    applies_to_categories = '',
    location_id = 1
  } = consumableData;

  return new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO consumables (
        name, unit, current_stock, min_stock, cost_per_unit,
        category, supplier, is_available, auto_consume_per_order,
        applies_to_categories, location_id, created_at, last_updated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [name, unit, current_stock, min_stock, cost_per_unit, category, supplier, is_available, auto_consume_per_order, applies_to_categories, location_id],
    function(err) {
      if (err) {
        console.error('❌ Eroare la creare consumabil:', err);
        reject(err);
      } else {
        console.log(`✅ Consumabil creat cu ID: ${this.lastID}`);
        resolve(this.lastID);
      }
    });
  });
}

/**
 * Actualizează un consumabil
 * @param {number} id - ID-ul consumabilului
 * @param {Object} consumableData - Datele actualizate
 * @returns {Promise<boolean>} Success status
 */
async function updateConsumable(id, consumableData) {
  const db = await dbPromise;
  const {
    name,
    unit,
    current_stock,
    min_stock,
    cost_per_unit,
    category,
    supplier,
    is_available,
    auto_consume_per_order,
    applies_to_categories,
    location_id
  } = consumableData;

  return new Promise((resolve, reject) => {
    db.run(`
      UPDATE consumables SET
        name = ?,
        unit = ?,
        current_stock = ?,
        min_stock = ?,
        cost_per_unit = ?,
        category = ?,
        supplier = ?,
        is_available = ?,
        auto_consume_per_order = ?,
        applies_to_categories = ?,
        location_id = ?,
        last_updated = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, unit, current_stock, min_stock, cost_per_unit, category, supplier, is_available, auto_consume_per_order, applies_to_categories, location_id, id],
    function(err) {
      if (err) {
        console.error('❌ Eroare la actualizare consumabil:', err);
        reject(err);
      } else {
        console.log(`✅ Consumabil ${id} actualizat cu succes`);
        resolve(this.changes > 0);
      }
    });
  });
}

/**
 * Șterge un consumabil
 * @param {number} id - ID-ul consumabilului
 * @returns {Promise<boolean>} Success status
 */
async function deleteConsumable(id) {
  const db = await dbPromise;
  
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM consumables WHERE id = ?', [id],
    function(err) {
      if (err) {
        console.error('❌ Eroare la ștergere consumabil:', err);
        reject(err);
      } else {
        console.log(`✅ Consumabil ${id} șters cu succes`);
        resolve(this.changes > 0);
      }
    });
  });
}

/**
 * Consumă automat consumabile pentru o comandă
 * @param {number} orderId - ID-ul comenzii
 * @param {Array} orderItems - Lista de produse din comandă
 * @param {number} locationId - ID-ul gestiunii
 * @returns {Promise<Array>} Lista consumabilelor consumate
 */
async function autoConsumeForOrder(orderId, orderItems, locationId) {
  const db = await dbPromise;
  
  // Obține toate consumabilele active pentru locația dată
  const consumables = await getAllConsumables({ location_id: locationId, is_available: 1 });
  
  const consumed = [];
  
  for (const consumable of consumables) {
    if (consumable.auto_consume_per_order > 0) {
      const appliesToCategories = consumable.applies_to_categories ? consumable.applies_to_categories.split(',') : [];
      
      // Verifică dacă consumabilul se aplică la categoriile din comandă
      let shouldConsume = appliesToCategories.length === 0; // Dacă nu are categorii, se aplică la toate
      
      if (!shouldConsume) {
        for (const item of orderItems) {
          if (appliesToCategories.includes(item.category)) {
            shouldConsume = true;
            break;
          }
        }
      }
      
      if (shouldConsume) {
        const quantityToConsume = consumable.auto_consume_per_order * orderItems.length;
        
        // Actualizează stocul
        await new Promise((resolve, reject) => {
          db.run(`
            UPDATE consumables 
            SET current_stock = current_stock - ?,
                last_updated = CURRENT_TIMESTAMP
            WHERE id = ?
          `, [quantityToConsume, consumable.id], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        
        // Înregistrează mișcarea în stock_movements
        await new Promise((resolve, reject) => {
          db.run(`
            INSERT INTO stock_movements (
              ingredient_id, quantity_change, movement_type,
              reference_id, notes, location_id, created_at
            ) VALUES (?, ?, 'order', ?, ?, ?, CURRENT_TIMESTAMP)
          `, [consumable.id, -quantityToConsume, orderId, `Auto-consum: ${consumable.name}`, locationId], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        
        consumed.push({
          id: consumable.id,
          name: consumable.name,
          quantity: quantityToConsume,
          unit: consumable.unit
        });
      }
    }
  }
  
  console.log(`✅ Auto-consumate ${consumed.length} consumabile pentru comanda ${orderId}`);
  return consumed;
}

/**
 * ==================== EXPORTS ====================
 */

module.exports = {
  // Management Locations
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  getLocationStatistics,
  
  // Consumables
  getAllConsumables,
  getConsumableById,
  createConsumable,
  updateConsumable,
  deleteConsumable,
  autoConsumeForOrder
};

