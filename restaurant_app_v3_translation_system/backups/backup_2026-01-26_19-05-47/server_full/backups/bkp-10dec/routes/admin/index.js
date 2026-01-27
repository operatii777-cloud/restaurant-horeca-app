// Admin Routes Aggregator
// Purpose: Centralized admin route registration
// Created: 21 Oct 2025, 21:50

const express = require('express');
const router = express.Router();

// Import all admin routes - Using SIMPLE versions for real DB
const ingredientsRoutes = require('./ingredients-simple.routes');
const productsRoutes = require('./products-simple.routes');
const recipesRoutes = require('./recipes-simple.routes');
const nirRoutes = require('./nir-simple.routes');
const stockMovementsRoutes = require('./stockMovements-simple.routes');
const reservationsRoutes = require('./reservations.routes');

// Import batch routes temporarily
const {
    stockTransfersRouter,
    gestiuniRouter,
    suppliersRouter,
    categoriesRouter,
    cashAccountsRouter
} = require('./all-simple-routes-batch');

// Register routes with their paths
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

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Admin API is healthy',
        timestamp: new Date().toISOString(),
        modules: {
            gestiuni: 'active',
            suppliers: 'active',
            categories: 'active',
            cashAccounts: 'active',
            ingredients: 'active',
            products: 'active',
            recipes: 'active',
            nir: 'active',
            stockMovements: 'active',
            stockTransfers: 'active',
            reservations: 'active'
        }
    });
});

// API documentation endpoint
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Restaurant App Admin API v3.0',
        endpoints: {
            gestiuni: {
                base: '/api/admin/gestiuni',
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                count: 13
            },
            suppliers: {
                base: '/api/admin/suppliers',
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                count: 13
            },
            categories: {
                base: '/api/admin/categories',
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                count: 14
            },
            cashAccounts: {
                base: '/api/admin/cash-accounts',
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                count: 12
            },
            ingredients: {
                base: '/api/admin/ingredients',
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                count: 18
            },
            products: {
                base: '/api/admin/products',
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                count: 16
            },
            recipes: {
                base: '/api/admin/recipes',
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                count: 13
            },
            nir: {
                base: '/api/admin/nir',
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                count: 11
            },
            stockMovements: {
                base: '/api/admin/stock-movements',
                methods: ['GET', 'POST'],
                count: 5
            },
            stockTransfers: {
                base: '/api/admin/stock-transfers',
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                count: 9
            },
            reservations: {
              base: '/api/admin/reservations',
              methods: ['GET', 'POST', 'PUT', 'DELETE'],
              count: 12
            }
        },
        total_endpoints: 136,
        documentation: 'See README.md for detailed API documentation'
    });
});

module.exports = router;

