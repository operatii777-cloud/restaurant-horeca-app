// server/master-data/categories_master.js
// ✅ Master Data pentru CATEGORII - Restaurant App V3 powered by QrOMS
// Categorii standardizate pentru Ingrediente și Produse (Menu)

// ======================
// CATEGORII INGREDIENTE
// ======================

const INGREDIENT_CATEGORIES = [
  { code: "VEGETABLES_FRUITS", ro: "Legume & Fructe", en: "Vegetables & Fruits" },
  { code: "MEAT", ro: "Carne & Mezeluri", en: "Meat & Deli" },
  { code: "FISH_SEAFOOD", ro: "Pește & Fructe de Mare", en: "Fish & Seafood" },
  { code: "DAIRY_EGGS", ro: "Lactate & Ouă", en: "Dairy & Eggs" },
  { code: "BAKERY_GRAINS", ro: "Panificație & Cereale", en: "Bakery & Grains" },
  { code: "GROCERY", ro: "Băcănie", en: "Grocery" },
  { code: "FROZEN", ro: "Congelate", en: "Frozen" },
  { code: "CONDIMENTS", ro: "Condimente & Sosuri", en: "Condiments & Sauces" },
  { code: "DRINKS", ro: "Băuturi & Bar", en: "Drinks & Bar" },
  { code: "CLEANING", ro: "Detergenți & Curățenie", en: "Cleaning" },
  { code: "CONSUMABLES", ro: "Consumabile", en: "Consumables" },
  { code: "PACKAGING", ro: "Ambalaje", en: "Packaging" },
  { code: "OTHER", ro: "Altele", en: "Other" }
];

// ======================
// CATEGORII MENIU / PRODUSE POS
// ======================

const MENU_CATEGORIES = [
  { code: "PIZZA", ro: "Pizza", en: "Pizza" },
  { code: "BURGERS", ro: "Burgers", en: "Burgers" },
  { code: "PASTA", ro: "Paste Fresca", en: "Pasta" },
  { code: "PENNE_AL_FORNO", ro: "Penne Al Forno", en: "Baked Penne" },
  { code: "MAIN_COURSE", ro: "Fel Principal", en: "Main Course" },
  { code: "SEAFOOD", ro: "Pește & Fructe de Mare", en: "Seafood" },
  { code: "SALADS", ro: "Salate", en: "Salads" },
  { code: "SOUPS", ro: "Ciorbe & Supe", en: "Soups" },
  { code: "SIDES", ro: "Garnituri", en: "Side Dishes" },
  { code: "PLATTERS", ro: "Platouri", en: "Platters" },
  { code: "DESSERTS", ro: "Deserturi", en: "Desserts" },
  { code: "BREAKFAST", ro: "Mic Dejun", en: "Breakfast" },
  { code: "COFFEE", ro: "Cafea", en: "Coffee" },
  { code: "SOFT_DRINKS", ro: "Băuturi răcoritoare", en: "Soft Drinks" },
  { code: "ALCOHOLIC", ro: "Băuturi alcoolice", en: "Alcoholic Drinks" },
  { code: "OTHER", ro: "Altele", en: "Other" }
];

// Indexuri pentru căutare rapidă
const ingredientCategoriesByCode = new Map();
const ingredientCategoriesByLabel = new Map();
const menuCategoriesByCode = new Map();
const menuCategoriesByLabel = new Map();

// Construiește indexuri pentru ingrediente
for (const c of INGREDIENT_CATEGORIES) {
  ingredientCategoriesByCode.set(c.code, c);
  ingredientCategoriesByLabel.set(c.ro.toLowerCase(), c);
  ingredientCategoriesByLabel.set(c.en.toLowerCase(), c);
}

// Construiește indexuri pentru meniu
for (const c of MENU_CATEGORIES) {
  menuCategoriesByCode.set(c.code, c);
  menuCategoriesByLabel.set(c.ro.toLowerCase(), c);
  menuCategoriesByLabel.set(c.en.toLowerCase(), c);
}

// ======================
// FUNCȚII QUERY
// ======================

/**
 * Găsește categorie ingredient după cod
 * @param {string} code - Cod categorie (ex: "MEAT", "VEGETABLES_FRUITS")
 * @returns {Object|null} Categorie sau null
 */
function getIngredientCategoryByCode(code) {
  if (!code) return null;
  return ingredientCategoriesByCode.get(code.toUpperCase()) || null;
}

/**
 * Găsește categorie ingredient după label (RO sau EN)
 * @param {string} label - Label categorie (ex: "Carne", "Meat")
 * @returns {Object|null} Categorie sau null
 */
function findIngredientCategoryByLabel(label) {
  if (!label) return null;
  const lower = label.toLowerCase();
  return ingredientCategoriesByLabel.get(lower) || null;
}

/**
 * Găsește categorie meniu după cod
 * @param {string} code - Cod categorie (ex: "PIZZA", "BURGERS")
 * @returns {Object|null} Categorie sau null
 */
function getMenuCategoryByCode(code) {
  if (!code) return null;
  return menuCategoriesByCode.get(code.toUpperCase()) || null;
}

/**
 * Găsește categorie meniu după label (RO sau EN)
 * @param {string} label - Label categorie (ex: "Pizza", "Burgers")
 * @returns {Object|null} Categorie sau null
 */
function findMenuCategoryByLabel(label) {
  if (!label) return null;
  const lower = label.toLowerCase();
  return menuCategoriesByLabel.get(lower) || null;
}

/**
 * Normalizează numele categoriei la cod standard
 * @param {string} categoryName - Nume categorie (RO sau EN)
 * @param {string} type - "ingredient" sau "menu"
 * @returns {string|null} Cod categorie sau null
 */
function normalizeCategoryName(categoryName, type = "ingredient") {
  if (!categoryName) return null;
  
  if (type === "ingredient") {
    const cat = findIngredientCategoryByLabel(categoryName);
    return cat ? cat.code : null;
  } else {
    const cat = findMenuCategoryByLabel(categoryName);
    return cat ? cat.code : null;
  }
}

// ======================
// EXPORT
// ======================

module.exports = {
  // Liste complete
  INGREDIENT_CATEGORIES,
  MENU_CATEGORIES,
  
  // Funcții query
  getIngredientCategoryByCode,
  findIngredientCategoryByLabel,
  getMenuCategoryByCode,
  findMenuCategoryByLabel,
  normalizeCategoryName,
  
  // Indexuri interne
  ingredientCategoriesByCode,
  menuCategoriesByCode
};

