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
const inventoryDashboardController = require('./controllers/inventory-dashboard.controller');
const backupController = require('./controllers/admin-backup.controller');
const invoiceImportController = require('./controllers/invoice-import.controller');
const productionController = require('./controllers/production.controller');
// Archive controller - check if exists, otherwise use placeholder
let archiveController;
try {
  archiveController = require('../archive/archive.controller');
} catch (err) {
  // Archive module not available, use placeholder
  archiveController = {
    getAdminArchiveStats: (req, res) => res.json({ success: true, data: { total: 0 } }),
    archiveOrdersAdmin: (req, res) => res.json({ success: true, message: 'Archive module not available' }),
    exportArchivedOrders: (req, res) => res.json({ success: true, data: [] }),
    deleteArchivedOrders: (req, res) => res.json({ success: true, message: 'Archive module not available' })
  };
}

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
router.get('/check-auth', controller.checkAuth);
router.get('/', controller.getApiInfo);
router.get('/menu', controller.getMenu);
router.get('/dashboard/kpi', controller.getDashboardKPI);
router.get('/dashboard/metrics', controller.getDashboardMetrics);
router.get('/dashboard/revenue-chart', controller.getRevenueChart);
router.get('/dashboard/inventory-alerts', controller.getInventoryAlerts);
router.get('/pins', controller.getPins);
router.get('/invoices', controller.getInvoices);
router.get('/backups', controller.getBackups);
router.get('/archive-stats', archiveController.getAdminArchiveStats);
router.post('/archive-orders', archiveController.archiveOrdersAdmin);
router.get('/export-archived', archiveController.exportArchivedOrders);
router.delete('/delete-archived', archiveController.deleteArchivedOrders);
router.post('/backup-database', backupController.backupDatabase);
router.post('/restore-database', backupController.restoreDatabase);
// router.get('/reports/profitability', controller.getProfitabilityReport); // REMOVED - use reports.routes.js instead
router.get('/reservations', controller.getReservations);
router.get('/reservations/metrics', controller.getReservationsMetrics);

// Users endpoints
router.get('/users', controller.getUsers);
router.post('/users', controller.createUser);
router.put('/users/:id', controller.updateUser);
router.delete('/users/:id', controller.deleteUser);
router.get('/roles', controller.getRoles);

// Inventory Dashboard endpoints
router.get('/inventory/dashboard/stats', inventoryDashboardController.getInventoryStats);
router.get('/inventory/dashboard/trends', inventoryDashboardController.getInventoryTrends);
router.get('/inventory/dashboard/top-variances', inventoryDashboardController.getTopVariances);
router.get('/inventory/dashboard/locations', inventoryDashboardController.getInventoryLocations);
router.get('/inventory/dashboard/predictions', inventoryDashboardController.getInventoryPredictions);

// Invoice Import endpoints (PHASE IMPORT-FACTURI)
router.post('/inventory/import-invoice', invoiceImportController.upload.single('file'), invoiceImportController.importInvoice);
router.get('/inventory/import-history', invoiceImportController.getImportHistory);
router.delete('/inventory/import/:id', invoiceImportController.deleteImport);

// Happy Hour Admin endpoints
let happyHourAdminRoutes;
try {
  happyHourAdminRoutes = require('../promotions/happy-hour/admin-routes');
  router.use('/happy-hour', happyHourAdminRoutes);
  console.log('✅ Happy Hour admin routes loaded');
} catch (err) {
  console.warn('⚠️ Happy Hour admin routes not available:', err.message);
}

// Daily Menu Admin endpoints
let dailyMenuAdminRoutes;
try {
  dailyMenuAdminRoutes = require('../promotions/daily-menu/routes');
  router.use('/daily-menu', dailyMenuAdminRoutes);
  console.log('✅ Daily Menu routes loaded');
} catch (err) {
  console.warn('⚠️ Daily Menu routes not available:', err.message);
}

// Orders Export endpoint
let ordersExportController;
try {
  ordersExportController = require('../orders/controllers/orders-export.controller');
  router.get('/orders/export', ordersExportController.exportOrders);
  console.log('✅ Orders export controller loaded');
} catch (err) {
  console.warn('⚠️ Orders export controller not available:', err.message);
}

// Production Batches endpoints
router.get('/production/batches', productionController.listProductionBatches);
router.get('/production/batches/:id', productionController.getProductionBatch);
router.post('/production/batches', productionController.createProductionBatch);
router.put('/production/batches/:id', productionController.updateProductionBatch);
router.delete('/production/batches/:id', productionController.deleteProductionBatch);
router.post('/production/batches/:id/finalize', productionController.finalizeProductionBatch);

module.exports = router;
