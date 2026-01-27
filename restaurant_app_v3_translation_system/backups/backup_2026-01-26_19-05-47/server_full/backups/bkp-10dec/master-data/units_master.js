// server/master-data/units_master.js
// ✅ Master Data pentru UNITĂȚI DE MĂSURĂ - Restaurant App V3 powered by QrOMS
// Standard unic pentru toate modulele (Stock, Recipes, NIR, POS)

// Tipuri de unități și conversie la baza lor
// base: G pentru masă, ML pentru volum, BUC pentru număr
const UNITS = [
  { 
    code: "KG",  
    ro: "kg",  
    en: "kg",  
    type: "mass",   
    base: "G",  
    factorToBase: 1000, 
    decimals: 3,
    description_ro: "Kilogram",
    description_en: "Kilogram"
  },
  { 
    code: "G",   
    ro: "g",   
    en: "g",   
    type: "mass",   
    base: "G",  
    factorToBase: 1,    
    decimals: 1,
    description_ro: "Gram",
    description_en: "Gram"
  },
  { 
    code: "MG",  
    ro: "mg",  
    en: "mg",  
    type: "mass",   
    base: "G",  
    factorToBase: 0.001, 
    decimals: 3,
    description_ro: "Miligram",
    description_en: "Milligram"
  },
  { 
    code: "L",   
    ro: "L",   
    en: "L",   
    type: "volume", 
    base: "ML", 
    factorToBase: 1000, 
    decimals: 3,
    description_ro: "Litru",
    description_en: "Liter"
  },
  { 
    code: "ML",  
    ro: "ml",  
    en: "ml",  
    type: "volume", 
    base: "ML", 
    factorToBase: 1,    
    decimals: 1,
    description_ro: "Mililitru",
    description_en: "Milliliter"
  },
  { 
    code: "BUC", 
    ro: "buc", 
    en: "pcs", 
    type: "count",  
    base: "BUC", 
    factorToBase: 1,   
    decimals: 0,
    description_ro: "Bucată",
    description_en: "Piece"
  },
  { 
    code: "BOX", 
    ro: "bax", 
    en: "box", 
    type: "count",  
    base: "BUC", 
    factorToBase: 10,  
    decimals: 0,
    description_ro: "Bax",
    description_en: "Box"
  },
  { 
    code: "GR",  
    ro: "gr",  
    en: "g",   
    type: "mass",   
    base: "G",  
    factorToBase: 1,    
    decimals: 1,
    description_ro: "Gram (alias)",
    description_en: "Gram (alias)"
  }
];

// Indexuri pentru căutare rapidă
const unitsByCode = new Map();
const unitsByLabel = new Map();

for (const u of UNITS) {
  unitsByCode.set(u.code, u);
  unitsByLabel.set(u.ro.toLowerCase(), u);
  unitsByLabel.set(u.en.toLowerCase(), u);
}

// ======================
// FUNCȚII QUERY
// ======================

/**
 * Găsește unitate după cod sau label
 * @param {string} codeOrLabel - Cod (ex: "KG") sau label (ex: "kg", "g")
 * @returns {Object|null} Unitate sau null
 */
function getUnit(codeOrLabel) {
  if (!codeOrLabel) return null;
  
  const key = String(codeOrLabel).toUpperCase();
  if (unitsByCode.has(key)) {
    return unitsByCode.get(key);
  }
  
  const lower = String(codeOrLabel).toLowerCase();
  return unitsByLabel.get(lower) || null;
}

/**
 * Convertește o valoare la unitatea de bază
 * @param {number} value - Valoare de convertit
 * @param {string} unitCode - Cod unitate (ex: "KG", "L")
 * @returns {number|null} Valoare în unitatea de bază sau null
 */
function convertToBase(value, unitCode) {
  const u = getUnit(unitCode);
  if (!u) return null;
  return value * u.factorToBase;
}

/**
 * Convertește o valoare dintr-o unitate în alta
 * @param {number} value - Valoare de convertit
 * @param {string} fromUnit - Unitate sursă (ex: "KG")
 * @param {string} toUnit - Unitate destinație (ex: "G")
 * @returns {number|null} Valoare convertită sau null
 */
function convert(value, fromUnit, toUnit) {
  const from = getUnit(fromUnit);
  const to = getUnit(toUnit);
  
  if (!from || !to) return null;
  
  // Trebuie să fie același tip (masă, volum, număr)
  if (from.type !== to.type) return null;
  
  // Convertește la bază, apoi la unitatea destinație
  const baseValue = convertToBase(value, fromUnit);
  if (baseValue === null) return null;
  
  return baseValue / to.factorToBase;
}

/**
 * Verifică dacă două unități sunt compatibile (același tip)
 * @param {string} unit1 - Prima unitate
 * @param {string} unit2 - A doua unitate
 * @returns {boolean} True dacă sunt compatibile
 */
function areCompatible(unit1, unit2) {
  const u1 = getUnit(unit1);
  const u2 = getUnit(unit2);
  
  if (!u1 || !u2) return false;
  return u1.type === u2.type;
}

/**
 * Obține toate unitățile de un anumit tip
 * @param {string} type - Tip ("mass", "volume", "count")
 * @returns {Array} Lista de unități
 */
function getUnitsByType(type) {
  return UNITS.filter(u => u.type === type);
}

/**
 * Formatează o valoare cu unitatea corespunzătoare
 * @param {number} value - Valoare
 * @param {string} unitCode - Cod unitate
 * @returns {string} String formatat (ex: "1.5 kg")
 */
function format(value, unitCode) {
  const u = getUnit(unitCode);
  if (!u) return `${value}`;
  
  const formatted = value.toFixed(u.decimals);
  return `${formatted} ${u.ro}`;
}

// ======================
// EXPORT
// ======================

module.exports = {
  // Lista completă
  UNITS,
  
  // Funcții query
  getUnit,
  convertToBase,
  convert,
  areCompatible,
  getUnitsByType,
  format,
  
  // Indexuri interne
  unitsByCode,
  unitsByLabel
};

