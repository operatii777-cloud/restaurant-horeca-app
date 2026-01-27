// server/src/modules/cogs/cogs.engine.js
/**
 * S13 — COGS Engine
 *
 * Rol:
 *  - calculează costul de producție (COGS) pentru un produs (per porție)
 *  - oferă breakdown pe ingrediente
 *  - se integrează cu Recipes Master + Master Data
 *
 * NU modifică DB.
 */

const masterData = require("../../../master-data");
const recipeService = require("../recipes/recipe.service");

const { ingredientsMaster, unitsMaster, productsMaster } = masterData;

/**
 * Calculează cantitatea efectivă ținând cont de waste%.
 *
 * ex: quantity = 100g, wastePercent = 10 → 110g
 *
 * @param {number} quantity
 * @param {number} wastePercent
 * @returns {number}
 */
function applyWaste(quantity, wastePercent) {
  if (!wastePercent || wastePercent <= 0) return quantity;
  return quantity * (1 + wastePercent / 100);
}

/**
 * Calculează costul pentru o linie din rețetă.
 *
 * Logica:
 *  - ia ingredientul master (cost_per_unit, unit stock)
 *  - convertește cantitatea rețetei la unitatea ingredientului
 *  - aplică waste%
 *  - cost = qty_in_stock_unit * cost_per_unit
 *
 * @param {import("../recipes/recipe.types").CanonicalRecipeLine} line
 * @returns {{
 *   ingredientId: number,
 *   ingredientName: string,
 *   quantityRecipe: number,
 *   unitRecipe: string,
 *   quantityStockUnit: number,
 *   stockUnit: string,
 *   wastePercent: number,
 *   unitType: string|null,
 *   costPerUnit: number,
 *   costTotal: number,
 *   warnings: string[]
 * }}
 */
function calculateLineCost(line) {
  const warnings = [];

  const ing = line.ingredient;
  if (!ing) {
    return {
      ingredientId: line.ingredientId,
      ingredientName: `UNKNOWN #${line.ingredientId}`,
      quantityRecipe: line.quantity,
      unitRecipe: line.unit,
      quantityStockUnit: 0,
      stockUnit: "UNKNOWN",
      wastePercent: line.wastePercent,
      unitType: line.unitType || null,
      costPerUnit: 0,
      costTotal: 0,
      warnings: [
        `Ingredient ID ${line.ingredientId} lipsește din Master Data.`
      ]
    };
  }

  const recipeQty = Number(line.quantity) || 0;
  const recipeUnit = line.unit || ing.unit;
  const stockUnit = ing.unit || recipeUnit;

  // aplicăm waste
  const qtyWithWaste = applyWaste(recipeQty, line.wastePercent);

  // conversie unități (dacă e nevoie)
  let qtyInStockUnit = qtyWithWaste;
  const canConvert =
    recipeUnit && stockUnit && unitsMaster.areCompatible(recipeUnit, stockUnit);

  if (!canConvert) {
    if (recipeUnit !== stockUnit) {
      warnings.push(
        `Unități incompatibile: rețeta folosește '${recipeUnit}', ingredientul este în '${stockUnit}'.`
      );
    }
  } else if (recipeUnit !== stockUnit) {
    const converted = unitsMaster.convert(qtyWithWaste, recipeUnit, stockUnit);
    if (converted == null || Number.isNaN(converted)) {
      warnings.push(
        `Conversie eșuată din '${recipeUnit}' în '${stockUnit}' pentru ingredientul '${ing.name}'.`
      );
    } else {
      qtyInStockUnit = converted;
    }
  }

  const costPerUnit = Number(ing.cost_per_unit || ing.costPerUnit || 0);
  if (!costPerUnit) {
    warnings.push(
      `Ingredientul '${ing.name}' are cost_per_unit = 0 sau lipsă.`
    );
  }

  const costTotal = qtyInStockUnit * costPerUnit;

  return {
    ingredientId: ing.id,
    ingredientName: ing.name,
    quantityRecipe: recipeQty,
    unitRecipe: recipeUnit,
    quantityStockUnit: qtyInStockUnit,
    stockUnit,
    wastePercent: line.wastePercent,
    unitType: line.unitType || null,
    costPerUnit,
    costTotal,
    warnings
  };
}

