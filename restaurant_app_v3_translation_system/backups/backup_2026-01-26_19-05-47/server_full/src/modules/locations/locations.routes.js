/**
 * FAZA MT.5 - Locations Routes
 * 
 * API routes for managing restaurant locations.
 */

const express = require('express');
const router = express.Router();
const locationsController = require('./locations.controller');

// GET /api/settings/locations - Get all locations
router.get('/', locationsController.getAllLocations);

// GET /api/settings/locations/:id - Get location by ID
router.get('/:id', locationsController.getLocationById);

// POST /api/settings/locations - Create new location
router.post('/', locationsController.createLocation);

// PUT /api/settings/locations/:id - Update location
router.put('/:id', locationsController.updateLocation);

// DELETE /api/settings/locations/:id - Delete/deactivate location
router.delete('/:id', locationsController.deleteLocation);

// POST /api/settings/locations/:id/activate - Activate location
router.post('/:id/activate', locationsController.activateLocation);

// POST /api/settings/locations/:id/deactivate - Deactivate location
router.post('/:id/deactivate', locationsController.deactivateLocation);

module.exports = router;
