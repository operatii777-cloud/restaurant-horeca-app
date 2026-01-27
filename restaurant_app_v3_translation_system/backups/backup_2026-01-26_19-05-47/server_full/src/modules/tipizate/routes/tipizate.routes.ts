/**
 * PHASE S4.2 - Tipizate Routes
 * Express routes for tipizate enterprise module
 */

const express = require('express');
const {
  listNir,
  getNirById,
  createNir,
  updateNir,
  signNir,
  lockNir,
  pdfNir,
  exportNirJson,
  exportNirCsv,
} = require('../controllers/nir.controller');

// PHASE S4.3 - Import controllers for all document types
const {
  listBonConsum,
  getBonConsumById,
  createBonConsum,
  updateBonConsum,
  signBonConsum,
  lockBonConsum,
  pdfBonConsum,
} = require('../controllers/bon-consum.controller');

const {
  listTransfer,
  getTransferById,
  createTransfer,
  updateTransfer,
  signTransfer,
  lockTransfer,
  pdfTransfer,
} = require('../controllers/transfer.controller');

const {
  listInventar,
  getInventarById,
  createInventar,
  updateInventar,
  signInventar,
  lockInventar,
  pdfInventar,
} = require('../controllers/inventar.controller');

// PHASE S4.3 - Import controllers for all remaining document types
// Lazy load factura and chitanta controllers to ensure ts-node is registered
let facturaControllers = null;
let chitantaControllers = null;

function getFacturaControllers() {
  if (!facturaControllers) {
    try {
      console.log('🔄 Loading factura.controller...');
      facturaControllers = require('../controllers/factura.controller');
      console.log('✅ factura.controller loaded successfully:', Object.keys(facturaControllers));
    } catch (error) {
      console.error('❌ Error loading factura.controller:', error.message);
      console.error('❌ Stack:', error.stack);
      // Return stub functions to prevent crashes
      facturaControllers = {
        listFactura: (req, res) => res.status(500).json({ error: 'Factura controller not loaded', details: error.message }),
        getFacturaById: (req, res) => res.status(500).json({ error: 'Factura controller not loaded', details: error.message }),
        createFactura: (req, res) => res.status(500).json({ error: 'Factura controller not loaded', details: error.message }),
        updateFactura: (req, res) => res.status(500).json({ error: 'Factura controller not loaded', details: error.message }),
        signFactura: (req, res) => res.status(500).json({ error: 'Factura controller not loaded', details: error.message }),
        lockFactura: (req, res) => res.status(500).json({ error: 'Factura controller not loaded', details: error.message }),
        pdfFactura: (req, res) => res.status(500).json({ error: 'Factura controller not loaded', details: error.message }),
      };
    }
  }
  return facturaControllers;
}

function getChitantaControllers() {
  if (!chitantaControllers) {
    try {
      console.log('🔄 Loading chitanta.controller...');
      chitantaControllers = require('../controllers/chitanta.controller');
      console.log('✅ chitanta.controller loaded successfully:', Object.keys(chitantaControllers));
    } catch (error) {
      console.error('❌ Error loading chitanta.controller:', error.message);
      console.error('❌ Stack:', error.stack);
      // Return stub functions to prevent crashes
      chitantaControllers = {
        listChitanta: (req, res) => res.status(500).json({ error: 'Chitanta controller not loaded', details: error.message }),
        getChitantaById: (req, res) => res.status(500).json({ error: 'Chitanta controller not loaded', details: error.message }),
        createChitanta: (req, res) => res.status(500).json({ error: 'Chitanta controller not loaded', details: error.message }),
        updateChitanta: (req, res) => res.status(500).json({ error: 'Chitanta controller not loaded', details: error.message }),
        signChitanta: (req, res) => res.status(500).json({ error: 'Chitanta controller not loaded', details: error.message }),
        lockChitanta: (req, res) => res.status(500).json({ error: 'Chitanta controller not loaded', details: error.message }),
        pdfChitanta: (req, res) => res.status(500).json({ error: 'Chitanta controller not loaded', details: error.message }),
      };
    }
  }
  return chitantaControllers;
}

