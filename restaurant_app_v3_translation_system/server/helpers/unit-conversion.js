// server/helpers/unit-conversion.js
// Sistem complet conversii unități pentru rețete și ingrediente

const UNIT_CONVERSIONS = {
  // Greutate
  'kg': { base: 'g', factor: 1000, category: 'weight' },
  'g': { base: 'g', factor: 1, category: 'weight' },
  'mg': { base: 'g', factor: 0.001, category: 'weight' },
  'tone': { base: 'g', factor: 1000000, category: 'weight' },
  'lb': { base: 'g', factor: 453.592, category: 'weight' },
  'oz': { base: 'g', factor: 28.3495, category: 'weight' },
  
  // Volum
  'l': { base: 'ml', factor: 1000, category: 'volume' },
  'ml': { base: 'ml', factor: 1, category: 'volume' },
  'cl': { base: 'ml', factor: 10, category: 'volume' },
  'dl': { base: 'ml', factor: 100, category: 'volume' },
  'gal': { base: 'ml', factor: 3785.41, category: 'volume' },
  'floz': { base: 'ml', factor: 29.5735, category: 'volume' },
  
  // Bucăți
  'buc': { base: 'buc', factor: 1, category: 'count' },
  'bucata': { base: 'buc', factor: 1, category: 'count' },
  'pcs': { base: 'buc', factor: 1, category: 'count' },
  'piece': { base: 'buc', factor: 1, category: 'count' },
  
  // Specifice HORECA
  'portie': { base: 'buc', factor: 1, category: 'count' },
  'cana': { base: 'ml', factor: 250, category: 'volume' },
  'lingurita': { base: 'ml', factor: 5, category: 'volume' },
  'lingura': { base: 'ml', factor: 15, category: 'volume' },
  'pahar': { base: 'ml', factor: 200, category: 'volume' },
  'ceasca': { base: 'ml', factor: 200, category: 'volume' },
};

/**
 * Convertește o cantitate dintr-o unitate în alta
 * @param {number} quantity - Cantitatea de convertit
 * @param {string} fromUnit - Unitatea sursă
 * @param {string} toUnit - Unitatea destinație
 * @returns {Object} { success: boolean, value?: number, error?: string, fromUnit, toUnit }
 */
function convertUnit(quantity, fromUnit, toUnit) {
  if (!fromUnit || !toUnit) {
    return { 
      success: false, 
      error: 'Unitățile sunt obligatorii',
      fromUnit, 
      toUnit 
    };
  }

  if (typeof quantity !== 'number' || isNaN(quantity)) {
    return { 
      success: false, 
      error: 'Cantitatea trebuie să fie un număr',
      fromUnit, 
      toUnit 
    };
  }

  const from = UNIT_CONVERSIONS[fromUnit.toLowerCase()];
  const to = UNIT_CONVERSIONS[toUnit.toLowerCase()];
  
  if (!from) {
    return { 
      success: false, 
      error: `Unitate sursă necunoscută: ${fromUnit}`,
      fromUnit, 
      toUnit 
    };
  }

  if (!to) {
    return { 
      success: false, 
      error: `Unitate destinație necunoscută: ${toUnit}`,
      fromUnit, 
      toUnit 
    };
  }
  
  if (from.base !== to.base) {
    return { 
      success: false, 
      error: `Categorii incompatibile: ${from.category} și ${to.category}. Nu se poate converti ${fromUnit} în ${toUnit}`,
      fromUnit, 
      toUnit 
    };
  }
  
  const baseQuantity = quantity * from.factor;
  const converted = baseQuantity / to.factor;
  
  return { 
    success: true, 
    value: converted, 
    fromUnit, 
    toUnit,
    originalQuantity: quantity,
    convertedQuantity: converted
  };
}

/**
 * Obține lista tuturor unităților disponibile
 * @returns {Array} Lista unităților
 */
function getAvailableUnits() {
  return Object.keys(UNIT_CONVERSIONS);
}

/**
 * Obține unitățile dintr-o categorie specifică
 * @param {string} category - Categoria (weight, volume, count)
 * @returns {Array} Lista unităților din categorie
 */
function getUnitsByCategory(category) {
  return Object.keys(UNIT_CONVERSIONS).filter(
    unit => UNIT_CONVERSIONS[unit].category === category
  );
}

/**
 * Verifică dacă două unități sunt compatibile (aceeași categorie)
 * @param {string} unit1 - Prima unitate
 * @param {string} unit2 - A doua unitate
 * @returns {boolean} True dacă sunt compatibile
 */
function areUnitsCompatible(unit1, unit2) {
  const u1 = UNIT_CONVERSIONS[unit1?.toLowerCase()];
  const u2 = UNIT_CONVERSIONS[unit2?.toLowerCase()];
  
  if (!u1 || !u2) return false;
  
  return u1.base === u2.base;
}

module.exports = { 
  convertUnit, 
  UNIT_CONVERSIONS,
  getAvailableUnits,
  getUnitsByCategory,
  areUnitsCompatible
};

