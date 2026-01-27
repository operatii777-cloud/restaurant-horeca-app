/**
 * PHASE PRODUCTION-READY - Recipes Routes
 * 
 * Routes pentru gestionarea rețetelor cu validări și calcul costuri
 */

const express = require('express');
const router = express.Router();
const controller = require('./recipes.controller');

// Get all recipes for scaling (must be before /:productId routes)
router.get('/', controller.getAllRecipesForScaling);

// Recipe cost routes
router.get('/:productId/cost', controller.getRecipeCost);
router.post('/:productId/recalculate-cost', controller.recalculateCost);
router.post('/:productId/scale', controller.scaleRecipe);

// Recipe CRUD routes
router.post('/recalculate-all-costs', controller.recalculateAllCosts);
router.post('/create', controller.createRecipe);

module.exports = router;

