// server/src/modules/recipes/recipe.service.js
/**
 * S13 — Recipe Master Service
 *
 * Rol:
 *  - normalizează rețetele
 *  - validează structura + ingrediente + unități
 *  - verifică compatibilitatea unităților
 *  - pregătește rețeta pentru COGS Engine
 *  - expune un API unic pentru restul aplicației
 * 
 * Compatibil cu:
 *  - Master Data Layer (ingredientsMaster, productsMaster, unitsMaster)
 *  - Recipe Repository (Part 1)
 *  - Recipe Types (Part 1)
 */

const masterData = require("../../../master-data");
const recipeRepo = require("./recipe.repository");
const {
  validateCanonicalRecipe,
  createCanonicalRecipe,
  createRecipeLine
} = require("./recipe.types");

const { unitsMaster, ingredientsMaster, productsMaster } = masterData;

/**
 * Normalizează o linie de rețetă:
 *  - asigură ingredient valid
 *  - normalizează unitatea
 *  - determină unitType
 *  - aplică waste%
 *  - calculează quantityGross și quantityNet
 * 
 * @param {import("./recipe.types").CanonicalRecipeLine} line
 * @returns {import("./recipe.types").CanonicalRecipeLine}
 */
function normalizeRecipeLine(line) {
  const ingredient = ingredientsMaster.getIngredientById(line.ingredientId);

  // Determină unitatea (din line sau din ingredient master)
  let unit = line.unit;
  if (!unit && ingredient) {
    unit = ingredient.recipe_unit || ingredient.unit || "g";
  }
  if (!unit) {
    unit = "g"; // fallback
  }

  // Obține unitType din unitsMaster
  const unitInfo = unitsMaster.getUnit(unit);
  const unitType = unitInfo ? unitInfo.type : null;

  // Normalizează wastePercent (0-100)
  const wastePercent = typeof line.wastePercent === "number"
    ? Math.min(Math.max(line.wastePercent, 0), 100)
    : 0;

  // Calculează quantityGross și quantityNet
  const quantity = line.quantity || 0;
  let quantityGross = line.quantityGross;
  let quantityNet = line.quantityNet;

  if (quantityNet === undefined || quantityNet === null) {
    quantityNet = quantity;
  }

  if (quantityGross === undefined || quantityGross === null) {
    // quantityGross = quantityNet / (1 - wastePercent/100)
    if (wastePercent > 0) {
      quantityGross = quantityNet / (1 - wastePercent / 100);
    } else {
      quantityGross = quantityNet;
    }
  }

  return createRecipeLine({
    ...line,
    ingredient: ingredient || null,
    unit: unit,
    unitType: unitType,
    wastePercent: wastePercent,
    quantity: quantity,
    quantityGross: quantityGross,
    quantityNet: quantityNet
  });
}

/**
 * Normalizează întreaga rețetă.
 * 
 * @param {import("./recipe.types").CanonicalRecipe} recipe
 * @returns {import("./recipe.types").CanonicalRecipe}
 */
function normalizeRecipe(recipe) {
  if (!recipe) return null;

  const normalizedLines = recipe.lines.map(normalizeRecipeLine);

  // Asigură că product este din Master Data
  let product = recipe.product;
  if (!product && recipe.productId) {
    product = productsMaster.getProductById(recipe.productId) || null;
  }

  return createCanonicalRecipe({
    ...recipe,
    product: product,
    lines: normalizedLines
  });
}

/**
 * Verifică dacă toate ingredientele din rețetă există în Master Data.
 * 
 * @param {import("./recipe.types").CanonicalRecipe} recipe
 * @returns {string[]} Lista de erori (goală dacă toate ingredientele există)
 */
function validateIngredientsExist(recipe) {
  const errors = [];

  recipe.lines.forEach((line, i) => {
    if (!line.ingredient) {
      errors.push(
        `Ingredient ID ${line.ingredientId} (linia ${i + 1}) nu există în Master Data.`
      );
    }
  });

  return errors;
}

