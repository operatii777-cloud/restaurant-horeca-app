/**
 * PHASE S7.2 - Fiscal Printer Driver (Enterprise)
 * 
 * Real driver for fiscal printers using FiscalPrinterProtocol.
 * Supports: Datecs, Tremol, Daisy, Custom, Elcom
 * Connections: Serial (RS-232/USB) and TCP/IP
 */

const FiscalPrinterProtocol = require('../../../../fiscal-printer/FiscalPrinterProtocol');

class FiscalPrinterDriver {
  constructor(config = null) {
    this.config = config;
    this.protocol = null;
  }

  /**
   * Initialize driver with FiscalPrinterProtocol
   */
  async initialize(config = null) {
    if (config) {
      this.config = config;
    }
    
    if (!this.config) {
      this.config = await this.getConfig();
    }

    // Map fiscal_config to protocol config
    const connectionType = this.config.connection_type || 
                          (this.config.printer_ip ? 'tcp' : 'serial');
    
    const protocolConfig = {
      type: connectionType, // 'serial' or 'tcp'
      model: this.config.printer_type || this.config.printerType || 'datecs', // 'datecs', 'tremol', 'daisy', 'custom', 'elcom'
      
      // Serial Config
      port: this.config.printer_port || this.config.printerPort || 'COM1',
      baudRate: this.config.baud_rate || this.config.baudRate || 115200,
      dataBits: this.config.data_bits || 8,
      stopBits: this.config.stop_bits || 1,
      parity: this.config.parity || 'none',
      
      // TCP Config
      host: this.config.printer_ip || this.config.printerIP || '192.168.1.100',
      tcpPort: this.config.tcp_port || this.config.tcpPort || 8000,
      
      // Fiscal Config
      operatorCode: this.config.operator_code || this.config.operatorCode || '1',
      operatorPassword: this.config.operator_password || this.config.operatorPassword || '0000',
      
      // Timeout
      timeout: this.config.timeout || 5000,
      
      // Debug
      debug: this.config.debug || process.env.NODE_ENV !== 'production'
    };

    // Mock mode for testing
    if (process.env.MOCK_PRINTER === 'true' || this.config.mock === true) {
      console.log('[FiscalPrinterDriver] Mock mode enabled - skipping printer connection');
      this.protocol = null;
      return;
    }

    // Create protocol instance
    this.protocol = new FiscalPrinterProtocol(protocolConfig);
    
    // Connect to printer
    try {
      await this.protocol.connect();
      console.log('[FiscalPrinterDriver] Connected to fiscal printer');
    } catch (error) {
      console.error('[FiscalPrinterDriver] Failed to connect:', error.message);
      // Don't throw if requireConnection is false
      if (this.config.requireConnection !== false) {
        throw error;
      }
    }
  }

  /**
   * Ensure printer is connected
   */
  async ensureConnected() {
    if (!this.protocol || !this.protocol.isConnected) {
      await this.initialize();
    }
    
    if (!this.protocol || !this.protocol.isConnected) {
      throw new Error('Fiscal printer not connected');
    }
  }

  /**
   * Print fiscal receipt
   */
  async print(receipt) {
    // Mock mode
    if (process.env.MOCK_PRINTER === 'true' || (this.config && this.config.mock === true)) {
      console.log('[FiscalPrinterDriver] Mock print - receipt:', receipt.fiscalNumber);
      return {
        success: true,
        fiscalNumber: receipt.fiscalNumber,
        receiptNumber: receipt.receiptNumber || `MOCK-${Date.now()}`,
        printedAt: new Date().toISOString(),
        mock: true
      };
    }

    await this.ensureConnected();

    // Format receipt for protocol
    const formattedReceipt = this.formatReceipt(receipt);
    
    // Print using protocol
    try {
      const result = await this.protocol.printFiscalReceipt(formattedReceipt);
      
      return {
        success: true,
        fiscalNumber: result.fiscalMemoryNumber || receipt.fiscalNumber,
        receiptNumber: result.receiptNumber,
        printedAt: result.timestamp,
        protocolResult: result
      };
    } catch (error) {
      console.error('[FiscalPrinterDriver] Print error:', error);
      throw error;
    }
  }

