/**
 * PROTOCOL SALES SERVICE
 * Manages company contracts, protocol sales, and invoicing
 * Data: 14 Februarie 2026
 */

const { dbPromise } = require('../../../../database');

class ProtocolService {
  
  /**
   * Get all protocols
   */
  async getAllProtocols(filters = {}) {
    const db = await dbPromise;
    const { active } = filters;
    
    let query = 'SELECT * FROM protocols WHERE 1=1';
    const params = [];
    
    if (active !== undefined) {
      query += ' AND active = ?';
      params.push(active ? 1 : 0);
    }
    
    query += ' ORDER BY company_name ASC';
    
    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }
  
  /**
   * Get protocol by ID
   */
  async getProtocolById(id) {
    const db = await dbPromise;
    
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM protocols WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
  
  /**
   * Create new protocol
   */
  async createProtocol(protocolData) {
    const db = await dbPromise;
    const {
      protocol_number,
      company_name,
      company_cui,
      company_address,
      contact_person,
      contact_phone,
      contact_email,
      discount_type,
      discount_value,
      payment_terms,
      payment_method,
      notes,
      contract_start,
      contract_end,
      billing_cycle,
      credit_limit,
      active,
      created_by
    } = protocolData;
    
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO protocols 
        (protocol_number, company_name, company_cui, company_address, contact_person, 
         contact_phone, contact_email, discount_type, discount_value, payment_terms, 
         payment_method, notes, contract_start, contract_end, billing_cycle, 
         credit_limit, active, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        protocol_number, company_name, company_cui || null, company_address || null,
        contact_person || null, contact_phone || null, contact_email || null,
        discount_type || 'percentage', discount_value || 0, payment_terms || '30_days',
        payment_method || 'bank_transfer', notes || null, contract_start || null,
        contract_end || null, billing_cycle || 'monthly', credit_limit || 0,
        active !== false ? 1 : 0, created_by || null
      ], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...protocolData });
      });
    });
  }
  
  /**
   * Update protocol
   */
  async updateProtocol(id, protocolData) {
    const db = await dbPromise;
    const {
      protocol_number,
      company_name,
      company_cui,
      company_address,
      contact_person,
      contact_phone,
      contact_email,
      discount_type,
      discount_value,
      payment_terms,
      payment_method,
      notes,
      contract_start,
      contract_end,
      billing_cycle,
      credit_limit,
      active
    } = protocolData;
    
    return new Promise((resolve, reject) => {
      db.run(`
        UPDATE protocols 
        SET protocol_number = ?, company_name = ?, company_cui = ?, company_address = ?,
            contact_person = ?, contact_phone = ?, contact_email = ?, discount_type = ?,
            discount_value = ?, payment_terms = ?, payment_method = ?, notes = ?,
            contract_start = ?, contract_end = ?, billing_cycle = ?, credit_limit = ?,
            active = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        protocol_number, company_name, company_cui || null, company_address || null,
        contact_person || null, contact_phone || null, contact_email || null,
        discount_type || 'percentage', discount_value || 0, payment_terms || '30_days',
        payment_method || 'bank_transfer', notes || null, contract_start || null,
        contract_end || null, billing_cycle || 'monthly', credit_limit || 0,
        active ? 1 : 0, id
      ], (err) => {
        if (err) reject(err);
        else resolve({ id, ...protocolData });
      });
    });
  }
  
  /**
   * Delete protocol
   */
  async deleteProtocol(id) {
    const db = await dbPromise;
    
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM protocols WHERE id = ?', [id], (err) => {
        if (err) reject(err);
        else resolve({ success: true });
      });
    });
  }
  
  /**
   * Apply protocol to order
   */
  async applyProtocolToOrder(orderId, protocolId) {
    const db = await dbPromise;
    
    // Get protocol
    const protocol = await this.getProtocolById(protocolId);
    if (!protocol) {
      throw new Error('Protocol not found');
    }
    
    // Check credit limit
    if (protocol.current_debt >= protocol.credit_limit) {
      throw new Error('Credit limit exceeded for this protocol');
    }
    
    // Get order
    const order = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    // Calculate discount
    let discountAmount = 0;
    if (protocol.discount_type === 'percentage') {
      discountAmount = (order.total * protocol.discount_value) / 100;
    } else if (protocol.discount_type === 'fixed_amount') {
      discountAmount = protocol.discount_value;
    }
    
    // Update order
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE orders 
        SET protocol_id = ?, 
            discount_total = ?, 
            subtotal = ?,
            total = ?
        WHERE id = ?
      `, [protocolId, discountAmount, order.total, order.total - discountAmount, orderId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Update protocol debt
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE protocols 
        SET current_debt = current_debt + ?
        WHERE id = ?
      `, [order.total - discountAmount, protocolId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Record discount application
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO order_discounts 
        (order_id, protocol_id, type, value, amount)
        VALUES (?, ?, ?, ?, ?)
      `, [orderId, protocolId, protocol.discount_type, protocol.discount_value, discountAmount], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    return { protocol, discountAmount, finalTotal: order.total - discountAmount };
  }
  
  /**
   * Generate protocol invoice
   */
  async generateProtocolInvoice(protocolId, periodStart, periodEnd) {
    const db = await dbPromise;
    
    // Get protocol
    const protocol = await this.getProtocolById(protocolId);
    if (!protocol) {
      throw new Error('Protocol not found');
    }
    
    // Get orders for period
    const orders = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM orders 
        WHERE protocol_id = ? 
          AND timestamp >= ? 
          AND timestamp <= ?
          AND is_paid = 0
        ORDER BY timestamp ASC
      `, [protocolId, periodStart, periodEnd], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    if (orders.length === 0) {
      throw new Error('No orders found for this period');
    }
    
    // Calculate totals
    const subtotal = orders.reduce((sum, order) => sum + (order.subtotal || order.total), 0);
    const discount_total = orders.reduce((sum, order) => sum + (order.discount_total || 0), 0);
    const tax_total = subtotal * 0.19; // 19% VAT
    const total = subtotal - discount_total + tax_total;
    
    // Generate invoice number
    const invoiceNumber = `INV-${protocol.protocol_number}-${Date.now()}`;
    const dueDate = this.calculateDueDate(periodEnd, protocol.payment_terms);
    
    // Create invoice
    const invoiceId = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO protocol_invoices 
        (protocol_id, invoice_number, invoice_date, due_date, period_start, period_end,
         subtotal, discount_total, tax_total, total, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `, [
        protocolId, invoiceNumber, new Date().toISOString().split('T')[0], dueDate,
        periodStart, periodEnd, subtotal, discount_total, tax_total, total
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
    
    return {
      id: invoiceId,
      invoice_number: invoiceNumber,
      protocol,
      orders,
      subtotal,
      discount_total,
      tax_total,
      total
    };
  }
  
  /**
   * Calculate due date based on payment terms
   */
  calculateDueDate(startDate, paymentTerms) {
    const date = new Date(startDate);
    
    switch (paymentTerms) {
      case 'immediate':
        return date.toISOString().split('T')[0];
      case '15_days':
        date.setDate(date.getDate() + 15);
        break;
      case '30_days':
        date.setDate(date.getDate() + 30);
        break;
      case '60_days':
        date.setDate(date.getDate() + 60);
        break;
      case '90_days':
        date.setDate(date.getDate() + 90);
        break;
      default:
        date.setDate(date.getDate() + 30);
    }
    
    return date.toISOString().split('T')[0];
  }
  
  /**
   * Get protocol invoices
   */
  async getProtocolInvoices(protocolId, filters = {}) {
    const db = await dbPromise;
    const { status } = filters;
    
    let query = 'SELECT * FROM protocol_invoices WHERE protocol_id = ?';
    const params = [protocolId];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY invoice_date DESC';
    
    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }
}

module.exports = new ProtocolService();
