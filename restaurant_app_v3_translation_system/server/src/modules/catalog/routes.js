/**
 * ENTERPRISE MODULE (CORE)
 * Phase: E8 - Catalog Routes (factory pattern, logic migrated)
 * Original: routes/catalog-produse.routes.js
 * 
 * NOTE: This module uses factory pattern to receive dependencies (invalidateMenuCache)
 */

const express = require('express');
const { createCatalogController } = require('./controllers/catalog.controller');

/**
 * Factory function - creates catalog routes with dependencies
 * @param {Object} deps - Dependencies (invalidateMenuCache function)
 * @returns {express.Router} Configured router
 */
module.exports = function createCatalogRoutes(deps = {}) {
    const router = express.Router();
    const controller = createCatalogController(deps);

    // Categories
    router.get('/categories/tree', controller.getCategoryTree);
    // Quick stub for /categories (alias to /categories/tree)
    router.get('/categories', controller.getCategoryTree);
    router.post('/categories', controller.createCategory);
    router.post('/categories/reorder', controller.reorderCategories);
    router.put('/categories/:id', controller.updateCategory);
    router.delete('/categories/:id', controller.deleteCategory);

    // Products
    router.get('/products', controller.getProducts);
    router.get('/products/:id/chef-summary', controller.getChefSummary);
    router.get('/products/:id/price-history', controller.getPriceHistory);
    router.get('/products/:id/dependencies', controller.getDependencies);
    router.get('/products/export', controller.exportProducts);
    router.post('/products', controller.createProduct);
    router.post('/products/reorder', controller.reorderProducts);
    router.post('/products/:id/clone', controller.cloneProduct);
    router.put('/products/bulk-price-change', controller.bulkPriceChange);
    router.put('/products/:id', controller.updateProduct);
    router.delete('/products/:id', controller.deleteProduct);

    return router;
};