const {
  listRegistruCasa,
  getRegistruCasaById,
  createRegistruCasa,
  updateRegistruCasa,
  signRegistruCasa,
  lockRegistruCasa,
  pdfRegistruCasa,
} = require('../controllers/registru-casa.controller');

const {
  listRaportGestiune,
  getRaportGestiuneById,
  createRaportGestiune,
  updateRaportGestiune,
  signRaportGestiune,
  lockRaportGestiune,
  pdfRaportGestiune,
} = require('../controllers/raport-gestiune.controller');

const {
  listRaportX,
  getRaportXById,
  createRaportX,
  updateRaportX,
  signRaportX,
  lockRaportX,
  pdfRaportX,
} = require('../controllers/raport-x.controller');

const {
  listRaportZ,
  getRaportZById,
  createRaportZ,
  updateRaportZ,
  signRaportZ,
  lockRaportZ,
  pdfRaportZ,
} = require('../controllers/raport-z.controller');

const {
  listRaportLunar,
  getRaportLunarById,
  createRaportLunar,
  updateRaportLunar,
  signRaportLunar,
  lockRaportLunar,
  pdfRaportLunar,
} = require('../controllers/raport-lunar.controller');

const {
  listAviz,
  getAvizById,
  createAviz,
  updateAviz,
  signAviz,
  lockAviz,
  pdfAviz,
} = require('../controllers/aviz.controller');

const {
  listProcesVerbal,
  getProcesVerbalById,
  createProcesVerbal,
  updateProcesVerbal,
  signProcesVerbal,
  lockProcesVerbal,
  pdfProcesVerbal,
} = require('../controllers/proces-verbal.controller');

const {
  listRetur,
  getReturById,
  createRetur,
  updateRetur,
  signRetur,
  lockRetur,
  pdfRetur,
} = require('../controllers/retur.controller');

const {
  listWaste,
  getWasteById,
  createWaste,
  updateWaste,
  signWaste,
  lockWaste,
  pdfWaste,
} = require('../controllers/waste.controller');

const tipizateRouter = express.Router();

// Debug: Log ALL requests to tipizate router (for debugging)
tipizateRouter.use((req, res, next) => {
  // Log all requests to see if they reach the router
  if (req.path.includes('chitanta') || req.path.includes('factura') || req.path.includes('nir')) {
    console.log(`🔍 [tipizate.routes] ${req.method} ${req.path} - Request reached tipizate router`);
  }
  next();
});

// NIR Routes
tipizateRouter.get('/nir', listNir);
tipizateRouter.get('/nir/:id', getNirById);
tipizateRouter.post('/nir', createNir);
tipizateRouter.put('/nir/:id', updateNir);
tipizateRouter.post('/nir/:id/sign', signNir);
tipizateRouter.post('/nir/:id/lock', lockNir);
tipizateRouter.get('/nir/:id/pdf', pdfNir);
tipizateRouter.get('/nir/:id/export/json', exportNirJson);
tipizateRouter.get('/nir/:id/export/csv', exportNirCsv);

// Bon Consum Routes
tipizateRouter.get('/bon-consum', listBonConsum);
tipizateRouter.get('/bon-consum/:id', getBonConsumById);
tipizateRouter.post('/bon-consum', createBonConsum);
tipizateRouter.put('/bon-consum/:id', updateBonConsum);
tipizateRouter.post('/bon-consum/:id/sign', signBonConsum);
tipizateRouter.post('/bon-consum/:id/lock', lockBonConsum);
tipizateRouter.get('/bon-consum/:id/pdf', pdfBonConsum);

// Transfer Routes
tipizateRouter.get('/transfer', listTransfer);
tipizateRouter.get('/transfer/:id', getTransferById);
tipizateRouter.post('/transfer', createTransfer);
tipizateRouter.put('/transfer/:id', updateTransfer);
tipizateRouter.post('/transfer/:id/sign', signTransfer);
tipizateRouter.post('/transfer/:id/lock', lockTransfer);
tipizateRouter.get('/transfer/:id/pdf', pdfTransfer);

// Inventar Routes
tipizateRouter.get('/inventar', listInventar);
tipizateRouter.get('/inventar/:id', getInventarById);
tipizateRouter.post('/inventar', createInventar);
tipizateRouter.put('/inventar/:id', updateInventar);
tipizateRouter.post('/inventar/:id/sign', signInventar);
tipizateRouter.post('/inventar/:id/lock', lockInventar);
tipizateRouter.get('/inventar/:id/pdf', pdfInventar);

