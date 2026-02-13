#!/usr/bin/env node
// Example: Using the Ingredient Normalization Service
const IngredientNormalizationService = require('../services/ingredientNormalization.service');

console.log('📚 Ingredient Normalization Service - Usage Examples\n');
const service = new IngredientNormalizationService();

// Example 1: Normalize ingredient names
console.log('1️⃣  Normalizing ingredient names:');
console.log('  ardei roșu →', service.normalizeIngredientName('ardei roșu'));
console.log('  apa fierbinte →', service.normalizeIngredientName('apa fierbinte'));
console.log('  CEAPĂ VERDE →', service.normalizeIngredientName('CEAPĂ VERDE'));

// Example 2: Check for duplicates
console.log('\n2️⃣  Duplicate detection:');
const ingredients = [
    { id: 1, name: 'Ardei gras' },
    { id: 2, name: 'ardei roșu' },
    { id: 3, name: 'Ceapă' }
];
const { duplicates } = service.findDuplicates(ingredients);
console.log('  Found', duplicates.length, 'duplicates');

console.log('\n✅ Examples complete!');
