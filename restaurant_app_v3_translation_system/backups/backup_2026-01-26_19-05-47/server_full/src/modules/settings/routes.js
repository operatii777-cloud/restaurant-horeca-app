/**
 * Settings Routes
 * 
 * Aggregator pentru toate rutele de settings
 */

const express = require('express');
const router = express.Router();

// Import sub-routes
const printersRoutes = require('./printers.routes');
const paymentMethodsRoutes = require('./payment-methods.routes');
const areasController = require('./controllers/areas.controller');
const tablesController = require('./controllers/tables.controller');
const restaurantController = require('./controllers/restaurant.controller');
const scheduleController = require('./controllers/schedule.controller');

// Mount sub-routes
router.use('/printers', printersRoutes);
router.use('/payment-methods', paymentMethodsRoutes);

// Areas routes
router.get('/areas', areasController.getAreas);
router.post('/areas', areasController.createArea);
router.put('/areas/:id', areasController.updateArea);
router.delete('/areas/:id', areasController.deleteArea);

// Tables routes
router.get('/tables', tablesController.getTables);
router.post('/tables', tablesController.createTable);
router.put('/tables/:id', tablesController.updateTable);
router.put('/tables/:id/position', tablesController.updateTablePosition);

// Restaurant routes
router.get('/restaurant', restaurantController.getRestaurantSettings);
router.post('/restaurant', restaurantController.saveRestaurantSettings);

// Schedule routes
router.get('/schedule', scheduleController.getSchedule);
router.put('/schedule', scheduleController.updateSchedule);

// Holidays routes
router.get('/holidays', scheduleController.getHolidays);
router.post('/holidays', scheduleController.createHoliday);
router.put('/holidays/:id', scheduleController.updateHoliday);
router.delete('/holidays/:id', scheduleController.deleteHoliday);

module.exports = router;
