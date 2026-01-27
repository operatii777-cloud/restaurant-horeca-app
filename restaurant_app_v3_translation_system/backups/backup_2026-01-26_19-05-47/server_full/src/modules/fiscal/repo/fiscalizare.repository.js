/**
 * PHASE E10.1 - Fiscalizare Repository
 * 
 * Data access layer for fiscal receipts and configuration.
 */

const { BaseRepository } = require('../../../utils/repository.base');

class FiscalizareRepository extends BaseRepository {
  constructor() {
    super('fiscal_receipts');
  }

  /**
   * Get fiscal configuration
   */
  async getFiscalConfig() {
    const query = 'SELECT * FROM fiscal_config LIMIT 1';
    const config = await this.findOne(query);
    
    // Return default config if none exists
    if (!config) {
      return {
        printerType: 'datecs', // datecs, daisy, tremol, custom
        printerPort: null,
        printerIP: null,
        autoPrint: true,
        companyName: '',
        companyCUI: '',
        companyAddress: '',
        companyPhone: '',
        vatEnabled: true
      };
    }
    
    return config;
  }

  /**
   * Update fiscal configuration
   */
  async updateFiscalConfig(config) {
    const existing = await this.getFiscalConfig();
    
    // Normalize config (support both snake_case and camelCase)
    const normalizedConfig = {
      printer_type: config.printer_type || config.printerType || 'datecs',
      printer_port: config.printer_port || config.printerPort,
      printer_ip: config.printer_ip || config.printerIP,
      connection_type: config.connection_type || config.connectionType || (config.printer_ip ? 'tcp' : 'serial'),
      baud_rate: config.baud_rate || config.baudRate || 115200,
      tcp_port: config.tcp_port || config.tcpPort || 8000,
      operator_code: config.operator_code || config.operatorCode || '1',
      operator_password: config.operator_password || config.operatorPassword || '0000',
      auto_print: config.auto_print !== undefined ? config.auto_print : (config.autoPrint !== undefined ? config.autoPrint : true),
      company_name: config.company_name || config.companyName || '',
      company_cui: config.company_cui || config.companyCUI || '',
      company_address: config.company_address || config.companyAddress || '',
      company_phone: config.company_phone || config.companyPhone || '',
      vat_enabled: config.vat_enabled !== undefined ? config.vat_enabled : (config.vatEnabled !== undefined ? config.vatEnabled : true),
      timeout: config.timeout || 5000,
      debug: config.debug || false
    };
    
    if (existing.id) {
      // Update existing - check if table has new columns
      const query = `
        UPDATE fiscal_config 
        SET printer_type = ?, printer_port = ?, printer_ip = ?, 
            connection_type = ?, baud_rate = ?, tcp_port = ?,
            operator_code = ?, operator_password = ?,
            auto_print = ?, company_name = ?, company_cui = ?, 
            company_address = ?, company_phone = ?, vat_enabled = ?,
            timeout = ?, debug = ?,
            updated_at = datetime('now', 'localtime')
        WHERE id = ?
      `;
      
      try {
        await this.execute(query, [
          normalizedConfig.printer_type,
          normalizedConfig.printer_port,
          normalizedConfig.printer_ip,
          normalizedConfig.connection_type,
          normalizedConfig.baud_rate,
          normalizedConfig.tcp_port,
          normalizedConfig.operator_code,
          normalizedConfig.operator_password,
          normalizedConfig.auto_print ? 1 : 0,
          normalizedConfig.company_name,
          normalizedConfig.company_cui,
          normalizedConfig.company_address,
          normalizedConfig.company_phone,
          normalizedConfig.vat_enabled ? 1 : 0,
          normalizedConfig.timeout,
          normalizedConfig.debug ? 1 : 0,
          existing.id
        ]);
      } catch (err) {
        // If columns don't exist, try without them
        if (err.message.includes('no such column')) {
          const querySimple = `
            UPDATE fiscal_config 
            SET printer_type = ?, printer_port = ?, printer_ip = ?, 
                auto_print = ?, company_name = ?, company_cui = ?, 
                company_address = ?, company_phone = ?, vat_enabled = ?,
                updated_at = datetime('now', 'localtime')
            WHERE id = ?
          `;
          await this.execute(querySimple, [
            normalizedConfig.printer_type,
            normalizedConfig.printer_port,
            normalizedConfig.printer_ip,
            normalizedConfig.auto_print ? 1 : 0,
            normalizedConfig.company_name,
            normalizedConfig.company_cui,
            normalizedConfig.company_address,
            normalizedConfig.company_phone,
            normalizedConfig.vat_enabled ? 1 : 0,
            existing.id
          ]);
        } else {
          throw err;
        }
      }
    } else {
      // Insert new - try with all columns first
      const query = `
        INSERT INTO fiscal_config 
        (printer_type, printer_port, printer_ip, connection_type, baud_rate, tcp_port,
         operator_code, operator_password,
         auto_print, company_name, company_cui, 
         company_address, company_phone, vat_enabled, timeout, debug, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))
      `;
      
      try {
        await this.execute(query, [
          normalizedConfig.printer_type,
          normalizedConfig.printer_port,
          normalizedConfig.printer_ip,
          normalizedConfig.connection_type,
          normalizedConfig.baud_rate,
          normalizedConfig.tcp_port,
          normalizedConfig.operator_code,
          normalizedConfig.operator_password,
          normalizedConfig.auto_print ? 1 : 0,
          normalizedConfig.company_name,
          normalizedConfig.company_cui,
          normalizedConfig.company_address,
          normalizedConfig.company_phone,
          normalizedConfig.vat_enabled ? 1 : 0,
          normalizedConfig.timeout,
          normalizedConfig.debug ? 1 : 0
        ]);
      } catch (err) {
        // If columns don't exist, insert without them
        if (err.message.includes('no such column')) {
          const querySimple = `
            INSERT INTO fiscal_config 
            (printer_type, printer_port, printer_ip, auto_print, company_name, 
             company_cui, company_address, company_phone, vat_enabled, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))
          `;
          await this.execute(querySimple, [
            normalizedConfig.printer_type,
            normalizedConfig.printer_port,
            normalizedConfig.printer_ip,
            normalizedConfig.auto_print ? 1 : 0,
            normalizedConfig.company_name,
            normalizedConfig.company_cui,
            normalizedConfig.company_address,
            normalizedConfig.company_phone,
            normalizedConfig.vat_enabled ? 1 : 0
          ]);
        } else {
          throw err;
        }
      }
    }
    
    return await this.getFiscalConfig();
  }

