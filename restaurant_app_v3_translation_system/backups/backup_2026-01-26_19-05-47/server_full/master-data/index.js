// server/master-data/index.js
// ✅ Master Data Layer - Entry Point Unic
// Restaurant App V3 powered by QrOMS
// Sursă unică de adevăr pentru toate modulele: Admin-Vite, POS, Recipes, Stock, NIR, e-Factura

const ingredientsMaster = require("./ingredients_master");
const productsMaster = require("./products_master");
const allergensMaster = require("./allergens_master");
const categoriesMaster = require("./categories_master");
const unitsMaster = require("./units_master");

// ======================
// STATISTICI GLOBALE
// ======================

function getGlobalStats() {
  return {
    ingredients: ingredientsMaster.getStats(),
    products: productsMaster.getStats(),
    allergens: {
      total: allergensMaster.ALLERGENS.length,
      eu14: true
    },
    categories: {
      ingredients: categoriesMaster.INGREDIENT_CATEGORIES.length,
      menu: categoriesMaster.MENU_CATEGORIES.length
    },
    units: {
      total: unitsMaster.UNITS.length,
      byType: {
        mass: unitsMaster.getUnitsByType("mass").length,
        volume: unitsMaster.getUnitsByType("volume").length,
        count: unitsMaster.getUnitsByType("count").length
      }
    }
  };
}

// ======================
// VALIDARE MASTER DATA
// ======================

function validateMasterData() {
  const issues = [];
  
  // Verifică ingrediente
  const ingStats = ingredientsMaster.getStats();
  if (ingStats.total === 0) {
    issues.push("No ingredients found");
  }
  
  // Verifică produse
  const prodStats = productsMaster.getStats();
  if (prodStats.total === 0) {
    issues.push("No products found");
  }
  
  // Verifică alergeni UE 14
  if (allergensMaster.ALLERGENS.length !== 14) {
    issues.push(`Expected 14 EU allergens, found ${allergensMaster.ALLERGENS.length}`);
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

// ======================
// EXPORT
// ======================

module.exports = {
  // Master data modules
  ingredientsMaster,
  productsMaster,
  allergensMaster,
  categoriesMaster,
  unitsMaster,
  
  // Utility functions
  getGlobalStats,
  validateMasterData
};

