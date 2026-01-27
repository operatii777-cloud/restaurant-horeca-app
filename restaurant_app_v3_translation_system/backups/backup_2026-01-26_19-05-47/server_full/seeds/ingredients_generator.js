// server/seeds/ingredients_generator.js
// ✅ Generator pentru 1500 INGREDIENTE - Restaurant App V3 powered by QrOMS
// Generează ingrediente reale pentru sistemul de stocuri și retete

const fs = require("fs");
const path = require("path");
const baseIngredients = require("./ingredients_base_list");

const TARGET_COUNT = 1500;

// Mapping alergeni RO -> EN (UE 14 standard)
const ALLERGEN_MAP = {
  "pește": "fish",
  "crustacee": "crustaceans",
  "moluște": "molluscs",
  "lapte": "milk",
  "soia": "soybeans",
  "nuci": "nuts",
  "țelină": "celery",
  "ouă": "eggs",
  "ou": "eggs",
  "muștar": "mustard",
  "sulfiți": "sulphites",
  "semințe": "sesame",
  "susan": "sesame",
  "gluten": "gluten",
  "arahide": "peanuts",
  "lupin": "lupin"
};

function normalizeAllergens(allergensStr) {
  if (!allergensStr || allergensStr.trim() === "") return "";
  
  return allergensStr
    .split(",")
    .map(a => a.trim())
    .map(a => ALLERGEN_MAP[a.toLowerCase()] || a.toLowerCase())
    .filter(a => a)
    .join(", ");
}

// ======================
// EXTINDERI PE CATEGORII
// ======================

// Variante pentru carne
const meatVariants = [
  { suffix: " - Porție", unit: "buc", priceMod: 0.1 },
  { suffix: " - File", unit: "kg", priceMod: 0.15 },
  { suffix: " - Premium", unit: "kg", priceMod: 0.25 },
  { suffix: " - Bio", unit: "kg", priceMod: 0.30 }
];

// Variante pentru legume
const vegetableVariants = [
  { suffix: " - Bio", unit: "kg", priceMod: 0.20 },
  { suffix: " - Organic", unit: "kg", priceMod: 0.25 },
  { suffix: " - Proaspăt", unit: "kg", priceMod: 0.05 }
];

// Variante pentru brânzeturi
const cheeseVariants = [
  { suffix: " - Maturat", unit: "kg", priceMod: 0.15 },
  { suffix: " - Premium", unit: "kg", priceMod: 0.20 },
  { suffix: " - Artizanal", unit: "kg", priceMod: 0.30 }
];

// Condimente suplimentare
const extraSpices = [
  "Coriandru", "Cumin", "Curcuma", "Chimion", "Fenicul", "Anason", "Cardamom",
  "Cuișoare", "Nucșoară", "Scorțișoară", "Garam masala", "Curry", "Za'atar",
  "Sumac", "Ras el hanout", "Chipotle", "Cayenne", "Smoked paprika", "Fenugreek"
];

// Legume suplimentare
const extraVegetables = [
  "Varză", "Varză roșie", "Conopidă verde", "Asparagus", "Șparanghel", "Păstârnac",
  "Ridichi", "Ridichi roșie", "Ridichi neagră", "Ridichi daikon", "Rădăcină de pătrunjel",
  "Rădăcină de țelină", "Pătlăgele", "Pătlăgele roșii", "Pătlăgele galbene", "Pătlăgele verzi",
  "Ardei roșu", "Ardei galben", "Ardei verde", "Ardei iute habanero", "Ardei iute scotch bonnet",
  "Ardei iute serrano", "Ardei iute poblano", "Ardei iute anaheim", "Ardei iute thai",
  "Conopidă", "Conopidă mov", "Conopidă verde", "Conopidă portocalie", "Broccoli rabe",
  "Kale", "Swiss chard", "Mangold", "Lettuce romaine", "Lettuce butter", "Lettuce red leaf",
  "Lettuce green leaf", "Arugula baby", "Watercress", "Mâche", "Frisee", "Endive",
  "Radicchio", "Belgian endive", "Chicory", "Dandelion greens", "Mustard greens",
  "Turnip greens", "Collard greens", "Beet greens", "Carrot tops", "Celery leaves",
  "Fennel bulb", "Fennel fronds", "Leeks", "Shallots", "Scallions", "Green onions",
  "Chives", "Garlic scapes", "Garlic chives", "Wild garlic", "Ramps", "Spring onions"
];