// Factură Routes - Lazy loaded (MUST be before UBL routes)
tipizateRouter.get('/factura', (req, res, next) => {
  console.log('🔍 [tipizate.routes] GET /factura called');
  try {
    const controllers = getFacturaControllers();
    console.log('✅ [tipizate.routes] Factura controllers loaded:', Object.keys(controllers));
    return controllers.listFactura(req, res, next);
  } catch (error) {
    console.error('❌ [tipizate.routes] Error in /factura route:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});
tipizateRouter.get('/factura/:id', (req, res, next) => getFacturaControllers().getFacturaById(req, res, next));
tipizateRouter.post('/factura', (req, res, next) => getFacturaControllers().createFactura(req, res, next));
tipizateRouter.put('/factura/:id', (req, res, next) => getFacturaControllers().updateFactura(req, res, next));
tipizateRouter.post('/factura/:id/sign', (req, res, next) => getFacturaControllers().signFactura(req, res, next));
tipizateRouter.post('/factura/:id/lock', (req, res, next) => getFacturaControllers().lockFactura(req, res, next));
tipizateRouter.get('/factura/:id/pdf', (req, res, next) => getFacturaControllers().pdfFactura(req, res, next));

// Chitanță Routes - Lazy loaded (MUST be before UBL routes)
tipizateRouter.get('/chitanta', (req, res, next) => {
  console.log('🔍 [tipizate.routes] GET /chitanta called');
  try {
    const controllers = getChitantaControllers();
    console.log('✅ [tipizate.routes] Controllers loaded:', Object.keys(controllers));
    return controllers.listChitanta(req, res, next);
  } catch (error) {
    console.error('❌ [tipizate.routes] Error in /chitanta route:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});
tipizateRouter.get('/chitanta/:id', (req, res, next) => getChitantaControllers().getChitantaById(req, res, next));
tipizateRouter.post('/chitanta', (req, res, next) => getChitantaControllers().createChitanta(req, res, next));
tipizateRouter.put('/chitanta/:id', (req, res, next) => getChitantaControllers().updateChitanta(req, res, next));
tipizateRouter.post('/chitanta/:id/sign', (req, res, next) => getChitantaControllers().signChitanta(req, res, next));
tipizateRouter.post('/chitanta/:id/lock', (req, res, next) => getChitantaControllers().lockChitanta(req, res, next));
tipizateRouter.get('/chitanta/:id/pdf', (req, res, next) => getChitantaControllers().pdfChitanta(req, res, next));

// Registru Casă Routes
tipizateRouter.get('/registru-casa', listRegistruCasa);
tipizateRouter.get('/registru-casa/:id', getRegistruCasaById);
tipizateRouter.post('/registru-casa', createRegistruCasa);
tipizateRouter.put('/registru-casa/:id', updateRegistruCasa);
tipizateRouter.post('/registru-casa/:id/sign', signRegistruCasa);
tipizateRouter.post('/registru-casa/:id/lock', lockRegistruCasa);
tipizateRouter.get('/registru-casa/:id/pdf', pdfRegistruCasa);

// Raport Gestiune Routes
tipizateRouter.get('/raport-gestiune', listRaportGestiune);
tipizateRouter.get('/raport-gestiune/:id', getRaportGestiuneById);
tipizateRouter.post('/raport-gestiune', createRaportGestiune);
tipizateRouter.put('/raport-gestiune/:id', updateRaportGestiune);
tipizateRouter.post('/raport-gestiune/:id/sign', signRaportGestiune);
tipizateRouter.post('/raport-gestiune/:id/lock', lockRaportGestiune);
tipizateRouter.get('/raport-gestiune/:id/pdf', pdfRaportGestiune);

// Raport X Routes
tipizateRouter.get('/raport-x', listRaportX);
tipizateRouter.get('/raport-x/:id', getRaportXById);
tipizateRouter.post('/raport-x', createRaportX);
tipizateRouter.put('/raport-x/:id', updateRaportX);
tipizateRouter.post('/raport-x/:id/sign', signRaportX);
tipizateRouter.post('/raport-x/:id/lock', lockRaportX);
tipizateRouter.get('/raport-x/:id/pdf', pdfRaportX);

// Raport Z Routes
tipizateRouter.get('/raport-z', listRaportZ);
tipizateRouter.get('/raport-z/:id', getRaportZById);
tipizateRouter.post('/raport-z', createRaportZ);
tipizateRouter.put('/raport-z/:id', updateRaportZ);
tipizateRouter.post('/raport-z/:id/sign', signRaportZ);
tipizateRouter.post('/raport-z/:id/lock', lockRaportZ);
tipizateRouter.get('/raport-z/:id/pdf', pdfRaportZ);

// Raport Lunar Routes
tipizateRouter.get('/raport-lunar', listRaportLunar);
tipizateRouter.get('/raport-lunar/:id', getRaportLunarById);
tipizateRouter.post('/raport-lunar', createRaportLunar);
tipizateRouter.put('/raport-lunar/:id', updateRaportLunar);
tipizateRouter.post('/raport-lunar/:id/sign', signRaportLunar);
tipizateRouter.post('/raport-lunar/:id/lock', lockRaportLunar);
tipizateRouter.get('/raport-lunar/:id/pdf', pdfRaportLunar);

// Aviz Routes
tipizateRouter.get('/aviz', listAviz);
tipizateRouter.get('/aviz/:id', getAvizById);
tipizateRouter.post('/aviz', createAviz);
tipizateRouter.put('/aviz/:id', updateAviz);
tipizateRouter.post('/aviz/:id/sign', signAviz);
tipizateRouter.post('/aviz/:id/lock', lockAviz);
tipizateRouter.get('/aviz/:id/pdf', pdfAviz);

// Proces Verbal Routes
tipizateRouter.get('/proces-verbal', listProcesVerbal);
tipizateRouter.get('/proces-verbal/:id', getProcesVerbalById);
tipizateRouter.post('/proces-verbal', createProcesVerbal);
tipizateRouter.put('/proces-verbal/:id', updateProcesVerbal);
tipizateRouter.post('/proces-verbal/:id/sign', signProcesVerbal);
tipizateRouter.post('/proces-verbal/:id/lock', lockProcesVerbal);
tipizateRouter.get('/proces-verbal/:id/pdf', pdfProcesVerbal);

// Retur Routes
tipizateRouter.get('/retur', listRetur);
tipizateRouter.get('/retur/:id', getReturById);
tipizateRouter.post('/retur', createRetur);
tipizateRouter.put('/retur/:id', updateRetur);
tipizateRouter.post('/retur/:id/sign', signRetur);
tipizateRouter.post('/retur/:id/lock', lockRetur);
tipizateRouter.get('/retur/:id/pdf', pdfRetur);

// Waste Routes
tipizateRouter.get('/waste', listWaste);
tipizateRouter.get('/waste/:id', getWasteById);
tipizateRouter.post('/waste', createWaste);
tipizateRouter.put('/waste/:id', updateWaste);
tipizateRouter.post('/waste/:id/sign', signWaste);
tipizateRouter.post('/waste/:id/lock', lockWaste);
tipizateRouter.get('/waste/:id/pdf', pdfWaste);

// PHASE S8.3 - UBL Routes for all tipizate documents (MUST be after all specific routes)
const ublTipizateRoutes = require('../ubl/ublTipizate.routes');
tipizateRouter.use('/', ublTipizateRoutes);

// Debug: Log all registered routes
console.log('📋 [tipizate.routes] Registered routes count:', tipizateRouter.stack?.length || 0);
const chitantaRoute = tipizateRouter.stack?.find(l => l.route && l.route.path === '/chitanta');
const facturaRoute = tipizateRouter.stack?.find(l => l.route && l.route.path === '/factura');
console.log(chitantaRoute ? '✅ [tipizate.routes] /chitanta route registered' : '❌ [tipizate.routes] /chitanta route NOT registered');
console.log(facturaRoute ? '✅ [tipizate.routes] /factura route registered' : '❌ [tipizate.routes] /factura route NOT registered');

module.exports = { tipizateRouter };

