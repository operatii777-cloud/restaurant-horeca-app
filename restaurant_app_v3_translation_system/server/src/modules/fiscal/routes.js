/**
 * PHASE S7.2 - Fiscalizare ANAF Routes (Enterprise)
 * PHASE S7.3 - Print Queue Integration
 * 
 * Routes for fiscal receipt generation and ANAF compliance.
 */

const express = require('express');
const router = express.Router();
const fiscalizareController = require('./controllers/fiscalizare.controller');
const fiscalController = require('./controllers/fiscal.controller');
const printQueueController = require('./controllers/printQueue.controller');
const eFacturaController = require('./controllers/eFactura.controller');

// PHASE S7.3 - Start print queue worker when module loads
const PrintQueueService = require('./services/printQueue.service');
PrintQueueService.start();

// GET fiscal configuration
router.get('/config', fiscalizareController.getFiscalConfig);

// PUT update fiscal configuration
router.put('/config', fiscalizareController.updateFiscalConfig);

// POST generate fiscal receipt
router.post('/receipt', fiscalizareController.generateReceipt);

// GET fiscal receipt by ID
router.get('/receipt/:id', fiscalizareController.getReceipt);

// GET all fiscal receipts (with filters)
router.get('/receipts', fiscalizareController.getReceipts);

// POST print receipt (to fiscal printer)
router.post('/receipt/:id/print', fiscalizareController.printReceipt);

// POST cancel receipt
router.post('/receipt/:id/cancel', fiscalizareController.cancelReceipt);

// FAZA 1.6 - Fiscal status and retry endpoints
router.get('/order/:id/status', fiscalizareController.getOrderFiscalStatus);
router.post('/order/:id/retry', fiscalizareController.retryOrderFiscalization);

// GET fiscal status (printer status) - Real status via FiscalPrinterProtocol
router.get('/status', fiscalController.getFiscalStatus.bind(fiscalController));

// GET daily Z report
router.get('/z-report', fiscalizareController.getZReport);

// POST generate Z report
router.post('/z-report', fiscalizareController.generateZReport);

// GET X report (intermediary report)
router.get('/x-report', fiscalizareController.getXReport);

// GET monthly report
router.get('/reports/monthly', fiscalizareController.getMonthlyReport);

// POST generate monthly report
router.post('/reports/monthly/generate', fiscalizareController.generateMonthlyReport);

// POST submit monthly report to ANAF
router.post('/reports/monthly/submit', fiscalizareController.submitMonthlyReport);

// POST /api/fiscal/fiscalize-order (for backward compatibility)
router.post('/fiscalize-order', fiscalController.fiscalizeOrder.bind(fiscalController));

// ========================================
// PHASE S7.3 - Print Queue Endpoints
// ========================================
router.get('/print-jobs', printQueueController.getJobs.bind(printQueueController));
router.get('/print-jobs/status', printQueueController.getStatus.bind(printQueueController));
router.get('/print-jobs/:id', printQueueController.getJobById.bind(printQueueController));
router.post('/print-jobs/:id/retry', printQueueController.retryJob.bind(printQueueController));

// ========================================
// PHASE S8.2 - E-Factura Enterprise Endpoints
// ========================================
router.post('/invoice/generate', eFacturaController.generateInvoice.bind(eFacturaController));
router.post('/invoice/:id/upload-spv', eFacturaController.uploadToSPV.bind(eFacturaController));
router.get('/invoice/:id', eFacturaController.getInvoice.bind(eFacturaController));
router.get('/invoices', eFacturaController.getInvoices.bind(eFacturaController));
router.post('/invoice/:id/cancel', eFacturaController.cancelInvoice.bind(eFacturaController));

// ========================================
// PHASE S11 - E-Factura API (for admin-vite React)
// ========================================
// Alias routes pentru compatibilitate cu admin-vite
// GET /api/fiscal/e-factura - Lista facturi (alias pentru /api/fiscal/invoices)
router.get('/e-factura', async (req, res, next) => {
  try {
    const { status, page = 1, pageSize = 50, dateFrom, dateTo } = req.query;
    
    const filters = {
      status: status && status !== 'ALL' ? status : undefined,
      startDate: dateFrom,
      endDate: dateTo,
      limit: parseInt(pageSize, 10),
      offset: (parseInt(page, 10) - 1) * parseInt(pageSize, 10)
    };
    
    // Call getInvoices with proper request object
    const mockReq = { query: filters };
    await eFacturaController.getInvoices(mockReq, res, next);
  } catch (error) {
    next(error);
  }
});