  /**
   * Save fiscal receipt
   */
  async saveReceipt(receiptData) {
    const query = `
      INSERT INTO fiscal_receipts 
      (order_id, fiscal_number, receipt_number, receipt_data, receipt_xml, 
       receipt_json, total, vat_amount, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))
    `;
    
    const result = await this.execute(query, [
      receiptData.orderId,
      receiptData.fiscalNumber,
      receiptData.receiptNumber,
      JSON.stringify(receiptData.data),
      receiptData.xml,
      receiptData.json,
      receiptData.total,
      receiptData.vatAmount,
      'generated'
    ]);
    
    return await this.getReceipt(result.id);
  }

  /**
   * Get receipt by ID
   */
  async getReceipt(id) {
    const receipt = await this.findById(id);
    if (receipt) {
      receipt.receipt_data = JSON.parse(receipt.receipt_data || '{}');
    }
    return receipt;
  }

  /**
   * Get receipts with filters
   */
  async getReceipts({ startDate, endDate, limit, offset }) {
    // NOTE: fiscal_receipts table uses 'issue_date' not 'created_at', but we alias it as 'created_at' for compatibility
    let query = 'SELECT *, issue_date as created_at FROM fiscal_receipts WHERE 1=1';
    const params = [];

    if (startDate) {
      query += ' AND DATE(issue_date) >= DATE(?)';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND DATE(issue_date) <= DATE(?)';
      params.push(endDate);
    }

    query += ' ORDER BY issue_date DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const receipts = await this.findAll(query, params);
    
    // Parse JSON data if exists, otherwise return as-is
    return receipts.map(r => {
      try {
        return {
          ...r,
          receipt_data: r.receipt_data ? (typeof r.receipt_data === 'string' ? JSON.parse(r.receipt_data) : r.receipt_data) : {}
        };
      } catch (e) {
        return {
          ...r,
          receipt_data: {}
        };
      }
    });
  }

