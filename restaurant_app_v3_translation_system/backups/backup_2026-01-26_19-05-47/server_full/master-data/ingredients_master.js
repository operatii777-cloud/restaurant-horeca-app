// server/master-data/ingredients_master.js
// ✅ Master Data pentru INGREDIENTE - Restaurant App V3 powered by QrOMS
// Sursă unică de adevăr pentru Admin-Vite + POS + Recipes + Stock + NIR

const ingredientsSeed = require("../seeds/ingredients_seed");

// Indexuri pentru căutare rapidă
const ingredientsById = new Map();
const ingredientsByName = new Map();
const ingredientsByCategory = new Map();
const ingredientsByCode = new Map();

// Construiește indexuri
for (const ing of ingredientsSeed) {
  if (ing.id != null) {
    ingredientsById.set(ing.id, ing);
  }
  
  if (ing.name) {
    ingredientsByName.set(ing.name.toLowerCase(), ing);
  }
  
  if (ing.code) {
    ingredientsByCode.set(ing.code.toLowerCase(), ing);
  }
  
  if (ing.category) {
    const key = ing.category.toLowerCase();
    if (!ingredientsByCategory.has(key)) {
      ingredientsByCategory.set(key, []);
    }
    ingredientsByCategory.get(key).push(ing);
  }
}

// ======================
// FUNCȚII QUERY
// ======================

/**
 * Returnează toate ingredientele
 * @returns {Array} Lista completă de ingrediente
 */
function getAllIngredients() {
  return ingredientsSeed;
}

/**
 * Găsește ingredient după ID
 * @param {number} id - ID ingredient
 * @returns {Object|null} Ingredient sau null
 */
function getIngredientById(id) {
  if (id == null) return null;
  return ingredientsById.get(id) || null;
}

/**
 * Găsește ingredient după nume (case-insensitive)
 * @param {string} name - Nume ingredient
 * @returns {Object|null} Ingredient sau null
 */
function getIngredientByName(name) {
  if (!name) return null;
  return ingredientsByName.get(name.toLowerCase()) || null;
}

/**
 * Găsește ingredient după cod
 * @param {string} code - Cod ingredient
 * @returns {Object|null} Ingredient sau null
 */
function getIngredientByCode(code) {
  if (!code) return null;
  return ingredientsByCode.get(code.toLowerCase()) || null;
}

/**
 * Găsește ingrediente după categorie
 * @param {string} category - Categorie (ex: "Carne", "Legume")
 * @returns {Array} Lista de ingrediente din categorie
 */
function getIngredientsByCategory(category) {
  if (!category) return [];
  return ingredientsByCategory.get(category.toLowerCase()) || [];
}

/**
 * Căutare ingredient (nume sau cod)
 * @param {string} query - Căutare
 * @returns {Array} Lista de ingrediente care se potrivesc
 */
function searchIngredients(query) {
  if (!query) return [];
  const lowerQuery = query.toLowerCase();
  return ingredientsSeed.filter(ing => 
    (ing.name && ing.name.toLowerCase().includes(lowerQuery)) ||
    (ing.name_en && ing.name_en.toLowerCase().includes(lowerQuery)) ||
    (ing.code && ing.code.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Verifică dacă un ingredient există
 * @param {string} name - Nume ingredient
 * @returns {boolean}
 */
function ingredientExists(name) {
  return getIngredientByName(name) !== null;
}

/**
 * Obține toate categoriile unice
 * @returns {Array} Lista de categorii
 */
function getAllCategories() {
  return Array.from(ingredientsByCategory.keys());
}

// ======================
// STATISTICI
// ======================

function getStats() {
  return {
    total: ingredientsSeed.length,
    categories: ingredientsByCategory.size,
    withAllergens: ingredientsSeed.filter(ing => ing.allergens && ing.allergens.length > 0).length,
    available: ingredientsSeed.filter(ing => ing.is_available !== false).length,
    hidden: ingredientsSeed.filter(ing => ing.is_hidden === true).length
  };
}

// ======================
// EXPORT
// ======================

module.exports = {
  // Date brute
  all: ingredientsSeed,
  
  // Funcții query
  getAllIngredients,
  getIngredientById,
  getIngredientByName,
  getIngredientByCode,
  getIngredientsByCategory,
  searchIngredients,
  ingredientExists,
  getAllCategories,
  getStats,
  
  // Indexuri interne (pentru performanță avansată)
  _byId: ingredientsById,
  _byName: ingredientsByName,
  _byCode: ingredientsByCode,
  _byCategory: ingredientsByCategory
};

