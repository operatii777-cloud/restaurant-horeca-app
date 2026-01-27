/**
 * ENTERPRISE CONTROLLER
 * Phase: E8 - Logic migrated from routes/admin/index.js
 * 
 * NOTE: Admin uses aggregator pattern - most routes are in sub-routes.
 * This controller handles only direct endpoints (health, API info).
 */

// GET /api/admin/health
async function getHealth(req, res, next) {
    try {
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
    } catch (error) {
        next(error);
    }
}

// GET /api/admin/
async function getApiInfo(req, res, next) {
    try {
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
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getHealth,
    getApiInfo,
};

