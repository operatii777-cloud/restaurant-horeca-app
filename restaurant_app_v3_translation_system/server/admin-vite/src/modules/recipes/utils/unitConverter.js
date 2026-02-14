"use strict";
/**
 * Unit Converter for Recipes
 * Converts various units to grams for nutritional calculations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToGrams = convertToGrams;
exports.getUnitType = getUnitType;
exports.canConvertToGrams = canConvertToGrams;
var UNIT_CONVERSIONS = {
    // Weight
    'kg': { toGrams: function (q) { return q * 1000; }, type: 'weight' },
    'g': { toGrams: function (q) { return q; }, type: 'weight' },
    'gr': { toGrams: function (q) { return q; }, type: 'weight' },
    'mg': { toGrams: function (q) { return q * 0.001; }, type: 'weight' },
    'tone': { toGrams: function (q) { return q * 1000000; }, type: 'weight' },
    'lb': { toGrams: function (q) { return q * 453.592; }, type: 'weight' },
    'oz': { toGrams: function (q) { return q * 28.3495; }, type: 'weight' },
    // Volume (approximate: 1ml â‰ˆ 1g for water-based ingredients)
    'l': { toGrams: function (q) { return q * 1000; }, type: 'volume' },
    'L': { toGrams: function (q) { return q * 1000; }, type: 'volume' },
    'ml': { toGrams: function (q) { return q; }, type: 'volume' },
    'cl': { toGrams: function (q) { return q * 10; }, type: 'volume' },
    'dl': { toGrams: function (q) { return q * 100; }, type: 'volume' },
    'gal': { toGrams: function (q) { return q * 3785.41; }, type: 'volume' },
    'floz': { toGrams: function (q) { return q * 29.5735; }, type: 'volume' },
    // HORECA specific
    'cana': { toGrams: function (q) { return q * 250; }, type: 'volume' },
    'lingurita': { toGrams: function (q) { return q * 5; }, type: 'volume' },
    'lingura': { toGrams: function (q) { return q * 15; }, type: 'volume' },
    'pahar': { toGrams: function (q) { return q * 200; }, type: 'volume' },
    'ceasca': { toGrams: function (q) { return q * 200; }, type: 'volume' },
    // Count (approximations)
    'buc': { toGrams: function (q) { return q * 60; }, type: 'count' }, // Average piece â‰ˆ 60g
    'bucata': { toGrams: function (q) { return q * 60; }, type: 'count' },
    'pcs': { toGrams: function (q) { return q * 60; }, type: 'count' },
    'piece': { toGrams: function (q) { return q * 60; }, type: 'count' },
    'portie': { toGrams: function (q) { return q * 60; }, type: 'count' },
    'plic': { toGrams: function (q) { return q * 10; }, type: 'count' },
    'cutie': { toGrams: function (q) { return q * 500; }, type: 'count' },
};
/**
 * Convert quantity from given unit to grams
 * @param quantity - Quantity to convert
 * @param unit - Source unit
 * @returns Quantity in grams, or original quantity if unit not found
 */
function convertToGrams(quantity, unit) {
    var unitLower = unit.toLowerCase().trim();
    var conversion = UNIT_CONVERSIONS[unitLower];
    if (conversion) {
        return conversion.toGrams(quantity);
    }
    // Default: assume already in grams
    console.warn("Unit \"\"Unit\"\" not found in conversion table, assuming grams");
    return quantity;
}
/**
 * Get unit type (weight, volume, count)
 */
function getUnitType(unit) {
    var unitLower = unit.toLowerCase().trim();
    var conversion = UNIT_CONVERSIONS[unitLower];
    return (conversion === null || conversion === void 0 ? void 0 : conversion.type) || 'unknown';
}
/**
 * Check if unit can be converted to grams
 */
function canConvertToGrams(unit) {
    var unitLower = unit.toLowerCase().trim();
    return unitLower in UNIT_CONVERSIONS;
}
