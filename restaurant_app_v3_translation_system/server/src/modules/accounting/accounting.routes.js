/**
 * ACCOUNTING MODULE v8.0 - API Routes
 * 
 * Endpoint-uri REST pentru modulul CONTABILITATE:
 * - Stock Balance Reports
 * - Product Accounting Mapping
 * - Daily Balance Reports
 * - Consumption Situation Reports
 * - Entries by VAT & Accounting Account Reports
 */

const express = require('express');
const router = express.Router();
const accountingController = require('./controllers/accounting.controller');

// ============================================================================
// STOCK BALANCE ROUTES
// ============================================================================

// POST /api/accounting/stock-balance - Generare raport balanță stocuri
router.post('/stock-balance', accountingController.getStockBalance);

// GET /api/accounting/stock-variance/:snapshotId - Detalii diferențe stoc
router.get('/stock-variance/:snapshotId', accountingController.getStockVariance);

// ============================================================================
// PRODUCT ACCOUNTING MAPPING ROUTES
// ============================================================================

// GET /api/accounting/product-mapping/:ingredientId - Obține mapare pentru ingredient
router.get('/product-mapping/:ingredientId', accountingController.getProductMapping);
// GET /api/accounting/product-mapping/:id - Alias pentru compatibilitate (acceptă și :id)
router.get('/product-mapping/:id', accountingController.getProductMapping);

// POST /api/accounting/product-mapping/update - Actualizează mapare
router.post('/product-mapping/update', accountingController.updateProductMapping);

// GET /api/accounting/product-mapping/history/:ingredientId - Istoric modificări
router.get('/product-mapping/history/:ingredientId', accountingController.getProductMappingHistory);

// ============================================================================
// DAILY BALANCE ROUTES
// ============================================================================

// POST /api/accounting/daily-balance - Generare raport balanță zilnică
router.post('/daily-balance', accountingController.getDailyBalance);

// ============================================================================
// CONSUMPTION SITUATION ROUTES (EXISTING - COMPLETED)
// ============================================================================

// POST /api/accounting/consumption-situation - Generare raport consumuri
router.post('/consumption-situation', accountingController.getConsumptionSituation);

// ============================================================================
// ENTRIES BY VAT ROUTES (EXISTING - COMPLETED)
// ============================================================================

// POST /api/accounting/entries-by-vat - Generare raport intrări după TVA
router.post('/entries-by-vat', accountingController.getEntriesByVat);

// ============================================================================
// VAT REPORT ROUTES (PHASE S6.3)
// ============================================================================

// GET /api/accounting/reports/vat - Generare raport TVA (query params: dateFrom, dateTo, locationId)
router.get('/reports/vat', accountingController.getVatReport);

// ============================================================================
// CLIENT PAYMENTS REPORT ROUTES (PHASE S6.3)
// ============================================================================

// GET /api/accounting/reports/client-payments - Generare raport plăți client (query params: dateFrom, dateTo, clientId, status)
router.get('/reports/client-payments', accountingController.getClientPaymentsReport);

// ============================================================================
// SUPPLIERS REPORT ROUTES (PHASE S6.3)
// ============================================================================

// GET /api/accounting/reports/suppliers - Generare raport furnizori (query params: dateFrom, dateTo, supplierId)
router.get('/reports/suppliers', accountingController.getSuppliersReport);

// ============================================================================
// ACCOUNTING ACCOUNTS ROUTES (PHASE S6.3)
// ============================================================================

// GET /api/accounting/accounts - Lista conturi contabile
router.get('/accounts', accountingController.getAccounts);
// GET /api/accounting/settings/accounts - Alias pentru compatibilitate
router.get('/settings/accounts', accountingController.getAccounts);

// POST /api/accounting/accounts - Creare cont contabil
router.post('/accounts', accountingController.createAccount);
// POST /api/accounting/settings/accounts - Alias pentru compatibilitate
router.post('/settings/accounts', accountingController.createAccount);

