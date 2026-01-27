/**
 * PHASE S4.2 - Tipizate Enterprise Module
 * Module entry point for mounting in modules.registry
 */

const { tipizateRouter } = require('./routes/tipizate.routes');

// Export router directly - modules.registry will call it as a function if needed
// This ensures that the router is available for mounting
module.exports = tipizateRouter;

