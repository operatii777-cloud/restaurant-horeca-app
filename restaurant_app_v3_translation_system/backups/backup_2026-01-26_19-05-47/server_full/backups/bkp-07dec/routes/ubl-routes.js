/**
 * UBL ROUTES - API pentru generare e-Factura (XML UBL 2.1)
 * Data: 03 Decembrie 2025
 */

const express = require('express');
const router = express.Router();
const { generateUBLFromDatabase, generateInvoiceUBL } = require('../utils/ubl-generator');
const db = require('../config/database');
const fs = require('fs');
const path = require('path');

// Middleware pentru autentificare admin
const checkAdminAuth = (req, res, next) => {
  // TODO: Implementare reală autentificare
  next();
};

/**
 * POST /api/ubl/generate/:invoiceId
 * Generează XML UBL 2.1 pentru o factură existentă
 */
router.post('/generate/:invoiceId', checkAdminAuth, async (req, res) => {
  try {
    const { invoiceId } = req.params;
    
    console.log(`📄 Generating UBL for invoice ${invoiceId}...`);
    
    // Generează UBL din DB
    const xml = await generateUBLFromDatabase(invoiceId, db);
    
    // Salvează XML în directorul de export
    const exportDir = path.join(__dirname, '../ubl-exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    
    const timestamp = Date.now();
    const filename = `invoice_${invoiceId}_${timestamp}.xml`;
    const filepath = path.join(exportDir, filename);
    
    fs.writeFileSync(filepath, xml, 'utf8');
    
    console.log(`✅ UBL XML saved: ${filepath}`);
    
    res.json({
      success: true,
      message: 'UBL XML generated successfully',
      data: {
        invoiceId,
        filename,
        filepath,
        size: xml.length,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error generating UBL:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/ubl/generate-custom
 * Generează XML UBL 2.1 din date custom (nu din DB)
 */
router.post('/generate-custom', checkAdminAuth, async (req, res) => {
  try {
    const invoiceData = req.body;
    
    console.log('📄 Generating custom UBL...');
    
    // Generează UBL
    const xml = generateInvoiceUBL(invoiceData);
    
    // Salvează XML
    const exportDir = path.join(__dirname, '../ubl-exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    
    const timestamp = Date.now();
    const filename = `custom_invoice_${timestamp}.xml`;
    const filepath = path.join(exportDir, filename);
    
    fs.writeFileSync(filepath, xml, 'utf8');
    
    console.log(`✅ Custom UBL XML saved: ${filepath}`);
    
    res.json({
      success: true,
      message: 'Custom UBL XML generated successfully',
      data: {
        filename,
        filepath,
        size: xml.length,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error generating custom UBL:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/ubl/download/:invoiceId
 * Descarcă XML UBL 2.1 pentru o factură
 */
router.get('/download/:invoiceId', checkAdminAuth, async (req, res) => {
  try {
    const { invoiceId } = req.params;
    
    // Generează UBL din DB
    const xml = await generateUBLFromDatabase(invoiceId, db);
    
    // Setează headers pentru download
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename="invoice_${invoiceId}.xml"`);
    
    res.send(xml);
    
  } catch (error) {
    console.error('❌ Error downloading UBL:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/ubl/validate/:invoiceId
 * Validează datele unei facturi pentru generare UBL
 */
router.get('/validate/:invoiceId', checkAdminAuth, async (req, res) => {
  try {
    const { invoiceId } = req.params;
    
    // Verifică dacă factura există și are toate datele necesare
    const invoice = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM invoices WHERE id = ?', [invoiceId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }
    
    // Verifică datele necesare
    const errors = [];
    const warnings = [];
    
    if (!invoice.invoice_number) errors.push('Missing invoice number');
    if (!invoice.issue_date) errors.push('Missing issue date');
    if (!invoice.customer_name) errors.push('Missing customer name');
    if (!invoice.customer_cui) warnings.push('Missing customer CUI');
    
    // Verifică liniile facturii
    const lines = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM invoice_lines WHERE invoice_id = ?', [invoiceId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    if (lines.length === 0) {
      errors.push('Invoice has no lines');
    }
    
    const isValid = errors.length === 0;
    
    res.json({
      success: true,
      valid: isValid,
      errors,
      warnings,
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        issueDate: invoice.issue_date,
        customerName: invoice.customer_name,
        total: invoice.total_with_vat,
        lineCount: lines.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error validating invoice:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

