/**
 * PDF REGENERATION HOOKS
 * 
 * Auto-regenerare PDF-uri la modificări meniu
 */

// Folosește Playwright pentru generare profesională
const { generateAllPDFs } = require('../../services/pdf/menuPdfGeneratorPlaywright');

// Debounce timer pentru a evita regenerări multiple rapide
let regenerationTimer = null;
const DEBOUNCE_DELAY = 5000; // 5 secunde

/**
 * Trigger regenerare PDF-uri (cu debounce)
 */
function triggerPDFRegeneration(reason = 'unknown') {
  // Clear timer existent
  if (regenerationTimer) {
    clearTimeout(regenerationTimer);
  }
  
  // Set nou timer
  regenerationTimer = setTimeout(async () => {
    console.log(`\n🔄 [PDF Auto-Regeneration] Trigger: ${reason}`);
    console.log('   Debounce: 5s expired, starting regeneration...\n');
    
    try {
      const result = await generateAllPDFs();
      
      if (result.success) {
        console.log(`✅ [PDF Auto-Regeneration] Success! All ${result.successful} PDFs regenerated`);
      } else {
        console.error(`⚠️  [PDF Auto-Regeneration] Partial success: ${result.successful}/${result.total} PDFs`);
      }
    } catch (error) {
      console.error(`❌ [PDF Auto-Regeneration] Error:`, error.message);
    }
    
    regenerationTimer = null;
  }, DEBOUNCE_DELAY);
  
  console.log(`🔔 [PDF Auto-Regeneration] Scheduled: ${reason} (debounce: ${DEBOUNCE_DELAY}ms)`);
}

/**
 * Setup hooks în Express app
 * 
 * Monitorizează endpoint-urile de modificare produse și trigger regenerare
 */
function setupRegenerationHooks(app) {
  console.log('\n🔗 [PDF Hooks] Setting up auto-regeneration hooks...');
  
  // Middleware pentru monitoring
  const monitoringMiddleware = (req, res, next) => {
    // Salvează metoda originală res.json pentru a intercepta răspunsurile
    const originalJson = res.json.bind(res);
    
    res.json = function(body) {
      // Verifică dacă operațiunea a reușit
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Determină motivul regenerării
        let reason = `${req.method} ${req.path}`;
        
        if (req.path.includes('/menu')) {
          if (req.method === 'POST') reason = 'Product added';
          else if (req.method === 'PUT') reason = 'Product updated';
          else if (req.method === 'DELETE') reason = 'Product deleted';
        } else if (req.path.includes('/translation')) {
          reason = 'Translation updated';
        } else if (req.path.includes('/settings')) {
          reason = 'Settings updated';
        }
        
        // Trigger regenerare
        triggerPDFRegeneration(reason);
      }
      
      // Call original json
      return originalJson(body);
    };
    
    next();
  };
  
  // Aplică middleware pe endpoint-urile relevante
  const watchedPaths = [
    '/api/menu',           // Product CRUD
    '/api/menu/:id',       // Product update/delete
    '/api/translations',   // Translation updates
    '/api/settings'        // Restaurant settings
  ];
  
  watchedPaths.forEach(path => {
    app.use(path, monitoringMiddleware);
  });
  
  console.log('✅ [PDF Hooks] Auto-regeneration hooks active');
  console.log(`   Watching paths: ${watchedPaths.join(', ')}`);
  console.log(`   Debounce delay: ${DEBOUNCE_DELAY}ms\n`);
}

/**
 * Force immediate regeneration (no debounce)
 */
async function forceRegeneration(reason = 'manual') {
  if (regenerationTimer) {
    clearTimeout(regenerationTimer);
    regenerationTimer = null;
  }
  
  console.log(`\n🔄 [PDF Force Regeneration] Reason: ${reason}\n`);
  
  try {
    const result = await generateAllPDFs();
    return result;
  } catch (error) {
    console.error(`❌ [PDF Force Regeneration] Error:`, error.message);
    throw error;
  }
}

module.exports = {
  setupRegenerationHooks,
  triggerPDFRegeneration,
  forceRegeneration
};

