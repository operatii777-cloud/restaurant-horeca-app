// server/seeds/validate_all.js
// ✅ VALIDARE COMPLETĂ INGREDIENTE + PRODUSE
// Restaurant App V3 powered by QrOMS

const fs = require("fs");
const path = require("path");

// ======================
// SCHEME REALE DIN DATABASE.JS
// ======================

const MENU_SCHEMA = {
  // REQUIRED
  name: { type: "string", required: true },
  category: { type: "string", required: true },
  price: { type: "number", required: true },
  description: { type: "string", required: false },
  weight: { type: "string", required: false },
  allergens: { type: "string", required: false }, // String simplu, nu array
  name_en: { type: "string", required: false },
  description_en: { type: "string", required: false },
  category_en: { type: "string", required: false },
  allergens_en: { type: "string", required: false },
  info: { type: "string", required: false },
  ingredients: { type: "string", required: false },
  prep_time: { type: "number", required: false },
  spice_level: { type: "number", required: false, default: 0 },
  calories: { type: "number", required: false },
  protein: { type: "number", required: false },
  carbs: { type: "number", required: false },
  fat: { type: "number", required: false },
  fiber: { type: "number", required: false },
  sodium: { type: "number", required: false },
  sugar: { type: "number", required: false },
  salt: { type: "number", required: false },
  image_url: { type: "string", required: false },
  // BOOLEAN fields (SQLite stores as INTEGER 0/1)
  is_vegetarian: { type: "boolean", required: false, default: false },
  is_spicy: { type: "boolean", required: false, default: false },
  is_takeout_only: { type: "boolean", required: false, default: false },
  is_sellable: { type: "boolean", required: false, default: true }
};

const INGREDIENTS_SCHEMA = {
  // REQUIRED
  name: { type: "string", required: true },
  unit: { type: "string", required: true, valid: ["kg", "g", "l", "ml", "buc", "gr", "L"] },
  current_stock: { type: "number", required: true, default: 0 },
  min_stock: { type: "number", required: true, default: 5 },
  cost_per_unit: { type: "number", required: true, default: 0 },
  is_available: { type: "boolean", required: true, default: true },
  // OPTIONAL
  name_en: { type: "string", required: false },
  category: { type: "string", required: false },
  category_en: { type: "string", required: false },
  supplier: { type: "string", required: false },
  last_updated: { type: "string", required: false },
  created_at: { type: "string", required: false },
  code: { type: "string", required: false },
  is_hidden: { type: "boolean", required: false, default: false },
  description: { type: "string", required: false },
  energy_kcal: { type: "number", required: false, default: 0 },
  fat: { type: "number", required: false, default: 0 },
  saturated_fat: { type: "number", required: false, default: 0 },
  carbs: { type: "number", required: false, default: 0 },
  sugars: { type: "number", required: false, default: 0 },
  protein: { type: "number", required: false, default: 0 },
  salt: { type: "number", required: false, default: 0 },
  fiber: { type: "number", required: false, default: 0 },
  additives: { type: "string", required: false },
  allergens: { type: "string", required: false }, // String simplu
  potential_allergens: { type: "string", required: false },
  location_id: { type: "number", required: false, default: 1 },
  official_name: { type: "string", required: false },
  category_id: { type: "number", required: false },
  subcategory_id: { type: "number", required: false },
  origin_country: { type: "string", required: false },
  storage_temp_min: { type: "number", required: false },
  storage_temp_max: { type: "number", required: false },
  haccp_notes: { type: "string", required: false },
  traceability_code: { type: "string", required: false },
  default_supplier_id: { type: "number", required: false },
  // EXTENDED (migrate)
  max_stock: { type: "number", required: false },
  safety_stock: { type: "number", required: false },
  reorder_quantity: { type: "number", required: false },
  purchase_unit: { type: "string", required: false },
  recipe_unit: { type: "string", required: false },
  inventory_unit: { type: "string", required: false },
  purchase_to_inventory_factor: { type: "number", required: false },
  inventory_to_recipe_factor: { type: "number", required: false },
  avg_price: { type: "number", required: false },
  last_purchase_price: { type: "number", required: false },
  last_purchase_date: { type: "string", required: false },
  notes: { type: "string", required: false }
};

// UE 14 Alergeni standard
const EU14_ALLERGENS = [
  "gluten", "crustaceans", "eggs", "fish", "peanuts", "soybeans",
  "milk", "nuts", "celery", "mustard", "sesame", "sulphites", "lupin", "molluscs"
];

