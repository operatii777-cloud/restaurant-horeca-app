// server/master-data/allergens_master.js
// ✅ Master Data pentru ALERGENI UE 14 - Restaurant App V3 powered by QrOMS
// Conform Regulament UE 1169/2011 - Lista oficială de 14 alergeni majori
// Folosit în Admin-Vite + Recipes + POS + e-Factura

// Lista oficială UE 14, în format enterprise
const ALLERGENS = [
  {
    code: "GLUTEN",
    en: "gluten",
    ro: "gluten",
    group: "cereale",
    euIndex: 1,
    icon: "🌾",
    description_ro: "Cereale care conțin gluten (grâu, secară, orz, ovăz, mei, speltă)",
    description_en: "Cereals containing gluten (wheat, rye, barley, oats, spelt)"
  },
  {
    code: "CRUSTACEANS",
    en: "crustaceans",
    ro: "crustacee",
    group: "crustacee",
    euIndex: 2,
    icon: "🦞",
    description_ro: "Crustacee și produse derivate",
    description_en: "Crustaceans and products thereof"
  },
  {
    code: "EGGS",
    en: "eggs",
    ro: "ouă",
    group: "ouă",
    euIndex: 3,
    icon: "🥚",
    description_ro: "Ouă și produse din ouă",
    description_en: "Eggs and products thereof"
  },
  {
    code: "FISH",
    en: "fish",
    ro: "pește",
    group: "pește",
    euIndex: 4,
    icon: "🐟",
    description_ro: "Pește și produse din pește",
    description_en: "Fish and products thereof"
  },
  {
    code: "PEANUTS",
    en: "peanuts",
    ro: "arahide",
    group: "alune de pământ",
    euIndex: 5,
    icon: "🥜",
    description_ro: "Arahide și produse derivate",
    description_en: "Peanuts and products thereof"
  },
  {
    code: "SOYBEANS",
    en: "soybeans",
    ro: "soia",
    group: "soia",
    euIndex: 6,
    icon: "🫘",
    description_ro: "Soia și produse din soia",
    description_en: "Soybeans and products thereof"
  },
  {
    code: "MILK",
    en: "milk",
    ro: "lapte",
    group: "lapte",
    euIndex: 7,
    icon: "🥛",
    description_ro: "Lapte și produse lactate (inclusiv lactoză)",
    description_en: "Milk and products thereof (including lactose)"
  },
  {
    code: "NUTS",
    en: "nuts",
    ro: "nuci",
    group: "fructe cu coajă lemnoasă",
    euIndex: 8,
    icon: "🌰",
    description_ro: "Fructe cu coajă lemnoasă (migdale, alune, nuci, caju, etc.)",
    description_en: "Tree nuts (almonds, hazelnuts, walnuts, cashews, etc.)"
  },
  {
    code: "CELERY",
    en: "celery",
    ro: "țelină",
    group: "țelină",
    euIndex: 9,
    icon: "🥬",
    description_ro: "Țelină și produse derivate",
    description_en: "Celery and products thereof"
  },
  {
    code: "MUSTARD",
    en: "mustard",
    ro: "muștar",
    group: "muștar",
    euIndex: 10,
    icon: "🌭",
    description_ro: "Muștar și produse derivate",
    description_en: "Mustard and products thereof"
  },
  {
    code: "SESAME",
    en: "sesame",
    ro: "semințe de susan",
    group: "susan",
    euIndex: 11,
    icon: "🌾",
    description_ro: "Semințe de susan și produse derivate",
    description_en: "Sesame seeds and products thereof"
  },
  {
    code: "SULPHITES",
    en: "sulphites",
    ro: "dioxid de sulf și sulfiți",
    group: "sulfiți",
    euIndex: 12,
    icon: "🍷",
    description_ro: "Dioxid de sulf și sulfiți (>10 mg/kg sau >10 mg/L)",
    description_en: "Sulphur dioxide and sulphites (>10 mg/kg or >10 mg/L)"
  },
  {
    code: "LUPIN",
    en: "lupin",
    ro: "lupin",
    group: "lupin",
    euIndex: 13,
    icon: "🌸",
    description_ro: "Lupin și produse derivate",
    description_en: "Lupin and products thereof"
  },
  {
    code: "MOLLUSCS",
    en: "molluscs",
    ro: "moluște",
    group: "moluște",
    euIndex: 14,
    icon: "🦪",
    description_ro: "Moluște și produse derivate",
    description_en: "Molluscs and products thereof"
  }
];

