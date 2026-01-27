/**
 * Async Handler Utility
 * 
 * Wraps async route handlers to automatically catch errors
 * and pass them to Express error middleware
 * 
 * Usage:
 *   const { asyncHandler } = require('./utils/asyncHandler');
 *   router.get('/path', asyncHandler(async (req, res) => {
 *     // async code here
 *   }));
 */

/**
 * Async handler wrapper
 * Eliminates try-catch in route handlers
 * 
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express route handler
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { asyncHandler };