// TVA rates valide (Aug 2025)
const VALID_VAT_RATES = [0, 5, 9, 11, 19, 21];

// ======================
// FUNCȚII VALIDARE
// ======================

function validateType(value, expectedType, fieldName) {
  if (value === null || value === undefined) {
    return { valid: true, warning: null }; // Null este OK pentru opționale
  }
  
  const actualType = typeof value;
  
  if (expectedType === "boolean") {
    // SQLite stochează boolean ca INTEGER 0/1, dar în JS poate fi boolean
    if (actualType === "boolean" || actualType === "number" || value === 0 || value === 1) {
      return { valid: true, warning: null };
    }
    return { valid: false, error: `${fieldName}: expected boolean, got ${actualType}` };
  }
  
  if (expectedType === "number") {
    if (actualType === "number" && !isNaN(value)) {
      return { valid: true, warning: null };
    }
    return { valid: false, error: `${fieldName}: expected number, got ${actualType}` };
  }
  
  if (expectedType === "string") {
    if (actualType === "string") {
      return { valid: true, warning: null };
    }
    return { valid: false, error: `${fieldName}: expected string, got ${actualType}` };
  }
  
  return { valid: true, warning: null };
}

function validateIngredient(ing, index) {
  const errors = [];
  const warnings = [];
  const extraFields = [];
  
  // Verifică câmpuri REQUIRED
  Object.keys(INGREDIENTS_SCHEMA).forEach(field => {
    const schema = INGREDIENTS_SCHEMA[field];
    
    if (schema.required && !ing.hasOwnProperty(field)) {
      errors.push(`Missing required field: ${field}`);
    }
    
    if (ing.hasOwnProperty(field)) {
      // Verifică tip
      const typeCheck = validateType(ing[field], schema.type, field);
      if (!typeCheck.valid) {
        errors.push(typeCheck.error);
      }
      
      // Verifică valori valide
      if (schema.valid && !schema.valid.includes(ing[field])) {
        errors.push(`${field}: invalid value "${ing[field]}", expected one of: ${schema.valid.join(", ")}`);
      }
      
      // Verifică valori imposibile
      if (schema.type === "number" && ing[field] < 0 && field !== "current_stock") {
        warnings.push(`${field}: negative value ${ing[field]}`);
      }
    }
  });
  
  // Verifică câmpuri extra (nu sunt în schema)
  Object.keys(ing).forEach(field => {
    if (!INGREDIENTS_SCHEMA.hasOwnProperty(field)) {
      extraFields.push(field);
    }
  });
  
  // Validări speciale
  if (ing.allergens) {
    const allergens = ing.allergens.split(",").map(a => a.trim()).filter(a => a);
    const invalidAllergens = allergens.filter(a => !EU14_ALLERGENS.includes(a.toLowerCase()));
    if (invalidAllergens.length > 0) {
      errors.push(`Invalid allergens (not UE 14): ${invalidAllergens.join(", ")}`);
    }
  }
  
  if (ing.unit && !["kg", "g", "l", "ml", "buc", "gr", "L"].includes(ing.unit.toLowerCase())) {
    warnings.push(`Unit "${ing.unit}" might not be standard (expected: kg, g, l, ml, buc, gr, L)`);
  }
  
  if (ing.cost_per_unit !== undefined && ing.cost_per_unit < 0) {
    errors.push(`cost_per_unit cannot be negative: ${ing.cost_per_unit}`);
  }
  
  if (ing.min_stock !== undefined && ing.max_stock !== undefined && ing.min_stock > ing.max_stock) {
    warnings.push(`min_stock (${ing.min_stock}) > max_stock (${ing.max_stock})`);
  }
  
  return {
    index,
    name: ing.name,
    valid: errors.length === 0,
    errors,
    warnings,
    extraFields
  };
}