// Brânzeturi suplimentare
const extraCheeses = [
  "Ricotta", "Pecorino", "Asiago", "Fontina", "Taleggio", "Gorgonzola dolce",
  "Stilton", "Roquefort", "Camembert", "Munster", "Havarti", "Swiss cheese",
  "Gruyere", "Emmental", "Appenzeller", "Raclette", "Comte", "Beaufort",
  "Reblochon", "Tomme", "Cantal", "Fourme d'Ambert", "Bleu d'Auvergne",
  "Goat cheese", "Sheep cheese", "Manchego", "Idiazabal", "Mahon", "Tetilla",
  "Cabrales", "Valdeon", "Queso fresco", "Panela", "Oaxaca", "Cotija",
  "Provolone", "Mozzarella di bufala campana", "Burrata", "Stracciatella",
  "Scamorza", "Caciocavallo", "Pecorino romano", "Pecorino sardo", "Pecorino toscano"
];

// Carne suplimentară
const extraMeats = [
  "Pui întreg", "Pui dezosat", "Pui tăiat bucăți", "Pui marinat", "Pui organic",
  "Pui fermier", "Pui de casă", "Pui de curte", "Pui free range", "Pui cornish",
  "Pui puiulet", "Pui puișor", "Pui puișor dezosat", "Pui puișor tăiat",
  "Vită maturată", "Vită wagyu", "Vită angus", "Vită hereford", "Vită limousin",
  "Vită charolais", "Vită simmental", "Vită organică", "Vită grass-fed",
  "Vită grain-fed", "Vită dry-aged", "Vită wet-aged", "Vită premium",
  "Porc iberic", "Porc mangalita", "Porc organic", "Porc fermier", "Porc de casă",
  "Porc free range", "Porc heritage", "Porc kurobuta", "Porc duroc",
  "Miel", "Oaie", "Capră", "Căprioară", "Cerb", "Jder", "Iepure", "Fazan",
  "Prepeliță", "Rață", "Gâscă", "Curcan", "Curcan întreg", "Curcan piept",
  "Curcan pulpe", "Curcan aripi", "Curcan gât", "Curcan ficat"
];

// Peste suplimentar
const extraFish = [
  "Somon afumat", "Somon marinat", "Somon sărat", "Somon congelat",
  "Trucă", "Păstrăv", "Șalău", "Biban", "Platou", "Știucă", "Somn", "Zander",
  "Biban de mare", "Cod", "Haddock", "Pollock", "Whiting", "Hake", "Ling",
  "Torsk", "Cusk", "Cusk", "Lingcod", "Rockfish", "Snapper", "Grouper",
  "Mahi mahi", "Wahoo", "Barracuda", "Amberjack", "Yellowtail", "Tuna",
  "Albacore", "Yellowfin", "Bluefin", "Skipjack", "Bonito", "Mackerel",
  "Spanish mackerel", "King mackerel", "Sardine", "Anchovy", "Herring",
  "Sprat", "Sprat", "Sprat", "Sprat", "Sprat", "Sprat", "Sprat"
];

// Fructe de mare suplimentare
const extraSeafood = [
  "Creveți tigru", "Creveți king", "Creveți jumbo", "Creveți colosal",
  "Creveți langoustine", "Creveți scampi", "Creveți rock", "Creveți spot",
  "Creveți white", "Creveți brown", "Creveți pink", "Creveți royal red",
  "Creveți congelat", "Creveți proaspăt", "Creveți live", "Creveți head-on",
  "Creveți head-off", "Creveți shell-on", "Creveți peeled", "Creveți deveined",
  "Midii verzi", "Midii negre", "Midii blue", "Midii mediteraneene",
  "Midii atlantice", "Midii pacifice", "Midii live", "Midii în cochilie",
  "Midii fără cochilie", "Midii congelate", "Midii proaspete", "Midii în conservă",
  "Calamar întreg", "Calamar inele", "Calamar tentacule", "Calamar tube",
  "Calamar baby", "Calamar jumbo", "Calamar proaspăt", "Calamar congelat",
  "Sepia", "Cuttlefish", "Octopus", "Pulpo", "Caracatiță", "Caracatiță baby",
  "Caracatiță jumbo", "Caracatiță proaspătă", "Caracatiță congelată",
  "Vieții", "Razor clams", "Cockles", "Clams", "Quahogs", "Littlenecks",
  "Cherrystones", "Chowder clams", "Geoduck", "Abalone", "Sea urchin",
  "Sea cucumber", "Conch", "Whelk", "Periwinkle", "Barnacles", "Gooseneck barnacles"
];