// Indexuri pentru căutare rapidă
const allergensByCode = new Map();
const allergensByEn = new Map();
const allergensByRo = new Map();

for (const a of ALLERGENS) {
  allergensByCode.set(a.code, a);
  allergensByEn.set(a.en.toLowerCase(), a);
  allergensByRo.set(a.ro.toLowerCase(), a);
}

// ======================
// FUNCȚII NORMALIZARE
// ======================

/**
 * Normalizează un string de alergeni la format UE 14 standard (EN)
 * @param {string} allergenStr - String cu alergeni (RO sau EN, separați prin virgulă)
 * @returns {string} String normalizat în format EN, separați prin virgulă
 */
function normalizeAllergenString(allergenStr) {
  if (!allergenStr) return "";
  
  const parts = allergenStr
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  
  const mapped = parts
    .map((p) => {
      // Acceptăm deja format EN (gluten, milk, eggs, etc.)
      const byEn = allergensByEn.get(p);
      if (byEn) return byEn.en;
      
      // Fallback: poate utilizatorul a trecut RO
      const byRo = allergensByRo.get(p);
      if (byRo) return byRo.en;
      
      // Mapping alternativ pentru variații comune
      const aliases = {
        "lapte": "milk",
        "ouă": "eggs",
        "oua": "eggs",
        "ou": "eggs",
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
        "sulfiti": "sulphites"
      };
      
      if (aliases[p]) return aliases[p];
      
      return null;
    })
    .filter(Boolean);
  
  // Elimină duplicate
  const unique = Array.from(new Set(mapped));
  return unique.join(", ");
}

/**
 * Găsește alergen după cod
 * @param {string} code - Cod alergen (ex: "GLUTEN", "MILK")
 * @returns {Object|null} Alergen sau null
 */
function getAllergenByCode(code) {
  if (!code) return null;
  return allergensByCode.get(code.toUpperCase()) || null;
}

/**
 * Găsește alergen după nume EN
 * @param {string} en - Nume în engleză (ex: "gluten", "milk")
 * @returns {Object|null} Alergen sau null
 */
function getAllergenByEn(en) {
  if (!en) return null;
  return allergensByEn.get(en.toLowerCase()) || null;
}

/**
 * Găsește alergen după nume RO
 * @param {string} ro - Nume în română (ex: "gluten", "lapte")
 * @returns {Object|null} Alergen sau null
 */
function getAllergenByRo(ro) {
  if (!ro) return null;
  return allergensByRo.get(ro.toLowerCase()) || null;
}

/**
 * Verifică dacă un string de alergeni este valid (toți alergenii sunt din lista UE 14)
 * @param {string} allergenStr - String cu alergeni
 * @returns {boolean} True dacă toți alergenii sunt valizi
 */
function validateAllergens(allergenStr) {
  if (!allergenStr) return true; // Empty string este valid
  
  const normalized = normalizeAllergenString(allergenStr);
  const parts = normalized.split(", ").filter(Boolean);
  
  return parts.every(part => allergensByEn.has(part.toLowerCase()));
}

// ======================
// EXPORT
// ======================

module.exports = {
  // Lista completă
  ALLERGENS,
  
  // Funcții query
  getAllergenByCode,
  getAllergenByEn,
  getAllergenByRo,
  normalizeAllergenString,
  validateAllergens,
  
  // Indexuri interne
  allergensByCode,
  allergensByEn,
  allergensByRo
};