function validateProduct(prod, index) {
  const errors = [];
  const warnings = [];
  const extraFields = [];
  
  // Verifică câmpuri REQUIRED
  Object.keys(MENU_SCHEMA).forEach(field => {
    const schema = MENU_SCHEMA[field];
    
    if (schema.required && !prod.hasOwnProperty(field)) {
      errors.push(`Missing required field: ${field}`);
    }
    
    if (prod.hasOwnProperty(field)) {
      // Verifică tip
      const typeCheck = validateType(prod[field], schema.type, field);
      if (!typeCheck.valid) {
        errors.push(typeCheck.error);
      }
      
      // Verifică valori imposibile
      if (schema.type === "number" && prod[field] < 0 && field !== "price") {
        warnings.push(`${field}: negative value ${prod[field]}`);
      }
    }
  });
  
  // Verifică câmpuri extra
  Object.keys(prod).forEach(field => {
    if (!MENU_SCHEMA.hasOwnProperty(field)) {
      extraFields.push(field);
    }
  });
  
  // Validări speciale
  if (prod.price !== undefined && prod.price < 0) {
    errors.push(`price cannot be negative: ${prod.price}`);
  }
  
  if (prod.allergens) {
    const allergens = prod.allergens.split(",").map(a => a.trim()).filter(a => a);
    const invalidAllergens = allergens.filter(a => !EU14_ALLERGENS.includes(a.toLowerCase()));
    if (invalidAllergens.length > 0) {
      errors.push(`Invalid allergens (not UE 14): ${invalidAllergens.join(", ")}`);
    }
  }
  
  if (prod.spice_level !== undefined && (prod.spice_level < 0 || prod.spice_level > 5)) {
    warnings.push(`spice_level should be 0-5, got ${prod.spice_level}`);
  }
  
  if (prod.prep_time !== undefined && prod.prep_time < 0) {
    errors.push(`prep_time cannot be negative: ${prod.prep_time}`);
  }
  
  return {
    index,
    name: prod.name,
    valid: errors.length === 0,
    errors,
    warnings,
    extraFields
  };
}

// ======================
// VALIDARE COMPATIBILITATE
// ======================

function validateRecipesCompatibility(ingredients) {
  const issues = [];
  
  // Verifică că toate unitățile sunt standard
  const validUnits = ["kg", "g", "l", "ml", "buc", "gr", "L"];
  ingredients.forEach((ing, idx) => {
    if (ing.unit && !validUnits.includes(ing.unit.toLowerCase())) {
      issues.push({
        type: "error",
        ingredient: ing.name,
        index: idx,
        message: `Unit "${ing.unit}" not compatible with recipe system (expected: ${validUnits.join(", ")})`
      });
    }
    
    // Verifică conversii
    if (ing.recipe_unit && !validUnits.includes(ing.recipe_unit.toLowerCase())) {
      issues.push({
        type: "error",
        ingredient: ing.name,
        index: idx,
        message: `recipe_unit "${ing.recipe_unit}" not compatible`
      });
    }
    
    // Verifică factori de conversie
    if (ing.inventory_to_recipe_factor !== undefined && ing.inventory_to_recipe_factor <= 0) {
      issues.push({
        type: "error",
        ingredient: ing.name,
        index: idx,
        message: `inventory_to_recipe_factor must be > 0, got ${ing.inventory_to_recipe_factor}`
      });
    }
  });
  
  return issues;
}

function validateStockCompatibility(ingredients) {
  const issues = [];
  
  ingredients.forEach((ing, idx) => {
    // Verifică că cost_per_unit este valid pentru NIR
    if (ing.cost_per_unit === undefined || ing.cost_per_unit === null) {
      issues.push({
        type: "warning",
        ingredient: ing.name,
        index: idx,
        message: "cost_per_unit missing - cannot calculate NIR costs"
      });
    }
    
    // Verifică unități pentru stock_moves
    if (!ing.unit) {
      issues.push({
        type: "error",
        ingredient: ing.name,
        index: idx,
        message: "unit missing - required for stock_moves"
      });
    }
    
    // Verifică stocuri
    if (ing.current_stock === undefined || ing.current_stock === null) {
      issues.push({
        type: "warning",
        ingredient: ing.name,
        index: idx,
        message: "current_stock missing - will default to 0"
      });
    }
  });
  
  return issues;
}

// ======================
// MAIN VALIDATION
// ======================