// PUT /api/accounting/accounts/:id - Actualizare cont contabil
router.put('/accounts/:id', accountingController.updateAccount);
// PUT /api/accounting/settings/accounts/:id - Alias pentru compatibilitate
router.put('/settings/accounts/:id', accountingController.updateAccount);

// DELETE /api/accounting/accounts/:id - Ștergere cont contabil
router.delete('/accounts/:id', accountingController.deleteAccount);
// DELETE /api/accounting/settings/accounts/:id - Alias pentru compatibilitate
router.delete('/settings/accounts/:id', accountingController.deleteAccount);

// ============================================================================
// ACCOUNTING EXPORT ROUTES (PHASE S6.3)
// ============================================================================

// POST /api/accounting/export/saga - Export Saga CSV
router.post('/export/saga', accountingController.exportSaga);

// POST /api/accounting/export/winmentor - Export WinMentor
router.post('/export/winmentor', accountingController.exportWinMentor);

// POST /api/accounting/export/saft - Export SAF-T
router.post('/export/saft', accountingController.exportSaft);

// ============================================================================
// ACCOUNTING PERIODS ROUTES (PHASE S6.3)
// ============================================================================

// GET /api/accounting/periods - Lista perioade contabile
router.get('/periods', accountingController.getPeriods);

// POST /api/accounting/periods - Creare perioadă contabilă
router.post('/periods', accountingController.createPeriod);

// PUT /api/accounting/periods/:id - Actualizare perioadă contabilă
router.put('/periods/:id', accountingController.updatePeriod);

// DELETE /api/accounting/periods/:id - Ștergere perioadă contabilă
router.delete('/periods/:id', accountingController.deletePeriod);

// POST /api/accounting/periods/:id/close - Închidere perioadă contabilă
router.post('/periods/:id/close', accountingController.closePeriod);

// ============================================================================
// BANK ACCOUNTS ROUTES (PHASE S6.3)
// ============================================================================

// GET /api/accounting/settings/bank-accounts - Lista conturi bancare
router.get('/settings/bank-accounts', accountingController.getBankAccounts);

// POST /api/accounting/settings/bank-accounts - Creare cont bancar
router.post('/settings/bank-accounts', accountingController.createBankAccount);

// PUT /api/accounting/settings/bank-accounts/:id - Actualizare cont bancar
router.put('/settings/bank-accounts/:id', accountingController.updateBankAccount);

// DELETE /api/accounting/settings/bank-accounts/:id - Ștergere cont bancar
router.delete('/settings/bank-accounts/:id', accountingController.deleteBankAccount);

// ============================================================================
// DIGITAL SIGNATURES ROUTES (PHASE S6.3)
// ============================================================================

// GET /api/accounting/audit/signatures - Lista semnături digitale
router.get('/audit/signatures', accountingController.getDigitalSignatures);

// GET /api/accounting/audit/signatures/:id - Detalii semnătură
router.get('/audit/signatures/:id', accountingController.getDigitalSignatureById);

// POST /api/accounting/audit/signatures/:id/verify - Verificare semnătură
router.post('/audit/signatures/:id/verify', accountingController.verifyDigitalSignature);

// ============================================================================
// ACCOUNTING PERMISSIONS ROUTES (PHASE S6.3)
// ============================================================================

// GET /api/accounting/settings/permissions - Lista permisiuni
router.get('/settings/permissions', accountingController.getPermissions);

// GET /api/accounting/settings/user-permissions - Lista permisiuni utilizatori
router.get('/settings/user-permissions', accountingController.getUserPermissions);

// GET /api/accounting/settings/users - Lista utilizatori
router.get('/settings/users', accountingController.getUsers);

// POST /api/accounting/settings/user-permissions - Asignează permisiune utilizator
router.post('/settings/user-permissions', accountingController.assignUserPermission);

// DELETE /api/accounting/settings/user-permissions/:userId/:permissionId - Elimină permisiune
router.delete('/settings/user-permissions/:userId/:permissionId', accountingController.removeUserPermission);

module.exports = router;

