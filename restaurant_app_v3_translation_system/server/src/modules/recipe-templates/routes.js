/**
 * ENTERPRISE MODULE (CORE)
 * Phase: E8 - Recipe Templates Routes (logic migrated)
 * Original: routes/recipeTemplateRoutes.js
 * Factory pattern: accepts db as dependency
 */

const express = require('express');
const controllerFactory = require('./controllers/recipe-templates.controller');

module.exports = function createRecipeTemplateRoutes(db) {
    const router = express.Router();
    const controller = controllerFactory(db);

    router.get('/', controller.getAllRecipeTemplates);
    router.get('/:id', controller.getRecipeTemplateById);
    router.post('/import/:id', controller.importRecipeTemplate);

    return router;
};
