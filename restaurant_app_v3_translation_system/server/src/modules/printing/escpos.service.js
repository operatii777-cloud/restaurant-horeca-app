/**
 * ESC/POS Print Service
 * 
 * Enterprise-grade thermal printer integration
 * Supports: Epson, Star Micronics, Bixolon, Generic ESC/POS
 * 
 * Features:
 * - Network/USB/Serial printer support
 * - Print queue management
 * - Receipt template rendering
 * - Cash drawer control
 * - Kitchen ticket routing
 */

const net = require('net');
const { dbPromise } = require('../../../database');

// ESC/POS Command Constants
const ESC = '\x1B';
const GS = '\x1D';
const LF = '\x0A';
const CR = '\x0D';

const ESCPOS = {
  // Initialize printer
  INIT: ESC + '@',
  
  // Text formatting
  BOLD_ON: ESC + 'E' + '\x01',
  BOLD_OFF: ESC + 'E' + '\x00',
  UNDERLINE_ON: ESC + '-' + '\x01',
  UNDERLINE_OFF: ESC + '-' + '\x00',
  DOUBLE_HEIGHT_ON: ESC + '!' + '\x10',
  DOUBLE_WIDTH_ON: ESC + '!' + '\x20',
  DOUBLE_SIZE_ON: ESC + '!' + '\x30',
  NORMAL_SIZE: ESC + '!' + '\x00',
  
  // Alignment
  ALIGN_LEFT: ESC + 'a' + '\x00',
  ALIGN_CENTER: ESC + 'a' + '\x01',
  ALIGN_RIGHT: ESC + 'a' + '\x02',
  
  // Paper control
  CUT_PAPER: GS + 'V' + '\x00',
  CUT_PAPER_PARTIAL: GS + 'V' + '\x01',
  FEED_LINES: (n) => ESC + 'd' + String.fromCharCode(n),
  
  // Cash drawer
  OPEN_DRAWER_PIN2: ESC + 'p' + '\x00' + '\x19' + '\xFA',
  OPEN_DRAWER_PIN5: ESC + 'p' + '\x01' + '\x19' + '\xFA',
  
  // Beep
  BEEP: ESC + 'B' + '\x05' + '\x09',
  
  // QR Code (GS ( k)
  QR_MODEL: GS + '(k' + '\x04\x00' + '\x31' + '\x41' + '\x32' + '\x00',
  QR_SIZE: (size) => GS + '(k' + '\x03\x00' + '\x31' + '\x43' + String.fromCharCode(size),
  QR_ERROR: GS + '(k' + '\x03\x00' + '\x31' + '\x45' + '\x31',
  QR_STORE: (data) => {
    const len = data.length + 3;
    const pL = len % 256;
    const pH = Math.floor(len / 256);
    return GS + '(k' + String.fromCharCode(pL) + String.fromCharCode(pH) + '\x31' + '\x50' + '\x30' + data;
  },
  QR_PRINT: GS + '(k' + '\x03\x00' + '\x31' + '\x51' + '\x30',
  
  // Barcode
  BARCODE_HEIGHT: (h) => GS + 'h' + String.fromCharCode(h),
  BARCODE_WIDTH: (w) => GS + 'w' + String.fromCharCode(w),
  BARCODE_POSITION: (p) => GS + 'H' + String.fromCharCode(p),
  BARCODE_CODE128: (data) => GS + 'k' + '\x49' + String.fromCharCode(data.length) + data,
};

class ESCPOSPrinter {
  constructor(config = {}) {
    this.host = config.host || '192.168.1.100';
    this.port = config.port || 9100;
    this.timeout = config.timeout || 5000;
    this.paperWidth = config.paperWidth || 80; // 58 or 80mm
    this.encoding = config.encoding || 'utf8';
    this.socket = null;
  }

  /**
   * Connect to network printer
   */
  async connect() {
    return new Promise((resolve, reject) => {
      this.socket = new net.Socket();
      
      this.socket.setTimeout(this.timeout);
      
      this.socket.on('connect', () => {
        console.log(`✅ Connected to printer at ${this.host}:${this.port}`);
        resolve(true);
      });
      
      this.socket.on('error', (err) => {
        console.error(`❌ Printer error: ${err.message}`);
        reject(err);
      });
      
      this.socket.on('timeout', () => {
        console.error('❌ Printer connection timeout');
        this.socket.destroy();
        reject(new Error('Connection timeout'));
      });
      
      this.socket.connect(this.port, this.host);
    });
  }

