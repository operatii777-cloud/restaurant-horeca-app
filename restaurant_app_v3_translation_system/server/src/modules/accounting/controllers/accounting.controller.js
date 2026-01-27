/**
 * ACCOUNTING MODULE v8.0 - Controller Layer
 * 
 * Request handlers pentru modulul CONTABILITATE
 */

const accountingService = require('../services/accounting.service');

/**
 * POST /api/accounting/stock-balance
 */
async function getStockBalance(req, res, next) {
  try {
    const { locationId, reportDate, subcategory } = req.body;
    
    if (!locationId || !reportDate) {
      return res.status(400).json({
        success: false,
        error: 'locationId and reportDate are required'
      });
    }
    
    let result;
    try {
      result = await accountingService.getStockBalance({
        locationId,
        reportDate,
        subcategory
      });
    } catch (serviceError) {
      console.warn('⚠️ Stock balance service error (returning empty data):', serviceError.message);
      // Returnează date goale dacă serviciul eșuează (ex: tabelul nu există)
      result = {
        snapshot_id: null,
        report_id: `SB-${locationId}-${reportDate.replace(/-/g, '')}`,
        report_date: reportDate,
        location_id: locationId,
        items: [],
        totals: {
          opening_value: 0,
          entries_value: 0,
          consumption_value: 0,
          waste_value: 0,
          closing_value: 0
        }
      };
    }
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in getStockBalance:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * GET /api/accounting/stock-variance/:snapshotId
 */
async function getStockVariance(req, res, next) {
  try {
    const { snapshotId } = req.params;
    
    if (!snapshotId) {
      return res.status(400).json({
        success: false,
        error: 'snapshotId is required'
      });
    }
    
    const result = await accountingService.getStockVariance(snapshotId);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in getStockVariance:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * GET /api/accounting/product-mapping/:ingredientId
 * GET /api/accounting/product-mapping/:id (alias)
 */
async function getProductMapping(req, res, next) {
  try {
    const ingredientId = req.params.ingredientId || req.params.id;
    
    if (!ingredientId) {
      return res.status(400).json({
        success: false,
        error: 'ingredientId is required'
      });
    }
    
    const result = await accountingService.getProductMapping(ingredientId);
    
    res.json({
      success: true,
      data: result || null
    });
  } catch (error) {
    console.error('Error in getProductMapping:', error);
    // Dacă tabela nu există, returnează null în loc de eroare
    if (error.message.includes('no such table')) {
      return res.json({
        success: true,
        data: null
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * POST /api/accounting/product-mapping/update
 */
async function updateProductMapping(req, res, next) {
  try {
    const {
      ingredient_id,
      stock_account_id,
      consumption_account_id,
      entry_account_id,
      cogs_account_id,
      sub_account_code,
      valuation_method,
      change_reason,
      modified_by
    } = req.body;
    
    if (!ingredient_id || !stock_account_id || !consumption_account_id) {
      return res.status(400).json({
        success: false,
        error: 'ingredient_id, stock_account_id, and consumption_account_id are required'
      });
    }
    
    const result = await accountingService.updateProductMapping({
      ingredient_id,
      stock_account_id,
      consumption_account_id,
      entry_account_id,
      cogs_account_id,
      sub_account_code,
      valuation_method: valuation_method || 'weighted_average',
      change_reason,
      modified_by: modified_by || req.user?.id || 1
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in updateProductMapping:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * GET /api/accounting/product-mapping/history/:ingredientId
 */
async function getProductMappingHistory(req, res, next) {
  try {
    const ingredientId = req.params.ingredientId || req.params.id;
    
    if (!ingredientId) {
      return res.status(400).json({
        success: false,
        error: 'ingredientId is required'
      });
    }
    
    const result = await accountingService.getProductMappingHistory(ingredientId);
    
    res.json({
      success: true,
      data: result || []
    });
  } catch (error) {
    console.error('Error in getProductMappingHistory:', error);
    // Dacă tabela nu există, returnează array gol
    if (error.message.includes('no such table')) {
      return res.json({
        success: true,
        data: []
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * POST /api/accounting/daily-balance
 */
async function getDailyBalance(req, res, next) {
  try {
    const { locationId, reportDate } = req.body;
    
    if (!locationId || !reportDate) {
      return res.status(400).json({
        success: false,
        error: 'locationId and reportDate are required'
      });
    }
    
    const result = await accountingService.getDailyBalance({
      locationId,
      reportDate
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in getDailyBalance:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * POST /api/accounting/consumption-situation
 */
async function getConsumptionSituation(req, res, next) {
  try {
    const { locationId, periodStart, periodEnd } = req.body;
    
    if (!periodStart || !periodEnd) {
      return res.status(400).json({
        success: false,
        error: 'periodStart and periodEnd are required'
      });
    }
    
    let result;
    try {
      result = await accountingService.getConsumptionSituation({
        locationId,
        periodStart,
        periodEnd
      });
    } catch (serviceError) {
      console.warn('⚠️ Consumption situation service error (returning empty data):', serviceError.message);
      // Returnează date goale dacă serviciul eșuează
      result = {
        items: [],
        totals: {
          opening_value: 0,
          purchases_value: 0,
          available_value: 0,
          consumption_value: 0,
          closing_value: 0
        },
        average_consumption_percentage: 0,
        total_dishes_sold: 0
      };
    }
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in getConsumptionSituation:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * POST /api/accounting/entries-by-vat
 */
async function getEntriesByVat(req, res, next) {
  try {
    const { locationId, periodStart, periodEnd } = req.body;
    
    if (!periodStart || !periodEnd) {
      return res.status(400).json({
        success: false,
        error: 'periodStart and periodEnd are required'
      });
    }
    
    let result;
    try {
      result = await accountingService.getEntriesByVat({
        locationId,
        periodStart,
        periodEnd
      });
    } catch (serviceError) {
      console.warn('⚠️ Entries by VAT service error (returning empty data):', serviceError.message);
      // Returnează date goale dacă serviciul eșuează
      result = {
        vat_summary: [],
        entries_by_account: [],
        totals: {
          total_base_value: 0,
          total_vat_value: 0,
          total_with_vat: 0
        }
      };
    }
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in getEntriesByVat:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * GET /api/accounting/reports/vat
 */
async function getVatReport(req, res, next) {
  try {
    // GET request - parametrii din query string
    const { locationId, dateFrom, dateTo } = req.query;
    
    if (!dateFrom || !dateTo) {
      return res.status(400).json({
        success: false,
        error: 'dateFrom and dateTo are required'
      });
    }
    
    // TODO: Implement VAT report logic
    res.json({
      success: true,
      data: {
        period: {
          from: dateFrom,
          to: dateTo
        },
        vatToPay: {
          total: 0,
          vat9: { base: 0, amount: 0 },
          vat19: { base: 0, amount: 0 },
          vat24: { base: 0, amount: 0 }
        },
        vatDeductible: {
          total: 0,
          vat9: { base: 0, amount: 0 },
          vat19: { base: 0, amount: 0 },
          vat24: { base: 0, amount: 0 }
        },
        reconciliation: {
          netVatToPay: 0,
          status: 'ok'
        },
        breakdown: []
      }
    });
  } catch (error) {
    console.error('Error in getVatReport:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * GET /api/accounting/reports/client-payments
 */
async function getClientPaymentsReport(req, res, next) {
  try {
    // GET request - parametrii din query string
    const { locationId, dateFrom, dateTo, clientId, status } = req.query;
    
    if (!dateFrom || !dateTo) {
      return res.status(400).json({
        success: false,
        error: 'dateFrom and dateTo are required'
      });
    }
    
    // TODO: Implement client payments report logic
    res.json({
      success: true,
      data: {
        period: {
          from: dateFrom,
          to: dateTo
        },
        summary: {
          totalPaid: 0,
          totalPending: 0,
          totalOverdue: 0,
          totalInvoices: 0
        },
        payments: [],
        aging: {
          current: 0,
          days30: 0,
          days60: 0,
          days90: 0,
          over90: 0
        }
      }
    });
  } catch (error) {
    console.error('Error in getClientPaymentsReport:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * GET /api/accounting/reports/suppliers
 */
async function getSuppliersReport(req, res, next) {
  try {
    // GET request - parametrii din query string
    const { locationId, dateFrom, dateTo, supplierId } = req.query;
    
    if (!dateFrom || !dateTo) {
      return res.status(400).json({
        success: false,
        error: 'dateFrom and dateTo are required'
      });
    }
    
    // TODO: Implement suppliers report logic
    res.json({
      success: true,
      data: {
        period: {
          from: dateFrom,
          to: dateTo
        },
        summary: {
          totalSuppliers: 0,
          totalDebt: 0,
          averagePrice: 0
        },
        suppliers: [],
        priceAnalysis: []
      }
    });
  } catch (error) {
    console.error('Error in getSuppliersReport:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * GET /api/accounting/accounts
 * GET /api/accounting/settings/accounts (alias)
 */
async function getAccounts(req, res, next) {
  try {
    const { dbPromise } = require('../../../../database');
    const db = await dbPromise;
    
    const accounts = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          id,
          account_code as accountCode,
          account_name as accountName,
          account_type as accountType,
          parent_account_id as parentAccountId,
          is_active as isActive,
          description,
          created_at as createdAt,
          updated_at as updatedAt
        FROM accounting_accounts
        ORDER BY account_code ASC
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({
      success: true,
      data: accounts
    });
  } catch (error) {
    console.error('Error in getAccounts:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * POST /api/accounting/accounts
 * POST /api/accounting/settings/accounts (alias)
 */
async function createAccount(req, res, next) {
  try {
    const { accountCode, accountName, accountType, parentAccountId, isActive, description } = req.body;
    
    if (!accountCode || !accountName || !accountType) {
      return res.status(400).json({
        success: false,
        error: 'accountCode, accountName, and accountType are required'
      });
    }
    
    const { dbPromise } = require('../../../../database');
    const db = await dbPromise;
    
    const result = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO accounting_accounts 
        (account_code, account_name, account_type, parent_account_id, is_active, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        accountCode,
        accountName,
        accountType,
        parentAccountId || null,
        isActive !== undefined ? (isActive ? 1 : 0) : 1,
        description || null
      ], function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
    
    res.status(201).json({
      success: true,
      data: { id: result.lastID }
    });
  } catch (error) {
    console.error('Error in createAccount:', error);
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(400).json({
        success: false,
        error: 'Codul contului există deja'
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * PUT /api/accounting/accounts/:id
 * PUT /api/accounting/settings/accounts/:id (alias)
 */
async function updateAccount(req, res, next) {
  try {
    const { id } = req.params;
    const { accountCode, accountName, accountType, parentAccountId, isActive, description } = req.body;
    
    const { dbPromise } = require('../../../../database');
    const db = await dbPromise;
    
    const fields = [];
    const values = [];
    
    if (accountCode !== undefined) {
      fields.push('account_code = ?');
      values.push(accountCode);
    }
    if (accountName !== undefined) {
      fields.push('account_name = ?');
      values.push(accountName);
    }
    if (accountType !== undefined) {
      fields.push('account_type = ?');
      values.push(accountType);
    }
    if (parentAccountId !== undefined) {
      fields.push('parent_account_id = ?');
      values.push(parentAccountId || null);
    }
    if (isActive !== undefined) {
      fields.push('is_active = ?');
      values.push(isActive ? 1 : 0);
    }
    if (description !== undefined) {
      fields.push('description = ?');
      values.push(description || null);
    }
    
    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    const result = await new Promise((resolve, reject) => {
      db.run(`
        UPDATE accounting_accounts
        SET ${fields.join(', ')}
        WHERE id = ?
      `, values, function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Contul nu a fost găsit'
      });
    }
    
    res.json({
      success: true,
      data: { id: parseInt(id) }
    });
  } catch (error) {
    console.error('Error in updateAccount:', error);
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(400).json({
        success: false,
        error: 'Codul contului există deja'
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * DELETE /api/accounting/accounts/:id
 * DELETE /api/accounting/settings/accounts/:id (alias)
 */
async function deleteAccount(req, res, next) {
  try {
    const { id } = req.params;
    
    const { dbPromise } = require('../../../../database');
    const db = await dbPromise;
    
    // Verifică dacă contul este folosit în mapări
    const usedInMappings = await new Promise((resolve, reject) => {
      db.get(`
        SELECT COUNT(*) as count FROM product_accounting_mapping
        WHERE stock_account_id = ? OR consumption_account_id = ? 
           OR entry_account_id = ? OR cogs_account_id = ?
      `, [id, id, id, id], (err, row) => {
        if (err) reject(err);
        else resolve(row?.count || 0);
      });
    });
    
    if (usedInMappings > 0) {
      return res.status(400).json({
        success: false,
        error: 'Contul nu poate fi șters deoarece este folosit în mapări de produse'
      });
    }
    
    const result = await new Promise((resolve, reject) => {
      db.run('DELETE FROM accounting_accounts WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Contul nu a fost găsit'
      });
    }
    
    res.json({
      success: true,
      data: { id: parseInt(id) }
    });
  } catch (error) {
    console.error('Error in deleteAccount:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * POST /api/accounting/export/saga
 */
async function exportSaga(req, res, next) {
  try {
    // TODO: Implement Saga export logic
    res.json({
      success: true,
      data: { file: 'saga-export.csv' }
    });
  } catch (error) {
    console.error('Error in exportSaga:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * POST /api/accounting/export/winmentor
 */
async function exportWinMentor(req, res, next) {
  try {
    // TODO: Implement WinMentor export logic
    res.json({
      success: true,
      data: { file: 'winmentor-export.csv' }
    });
  } catch (error) {
    console.error('Error in exportWinMentor:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * POST /api/accounting/export/saft
 */
async function exportSaft(req, res, next) {
  try {
    // TODO: Implement SAF-T export logic
    res.json({
      success: true,
      data: { file: 'saft-export.xml' }
    });
  } catch (error) {
    console.error('Error in exportSaft:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * GET /api/accounting/periods
 */
async function getPeriods(req, res, next) {
  try {
    // TODO: Implement get periods logic
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('Error in getPeriods:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * POST /api/accounting/periods
 */
async function createPeriod(req, res, next) {
  try {
    // TODO: Implement create period logic
    res.json({
      success: true,
      data: { id: 1 }
    });
  } catch (error) {
    console.error('Error in createPeriod:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * PUT /api/accounting/periods/:id
 */
async function updatePeriod(req, res, next) {
  try {
    // TODO: Implement update period logic
    res.json({
      success: true,
      data: { id: parseInt(req.params.id) }
    });
  } catch (error) {
    console.error('Error in updatePeriod:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * DELETE /api/accounting/periods/:id
 */
async function deletePeriod(req, res, next) {
  try {
    // TODO: Implement delete period logic
    res.json({
      success: true
    });
  } catch (error) {
    console.error('Error in deletePeriod:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * POST /api/accounting/periods/:id/close
 */
async function closePeriod(req, res, next) {
  try {
    // TODO: Implement close period logic
    res.json({
      success: true,
      data: { id: parseInt(req.params.id), status: 'closed' }
    });
  } catch (error) {
    console.error('Error in closePeriod:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * BANK ACCOUNTS ROUTES
 */

/**
 * GET /api/accounting/settings/bank-accounts
 */
async function getBankAccounts(req, res, next) {
  try {
    const { dbPromise } = require('../../../../database');
    const db = await dbPromise;
    
    const accounts = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          id,
          bank_name as bankName,
          account_number as accountNumber,
          account_holder as accountHolder,
          iban,
          swift_code as swiftCode,
          currency,
          account_type as accountType,
          is_active as isActive,
          opening_balance as openingBalance,
          current_balance as currentBalance,
          notes,
          created_at as createdAt,
          updated_at as updatedAt
        FROM bank_accounts
        ORDER BY bank_name ASC, account_number ASC
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({
      success: true,
      data: accounts
    });
  } catch (error) {
    console.error('Error in getBankAccounts:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * POST /api/accounting/settings/bank-accounts
 */
async function createBankAccount(req, res, next) {
  try {
    const {
      bankName,
      accountNumber,
      accountHolder,
      iban,
      swiftCode,
      currency,
      accountType,
      isActive,
      openingBalance,
      currentBalance,
      notes
    } = req.body;
    
    if (!bankName || !accountNumber) {
      return res.status(400).json({
        success: false,
        error: 'bankName and accountNumber are required'
      });
    }
    
    const { dbPromise } = require('../../../../database');
    const db = await dbPromise;
    
    const result = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO bank_accounts 
        (bank_name, account_number, account_holder, iban, swift_code, currency, account_type, is_active, opening_balance, current_balance, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        bankName,
        accountNumber,
        accountHolder || null,
        iban || null,
        swiftCode || null,
        currency || 'RON',
        accountType || 'current',
        isActive !== undefined ? (isActive ? 1 : 0) : 1,
        openingBalance || 0,
        currentBalance || openingBalance || 0,
        notes || null
      ], function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
    
    res.status(201).json({
      success: true,
      data: { id: result.lastID }
    });
  } catch (error) {
    console.error('Error in createBankAccount:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * PUT /api/accounting/settings/bank-accounts/:id
 */
async function updateBankAccount(req, res, next) {
  try {
    const { id } = req.params;
    const {
      bankName,
      accountNumber,
      accountHolder,
      iban,
      swiftCode,
      currency,
      accountType,
      isActive,
      openingBalance,
      currentBalance,
      notes
    } = req.body;
    
    const { dbPromise } = require('../../../../database');
    const db = await dbPromise;
    
    const fields = [];
    const values = [];
    
    if (bankName !== undefined) {
      fields.push('bank_name = ?');
      values.push(bankName);
    }
    if (accountNumber !== undefined) {
      fields.push('account_number = ?');
      values.push(accountNumber);
    }
    if (accountHolder !== undefined) {
      fields.push('account_holder = ?');
      values.push(accountHolder || null);
    }
    if (iban !== undefined) {
      fields.push('iban = ?');
      values.push(iban || null);
    }
    if (swiftCode !== undefined) {
      fields.push('swift_code = ?');
      values.push(swiftCode || null);
    }
    if (currency !== undefined) {
      fields.push('currency = ?');
      values.push(currency);
    }
    if (accountType !== undefined) {
      fields.push('account_type = ?');
      values.push(accountType);
    }
    if (isActive !== undefined) {
      fields.push('is_active = ?');
      values.push(isActive ? 1 : 0);
    }
    if (openingBalance !== undefined) {
      fields.push('opening_balance = ?');
      values.push(openingBalance);
    }
    if (currentBalance !== undefined) {
      fields.push('current_balance = ?');
      values.push(currentBalance);
    }
    if (notes !== undefined) {
      fields.push('notes = ?');
      values.push(notes || null);
    }
    
    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    const result = await new Promise((resolve, reject) => {
      db.run(`
        UPDATE bank_accounts
        SET ${fields.join(', ')}
        WHERE id = ?
      `, values, function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Contul bancar nu a fost găsit'
      });
    }
    
    res.json({
      success: true,
      data: { id: parseInt(id) }
    });
  } catch (error) {
    console.error('Error in updateBankAccount:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * DELETE /api/accounting/settings/bank-accounts/:id
 */
async function deleteBankAccount(req, res, next) {
  try {
    const { id } = req.params;
    
    const { dbPromise } = require('../../../../database');
    const db = await dbPromise;
    
    const result = await new Promise((resolve, reject) => {
      db.run('DELETE FROM bank_accounts WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Contul bancar nu a fost găsit'
      });
    }
    
    res.json({
      success: true,
      data: { id: parseInt(id) }
    });
  } catch (error) {
    console.error('Error in deleteBankAccount:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * GET /api/accounting/audit/signatures
 * Lista semnături digitale
 */
async function getDigitalSignatures(req, res, next) {
  try {
    const signatures = await accountingService.getDigitalSignatures();
    res.json({
      success: true,
      data: signatures
    });
  } catch (error) {
    console.error('Error in getDigitalSignatures:', error);
    if (error.message.includes('no such table')) {
      return res.json({
        success: true,
        data: []
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * GET /api/accounting/audit/signatures/:id
 * Detalii semnătură digitală
 */
async function getDigitalSignatureById(req, res, next) {
  try {
    const { id } = req.params;
    const signature = await accountingService.getDigitalSignatureById(parseInt(id));
    if (!signature) {
      return res.status(404).json({
        success: false,
        error: 'Semnătură nu a fost găsită'
      });
    }
    res.json({
      success: true,
      data: signature
    });
  } catch (error) {
    console.error('Error in getDigitalSignatureById:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * POST /api/accounting/audit/signatures/:id/verify
 * Verificare semnătură digitală
 */
async function verifyDigitalSignature(req, res, next) {
  try {
    const { id } = req.params;
    const result = await accountingService.verifyDigitalSignature(parseInt(id));
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in verifyDigitalSignature:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * GET /api/accounting/settings/permissions
 * Lista permisiuni contabilitate
 */
async function getPermissions(req, res, next) {
  try {
    const permissions = await accountingService.getPermissions();
    res.json({
      success: true,
      data: permissions
    });
  } catch (error) {
    console.error('Error in getPermissions:', error);
    if (error.message.includes('no such table')) {
      return res.json({
        success: true,
        data: []
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * GET /api/accounting/settings/user-permissions
 * Lista permisiuni utilizatori
 */
async function getUserPermissions(req, res, next) {
  try {
    const userPermissions = await accountingService.getUserPermissions();
    res.json({
      success: true,
      data: userPermissions
    });
  } catch (error) {
    console.error('Error in getUserPermissions:', error);
    if (error.message.includes('no such table')) {
      return res.json({
        success: true,
        data: []
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * GET /api/accounting/settings/users
 * Lista utilizatori
 */
async function getUsers(req, res, next) {
  try {
    const users = await accountingService.getUsers();
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error in getUsers:', error);
    if (error.message.includes('no such table')) {
      return res.json({
        success: true,
        data: []
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * POST /api/accounting/settings/user-permissions
 * Asignează permisiune utilizator
 */
async function assignUserPermission(req, res, next) {
  try {
    const { user_id, permission_id } = req.body;
    if (!user_id || !permission_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id și permission_id sunt obligatorii'
      });
    }
    const result = await accountingService.assignUserPermission(parseInt(user_id), parseInt(permission_id));
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in assignUserPermission:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * DELETE /api/accounting/settings/user-permissions/:userId/:permissionId
 * Elimină permisiune utilizator
 */
async function removeUserPermission(req, res, next) {
  try {
    const { userId, permissionId } = req.params;
    await accountingService.removeUserPermission(parseInt(userId), parseInt(permissionId));
    res.json({
      success: true,
      message: 'Permisiune eliminată cu succes'
    });
  } catch (error) {
    console.error('Error in removeUserPermission:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = {
  getStockBalance,
  getStockVariance,
  getProductMapping,
  updateProductMapping,
  getProductMappingHistory,
  getDailyBalance,
  getConsumptionSituation,
  getEntriesByVat,
  getVatReport,
  getClientPaymentsReport,
  getSuppliersReport,
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  exportSaga,
  exportWinMentor,
  exportSaft,
  getPeriods,
  createPeriod,
  updatePeriod,
  deletePeriod,
  closePeriod,
  getBankAccounts,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  getDigitalSignatures,
  getDigitalSignatureById,
  verifyDigitalSignature,
  getPermissions,
  getUserPermissions,
  getUsers,
  assignUserPermission,
  removeUserPermission
};