// ======================
// FUNCȚII HELPER
// ======================

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateIngredientFromBase(base, variant = null) {
  const clone = JSON.parse(JSON.stringify(base));
  
  // Asigură-te că toate câmpurile necesare există
  if (!clone.purchase_unit) clone.purchase_unit = clone.unit;
  if (!clone.recipe_unit) clone.recipe_unit = clone.unit === "kg" ? "g" : clone.unit === "l" ? "ml" : clone.unit;
  if (!clone.inventory_unit) clone.inventory_unit = clone.unit;
  if (!clone.purchase_to_inventory_factor) clone.purchase_to_inventory_factor = 1.0;
  if (!clone.inventory_to_recipe_factor) clone.inventory_to_recipe_factor = clone.unit === "kg" ? 1000.0 : clone.unit === "l" ? 1000.0 : 1.0;
  if (clone.max_stock === undefined) clone.max_stock = (clone.min_stock || 10) * 3;
  if (clone.safety_stock === undefined) clone.safety_stock = Math.floor((clone.min_stock || 10) * 0.5);
  if (clone.reorder_quantity === undefined) clone.reorder_quantity = (clone.min_stock || 10) * 2;
  if (!clone.avg_price) clone.avg_price = clone.cost_per_unit;
  if (!clone.last_purchase_price) clone.last_purchase_price = clone.cost_per_unit;
  if (clone.energy_kcal === undefined) clone.energy_kcal = 0;
  if (clone.fat === undefined) clone.fat = 0;
  if (clone.saturated_fat === undefined) clone.saturated_fat = 0;
  if (clone.carbs === undefined) clone.carbs = 0;
  if (clone.sugars === undefined) clone.sugars = 0;
  if (clone.protein === undefined) clone.protein = 0;
  if (clone.salt === undefined) clone.salt = 0;
  if (clone.fiber === undefined) clone.fiber = 0;
  if (!clone.potential_allergens) clone.potential_allergens = "";
  if (!clone.additives) clone.additives = "";
  if (!clone.notes) clone.notes = "";
  if (!clone.official_name) clone.official_name = null;
  if (!clone.category_id) clone.category_id = null;
  if (!clone.subcategory_id) clone.subcategory_id = null;
  if (!clone.origin_country) clone.origin_country = "RO";
  if (!clone.traceability_code) clone.traceability_code = "";
  if (!clone.supplier) clone.supplier = "";
  if (!clone.default_supplier_id) clone.default_supplier_id = null;
  if (!clone.location_id) clone.location_id = 1;
  // ✅ FIX: Adaugă is_available și is_hidden dacă lipsesc (REQUIRED)
  if (clone.is_available === undefined || clone.is_available === null) clone.is_available = true;
  if (clone.is_hidden === undefined || clone.is_hidden === null) clone.is_hidden = false;
  if (!clone.haccp_notes) clone.haccp_notes = null;
  if (!clone.storage_temp_min && (clone.category === "Carne" || clone.category === "Peste" || clone.category === "Fructe de Mare" || clone.category === "Lactate")) {
    clone.storage_temp_min = 2;
  }
  if (!clone.storage_temp_max && (clone.category === "Carne" || clone.category === "Peste" || clone.category === "Fructe de Mare" || clone.category === "Lactate")) {
    clone.storage_temp_max = 4;
  }
  
  if (variant) {
    clone.name = `${base.name}${variant.suffix}`;
    clone.name_en = `${base.name_en}${variant.suffix}`;
    clone.unit = variant.unit || base.unit;
    clone.cost_per_unit = Math.round((base.cost_per_unit * (1 + variant.priceMod)) * 100) / 100;
    clone.avg_price = clone.cost_per_unit;
    clone.last_purchase_price = clone.cost_per_unit;
  }
  
  return clone;
}