  /**
   * Disconnect from printer
   */
  disconnect() {
    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
    }
  }

  /**
   * Send raw data to printer
   */
  async write(data) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected to printer'));
        return;
      }
      
      this.socket.write(data, this.encoding, (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });
  }

  /**
   * Initialize printer
   */
  async init() {
    await this.write(ESCPOS.INIT);
  }

  /**
   * Print text with formatting
   */
  async text(content, options = {}) {
    let cmd = '';
    
    // Apply formatting
    if (options.bold) cmd += ESCPOS.BOLD_ON;
    if (options.underline) cmd += ESCPOS.UNDERLINE_ON;
    if (options.doubleHeight) cmd += ESCPOS.DOUBLE_HEIGHT_ON;
    if (options.doubleWidth) cmd += ESCPOS.DOUBLE_WIDTH_ON;
    if (options.doubleSize) cmd += ESCPOS.DOUBLE_SIZE_ON;
    
    // Alignment
    if (options.align === 'center') cmd += ESCPOS.ALIGN_CENTER;
    else if (options.align === 'right') cmd += ESCPOS.ALIGN_RIGHT;
    else cmd += ESCPOS.ALIGN_LEFT;
    
    // Content
    cmd += content + LF;
    
    // Reset formatting
    cmd += ESCPOS.NORMAL_SIZE;
    cmd += ESCPOS.BOLD_OFF;
    cmd += ESCPOS.UNDERLINE_OFF;
    cmd += ESCPOS.ALIGN_LEFT;
    
    await this.write(cmd);
  }

  /**
   * Print a horizontal line
   */
  async line(char = '-') {
    const width = this.paperWidth === 80 ? 48 : 32;
    await this.text(char.repeat(width));
  }

  /**
   * Print two columns (left and right aligned)
   */
  async columns(left, right, totalWidth = null) {
    const width = totalWidth || (this.paperWidth === 80 ? 48 : 32);
    const spaces = width - left.length - right.length;
    const line = left + ' '.repeat(Math.max(1, spaces)) + right;
    await this.text(line);
  }

  /**
   * Feed paper
   */
  async feed(lines = 3) {
    await this.write(ESCPOS.FEED_LINES(lines));
  }

  /**
   * Cut paper
   */
  async cut(partial = false) {
    await this.feed(3);
    await this.write(partial ? ESCPOS.CUT_PAPER_PARTIAL : ESCPOS.CUT_PAPER);
  }

  /**
   * Open cash drawer
   */
  async openDrawer(pin = 2) {
    await this.write(pin === 5 ? ESCPOS.OPEN_DRAWER_PIN5 : ESCPOS.OPEN_DRAWER_PIN2);
  }

  /**
   * Print QR code
   */
  async qrCode(data, size = 6) {
    await this.write(ESCPOS.ALIGN_CENTER);
    await this.write(ESCPOS.QR_MODEL);
    await this.write(ESCPOS.QR_SIZE(size));
    await this.write(ESCPOS.QR_ERROR);
    await this.write(ESCPOS.QR_STORE(data));
    await this.write(ESCPOS.QR_PRINT);
    await this.write(ESCPOS.ALIGN_LEFT);
    await this.write(LF);
  }

  /**
   * Print barcode (Code 128)
   */
  async barcode(data, height = 80) {
    await this.write(ESCPOS.ALIGN_CENTER);
    await this.write(ESCPOS.BARCODE_HEIGHT(height));
    await this.write(ESCPOS.BARCODE_WIDTH(2));
    await this.write(ESCPOS.BARCODE_POSITION(2)); // Below barcode
    await this.write(ESCPOS.BARCODE_CODE128(data));
    await this.write(ESCPOS.ALIGN_LEFT);
    await this.write(LF);
  }

  /**
   * Beep
   */
  async beep() {
    await this.write(ESCPOS.BEEP);
  }
}

/**
 * Print Service - manages printers and print queue
 */
class PrintService {
  constructor() {
    this.printers = new Map();
    this.defaultPrinter = null;
  }

