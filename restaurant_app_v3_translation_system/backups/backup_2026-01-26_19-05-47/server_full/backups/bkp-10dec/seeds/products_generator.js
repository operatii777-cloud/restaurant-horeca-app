// server/seeds/products_generator.js
// ✅ Generator ML pentru 1500 produse - Restaurant App V3 powered by QrOMS
// Generează variații coerente, realiste, compatibile cu schema menu

const fs = require("fs");
const path = require("path");
const baseProducts = require("./products_base_list");

const TARGET_COUNT = 1500;

// ======================
// NORMALIZARE ALERGENI (UE 14)
// ======================

// Mapping alergeni RO -> EN (UE 14 standard)
const ALLERGEN_MAP = {
  "lapte": "milk",
  "ouă": "eggs",
  "oua": "eggs",
  "ou": "eggs",
  "gluten": "gluten",
  "pește": "fish",
  "peste": "fish",
  "crustacee": "crustaceans",
  "moluște": "molluscs",
  "soia": "soybeans",
  "nuci": "nuts",
  "alune": "peanuts",
  "arahide": "peanuts",
  "țelină": "celery",
  "telina": "celery",
  "muștar": "mustard",
  "mustar": "mustard",
  "semințe susan": "sesame",
  "susan": "sesame",
  "semințe": "sesame",
  "sulfiți": "sulphites",
  "sulfiti": "sulphites",
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
// VARIATOARE INTELIGENTE
// ======================

// Variante de dimensiuni (coerente cu weight)
const sizeVariants = {
  small: { suffix: " - Porție Mică", weightMod: 0.75, priceMod: -0.15, caloriesMod: 0.75 },
  large: { suffix: " - Porție Mare", weightMod: 1.25, priceMod: 0.20, caloriesMod: 1.25 },
  xl: { suffix: " - XL", weightMod: 1.5, priceMod: 0.35, caloriesMod: 1.5 },
  family: { suffix: " - Family", weightMod: 2.0, priceMod: 0.60, caloriesMod: 2.0 }
};

// Variante premium/gourmet
const premiumVariants = {
  premium: { suffix: " Premium", priceMod: 0.25, descriptionAdd: "ingrediente premium" },
  gourmet: { suffix: " Gourmet", priceMod: 0.30, descriptionAdd: "preparat gourmet" },
  chef: { suffix: " Chef Edition", priceMod: 0.35, descriptionAdd: "rețetă chef" },
  signature: { suffix: " Signature", priceMod: 0.20, descriptionAdd: "specialitate casei" }
};

// Topping-uri extra pentru Pizza
const pizzaToppings = [
  { name: "cu Extra Mozzarella", priceMod: 0.08, allergens: "lapte" },
  { name: "cu Prosciutto", priceMod: 0.12, allergens: "" },
  { name: "cu Rucola", priceMod: 0.05, allergens: "" },
  { name: "cu Anghinare", priceMod: 0.10, allergens: "" },
  { name: "cu Măsline Kalamata", priceMod: 0.08, allergens: "" },
  { name: "cu Ciuperci Porcini", priceMod: 0.15, allergens: "" }
];

// Sosuri extra pentru Paste
const pastaSauces = [
  { name: "cu Sos Pesto", priceMod: 0.10, allergens: "lapte, nuci" },
  { name: "cu Sos Alfredo", priceMod: 0.12, allergens: "lapte" },
  { name: "cu Sos Arrabbiata", priceMod: 0.08, allergens: "", spicy: true },
  { name: "cu Sos Putanesca", priceMod: 0.10, allergens: "pește" },
  { name: "cu Sos Carbonara", priceMod: 0.15, allergens: "ouă, lapte" }
];

// Variante pentru Burgers
const burgerVariants = [
  { name: "cu Bacon", priceMod: 0.10, allergens: "" },
  { name: "cu Cheddar Extra", priceMod: 0.08, allergens: "lapte" },
  { name: "cu Ou", priceMod: 0.06, allergens: "ouă" },
  { name: "cu Jalapeño", priceMod: 0.05, allergens: "", spicy: true },
  { name: "cu Avocado", priceMod: 0.12, allergens: "" }
];

// Variante pentru Seafood
const seafoodVariants = [
  { name: "cu Sos de Lămâie", priceMod: 0.05, allergens: "" },
  { name: "cu Sos Aioli", priceMod: 0.08, allergens: "ouă" },
  { name: "cu Sos Tartar", priceMod: 0.10, allergens: "ouă, pește" },
  { name: "cu Vin Alb", priceMod: 0.12, allergens: "sulfiți" }
];

// Variante pentru Deserturi
const dessertVariants = [
  { name: "cu Înghețată", priceMod: 0.15, allergens: "lapte" },
  { name: "cu Fructe de Pădure", priceMod: 0.12, allergens: "" },
  { name: "cu Caramel", priceMod: 0.10, allergens: "lapte" },
  { name: "cu Nuci", priceMod: 0.12, allergens: "nuci" }
];

// Variante pentru Băuturi
const drinkVariants = [
  { name: "Decofeinizată", priceMod: 0, allergens: "" },
  { name: "cu Lapte de Soia", priceMod: 0.05, allergens: "soia" },
  { name: "cu Lapte de Migdale", priceMod: 0.08, allergens: "nuci" },
  { name: "cu Sirop", priceMod: 0.10, allergens: "" }
];

// ======================
// FUNCȚII HELPER
// ======================

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min, max) {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

function parseWeight(weightStr) {
  // "400G" -> 400, "200/150G" -> 200
  const match = weightStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : 300;
}

function formatWeight(baseWeight, modifier) {
  const base = parseWeight(baseWeight);
  const newWeight = Math.round(base * modifier);
  return `${newWeight}G`;
}

function addAllergens(existing, newAllergens) {
  // Normalizează alergenii înainte de combinare
  const normalizedExisting = normalizeAllergens(existing || "");
  const normalizedNew = normalizeAllergens(newAllergens || "");
  
  if (!normalizedExisting) return normalizedNew || "";
  if (!normalizedNew) return normalizedExisting;
  
  const existingList = normalizedExisting.split(", ").filter(a => a);
  const newList = normalizedNew.split(", ").filter(a => a);
  const combined = [...new Set([...existingList, ...newList])];
  return combined.join(", ");
}

// ======================
// GENERARE VARIAȚII PE CATEGORIE
// ======================

function generatePizzaVariants(base) {
  const variants = [];
  
  // Variante dimensiuni
  variants.push(createSizeVariant(base, sizeVariants.large));
  variants.push(createSizeVariant(base, sizeVariants.xl));
  
  // Variante premium
  variants.push(createPremiumVariant(base, premiumVariants.premium));
  variants.push(createPremiumVariant(base, premiumVariants.gourmet));
  
  // Variante cu topping-uri
  pizzaToppings.slice(0, 3).forEach(topping => {
    variants.push(createToppingVariant(base, topping, "Pizza"));
  });
  
  return variants;
}

function generateBurgerVariants(base) {
  const variants = [];
  
  variants.push(createSizeVariant(base, sizeVariants.large));
  variants.push(createPremiumVariant(base, premiumVariants.signature));
  
  burgerVariants.slice(0, 3).forEach(variant => {
    variants.push(createToppingVariant(base, variant, "Burger"));
  });
  
  return variants;
}

function generatePastaVariants(base) {
  const variants = [];
  
  variants.push(createSizeVariant(base, sizeVariants.large));
  
  pastaSauces.slice(0, 2).forEach(sauce => {
    variants.push(createSauceVariant(base, sauce));
  });
  
  return variants;
}

function generateSeafoodVariants(base) {
  const variants = [];
  
  variants.push(createSizeVariant(base, sizeVariants.large));
  variants.push(createPremiumVariant(base, premiumVariants.gourmet));
  
  seafoodVariants.slice(0, 2).forEach(variant => {
    variants.push(createToppingVariant(base, variant, "Seafood"));
  });
  
  return variants;
}

function generateDessertVariants(base) {
  const variants = [];
  
  dessertVariants.slice(0, 2).forEach(variant => {
    variants.push(createToppingVariant(base, variant, "Dessert"));
  });
  
  return variants;
}

function generateDrinkVariants(base) {
  const variants = [];
  
  drinkVariants.slice(0, 2).forEach(variant => {
    variants.push(createToppingVariant(base, variant, "Drink"));
  });
  
  return variants;
}

// ======================
// FUNCȚII CREARE VARIAȚII
// ======================

function createSizeVariant(base, sizeVariant) {
  const clone = JSON.parse(JSON.stringify(base));
  clone.name = `${base.name}${sizeVariant.suffix}`;
  
  // Traducere sufixe pentru EN
  let suffixEn = "";
  if (sizeVariant.suffix === " - Porție Mică") suffixEn = " - Small Portion";
  else if (sizeVariant.suffix === " - Porție Mare") suffixEn = " - Large Portion";
  else if (sizeVariant.suffix === " - XL") suffixEn = " - XL";
  else if (sizeVariant.suffix === " - Family") suffixEn = " - Family";
  else suffixEn = sizeVariant.suffix;
  
  clone.name_en = `${base.name_en}${suffixEn}`;
  clone.price = Math.round((base.price * (1 + sizeVariant.priceMod)) * 100) / 100;
  clone.weight = formatWeight(base.weight, sizeVariant.weightMod);
  clone.calories = Math.round(base.calories * sizeVariant.caloriesMod);
  clone.protein = Math.round(base.protein * sizeVariant.caloriesMod);
  clone.carbs = Math.round(base.carbs * sizeVariant.caloriesMod);
  clone.fat = Math.round(base.fat * sizeVariant.caloriesMod);
  
  // Fix image URL
  const imageSuffix = sizeVariant.suffix.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
  clone.image_url = base.image_url.replace(".jpg", `-${imageSuffix}.jpg`);
  
  return clone;
}

function createPremiumVariant(base, premiumVariant) {
  const clone = JSON.parse(JSON.stringify(base));
  clone.name = `${base.name}${premiumVariant.suffix}`;
  clone.name_en = `${base.name_en}${premiumVariant.suffix}`;
  clone.price = Math.round((base.price * (1 + premiumVariant.priceMod)) * 100) / 100;
  clone.description = `${base.description}, ${premiumVariant.descriptionAdd}`;
  clone.description_en = `${base.description_en}, ${premiumVariant.descriptionAdd}`;
  
  // Fix image URL
  const imageSuffix = premiumVariant.suffix.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
  clone.image_url = base.image_url.replace(".jpg", `-${imageSuffix}.jpg`);
  
  return clone;
}

function createToppingVariant(base, topping, category) {
  const clone = JSON.parse(JSON.stringify(base));
  clone.name = `${base.name} ${topping.name}`;
  clone.name_en = `${base.name_en} ${topping.name}`;
  clone.price = Math.round((base.price * (1 + topping.priceMod)) * 100) / 100;
  clone.description = `${base.description}, ${topping.name.toLowerCase()}`;
  clone.description_en = `${base.description_en}, ${topping.name.toLowerCase()}`;
  clone.allergens = addAllergens(base.allergens, topping.allergens);
  clone.allergens_en = addAllergens(base.allergens_en, topping.allergens);
  if (topping.spicy) {
    clone.is_spicy = true;
    clone.spice_level = Math.min((clone.spice_level || 0) + 1, 5);
  }
  const imageSuffix = topping.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
  clone.image_url = base.image_url.replace(".jpg", `-${imageSuffix}.jpg`);
  return clone;
}

function createSauceVariant(base, sauce) {
  const clone = JSON.parse(JSON.stringify(base));
  clone.name = `${base.name} ${sauce.name}`;
  clone.name_en = `${base.name_en} ${sauce.name}`;
  clone.price = Math.round((base.price * (1 + sauce.priceMod)) * 100) / 100;
  clone.description = `${base.description}, ${sauce.name.toLowerCase()}`;
  clone.description_en = `${base.description_en}, ${sauce.name.toLowerCase()}`;
  clone.allergens = addAllergens(base.allergens, sauce.allergens);
  clone.allergens_en = addAllergens(base.allergens_en, sauce.allergens);
  if (sauce.spicy) {
    clone.is_spicy = true;
    clone.spice_level = Math.min((clone.spice_level || 0) + 1, 5);
  }
  const imageSuffix = sauce.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
  clone.image_url = base.image_url.replace(".jpg", `-${imageSuffix}.jpg`);
  return clone;
}

// ======================
// GENERARE FINALĂ
// ======================

function generateProducts() {
  console.log(`▶ Generare produse din ${baseProducts.length} produse de bază...`);
  
  // Normalizează alergenii pentru toate produsele de bază
  let final = baseProducts.map(prod => {
    const normalized = JSON.parse(JSON.stringify(prod));
    if (normalized.allergens) {
      normalized.allergens = normalizeAllergens(normalized.allergens);
    }
    if (normalized.allergens_en) {
      normalized.allergens_en = normalizeAllergens(normalized.allergens_en);
    }
    return normalized;
  });
  
  let iteration = 0;
  const maxIterations = 500; // Redus pentru performanță
  
  while (final.length < TARGET_COUNT && iteration < maxIterations) {
    const base = random(baseProducts);
    let variants = [];
    
    // Generează variații pe categorii
    switch (base.category) {
      case "Pizza":
        variants = generatePizzaVariants(base);
        break;
      case "Burgers":
        variants = generateBurgerVariants(base);
        break;
      case "Paste Fresca":
      case "Penne Al Forno":
        variants = generatePastaVariants(base);
        break;
      case "Peste Fructe de Mare":
        variants = generateSeafoodVariants(base);
        break;
      case "Deserturi":
        variants = generateDessertVariants(base);
        break;
      case "Cafea":
      case "Băuturi răcoritoare":
        variants = generateDrinkVariants(base);
        break;
      default:
        // Variante generice pentru alte categorii
        variants.push(createSizeVariant(base, sizeVariants.large));
        variants.push(createPremiumVariant(base, premiumVariants.premium));
    }
    
    // Adaugă variațiile la listă
    variants.forEach(variant => {
      if (final.length < TARGET_COUNT) {
        final.push(variant);
      }
    });
    
    iteration++;
    
    // Log progres periodic
    if (iteration % 50 === 0) {
      console.log(`  Progres: ${final.length}/${TARGET_COUNT} produse...`);
    }
  }
  
  console.log(`  Eliminare duplicate-uri din ${final.length} produse...`);
  
  // Elimină duplicate-uri bazate pe name
  const seen = new Set();
  final = final.filter(p => {
    const key = p.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  console.log(`  După eliminare duplicate-uri: ${final.length} produse unice`);
  
  // Completează până la 1500 cu variații simple
  let fillIterations = 0;
  const maxFillIterations = 5000; // Protecție împotriva loop infinit
  
  while (final.length < TARGET_COUNT && fillIterations < maxFillIterations) {
    const base = random(baseProducts);
    const variantType = random(["size", "premium"]);
    let newProduct;
    
    if (variantType === "size") {
      const sizeVariant = random([sizeVariants.large, sizeVariants.xl]);
      newProduct = createSizeVariant(base, sizeVariant);
    } else {
      const premiumVariant = random([premiumVariants.premium, premiumVariants.gourmet]);
      newProduct = createPremiumVariant(base, premiumVariant);
    }
    
    const key = newProduct.name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      final.push(newProduct);
    }
    fillIterations++;
  }
  
  if (fillIterations >= maxFillIterations) {
    console.log(`⚠ Avertisment: S-a atins limita de iterații. Generat ${final.length} produse în loc de ${TARGET_COUNT}`);
  }
  
  console.log(`✔ Generat ${final.length} produse unice.`);
  
  // Normalizează alergenii pentru toate produsele generate (ultima verificare)
  final = final.map(prod => {
    if (prod.allergens) {
      prod.allergens = normalizeAllergens(prod.allergens);
    }
    if (prod.allergens_en) {
      prod.allergens_en = normalizeAllergens(prod.allergens_en);
    }
    return prod;
  });
  
  return final.slice(0, TARGET_COUNT);
}

// ======================
// EXPORT
// ======================

function saveProductsSeed(products) {
  const outputPath = path.join(__dirname, "products_seed.js");
  const content = `// server/seeds/products_seed.js\n// ✅ AUTOGENERAT de products_generator.js\n// ${products.length} produse pentru Restaurant App V3 powered by QrOMS\n\nmodule.exports = ${JSON.stringify(products, null, 2)};`;
  
  fs.writeFileSync(outputPath, content, "utf8");
  console.log(`✔ products_seed.js salvat în ${outputPath}`);
}

// ======================
// MAIN
// ======================

if (require.main === module) {
  const products = generateProducts();
  saveProductsSeed(products);
  console.log(`\n✅ GATA! ${products.length} produse generate și salvate în products_seed.js`);
}

module.exports = { generateProducts };