function generateFromList(baseName, baseNameEn, category, categoryEn, unit, basePrice, allergens = "", description = "") {
  // Determină unitățile în funcție de unitatea de bază
  const purchaseUnit = unit;
  const recipeUnit = unit === "kg" ? "g" : unit === "l" ? "ml" : unit;
  const inventoryUnit = unit;
  
  // Calculează factorii de conversie
  const purchaseToInventoryFactor = 1.0;
  const inventoryToRecipeFactor = unit === "kg" ? 1000.0 : unit === "l" ? 1000.0 : 1.0;
  
  // Valori nutriționale aproximative (vor fi completate manual pentru ingrediente reale)
  const nutritionalDefaults = {
    energy_kcal: Math.round(50 + Math.random() * 400),
    fat: Math.round((1 + Math.random() * 30) * 10) / 10,
    saturated_fat: Math.round((0.5 + Math.random() * 10) * 10) / 10,
    carbs: Math.round((0 + Math.random() * 80) * 10) / 10,
    sugars: Math.round((0 + Math.random() * 50) * 10) / 10,
    protein: Math.round((5 + Math.random() * 35) * 10) / 10,
    salt: Math.round((0.01 + Math.random() * 2) * 100) / 100,
    fiber: Math.round((0 + Math.random() * 10) * 10) / 10
  };
  
  // Flags (stocate în notes)
  const flags = [];
  if (category === "Carne" || category === "Peste" || category === "Fructe de Mare" || category === "Lactate") {
    flags.push("perisabil");
  }
  if (category === "Peste" || category === "Fructe de Mare") {
    flags.push("congelat");
  }
  if (Math.random() > 0.7) {
    flags.push("bio");
  }
  
  return {
    name: baseName,
    name_en: baseNameEn,
    official_name: null,
    unit: unit,
    purchase_unit: purchaseUnit,
    recipe_unit: recipeUnit,
    inventory_unit: inventoryUnit,
    purchase_to_inventory_factor: purchaseToInventoryFactor,
    inventory_to_recipe_factor: inventoryToRecipeFactor,
    category: category,
    category_en: categoryEn,
    category_id: null,
    subcategory_id: null,
    current_stock: 0,
    min_stock: Math.floor(Math.random() * 10) + 1,
    max_stock: Math.floor(Math.random() * 50) + 20,
    safety_stock: Math.floor(Math.random() * 5) + 1,
    reorder_quantity: Math.floor(Math.random() * 20) + 10,
    cost_per_unit: basePrice,
    avg_price: basePrice,
    last_purchase_price: basePrice,
    last_purchase_date: null,
    allergens: normalizeAllergens(allergens),
    potential_allergens: normalizeAllergens(""),
    energy_kcal: nutritionalDefaults.energy_kcal,
    fat: nutritionalDefaults.fat,
    saturated_fat: nutritionalDefaults.saturated_fat,
    carbs: nutritionalDefaults.carbs,
    sugars: nutritionalDefaults.sugars,
    protein: nutritionalDefaults.protein,
    salt: nutritionalDefaults.salt,
    fiber: nutritionalDefaults.fiber,
    additives: "",
    description: description || `${baseName} proaspăt`,
    notes: flags.length > 0 ? flags.join(", ") : "",
    storage_temp_min: category === "Carne" || category === "Peste" || category === "Fructe de Mare" || category === "Lactate" ? 2 : null,
    storage_temp_max: category === "Carne" || category === "Peste" || category === "Fructe de Mare" || category === "Lactate" ? 4 : null,
    haccp_notes: null,
    origin_country: "RO",
    traceability_code: "",
    supplier: "",
    default_supplier_id: null,
    location_id: 1,
    is_available: true,  // ✅ REQUIRED
    is_hidden: false     // ✅ REQUIRED
  };
}

// ======================
// GENERARE FINALĂ
// ======================

