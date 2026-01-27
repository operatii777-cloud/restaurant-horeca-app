// Recipes Routes
// Purpose: API endpoints for recipe management
// Created: 21 Oct 2025, 22:30

const express = require('express');
const router = express.Router();
const recipesService = require('../../services/recipes.service');
const { asyncHandler } = require('../../middleware/errorHandler');
const { validateBody, validateParams } = require('../../middleware/validator');

router.get('/', asyncHandler(async (req, res) => {
    const recipes = await recipesService.getAll();
    res.json({ success: true, data: recipes, count: recipes.length });
}));

router.get('/statistics', asyncHandler(async (req, res) => {
    const stats = await recipesService.getStatistics();
    res.json({ success: true, data: stats });
}));

router.get('/by-product/:productId', 
    validateParams({ productId: { required: true, type: 'number' } }),
    asyncHandler(async (req, res) => {
        const recipes = await recipesService.getByProduct(req.params.productId);
        res.json({ success: true, data: recipes, count: recipes.length });
    })
);

router.get('/by-product/:productId/details', 
    validateParams({ productId: { required: true, type: 'number' } }),
    asyncHandler(async (req, res) => {
        const recipe = await recipesService.getProductRecipeWithDetails(req.params.productId);
        res.json({ success: true, data: recipe });
    })
);

router.get('/by-ingredient/:ingredientId', 
    validateParams({ ingredientId: { required: true, type: 'number' } }),
    asyncHandler(async (req, res) => {
        const recipes = await recipesService.getByIngredient(req.params.ingredientId);
        res.json({ success: true, data: recipes, count: recipes.length });
    })
);

router.get('/by-ingredient/:ingredientId/usage', 
    validateParams({ ingredientId: { required: true, type: 'number' } }),
    asyncHandler(async (req, res) => {
        const usage = await recipesService.getIngredientUsage(req.params.ingredientId);
        res.json({ success: true, data: usage });
    })
);

router.get('/validate/:productId', 
    validateParams({ productId: { required: true, type: 'number' } }),
    asyncHandler(async (req, res) => {
        const validation = await recipesService.validateRecipe(req.params.productId);
        res.json({ success: true, data: validation });
    })
);

router.get('/:id', 
    validateParams({ id: { required: true, type: 'number' } }),
    asyncHandler(async (req, res) => {
        const recipe = await recipesService.getById(req.params.id);
        res.json({ success: true, data: recipe });
    })
);

router.post('/',
    validateBody({
        product_id: { required: true, type: 'number' },
        ingredient_id: { required: true, type: 'number' },
        quantity: { required: true, type: 'number', min: 0.001 },
        unit: { required: true, type: 'string', maxLength: 20 }
    }),
    asyncHandler(async (req, res) => {
        const recipe = await recipesService.create(req.body);
        res.status(201).json({ success: true, data: recipe, message: 'Recipe created successfully' });
    })
);

router.put('/:id',
    validateParams({ id: { required: true, type: 'number' } }),
    validateBody({
        product_id: { required: false, type: 'number' },
        ingredient_id: { required: false, type: 'number' },
        quantity: { required: false, type: 'number', min: 0.001 },
        unit: { required: false, type: 'string', maxLength: 20 }
    }),
    asyncHandler(async (req, res) => {
        const recipe = await recipesService.update(req.params.id, req.body);
        res.json({ success: true, data: recipe, message: 'Recipe updated successfully' });
    })
);

router.delete('/:id',
    validateParams({ id: { required: true, type: 'number' } }),
    asyncHandler(async (req, res) => {
        const result = await recipesService.delete(req.params.id);
        res.json({ success: true, data: result, message: 'Recipe deleted successfully' });
    })
);

router.post('/product/:productId/bulk',
    validateParams({ productId: { required: true, type: 'number' } }),
    asyncHandler(async (req, res) => {
        if (!Array.isArray(req.body)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Request body must be an array of {ingredient_id, quantity, unit}' 
            });
        }
        const result = await recipesService.bulkCreateForProduct(req.params.productId, req.body);
        res.json({ 
            success: true, 
            data: result, 
            message: `Recipe created with ${result.ingredients_count} ingredients` 
        });
    })
);

router.delete('/product/:productId/all',
    validateParams({ productId: { required: true, type: 'number' } }),
    asyncHandler(async (req, res) => {
        const result = await recipesService.deleteProductRecipe(req.params.productId);
        res.json({ 
            success: true, 
            data: result, 
            message: `Deleted ${result.deleted_count} recipe item(s)` 
        });
    })
);

// ============================================================================
// RECIPE VERSIONS (Versioning & Audit Trail)
// ============================================================================
const recipeVersionsController = require('../../src/modules/recipes/controllers/recipeVersions.controller');

router.get('/:recipeId/versions',
    validateParams({ recipeId: { required: true, type: 'number' } }),
    asyncHandler(recipeVersionsController.getRecipeVersions)
);

router.get('/:recipeId/versions/:versionNumber',
    validateParams({ 
        recipeId: { required: true, type: 'number' },
        versionNumber: { required: true, type: 'number' }
    }),
    asyncHandler(recipeVersionsController.getRecipeVersion)
);

router.post('/:recipeId/versions',
    validateParams({ recipeId: { required: true, type: 'number' } }),
    validateBody({
        change_description: { required: false, type: 'string' },
        change_reason: { required: false, type: 'string' },
        changed_by: { required: false, type: 'string' }
    }),
    asyncHandler(recipeVersionsController.createRecipeVersion)
);

router.get('/:recipeId/versions/compare/:version1/:version2',
    validateParams({ 
        recipeId: { required: true, type: 'number' },
        version1: { required: true, type: 'number' },
        version2: { required: true, type: 'number' }
    }),
    asyncHandler(recipeVersionsController.compareRecipeVersions)
);

router.post('/:recipeId/versions/:versionNumber/restore',
    validateParams({ 
        recipeId: { required: true, type: 'number' },
        versionNumber: { required: true, type: 'number' }
    }),
    validateBody({
        changed_by: { required: false, type: 'string' },
        change_reason: { required: false, type: 'string' }
    }),
    asyncHandler(recipeVersionsController.restoreRecipeVersion)
);

module.exports = router;

