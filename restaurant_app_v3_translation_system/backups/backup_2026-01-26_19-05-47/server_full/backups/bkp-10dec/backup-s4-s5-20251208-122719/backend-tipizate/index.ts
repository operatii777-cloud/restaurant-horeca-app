/**
 * PHASE S4.2 - Tipizate Enterprise Module
 * Module entry point for mounting in modules.registry
 */

const { tipizateRouter } = require('./routes/tipizate.routes');

module.exports = tipizateRouter;

