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
const {
  listFactura,
  getFacturaById,
  createFactura,
  updateFactura,
  signFactura,
  lockFactura,
  pdfFactura,
} = require('../controllers/factura.controller');

const {
  listChitanta,
  getChitantaById,
  createChitanta,
  updateChitanta,
  signChitanta,
  lockChitanta,
  pdfChitanta,
} = require('../controllers/chitanta.controller');

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

const tipizateRouter = express.Router();

// NIR Routes
tipizateRouter.get('/nir', listNir);
tipizateRouter.get('/nir/:id', getNirById);
tipizateRouter.post('/nir', createNir);
tipizateRouter.put('/nir/:id', updateNir);
tipizateRouter.post('/nir/:id/sign', signNir);
tipizateRouter.post('/nir/:id/lock', lockNir);
tipizateRouter.get('/nir/:id/pdf', pdfNir);

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

// Factură Routes
tipizateRouter.get('/factura', listFactura);
tipizateRouter.get('/factura/:id', getFacturaById);
tipizateRouter.post('/factura', createFactura);
tipizateRouter.put('/factura/:id', updateFactura);
tipizateRouter.post('/factura/:id/sign', signFactura);
tipizateRouter.post('/factura/:id/lock', lockFactura);
tipizateRouter.get('/factura/:id/pdf', pdfFactura);

// Chitanță Routes
tipizateRouter.get('/chitanta', listChitanta);
tipizateRouter.get('/chitanta/:id', getChitantaById);
tipizateRouter.post('/chitanta', createChitanta);
tipizateRouter.put('/chitanta/:id', updateChitanta);
tipizateRouter.post('/chitanta/:id/sign', signChitanta);
tipizateRouter.post('/chitanta/:id/lock', lockChitanta);
tipizateRouter.get('/chitanta/:id/pdf', pdfChitanta);

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

// PHASE S8.3 - UBL Routes for all tipizate documents
const ublTipizateRoutes = require('../ubl/ublTipizate.routes');
tipizateRouter.use('/', ublTipizateRoutes);

module.exports = { tipizateRouter };