  /**
   * Update receipt status
   */
  async updateReceiptStatus(receiptId, status) {
    const query = `
      UPDATE fiscal_receipts 
      SET status = ?, updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `;
    await this.execute(query, [status, receiptId]);
  }

  /**
   * Cancel receipt
   */
  async cancelReceipt(receiptId, reason) {
    const query = `
      UPDATE fiscal_receipts 
      SET status = 'cancelled', cancellation_reason = ?, 
          cancelled_at = datetime('now', 'localtime')
      WHERE id = ?
    `;
    await this.execute(query, [reason, receiptId]);
  }

  /**
   * Get order for fiscal receipt
   */
  async getOrder(orderId) {
    const query = `
      SELECT o.*, 
             json_group_array(
               json_object(
                 'id', oi.id,
                 'product_id', oi.product_id,
                 'product_name', p.name,
                 'quantity', oi.quantity,
                 'price', oi.price,
                 'vat_rate', COALESCE(p.vat_rate, 21)
               )
             ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.id = ?
      GROUP BY o.id
    `;
    
    const order = await this.findOne(query, [orderId]);
    if (order) {
      order.items = JSON.parse(order.items || '[]');
    }
    return order;
  }

  /**
   * Get Z report for date
   */
  async getZReport(date) {
    const query = `
      SELECT * FROM fiscal_z_reports 
      WHERE DATE(report_date) = ?
      ORDER BY report_date DESC
      LIMIT 1
    `;
    return await this.findOne(query, [date || new Date().toISOString().split('T')[0]]);
  }

  /**
   * Generate Z report
   */
  async generateZReport() {
    const today = new Date().toISOString().split('T')[0];
    
    // Get all receipts for today
    const receipts = await this.getReceipts({
      startDate: today,
      endDate: today,
      limit: 10000,
      offset: 0
    });

    const totals = receipts.reduce((acc, receipt) => {
      acc.totalReceipts += 1;
      acc.totalAmount += receipt.total || 0;
      acc.totalVAT += receipt.vat_amount || 0;
      return acc;
    }, {
      totalReceipts: 0,
      totalAmount: 0,
      totalVAT: 0
    });

    // Save Z report
    const query = `
      INSERT INTO fiscal_z_reports 
      (report_date, total_receipts, total_amount, total_vat, report_data, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now', 'localtime'))
    `;
    
    const result = await this.execute(query, [
      today,
      totals.totalReceipts,
      totals.totalAmount,
      totals.totalVAT,
      JSON.stringify(totals)
    ]);

    return {
      id: result.id,
      reportDate: today,
      ...totals
    };
  }

  /**
   * Get X report (intermediary)
   */
  async getXReport(date) {
    const reportDate = date || new Date().toISOString().split('T')[0];
    
    // Get receipts from specified date (not yet closed)
    const receipts = await this.getReceipts({
      startDate: reportDate,
      endDate: reportDate,
      limit: 10000,
      offset: 0
    });

    return {
      reportDate,
      timestamp: new Date().toISOString(),
      xNumber: `X-${Date.now()}`,
      note: 'Raport X - Intermediar (nu închide ziua)',
      summary: {
        totalReceipts: receipts.length,
        totalAmount: receipts.reduce((sum, r) => sum + (r.total || 0), 0),
        totalCash: receipts.filter(r => r.payment_method === 'cash').reduce((sum, r) => sum + (r.total || 0), 0),
        totalCard: receipts.filter(r => r.payment_method === 'card').reduce((sum, r) => sum + (r.total || 0), 0),
        totalVAT: receipts.reduce((sum, r) => sum + (r.vat_amount || 0), 0),
        netAmount: receipts.reduce((sum, r) => sum + ((r.total || 0) - (r.vat_amount || 0)), 0),
        vatBreakdown: this.calculateVATBreakdown(receipts)
      }
    };
  }

