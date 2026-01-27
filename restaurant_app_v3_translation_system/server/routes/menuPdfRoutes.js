/**
 * MENU PDF ROUTES
 * 
 * Endpoint-uri API pentru servire PDF-uri meniu
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Import cu fallback pentru cazul în care serviciile nu există
let pdfExists, getPdfPath, getPdfInfo, getCacheStatus, clearAllPdfs;
let generatePDF, generateAllPDFs;

try {
  const pdfCacheManager = require('../services/pdf/pdfCacheManager');
  pdfExists = pdfCacheManager.pdfExists;
  getPdfPath = pdfCacheManager.getPdfPath;
  getPdfInfo = pdfCacheManager.getPdfInfo;
  getCacheStatus = pdfCacheManager.getCacheStatus;
  clearAllPdfs = pdfCacheManager.clearAllPdfs;
} catch (error) {
  console.warn('⚠️ pdfCacheManager not found, using fallback:', error.message);
  // Fallback functions
  const CACHE_DIR = path.join(__dirname, '..', 'cache', 'pdfs');
  pdfExists = (type, lang) => {
    const filename = `menu-${type}-${lang}.pdf`;
    const filepath = path.join(CACHE_DIR, filename);
    return fs.existsSync(filepath);
  };
  getPdfPath = (type, lang) => {
    const filename = `menu-${type}-${lang}.pdf`;
    return path.join(CACHE_DIR, filename);
  };
  getPdfInfo = async () => ({});
  getCacheStatus = async () => ({ cached: [] });
  clearAllPdfs = async () => ({ success: true });
}

try {
  const menuPdfGenerator = require('../services/pdf/menuPdfGeneratorPlaywright');
  generatePDF = menuPdfGenerator.generatePDF;
  generateAllPDFs = menuPdfGenerator.generateAllPDFs;
} catch (error) {
  console.warn('⚠️ menuPdfGeneratorPlaywright not found, using fallback:', error.message);
  // Fallback: generează PDF simplu sau returnează eroare
  generatePDF = async (type, lang, outputPath) => {
    return { success: false, error: 'PDF generator not available' };
  };
  generateAllPDFs = async () => {
    return { success: false, error: 'PDF generator not available' };
  };
}

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
    // Creează directorul cache dacă nu există
    const cacheDir = path.join(__dirname, '..', 'cache', 'pdfs');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
      console.log(`✅ Created cache directory: ${cacheDir}`);
    }
    
    // Obține calea către PDF
    let filepath;
    try {
      filepath = getPdfPath ? getPdfPath(type, lang) : path.join(cacheDir, `menu-${type}-${lang}.pdf`);
    } catch (error) {
      console.warn('⚠️ Error getting PDF path from cache manager, using fallback:', error.message);
      // Fallback: generează path manual
      filepath = path.join(cacheDir, `menu-${type}-${lang}.pdf`);
    }
    
    // Verifică dacă PDF există
    const exists = pdfExists ? pdfExists(type, lang) : fs.existsSync(filepath);
    
    if (!exists) {
      console.log(`⚠️  PDF ${type}_${lang} nu există în cache, generez...`);
      
      // Generează PDF
      if (generatePDF) {
        const result = await generatePDF(type, lang, filepath);
        
        if (!result.success) {
          console.error('❌ PDF generation failed:', result.error);
          // Nu returnăm eroare imediat, încercăm să servim un PDF placeholder sau mesaj
          return res.status(500).json({ 
            success: false,
            error: 'PDF generation failed', 
            message: result.error || 'PDF generator not available. Please configure PDF generation service.'
          });
        }
      } else {
        return res.status(503).json({ 
          success: false,
          error: 'PDF generator not available', 
          message: 'PDF generation service is not configured. Please install and configure Playwright.'
        });
      }
    }
    
    // Verifică din nou dacă fișierul există
    if (!fs.existsSync(filepath)) {
      console.error(`❌ PDF file not found after generation: ${filepath}`);
      return res.status(500).json({ 
        success: false,
        error: 'PDF file not found', 
        message: 'PDF was not generated successfully' 
      });
    }
    
    // Servește PDF
    const filename = `menu-${type}-${lang}.pdf`;
    
    // 🚀 CACHE HTTP: PDF-urile se cache-uiesc 1 oră (se schimbă rar)
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
    
    res.sendFile(path.resolve(filepath));
    
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

