/**
 * ENTERPRISE MODULE - Centralized Export/PDF/Import Routes
 * 
 * Provides all export, PDF generation, and import functionality
 */

const express = require('express');
const router = express.Router();
const { dbPromise } = require('../../../database');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Helper function
async function getDb() {
  return await dbPromise;
}

// Paths pentru fonturile Times New Roman (Windows) - Suport UTF-8 complet pentru caractere românești
const FONTS = {
  regular: 'C:\\Windows\\Fonts\\times.ttf',
  bold: 'C:\\Windows\\Fonts\\timesbd.ttf',
  italic: 'C:\\Windows\\Fonts\\timesi.ttf'
};

// Verifică dacă fonturile există, altfel folosește fonturile implicite
function getFont(fontType = 'regular') {
  const fontPath = FONTS[fontType];
  if (fontPath && fs.existsSync(fontPath)) {
    return fontPath;
  }
  // Fallback la fonturile implicite PDFKit (care suportă UTF-8 dar pot avea probleme cu diacritice)
  return 'Helvetica';
}

// Sanitizează text românesc pentru PDF (păstrează diacriticele)
function sanitizeRomanianText(text) {
  if (!text) return '';
  // PDFKit suportă UTF-8, deci păstrăm diacriticele
  return String(text);
}

// ========================================
// ORDERS EXPORT
// ========================================