/**
 * Verifică compatibilitatea unităților cu ingredientul.
 * (ex: ingredient.unit === 'kg', dar rețeta folosește 'ml' → incompatibil)
 * 
 * @param {import("./recipe.types").CanonicalRecipe} recipe
 * @returns {string[]} Lista de erori (goală dacă toate unitățile sunt compatibile)
 */
function validateUnitsCompatibility(recipe) {
  const errors = [];

  recipe.lines.forEach((line, i) => {
    const ing = line.ingredient;
    if (!ing) return; // deja prins la validateIngredientsExist

    const recipeUnit = unitsMaster.getUnit(line.unit);
    const stockUnit = unitsMaster.getUnit(ing.unit);

    if (!recipeUnit) {
      errors.push(
        `Linia ${i + 1}: unitatea '${line.unit}' nu există în unitsMaster.`
      );
      return;
    }

    if (!stockUnit) {
      errors.push(
        `Linia ${i + 1}: unitatea ingredientului '${ing.unit}' nu există în unitsMaster.`
      );
      return;
    }

    // Verifică compatibilitate (trebuie să fie același tip: mass, volume, count)
    if (!unitsMaster.areCompatible(recipeUnit.code, stockUnit.code)) {
      errors.push(
        `Linia ${i + 1}: unit incompatibilă: rețeta folosește '${line.unit}' (${recipeUnit.type}) dar ingredientul este în '${ing.unit}' (${stockUnit.type}).`
      );
    }
  });

  return errors;
}

/**
 * Returnează toate erorile structurale (model canonic).
 * 
 * @param {import("./recipe.types").CanonicalRecipe} recipe
 * @returns {string[]} Lista de erori structurale
 */
function validateStructure(recipe) {
  return validateCanonicalRecipe(recipe);
}

/**
 * Returnează toate erorile din rețetă:
 *  - erori structurale
 *  - ingrediente lipsă
 *  - unități incompatibile
 * 
 * @param {import("./recipe.types").CanonicalRecipe} recipe
 * @returns {string[]} Lista completă de erori
 */
function validateRecipe(recipe) {
  if (!recipe) {
    return ["Rețeta este null sau undefined"];
  }

  const errors = [];

  errors.push(...validateStructure(recipe));
  errors.push(...validateIngredientsExist(recipe));
  errors.push(...validateUnitsCompatibility(recipe));

  return errors;
}

/**
 * Încarcă, normalizează și validează rețeta pentru un produs.
 * 
 * @param {number} productId - ID produs
 * @returns {Promise<{recipe: import("./recipe.types").CanonicalRecipe | null, errors: string[]}>}
 */
async function getValidatedRecipe(productId) {
  try {
    const raw = await recipeRepo.getCanonicalRecipeByProductId(productId);

    if (!raw) {
      return { recipe: null, errors: [`Nu există rețetă pentru produsul ${productId}`] };
    }

    const recipe = normalizeRecipe(raw);
    const errors = validateRecipe(recipe);

    return { recipe, errors };
  } catch (error) {
    console.error(`❌ Error loading recipe for product ${productId}:`, error);
    return { recipe: null, errors: [error.message] };
  }
}

/**
 * Returnează TRUE dacă rețeta este complet validă.
 * 
 * @param {number} productId - ID produs
 * @returns {Promise<boolean>}
 */
async function isRecipeValid(productId) {
  const { errors } = await getValidatedRecipe(productId);
  return errors.length === 0;
}

/**
 * Returnează toate ingredientele efective din rețetă,
 * expandate la ingrediente master, cu unitățile normalizate.
 * 
 * @param {number} productId - ID produs
 * @returns {Promise<Array<{ingredient: object, quantity: number, unit: string, wastePercent: number, isOptional: boolean}>>}
 */
async function getRecipeIngredients(productId) {
  const { recipe } = await getValidatedRecipe(productId);
  if (!recipe) return [];

  return recipe.lines.map((line) => ({
    ingredient: line.ingredient,
    ingredientId: line.ingredientId,
    quantity: line.quantity,
    quantityGross: line.quantityGross,
    quantityNet: line.quantityNet,
    unit: line.unit,
    unitType: line.unitType,
    wastePercent: line.wastePercent,
    isOptional: line.isOptional,
    note: line.note
  }));
}