function generateIngredients() {
  console.log(`▶ Generare ingrediente din ${baseIngredients.length} ingrediente de bază...`);
  
  // Normalizează toate ingredientele de bază (adăugă câmpuri lipsă)
  let final = baseIngredients.map(base => generateIngredientFromBase(base));
  
  // 1. Adaugă variante pentru ingrediente existente
  baseIngredients.forEach(base => {
    if (base.category === "Carne") {
      meatVariants.forEach(variant => {
        final.push(generateIngredientFromBase(base, variant));
      });
    } else if (base.category === "Legume") {
      vegetableVariants.forEach(variant => {
        final.push(generateIngredientFromBase(base, variant));
      });
    } else if (base.category === "Brânzeturi") {
      cheeseVariants.forEach(variant => {
        final.push(generateIngredientFromBase(base, variant));
      });
    }
  });
  
  // 2. Adaugă condimente suplimentare
  extraSpices.forEach(spice => {
    final.push(generateFromList(
      spice,
      spice,
      "Condimente",
      "Spices",
      "kg",
      Math.round((20 + Math.random() * 80) * 100) / 100,
      "",
      `${spice} uscat`
    ));
  });
  
  // 3. Adaugă legume suplimentare
  extraVegetables.forEach(veg => {
    final.push(generateFromList(
      veg,
      veg,
      "Legume",
      "Vegetables",
      Math.random() > 0.5 ? "kg" : "buc",
      Math.round((5 + Math.random() * 25) * 100) / 100,
      "",
      `${veg} proaspăt`
    ));
  });
  
  // 4. Adaugă brânzeturi suplimentare
  extraCheeses.forEach(cheese => {
    final.push(generateFromList(
      cheese,
      cheese,
      "Brânzeturi",
      "Cheese",
      "kg",
      Math.round((30 + Math.random() * 70) * 100) / 100,
      "lapte",
      `${cheese}`
    ));
  });
  
  // 5. Adaugă carne suplimentară
  extraMeats.forEach(meat => {
    final.push(generateFromList(
      meat,
      meat,
      "Carne",
      "Meat",
      Math.random() > 0.3 ? "kg" : "buc",
      Math.round((15 + Math.random() * 100) * 100) / 100,
      "",
      `${meat}`
    ));
  });
  
  // 6. Adaugă peste suplimentar
  extraFish.forEach(fish => {
    final.push(generateFromList(
      fish,
      fish,
      "Peste",
      "Fish",
      "kg",
      Math.round((20 + Math.random() * 80) * 100) / 100,
      "pește",
      `${fish}`
    ));
  });
  
  // 7. Adaugă fructe de mare suplimentare
  extraSeafood.forEach(seafood => {
    final.push(generateFromList(
      seafood,
      seafood,
      "Fructe de Mare",
      "Seafood",
      Math.random() > 0.5 ? "kg" : "buc",
      Math.round((25 + Math.random() * 100) * 100) / 100,
      Math.random() > 0.5 ? "crustacee" : "moluște",
      `${seafood}`
    ));
  });
  
  // Normalizează alergenii pentru toate ingredientele
  final = final.map(ing => {
    if (ing.allergens) {
      ing.allergens = normalizeAllergens(ing.allergens);
    }
    if (ing.potential_allergens) {
      ing.potential_allergens = normalizeAllergens(ing.potential_allergens);
    }
    return ing;
  });
  
  // Elimină duplicate-uri
  const seen = new Set();
  final = final.filter(ing => {
    const key = ing.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  // Completează până la 1500 după eliminarea duplicate-urilor
  const categories = ["Carne", "Peste", "Legume", "Brânzeturi", "Condimente", "Sosuri", "Băuturi", "Lactate", "Cereale"];
  const units = ["kg", "l", "buc", "gr", "ml"];
  const categoryMap = {
    "Carne": "Meat",
    "Peste": "Fish",
    "Legume": "Vegetables",
    "Brânzeturi": "Cheese",
    "Condimente": "Spices",
    "Sosuri": "Sauces",
    "Băuturi": "Beverages",
    "Lactate": "Dairy",
    "Cereale": "Grains"
  };
  
  let counter = final.length + 1;
  while (final.length < TARGET_COUNT) {
    const category = random(categories);
    const categoryEn = categoryMap[category] || category;
    const unit = random(units);
    const name = `Ingredient ${counter++}`;
    
    const key = name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      final.push(generateFromList(
        name,
        name,
        category,
        categoryEn,
        unit,
        Math.round((5 + Math.random() * 50) * 100) / 100,
        "",
        `${category} generic`
      ));
    }
  }
  
  console.log(`✔ Generat ${final.length} ingrediente unice.`);
  return final.slice(0, TARGET_COUNT);
}

// ======================
// EXPORT
// ======================

function saveIngredientsSeed(ingredients) {
  const outputPath = path.join(__dirname, "ingredients_seed.js");
  const content = `// server/seeds/ingredients_seed.js\n// ✅ AUTOGENERAT de ingredients_generator.js\n// ${ingredients.length} ingrediente pentru Restaurant App V3 powered by QrOMS\n\nmodule.exports = ${JSON.stringify(ingredients, null, 2)};`;
  
  fs.writeFileSync(outputPath, content, "utf8");
  console.log(`✔ ingredients_seed.js salvat în ${outputPath}`);
}

// ======================
// MAIN
// ======================

if (require.main === module) {
  const ingredients = generateIngredients();
  saveIngredientsSeed(ingredients);
  console.log(`\n✅ GATA! ${ingredients.length} ingrediente generate și salvate în ingredients_seed.js`);
}

module.exports = { generateIngredients };

