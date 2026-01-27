// server/src/modules/recipes/recipe.repository.js
/**
 * S13 Recipe Repository
 *
 * RESPONSABILITATE:
 *  - citește rețete din DB
 *  - apelează mapper-ul pentru CanonicalRecipe
 *  - nu conține logică de COGS sau stock
 */

const { dbPromise } = require("../../../database");
const { mapDbRecipeToCanonical } = require("./recipe.mapper");

/**
 * Schema DB actuală:
 * 
 * Tabel `recipes`:
 *  - id, product_id, ingredient_id, recipe_id, quantity_needed, item_type, 
 *    is_semi_finished, unit, waste_percentage, variable_consumption, created_at
 * 
 * Tabel `recipe_ingredients` (dacă există):
 *  - id, recipe_id, ingredient_id, quantity_gross, quantity_net, waste_percentage,
 *    unit, preparation_method, preparation_time_minutes, preparation_notes,
 *    is_optional, can_be_substituted, substitution_ingredient_id, substitution_notes,
 *    cost_method, sort_order, created_at
 * 
 * NOTĂ: Repository-ul suportă ambele structuri și detectează automat care există.
 */

// SQL pentru structura veche (recipes cu toate liniile în același tabel)
const SQL_GET_RECIPE_BY_PRODUCT_OLD =
  `SELECT DISTINCT 
     r1.id,
     r1.product_id,
     r1.recipe_id,
     r1.is_semi_finished,
     r1.created_at
   FROM recipes r1
   WHERE r1.product_id = ? 
     AND r1.ingredient_id IS NOT NULL
     AND (r1.item_type = 'ingredient' OR r1.item_type IS NULL)
   LIMIT 1`;

const SQL_GET_LINES_BY_PRODUCT_OLD =
  `SELECT 
     id,
     product_id,
     ingredient_id,
     quantity_needed as quantity,
     unit,
     waste_percentage,
     is_semi_finished,
     item_type,
     created_at
   FROM recipes
   WHERE product_id = ?
     AND ingredient_id IS NOT NULL
     AND (item_type = 'ingredient' OR item_type IS NULL)
   ORDER BY id ASC`;

// SQL pentru structura nouă (recipe_ingredients separat)
const SQL_GET_RECIPE_BY_PRODUCT_NEW =
  `SELECT DISTINCT 
     r.id,
     r.product_id,
     r.recipe_id,
     r.is_semi_finished,
     r.created_at
   FROM recipes r
   WHERE r.product_id = ?
   LIMIT 1`;

const SQL_GET_LINES_BY_RECIPE_NEW =
  `SELECT 
     id,
     recipe_id,
     ingredient_id,
     quantity_gross,
     quantity_net,
     quantity_net as quantity,
     unit,
     waste_percentage,
     is_optional,
     preparation_notes as note,
     sort_order,
     created_at
   FROM recipe_ingredients
   WHERE recipe_id = ?
   ORDER BY sort_order ASC, id ASC`;

/**
 * Verifică dacă tabelul recipe_ingredients există
 * @returns {Promise<boolean>}
 */
async function recipeIngredientsTableExists() {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='recipe_ingredients'`,
      [],
      (err, row) => {
        if (err) return reject(err);
        resolve(!!row);
      }
    );
  });
}

/**
 * Load raw recipe row by product ID (structură veche sau nouă).
 * @param {number} productId
 * @returns {Promise<object|null>}
 */
async function loadRecipeRowByProductId(productId) {
  const db = await dbPromise;
  const hasNewStructure = await recipeIngredientsTableExists();
  
  const sql = hasNewStructure ? SQL_GET_RECIPE_BY_PRODUCT_NEW : SQL_GET_RECIPE_BY_PRODUCT_OLD;
  
  return new Promise((resolve, reject) => {
    db.get(sql, [productId], (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

/**
 * Load raw recipe lines by product ID (structură veche) sau recipe ID (structură nouă).
 * @param {number} productId - ID produs
 * @param {number|null} recipeId - ID rețetă (pentru structură nouă)
 * @returns {Promise<object[]>}
 */
async function loadRecipeLinesByProductOrRecipeId(productId, recipeId = null) {
  const db = await dbPromise;
  const hasNewStructure = await recipeIngredientsTableExists();
  
  return new Promise((resolve, reject) => {
    if (hasNewStructure && recipeId) {
      // Structură nouă: folosește recipe_ingredients
      db.all(SQL_GET_LINES_BY_RECIPE_NEW, [recipeId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    } else {
      // Structură veche: folosește recipes direct
      db.all(SQL_GET_LINES_BY_PRODUCT_OLD, [productId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    }
  });
}

/**
 * Returnează rețeta canonică pentru un produs.
 *
 * @param {number} productId
 * @returns {Promise<import("./recipe.types").CanonicalRecipe|null>}
 */
async function getCanonicalRecipeByProductId(productId) {
  try {
    const recipeRow = await loadRecipeRowByProductId(productId);
    if (!recipeRow) return null;

    const recipeId = recipeRow.id;
    const lineRows = await loadRecipeLinesByProductOrRecipeId(productId, recipeId);
    
    return mapDbRecipeToCanonical(recipeRow, lineRows);
  } catch (error) {
    console.error(`❌ Error loading recipe for product ${productId}:`, error);
    return null;
  }
}

/**
 * Returnează rețete canonice pentru o listă de produse.
 * Util pentru sync COGS în masă.
 *
 * @param {number[]} productIds
 * @returns {Promise<Map<number, import("./recipe.types").CanonicalRecipe>>}
 */
async function getCanonicalRecipesByProductIds(productIds) {
  const result = new Map();

  for (const pid of productIds) {
    const recipe = await getCanonicalRecipeByProductId(pid);
    if (recipe) {
      result.set(pid, recipe);
    }
  }

  return result;
}

/**
 * Returnează toate rețetele canonice (pentru sync complet).
 * 
 * @returns {Promise<import("./recipe.types").CanonicalRecipe[]>}
 */
async function getAllCanonicalRecipes() {
  const db = await dbPromise;
  const hasNewStructure = await recipeIngredientsTableExists();
  
  return new Promise((resolve, reject) => {
    // Obține toate product_id-urile unice care au rețete
    const sql = hasNewStructure
      ? `SELECT DISTINCT product_id FROM recipes WHERE product_id IS NOT NULL`
      : `SELECT DISTINCT product_id FROM recipes WHERE product_id IS NOT NULL AND ingredient_id IS NOT NULL`;
    
    db.all(sql, [], async (err, rows) => {
      if (err) return reject(err);
      
      const recipes = [];
      for (const row of rows) {
        const recipe = await getCanonicalRecipeByProductId(row.product_id);
        if (recipe) {
          recipes.push(recipe);
        }
      }
      
      resolve(recipes);
    });
  });
}

module.exports = {
  loadRecipeRowByProductId,
  loadRecipeLinesByProductOrRecipeId,
  getCanonicalRecipeByProductId,
  getCanonicalRecipesByProductIds,
  getAllCanonicalRecipes,
  recipeIngredientsTableExists
};

