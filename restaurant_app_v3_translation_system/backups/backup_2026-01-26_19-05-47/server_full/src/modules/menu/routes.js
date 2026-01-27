/**
 * Menu Module Routes
 * 
 * Placeholder routes for menu PDF functionality.
 * Routes are currently in submodules (pdf/, pdf-builder/).
 */

const express = require('express');
const router = express.Router();

// Placeholder route - will be populated when menu PDF routes are migrated
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Menu module - PDF routes are in development',
    endpoints: {
      pdf: '/api/menu/pdf',
      pdfBuilder: '/api/menu/pdf-builder'
    }
  });
});

module.exports = router;

