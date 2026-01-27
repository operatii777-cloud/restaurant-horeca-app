/**
 * ENTERPRISE MODULE (CORE)
 * Phase: E8 - Ingredient Catalog Routes (logic migrated)
 * Original: routes/ingredientCatalogRoutes.js
 * Factory pattern: accepts db as dependency
 */

const express = require('express');
const controllerFactory = require('./controllers/ingredient-catalog.controller');

module.exports = function createIngredientCatalogRoutes(db) {
    const router = express.Router();
    const controller = controllerFactory(db);

    router.get('/', controller.getAllIngredients);
    router.get('/allergens', controller.getAllergens);
    router.get('/additives', controller.getAdditives);
    router.get('/:id', controller.getIngredientById);
    router.post('/import/:id', controller.importIngredient);

    return router;
};