router.get('/orders/export', async (req, res) => {
  try {
    const { startDate, endDate, format = 'excel' } = req.query;
    const db = await getDb();
    
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];
    
    if (startDate) {
      query += ' AND DATE(timestamp) >= DATE(?)';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND DATE(timestamp) <= DATE(?)';
      params.push(endDate);
    }
    query += ' ORDER BY timestamp DESC LIMIT 1000';
    
    const orders = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Orders');
      
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Date', key: 'timestamp', width: 20 },
        { header: 'Table', key: 'table_number', width: 10 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Total', key: 'total', width: 15 },
        { header: 'Customer', key: 'customer_name', width: 25 }
      ];
      
      orders.forEach(order => worksheet.addRow(order));
      worksheet.getRow(1).font = { bold: true };
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="orders_export.xlsx"');
      await workbook.xlsx.write(res);
      res.end();
    } else {
      res.json({ success: true, data: orders, count: orders.length });
    }
  } catch (error) {
    console.error('Error exporting orders:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// INGREDIENTS EXPORT
// ========================================

router.get('/ingredients/export', async (req, res) => {
  try {
    const { format = 'excel' } = req.query;
    const db = await getDb();
    
    const ingredients = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM ingredients ORDER BY name LIMIT 5000', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Ingredients');
      
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Name', key: 'name', width: 30 },
        { header: 'Unit', key: 'unit', width: 10 },
        { header: 'Current Stock', key: 'current_stock', width: 15 },
        { header: 'Min Stock', key: 'min_stock', width: 15 },
        { header: 'Cost/Unit', key: 'cost_per_unit', width: 15 },
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Supplier', key: 'supplier', width: 25 }
      ];
      
      ingredients.forEach(ing => worksheet.addRow(ing));
      worksheet.getRow(1).font = { bold: true };
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="ingredients_export.xlsx"');
      await workbook.xlsx.write(res);
      res.end();
    } else {
      res.json({ success: true, data: ingredients, count: ingredients.length });
    }
  } catch (error) {
    console.error('Error exporting ingredients:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// MENU EXPORT
// ========================================

router.get('/menu/export', async (req, res) => {
  try {
    const { format = 'excel' } = req.query;
    const db = await getDb();
    
    const products = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM menu WHERE is_active = 1 ORDER BY category, name', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Menu');
      
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Name', key: 'name', width: 30 },
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Price', key: 'price', width: 12 },
        { header: 'Description', key: 'description', width: 40 }
      ];
      
      products.forEach(p => worksheet.addRow(p));
      worksheet.getRow(1).font = { bold: true };
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="menu_export.xlsx"');
      await workbook.xlsx.write(res);
      res.end();
    } else {
      res.json({ success: true, data: products, count: products.length });
    }
  } catch (error) {
    console.error('Error exporting menu:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// MENU PDF
// ========================================

router.get('/menu/pdf', async (req, res) => {
  try {
    const db = await getDb();
    const lang = (req.query.lang || 'ro').toLowerCase();
    
    const products = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM menu WHERE is_active = 1 ORDER BY category, name', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    const filename = lang === 'en' ? 'menu_en.pdf' : 'menu_ro.pdf';
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);
    
    // Folosește font care suportă caractere românești
    doc.font(getFont('bold'));
    const menuTitle = lang === 'en' ? 'Restaurant Menu' : 'Meniu Restaurant';
    doc.fontSize(24).fillColor('#000').text(sanitizeRomanianText(menuTitle), { align: 'center' });
    doc.moveDown();
    
    // Group by category
    const categories = {};
    products.forEach(p => {
      const category = sanitizeRomanianText(p.category || 'Altele');
      if (!categories[category]) categories[category] = [];
      categories[category].push(p);
    });
    
    Object.entries(categories).forEach(([category, items]) => {
      // Titlu categorie cu font bold
      doc.font(getFont('bold'));
      doc.fontSize(16).fillColor('#333').text(sanitizeRomanianText(category), { underline: true });
      doc.moveDown(0.5);
      
      items.forEach(item => {
        // Nume produs cu font regular
        doc.font(getFont('regular'));
        doc.fontSize(12).fillColor('#000');
        const itemName = sanitizeRomanianText(item.name || 'Produs');
        doc.text(itemName, { continued: true });
        doc.text(`  ${(item.price || 0).toFixed(2)} RON`, { align: 'right' });
        
        // Descriere cu font regular
        if (item.description) {
          doc.fontSize(10).fillColor('#666');
          doc.text(sanitizeRomanianText(item.description));
        }
        doc.moveDown(0.3);
      });
      doc.moveDown();
    });
    
    doc.end();
  } catch (error) {
    console.error('Error generating menu PDF:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// ORDER INVOICE PDF
// ========================================

router.get('/orders/:id/invoice', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    
    const order = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice_${id}.pdf"`);
    doc.pipe(res);
    
    // Folosește font care suportă caractere românești
    doc.font(getFont('bold'));
    doc.fontSize(20).fillColor('#000').text('FACTURĂ', { align: 'center' });
    doc.moveDown();
    
    doc.font(getFont('regular'));
    doc.fontSize(12);
    
    const labels = lang === 'en' 
      ? {
          orderNo: 'Order #:',
          date: 'Date:',
          table: 'Table:',
          status: 'Status:',
          customer: 'Customer:',
          phone: 'Phone:',
          items: 'Items:',
          total: 'TOTAL:'
        }
      : {
          orderNo: 'Comandă #:',
          date: 'Data:',
          table: 'Masă:',
          status: 'Status:',
          customer: 'Client:',
          phone: 'Telefon:',
          items: 'Produse:',
          total: 'TOTAL:'
        };
    
    const lang = req.query.lang || 'ro';
    doc.text(`${labels.orderNo} ${order.id}`);
    doc.text(`${labels.date} ${order.timestamp || new Date().toISOString()}`);
    doc.text(`${labels.table} ${order.table_number || 'N/A'}`);
    doc.text(`${labels.status} ${sanitizeRomanianText(order.status || '')}`);
    doc.moveDown();
    
    if (order.customer_name) {
      doc.text(`${labels.customer} ${sanitizeRomanianText(order.customer_name)}`);
    }
    if (order.customer_phone) {
      doc.text(`${labels.phone} ${order.customer_phone}`);
    }
    doc.moveDown();
    
    // Items
    doc.font(getFont('bold'));
    doc.fontSize(14).text(sanitizeRomanianText(labels.items), { underline: true });
    doc.moveDown(0.5);
    
    try {
      const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
      doc.font(getFont('regular'));
      items.forEach(item => {
        doc.fontSize(10);
        const name = sanitizeRomanianText(item.name || item.product_name || 'Produs');
        const qty = item.quantity || 1;
        const price = item.price || 0;
        doc.text(`${name} x${qty}`, { continued: true });
        doc.text(`  ${(qty * price).toFixed(2)} RON`, { align: 'right' });
      });
    } catch (e) {
      doc.text('(Produse indisponibile)');
    }
    
    doc.moveDown();
    doc.font(getFont('bold'));
    doc.fontSize(14).text(`${labels.total} ${(order.total || 0).toFixed(2)} RON`, { align: 'right' });
    
    doc.end();
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// STOCK REPORT
// ========================================

router.get('/reports/stock', async (req, res) => {
  try {
    const db = await getDb();
    
    const ingredients = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          i.*,
          CASE 
            WHEN i.current_stock <= i.min_stock THEN 'critical'
            WHEN i.current_stock <= i.min_stock * 1.5 THEN 'low'
            ELSE 'ok'
          END as stock_status
        FROM ingredients i
        ORDER BY 
          CASE WHEN i.current_stock <= i.min_stock THEN 0 ELSE 1 END,
          i.name
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    const summary = {
      total_items: ingredients.length,
      critical: ingredients.filter(i => i.stock_status === 'critical').length,
      low: ingredients.filter(i => i.stock_status === 'low').length,
      ok: ingredients.filter(i => i.stock_status === 'ok').length,
      total_value: ingredients.reduce((sum, i) => sum + (i.current_stock * (i.cost_per_unit || 0)), 0)
    };
    
    res.json({
      success: true,
      data: {
        summary,
        items: ingredients
      }
    });
  } catch (error) {
    console.error('Error generating stock report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// FISCAL QUEUE
// ========================================

router.get('/fiscal/queue', async (req, res) => {
  try {
    const db = await getDb();
    
    const queue = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM fiscal_print_queue 
        ORDER BY created_at DESC 
        LIMIT 100
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({
      success: true,
      data: queue,
      count: queue.length
    });
  } catch (error) {
    console.error('Error fetching fiscal queue:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// IMPORT TEMPLATES
// ========================================

router.get('/admin/import/templates', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        templates: [
          {
            name: 'ingredients',
            description: 'Import ingredients from Excel',
            columns: ['name', 'unit', 'current_stock', 'min_stock', 'cost_per_unit', 'category', 'supplier'],
            required: ['name', 'unit']
          },
          {
            name: 'menu',
            description: 'Import menu items from Excel',
            columns: ['name', 'category', 'price', 'description', 'is_active'],
            required: ['name', 'price']
          },
          {
            name: 'suppliers',
            description: 'Import suppliers from Excel',
            columns: ['name', 'contact_person', 'phone', 'email', 'address'],
            required: ['name']
          }
        ]
      }
    });
  } catch (error) {
    console.error('Error fetching import templates:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// SALES EXPORT (Excel)
// ========================================

router.get('/sales/excel', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const db = await getDb();
    
    const today = new Date().toISOString().split('T')[0];
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const orders = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          o.id,
          o.timestamp as order_date,
          o.table_number,
          o.status,
          o.total,
          o.payment_method,
          o.customer_name,
          o.customer_phone,
          o.platform,
          o.order_source,
          COUNT(DISTINCT oi.id) as items_count
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.status IN ('paid', 'completed', 'delivered')
          AND DATE(o.timestamp) >= DATE(?)
          AND DATE(o.timestamp) <= DATE(?)
        GROUP BY o.id
        ORDER BY o.timestamp DESC
        LIMIT 10000
      `, [startDate || monthAgo, endDate || today], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');
    
    worksheet.columns = [
      { header: 'Order ID', key: 'id', width: 10 },
      { header: 'Date', key: 'order_date', width: 20 },
      { header: 'Table', key: 'table_number', width: 10 },
      { header: 'Platform', key: 'platform', width: 15 },
      { header: 'Source', key: 'order_source', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Items', key: 'items_count', width: 10 },
      { header: 'Total', key: 'total', width: 15, style: { numFmt: '#,##0.00' } },
      { header: 'Payment', key: 'payment_method', width: 15 },
      { header: 'Customer', key: 'customer_name', width: 25 },
      { header: 'Phone', key: 'customer_phone', width: 15 }
    ];
    
    orders.forEach(order => worksheet.addRow(order));
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    };
    
    // Add summary row
    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
    worksheet.addRow({});
    worksheet.addRow({
      order_date: 'TOTAL',
      total: totalRevenue
    });
    const totalRow = worksheet.lastRow;
    totalRow.font = { bold: true };
    totalRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFD700' }
    };
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    const filename = `sales_report_${startDate || monthAgo}_${endDate || today}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting sales to Excel:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// SAGA EXPORT
// ========================================

router.get('/saga/export', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const db = await getDb();
    
    const today = new Date().toISOString().split('T')[0];
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const orders = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM orders 
        WHERE status IN ('paid', 'completed') 
        AND DATE(timestamp) >= DATE(?)
        AND DATE(timestamp) <= DATE(?)
        ORDER BY timestamp
      `, [startDate || monthAgo, endDate || today], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Generate SAGA-compatible export format
    const sagaData = orders.map(order => ({
      document_number: `FAC-${order.id}`,
      document_date: order.timestamp?.split('T')[0] || today,
      customer_name: order.customer_name || 'Client Ocazional',
      total_without_vat: Math.round((order.total || 0) / 1.21 * 100) / 100,
      vat_amount: Math.round((order.total || 0) - (order.total || 0) / 1.21 * 100) / 100,
      total_with_vat: order.total || 0,
      payment_method: order.payment_method || 'cash',
      status: order.status
    }));
    
    res.json({
      success: true,
      data: {
        export_date: new Date().toISOString(),
        period: { startDate: startDate || monthAgo, endDate: endDate || today },
        documents: sagaData,
        totals: {
          count: sagaData.length,
          total_revenue: sagaData.reduce((sum, d) => sum + d.total_with_vat, 0),
          total_vat: sagaData.reduce((sum, d) => sum + d.vat_amount, 0)
        }
      }
    });
  } catch (error) {
    console.error('Error generating SAGA export:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