/**
 * Calculează COGS pentru un produs (per porție).
 *
 * Returnează:
 *  - totalCostPerPortion
 *  - breakdown pe ingrediente
 *  - foodCostPercent (dacă produsul are preț)
 *  - marginPercent
 *
 * @param {number} productId
 * @returns {Promise<{
 *   productId: number,
 *   productName: string,
 *   sellingPrice: number,
 *   currency: string,
 *   yieldQuantity: number,
 *   yieldUnit: string,
 *   totalCostPerPortion: number,
 *   totalCostForYield: number,
 *   foodCostPercent: number|null,
 *   marginPercent: number|null,
 *   breakdown: ReturnType<typeof calculateLineCost>[],
 *   warnings: string[],
 *   errors: string[]
 * } | null>}
 */
async function calculateCogsForProduct(productId) {
  const validated = await recipeService.getValidatedRecipe(productId);
  if (!validated || !validated.recipe) {
    return null;
  }

  const { recipe, errors: validationErrors } = validated;
  const product =
    recipe.product ||
    productsMaster.getProductById(recipe.productId) ||
    null;

  const breakdown = recipe.lines.map(calculateLineCost);

  const totalCostForYield = breakdown.reduce(
    (sum, line) => sum + line.costTotal,
    0
  );

  // cost per porție (dacă yieldQuantity > 1, împărțim)
  const yieldQty = recipe.yieldQuantity || 1;
  const totalCostPerPortion =
    yieldQty > 0 ? totalCostForYield / yieldQty : totalCostForYield;

  const sellingPrice = product ? Number(product.price || product.price_ron || 0) : 0;
  const currency = "RON"; // poți ajusta dacă ai multi-currency

  let foodCostPercent = null;
  let marginPercent = null;

  if (sellingPrice > 0) {
    foodCostPercent = (totalCostPerPortion / sellingPrice) * 100;
    marginPercent = ((sellingPrice - totalCostPerPortion) / sellingPrice) * 100;
  }

  // warnings agregate
  const warnings = [...(validationErrors || [])];
  breakdown.forEach((line) => {
    warnings.push(...(line.warnings || []));
  });

  return {
    productId: recipe.productId,
    productName: product ? product.name : `Produs #${recipe.productId}`,
    sellingPrice,
    currency,
    yieldQuantity: yieldQty,
    yieldUnit: recipe.yieldUnit,
    totalCostPerPortion,
    totalCostForYield,
    foodCostPercent,
    marginPercent,
    breakdown,
    warnings,
    errors: validationErrors || []
  };
}

/**
 * Calculează COGS pentru o listă de produse.
 *
 * @param {number[]} productIds
 * @returns {Promise<Map<number, Awaited<ReturnType<typeof calculateCogsForProduct>>>}
 */
async function calculateCogsForProducts(productIds) {
  const result = new Map();

  for (const pid of productIds) {
    const cogs = await calculateCogsForProduct(pid);
    if (cogs) {
      result.set(pid, cogs);
    }
  }

  return result;
}

/**
 * Helper pentru COGS per order (nivel logic).
 *
 * NU știe direct de structura ta de `orders`,
 * dar așteaptă un array simplu:
 *
 *  orderItems = [
 *    { productId: 123, quantity: 2 },
 *    { productId: 456, quantity: 1 },
 *  ]
 *
 * Poți construi acest array din CanonicalOrder (S9).
 *
 * @param {{ productId: number, quantity: number }[]} orderItems
 * @returns {Promise<{
 *   totalCogs: number,
 *   items: {
 *     productId: number,
 *     productName: string,
 *     quantity: number,
 *     cogsPerUnit: number,
 *     cogsTotal: number,
 *     sellingPricePerUnit: number,
 *     revenueTotal: number,
 *     foodCostPercent: number|null,
 *     marginPercent: number|null,
 *     warnings: string[]
 *   }[]
 * }>}
 */
async function calculateCogsForOrderItems(orderItems) {
  const itemsResult = [];
  let totalCogs = 0;

  for (const item of orderItems) {
    const cogs = await calculateCogsForProduct(item.productId);
    if (!cogs) continue;

    const qty = Number(item.quantity) || 1;
    const cogsTotal = cogs.totalCostPerPortion * qty;
    const revenueTotal = cogs.sellingPrice * qty;

    totalCogs += cogsTotal;

    itemsResult.push({
      productId: cogs.productId,
      productName: cogs.productName,
      quantity: qty,
      cogsPerUnit: cogs.totalCostPerPortion,
      cogsTotal,
      sellingPricePerUnit: cogs.sellingPrice,
      revenueTotal,
      foodCostPercent: cogs.foodCostPercent,
      marginPercent: cogs.marginPercent,
      warnings: cogs.warnings || []
    });
  }

  return {
    totalCogs,
    items: itemsResult
  };
}

module.exports = {
  calculateCogsForProduct,
  calculateCogsForProducts,
  calculateCogsForOrderItems,
  applyWaste,
  calculateLineCost
};

