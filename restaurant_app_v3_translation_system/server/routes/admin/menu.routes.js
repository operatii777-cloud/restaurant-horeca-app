// Menu Routes - Alias for products
// This route maps /api/admin/menu to the products endpoint
// for compatibility with the admin-vite frontend

const express = require('express');
const router = express.Router();

// Import products router
const productsRouter = require('./products-simple.routes');

// Reuse all products routes
router.use('/', productsRouter);

module.exports = router;