function validateAll() {
  console.log("=".repeat(80));
  console.log("🔍 VALIDARE COMPLETĂ INGREDIENTE + PRODUSE");
  console.log("=".repeat(80));
  console.log();
  
  let totalErrors = 0;
  let totalWarnings = 0;
  
  // 1. VALIDARE INGREDIENTE
  console.log("📦 1. VALIDARE INGREDIENTE");
  console.log("-".repeat(80));
  
  let ingredients;
  try {
    ingredients = require("./ingredients_seed.js");
    console.log(`✅ Loaded ${ingredients.length} ingredients`);
  } catch (error) {
    console.error(`❌ Error loading ingredients_seed.js: ${error.message}`);
    return;
  }
  
  const ingredientResults = ingredients.map((ing, idx) => validateIngredient(ing, idx));
  const invalidIngredients = ingredientResults.filter(r => !r.valid);
  const validIngredients = ingredientResults.filter(r => r.valid);
  
  console.log(`✅ Valid: ${validIngredients.length}/${ingredients.length}`);
  console.log(`❌ Invalid: ${invalidIngredients.length}/${ingredients.length}`);
  
  if (invalidIngredients.length > 0) {
    console.log("\n❌ INGREDIENTE INVALIDE:");
    invalidIngredients.slice(0, 10).forEach(ing => {
      console.log(`  [${ing.index}] ${ing.name}:`);
      ing.errors.forEach(e => console.log(`    - ${e}`));
      if (ing.warnings.length > 0) {
        ing.warnings.forEach(w => console.log(`    ⚠️  ${w}`));
      }
    });
    if (invalidIngredients.length > 10) {
      console.log(`  ... și încă ${invalidIngredients.length - 10} ingrediente invalide`);
    }
    totalErrors += invalidIngredients.length;
  }
  
  // Verifică compatibilitate recipes
  console.log("\n📋 2. VALIDARE COMPATIBILITATE RECIPES");
  console.log("-".repeat(80));
  const recipeIssues = validateRecipesCompatibility(ingredients);
  const recipeErrors = recipeIssues.filter(i => i.type === "error");
  const recipeWarnings = recipeIssues.filter(i => i.type === "warning");
  
  if (recipeErrors.length > 0) {
    console.log(`❌ Errors: ${recipeErrors.length}`);
    recipeErrors.slice(0, 5).forEach(issue => {
      console.log(`  - ${issue.ingredient}: ${issue.message}`);
    });
    totalErrors += recipeErrors.length;
  }
  
  if (recipeWarnings.length > 0) {
    console.log(`⚠️  Warnings: ${recipeWarnings.length}`);
    recipeWarnings.slice(0, 5).forEach(issue => {
      console.log(`  - ${issue.ingredient}: ${issue.message}`);
    });
    totalWarnings += recipeWarnings.length;
  }
  
  if (recipeErrors.length === 0 && recipeWarnings.length === 0) {
    console.log("✅ All ingredients compatible with recipes system");
  }
  
  // Verifică compatibilitate stocuri
  console.log("\n📊 3. VALIDARE COMPATIBILITATE STOCURI");
  console.log("-".repeat(80));
  const stockIssues = validateStockCompatibility(ingredients);
  const stockErrors = stockIssues.filter(i => i.type === "error");
  const stockWarnings = stockIssues.filter(i => i.type === "warning");
  
  if (stockErrors.length > 0) {
    console.log(`❌ Errors: ${stockErrors.length}`);
    stockErrors.slice(0, 5).forEach(issue => {
      console.log(`  - ${issue.ingredient}: ${issue.message}`);
    });
    totalErrors += stockErrors.length;
  }
  
  if (stockWarnings.length > 0) {
    console.log(`⚠️  Warnings: ${stockWarnings.length}`);
    stockWarnings.slice(0, 5).forEach(issue => {
      console.log(`  - ${issue.ingredient}: ${issue.message}`);
    });
    totalWarnings += stockWarnings.length;
  }
  
  if (stockErrors.length === 0 && stockWarnings.length === 0) {
    console.log("✅ All ingredients compatible with stock system");
  }
  
  // 2. VALIDARE PRODUSE
  console.log("\n🍕 4. VALIDARE PRODUSE");
  console.log("-".repeat(80));
  
  let products;
  try {
    products = require("./products_seed.js");
    console.log(`✅ Loaded ${products.length} products`);
  } catch (error) {
    console.error(`❌ Error loading products_seed.js: ${error.message}`);
    return;
  }
  
  const productResults = products.map((prod, idx) => validateProduct(prod, idx));
  const invalidProducts = productResults.filter(r => !r.valid);
  const validProducts = productResults.filter(r => r.valid);
  
  console.log(`✅ Valid: ${validProducts.length}/${products.length}`);
  console.log(`❌ Invalid: ${invalidProducts.length}/${products.length}`);
  
  if (invalidProducts.length > 0) {
    console.log("\n❌ PRODUSE INVALIDE:");
    invalidProducts.slice(0, 10).forEach(prod => {
      console.log(`  [${prod.index}] ${prod.name}:`);
      prod.errors.forEach(e => console.log(`    - ${e}`));
      if (prod.warnings.length > 0) {
        prod.warnings.forEach(w => console.log(`    ⚠️  ${w}`));
      }
    });
    if (invalidProducts.length > 10) {
      console.log(`  ... și încă ${invalidProducts.length - 10} produse invalide`);
    }
    totalErrors += invalidProducts.length;
  }
  
  // Verifică TVA & e-Factura
  console.log("\n💰 5. VALIDARE TVA & e-Factura");
  console.log("-".repeat(80));
  
  // Produsele nu au câmp vat_rate în schema menu, deci nu putem valida direct
  // Dar putem verifica dacă există câmpuri necesare pentru e-Factura
  const eFacturaFields = ["name", "price", "category"];
  const missingEFacturaFields = products.filter(prod => {
    return eFacturaFields.some(field => !prod.hasOwnProperty(field));
  });
  
  if (missingEFacturaFields.length > 0) {
    console.log(`⚠️  ${missingEFacturaFields.length} produse fără câmpuri necesare pentru e-Factura`);
    totalWarnings += missingEFacturaFields.length;
  } else {
    console.log("✅ All products have required fields for e-Factura");
  }
  
  // ======================
  // RAPORT FINAL
  // ======================
  console.log("\n" + "=".repeat(80));
  console.log("📊 RAPORT FINAL");
  console.log("=".repeat(80));
  console.log();
  console.log(`INGREDIENTE:`);
  console.log(`  ✅ Valid: ${validIngredients.length}/${ingredients.length}`);
  console.log(`  ❌ Invalid: ${invalidIngredients.length}/${ingredients.length}`);
  console.log();
  console.log(`PRODUSE:`);
  console.log(`  ✅ Valid: ${validProducts.length}/${products.length}`);
  console.log(`  ❌ Invalid: ${invalidProducts.length}/${products.length}`);
  console.log();
  console.log(`COMPATIBILITATE:`);
  console.log(`  ❌ Recipe Errors: ${recipeErrors.length}`);
  console.log(`  ⚠️  Recipe Warnings: ${recipeWarnings.length}`);
  console.log(`  ❌ Stock Errors: ${stockErrors.length}`);
  console.log(`  ⚠️  Stock Warnings: ${stockWarnings.length}`);
  console.log();
  console.log(`TOTAL:`);
  console.log(`  ❌ Errors: ${totalErrors}`);
  console.log(`  ⚠️  Warnings: ${totalWarnings}`);
  console.log();
  
  if (totalErrors === 0 && totalWarnings === 0) {
    console.log("✅✅✅ TOATE VALIDĂRILE PASSED! ✅✅✅");
  } else if (totalErrors === 0) {
    console.log("✅ TOATE VALIDĂRILE CRITICE PASSED (există warnings)");
  } else {
    console.log("❌ EXISTĂ ERORI CRITICE - TREBUIE REZOLVATE!");
  }
  
  // Salvează raport detaliat
  const report = {
    timestamp: new Date().toISOString(),
    ingredients: {
      total: ingredients.length,
      valid: validIngredients.length,
      invalid: invalidIngredients.length,
      invalidList: invalidIngredients.map(ing => ({
        index: ing.index,
        name: ing.name,
        errors: ing.errors,
        warnings: ing.warnings
      }))
    },
    products: {
      total: products.length,
      valid: validProducts.length,
      invalid: invalidProducts.length,
      invalidList: invalidProducts.map(prod => ({
        index: prod.index,
        name: prod.name,
        errors: prod.errors,
        warnings: prod.warnings
      }))
    },
    compatibility: {
      recipeErrors: recipeErrors,
      recipeWarnings: recipeWarnings,
      stockErrors: stockErrors,
      stockWarnings: stockWarnings
    },
    summary: {
      totalErrors,
      totalWarnings,
      allValid: totalErrors === 0
    }
  };
  
  const reportPath = path.join(__dirname, "validation_report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");
  console.log(`\n📄 Raport detaliat salvat în: ${reportPath}`);
  
  return report;
}

// ======================
// RUN
// ======================

if (require.main === module) {
  validateAll();
}

module.exports = { validateAll, validateIngredient, validateProduct };