// GET /api/fiscal/e-factura/:id - Detalii factură
router.get('/e-factura/:id', async (req, res, next) => {
  return eFacturaController.getInvoice(req, res, next);
});

// GET /api/fiscal/e-factura/:id/xml - XML UBL
router.get('/e-factura/:id/xml', async (req, res, next) => {
  try {
    const { id } = req.params;
    const EFacturaService = require('../services/eFactura.service');
    const invoice = await EFacturaService.getInvoice(parseInt(id, 10));
    
    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }
    
    if (invoice.xml_content) {
      res.setHeader('Content-Type', 'application/xml');
      res.send(invoice.xml_content);
    } else {
      res.status(404).json({ success: false, error: 'XML not found' });
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/e-factura/stats - Statistici
router.get('/e-factura/stats', async (req, res) => {
  try {
    const { dbPromise } = require('../../../database');
    const db = await dbPromise;
    const { dateFrom, dateTo } = req.query;
    
    const startDate = dateFrom || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const endDate = dateTo || new Date().toISOString().split('T')[0];
    
    // Get statistics from invoices table
    const stats = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as totalInvoices,
          COUNT(CASE WHEN status = 'confirmed' OR status = 'uploaded' THEN 1 END) as acceptedCount,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejectedCount,
          COUNT(CASE WHEN status = 'generated' THEN 1 END) as pendingCount,
          COUNT(CASE WHEN spv_error IS NOT NULL THEN 1 END) as errorCount,
          0 as queueCount,
          COALESCE(SUM(CASE WHEN status = 'confirmed' OR status = 'uploaded' THEN 
            CAST(json_extract(json_data, '$.taxInclusiveAmount') AS REAL) ELSE 0 END), 0) as totalAmountAccepted,
          COALESCE(SUM(CASE WHEN status = 'rejected' THEN 
            CAST(json_extract(json_data, '$.taxInclusiveAmount') AS REAL) ELSE 0 END), 0) as totalAmountRejected
        FROM invoices
        WHERE DATE(created_at) >= DATE(?) AND DATE(created_at) <= DATE(?)
      `, [startDate, endDate], (err, row) => {
        if (err) reject(err);
        else resolve(row || {
          totalInvoices: 0,
          acceptedCount: 0,
          rejectedCount: 0,
          pendingCount: 0,
          errorCount: 0,
          queueCount: 0,
          totalAmountAccepted: 0,
          totalAmountRejected: 0
        });
      });
    });
    
    res.json({
      success: true,
      ...stats
    });
  } catch (error) {
    console.error('❌ [e-factura/stats] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      totalInvoices: 0,
      acceptedCount: 0,
      rejectedCount: 0,
      pendingCount: 0,
      errorCount: 0,
      queueCount: 0,
      totalAmountAccepted: 0,
      totalAmountRejected: 0
    });
  }
});

// GET /api/e-factura/charts - Date pentru grafice
router.get('/e-factura/charts', async (req, res) => {
  try {
    const { dbPromise } = require('../../../database');
    const db = await dbPromise;
    const { dateFrom, dateTo } = req.query;
    
    const startDate = dateFrom || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const endDate = dateTo || new Date().toISOString().split('T')[0];
    
    // Get daily invoice data for charts
    const chartData = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count,
          COUNT(CASE WHEN status = 'confirmed' OR status = 'uploaded' THEN 1 END) as accepted,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
          COALESCE(SUM(CAST(json_extract(json_data, '$.taxInclusiveAmount') AS REAL)), 0) as amount
        FROM invoices
        WHERE DATE(created_at) >= DATE(?) AND DATE(created_at) <= DATE(?)
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `, [startDate, endDate], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({
      success: true,
      data: chartData
    });
  } catch (error) {
    console.error('❌ [e-factura/charts] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      data: []
    });
  }
});

// ========================================
// PHASE S8.2 - Fiscal Archive Endpoint (for admin-vite)
// ========================================
// Alias pentru /api/fiscal/documents cu suport pentru filtre
router.get('/archive', async (req, res) => {
  try {
    const { dbPromise } = require('../../../database');
    const db = await dbPromise;
    
    const {
      document_type,
      type, // Frontend sends 'type', accept both
      status,
      date_from,
      date_to,
      search
    } = req.query;
    
    // Use 'type' if 'document_type' is not provided (frontend compatibility)
    const docType = document_type || type;
    
    // Get fiscal receipts
    // NOTE: fiscal_receipts table uses 'issue_date' not 'created_at', but we alias it as 'created_at' for frontend compatibility
    // NOTE: fiscal_receipts table doesn't have 'is_cancelled' column, so we default to 'active' status
    let receiptsQuery = `
      SELECT 
        id, order_id, receipt_number as document_number,
        issue_date as created_at, 
        0 as is_cancelled,
        'active' as status, 
        total_amount as total, vat_amount,
        payment_method, waiter_id, NULL as cashier_id,
        'receipt' as document_type,
        receipt_number as receipt_number,
        NULL as invoice_number,
        NULL as invoice_id,
        NULL as xml_content,
        NULL as spv_id,
        NULL as spv_response
      FROM fiscal_receipts
      WHERE 1=1
    `;
    const receiptsParams = [];
    
    if (docType === 'receipt') {
      // Only receipts
    } else if (docType === 'invoice') {
      receiptsQuery += ' AND 1=0'; // Exclude receipts
    }
    
    // Note: fiscal_receipts table doesn't have is_cancelled column, so status filter is ignored
    if (status && status === 'cancelled') {
      receiptsQuery += ' AND 1=0'; // No cancelled receipts in fiscal_receipts table
    }
    
    if (date_from) {
      // Convert DD/MM/YYYY to YYYY-MM-DD if needed
      let dateFrom = date_from;
      if (date_from.includes('/')) {
        const parts = date_from.split('/');
        dateFrom = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      receiptsQuery += ' AND DATE(issue_date) >= DATE(?)';
      receiptsParams.push(dateFrom);
    }
    
    if (date_to) {
      // Convert DD/MM/YYYY to YYYY-MM-DD if needed
      let dateTo = date_to;
      if (date_to.includes('/')) {
        const parts = date_to.split('/');
        dateTo = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      receiptsQuery += ' AND DATE(issue_date) <= DATE(?)';
      receiptsParams.push(dateTo);
    }
    
    if (search) {
      receiptsQuery += ' AND (receipt_number LIKE ? OR CAST(order_id AS TEXT) LIKE ?)';
      const searchTerm = `%${search}%`;
      receiptsParams.push(searchTerm, searchTerm);
    }
    
    receiptsQuery += ' ORDER BY issue_date DESC LIMIT 100';
    
    const receipts = await new Promise((resolve, reject) => {
      db.all(receiptsQuery, receiptsParams, (err, rows) => {
        if (err) {
          if (err.message.includes('no such table') || err.message.includes('no such column')) {
            return resolve([]);
          }
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
    
    // Get e-Factura invoices
    let invoicesQuery = `
      SELECT 
        id,
        id as invoice_id,
        order_id,
        invoice_number as document_number,
        invoice_number,
        created_at,
        status,
        NULL as total,
        NULL as vat_amount,
        NULL as payment_method,
        NULL as waiter_id,
        NULL as cashier_id,
        'invoice' as document_type,
        NULL as receipt_number,
        invoice_number,
        xml_content,
        spv_id,
        spv_response,
        client_name,
        client_cui
      FROM invoices
      WHERE 1=1
    `;
    const invoicesParams = [];
    
    if (docType === 'invoice') {
      // Only invoices
    } else if (docType === 'receipt') {
      invoicesQuery += ' AND 1=0'; // Exclude invoices
    }
    
    if (status) {
      invoicesQuery += ' AND status = ?';
      invoicesParams.push(status);
    }
    
    if (date_from) {
      // Convert DD/MM/YYYY to YYYY-MM-DD if needed
      let dateFrom = date_from;
      if (date_from.includes('/')) {
        const parts = date_from.split('/');
        dateFrom = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      invoicesQuery += ' AND (DATE(created_at) >= DATE(?) OR created_at IS NULL)';
      invoicesParams.push(dateFrom);
    } else {
      // If no date_from filter, include invoices with null created_at
      // (they will be shown if no date filter is applied)
    }
    
    if (date_to) {
      // Convert DD/MM/YYYY to YYYY-MM-DD if needed
      let dateTo = date_to;
      if (date_to.includes('/')) {
        const parts = date_to.split('/');
        dateTo = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      invoicesQuery += ' AND (DATE(created_at) <= DATE(?) OR created_at IS NULL)';
      invoicesParams.push(dateTo);
    } else {
      // If no date_to filter, include invoices with null created_at
      // (they will be shown if no date filter is applied)
    }
    
    if (search) {
      invoicesQuery += ' AND (invoice_number LIKE ? OR client_name LIKE ?)';
      const searchTerm = `%${search}%`;
      invoicesParams.push(searchTerm, searchTerm);
    }
    
    invoicesQuery += ' ORDER BY created_at DESC LIMIT 100';
    
    const invoices = await new Promise((resolve, reject) => {
      db.all(invoicesQuery, invoicesParams, (err, rows) => {
        if (err) {
          if (err.message.includes('no such table') || err.message.includes('no such column')) {
            return resolve([]);
          }
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
    
    // Combine and format documents
    const allDocuments = [
      ...receipts.map(r => ({
        id: r.id,
        type: 'receipt', // Frontend expects 'type'
        document_type: 'receipt', // Keep for compatibility
        number: r.receipt_number || r.document_number, // Frontend expects 'number'
        document_number: r.receipt_number || r.document_number, // Keep for compatibility
        date: r.created_at ? r.created_at.split(' ')[0] : null, // Frontend expects 'date'
        document_date: r.created_at ? r.created_at.split(' ')[0] : null, // Keep for compatibility
        value: r.total || 0, // Frontend expects 'value'
        amount: r.total || 0, // Keep for compatibility
        tax_amount: r.vat_amount || 0,
        status: r.is_cancelled ? 'cancelled' : 'issued',
        order_id: r.order_id,
        created_at: r.created_at
      })),
      ...invoices.map(inv => {
        // Try to extract total from json_data
        let total = 0;
        let taxAmount = 0;
        try {
          if (inv.json_data) {
            const jsonData = typeof inv.json_data === 'string' ? JSON.parse(inv.json_data) : inv.json_data;
            total = jsonData.taxInclusiveAmount || jsonData.total || 0;
            taxAmount = jsonData.taxSubtotals?.reduce((sum, t) => sum + t.taxAmount, 0) || 0;
          }
        } catch (e) {
          // Ignore parse errors
        }
        
        // Use current date if created_at is null
        const invoiceDate = inv.created_at || new Date().toISOString();
        
        return {
          id: inv.id || inv.invoice_id, // Use 'id' column from invoices table
          type: 'invoice', // Frontend expects 'type'
          document_type: 'invoice', // Keep for compatibility
          number: inv.invoice_number || inv.document_number, // Frontend expects 'number'
          document_number: inv.invoice_number || inv.document_number, // Keep for compatibility
          invoice_number: inv.invoice_number || inv.document_number, // Add invoice_number for printDocument
          date: invoiceDate.split(' ')[0], // Frontend expects 'date'
          document_date: invoiceDate.split(' ')[0], // Keep for compatibility
          value: total, // Frontend expects 'value'
          amount: total, // Keep for compatibility
          tax_amount: taxAmount,
          status: inv.status || 'generated',
          order_id: inv.order_id,
          client_name: inv.client_name,
          client_cui: inv.client_cui,
          spv_id: inv.spv_id,
          created_at: invoiceDate
        };
      })
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    res.json({
      success: true,
      documents: allDocuments, // Frontend expects 'documents' not 'data'
      data: allDocuments, // Also include 'data' for compatibility
      count: allDocuments.length
    });
  } catch (error) {
    console.error('❌ [fiscal/archive] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      data: []
    });
  }
});

// ========================================
// PHASE S8.2 - Download Archive Document
// ========================================
router.get('/download-archive/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { dbPromise } = require('../../../database');
    const db = await dbPromise;
    
    // First, try to find in invoices table (e-Factura)
    const invoice = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM invoices WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
    
    if (invoice) {
      // It's an e-Factura invoice - generate PDF
      try {
        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({ 
          margin: 50,
          size: 'A4'
        });
        const chunks = [];
        
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="factura_${invoice.invoice_number || id}.pdf"`);
          res.setHeader('Content-Length', pdfBuffer.length.toString());
          res.send(pdfBuffer);
        });
        
        // Parse invoice data
        let invoiceData = {};
        let total = 0;
        let taxAmount = 0;
        let subtotal = 0;
        let invoiceLines = [];
        
        if (invoice.json_data) {
          try {
            invoiceData = typeof invoice.json_data === 'string' ? JSON.parse(invoice.json_data) : invoice.json_data;
            total = invoiceData.taxInclusiveAmount || invoiceData.total || 0;
            taxAmount = invoiceData.taxSubtotals?.reduce((sum, t) => sum + t.taxAmount, 0) || 0;
            subtotal = total - taxAmount;
            invoiceLines = invoiceData.invoiceLines || invoiceData.lines || [];
          } catch (e) {
            console.error('❌ [fiscal/download-archive] Error parsing json_data:', e);
          }
        }
        
        const invoiceDate = invoice.created_at || new Date().toISOString();
        const dateStr = invoiceDate.includes(' ') 
          ? invoiceDate.split(' ')[0] 
          : invoiceDate.split('T')[0];
        
        // Header
        doc.fontSize(18).font('Helvetica-Bold').text('FACTURĂ FISCALĂ', { align: 'center' });
        doc.moveDown(0.5);
        
        // Document info
        doc.fontSize(11).font('Helvetica-Bold');
        doc.text(`Serie: ${invoice.invoice_series || 'F'}`, { continued: true });
        doc.text(`Număr: ${invoice.invoice_number || id}`, { align: 'right' });
        doc.fontSize(10).font('Helvetica');
        doc.text(`Data Emiterii: ${new Date(dateStr).toLocaleDateString('ro-RO')}`);
        doc.moveDown();
        
        // Client info
        if (invoice.client_name) {
          doc.fontSize(12).font('Helvetica-Bold').text('Date Client:');
          doc.fontSize(10).font('Helvetica');
          doc.text(`Nume: ${invoice.client_name}`);
          if (invoice.client_cui) {
            doc.text(`CUI: ${invoice.client_cui}`);
          }
          doc.moveDown();
        }
        
        // Invoice lines
        if (invoiceLines.length > 0) {
          doc.fontSize(12).font('Helvetica-Bold').text('Produse/Servicii:');
          doc.moveDown(0.3);
          
          // Table header
          doc.fontSize(9).font('Helvetica-Bold');
          doc.text('Denumire', 50, doc.y, { width: 200 });
          doc.text('Cant.', 250, doc.y, { width: 50, align: 'right' });
          doc.text('Preț', 300, doc.y, { width: 70, align: 'right' });
          doc.text('Total', 370, doc.y, { width: 80, align: 'right' });
          doc.moveDown(0.3);
          doc.moveTo(50, doc.y).lineTo(450, doc.y).stroke();
          doc.moveDown(0.3);
          
          // Table rows
          doc.fontSize(9).font('Helvetica');
          invoiceLines.forEach((line, index) => {
            if (doc.y > 700) {
              doc.addPage();
            }
            const name = line.name || line.description || line.itemName || 'Produs';
            const qty = line.quantity || line.qty || 1;
            const price = line.unitPrice || line.price || 0;
            const lineTotal = qty * price;
            
            doc.text(name.substring(0, 30), 50, doc.y, { width: 200 });
            doc.text(qty.toString(), 250, doc.y, { width: 50, align: 'right' });
            doc.text(price.toFixed(2), 300, doc.y, { width: 70, align: 'right' });
            doc.text(lineTotal.toFixed(2), 370, doc.y, { width: 80, align: 'right' });
            doc.moveDown(0.4);
          });
          
          doc.moveDown(0.5);
        }
        
        // Totals
        doc.moveTo(300, doc.y).lineTo(450, doc.y).stroke();
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica');
        if (subtotal > 0) {
          doc.text('Subtotal:', 300, doc.y, { width: 100, align: 'right', continued: true });
          doc.text(`${subtotal.toFixed(2)} RON`, { align: 'right' });
          doc.moveDown(0.2);
        }
        if (taxAmount > 0) {
          doc.text('TVA:', 300, doc.y, { width: 100, align: 'right', continued: true });
          doc.text(`${taxAmount.toFixed(2)} RON`, { align: 'right' });
          doc.moveDown(0.2);
        }
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text('TOTAL:', 300, doc.y, { width: 100, align: 'right', continued: true });
        doc.text(`${total.toFixed(2)} RON`, { align: 'right' });
        
        // Footer
        doc.moveDown(2);
        doc.fontSize(8).font('Helvetica').fillColor('gray');
        doc.text('Document generat automat din sistemul e-Factura', { align: 'center' });
        if (invoice.spv_id) {
          doc.text(`SPV ID: ${invoice.spv_id}`, { align: 'center' });
        }
        
        doc.end();
        return;
      } catch (pdfError) {
        console.error('❌ [fiscal/download-archive] Error generating PDF:', pdfError);
        // Fallback to XML or JSON
        if (invoice.xml_content) {
          res.setHeader('Content-Type', 'application/xml');
          res.setHeader('Content-Disposition', `attachment; filename="factura_${invoice.invoice_number || id}.xml"`);
          res.send(invoice.xml_content);
          return;
        } else {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Content-Disposition', `attachment; filename="factura_${invoice.invoice_number || id}.json"`);
          res.json(invoice.json_data ? JSON.parse(invoice.json_data) : invoice);
          return;
        }
      }
    }
    
    // Try to find in fiscal_receipts table
    const receipt = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM fiscal_receipts WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
    
    if (receipt) {
      // It's a fiscal receipt - return as JSON for now
      // TODO: Generate PDF if PDF generation is available
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="bon_fiscal_${receipt.receipt_number || id}.json"`);
      res.json(receipt);
      return;
    }
    
    // Document not found
    res.status(404).json({
      success: false,
      error: 'Document not found'
    });
  } catch (error) {
    console.error('❌ [fiscal/download-archive] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ========================================
// PHASE S8.2 - Invoice Details Endpoint
// ========================================
router.get('/invoice-details/:invoiceNumber', async (req, res) => {
  try {
    const { invoiceNumber } = req.params;
    const { dbPromise } = require('../../../database');
    const db = await dbPromise;
    
    // Find invoice by invoice_number
    const invoice = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM invoices WHERE invoice_number = ?', [invoiceNumber], (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }
    
    // Parse json_data if available
    let invoiceData = {};
    if (invoice.json_data) {
      try {
        invoiceData = typeof invoice.json_data === 'string' ? JSON.parse(invoice.json_data) : invoice.json_data;
      } catch (e) {
        console.error('❌ [fiscal/invoice-details] Error parsing json_data:', e);
      }
    }
    
    // Get order details if order_id exists
    let orderDetails = null;
    if (invoice.order_id) {
      orderDetails = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM orders WHERE id = ?', [invoice.order_id], (err, row) => {
          if (err) reject(err);
          else resolve(row || null);
        });
      });
      
      // Get order items if order exists
      if (orderDetails) {
        const orderItems = await new Promise((resolve, reject) => {
          db.all('SELECT * FROM order_items WHERE order_id = ?', [invoice.order_id], (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          });
        });
        orderDetails.items = orderItems;
      }
    }
    
    // Extract totals from json_data if available
    let totalAmount = invoice.total_amount || 0;
    let vatAmount = invoice.vat_amount || 0;
    let subtotal = totalAmount - vatAmount;
    
    if (invoiceData && invoiceData.taxInclusiveAmount) {
      totalAmount = invoiceData.taxInclusiveAmount;
      vatAmount = invoiceData.taxSubtotals?.reduce((sum, t) => sum + t.taxAmount, 0) || 0;
      subtotal = totalAmount - vatAmount;
    }
    
    // Format response - compatible with displayOrderDetails
    const response = {
      success: true,
      // Main fields expected by displayOrderDetails
      id: invoice.id,
      order_id: invoice.order_id,
      invoice_number: invoice.invoice_number,
      invoice_series: invoice.invoice_series,
      issue_date: invoice.created_at || new Date().toISOString(),
      status: invoice.status,
      payment_method: orderDetails?.payment_method || 'cash',
      total_amount: totalAmount,
      vat_amount: vatAmount,
      subtotal: subtotal,
      client_name: invoice.client_name,
      client_cui: invoice.client_cui,
      client_reg_com: null,
      table_number: orderDetails?.table_number || null,
      items: orderDetails?.items || [],
      // Additional invoice info
      invoice: {
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        invoice_series: invoice.invoice_series,
        status: invoice.status,
        created_at: invoice.created_at,
        client_name: invoice.client_name,
        client_cui: invoice.client_cui,
        total_amount: totalAmount,
        vat_amount: vatAmount,
        spv_id: invoice.spv_id,
        has_xml: !!invoice.xml_content,
        order_id: invoice.order_id,
        invoice_data: invoiceData
      },
      // Include order details if available
      order: orderDetails
    };
    
    res.json(response);
  } catch (error) {
    console.error('❌ [fiscal/invoice-details] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
