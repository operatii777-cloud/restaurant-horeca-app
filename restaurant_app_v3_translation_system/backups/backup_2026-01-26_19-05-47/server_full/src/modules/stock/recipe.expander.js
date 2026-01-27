/**
 * PHASE S9.2 - Recipe Expander for Stock Consumption
 * 
 * Expands recipes recursively to get flat list of ingredients needed.
 * Handles:
 * - Sub-recipes (products that contain other products)
 * - Unit conversion
 * - Waste percentage
 * - Circular dependency detection
 */

const { dbPromise } = require('../../../database');
const { convertUnit } = require('../../../helpers/unit-conversion');

/**
 * Expand recipe to flat list of ingredients
 * 
 * @param {number} productId - Product ID
 * @param {number} multiplier - Quantity multiplier (e.g., order quantity)
 * @param {Set} visited - Set to detect circular dependencies
 * @returns {Promise<Array>} Flat array of { ingredient_id, name, qty, unit, recipe_multiplier }
 */
async function expandRecipeToIngredients(productId, multiplier = 1, visited = new Set()) {
  if (!productId) {
    return [];
  }
  
  // Prevent infinite loop (circular dependencies)
  if (visited.has(productId)) {
    console.error(`[RecipeExpander] Circular dependency detected for product ${productId}`);
    throw new Error(`Circular dependency detected for product ${productId}`);
  }
  
  visited.add(productId);
  
  const db = await dbPromise;
  
  // Get all recipe lines for this product
  const recipeLines = await new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        r.id,
        r.ingredient_id,
        r.recipe_id,
        r.quantity_needed,
        r.unit,
        r.waste_percentage,
        r.item_type,
        i.name as ingredient_name,
        i.unit as ingredient_unit,
        i.current_stock,
        p.name as recipe_product_name
      FROM recipes r
      LEFT JOIN ingredients i ON r.ingredient_id = i.id
      LEFT JOIN menu p ON r.recipe_id = p.id
      WHERE r.product_id = ?
    `, [productId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
  
  if (recipeLines.length === 0) {
    // No recipe = no ingredients needed
    return [];
  }
  
  let flatIngredients = [];
  
  for (const line of recipeLines) {
    const baseQty = Number(line.quantity_needed || 0) * multiplier;
    const unit = line.unit || 'buc';
    const waste = Number(line.waste_percentage || 0);
    
    // Calculate quantity with waste
    const qtyWithWaste = baseQty * (1 + waste / 100);
    
    // Check if this is a sub-recipe (product containing other products)
    if (line.recipe_id && line.item_type === 'recipe') {
      // RECURSIVE: Expand sub-recipe
      try {
        const subIngredients = await expandRecipeToIngredients(
          line.recipe_id,
          qtyWithWaste,
          new Set(visited) // New set to allow same product in different branches
        );
        
        // Add sub-recipe ingredients to flat list
        flatIngredients = flatIngredients.concat(subIngredients);
      } catch (error) {
        if (error.message.includes('Circular dependency')) {
          throw error; // Re-throw circular dependency
        }
        console.error(`[RecipeExpander] Error expanding sub-recipe ${line.recipe_id} for product ${productId}:`, error);
        // Continue with other lines
      }
    } else if (line.ingredient_id) {
      // SIMPLE INGREDIENT
      flatIngredients.push({
        ingredient_id: line.ingredient_id,
        name: line.ingredient_name || `Ingredient ${line.ingredient_id}`,
        qty: qtyWithWaste,
        unit: unit,
        ingredient_unit: line.ingredient_unit || unit,
        recipe_multiplier: multiplier,
        waste_applied: waste > 0,
        source_product_id: productId,
      });
    } else {
      // Invalid line (no ingredient_id and no recipe_id)
      console.warn(`[RecipeExpander] Recipe line ${line.id} has no ingredient_id or recipe_id, skipping`);
    }
  }
  
  return flatIngredients;
}

/**
 * Expand recipe and convert units to ingredient stock units
 * 
 * @param {number} productId - Product ID
 * @param {number} multiplier - Quantity multiplier
 * @returns {Promise<Array>} Flat array with converted units
 */
async function expandRecipeToIngredientsWithUnitConversion(productId, multiplier = 1) {
  const flatIngredients = await expandRecipeToIngredients(productId, multiplier);
  const db = await dbPromise;
  
  // Convert units for each ingredient
  const convertedIngredients = await Promise.all(
    flatIngredients.map(async (ing) => {
      // Get ingredient to find its stock unit
      const ingredient = await new Promise((resolve, reject) => {
        db.get(
          'SELECT unit, name FROM ingredients WHERE id = ?',
          [ing.ingredient_id],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });
      
      if (!ingredient) {
        console.warn(`[RecipeExpander] Ingredient ${ing.ingredient_id} not found, skipping unit conversion`);
        return {
          ...ing,
          converted_qty: ing.qty,
          converted_unit: ing.unit,
          conversion_applied: false,
        };
      }
      
      const stockUnit = ingredient.unit || ing.unit;
      
      // Convert if units differ
      if (ing.unit.toLowerCase() !== stockUnit.toLowerCase()) {
        const conversion = convertUnit(ing.qty, ing.unit, stockUnit);
        
        if (conversion.success) {
          return {
            ...ing,
            converted_qty: conversion.value,
            converted_unit: stockUnit,
            conversion_applied: true,
            original_qty: ing.qty,
            original_unit: ing.unit,
          };
        } else {
          console.warn(
            `[RecipeExpander] Unit conversion failed for ingredient ${ing.ingredient_id}: ${conversion.error}. Using original unit.`
          );
          return {
            ...ing,
            converted_qty: ing.qty,
            converted_unit: ing.unit,
            conversion_applied: false,
            conversion_error: conversion.error,
          };
        }
      } else {
        // Units match, no conversion needed
        return {
          ...ing,
          converted_qty: ing.qty,
          converted_unit: stockUnit,
          conversion_applied: false,
        };
      }
    })
  );
  
  return convertedIngredients;
}

/**
 * Aggregate ingredients by ingredient_id (sum quantities)
 * 
 * @param {Array} ingredients - Array of ingredient objects
 * @returns {Array} Aggregated ingredients
 */
function aggregateIngredients(ingredients) {
  const aggregated = {};
  
  for (const ing of ingredients) {
    const key = `${ing.ingredient_id}_${ing.converted_unit || ing.unit}`;
    
    if (!aggregated[key]) {
      aggregated[key] = {
        ingredient_id: ing.ingredient_id,
        name: ing.name,
        qty: 0,
        unit: ing.converted_unit || ing.unit,
        sources: [],
      };
    }
    
    aggregated[key].qty += ing.converted_qty || ing.qty;
    aggregated[key].sources.push({
      product_id: ing.source_product_id,
      qty: ing.converted_qty || ing.qty,
      multiplier: ing.recipe_multiplier,
    });
  }
  
  return Object.values(aggregated);
}

module.exports = {
  expandRecipeToIngredients,
  expandRecipeToIngredientsWithUnitConversion,
  aggregateIngredients,
};

