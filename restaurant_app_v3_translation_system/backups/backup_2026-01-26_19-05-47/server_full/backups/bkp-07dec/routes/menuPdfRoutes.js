/**
 * MENU PDF ROUTES
 * 
 * Endpoint-uri API pentru servire PDF-uri meniu
 */

const express = require('express');
const router = express.Router();
const { pdfExists, getPdfPath, getPdfInfo, getCacheStatus, clearAllPdfs } = require('../services/pdf/pdfCacheManager');
// Folosește Playwright pentru generare profesională
const { generatePDF, generateAllPDFs } = require('../services/pdf/menuPdfGeneratorPlaywright');

/**
 * GET /api/menu/pdf/:type/:lang
 * 
 * Servește PDF meniu (food sau drinks, ro sau en)
 * Exemplu: GET /api/menu/pdf/food/ro
 */
router.get('/:type/:lang', async (req, res) => {
  const { type, lang } = req.params;
  
  // Validare parametri
  if (!['food', 'drinks'].includes(type)) {
    return res.status(400).json({ error: 'Type must be "food" or "drinks"' });
  }
  
  if (!['ro', 'en'].includes(lang)) {
    return res.status(400).json({ error: 'Lang must be "ro" or "en"' });
  }
  
  try {
    // Verifică cache
    if (!pdfExists(type, lang)) {
      console.log(`⚠️  PDF ${type}_${lang} nu există în cache, generez...`);
      
      // Generează PDF
      const outputPath = getPdfPath(type, lang);
      const result = await generatePDF(type, lang, outputPath);
      
      if (!result.success) {
        return res.status(500).json({ 
          error: 'PDF generation failed', 
          message: result.error 
        });
      }
    }
    
    // Servește PDF
    const filepath = getPdfPath(type, lang);
    const filename = `menu-${type}-${lang}.pdf`;
    
    // 🚀 CACHE HTTP: PDF-urile se cache-uiesc 1 oră (se schimbă rar)
    const fs = require('fs');
    const stats = fs.statSync(filepath);
    const lastModified = stats.mtime.getTime();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 oră
    res.setHeader('ETag', `"pdf-${type}-${lang}-${lastModified}"`);
    res.setHeader('Last-Modified', new Date(lastModified).toUTCString());
    
    // Verifică If-None-Match pentru 304 Not Modified
    const ifNoneMatch = req.headers['if-none-match'];
    if (ifNoneMatch === `"pdf-${type}-${lang}-${lastModified}"`) {
      return res.status(304).end();
    }
    
    res.sendFile(filepath);
    
  } catch (error) {
    console.error('❌ Eroare servire PDF:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
});

/**
 * GET /api/menu/pdf/status
 * 
 * Obține status cache PDF-uri
 */
router.get('/status', async (req, res) => {
  try {
    const status = await getCacheStatus();
    res.json(status);
  } catch (error) {
    console.error('❌ Eroare obținere status:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
});

/**
 * POST /api/menu/pdf/regenerate
 * 
 * Regenerează toate PDF-urile
 */
router.post('/regenerate', async (req, res) => {
  try {
    console.log('🔄 Regenerare manuală PDF-uri declanșată...');
    
    // Șterge cache existent
    await clearAllPdfs();
    
    // Generează toate PDF-urile
    const result = await generateAllPDFs();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Toate PDF-urile au fost regenerate cu succes',
        ...result
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Unele PDF-uri au eșuat',
        ...result
      });
    }
    
  } catch (error) {
    console.error('❌ Eroare regenerare PDF-uri:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
});

/**
 * POST /api/menu/pdf/regenerate/:type/:lang
 * 
 * Regenerează un singur PDF
 */
router.post('/regenerate/:type/:lang', async (req, res) => {
  const { type, lang } = req.params;
  
  // Validare
  if (!['food', 'drinks'].includes(type)) {
    return res.status(400).json({ error: 'Type must be "food" or "drinks"' });
  }
  
  if (!['ro', 'en'].includes(lang)) {
    return res.status(400).json({ error: 'Lang must be "ro" or "en"' });
  }
  
  try {
    console.log(`🔄 Regenerare ${type}_${lang}.pdf...`);
    
    const outputPath = getPdfPath(type, lang);
    const result = await generatePDF(type, lang, outputPath);
    
    if (result.success) {
      res.json({
        success: true,
        message: `PDF ${type}_${lang} regenerat cu succes`,
        ...result
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Generare PDF eșuată',
        error: result.error
      });
    }
    
  } catch (error) {
    console.error('❌ Eroare regenerare PDF:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
});

module.exports = router;