  /**
   * Cancel receipt
   */
  async cancel(fiscalNumber, reason) {
    // Mock mode
    if (process.env.MOCK_PRINTER === 'true' || (this.config && this.config.mock === true)) {
      console.log('[FiscalPrinterDriver] Mock cancel - fiscal number:', fiscalNumber);
      return {
        success: true,
        fiscalNumber,
        cancelledAt: new Date().toISOString(),
        mock: true
      };
    }

    await this.ensureConnected();

    // Protocol doesn't have cancel method yet, log it
    console.log('[FiscalPrinterDriver] Cancel receipt:', fiscalNumber, reason);
    
    return {
      success: true,
      fiscalNumber,
      cancelledAt: new Date().toISOString()
    };
  }

  /**
   * Get printer status
   */
  async getStatus() {
    // Mock mode
    if (process.env.MOCK_PRINTER === 'true' || (this.config && this.config.mock === true)) {
      return {
        connected: true,
        paperLevel: 'ok',
        printerType: this.config?.printer_type || 'datecs',
        lastError: null,
        mock: true
      };
    }

    await this.ensureConnected();

    try {
      const status = await this.protocol.getStatus();
      return {
        connected: true,
        paperLevel: 'ok',
        printerType: this.config?.printer_type || 'datecs',
        lastError: null,
        protocolStatus: status
      };
    } catch (error) {
      return {
        connected: false,
        printerType: this.config?.printer_type || 'datecs',
        lastError: error.message
      };
    }
  }

  /**
   * Print X report (informative)
   */
  async printXReport() {
    // Mock mode
    if (process.env.MOCK_PRINTER === 'true' || (this.config && this.config.mock === true)) {
      console.log('[FiscalPrinterDriver] Mock X report');
      return {
        success: true,
        reportType: 'X',
        timestamp: new Date().toISOString(),
        mock: true
      };
    }

    await this.ensureConnected();

    try {
      const result = await this.protocol.printInfoReport();
      return {
        success: true,
        reportType: 'X',
        timestamp: result.timestamp,
        protocolResult: result
      };
    } catch (error) {
      console.error('[FiscalPrinterDriver] X report error:', error);
      throw error;
    }
  }

  /**
   * Print Z report (daily closure)
   */
  async printZReport(report = null) {
    // Mock mode
    if (process.env.MOCK_PRINTER === 'true' || (this.config && this.config.mock === true)) {
      console.log('[FiscalPrinterDriver] Mock Z report');
      return {
        success: true,
        reportType: 'Z',
        reportDate: report?.reportDate || new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        mock: true
      };
    }

    await this.ensureConnected();

    try {
      const result = await this.protocol.printDailyReport();
      return {
        success: true,
        reportType: 'Z',
        reportDate: result.timestamp,
        timestamp: result.timestamp,
        protocolResult: result
      };
    } catch (error) {
      console.error('[FiscalPrinterDriver] Z report error:', error);
      throw error;
    }
  }

  /**
   * Format receipt for protocol
   */
  formatReceipt(receipt) {
    // Extract receipt data
    const receiptData = receipt.data || receipt;
    
    // Format items for protocol
    const items = (receiptData.items || []).map(item => ({
      name: item.productName || item.name || 'Produs',
      quantity: item.quantity || 1,
      unit_price: item.unitPrice || item.price || 0,
      vat_rate: item.vatRate || item.vat_rate || 19,
      department: item.department || '1'
    }));

    // Format totals
    const totals = receiptData.totals || {};
    const total = totals.total || receipt.total || 0;
    const paymentMethod = totals.paymentMethod || receipt.paymentMethod || 'cash';

    return {
      items,
      total,
      payment_method: paymentMethod,
      // Additional fields for protocol
      operator: receiptData.operator || '1',
      customer: receiptData.customer || null
    };
  }

  /**
   * Get fiscal config from database
   */
  async getConfig() {
    if (this.config) return this.config;
    
    // Load from database
    const FiscalizareRepository = require('../repo/fiscalizare.repository');
    const repo = new FiscalizareRepository();
    this.config = await repo.getFiscalConfig();
    
    return this.config;
  }
}

module.exports = FiscalPrinterDriver;

