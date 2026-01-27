/**
 * ENTERPRISE MODULE (CORE)
 * Phase: E8 - Admin Routes (aggregator pattern, logic migrated)
 * Original: routes/admin/index.js
 * 
 * NOTE: Admin uses aggregator pattern with sub-routes
 */

const express = require('express');
const router = express.Router();
const controller = require('./controllers/admin.controller');

// Import all admin sub-routes (same as original)
const ingredientsRoutes = require('../../../routes/admin/ingredients-simple.routes');
const productsRoutes = require('../../../routes/admin/products-simple.routes');
const recipesRoutes = require('../../../routes/admin/recipes-simple.routes');
const nirRoutes = require('../../../routes/admin/nir-simple.routes');
const stockMovementsRoutes = require('../../../routes/admin/stockMovements-simple.routes');
const reservationsRoutes = require('../../../routes/admin/reservations.routes');

// Import batch routes
const {
    stockTransfersRouter,
    gestiuniRouter,
    suppliersRouter,
    categoriesRouter,
    cashAccountsRouter
} = require('../../../routes/admin/all-simple-routes-batch');

// Register sub-routes with their paths (same structure as original)
router.use('/gestiuni', gestiuniRouter);
router.use('/suppliers', suppliersRouter);
router.use('/categories', categoriesRouter);
router.use('/cash-accounts', cashAccountsRouter);
router.use('/ingredients', ingredientsRoutes);
router.use('/products', productsRoutes);
router.use('/recipes', recipesRoutes);
router.use('/nir', nirRoutes);
router.use('/stock-movements', stockMovementsRoutes);
router.use('/stock-transfers', stockTransfersRouter);
router.use('/reservations', reservationsRoutes);

// Direct endpoints (migrated to controller)
router.get('/health', controller.getHealth);
router.get('/', controller.getApiInfo);

module.exports = router;
