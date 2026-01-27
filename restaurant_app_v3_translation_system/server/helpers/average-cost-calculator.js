// server/helpers/average-cost-calculator.js
// ✅ SĂPTĂMÂNA 2 - ZIUA 2: Calcul cost mediu ponderat pentru ingrediente

const { dbPromise } = require('../database');

/**
 * Calculează cost mediu ponderat pentru un ingredient
 * Formula: SUM(remaining_quantity * unit_cost) / SUM(remaining_quantity)
 * 
 * @param {number} ingredientId - ID ingredient
 * @param {number|null} locationId - ID locație (opțional, pentru multi-gestiune)
 * @returns {Promise<number>} - Cost mediu ponderat
 */
async function calculateWeightedAverageCost(ingredientId, locationId = null) {
  try {
    const db = await dbPromise;
    
    const query = locationId
      ? `SELECT 
           SUM(remaining_quantity * unit_cost) / NULLIF(SUM(remaining_quantity), 0) as avg_cost
         FROM ingredient_batches
         WHERE ingredient_id = ? 
           AND remaining_quantity > 0 
           AND location_id = ?`
      : `SELECT 
           SUM(remaining_quantity * unit_cost) / NULLIF(SUM(remaining_quantity), 0) as avg_cost
         FROM ingredient_batches
         WHERE ingredient_id = ? 
           AND remaining_quantity > 0`;
    
    const params = locationId ? [ingredientId, locationId] : [ingredientId];
    
    const result = await new Promise((resolve, reject) => {
      db.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    // Returnează 0 dacă nu există loturi sau dacă avg_cost este NULL
    return result?.avg_cost || 0;
  } catch (error) {
    console.error(`❌ Eroare la calcularea costului mediu pentru ingredient ${ingredientId}:`, error);
    throw error;
  }
}

/**
 * Actualizează cost_per_unit în tabela ingredients cu costul mediu calculat
 * 
 * @param {number} ingredientId - ID ingredient
 * @param {number|null} locationId - ID locație (opțional)
 * @returns {Promise<number>} - Cost mediu actualizat
 */
async function updateIngredientAverageCost(ingredientId, locationId = null) {
  try {
    const avgCost = await calculateWeightedAverageCost(ingredientId, locationId);
    
    const db = await dbPromise;
    
    // Verifică dacă există coloană last_cost_update
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE ingredients 
        SET cost_per_unit = ?,
            last_updated = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [avgCost, ingredientId], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
    
    console.log(`✅ Cost mediu actualizat pentru ingredient ${ingredientId}: ${avgCost.toFixed(4)} RON`);
    
    return avgCost;
  } catch (error) {
    console.error(`❌ Eroare la actualizarea costului mediu pentru ingredient ${ingredientId}:`, error);
    throw error;
  }
}

/**
 * Recalculează costul mediu pentru toate ingredientele care au loturi
 * 
 * @returns {Promise<{processed: number, errors: number}>}
 */
async function recalculateAllAverageCosts() {
  try {
    const db = await dbPromise;
    
    // Obține toate ingredientele care au loturi
    const ingredients = await new Promise((resolve, reject) => {
      db.all(`
        SELECT DISTINCT ingredient_id
        FROM ingredient_batches
        WHERE remaining_quantity > 0
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    console.log(`📊 Recalculare cost mediu pentru ${ingredients.length} ingrediente...`);
    
    let processed = 0;
    let errors = 0;
    
    for (const { ingredient_id } of ingredients) {
      try {
        await updateIngredientAverageCost(ingredient_id);
        processed++;
      } catch (error) {
        errors++;
        console.error(`❌ Eroare pentru ingredient ${ingredient_id}:`, error.message);
      }
    }
    
    console.log(`✅ Recalculare finalizată: ${processed} procesate, ${errors} erori`);
    
    return { processed, errors, total: ingredients.length };
  } catch (error) {
    console.error('❌ Eroare la recalculare costuri medii:', error);
    throw error;
  }
}

module.exports = {
  calculateWeightedAverageCost,
  updateIngredientAverageCost,
  recalculateAllAverageCosts
};

