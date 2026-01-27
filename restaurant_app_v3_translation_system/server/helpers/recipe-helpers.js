// server/helpers/recipe-helpers.js
// Helper functions pentru gestionare rețete, inclusiv sub-rețete (preparations)

const { dbPromise } = require('../database');

/**
 * Calculează costul unei rețete recursiv, incluzând sub-rețete
 * @param {number} productId - ID-ul produsului
 * @param {Set} visited - Set pentru detectare circular dependencies
 * @returns {Promise<number>} Costul total al rețetei
 */
async function calculateRecipeCostRecursive(productId, visited = new Set()) {
  // Previne infinite loop (circular dependencies)
  if (visited.has(productId)) {
    throw new Error(`Circular dependency detected for product ${productId}`);
  }
  visited.add(productId);
  
  const db = await dbPromise;
  
  // Obține toate rețetele pentru acest produs
  const recipes = await new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        r.id,
        r.ingredient_id,
        r.recipe_id,
        r.quantity_needed,
        r.unit,
        r.waste_percentage,
        r.item_type,
        i.cost_per_unit as ingredient_cost,
        i.unit as ingredient_unit,
        i.name as ingredient_name
      FROM recipes r
      LEFT JOIN ingredients i ON r.ingredient_id = i.id
      WHERE r.product_id = ?
    `, [productId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
  
  if (recipes.length === 0) {
    return 0; // Produs fără rețetă
  }
  
  let totalCost = 0;
  const { convertUnit } = require('./unit-conversion');
  
  for (const recipe of recipes) {
    let itemCost = 0;
    
    if (recipe.ingredient_id) {
      // ✅ Ingredient simplu
      if (!recipe.ingredient_cost) {
        console.warn(`⚠️ Ingredient ${recipe.ingredient_id} nu are cost_per_unit setat`);
        continue;
      }
      
      let quantityInIngredientUnit = recipe.quantity_needed;
      
      // Conversie unități dacă e necesar
      if (recipe.unit && recipe.ingredient_unit && 
          recipe.unit.toLowerCase() !== recipe.ingredient_unit.toLowerCase()) {
        const conversion = convertUnit(recipe.quantity_needed, recipe.unit, recipe.ingredient_unit);
        if (conversion.success) {
          quantityInIngredientUnit = conversion.value;
        } else {
          console.warn(`⚠️ Conversie eșuată pentru ingredient ${recipe.ingredient_id}: ${conversion.error}`);
        }
      }
      
      itemCost = quantityInIngredientUnit * recipe.ingredient_cost;
      
    } else if (recipe.recipe_id) {
      // ✅ Sub-rețetă - RECURSIV
      try {
        const subRecipeCost = await calculateRecipeCostRecursive(recipe.recipe_id, visited);
        itemCost = recipe.quantity_needed * subRecipeCost;
        
        console.log(`✅ Sub-rețetă ${recipe.recipe_id}: cost ${subRecipeCost.toFixed(4)} × ${recipe.quantity_needed} = ${itemCost.toFixed(4)}`);
      } catch (error) {
        if (error.message.includes('Circular dependency')) {
          throw error; // Re-throw circular dependency
        }
        console.error(`❌ Eroare la calcularea costului sub-rețetei ${recipe.recipe_id}:`, error);
        // Continuă cu cost 0 pentru sub-rețeta cu eroare
        itemCost = 0;
      }
    } else {
      console.warn(`⚠️ Rețetă ${recipe.id} nu are nici ingredient_id, nici recipe_id`);
      continue;
    }
    
    // Aplică waste percentage
    if (recipe.waste_percentage && recipe.waste_percentage > 0) {
      itemCost = itemCost * (1 + recipe.waste_percentage / 100);
    }
    
    totalCost += itemCost;
  }
  
  return totalCost;
}

/**
 * Obține toate preparațiile (semi-finished products) disponibile
 * @returns {Promise<Array>} Lista preparațiilor
 */
async function getPreparations() {
  const db = await dbPromise;
  
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT DISTINCT
        m.id,
        m.name,
        m.name_en,
        m.category,
        m.price,
        COUNT(r.id) as recipe_items_count
      FROM menu m
      INNER JOIN recipes r ON r.product_id = m.id
      WHERE m.is_sellable = 1
        AND EXISTS (
          SELECT 1 FROM recipes r2 
          WHERE r2.product_id = m.id 
          AND r2.recipe_id IS NOT NULL
        )
      GROUP BY m.id, m.name, m.name_en, m.category, m.price
      ORDER BY m.name
    `, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

/**
 * Verifică dacă un produs poate fi folosit ca sub-rețetă (nu are circular dependencies)
 * @param {number} productId - ID-ul produsului de verificat
 * @param {number} targetProductId - ID-ul produsului țintă (unde vrem să adăugăm sub-rețeta)
 * @returns {Promise<{canUse: boolean, reason?: string}>}
 */
async function canUseAsSubRecipe(productId, targetProductId) {
  if (productId === targetProductId) {
    return { canUse: false, reason: 'Nu poți folosi un produs ca sub-rețetă pentru el însuși' };
  }
  
  // Verifică dacă targetProductId este deja folosit în productId (circular dependency)
  try {
    await calculateRecipeCostRecursive(productId, new Set([targetProductId]));
    return { canUse: true };
  } catch (error) {
    if (error.message.includes('Circular dependency')) {
      return { canUse: false, reason: 'Circular dependency detectată' };
    }
    return { canUse: false, reason: error.message };
  }
}

module.exports = {
  calculateRecipeCostRecursive,
  getPreparations,
  canUseAsSubRecipe
};