/**
 * Returnează informații high-level despre rețetă:
 *  - câte linii
 *  - câte ingrediente lipsă
 *  - câte unități incompatibile
 *  - status validare
 * 
 * @param {number} productId - ID produs
 * @returns {Promise<object|null>} Health report sau null dacă nu există rețetă
 */
async function getRecipeHealth(productId) {
  try {
    const raw = await recipeRepo.getCanonicalRecipeByProductId(productId);
    if (!raw) return null;

    const recipe = normalizeRecipe(raw);
    const structureErrors = validateStructure(recipe);
    const ingredientErrors = validateIngredientsExist(recipe);
    const unitErrors = validateUnitsCompatibility(recipe);

    const allErrors = [...structureErrors, ...ingredientErrors, ...unitErrors];

    return {
      productId,
      product: recipe.product,
      productName: recipe.product ? recipe.product.name : null,
      lines: recipe.lines.length,
      yieldQuantity: recipe.yieldQuantity,
      yieldUnit: recipe.yieldUnit,
      prepTimeMinutes: recipe.prepTimeMinutes,
      isActive: recipe.isActive,
      isValid: allErrors.length === 0,
      errors: {
        structure: structureErrors,
        ingredients: ingredientErrors,
        units: unitErrors,
        total: allErrors.length
      },
      summary: {
        totalLines: recipe.lines.length,
        validIngredients: recipe.lines.filter(l => l.ingredient).length,
        missingIngredients: recipe.lines.filter(l => !l.ingredient).length,
        compatibleUnits: recipe.lines.filter(l => {
          if (!l.ingredient) return false;
          const recipeUnit = unitsMaster.getUnit(l.unit);
          const stockUnit = unitsMaster.getUnit(l.ingredient.unit);
          return recipeUnit && stockUnit && unitsMaster.areCompatible(recipeUnit.code, stockUnit.code);
        }).length,
        incompatibleUnits: recipe.lines.filter(l => {
          if (!l.ingredient) return true;
          const recipeUnit = unitsMaster.getUnit(l.unit);
          const stockUnit = unitsMaster.getUnit(l.ingredient.unit);
          return !recipeUnit || !stockUnit || !unitsMaster.areCompatible(recipeUnit.code, stockUnit.code);
        }).length
      }
    };
  } catch (error) {
    console.error(`❌ Error getting recipe health for product ${productId}:`, error);
    return null;
  }
}

/**
 * Returnează toate rețetele validate pentru o listă de produse.
 * Util pentru sync COGS în masă.
 * 
 * @param {number[]} productIds - Lista de ID-uri produse
 * @returns {Promise<Map<number, {recipe: import("./recipe.types").CanonicalRecipe, errors: string[]}>>}
 */
async function getValidatedRecipesByProductIds(productIds) {
  const result = new Map();

  for (const productId of productIds) {
    const validated = await getValidatedRecipe(productId);
    if (validated.recipe) {
      result.set(productId, validated);
    }
  }

  return result;
}

/**
 * Returnează toate rețetele valide (fără erori).
 * 
 * @param {number[]} productIds - Lista de ID-uri produse (opțional, dacă null returnează toate)
 * @returns {Promise<import("./recipe.types").CanonicalRecipe[]>}
 */
async function getValidRecipes(productIds = null) {
  let ids = productIds;
  
  if (!ids) {
    // Obține toate product_id-urile din DB
    const allRecipes = await recipeRepo.getAllCanonicalRecipes();
    ids = allRecipes.map(r => r.productId);
  }

  const validated = await getValidatedRecipesByProductIds(ids);
  const valid = [];

  for (const [productId, { recipe, errors }] of validated) {
    if (errors.length === 0 && recipe) {
      valid.push(recipe);
    }
  }

  return valid;
}

module.exports = {
  // Normalizare
  normalizeRecipe,
  normalizeRecipeLine,
  
  // Validare
  validateRecipe,
  validateStructure,
  validateIngredientsExist,
  validateUnitsCompatibility,
  
  // Query
  getValidatedRecipe,
  getValidatedRecipesByProductIds,
  getValidRecipes,
  isRecipeValid,
  getRecipeIngredients,
  getRecipeHealth
};

