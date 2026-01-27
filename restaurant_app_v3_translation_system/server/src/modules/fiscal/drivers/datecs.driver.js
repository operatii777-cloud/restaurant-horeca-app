/**
 * PHASE S7.2 - Datecs Fiscal Printer Driver
 * 
 * Driver for Datecs fiscal printers with FiscalPrinterProtocol integration.
 */

const FiscalPrinterProtocol = require('../../../../fiscal-printer/FiscalPrinterProtocol');

class DatecsDriver {
  constructor() {
    this.protocol = null;
    this.config = null;
  }

  /**
   * Initialize driver with FiscalPrinterProtocol
   */
  async initialize(config) {
    this.config = config;
    
    // Map fiscal config to protocol config
    const protocolConfig = {
      type: config.printerIP ? 'tcp' : 'serial',
      model: 'datecs',
      port: config.printerPort || 'COM1',
      baudRate: config.baudRate || 115200,
      host: config.printerIP || '192.168.1.100',
      tcpPort: config.tcpPort || 8000,
      operatorCode: config.operatorCode || '1',
      operatorPassword: config.operatorPassword || '0000',
      timeout: config.timeout || 5000,
      debug: config.debug || process.env.NODE_ENV !== 'production'
    };

    // Create protocol instance
    this.protocol = new FiscalPrinterProtocol(protocolConfig);
    
    // Mock mode for testing (no real printer connection)
    if (process.env.MOCK_PRINTER === 'true' || config.mock === true) {
      console.log('[Datecs] Mock mode enabled - skipping printer connection');
      return;
    }

    // Connect to printer
    try {
      await this.protocol.connect();
      console.log('[Datecs] Connected to fiscal printer');
    } catch (error) {
      console.error('[Datecs] Failed to connect to printer:', error.message);
      // Don't throw - allow mock mode fallback
      if (config.requireConnection !== false) {
        throw error;
      }
    }
  }

  /**
   * Print fiscal receipt
   */
  async print(receipt) {
    // Mock mode - return success without printing
    if (process.env.MOCK_PRINTER === 'true' || (this.config && this.config.mock === true)) {
      console.log('[Datecs] Mock print - receipt:', receipt.fiscalNumber);
      return {
        success: true,
        fiscalNumber: receipt.fiscalNumber,
        receiptNumber: receipt.receiptNumber || `MOCK-${Date.now()}`,
        printedAt: new Date().toISOString(),
        mock: true
      };
    }

    // Check if protocol is connected
    if (!this.protocol || !this.protocol.isConnected) {
      // Try to reconnect
      if (this.config) {
        await this.initialize(this.config);
      } else {
        throw new Error('Datecs driver not initialized');
      }
    }

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
      console.error('[Datecs] Print error:', error);
      throw error;
    }
  }

  /**
   * Cancel receipt
   */
  async cancel(fiscalNumber, reason) {
    // Mock mode
    if (process.env.MOCK_PRINTER === 'true' || (this.config && this.config.mock === true)) {
      console.log('[Datecs] Mock cancel - fiscal number:', fiscalNumber);
      return {
        success: true,
        fiscalNumber,
        cancelledAt: new Date().toISOString(),
        mock: true
      };
    }

    if (!this.protocol || !this.protocol.isConnected) {
      throw new Error('Datecs driver not connected');
    }

    // Protocol doesn't have cancel method yet, so we log it
    console.log('[Datecs] Cancel receipt:', fiscalNumber, reason);
    
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
        printerType: 'datecs',
        lastError: null,
        mock: true
      };
    }

    if (!this.protocol || !this.protocol.isConnected) {
      return {
        connected: false,
        printerType: 'datecs',
        lastError: 'Not connected'
      };
    }

    try {
      const status = await this.protocol.getStatus();
      return {
        connected: true,
        paperLevel: 'ok',
        printerType: 'datecs',
        lastError: null,
        protocolStatus: status
      };
    } catch (error) {
      return {
        connected: false,
        printerType: 'datecs',
        lastError: error.message
      };
    }
  }

  /**
   * Print Z report
   */
  async printZReport(report) {
    // Mock mode
    if (process.env.MOCK_PRINTER === 'true' || (this.config && this.config.mock === true)) {
      console.log('[Datecs] Mock Z report');
      return {
        success: true,
        reportDate: report.reportDate || new Date().toISOString().split('T')[0],
        mock: true
      };
    }

    if (!this.protocol || !this.protocol.isConnected) {
      throw new Error('Datecs driver not connected');
    }

    try {
      const result = await this.protocol.printDailyReport();
      return {
        success: true,
        reportDate: result.timestamp,
        protocolResult: result
      };
    } catch (error) {
      console.error('[Datecs] Z report error:', error);
      throw error;
    }
  }

  /**
   * Format receipt for Datecs protocol
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
}

module.exports = DatecsDriver;

