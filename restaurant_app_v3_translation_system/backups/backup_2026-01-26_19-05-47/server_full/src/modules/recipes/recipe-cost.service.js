/**
 * PHASE PRODUCTION-READY - Recipe Cost Calculation Service
 * 
 * Calcul automat costuri rețete bazat pe ingrediente
 */

const { dbPromise } = require('../../../database');
const { AppError, createBusinessRuleError } = require('../../utils/error-handler');
const { logger } = require('../../utils/logger');
const recipeLogger = logger.child('RECIPE_COST');

/**
 * Get unit conversion factor
 * Basic conversions: kg <-> g (1000), L <-> mL (1000), etc.
 */
function getUnitConversion(fromUnit, toUnit) {
  const conversions = {
    // Weight
    'kg': { 'g': 1000, 'kg': 1 },
    'g': { 'kg': 0.001, 'g': 1 },
    // Volume
    'L': { 'mL': 1000, 'L': 1 },
    'mL': { 'L': 0.001, 'mL': 1 },
    'l': { 'ml': 1000, 'l': 1 },
    'ml': { 'l': 0.001, 'ml': 1 },
    // Same units
    'buc': { 'buc': 1 },
    'pcs': { 'pcs': 1 },
    'bucata': { 'bucata': 1 }
  };

  const from = fromUnit?.toLowerCase();
  const to = toUnit?.toLowerCase();

  if (from === to) return 1;
  if (conversions[from] && conversions[from][to]) {
    return conversions[from][to];
  }

  // Default: assume same unit (no conversion)
  recipeLogger.warn(`Unit conversion not found: ${fromUnit} -> ${toUnit}, assuming 1:1`);
  return 1;
}

/**
 * Calculate recipe cost based on ingredients
 */
async function calculateRecipeCost(productId, db = null) {
  if (!db) {
    db = await dbPromise;
  }

  try {
    // Get all recipe ingredients for product
    const ingredients = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          r.id as recipe_id,
          r.ingredient_id,
          r.quantity_needed as recipe_quantity,
          r.unit as recipe_unit,
          r.waste_percentage,
          i.name as ingredient_name,
          i.current_stock,
          i.unit as ingredient_unit,
          i.cost_per_unit,
          COALESCE(i.cost_per_unit, 0) as cost_per_unit
        FROM recipes r
        JOIN ingredients i ON i.id = r.ingredient_id
        WHERE r.product_id = ? AND (i.is_available = 1 OR i.is_available IS NULL)`,
        [productId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    if (ingredients.length === 0) {
      recipeLogger.warn(`No active ingredients found for product ${productId}`);
      return {
        totalCost: 0,
        ingredientCosts: [],
        hasMissingCosts: false
      };
    }

    let totalCost = 0;
    const ingredientCosts = [];
    let hasMissingCosts = false;

    for (const ing of ingredients) {
      const costPerUnit = parseFloat(ing.cost_per_unit || 0);
      const recipeQuantity = parseFloat(ing.recipe_quantity || 0);

      if (costPerUnit === 0) {
        hasMissingCosts = true;
        recipeLogger.warn(
          `Missing cost for ingredient ${ing.ingredient_name} (ID: ${ing.ingredient_id})`
        );
      }

      // PHASE PRODUCTION-READY: Unit conversion
      let convertedQuantity = recipeQuantity;
      if (ing.recipe_unit && ing.ingredient_unit && ing.recipe_unit !== ing.ingredient_unit) {
        // Basic unit conversion (kg <-> g, L <-> mL)
        const conversion = getUnitConversion(ing.recipe_unit, ing.ingredient_unit);
        convertedQuantity = recipeQuantity * conversion;
      }
      
      // PHASE PRODUCTION-READY: Waste factor (recipe waste_percentage)
      let finalQuantity = convertedQuantity;
      const wastePercent = ing.waste_percentage || 0;
      if (wastePercent > 0) {
        // Add waste factor: if waste is 10%, we need 110% of the base quantity
        finalQuantity = convertedQuantity * (1 + (wastePercent / 100));
        recipeLogger.debug(`Applied waste factor ${wastePercent}% for ingredient ${ing.ingredient_name}`);
      }
      
      const ingredientCost = costPerUnit * finalQuantity;

      ingredientCosts.push({
        ingredient_id: ing.ingredient_id,
        ingredient_name: ing.ingredient_name,
        quantity: recipeQuantity,
        unit: ing.recipe_unit || ing.ingredient_unit,
        cost_per_unit: costPerUnit,
        total_cost: ingredientCost
      });

      totalCost += ingredientCost;
    }

    return {
      totalCost: parseFloat(totalCost.toFixed(4)),
      ingredientCosts,
      hasMissingCosts
    };
  } catch (error) {
    recipeLogger.error('Error calculating recipe cost', {
      productId,
      error: error.message,
      stack: error.stack
    });
    throw new AppError(
      `Failed to calculate recipe cost: ${error.message}`,
      500,
      'RECIPE_COST_CALCULATION_ERROR'
    );
  }
}

/**
 * Update recipe cost in database
 */
async function updateRecipeCost(productId, cost = null) {
  const db = await dbPromise;

  try {
    // Calculate cost if not provided
    if (cost === null) {
      const costData = await calculateRecipeCost(productId, db);
      cost = costData.totalCost;
    }

    // Update product cost
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE menu 
         SET cost = ?, 
             cost_updated_at = datetime('now', 'localtime')
         WHERE id = ?`,
        [cost, productId],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });

    recipeLogger.info(`Updated recipe cost for product ${productId}`, { cost });

    return cost;
  } catch (error) {
    recipeLogger.error('Error updating recipe cost', {
      productId,
      error: error.message
    });
    throw error;
  }
}