  /**
   * Calculate VAT breakdown from receipts
   */
  calculateVATBreakdown(receipts) {
    const breakdown = {};
    receipts.forEach(receipt => {
      const vatRate = receipt.vat_rate || 21;
      if (!breakdown[vatRate]) {
        breakdown[vatRate] = { rate: vatRate, base: 0, amount: 0 };
      }
      const base = (receipt.total || 0) - (receipt.vat_amount || 0);
      breakdown[vatRate].base += base;
      breakdown[vatRate].amount += receipt.vat_amount || 0;
    });
    return Object.values(breakdown);
  }

  /**
   * Get monthly report for a specific month/year
   */
  async getMonthlyReport(month, year) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    
    const query = `
      SELECT * FROM fiscal_monthly_reports 
      WHERE month = ? AND year = ?
      LIMIT 1
    `;
    let report = await this.findOne(query, [month, year]);
    
    if (!report) {
      // Calculate from receipts if report doesn't exist
      const receipts = await this.getReceipts({
        startDate,
        endDate,
        limit: 100000,
        offset: 0
      });

      const totals = receipts.reduce((acc, receipt) => {
        acc.total_transactions += 1;
        acc.total_revenue += (receipt.total || 0) - (receipt.vat_amount || 0);
        acc.total_tax += receipt.vat_amount || 0;
        return acc;
      }, {
        total_transactions: 0,
        total_revenue: 0,
        total_tax: 0
      });

      return {
        month: String(month).padStart(2, '0'),
        year,
        ...totals,
        status: 'pending'
      };
    }

    return {
      month: String(report.month).padStart(2, '0'),
      year: report.year,
      total_transactions: report.total_transactions || 0,
      total_revenue: report.total_revenue || 0,
      total_tax: report.total_tax || 0,
      status: report.status || 'pending',
      generated_at: report.generated_at,
      submitted_at: report.submitted_at,
      file_url: report.file_url
    };
  }

  /**
   * Generate monthly report
   */
  async generateMonthlyReport(month, year) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    
    // Get all receipts for the month
    const receipts = await this.getReceipts({
      startDate,
      endDate,
      limit: 100000,
      offset: 0
    });

    const totals = receipts.reduce((acc, receipt) => {
      acc.total_transactions += 1;
      acc.total_revenue += (receipt.total || 0) - (receipt.vat_amount || 0);
      acc.total_tax += receipt.vat_amount || 0;
      return acc;
    }, {
      total_transactions: 0,
      total_revenue: 0,
      total_tax: 0
    });

    // Save or update monthly report
    const checkQuery = `SELECT * FROM fiscal_monthly_reports WHERE month = ? AND year = ?`;
    const existing = await this.findOne(checkQuery, [month, year]);

    if (existing) {
      const updateQuery = `
        UPDATE fiscal_monthly_reports 
        SET total_transactions = ?, total_revenue = ?, total_tax = ?,
            status = 'generated', generated_at = datetime('now', 'localtime')
        WHERE month = ? AND year = ?
      `;
      await this.execute(updateQuery, [
        totals.total_transactions,
        totals.total_revenue,
        totals.total_tax,
        month,
        year
      ]);
    } else {
      const insertQuery = `
        INSERT INTO fiscal_monthly_reports 
        (month, year, total_transactions, total_revenue, total_tax, status, generated_at)
        VALUES (?, ?, ?, ?, ?, 'generated', datetime('now', 'localtime'))
      `;
      await this.execute(insertQuery, [
        month,
        year,
        totals.total_transactions,
        totals.total_revenue,
        totals.total_tax
      ]);
    }

    return {
      month: String(month).padStart(2, '0'),
      year,
      ...totals,
      status: 'generated',
      generated_at: new Date().toISOString()
    };
  }

  /**
   * Update monthly report status
   */
  async updateMonthlyReportStatus(month, year, status, extraData = {}) {
    const updateQuery = `
      UPDATE fiscal_monthly_reports 
      SET status = ?, 
          submitted_at = COALESCE(?, submitted_at),
          anaf_submission_id = COALESCE(?, anaf_submission_id),
          updated_at = datetime('now', 'localtime')
      WHERE month = ? AND year = ?
    `;
    await this.execute(updateQuery, [
      status,
      extraData.submitted_at || null,
      extraData.anaf_submission_id || null,
      month,
      year
    ]);
  }
}

module.exports = FiscalizareRepository;

