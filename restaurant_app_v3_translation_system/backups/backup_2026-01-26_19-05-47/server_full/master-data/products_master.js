// server/master-data/products_master.js
// ✅ Master Data pentru PRODUSE / MENU - Restaurant App V3 powered by QrOMS
// Sursă unică de adevăr pentru POS + Recipes + Admin-Vite + e-Factura

const productsSeed = require("../seeds/products_seed");

// Indexuri pentru căutare rapidă
const productsById = new Map();
const productsByName = new Map();
const productsByCategory = new Map();

// Construiește indexuri
for (const prod of productsSeed) {
  if (prod.id != null) {
    productsById.set(prod.id, prod);
  }
  
  if (prod.name) {
    productsByName.set(prod.name.toLowerCase(), prod);
  }
  
  if (prod.category) {
    const key = prod.category.toLowerCase();
    if (!productsByCategory.has(key)) {
      productsByCategory.set(key, []);
    }
    productsByCategory.get(key).push(prod);
  }
}

// ======================
// FUNCȚII QUERY
// ======================

/**
 * Returnează toate produsele
 * @returns {Array} Lista completă de produse
 */
function getAllProducts() {
  return productsSeed;
}

/**
 * Găsește produs după ID
 * @param {number} id - ID produs
 * @returns {Object|null} Produs sau null
 */
function getProductById(id) {
  if (id == null) return null;
  return productsById.get(id) || null;
}

/**
 * Găsește produs după nume (case-insensitive)
 * @param {string} name - Nume produs
 * @returns {Object|null} Produs sau null
 */
function getProductByName(name) {
  if (!name) return null;
  return productsByName.get(name.toLowerCase()) || null;
}

/**
 * Găsește produse după categorie
 * @param {string} category - Categorie (ex: "Pizza", "Burgers")
 * @returns {Array} Lista de produse din categorie
 */
function getProductsByCategory(category) {
  if (!category) return [];
  return productsByCategory.get(category.toLowerCase()) || [];
}

/**
 * Căutare produs (nume sau descriere)
 * @param {string} query - Căutare
 * @returns {Array} Lista de produse care se potrivesc
 */
function searchProducts(query) {
  if (!query) return [];
  const lowerQuery = query.toLowerCase();
  return productsSeed.filter(prod => 
    (prod.name && prod.name.toLowerCase().includes(lowerQuery)) ||
    (prod.name_en && prod.name_en.toLowerCase().includes(lowerQuery)) ||
    (prod.description && prod.description.toLowerCase().includes(lowerQuery)) ||
    (prod.description_en && prod.description_en.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Verifică dacă un produs există
 * @param {string} name - Nume produs
 * @returns {boolean}
 */
function productExists(name) {
  return getProductByName(name) !== null;
}

/**
 * Obține toate categoriile unice
 * @returns {Array} Lista de categorii
 */
function getAllCategories() {
  return Array.from(productsByCategory.keys());
}

/**
 * Obține produse vandabile (is_sellable = true)
 * @returns {Array} Lista de produse vandabile
 */
function getSellableProducts() {
  return productsSeed.filter(prod => prod.is_sellable !== false);
}

/**
 * Obține produse vegetariene
 * @returns {Array} Lista de produse vegetariene
 */
function getVegetarianProducts() {
  return productsSeed.filter(prod => prod.is_vegetarian === true);
}

/**
 * Obține produse picante
 * @returns {Array} Lista de produse picante
 */
function getSpicyProducts() {
  return productsSeed.filter(prod => prod.is_spicy === true);
}

// ======================
// STATISTICI
// ======================

function getStats() {
  return {
    total: productsSeed.length,
    categories: productsByCategory.size,
    sellable: getSellableProducts().length,
    vegetarian: getVegetarianProducts().length,
    spicy: getSpicyProducts().length,
    withAllergens: productsSeed.filter(prod => prod.allergens && prod.allergens.length > 0).length,
    takeoutOnly: productsSeed.filter(prod => prod.is_takeout_only === true).length
  };
}

// ======================
// EXPORT
// ======================

module.exports = {
  // Date brute
  all: productsSeed,
  
  // Funcții query
  getAllProducts,
  getProductById,
  getProductByName,
  getProductsByCategory,
  searchProducts,
  productExists,
  getAllCategories,
  getSellableProducts,
  getVegetarianProducts,
  getSpicyProducts,
  getStats,
  
  // Indexuri interne (pentru performanță avansată)
  _byId: productsById,
  _byName: productsByName,
  _byCategory: productsByCategory
};

