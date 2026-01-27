/**
 * Unit Converter for Recipes
 * Converts various units to grams for nutritional calculations
 */

const UNIT_CONVERSIONS: Record<string, { toGrams: (quantity: number) => number; type: 'weight' | 'volume' | 'count' }> = {
  // Weight
  'kg': { toGrams: (q) => q * 1000, type: 'weight' },
  'g': { toGrams: (q) => q, type: 'weight' },
  'gr': { toGrams: (q) => q, type: 'weight' },
  'mg': { toGrams: (q) => q * 0.001, type: 'weight' },
  'tone': { toGrams: (q) => q * 1000000, type: 'weight' },
  'lb': { toGrams: (q) => q * 453.592, type: 'weight' },
  'oz': { toGrams: (q) => q * 28.3495, type: 'weight' },
  
  // Volume (approximate: 1ml â‰ˆ 1g for water-based ingredients)
  'l': { toGrams: (q) => q * 1000, type: 'volume' },
  'L': { toGrams: (q) => q * 1000, type: 'volume' },
  'ml': { toGrams: (q) => q, type: 'volume' },
  'cl': { toGrams: (q) => q * 10, type: 'volume' },
  'dl': { toGrams: (q) => q * 100, type: 'volume' },
  'gal': { toGrams: (q) => q * 3785.41, type: 'volume' },
  'floz': { toGrams: (q) => q * 29.5735, type: 'volume' },
  
  // HORECA specific
  'cana': { toGrams: (q) => q * 250, type: 'volume' },
  'lingurita': { toGrams: (q) => q * 5, type: 'volume' },
  'lingura': { toGrams: (q) => q * 15, type: 'volume' },
  'pahar': { toGrams: (q) => q * 200, type: 'volume' },
  'ceasca': { toGrams: (q) => q * 200, type: 'volume' },
  
  // Count (approximations)
  'buc': { toGrams: (q) => q * 60, type: 'count' }, // Average piece â‰ˆ 60g
  'bucata': { toGrams: (q) => q * 60, type: 'count' },
  'pcs': { toGrams: (q) => q * 60, type: 'count' },
  'piece': { toGrams: (q) => q * 60, type: 'count' },
  'portie': { toGrams: (q) => q * 60, type: 'count' },
  'plic': { toGrams: (q) => q * 10, type: 'count' },
  'cutie': { toGrams: (q) => q * 500, type: 'count' },
};

/**
 * Convert quantity from given unit to grams
 * @param quantity - Quantity to convert
 * @param unit - Source unit
 * @returns Quantity in grams, or original quantity if unit not found
 */
export function convertToGrams(quantity: number, unit: string): number {
  const unitLower = unit.toLowerCase().trim();
  const conversion = UNIT_CONVERSIONS[unitLower];
  
  if (conversion) {
    return conversion.toGrams(quantity);
  }
  
  // Default: assume already in grams
  console.warn(`Unit ""Unit"" not found in conversion table, assuming grams`);
  return quantity;
}

/**
 * Get unit type (weight, volume, count)
 */
export function getUnitType(unit: string): 'weight' | 'volume' | 'count' | 'unknown' {
  const unitLower = unit.toLowerCase().trim();
  const conversion = UNIT_CONVERSIONS[unitLower];
  return conversion?.type || 'unknown';
}

/**
 * Check if unit can be converted to grams
 */
export function canConvertToGrams(unit: string): boolean {
  const unitLower = unit.toLowerCase().trim();
  return unitLower in UNIT_CONVERSIONS;
}