  /**
   * Initialize print service - load printers from database
   */
  async initialize() {
    try {
      const db = await dbPromise;
      
      const printers = await new Promise((resolve, reject) => {
        db.all('SELECT * FROM printers WHERE is_active = 1', [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
      
      for (const printer of printers) {
        this.printers.set(printer.id, {
          ...printer,
          // Normalize column names
          address: printer.ip_address ? `${printer.ip_address}:${printer.port || 9100}` : printer.address,
          paper_width: printer.paper_width || 80,
          categories: printer.print_categories ? JSON.parse(printer.print_categories) : 
                      printer.categories ? JSON.parse(printer.categories) : []
        });
        
        // Use first receipt printer as default
        if (printer.type === 'receipt' && !this.defaultPrinter) {
          this.defaultPrinter = printer.id;
        }
      }
      
      // If no receipt printer, use first available
      if (!this.defaultPrinter && printers.length > 0) {
        this.defaultPrinter = printers[0].id;
      }
      
      console.log(`✅ Print service initialized with ${printers.length} printers`);
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize print service:', error);
      return false;
    }
  }

  /**
   * Get printer instance
   */
  getPrinter(printerId) {
    const config = this.printers.get(printerId);
    if (!config) return null;
    
    if (config.connection_type === 'network') {
      const [host, port] = (config.address || '').split(':');
      return new ESCPOSPrinter({
        host: host || '192.168.1.100',
        port: parseInt(port) || 9100,
        paperWidth: config.paper_width || 80
      });
    }
    
    return null;
  }

  /**
   * Get default printer
   */
  getDefaultPrinter() {
    return this.defaultPrinter ? this.getPrinter(this.defaultPrinter) : null;
  }

  /**
   * Queue a print job
   */
  async queuePrint(printerId, documentType, content, orderId = null, priority = 0) {
    try {
      const db = await dbPromise;
      
      const result = await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO print_queue (printer_id, document_type, content, order_id, priority, status)
          VALUES (?, ?, ?, ?, ?, 'pending')
        `, [printerId, documentType, content, orderId, priority], function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        });
      });
      
      return result;
    } catch (error) {
      console.error('Failed to queue print job:', error);
      throw error;
    }
  }

  /**
   * Process print queue
   */
  async processQueue() {
    try {
      const db = await dbPromise;
      
      // Get pending jobs
      const jobs = await new Promise((resolve, reject) => {
        db.all(`
          SELECT * FROM print_queue 
          WHERE status = 'pending' 
          ORDER BY priority DESC, created_at ASC
          LIMIT 10
        `, [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
      
      for (const job of jobs) {
        await this.executePrintJob(job);
      }
      
      return jobs.length;
    } catch (error) {
      console.error('Failed to process print queue:', error);
      return 0;
    }
  }

  /**
   * Execute a print job
   */
  async executePrintJob(job) {
    const db = await dbPromise;
    const printer = this.getPrinter(job.printer_id || this.defaultPrinter);
    
    if (!printer) {
      await this.updateJobStatus(job.id, 'failed', 'Printer not found');
      return false;
    }
    
    try {
      // Update status to printing
      await this.updateJobStatus(job.id, 'printing');
      
      // Connect to printer
      await printer.connect();
      await printer.init();
      
      // Parse and execute content (ESC/POS commands or template)
      if (job.content.startsWith('{')) {
        // JSON template - render it
        const template = JSON.parse(job.content);
        await this.renderTemplate(printer, template);
      } else {
        // Raw ESC/POS commands
        await printer.write(job.content);
      }
      
      await printer.cut();
      printer.disconnect();
      
      // Update status to printed
      await this.updateJobStatus(job.id, 'printed');
      return true;
    } catch (error) {
      console.error(`Print job ${job.id} failed:`, error);
      
      // Update attempts and status
      const newAttempts = (job.attempts || 0) + 1;
      if (newAttempts >= (job.max_attempts || 3)) {
        await this.updateJobStatus(job.id, 'failed', error.message);
      } else {
        await db.run('UPDATE print_queue SET attempts = ?, status = ? WHERE id = ?', 
          [newAttempts, 'pending', job.id]);
      }
      
      printer.disconnect();
      return false;
    }
  }

  /**
   * Update job status
   */
  async updateJobStatus(jobId, status, errorMessage = null) {
    const db = await dbPromise;
    const printedAt = status === 'printed' ? new Date().toISOString() : null;
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE print_queue 
        SET status = ?, error_message = ?, printed_at = ?
        WHERE id = ?
      `, [status, errorMessage, printedAt, jobId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * Render a template to the printer
   */
  async renderTemplate(printer, template) {
    for (const element of template.elements || []) {
      switch (element.type) {
        case 'text':
          await printer.text(element.content, element.options || {});
          break;
        case 'line':
          await printer.line(element.char || '-');
          break;
        case 'columns':
          await printer.columns(element.left, element.right);
          break;
        case 'qrcode':
          await printer.qrCode(element.data, element.size || 6);
          break;
        case 'barcode':
          await printer.barcode(element.data, element.height || 80);
          break;
        case 'feed':
          await printer.feed(element.lines || 1);
          break;
        case 'drawer':
          await printer.openDrawer(element.pin || 2);
          break;
        case 'beep':
          await printer.beep();
          break;
      }
    }
  }
}

// Create singleton instance
const printService = new PrintService();

module.exports = {
  ESCPOSPrinter,
  PrintService,
  printService,
  ESCPOS
};

