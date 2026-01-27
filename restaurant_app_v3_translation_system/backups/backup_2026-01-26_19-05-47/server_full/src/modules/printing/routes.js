/**
 * Print Routes
 * 
 * API endpoints for ESC/POS printing
 */

const express = require('express');
const router = express.Router();
const { dbPromise } = require('../../../database');
const { printService, ESCPOSPrinter } = require('./escpos.service');

// Initialize print service on module load
printService.initialize().catch(err => {
  console.error('Failed to initialize print service:', err);
});

/**
 * GET /api/print/printers
 * List all configured printers
 */
router.get('/printers', async (req, res) => {
  try {
    const db = await dbPromise;
    
    const printers = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM printers ORDER BY name ASC', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({
      success: true,
      data: printers.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        connectionType: p.connection_type,
        address: p.ip_address ? `${p.ip_address}:${p.port || 9100}` : null,
        paperWidth: p.paper_width || 80,
        isActive: p.is_active === 1,
        isKitchen: p.type === 'kitchen',
        categories: p.print_categories ? JSON.parse(p.print_categories) : [],
        autoPrint: p.auto_print === 1
      }))
    });
  } catch (error) {
    console.error('Error fetching printers:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/print/printers
 * Add a new printer
 */
router.post('/printers', async (req, res) => {
  try {
    const { name, type, connection_type, address, model, driver, paper_width, is_default, is_kitchen, categories, options } = req.body;
    const db = await dbPromise;
    
    // If setting as default, unset other defaults
    if (is_default) {
      await new Promise((resolve, reject) => {
        db.run('UPDATE printers SET is_default = 0', [], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    
    const result = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO printers (name, type, connection_type, address, model, driver, paper_width, is_default, is_kitchen, categories, options)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        name, type, connection_type, address, model || null, 
        driver || 'escpos', paper_width || 80, is_default ? 1 : 0, 
        is_kitchen ? 1 : 0, 
        categories ? JSON.stringify(categories) : null,
        options ? JSON.stringify(options) : null
      ], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
    
    // Reinitialize print service
    await printService.initialize();
    
    res.status(201).json({
      success: true,
      data: { id: result.id, name, type, connection_type, address }
    });
  } catch (error) {
    console.error('Error adding printer:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/print/printers/:id
 * Update a printer
 */
router.put('/printers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, connection_type, address, model, driver, paper_width, is_default, is_kitchen, categories, options, is_active } = req.body;
    const db = await dbPromise;
    
    // If setting as default, unset other defaults
    if (is_default) {
      await new Promise((resolve, reject) => {
        db.run('UPDATE printers SET is_default = 0 WHERE id != ?', [id], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE printers 
        SET name = ?, type = ?, connection_type = ?, address = ?, model = ?, 
            driver = ?, paper_width = ?, is_default = ?, is_kitchen = ?, 
            categories = ?, options = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        name, type, connection_type, address, model, driver, paper_width,
        is_default ? 1 : 0, is_kitchen ? 1 : 0,
        categories ? JSON.stringify(categories) : null,
        options ? JSON.stringify(options) : null,
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
        id
      ], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Reinitialize print service
    await printService.initialize();
    
    res.json({ success: true, message: 'Printer updated' });
  } catch (error) {
    console.error('Error updating printer:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/print/printers/:id
 * Delete a printer
 */
router.delete('/printers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;
    
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM printers WHERE id = ?', [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Reinitialize print service
    await printService.initialize();
    
    res.json({ success: true, message: 'Printer deleted' });
  } catch (error) {
    console.error('Error deleting printer:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/print/test
 * Print a test page
 */
router.post('/test', async (req, res) => {
  try {
    const { printerId } = req.body;
    const db = await dbPromise;
    
    // Get printer config
    const printer = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM printers WHERE id = ?', [printerId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!printer) {
      return res.status(404).json({ success: false, error: 'Printer not found' });
    }
    
    // Create test template
    const testTemplate = {
      elements: [
        { type: 'text', content: '*** TEST PRINT ***', options: { align: 'center', bold: true, doubleSize: true } },
        { type: 'feed', lines: 1 },
        { type: 'line' },
        { type: 'text', content: `Printer: ${printer.name}` },
        { type: 'text', content: `Type: ${printer.type}` },
        { type: 'text', content: `Address: ${printer.address}` },
        { type: 'text', content: `Paper: ${printer.paper_width}mm` },
        { type: 'line' },
        { type: 'text', content: new Date().toLocaleString('ro-RO'), options: { align: 'center' } },
        { type: 'feed', lines: 1 },
        { type: 'text', content: 'Restaurant App Enterprise', options: { align: 'center' } },
        { type: 'qrcode', data: 'https://restaurant-app.ro', size: 4 },
        { type: 'line' },
        { type: 'text', content: '*** TEST OK ***', options: { align: 'center', bold: true } },
        { type: 'feed', lines: 2 }
      ]
    };
    
    // Queue the print job
    const job = await printService.queuePrint(
      printerId, 
      'test', 
      JSON.stringify(testTemplate),
      null,
      1 // High priority
    );
    
    res.json({
      success: true,
      message: 'Test print queued',
      jobId: job.id
    });
  } catch (error) {
    console.error('Error printing test page:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/print/receipt
 * Print a receipt for an order
 */
router.post('/receipt', async (req, res) => {
  try {
    const { orderId, printerId, template } = req.body;
    const db = await dbPromise;
    
    // Get order data
    const order = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    // Get restaurant settings
    const settings = await new Promise((resolve, reject) => {
      db.all("SELECT setting_key, setting_value FROM system_settings WHERE category = 'branding'", [], (err, rows) => {
        if (err) reject(err);
        else {
          const result = {};
          (rows || []).forEach(r => result[r.setting_key] = r.setting_value);
          resolve(result);
        }
      });
    });
    
    // Build receipt template
    const items = order.items ? JSON.parse(order.items) : [];
    const receiptTemplate = template || buildReceiptTemplate(order, items, settings);
    
    // Queue the print job
    const job = await printService.queuePrint(
      printerId || printService.defaultPrinter,
      'receipt',
      JSON.stringify(receiptTemplate),
      orderId,
      0
    );
    
    res.json({
      success: true,
      message: 'Receipt print queued',
      jobId: job.id
    });
  } catch (error) {
    console.error('Error printing receipt:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/print/kitchen
 * Print a kitchen ticket
 */
router.post('/kitchen', async (req, res) => {
  try {
    const { orderId, items, printerId, tableNumber, notes } = req.body;
    const db = await dbPromise;
    
    // Find kitchen printer (by category or default kitchen printer)
    let targetPrinter = printerId;
    
    if (!targetPrinter) {
      const kitchenPrinter = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM printers WHERE is_kitchen = 1 AND is_active = 1 LIMIT 1', [], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      targetPrinter = kitchenPrinter?.id;
    }
    
    if (!targetPrinter) {
      return res.status(400).json({ success: false, error: 'No kitchen printer configured' });
    }
    
    // Build kitchen ticket
    const kitchenTemplate = {
      elements: [
        { type: 'beep' },
        { type: 'text', content: '*** COMANDA NOUA ***', options: { align: 'center', bold: true, doubleSize: true } },
        { type: 'feed', lines: 1 },
        { type: 'line', char: '=' },
        { type: 'columns', left: 'Masa:', right: tableNumber || 'N/A' },
        { type: 'columns', left: 'Ora:', right: new Date().toLocaleTimeString('ro-RO') },
        { type: 'line', char: '=' },
        { type: 'feed', lines: 1 }
      ]
    };
    
    // Add items
    for (const item of items || []) {
      kitchenTemplate.elements.push({
        type: 'text',
        content: `${item.quantity || 1}x ${item.name || item.productName}`,
        options: { bold: true, doubleHeight: true }
      });
      
      if (item.notes || item.modifications) {
        kitchenTemplate.elements.push({
          type: 'text',
          content: `   → ${item.notes || item.modifications}`
        });
      }
    }
    
    // Add notes
    if (notes) {
      kitchenTemplate.elements.push({ type: 'feed', lines: 1 });
      kitchenTemplate.elements.push({ type: 'line' });
      kitchenTemplate.elements.push({
        type: 'text',
        content: `NOTE: ${notes}`,
        options: { bold: true }
      });
    }
    
    kitchenTemplate.elements.push({ type: 'feed', lines: 2 });
    kitchenTemplate.elements.push({ type: 'line', char: '=' });
    
    // Queue the print job
    const job = await printService.queuePrint(
      targetPrinter,
      'kitchen',
      JSON.stringify(kitchenTemplate),
      orderId,
      2 // Urgent priority
    );
    
    res.json({
      success: true,
      message: 'Kitchen ticket queued',
      jobId: job.id
    });
  } catch (error) {
    console.error('Error printing kitchen ticket:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/print/cash-drawer
 * Open cash drawer
 */
router.post('/cash-drawer', async (req, res) => {
  try {
    const { printerId, pin = 2 } = req.body;
    
    const template = {
      elements: [
        { type: 'drawer', pin }
      ]
    };
    
    const job = await printService.queuePrint(
      printerId || printService.defaultPrinter,
      'drawer',
      JSON.stringify(template),
      null,
      2 // Urgent
    );
    
    res.json({
      success: true,
      message: 'Cash drawer command queued',
      jobId: job.id
    });
  } catch (error) {
    console.error('Error opening cash drawer:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/print/queue
 * Get print queue status
 */
router.get('/queue', async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    const db = await dbPromise;
    
    let query = 'SELECT pq.*, p.name as printer_name FROM print_queue pq LEFT JOIN printers p ON pq.printer_id = p.id';
    const params = [];
    
    if (status) {
      query += ' WHERE pq.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY pq.created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const jobs = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    console.error('Error fetching print queue:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/print/queue/process
 * Manually trigger queue processing
 */
router.post('/queue/process', async (req, res) => {
  try {
    const processed = await printService.processQueue();
    
    res.json({
      success: true,
      message: `Processed ${processed} print jobs`
    });
  } catch (error) {
    console.error('Error processing queue:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Helper: Build receipt template from order
 */
function buildReceiptTemplate(order, items, settings) {
  const restaurantName = settings.restaurant_name || 'Restaurant';
  
  const template = {
    elements: [
      // Header
      { type: 'text', content: restaurantName, options: { align: 'center', bold: true, doubleSize: true } },
      { type: 'feed', lines: 1 },
      { type: 'line' },
      
      // Order info
      { type: 'columns', left: 'Bon Nr:', right: `#${order.id}` },
      { type: 'columns', left: 'Data:', right: new Date(order.timestamp || order.created_at).toLocaleDateString('ro-RO') },
      { type: 'columns', left: 'Ora:', right: new Date(order.timestamp || order.created_at).toLocaleTimeString('ro-RO') },
    ]
  };
  
  if (order.table_number) {
    template.elements.push({ type: 'columns', left: 'Masa:', right: order.table_number.toString() });
  }
  
  if (order.customer_name) {
    template.elements.push({ type: 'columns', left: 'Client:', right: order.customer_name });
  }
  
  template.elements.push({ type: 'line' });
  template.elements.push({ type: 'feed', lines: 1 });
  
  // Items
  for (const item of items) {
    const name = item.name || item.productName || 'Produs';
    const qty = item.quantity || item.qty || 1;
    const price = item.price || 0;
    const total = qty * price;
    
    template.elements.push({
      type: 'text',
      content: `${qty}x ${name}`
    });
    template.elements.push({
      type: 'columns',
      left: `   @${price.toFixed(2)} RON`,
      right: `${total.toFixed(2)} RON`
    });
  }
  
  template.elements.push({ type: 'line' });
  
  // Totals
  template.elements.push({
    type: 'columns',
    left: 'TOTAL:',
    right: `${(order.total || 0).toFixed(2)} RON`
  });
  
  if (order.payment_method) {
    template.elements.push({
      type: 'columns',
      left: 'Plata:',
      right: order.payment_method
    });
  }
  
  template.elements.push({ type: 'line' });
  template.elements.push({ type: 'feed', lines: 1 });
  
  // Footer
  template.elements.push({
    type: 'text',
    content: 'Va multumim!',
    options: { align: 'center', bold: true }
  });
  
  template.elements.push({ type: 'feed', lines: 2 });
  
  return template;
}

module.exports = router;

