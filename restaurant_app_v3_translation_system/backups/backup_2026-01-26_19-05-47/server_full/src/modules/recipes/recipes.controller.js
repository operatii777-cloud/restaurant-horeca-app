/**
 * PHASE PRODUCTION-READY - Recipes Controller
 * 
 * Controller pentru gestionarea rețetelor cu validări și calcul costuri
 */

const { dbPromise } = require('../../../database');
const { validateRecipe } = require('../../utils/validators');
const { AppError, createNotFoundError, createBusinessRuleError } = require('../../utils/error-handler');
const { calculateRecipeCost, updateRecipeCost, recalculateAllRecipeCosts, getProfitMargin } = require('./recipe-cost.service');
const { asyncHandler } = require('../../utils/error-handler');
const { logger } = require('../../utils/logger');
const recipeLogger = logger.child('RECIPES');

/**
 * GET /api/recipes/:productId/cost
 * Calculate recipe cost for a product
 */
async function getRecipeCost(req, res, next) {
  try {
    const { productId } = req.params;
    const productIdNum = parseInt(productId, 10);

    if (!productIdNum || isNaN(productIdNum)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid product ID',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    const costData = await calculateRecipeCost(productIdNum);
    const margin = await getProfitMargin(productIdNum);

    res.json({
      success: true,
      data: {
        product_id: productIdNum,
        cost: costData.totalCost,
        margin: margin.margin,
        marginPercent: margin.marginPercent,
        profit: margin.profit,
        ingredientCosts: costData.ingredientCosts,
        hasMissingCosts: costData.hasMissingCosts
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/recipes/:productId/recalculate-cost
 * Recalculate and update recipe cost
 */
async function recalculateCost(req, res, next) {
  try {
    const { productId } = req.params;
    const productIdNum = parseInt(productId, 10);

    if (!productIdNum || isNaN(productIdNum)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid product ID',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    const cost = await updateRecipeCost(productIdNum);
    const margin = await getProfitMargin(productIdNum);

    res.json({
      success: true,
      message: 'Recipe cost recalculated successfully',
      data: {
        product_id: productIdNum,
        cost,
        margin: margin.margin,
        marginPercent: margin.marginPercent
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/recipes/recalculate-all-costs
 * Recalculate costs for all products with recipes
 */
async function recalculateAllCosts(req, res, next) {
  try {
    const results = await recalculateAllRecipeCosts();

    res.json({
      success: true,
      message: 'Recipe costs recalculation completed',
      data: results
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/recipes
 * Get all products with recipes for scaling
 */
async function getAllRecipesForScaling(req, res, next) {
  try {
    const db = await dbPromise;

    // Get products with recipes and base portions
    const recipes = await new Promise((resolve, reject) => {
      db.all(`
        SELECT DISTINCT
          m.id,
          m.name,
          COALESCE(m.servings, 1) as base_portions,
          COALESCE(m.cost_price, 0) as cost_per_portion
        FROM menu m
        INNER JOIN recipes r ON m.id = r.product_id
        WHERE m.is_sellable = 1 AND (m.has_recipe = 1 OR EXISTS (SELECT 1 FROM recipes WHERE product_id = m.id))
        ORDER BY m.name
      `, [], (err, rows) => {
        if (err) {
          recipeLogger.error('Error fetching recipes for scaling', { error: err.message });
          reject(err);
        } else {
          const result = Array.isArray(rows) ? JSON.parse(JSON.stringify(rows)) : [];
          recipeLogger.info(`Fetched ${result.length} recipes for scaling`);
          resolve(result);
        }
      });
    });

    res.json({
      success: true,
      data: recipes
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/recipes/:productId/scale
 * Scale recipe to target portions
 */
async function scaleRecipe(req, res, next) {
  try {
    const { productId } = req.params;
    const { targetPortions } = req.body;
    const productIdNum = parseInt(productId, 10);

    if (!productIdNum || isNaN(productIdNum)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid product ID',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    if (!targetPortions || targetPortions < 1) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Target portions must be at least 1',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    const db = await dbPromise;

    // Get product and base portions
    const product = await new Promise((resolve, reject) => {
      db.get(`
        SELECT id, name, COALESCE(servings, 1) as base_portions
        FROM menu
        WHERE id = ? AND has_recipe = 1
      `, [productIdNum], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!product) {
      throw createNotFoundError('Product with recipe', productIdNum);
    }

    const basePortions = product.base_portions || 1;
    const scaleFactor = targetPortions / basePortions;

    // Get recipe ingredients
    const ingredients = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          r.id,
          r.ingredient_id,
          r.quantity_needed,
          r.unit,
          COALESCE(r.waste_percentage, 0) as waste_percentage,
          i.name as ingredient_name,
          i.cost_per_unit
        FROM recipes r
        JOIN ingredients i ON r.ingredient_id = i.id
        WHERE r.product_id = ? AND i.is_available = 1
        ORDER BY i.name
      `, [productIdNum], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    if (ingredients.length === 0) {
      throw createBusinessRuleError('No ingredients found for this recipe');
    }

    // Calculate scaled ingredients
    const scaledIngredients = ingredients.map(ing => {
      const quantityGross = ing.quantity_needed * scaleFactor;
      const wasteFactor = 1 + (ing.waste_percentage / 100);
      const quantityNet = quantityGross * wasteFactor;

      return {
        ingredient_name: ing.ingredient_name,
        quantity_gross_scaled: quantityGross,
        quantity_net_scaled: quantityNet,
        unit: ing.unit,
        cost_per_unit: ing.cost_per_unit,
        total_cost: quantityNet * (ing.cost_per_unit || 0)
      };
    });

    // Calculate total cost
    const totalCost = scaledIngredients.reduce((sum, ing) => sum + ing.total_cost, 0);

    res.json({
      success: true,
      data: {
        id: productIdNum,
        name: product.name,
        target_portions: targetPortions,
        scale_factor: scaleFactor,
        total_cost: parseFloat(totalCost.toFixed(2)),
        ingredients: scaledIngredients
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/recipes
 * Create recipe with validation
 */
async function createRecipe(req, res, next) {
  try {
    const recipeData = req.body;

    // Validate recipe
    const validation = validateRecipe(recipeData);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: validation.errors
        }
      });
    }

    const db = await dbPromise;

    // Check if product exists
    const product = await new Promise((resolve, reject) => {
      db.get('SELECT id, name FROM menu WHERE id = ?', [recipeData.product_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!product) {
      throw createNotFoundError('Product', recipeData.product_id);
    }

    // Check if ingredients exist and are active
    const ingredientIds = recipeData.ingredients.map(ing => ing.ingredient_id);
    const placeholders = ingredientIds.map(() => '?').join(',');
    
    const ingredients = await new Promise((resolve, reject) => {
      db.all(
        `SELECT id, name, is_active FROM ingredients WHERE id IN (${placeholders})`,
        ingredientIds,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    if (ingredients.length !== ingredientIds.length) {
      const foundIds = ingredients.map(ing => ing.id);
      const missingIds = ingredientIds.filter(id => !foundIds.includes(id));
      throw createBusinessRuleError(
        `Ingredients not found: ${missingIds.join(', ')}`
      );
    }

    const inactiveIngredients = ingredients.filter(ing => !ing.is_active);
    if (inactiveIngredients.length > 0) {
      throw createBusinessRuleError(
        `Inactive ingredients: ${inactiveIngredients.map(ing => ing.name).join(', ')}`
      );
    }

    // Insert recipe ingredients
    const recipeIds = [];
    for (const ing of recipeData.ingredients) {
      const recipeId = await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO recipes (product_id, ingredient_id, quantity, unit)
           VALUES (?, ?, ?, ?)`,
          [recipeData.product_id, ing.ingredient_id, ing.quantity, ing.unit],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
      recipeIds.push(recipeId);
    }

    // Recalculate cost
    await updateRecipeCost(recipeData.product_id);

    res.status(201).json({
      success: true,
      message: 'Recipe created successfully',
      data: {
        product_id: recipeData.product_id,
        recipe_ids: recipeIds
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllRecipesForScaling: asyncHandler(getAllRecipesForScaling),
  getRecipeCost: asyncHandler(getRecipeCost),
  recalculateCost: asyncHandler(recalculateCost),
  recalculateAllCosts: asyncHandler(recalculateAllCosts),
  scaleRecipe: asyncHandler(scaleRecipe),
  createRecipe: asyncHandler(createRecipe)
};

