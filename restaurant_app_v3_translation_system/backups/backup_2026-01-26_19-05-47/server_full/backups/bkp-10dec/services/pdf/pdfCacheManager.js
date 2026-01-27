/**
 * PDF CACHE MANAGER
 * 
 * Gestiune cache PDF-uri pre-generate
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

const CACHE_DIR = path.join(__dirname, '..', '..', 'cache', 'pdfs');

/**
 * Verifică dacă PDF există în cache
 */
function pdfExists(type, lang) {
  const filename = `menu-${type}-${lang}.pdf`;
  const filepath = path.join(CACHE_DIR, filename);
  return fsSync.existsSync(filepath);
}

/**
 * Obține calea către PDF din cache
 */
function getPdfPath(type, lang) {
  const filename = `menu-${type}-${lang}.pdf`;
  return path.join(CACHE_DIR, filename);
}

/**
 * Obține info despre PDF (dimensiune, data modificare)
 */
async function getPdfInfo(type, lang) {
  const filepath = getPdfPath(type, lang);
  
  if (!fsSync.existsSync(filepath)) {
    return null;
  }
  
  try {
    const stats = await fs.stat(filepath);
    return {
      exists: true,
      size: stats.size,
      sizeKB: (stats.size / 1024).toFixed(2),
      sizeMB: (stats.size / 1024 / 1024).toFixed(2),
      modified: stats.mtime,
      modified_formatted: stats.mtime.toLocaleString('ro-RO')
    };
  } catch (error) {
    return null;
  }
}

/**
 * Obține status cache pentru toate PDF-urile
 */
async function getCacheStatus() {
  const combinations = [
    { type: 'food', lang: 'ro', label: 'Meniu Mâncare (RO)' },
    { type: 'food', lang: 'en', label: 'Food Menu (EN)' },
    { type: 'drinks', lang: 'ro', label: 'Meniu Băuturi (RO)' },
    { type: 'drinks', lang: 'en', label: 'Drinks Menu (EN)' }
  ];
  
  const status = [];
  
  for (const combo of combinations) {
    const info = await getPdfInfo(combo.type, combo.lang);
    status.push({
      type: combo.type,
      lang: combo.lang,
      label: combo.label,
      filename: `menu-${combo.type}-${combo.lang}.pdf`,
      ...info
    });
  }
  
  const allExist = status.every(s => s.exists);
  const totalSize = status.reduce((sum, s) => sum + (s.exists ? parseFloat(s.sizeKB) : 0), 0);
  
  return {
    all_cached: allExist,
    total: status.length,
    cached: status.filter(s => s.exists).length,
    missing: status.filter(s => !s.exists).length,
    total_size_kb: totalSize.toFixed(2),
    total_size_mb: (totalSize / 1024).toFixed(2),
    pdfs: status
  };
}

/**
 * Șterge PDF din cache
 */
async function clearPdf(type, lang) {
  const filepath = getPdfPath(type, lang);
  
  try {
    if (fsSync.existsSync(filepath)) {
      await fs.unlink(filepath);
      return { success: true, message: `PDF ${type}_${lang} șters` };
    } else {
      return { success: false, message: 'PDF nu există în cache' };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Șterge toate PDF-urile din cache
 */
async function clearAllPdfs() {
  const combinations = [
    { type: 'food', lang: 'ro' },
    { type: 'food', lang: 'en' },
    { type: 'drinks', lang: 'ro' },
    { type: 'drinks', lang: 'en' }
  ];
  
  const results = [];
  
  for (const combo of combinations) {
    const result = await clearPdf(combo.type, combo.lang);
    results.push({ ...combo, ...result });
  }
  
  const successful = results.filter(r => r.success).length;
  
  return {
    success: successful === combinations.length,
    total: combinations.length,
    cleared: successful,
    results: results
  };
}

module.exports = {
  pdfExists,
  getPdfPath,
  getPdfInfo,
  getCacheStatus,
  clearPdf,
  clearAllPdfs,
  CACHE_DIR
};