/**
 * Recalculate all recipe costs
 */
async function recalculateAllRecipeCosts() {
  const db = await dbPromise;

  try {
    // Get all products with recipes
    const products = await new Promise((resolve, reject) => {
      db.all(
        `SELECT DISTINCT r.product_id, m.name as product_name
         FROM recipes r
         JOIN menu m ON m.id = r.product_id
         WHERE m.is_active = 1`,
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    const results = {
      total: products.length,
      updated: 0,
      errors: 0,
      hasMissingCosts: 0
    };

    for (const product of products) {
      try {
        const costData = await calculateRecipeCost(product.product_id, db);
        await updateRecipeCost(product.product_id, costData.totalCost);

        results.updated++;
        if (costData.hasMissingCosts) {
          results.hasMissingCosts++;
        }
      } catch (error) {
        recipeLogger.error(`Error recalculating cost for product ${product.product_id}`, {
          error: error.message
        });
        results.errors++;
      }
    }

    recipeLogger.info('Recipe cost recalculation completed', results);

    return results;
  } catch (error) {
    recipeLogger.error('Error in recalculateAllRecipeCosts', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Get profit margin for product
 */
async function getProfitMargin(productId) {
  const db = await dbPromise;

  try {
    const product = await new Promise((resolve, reject) => {
      db.get(
        `SELECT id, name, price, cost 
         FROM menu 
         WHERE id = ?`,
        [productId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!product) {
      throw createBusinessRuleError(`Product ${productId} not found`);
    }

    const price = parseFloat(product.price || 0);
    const cost = parseFloat(product.cost || 0);

    if (price === 0) {
      return {
        margin: 0,
        marginPercent: 0,
        profit: 0
      };
    }

    const profit = price - cost;
    const marginPercent = cost > 0 ? ((profit / price) * 100) : 0;

    return {
      margin: parseFloat(profit.toFixed(2)),
      marginPercent: parseFloat(marginPercent.toFixed(2)),
      profit: parseFloat(profit.toFixed(2))
    };
  } catch (error) {
    recipeLogger.error('Error calculating profit margin', {
      productId,
      error: error.message
    });
    throw error;
  }
}

module.exports = {
  calculateRecipeCost,
  updateRecipeCost,
  recalculateAllRecipeCosts,
  getProfitMargin
};

