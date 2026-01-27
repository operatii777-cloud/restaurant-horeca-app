/**
 * PHASE E9.7 - Middleware Index
 * 
 * Exports all middleware for easy import.
 */

const { tenantMiddleware, requireTenant, requireLocation } = require('./tenant.middleware');

module.exports = {
  tenantMiddleware,
  requireTenant,
  requireLocation,
};
