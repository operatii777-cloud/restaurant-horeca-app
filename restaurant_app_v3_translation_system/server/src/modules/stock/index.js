/**
 * PHASE S9.2 - Stock Module
 * 
 * Stock management module with:
 * - Recipe Expander for recursive recipes
 * - Unit Converter wrapper
 */

const { expandRecipeToIngredients, expandRecipeToIngredientsWithUnitConversion, aggregateIngredients } = require('./recipe.expander');
const { convertUnit } = require('./unit.converter');

module.exports = {
  // Recipe Expander
  expandRecipeToIngredients,
  expandRecipeToIngredientsWithUnitConversion,
  aggregateIngredients,
  
  // Unit Converter
  convertUnit,
};

