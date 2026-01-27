/**
 * PHASE S9.2 - Unit Converter (Wrapper)
 * 
 * Wrapper over existing unit-conversion.js helper.
 * Provides consistent interface for stock module.
 */

const { convertUnit: convertUnitHelper } = require('../../../helpers/unit-conversion');

/**
 * Convert unit (wrapper over existing helper)
 * 
 * @param {number} quantity - Quantity to convert
 * @param {string} fromUnit - Source unit
 * @param {string} toUnit - Target unit
 * @returns {number} Converted quantity (or original if conversion fails)
 */
function convertUnit(quantity, fromUnit, toUnit) {
  if (!fromUnit || !toUnit || fromUnit === toUnit) {
    return quantity;
  }
  
  const result = convertUnitHelper(quantity, fromUnit, toUnit);
  
  if (result.success) {
    return result.value;
  } else {
    console.warn(`[UnitConverter] Conversion failed: ${result.error}. Using original quantity.`);
    return quantity; // Fallback to original
  }
}

module.exports = {
  convertUnit,
};

