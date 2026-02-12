/**
 * MENU PDF CONFIGURATION ROUTES
 * 
 * API endpoints pentru configurare avansată PDF meniuri
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/menuPdfConfigController');

/**
 * GET /api/menu/pdf/builder/config
 * 
 * Obține configurația completă pentru PDF builder
 * Query params: ?type=food|drinks
 */
router.get('/config', controller.getConfig);

/**
 * POST /api/menu/pdf/builder/config/categories
 * 
 * Salvează configurația categoriilor
 * Body: { categories: [{id, display_in_pdf, order_index, page_break_after}, ...] }
 */
router.post('/config/categories', controller.updateCategories);

/**
 * POST /api/menu/pdf/builder/config/products
 * 
 * Salvează configurația produselor
 * Body: { products: [{product_id, display_in_pdf, custom_order}, ...] }
 */
router.post('/config/products', controller.updateProducts);

/**
 * POST /api/menu/pdf/builder/upload-category-image/:categoryId
 * 
 * Upload imagine pentru o categorie
 * Form-data: image (file)
 */
router.post('/upload-category-image/:categoryId', controller.uploadCategoryImage);

/**
 * DELETE /api/menu/pdf/builder/delete-category-image/:categoryId
 * 
 * Șterge imaginea unei categorii
 */
router.delete('/delete-category-image/:categoryId', controller.deleteCategoryImage);

/**
 * POST /api/menu/pdf/builder/regenerate
 * 
 * Regenerează PDF-urile
 * Body: { type: 'all' | 'food' | 'drinks' }
 */
router.post('/regenerate', controller.regeneratePDFs);

/**
 * GET /api/menu/pdf/builder/history
 * 
 * Returnează istoricul regenerărilor PDF
 * Query params: ?limit=20
 */
router.get('/history', controller.getRegenerationHistory);

/**
 * GET /api/menu/pdf/builder/settings
 * 
 * Returnează setările globale pentru PDF (font, culori, layout)
 */
router.get('/settings', controller.getSettings);

/**
 * POST /api/menu/pdf/builder/settings
 * 
 * Salvează setările globale pentru PDF
 * Body: { settings: {...} }
 */
router.post('/settings', controller.updateSettings);

module.exports = router;

