/**
 * EXPIRY SERVICE - Gestionare expirări și FEFO
 * Data: 03 Decembrie 2025
 * FEFO = First Expired First Out (pentru produse perisabile)
 */

const db = require('../config/database');

class ExpiryService {
  
  /**
   * Generează alerte expirare (rulat zilnic - cron job)
   */
  async generateDailyAlerts() {
    console.log('⏰ Generating expiry alerts...');
    
    const today = new Date();
    const alerts = [];
    
    // Obține toate loturile cu expiry_date
    const batches = await this.getBatchesWithExpiry();
    
    for (const batch of batches) {
      const expiryDate = new Date(batch.expiry_date);
      const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      
      // Determină alert level
      let alertLevel = 'green';
      let actionRecommended = 'Monitorizează';
      
      if (daysUntilExpiry < 0) {
        alertLevel = 'expired';
        actionRecommended = 'RETRAGE IMEDIAT din stoc!';
      } else if (daysUntilExpiry === 0) {
        alertLevel = 'red';
        actionRecommended = 'FOLOSEȘTE URGENT astăzi!';
      } else if (daysUntilExpiry <= 1) {
        alertLevel = 'red';
        actionRecommended = 'FOLOSEȘTE URGENT în 24h!';
      } else if (daysUntilExpiry <= 3) {
        alertLevel = 'orange';
        actionRecommended = 'Prioritizează utilizare (1-3 zile)';
      } else if (daysUntilExpiry <= 7) {
        alertLevel = 'yellow';
        actionRecommended = 'Planifică utilizare (3-7 zile)';
      }
      
      // Calculează valoare la risc
      const valueAtRisk = batch.remaining_quantity * (batch.unit_cost || 0);
      
      // Creează alert dacă e necesar
      if (alertLevel !== 'green') {
        const alert = await this.createAlert({
          batch_id: batch.id,
          ingredient_id: batch.ingredient_id,
          ingredient_name: batch.ingredient_name,
          batch_number: batch.batch_number,
          expiry_date: batch.expiry_date,
          days_until_expiry: daysUntilExpiry,
          alert_level: alertLevel,
          remaining_quantity: batch.remaining_quantity,
          unit: batch.unit,
          value_at_risk: valueAtRisk,
          location_id: batch.location_id,
          location_name: batch.location_name,
          action_recommended: actionRecommended
        });
        
        alerts.push(alert);
      }
    }
    
    console.log(`✅ Generated ${alerts.length} expiry alerts`);
    
    // Trimite notificări pentru alerte RED
    const redAlerts = alerts.filter(a => a.alert_level === 'red' || a.alert_level === 'expired');
    
    if (redAlerts.length > 0) {
      await this.notifyManagers(redAlerts);
    }
    
    return alerts;
  }
  
  /**
   * Scădere stoc FEFO (First Expired First Out)
   * Pentru produse perisabile (lapte, carne, pește)
   */
  async decreaseStockFEFO(ingredientId, quantityNeeded, orderId, locationId = null) {
    return new Promise((resolve, reject) => {
      // Obține loturile ordonate după EXPIRY DATE (cel mai aproape de expirare primul)
      const query = locationId 
        ? `SELECT * FROM ingredient_batches 
           WHERE ingredient_id = ? AND remaining_quantity > 0 AND location_id = ?
           ORDER BY expiry_date ASC, purchase_date ASC`
        : `SELECT * FROM ingredient_batches 
           WHERE ingredient_id = ? AND remaining_quantity > 0
           ORDER BY expiry_date ASC, purchase_date ASC`;
      
      const params = locationId ? [ingredientId, locationId] : [ingredientId];
      
      db.all(query, params, (err, batches) => {
        if (err) return reject(err);
        
        if (!batches || batches.length === 0) {
          return reject(new Error(`No batches available for ingredient ${ingredientId}`));
        }
        
        let remainingToDecrease = quantityNeeded;
        const batchesUsed = [];
        
        // Scade din loturi (FEFO - cel mai aproape de expirare primul)
        for (const batch of batches) {
          if (remainingToDecrease <= 0) break;
          
          const quantityFromBatch = Math.min(remainingToDecrease, batch.remaining_quantity);
          
          // Update batch
          db.run(`
            UPDATE ingredient_batches 
            SET remaining_quantity = remaining_quantity - ?
            WHERE id = ?
          `, [quantityFromBatch, batch.id], (updateErr) => {
            if (updateErr) console.error('Update batch error:', updateErr);
          });
          
          batchesUsed.push({
            batch_id: batch.id,
            batch_number: batch.batch_number,
            quantity_used: quantityFromBatch,
            unit_cost: batch.unit_cost,
            expiry_date: batch.expiry_date
          });
          
          remainingToDecrease -= quantityFromBatch;
          
          console.log(`📦 FEFO: Lot ${batch.batch_number} (exp: ${batch.expiry_date}): used ${quantityFromBatch}`);
        }
        
        if (remainingToDecrease > 0) {
          console.warn(`⚠️ Insufficient stock for ingredient ${ingredientId}: missing ${remainingToDecrease}`);
        }
        
        resolve({ batchesUsed, remainingQuantity: remainingToDecrease });
      });
    });
  }
  
  /**
   * Determină dacă ingredient trebuie să folosească FEFO (în loc de FIFO)
   */
  async shouldUseFEFO(ingredientId) {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT category, shelf_life_days 
        FROM ingredients i
        LEFT JOIN ingredient_catalog_global c ON i.catalog_id = c.id
        WHERE i.id = ?
      `, [ingredientId], (err, row) => {
        if (err) return reject(err);
        
        // Categorii perisabile (FEFO obligatoriu)
        const perishableCategories = ['Lactate', 'Carne', 'Pește', 'Fructe de mare', 'Legume proaspete'];
        
        const isPerishable = row && perishableCategories.includes(row.category);
        const hasShortShelfLife = row && row.shelf_life_days && row.shelf_life_days <= 7;
        
        resolve(isPerishable || hasShortShelfLife);
      });
    });
  }
  
  // Helpers
  async getBatchesWithExpiry() {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          b.*,
          i.name as ingredient_name,
          l.name as location_name
        FROM ingredient_batches b
        JOIN ingredients i ON i.id = b.ingredient_id
        LEFT JOIN management_locations l ON l.id = b.location_id
        WHERE b.expiry_date IS NOT NULL 
          AND b.remaining_quantity > 0
          AND b.status = 'active'
        ORDER BY b.expiry_date ASC
      `, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }
  
  async createAlert(data) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);
      
      db.run(`INSERT INTO expiry_alerts (${fields}) VALUES (${placeholders})`, values, function(err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, ...data });
      });
    });
  }
  
  async notifyManagers(alerts) {
    // TODO: Implement email/SMS notifications
    console.log(`📧 Notifying managers about ${alerts.length} critical expiry alerts`);
    return true;
  }
}

module.exports = new ExpiryService();

