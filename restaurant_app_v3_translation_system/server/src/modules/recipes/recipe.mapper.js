// server/src/modules/recipes/recipe.mapper.js
/**
 * S13 Recipe Mapper
 * 
 * Mapare DB → CanonicalRecipe
 * Folosește Master Data Layer pentru ingrediente, produse, unități
 */

const masterData = require("../../../master-data");
const {
  createCanonicalRecipe,
  createRecipeLine
} = require("./recipe.types");

/**
 * Mapare DB unit → unitType folosind unitsMaster.
 *
 * @param {string} unit
 * @returns {"mass"|"volume"|"count"|null}
 */
function inferUnitType(unit) {
  if (!unit) return null;
  const u = masterData.unitsMaster.getUnit(unit);
  if (!u) return null;

  if (u.type === "mass") return "mass";
  if (u.type === "volume") return "volume";
  if (u.type === "count") return "count";
  return null;
}

/**
 * Mapare linie de rețetă din DB în CanonicalRecipeLine.
 *
 * Suportă două structuri DB:
 * 1. Tabel `recipes` (vechi): ingredient_id, quantity_needed, unit, waste_percentage, is_semi_finished
 * 2. Tabel `recipe_ingredients` (nou): ingredient_id, quantity_gross, quantity_net, unit, waste_percentage, is_optional
 *
 * @param {object} row - Rând din DB
 * @returns {import("./recipe.types").CanonicalRecipeLine}
 */
function mapDbRecipeLineToCanonical(row) {
  const ingredientId = Number(row.ingredient_id);
  const ingredient =
    masterData.ingredientsMaster.getIngredientById(ingredientId) || null;

  // Determină unitatea (din row sau din ingredient master)
  let unit = row.unit;
  if (!unit && ingredient) {
    unit = ingredient.recipe_unit || ingredient.unit || "g";
  }
  if (!unit) {
    unit = "g"; // fallback
  }

  // Determină quantity (suportă ambele structuri)
  let quantity = 0;
  let quantityGross = null;
  let quantityNet = null;
  
  if (row.quantity_net !== undefined && row.quantity_net !== null) {
    // Structură nouă: quantity_net și quantity_gross
    quantityNet = Number(row.quantity_net);
    quantityGross = row.quantity_gross !== undefined && row.quantity_gross !== null
      ? Number(row.quantity_gross)
      : null;
    quantity = quantityNet; // Folosim quantityNet ca quantity principal
  } else if (row.quantity_needed !== undefined && row.quantity_needed !== null) {
    // Structură veche: quantity_needed
    quantity = Number(row.quantity_needed);
    quantityNet = quantity;
  } else if (row.quantity !== undefined && row.quantity !== null) {
    // Fallback: quantity generic
    quantity = Number(row.quantity);
    quantityNet = quantity;
  }

  // Determină waste_percentage
  let wastePercent = 0;
  if (row.waste_percentage !== undefined && row.waste_percentage !== null) {
    wastePercent = Number(row.waste_percentage);
  } else if (row.waste_percent !== undefined && row.waste_percent !== null) {
    wastePercent = Number(row.waste_percent);
  }

  // Calculează quantityGross dacă nu este furnizat
  if (quantityGross === null && wastePercent > 0) {
    quantityGross = quantity / (1 - wastePercent / 100);
  } else if (quantityGross === null) {
    quantityGross = quantity;
  }

  const baseLine = {
    ingredientId,
    ingredient,
    quantity: quantity,
    unit,
    unitType: inferUnitType(unit),
    wastePercent: wastePercent,
    isOptional: row.is_optional === 1 || row.is_optional === true || row.is_optional === "1",
    note: row.note || row.preparation_notes || row.notes || null,
    quantityGross: quantityGross,
    quantityNet: quantityNet || quantity
  };

  return createRecipeLine(baseLine);
}

/**
 * Mapare header rețetă DB + linii DB → CanonicalRecipe.
 *
 * Suportă structura din tabel `recipes`:
 *  - recipeRow: { id, product_id, yield_quantity, yield_unit, prep_time_minutes, notes, is_active, item_type, is_semi_finished }
 *  - lineRows: array de rânduri pentru linii (din `recipes` sau `recipe_ingredients`)
 *
 * @param {object} recipeRow - Rând header rețetă
 * @param {object[]} lineRows - Array de rânduri pentru linii
 * @returns {import("./recipe.types").CanonicalRecipe}
 */
function mapDbRecipeToCanonical(recipeRow, lineRows) {
  if (!recipeRow) return null;

  const productId = Number(recipeRow.product_id);
  const product =
    masterData.productsMaster.getProductById(productId) || null;

  const lines = Array.isArray(lineRows)
    ? lineRows.map(mapDbRecipeLineToCanonical)
    : [];

  // Determină yieldQuantity și yieldUnit
  let yieldQuantity = 1;
  let yieldUnit = "portion";
  
  if (recipeRow.yield_quantity !== undefined && recipeRow.yield_quantity !== null) {
    yieldQuantity = Number(recipeRow.yield_quantity);
  }
  
  if (recipeRow.yield_unit) {
    yieldUnit = recipeRow.yield_unit;
  }

  // Determină prepTimeMinutes
  let prepTimeMinutes = null;
  if (recipeRow.prep_time_minutes !== undefined && recipeRow.prep_time_minutes !== null) {
    prepTimeMinutes = Number(recipeRow.prep_time_minutes);
  } else if (recipeRow.prep_time !== undefined && recipeRow.prep_time !== null) {
    prepTimeMinutes = Number(recipeRow.prep_time);
  }

  const baseRecipe = {
    id: recipeRow.id != null ? Number(recipeRow.id) : null,
    productId,
    product,
    lines,
    yieldQuantity: yieldQuantity,
    yieldUnit: yieldUnit,
    prepTimeMinutes: prepTimeMinutes,
    notes: recipeRow.notes || null,
    isActive:
      recipeRow.is_active === undefined
        ? true
        : recipeRow.is_active === 1 || recipeRow.is_active === true,
    itemType: recipeRow.item_type || "ingredient",
    isSemiFinished: recipeRow.is_semi_finished === 1 || recipeRow.is_semi_finished === true
  };

  return createCanonicalRecipe(baseRecipe);
}

module.exports = {
  mapDbRecipeLineToCanonical,
  mapDbRecipeToCanonical,
  inferUnitType
};

